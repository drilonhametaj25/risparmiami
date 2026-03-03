#!/bin/bash
set -euo pipefail

cd /opt/risparmiami

echo "==> Pulling latest code..."
git pull origin main

echo "==> Building containers..."
docker compose -f docker-compose.prod.yml build app scraper

echo "==> Starting database services..."
docker compose -f docker-compose.prod.yml up -d postgres redis meilisearch
sleep 5

echo "==> Running database migrations..."
docker compose -f docker-compose.prod.yml run --rm app ./node_modules/prisma/build/index.js migrate deploy

echo "==> Seeding database (idempotent)..."
docker compose -f docker-compose.prod.yml run --rm app ./node_modules/tsx/dist/cli.mjs prisma/seed.ts || echo "Seed warning (non-blocking)"

echo "==> Starting app..."
docker compose -f docker-compose.prod.yml up -d --no-deps app
sleep 5

echo "==> Starting Caddy + scraper..."
docker compose -f docker-compose.prod.yml up -d caddy scraper

echo "==> Waiting for health check..."
sleep 15
docker compose -f docker-compose.prod.yml exec -T app node -e "fetch('http://localhost:3000/').then(r => console.log('Health:', r.status)).catch(e => console.error('FAIL:', e))"

echo "==> Generating PDF..."
source .env 2>/dev/null || true
docker compose -f docker-compose.prod.yml exec -T app node -e "
  const secret = process.env.CRON_SECRET || '';
  fetch('http://localhost:3000/api/cron/generate-pdf', {headers: {'Authorization': 'Bearer ' + secret}})
    .then(r => r.json()).then(j => console.log('PDF:', JSON.stringify(j))).catch(e => console.error('PDF error:', e))
" || echo "PDF generation skipped"

echo "==> Cleaning up old images..."
docker image prune -f

echo "==> Deploy complete!"
