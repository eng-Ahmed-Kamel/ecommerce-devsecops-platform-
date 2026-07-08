#!/bin/bash
set -e

NAMESPACE="ecommerce"

echo "========================================"
echo "Deploying E-commerce Frontend to EKS"
echo "========================================"

# 1. Create namespace
kubectl apply -f namespace.yaml


# 3. Setup ConfigMap
kubectl apply -f configmap.yaml

# 4. Deploy application
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml

# 5. Setup autoscaling and policies
kubectl apply -f hpa.yaml
kubectl apply -f networkpolicy.yaml
#kubectl apply -f pdb.yaml

echo "========================================"
echo "Waiting for deployment..."
echo "========================================"
kubectl rollout status deployment/ecommerce-frontend -n $NAMESPACE --timeout=120s

echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""
echo "Pods:"
kubectl get pods -n $NAMESPACE -o wide
echo ""
echo "Services:"
kubectl get svc -n $NAMESPACE
echo ""
echo "Ingress:"
kubectl get ingress -n $NAMESPACE
echo ""
echo "PVC:"
kubectl get pvc -n $NAMESPACE
echo ""
echo "Access your app at: http://ecommerce.local"
echo "(Add 'ecommerce.local' to your /etc/hosts pointing to the Ingress Controller IP)"
