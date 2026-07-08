# 🏗️ System Architecture

## Overview

The **Cloud Native DevSecOps E-Commerce Platform** is designed as a production-inspired microservices application running on **Amazon Web Services (AWS)**. The project follows modern DevOps and cloud-native principles by combining Infrastructure as Code (IaC), Continuous Integration/Continuous Deployment (CI/CD), Kubernetes orchestration, secure secret management, and centralized monitoring.

The entire environment is provisioned using **Terraform**, configured with **Ansible**, continuously deployed through **Jenkins**, orchestrated by **Amazon EKS**, secured using **AWS Secrets Manager** with the **External Secrets Operator**, and monitored using the **Prometheus Stack**.

---

# Design Goals

The architecture was designed around the following objectives:

- Fully automated infrastructure provisioning
- Immutable deployments using Docker containers
- Kubernetes-native application orchestration
- Secure secret management without hardcoded credentials
- Automated CI/CD pipeline
- High availability using multiple replicas
- Infrastructure scalability
- Production-inspired monitoring and alerting
- Cloud-native best practices

---

# High-Level Architecture

```text
                        +----------------------+
                        |      Developer       |
                        +----------+-----------+
                                   |
                                   | Git Push
                                   |
                                   ▼
                        +----------------------+
                        |       GitHub         |
                        +----------+-----------+
                                   |
                                   ▼
                        +----------------------+
                        |      Jenkins CI      |
                        +----------+-----------+
                                   |
          -------------------------------------------------
          |                  |               |             |
          ▼                  ▼               ▼             ▼
   Dependency Scan      Docker Build     Trivy Scan   Docker Push
      (npm audit)                             │
                                               ▼
                                        Docker Hub
                                               │
                                               ▼
                                    Helm Upgrade/Install
                                               │
                                               ▼
                                        Amazon EKS Cluster
                                               │
             ---------------------------------------------------------
             |                        |                              |
             ▼                        ▼                              ▼
      Frontend Pods            Backend Pods                 External Secrets
             │                        │                              │
             │                        │                              ▼
             │                        │                   AWS Secrets Manager
             │                        │
             └──────────────┬─────────┘
                            ▼
                    MongoDB Atlas
```

---

# Architecture Layers

The platform is divided into six logical layers.

```
Presentation Layer

↓

CI/CD Layer

↓

Container Layer

↓

Orchestration Layer

↓

Infrastructure Layer

↓

Observability Layer
```

---

# Infrastructure Layer

The infrastructure layer is completely managed using **Terraform**.

Terraform provisions every required AWS component automatically.

## Components

- Amazon VPC
- Public Subnets
- Private Subnets
- Internet Gateway
- Route Tables
- Security Groups
- IAM Roles
- IAM Policies
- EC2 Instance (Jenkins)
- Amazon EKS Cluster
- Managed Node Group
- AWS Secrets Manager

Benefits:

- Repeatable deployments
- Version-controlled infrastructure
- Easy disaster recovery
- Infrastructure consistency

---

# Configuration Management Layer

Once the infrastructure is created, **Ansible** configures the Jenkins EC2 instance automatically.

Installed software includes:

- Jenkins
- Docker
- Git
- AWS CLI
- kubectl
- Helm
- Trivy
- Java Runtime

Benefits:

- Consistent server configuration
- Reduced manual work
- Easy server rebuilds

---

# CI/CD Architecture

Jenkins acts as the central automation server.

Pipeline flow:

```text
GitHub

↓

Checkout

↓

Dependency Scan

↓

Docker Build

↓

Container Scan

↓

Push Images

↓

Helm Upgrade

↓

Rollout Verification
```

## Pipeline Stages

### 1. Source Checkout

The latest application code is retrieved from GitHub.

---

### 2. Dependency Security Scan

The backend and frontend dependencies are scanned using:

```
npm audit
```

Purpose:

- Detect vulnerable packages
- Identify outdated dependencies

---

### 3. Docker Build

The pipeline builds two Docker images:

- Backend
- Frontend

Each image is tagged with:

- Build Number
- latest

Example:

```
oziii/ecommerce-backend:15

oziii/ecommerce-backend:latest
```

---

### 4. Container Security Scan

Images are scanned using **Trivy** before deployment.

Scanned items include:

- Critical vulnerabilities
- High vulnerabilities
- Operating System packages
- Application libraries

---

### 5. Docker Registry

After successful scanning, images are pushed to Docker Hub.

Docker Hub acts as the centralized container registry.

---

### 6. Deployment

The pipeline deploys the latest images using Helm.

Example:

```bash
helm upgrade --install ecommerce \
./helm-charts/ecommerce
```

---

