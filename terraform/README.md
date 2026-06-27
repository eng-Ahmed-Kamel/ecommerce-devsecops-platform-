# EKS Infrastructure - Complete Terraform (eu-north-1)

## Files

| File | Purpose | Download |
|------|---------|----------|
| **main.tf** | EKS cluster + add-ons + monitoring | [main.tf](sandbox:///mnt/agents/output/main.tf) |
| **variables.tf** | All variables (original + add-ons) | [variables.tf](sandbox:///mnt/agents/output/variables.tf) |
| **outputs.tf** | All outputs (original + add-ons) | [outputs.tf](sandbox:///mnt/agents/output/outputs.tf) |
| **prometheus-grafana-values.yaml** | Helm values for monitoring | [prometheus-grafana-values.yaml](sandbox:///mnt/agents/output/prometheus-grafana-values.yaml) |

## Key Changes

| Change | Before | After |
|--------|--------|-------|
| **Region** | `us-east-1` | `eu-north-1` |
| **AZs** | `us-east-1a/b/c` | `eu-north-1a/b/c` |
| **Backend** | S3 + DynamoDB | Local file (`terraform.tfstate`) |
| **StorageClass** | Custom gp3 default | Removed (EKS managed) |
| **Grafana Access** | Port-forward only | ALB HTTPS ingress |

## Prerequisites

### 1. ACM Certificate (for Grafana HTTPS)
```bash
aws acm request-certificate \
  --domain-name grafana.yourdomain.com \
  --validation-method DNS \
  --region eu-north-1

aws acm list-certificates --region eu-north-1
```

### 2. terraform.tfvars
```hcl
grafana_ingress_host        = "grafana.yourdomain.com"
grafana_alb_certificate_arn = "arn:aws:acm:eu-north-1:ACCOUNT:certificate/ID"
grafana_admin_password      = "YourStrongPassword123!"
grafana_allowed_cidr_blocks = ["YOUR_OFFICE_IP/32"]  # optional
```

## Deploy

```bash
mkdir -p terraform/values
cp main.tf terraform/
cp variables.tf terraform/
cp outputs.tf terraform/
cp prometheus-grafana-values.yaml terraform/values/
cd terraform/

terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

## Access

| Service | Method | URL |
|---------|--------|-----|
| **Grafana** | ALB HTTPS | `https://grafana.yourdomain.com` |
| **Prometheus** | Port-forward | `kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090` |
| **Alertmanager** | Port-forward | `kubectl port-forward -n monitoring svc/kube-prometheus-stack-alertmanager 9093:9093` |

## Architecture

```
Internet
   │
   ▼
┌─────────────────────┐
│  ACM Certificate    │  (HTTPS, eu-north-1)
│  grafana.yourdomain │
└──────────┬──────────┘
           │
   ┌───────▼────────┐
   │  AWS ALB       │  (AWS LB Controller, internet-facing)
   │  (public)      │
   └───────┬────────┘
           │
   ┌───────▼──────────────────────────────────────────┐
   │  EKS Cluster v1.29 (eu-north-1)                 │
   │                                                  │
   │  kube-system:                                    │
   │    • AWS LB Controller  • Cluster Autoscaler    │
   │    • Metrics Server     • CoreDNS               │
   │    • kube-proxy         • vpc-cni               │
   │    • aws-ebs-csi-driver (IRSA)                  │
   │                                                  │
   │  monitoring:                                     │
   │    • Grafana (ALB ingress, 10Gi PVC)            │
   │    • Prometheus (internal, 50Gi PVC, 2 replicas)│
   │    • Alertmanager (internal, 10Gi PVC)          │
   │                                                  │
   │  Node Group: general (t3.medium, 1-4 nodes)     │
   │                                                  │
   └──────────────────────────────────────────────────┘
           │
   ┌───────▼────────────────────────────┐
   │  IRSA Roles (OIDC, no credentials) │
   │  • EBS CSI  • ALB Ctrl  • Autoscaler│
   │  • External DNS (pre)  • Cert Mgr (pre)│
   └────────────────────────────────────┘
           │
   ┌───────▼────────────┐
   │  KMS Key (secrets) │
   └────────────────────┘
```

## ⚠️ Local State Warning

State is saved locally to `terraform.tfstate`. For team use, migrate later:
```bash
terraform init -migrate-state
# Or use Terraform Cloud / remote backend
```

## State File Location

```
terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars
├── terraform.tfstate          ← local state file
└── values/
    └── prometheus-grafana-values.yaml
```
