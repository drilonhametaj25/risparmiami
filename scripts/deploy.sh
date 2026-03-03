#!/bin/bash
set -euo pipefail

cd /opt/risparmiami

echo "==> Pulling latest code..."
git pull origin main

echo "==> Building app container..."
docker compose -f docker-compose.prod.yml build app

echo "==> Running database migrations..."
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

echo "==> Restarting app (zero-downtime)..."
docker compose -f docker-compose.prod.yml up -d --no-deps app

echo "==> Rebuilding scraper if changed..."
docker compose -f docker-compose.prod.yml up -d --no-deps --build scraper

echo "==> Waiting for health check..."
sleep 10
if curl -sf http://localhost:3000/api/auth/session > /dev/null; then
    echo "Health check OK"
else
    echo "WARNING: Health check failed. Check logs with: docker compose -f docker-compose.prod.yml logs app"
fi

echo "==> Cleaning up old images..."
docker image prune -f

echo "==> Deploy complete!"
