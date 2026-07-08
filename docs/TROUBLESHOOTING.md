# 🛠 Troubleshooting Guide

This document contains the most common issues encountered while building and deploying the platform.

---

# Helm Deployment Fails

## Problem

```
UPGRADE FAILED
```

### Solution

Check release history

```bash
helm history ecommerce -n ecommerce
```

Check values

```bash
helm get values ecommerce -n ecommerce
```

Rollback

```bash
helm rollback ecommerce 1 -n ecommerce
```

---

# Pods CrashLoopBackOff

Inspect logs

```bash
kubectl logs POD_NAME -n ecommerce
```

Describe pod

```bash
kubectl describe pod POD_NAME -n ecommerce
```

Common causes

- Missing Secret
- Wrong image
- Wrong environment variables
- Database connection failure

---

# External Secret Not Syncing

Check status

```bash
kubectl get externalsecret -n ecommerce
```

Describe

```bash
kubectl describe externalsecret ecommerce-secrets -n ecommerce
```

Verify SecretStore

```bash
kubectl get secretstore
```

---

# SecretStore Not Ready

Describe

```bash
kubectl describe secretstore aws-secret-store
```

Verify IAM Role

```bash
kubectl get sa external-secrets-sa -n ecommerce
```

---

# ALB Not Accessible

Verify Ingress

```bash
kubectl get ingress -A
```

Describe

```bash
kubectl describe ingress
```

Check AWS Load Balancer Controller

```bash
kubectl get pods -n kube-system
```

---

# Image Pull Errors

Verify image

```bash
docker pull image-name
```

Check deployment

```bash
kubectl describe pod
```

---

# Jenkins Deployment Fails

Check logs

```bash
kubectl rollout status deployment/ecommerce-backend
```

Verify images

```bash
docker images
```

Verify Helm

```bash
helm list -A
```

---

# Prometheus Not Collecting Metrics

Targets

```
Status → Targets
```

Verify

```bash
kubectl get servicemonitor -A
```

---

# Grafana Login Failed

Retrieve password

```bash
kubectl get secret kube-prometheus-stack-grafana \
-n monitoring \
-o jsonpath="{.data.admin-password}" | base64 -d
```

---

# AWS Secrets Manager Issues

Check External Secret

```bash
kubectl get externalsecret
```

Describe

```bash
kubectl describe externalsecret ecommerce-secrets
```

Verify IAM Role

```bash
kubectl describe sa external-secrets-sa
```

---

# Useful Commands

Pods

```bash
kubectl get pods -A
```

Services

```bash
kubectl get svc -A
```

Ingress

```bash
kubectl get ingress -A
```

Deployments

```bash
kubectl get deployment -A
```

Logs

```bash
kubectl logs POD_NAME
```

Describe

```bash
kubectl describe POD_NAME
```

Events

```bash
kubectl get events --sort-by=.metadata.creationTimestamp
```