### 7. Verification

Jenkins verifies the deployment using:

```bash
kubectl rollout status
```

Only successful rollouts are marked as successful pipeline executions.

---

# Container Architecture

The application consists of two independent microservices.

## Frontend

Technology:

- Angular

Responsibilities:

- User Interface
- Authentication
- Product browsing
- Shopping cart
- Checkout

Runs inside its own Docker container.

---

## Backend

Technology:

- Node.js

Responsibilities:

- REST API
- Authentication
- Business logic
- Database communication
- Payment integration
- JWT authentication

Runs independently from the frontend.

---

# Container Image Strategy

Every successful pipeline generates immutable Docker images.

```
Backend

latest

Build Number

Frontend

latest

Build Number
```

Advantages:

- Rollback capability
- Version tracking
- Immutable deployments

---# ☸ Kubernetes Architecture

The application is deployed on **Amazon Elastic Kubernetes Service (Amazon EKS)**.

Kubernetes is responsible for:

- Container orchestration
- Self-healing
- Rolling updates
- Service discovery
- Load balancing
- Scaling
- Secret injection
- High availability

---

## Cluster Layout

```text
                    Amazon EKS
                         │
     ┌───────────────────┴───────────────────┐
     │                                       │
┌──────────────┐                      ┌──────────────┐
│ Worker Node 1│                      │ Worker Node 2│
└──────┬───────┘                      └──────┬───────┘
       │                                     │
 ┌───────────────┐                    ┌───────────────┐
 │Frontend Pod   │                    │Backend Pod    │
 └───────────────┘                    └───────────────┘

           Kubernetes Services
                    │
             AWS ALB Ingress
                    │
               Internet Users
```

---

# Kubernetes Namespaces

The cluster is organized into multiple namespaces.

| Namespace | Purpose |
|-----------|----------|
| ecommerce | Application workloads |
| monitoring | Prometheus Stack |
| external-secrets | External Secrets Operator |
| kube-system | Kubernetes system components |

Separating workloads into namespaces improves security, organization, and operational management.

---

# Kubernetes Resources

The application uses the following Kubernetes resources:

## Deployments

- Backend Deployment
- Frontend Deployment

Responsibilities:

- Replica management
- Rolling updates
- Self-healing
- Version control

---

## ReplicaSets

Each Deployment automatically manages ReplicaSets to ensure the desired number of Pods is always available.

---

## Pods

The application runs:

- Backend Pods
- Frontend Pods

Each Pod is ephemeral and can be recreated automatically by Kubernetes if it fails.

---

## Services

Two ClusterIP services expose the application internally:

| Service | Port |
|----------|------|
| ecommerce-backend | 3000 |
| ecommerce-frontend | 80 |

These services provide stable DNS names for inter-service communication.

---

## Ingress

Traffic enters the cluster through an AWS Application Load Balancer (ALB).

```text
Internet
     │
     ▼
AWS ALB
     │
     ▼
Ingress Controller
     │
     ├──────────────► Frontend Service
     │
     └──────────────► Backend Service
```

Benefits:

- Layer 7 routing
- Native AWS integration
- Automatic ALB provisioning
- Health checks
- High availability

---

# Helm Architecture

Helm manages all Kubernetes resources as a single release.

```text
helm upgrade --install ecommerce
```

The Helm chart includes:

- Deployments
- Services
- Ingress
- ConfigMaps
- Horizontal Pod Autoscaler (future)
- ServiceAccount
- RBAC
- Labels
- Secrets reference

Advantages:

- Version-controlled deployments
- Easy upgrades
- Rollbacks
- Reusable templates

---

# Secrets Architecture

Application secrets are **never stored inside Git**.

Instead, they follow this secure workflow.

```text
AWS Secrets Manager
        │
        ▼
IAM Role (IRSA)
        │
        ▼
External Secrets Operator
        │
        ▼
SecretStore
        │
        ▼
ExternalSecret
        │
        ▼
Kubernetes Secret
        │
        ▼
Backend Pods
```

---

## Secret Synchronization

The External Secrets Operator continuously synchronizes secrets.

Example:

```text
AWS Secrets Manager

↓

SecretStore

↓

ExternalSecret

↓

Kubernetes Secret

↓

Application
```

Advantages:

- No plaintext secrets in GitHub
- Centralized secret management
- Automatic secret updates
- IAM-based authentication
- Production-ready security

---

# IAM Roles for Service Accounts (IRSA)

Instead of using AWS access keys inside Pods, the application uses **IRSA**.

```text
Pod

↓

ServiceAccount

↓

IAM Role

↓

AWS Secrets Manager
```

Benefits:

