# 🚀 Deployment Guide

This document describes the complete deployment process for the **Cloud Native DevSecOps E-Commerce Platform**.

The platform is fully automated using Infrastructure as Code (Terraform), Configuration Management (Ansible), CI/CD (Jenkins), Kubernetes (Amazon EKS), Helm, AWS Secrets Manager, and the External Secrets Operator.

---

# Deployment Workflow

```text
Developer
     │
     ▼
GitHub Repository
     │
     ▼
Jenkins Pipeline
     │
     ├── Dependency Scan
     ├── Docker Build
     ├── Trivy Scan
     ├── Push Images
     └── Helm Deployment
             │
             ▼
        Amazon EKS
             │
     ┌─────────────┐
     │ Frontend    │
     ├─────────────┤
     │ Backend     │
     └─────────────┘
             │
             ▼
       MongoDB Atlas
```

---

# Deployment Prerequisites

## AWS

- AWS Account
- IAM User
- AWS CLI configured

Verify:

```bash
aws sts get-caller-identity
```

---

## Terraform

Install Terraform.

Verify:

```bash
terraform version
```

---

## kubectl

Install kubectl.

Verify:

```bash
kubectl version --client
```

---

## eksctl

Install eksctl.

Verify:

```bash
eksctl version
```

---

## Helm

Install Helm v3.

Verify:

```bash
helm version
```

---

## Docker

Install Docker Engine.

Verify:

```bash
docker version
```

---

## Jenkins

Install Jenkins on an EC2 instance.

Required plugins:

- Docker Pipeline
- Git
- Credentials Binding
- Pipeline
- Blue Ocean
- Workspace Cleanup
- SSH Agent

---
# Step 1 — Clone the Repository

```bash
git clone https://github.com/<your-username>/ecommerce-devsecops-platform.git

cd ecommerce-devsecops-platform
```

---

# Step 2 — Provision AWS Infrastructure

The entire AWS infrastructure is provisioned using Terraform.

Navigate to the Terraform directory:

```bash
cd terraform
```

Initialize Terraform:

```bash
terraform init
```

Review the execution plan:

```bash
terraform plan
```

Deploy the infrastructure:

```bash
terraform apply
```

Terraform provisions:

- VPC
- Public Subnets
- Private Subnets
- Internet Gateway
- NAT Gateway
- Route Tables
- Security Groups
- IAM Roles
- EC2 Instance (Jenkins)
- Amazon EKS Cluster
- Node Group
- Application Load Balancer prerequisites
- AWS Secrets Manager

Verify the outputs:

```bash
terraform output
```

---

# Step 3 — Configure the Jenkins Server

SSH into the EC2 instance:

```bash
ssh -i key.pem ubuntu@<EC2_PUBLIC_IP>
```

Navigate to the Ansible directory:

```bash
cd ansible
```

Run the playbook:

```bash
ansible-playbook playbooks/jenkins.yml
```

The playbook installs and configures:

- Jenkins
- Docker
- Git
- AWS CLI
- kubectl
- Helm
- Trivy
- Java

Verify Jenkins:

```bash
systemctl status jenkins
```

Open Jenkins:

```
http://<EC2_PUBLIC_IP>:8080
```

---

# Step 4 — Configure Jenkins Credentials

Create the following credentials inside Jenkins.

| Credential | Type | Purpose |
|------------|------|---------|
| docker-hub-credentials | Username/Password | Docker Hub authentication |
| kubeconfig | Secret File | Access to Amazon EKS |
| github-token *(optional)* | Secret Text | GitHub API access |

Verify Jenkins can access the cluster:

```bash
kubectl get nodes
```

Expected output:

```text
NAME              STATUS
ip-10-0-1-120     Ready
ip-10-0-2-201     Ready
```

---

# Step 5 — Configure Amazon EKS

Update kubeconfig:

```bash
aws eks update-kubeconfig \
--region eu-north-1 \
--name ecommerce-dev
```

Verify:

```bash
kubectl get nodes
```

Example:

```text
NAME                     STATUS
ip-10-0-1-120.ec2.internal Ready
ip-10-0-2-210.ec2.internal Ready
```

---

# Step 6 — Install Required Kubernetes Components

## AWS Load Balancer Controller

Install the AWS Load Balancer Controller to provision an Application Load Balancer (ALB) for Kubernetes Ingress resources.

Verify installation:

```bash
kubectl get deployment -n kube-system aws-load-balancer-controller
```

Expected output:

```text
NAME                             READY
aws-load-balancer-controller     2/2
```

---

## Metrics Server

Install the Metrics Server:

```bash
helm install metrics-server metrics-server/metrics-server \
-n kube-system
```

Verify:

```bash
kubectl top nodes
```

---

## External Secrets Operator

Install the External Secrets Operator:

```bash
helm repo add external-secrets https://charts.external-secrets.io

helm repo update

helm install external-secrets \
external-secrets/external-secrets \
-n external-secrets \
--create-namespace
```

Verify:

```bash
kubectl get pods -n external-secrets
```

Expected output:

```text
external-secrets
external-secrets-webhook
external-secrets-cert-controller
```

---

## Prometheus Stack

Deploy the monitoring stack:

```bash
helm repo add prometheus-community \
https://prometheus-community.github.io/helm-charts

helm repo update

helm install kube-prometheus-stack \
prometheus-community/kube-prometheus-stack \
-n monitoring \
--create-namespace
```

Verify:

```bash
kubectl get pods -n monitoring
```

---

# Step 7 — Configure AWS Secrets Manager

Create a secret in AWS Secrets Manager containing your application configuration.

