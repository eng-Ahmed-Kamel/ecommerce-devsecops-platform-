#!/bin/bash
set -e
echo "Installing ArgoCD..."
# Create namespace
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
# Wait for ArgoCD server
kubectl wait --for=condition=available deployment/argocd-server -n argocd --timeout=300s
# Get initial admin password
echo "ArgoCD initial password:"
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo ""
# Port forward (for local access)
echo "Port forwarding ArgoCD UI to localhost:8080"
kubectl port-forward svc/argocd-server -n argocd 8080:443 &