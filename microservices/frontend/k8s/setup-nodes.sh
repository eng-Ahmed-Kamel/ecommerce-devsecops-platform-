#!/bin/bash
# Run this on EACH EKS worker node to create hostPath directories

NODE_NAME=$(hostname)
ASSETS_DIR="/opt/ecommerce/assets"

echo "Setting up node: $NODE_NAME"

# Create directory for assets
sudo mkdir -p $ASSETS_DIR
sudo chmod 777 $ASSETS_DIR

# Label node for nodeSelector
kubectl label node $NODE_NAME node-type=worker --overwrite

echo "✅ Node $NODE_NAME ready"
echo "   Assets path: $ASSETS_DIR"