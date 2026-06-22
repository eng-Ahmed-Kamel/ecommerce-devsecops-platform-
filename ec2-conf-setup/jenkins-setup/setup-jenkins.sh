#!/bin/bash
# ============================================
# Jenkins Post-Setup Helper
# ============================================
CONTAINER_NAME="jenkins_docker"
case "$1" in
  password|pwd)
    echo "🔑 Initial Admin Password:"
    docker exec $CONTAINER_NAME cat /var/jenkins_home/secrets/initialAdminPassword
    ;; 
  bash|shell)
    echo "🐚 Opening bash as jenkins user..."
    docker exec -it $CONTAINER_NAME bash
    ;;
  root)
    echo "🐚 Opening bash as root..."
    docker exec -it -u root $CONTAINER_NAME bash
    ;;
    
  fix-docker)
    echo "🔧 Fixing Docker socket permissions..."
    docker exec -it -u root $CONTAINER_NAME bash -c "chmod 666 /var/run/docker.sock"
    echo "✅ Done!"
    ;;
  logs)
    docker logs -f $CONTAINER_NAME
    ;;
  stop)
    echo "🛑 Stopping Jenkins..."
    docker stop $CONTAINER_NAME
    ;;
  start)
    echo "▶️ Starting Jenkins..."
    docker start $CONTAINER_NAME
    ;;
  remove|rm)
    echo "🗑️ Removing Jenkins container (volume preserved)..."
    docker rm -f $CONTAINER_NAME
    ;; 
  *)
    echo "Usage: $0 {password|bash|root|fix-docker|logs|stop|start|remove}"
    echo ""
    echo "Commands:"
    echo "  password    - Show initial admin password"
    echo "  bash        - Enter container as jenkins user"
    echo "  root        - Enter container as root"
    echo "  fix-docker  - Fix Docker socket permissions (666)"
    echo "  logs        - Follow Jenkins logs"
    echo "  stop        - Stop the container"
    echo "  start       - Start the container"
    echo "  remove      - Remove the container"
    exit 1
    ;;
esac