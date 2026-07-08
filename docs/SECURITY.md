# 🔐 Security Guide

## Overview

Security is a fundamental aspect of this Cloud Native DevSecOps platform. Instead of treating security as a final deployment step, it is integrated throughout the entire Software Development Lifecycle (SDLC).

The project follows a **DevSecOps** approach, where security controls are applied during infrastructure provisioning, application development, containerization, deployment, runtime, and monitoring.

---

# Security Objectives

The platform was designed to achieve the following goals:

- Prevent secret exposure
- Detect vulnerable dependencies
- Scan container images before deployment
- Enforce least-privilege IAM access
- Secure Kubernetes workloads
- Protect cloud infrastructure
- Support secure CI/CD pipelines
- Enable centralized monitoring and alerting

---

# Security Architecture

```text
                    Developer
                        │
                        ▼
                  GitHub Repository
                        │
                        ▼
                 Jenkins Pipeline
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   npm audit      Trivy Image Scan   Helm Deploy
        │               │
        └───────────────┼───────────────┘
                        ▼
                  Amazon EKS
                        │
                        ▼
              AWS Secrets Manager
                        │
                        ▼
        External Secrets Operator
                        │
                        ▼
             Kubernetes Secrets
                        │
                        ▼
                 Application Pods
```

---

# Infrastructure Security

Infrastructure is provisioned using Terraform, ensuring all resources are version-controlled and reproducible.

Security measures include:

- Dedicated VPC
- Public and private subnets
- Security Groups
- IAM Roles
- Least-privilege permissions
- Infrastructure as Code
- Controlled network access

Benefits:

- Consistent deployments
- Easier auditing
- Reduced manual configuration errors

---

# IAM Security

AWS Identity and Access Management (IAM) controls access to AWS resources.

## Best Practices Applied

- IAM Roles instead of access keys
- Least privilege principle
- Service-specific permissions
- Dedicated IAM roles for Kubernetes workloads

No long-term AWS credentials are stored inside the application.

---

# IRSA (IAM Roles for Service Accounts)

Instead of embedding AWS credentials inside Pods, this project uses **IAM Roles for Service Accounts (IRSA)**.

```text
Kubernetes Pod
       │
       ▼
Service Account
       │
       ▼
IAM Role
       │
       ▼
AWS Secrets Manager
```

Advantages:

- Temporary credentials
- Automatic credential rotation
- No AWS access keys inside containers
- Native AWS authentication

---

# Secrets Management

Secrets are never committed to Git.

Sensitive configuration is stored in **AWS Secrets Manager**.

Examples include:

- MongoDB URI
- JWT Secret
- JWT Refresh Secret
- Stripe API Key
- Email Credentials
- Google OAuth Client ID

Secret synchronization flow:

```text
AWS Secrets Manager
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
Application Pods
```

Benefits:

- Centralized secret management
- Automatic synchronization
- Secure secret rotation
- No plaintext credentials in the repository

---

# CI/CD Security

The Jenkins pipeline integrates multiple security checks before deployment.

Pipeline security stages:

```text
Checkout
      │
      ▼
Dependency Scan
      │
      ▼
Container Scan
      │
      ▼
Docker Push
      │
      ▼
Helm Deployment
```

---

# Dependency Scanning

JavaScript dependencies are scanned using:

```bash
npm audit
```

The scan identifies:

- Known vulnerabilities
- Outdated packages
- High-risk dependencies

This helps reduce supply chain risks before containerization.

---

# Container Image Security

Docker images are scanned using **Trivy** before being pushed to Docker Hub.

Example:

```bash
trivy image oziii/ecommerce-backend:latest
```

Trivy scans for:

- Critical vulnerabilities
- High vulnerabilities
- Operating system packages
- Application libraries
- Known CVEs

This ensures vulnerable images are detected before deployment.

---

# Docker Security

Container images follow several security practices:

- Immutable image tags
- Separate frontend and backend images
- Official base images
- Minimal image layers
- Reproducible builds

Recommended future improvements:

- Distroless images
- Image signing (Cosign)
- SBOM generation
- Docker Content Trust

---

# Kubernetes Security

Kubernetes provides multiple layers of protection.

## Namespaces

Workloads are isolated into dedicated namespaces:

- ecommerce
- monitoring
- external-secrets

Namespace isolation limits the impact of accidental changes and improves operational organization.

---

## Service Accounts

Each workload can run with a dedicated Service Account.

This enables fine-grained IAM permissions through IRSA instead of cluster-wide privileges.

---

## RBAC

Role-Based Access Control (RBAC) limits permissions for users and service accounts.

Benefits:

- Least privilege
- Reduced attack surface
- Controlled API access

---

## Secrets

Application Pods consume Kubernetes Secrets generated automatically by the External Secrets Operator.

Secrets are not hardcoded into Deployment manifests.

---

# Network Security

Network traffic is protected using AWS networking components.

Implemented controls:

- Security Groups
- VPC isolation
- Private worker nodes
- AWS Application Load Balancer
- Kubernetes Services

Recommended future improvements:

- Kubernetes Network Policies
- AWS WAF
- Private API endpoints

---

# Image Registry Security

Container images are stored in Docker Hub.

Security practices:

- Authenticated image pushes
- Versioned image tags
- Immutable build artifacts

Future enhancements:

- Amazon ECR
- Image signing
- Private registries

---

# Monitoring Security

Monitoring contributes to security by detecting abnormal behavior.

Current stack:

- Prometheus
- Grafana
- Alertmanager

Possible security alerts:

- Pod restarts
- Node failures
- Resource exhaustion
- Deployment failures

Future enhancements:

- Alerting on suspicious activity
- Security dashboards
- Runtime anomaly detection

---

# Current Security Features

| Feature | Status |
|---------|--------|
| IAM Roles | ✅ |
| IRSA | ✅ |
| AWS Secrets Manager | ✅ |
| External Secrets Operator | ✅ |
| Jenkins Credentials | ✅ |
| npm audit | ✅ |
| Trivy Image Scan | ✅ |
| Docker Image Versioning | ✅ |
| Kubernetes Secrets | ✅ |
| ALB Ingress | ✅ |

---

# Future Security Improvements

The following features are planned for future releases:

## Runtime Security

- Falco
- Sysdig Secure

## Policy Enforcement

- OPA Gatekeeper
- Kyverno

## Supply Chain Security

- Cosign Image Signing
- SBOM Generation
- SLSA Compliance

## Container Security

- Rootless Containers
- Read-only Root Filesystem
- Security Contexts
- Seccomp Profiles
- AppArmor

## Kubernetes Security

- Pod Security Standards
- Network Policies
- Admission Controllers

## Cloud Security

- AWS WAF
- AWS Shield
- GuardDuty
- Security Hub
- CloudTrail Integration

---

# Security Best Practices

This project follows several industry best practices:

- Infrastructure as Code
- Least Privilege IAM
- Immutable Containers
- Automated Vulnerability Scanning
- Secret Management
- Version-Controlled Infrastructure
- Continuous Monitoring
- Automated Deployments
- Reproducible Builds

---

# Security Summary

Security is integrated into every layer of this platform—from infrastructure provisioning with Terraform to secret management with AWS Secrets Manager, container scanning with Trivy, dependency analysis with `npm audit`, secure Kubernetes deployments, and continuous monitoring. By applying DevSecOps principles throughout the deployment pipeline, the platform reduces operational risk while supporting scalable, automated, and production-inspired cloud-native deployments.
