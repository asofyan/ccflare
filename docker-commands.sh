#!/bin/bash
# Quick reference for Docker commands

# Build the Docker image
build() {
    docker build -t ccflare:latest .
}

# Start container with local volume persistence
start() {
    docker run -d \
        --name ccflare-proxy \
        -p 8080:8080 \
        -v "$(pwd)/data:/app/data" \
        -e PORT=8080 \
        -e LB_STRATEGY=least-requests \
        -e LOG_LEVEL=INFO \
        --restart unless-stopped \
        ccflare:latest
}

# Stop container
stop() {
    docker stop ccflare-proxy
}

# Remove container
remove() {
    docker rm ccflare-proxy
}

# Restart container
restart() {
    docker restart ccflare-proxy
}

# View logs
logs() {
    docker logs -f ccflare-proxy
}

# Check status
status() {
    docker ps | grep ccflare
}

# Start using docker-compose
compose-up() {
    docker-compose up -d
}

# Stop docker-compose
compose-down() {
    docker-compose down
}

# View docker-compose logs
compose-logs() {
    docker-compose logs -f
}

# Backup data directory
backup() {
    BACKUP_FILE="ccflare-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar czf "$BACKUP_FILE" data/
    echo "Backup created: $BACKUP_FILE"
}

# Show help
help() {
    echo "Available commands:"
    echo "  build         - Build Docker image"
    echo "  start         - Start container with local volume"
    echo "  stop          - Stop container"
    echo "  remove        - Remove container"
    echo "  restart       - Restart container"
    echo "  logs          - View container logs"
    echo "  status        - Check container status"
    echo "  compose-up    - Start with docker-compose"
    echo "  compose-down  - Stop docker-compose"
    echo "  compose-logs  - View docker-compose logs"
    echo "  backup        - Backup data directory"
    echo ""
    echo "Usage: ./docker-commands.sh [command]"
}

# Main
if [ $# -eq 0 ]; then
    help
else
    $1
fi
