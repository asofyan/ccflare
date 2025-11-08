# Docker Deployment Guide

This guide explains how to run ccflare as a Docker container.

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and start the container:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Using Docker CLI

1. **Build the image:**
   ```bash
   docker build -t ccflare:latest .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name ccflare-proxy \
     -p 8080:8080 \
     -v "$(pwd)/data:/app/data" \
     -e PORT=8080 \
     -e LB_STRATEGY=least-requests \
     -e LOG_LEVEL=INFO \
     --restart unless-stopped \
     ccflare:latest
   ```

3. **View logs:**
   ```bash
   docker logs -f ccflare-proxy
   ```

4. **Stop the container:**
   ```bash
   docker stop ccflare-proxy
   docker rm ccflare-proxy
   ```

## Configuration

### Environment Variables

Configure the application using environment variables:

- `PORT` - Server port (default: 8080)
- `LB_STRATEGY` - Load balancing strategy (default: least-requests)
  - Options: `least-requests`, `round-robin`, `session`, `weighted`, `weighted-round-robin`
- `LOG_LEVEL` - Logging level (default: INFO)
  - Options: `DEBUG`, `INFO`, `WARN`, `ERROR`
- `LOG_FORMAT` - Log format (default: pretty)
  - Options: `pretty`, `json`

### Using .env File

Create a `.env` file in the project root:

```bash
cp .env.example .env
# Edit .env with your configuration
```

Then use docker-compose:

```bash
docker-compose up -d
```

### Using Custom Port

To run on a different port (e.g., 3000):

```bash
PORT=3000 docker-compose up -d
```

Or with Docker CLI:

```bash
docker run -d \
  --name ccflare-proxy \
  -p 3000:8080 \
  -e PORT=8080 \
  ccflare:latest
```

## Data Persistence

The container uses a local directory to persist data:

- **Local directory:** `./data` (in your project root)
- **Container mount point:** `/app/data`
- **Contents:** Database files, credentials, and configuration

This ensures all your accounts and settings persist across container restarts.

### Backup Data

Since data is stored locally in the `./data` directory, you can simply backup this directory:

```bash
# Create a backup
tar czf ccflare-backup-$(date +%Y%m%d).tar.gz data/

# Or copy to another location
cp -r data/ /path/to/backup/location/
```

### Restore Data

```bash
# Extract from backup
tar xzf ccflare-backup-YYYYMMDD.tar.gz

# Or copy from backup location
cp -r /path/to/backup/location/data/ ./
```

## Managing Accounts

After starting the container, you can manage accounts through the API or dashboard:

### Via Dashboard

Open your browser and navigate to:
```
http://localhost:8080
```

### Via API

**Add an account:**
```bash
curl -X POST http://localhost:8080/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-account",
    "sessionKey": "your-session-key-here"
  }'
```

**List accounts:**
```bash
curl http://localhost:8080/api/accounts
```

**Remove an account:**
```bash
curl -X DELETE http://localhost:8080/api/accounts/{account-id}
```

## Health Check

The container includes a health check that monitors the API:

```bash
docker ps  # Check health status
```

Or test manually:

```bash
curl http://localhost:8080/api/stats
```

## Logs

### View all logs:
```bash
docker logs ccflare-proxy
```

### Follow logs in real-time:
```bash
docker logs -f ccflare-proxy
```

### View last 100 lines:
```bash
docker logs --tail 100 ccflare-proxy
```

## Troubleshooting

### Container won't start

1. Check logs:
   ```bash
   docker logs ccflare-proxy
   ```

2. Verify port is available:
   ```bash
   lsof -i :8080
   ```

3. Check container status:
   ```bash
   docker ps -a
   ```

### Permission issues

If you encounter permission issues with the volume:

```bash
docker-compose down
docker volume rm ccflare-data
docker-compose up -d
```

### Rebuild after code changes

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

### Using Docker Swarm

```bash
docker stack deploy -c docker-compose.yml ccflare
```

### Using Kubernetes

A Kubernetes deployment example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ccflare
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ccflare
  template:
    metadata:
      labels:
        app: ccflare
    spec:
      containers:
      - name: ccflare
        image: ccflare:latest
        ports:
        - containerPort: 8080
        env:
        - name: PORT
          value: "8080"
        - name: LB_STRATEGY
          value: "least-requests"
        - name: LOG_LEVEL
          value: "INFO"
        volumeMounts:
        - name: data
          mountPath: /app/data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: ccflare-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: ccflare-service
spec:
  selector:
    app: ccflare
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

## Security Considerations

1. **Non-root user:** The container runs as a non-root user (`bunuser`)
2. **Read-only volumes:** Mount sensitive config files as read-only
3. **Network isolation:** Use Docker networks to isolate the container
4. **Secrets management:** Use Docker secrets or environment variables for sensitive data

## Resource Limits

Add resource limits in docker-compose.yml:

```yaml
services:
  ccflare:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Monitoring

Monitor container metrics:

```bash
docker stats ccflare-proxy
```

Or use monitoring tools like:
- Prometheus + Grafana
- Datadog
- New Relic
