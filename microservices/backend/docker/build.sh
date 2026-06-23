#!/bin/bash
# ============================================
# E-Commerce Backend Docker Build Script
# Run from PROJECT ROOT, not docker/ folder
# ============================================

set -e

IMAGE_NAME="ecommerce-backend"
TAG="${1:-latest}"

echo "🐳 Building Docker image: ${IMAGE_NAME}:${TAG}"
echo "   Dockerfile: docker/Dockerfile"
echo "   Context: . (project root)"

# Build from project root, using docker/Dockerfile
docker build -f docker/Dockerfile -t ${IMAGE_NAME}:${TAG} .

echo ""
echo "✅ Build complete!"
echo ""
echo "📊 Image size:"
docker images ${IMAGE_NAME}:${TAG} --format "table {{.Repository}}	{{.Tag}}	{{.Size}}"

echo ""
echo "🚀 To run with Docker Compose:"
echo "   cd docker && docker-compose up -d"
echo ""
echo "🚀 To run the image directly:"
echo "   docker run -d -p 3000:3000 --env-file .env ${IMAGE_NAME}:${TAG}"