- Temporary credentials
- Least privilege access
- No hardcoded AWS keys
- Native AWS authentication

---

# Networking Architecture

The platform is deployed inside a custom Amazon VPC.

```text
Internet
     │
     ▼
Internet Gateway
     │
     ▼
Application Load Balancer
     │
     ▼
Public Subnets
     │
     ▼
Private Subnets
     │
     ▼
Amazon EKS Nodes
```

---

## Network Components

- VPC
- Internet Gateway
- Public Subnets
- Private Subnets
- Route Tables
- Security Groups
- NAT Gateway
- Application Load Balancer

---

# Monitoring Architecture

The monitoring stack follows the Prometheus ecosystem.

```text
Node Exporter
        │
        ▼
Prometheus
        │
        ├────────────► Alertmanager
        │
        ▼
Grafana
```

---

## Components

### Prometheus

Collects metrics from:

- Kubernetes API
- Nodes
- Pods
- Services
- Applications

---

### Grafana

Provides visualization through dashboards.

Displays:

- CPU
- Memory
- Pod Health
- Cluster Status
- Deployment Status
- Resource Utilization

---

### Alertmanager

Handles alerts generated by Prometheus.

Can send notifications through:

- Email
- Slack
- Microsoft Teams
- PagerDuty
- Webhooks

---

### Node Exporter

Collects node-level metrics.

Examples:

- CPU Usage
- Memory Usage
- Disk Usage
- Network Traffic

---

### kube-state-metrics

Collects Kubernetes object metrics.

Examples:

- Deployments
- ReplicaSets
- Pods
- StatefulSets
- DaemonSets

---

# End-to-End Request Flow

The following sequence illustrates how a user request traverses the platform.

```text
User Browser
      │
      ▼
AWS Application Load Balancer
      │
      ▼
Ingress Controller
      │
      ▼
Frontend Service
      │
      ▼
Frontend Pod
      │
HTTP API Request
      │
      ▼
Backend Service
      │
      ▼
Backend Pod
      │
      ▼
MongoDB Atlas
```

---

# High Availability

The application is designed with high availability in mind.

Current implementation:

- Multiple Kubernetes replicas
- Self-healing Pods
- Managed EKS Control Plane
- AWS Application Load Balancer
- Rolling Updates

Future improvements:

- Cluster Autoscaler
- Horizontal Pod Autoscaler
- Multi-AZ worker nodes
- Multi-region deployment

---

# Scalability

The architecture supports horizontal scaling.

Current:

- Multiple frontend replicas
- Multiple backend replicas

Future:

- Horizontal Pod Autoscaler
- Cluster Autoscaler
- KEDA event-driven scaling

---

# Security Architecture

Security is integrated into every layer.

## Infrastructure

- IAM Roles
- Security Groups
- Private networking

---

## CI/CD

- npm audit
- Trivy scanning
- Immutable Docker images

---

## Kubernetes

- RBAC
- Namespaces
- Secrets
- Service Accounts

---

## Secrets

- AWS Secrets Manager
- IRSA
- External Secrets Operator

---

# Why These Technologies?

| Technology | Reason |
|------------|--------|
| Terraform | Infrastructure as Code |
| Ansible | Automated server configuration |
| Jenkins | CI/CD automation |
| Docker | Containerization |
| Amazon EKS | Managed Kubernetes |
| Helm | Kubernetes package management |
| AWS Secrets Manager | Secure secret storage |
| External Secrets Operator | Secret synchronization |
| Prometheus | Metrics collection |
| Grafana | Visualization |
| Alertmanager | Alerting |
| Trivy | Container vulnerability scanning |

---

# Future Architecture

The next evolution of this platform includes GitOps and advanced observability.

```text
Developer
      │
      ▼
GitHub
      │
      ▼
Argo CD
      │
      ▼
Amazon EKS
      │
      ▼
Application

Monitoring

Prometheus
      │
Grafana
      │
Alertmanager

Tracing

OpenTelemetry
      │
Jaeger

Logging

Promtail
      │
Loki
```

Future enhancements include:

- Argo CD (GitOps)
- SonarQube
- OWASP Dependency-Check
- Loki
- Promtail
- OpenTelemetry
- Jaeger
- HTTPS with ACM
- Route 53
- Multi-environment deployments (Dev, Staging, Production)
- Automated backup and disaster recovery

---

# Architecture Summary

This platform demonstrates a complete cloud-native DevSecOps workflow by combining Infrastructure as Code, secure secret management, automated CI/CD, Kubernetes orchestration, and comprehensive monitoring. Each component is designed to be modular, scalable, and aligned with production best practices, making the project suitable as a portfolio showcasing modern DevOps engineering skills.
