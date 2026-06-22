#!/bin/bash
# ============================================
# Jenkins Docker Setup Script
# ============================================
set -e
echo " Starting Jenkins Docker container..."
# Run Jenkins container
docker-compose up -d

echo " Waiting for Jenkins to initialize..."
sleep 15

echo ""
echo "🔑 Initial Admin Password:"
docker exec -it jenkins_docker cat /var/jenkins_home/secrets/initialAdminPassword

echo ""
echo "🔧 Fixing Docker socket permissions..."
docker exec -it -u root jenkins_docker bash -c "chmod 666 /var/run/docker.sock"

echo ""
echo "✅ Jenkins is ready!"
echo "🌐 Access Jenkins at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'YOUR_EC2_IP'):8080"
echo ""
echo "📋 Useful commands:"
echo "   docker logs -f jenkins_docker          # View Jenkins logs"
echo "   docker exec -it jenkins_docker bash    # Enter as jenkins user"
echo "   docker exec -it -u root jenkins_docker bash  # Enter as root"