Example JSON:

```json
{
  "MONGO_URI": "...",
  "JWT_SECRET": "...",
  "JWT_REFRESH_SECRET": "...",
  "EMAIL_USER": "...",
  "EMAIL_PASS": "...",
  "GOOGLE_CLIENT_ID": "...",
  "STRIPE_SECRET_KEY": "...",
  "FRONTEND_URL": "...",
  "NODE_ENV": "production",
  "PORT": "3000"
}
```

---

# Step 8 — Configure IRSA (IAM Roles for Service Accounts)

Associate the OIDC provider with the EKS cluster:

```bash
eksctl utils associate-iam-oidc-provider \
--cluster ecommerce-dev \
--region eu-north-1 \
--approve
```

Create the IAM Service Account:

```bash
eksctl create iamserviceaccount \
--cluster ecommerce-dev \
--namespace ecommerce \
--name external-secrets-sa \
--attach-policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/ExternalSecretsPolicy \
--approve
```

Verify:

```bash
kubectl get serviceaccount \
external-secrets-sa \
-n ecommerce
```

---

# Step 9 — Configure SecretStore

Apply the SecretStore resource:

```bash
kubectl apply -f k8s/secrets/secret-store.yaml
```

Verify:

```bash
kubectl get secretstore -n ecommerce
```

Expected output:

```text
NAME                READY
aws-secret-store    True
```

---

# Step 10 — Configure ExternalSecret

Deploy the ExternalSecret resource:

```bash
kubectl apply -f k8s/secrets/external-secret.yaml
```

Verify:

```bash
kubectl get externalsecret -n ecommerce
```

Expected output:

```text
NAME                  READY
ecommerce-secrets     True
```

Confirm that the Kubernetes Secret has been created automatically:

```bash
kubectl get secret -n ecommerce
```

You should see:

```text
ecommerce-secrets
```

---

# Step 11 — Deploy the Application with Helm

Install or upgrade the application:

```bash
helm upgrade --install ecommerce \
./helm-charts/ecommerce \
--namespace ecommerce \
--create-namespace
```

Verify the Helm release:

```bash
helm list -n ecommerce
```

Check deployment status:

```bash
kubectl get deployments -n ecommerce
```

Check pods:

```bash
kubectl get pods -n ecommerce
```

Expected output:

```text
ecommerce-backend
ecommerce-frontend
```

All pods should be in the **Running** state.

---

# Step 12 — Verify the Ingress

Retrieve the ALB endpoint:

```bash
kubectl get ingress -n ecommerce
```

Example:

```text
ADDRESS

k8s-ecommerce-xxxxxxxx.eu-north-1.elb.amazonaws.com
```

Open the URL in your browser to access the application.

---

# Step 13 — Verify Monitoring

Check the monitoring namespace:

```bash
kubectl get pods -n monitoring
```

Verify services:

```bash
kubectl get svc -n monitoring
```

If Grafana is exposed through an Ingress:

```bash
kubectl get ingress -n monitoring
```

Retrieve the Grafana admin password:

```bash
kubectl get secret kube-prometheus-stack-grafana \
-n monitoring \
-o jsonpath="{.data.admin-password}" | base64 -d
```

Default username:

```text
admin
```

---

# Step 14 — Trigger the CI/CD Pipeline

Commit your changes:

```bash
git add .

git commit -m "Deploy application"

git push origin main
```

Jenkins will automatically execute the pipeline:

1. Checkout source code
2. Install dependencies
3. Run `npm audit`
4. Build Docker images
5. Scan images with Trivy
6. Push images to Docker Hub
7. Deploy to Amazon EKS using Helm
8. Verify rollout status

Monitor the build in the Jenkins dashboard.

---

# Rollback

List Helm release revisions:

```bash
helm history ecommerce -n ecommerce
```

Rollback to a previous revision:

```bash
helm rollback ecommerce <REVISION> -n ecommerce
```

Verify:

```bash
kubectl rollout status deployment/ecommerce-backend -n ecommerce

kubectl rollout status deployment/ecommerce-frontend -n ecommerce
```

---

# Clean Up

To remove the application:

```bash
helm uninstall ecommerce -n ecommerce
```

Delete the monitoring stack:

```bash
helm uninstall kube-prometheus-stack -n monitoring
```

Delete External Secrets Operator:

```bash
helm uninstall external-secrets -n external-secrets
```

Destroy the AWS infrastructure:

```bash
cd terraform

terraform destroy
```

---

# Deployment Checklist

- [ ] AWS infrastructure provisioned with Terraform
- [ ] Jenkins configured with Ansible
- [ ] Docker installed and configured
- [ ] kubectl connected to EKS
- [ ] Helm installed
- [ ] AWS Load Balancer Controller deployed
- [ ] Metrics Server deployed
- [ ] External Secrets Operator deployed
- [ ] Prometheus Stack deployed
- [ ] AWS Secrets Manager configured
- [ ] IRSA configured
- [ ] SecretStore created
- [ ] ExternalSecret synchronized
- [ ] Helm deployment successful
- [ ] ALB reachable
- [ ] Grafana accessible
- [ ] Jenkins pipeline passing
- [ ] Monitoring dashboards operational

---

# Conclusion

The deployment process provisions a secure, automated, and production-inspired cloud-native platform on AWS. Infrastructure is managed through Terraform, configuration through Ansible, application delivery through Jenkins and Helm, secrets through AWS Secrets Manager with External Secrets Operator, and observability through the Prometheus ecosystem. This architecture enables repeatable deployments, secure secret management, and continuous delivery with integrated monitoring.
