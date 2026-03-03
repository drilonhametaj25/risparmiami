#!/bin/bash
set -euo pipefail

# =============================================================
# RisparmiaMi — Initial Server Setup for Hetzner VPS
# Run this script ONCE on a fresh Ubuntu 22.04+ server
# =============================================================

echo "==> Updating system..."
apt update && apt upgrade -y

echo "==> Installing Docker..."
apt install -y docker.io docker-compose-plugin git ufw curl

echo "==> Enabling Docker..."
systemctl enable docker
systemctl start docker

echo "==> Configuring firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

echo "==> Creating project directory..."
mkdir -p /opt/risparmiami
cd /opt/risparmiami

echo "==> Cloning repository..."
git clone https://github.com/drilonhametaj25/risparmiami.git .

echo ""
echo "============================================"
echo "  SETUP PART 1 COMPLETE"
echo "============================================"
echo ""
echo "Now you need to:"
echo "  1. Copy .env.example to .env and fill in all secrets:"
echo "     cp .env.example .env"
echo "     nano .env"
echo ""
echo "  2. Then run the following commands:"
echo ""
echo "     # Start all services"
echo "     docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "     # Wait for postgres to be ready, then run migrations"
echo "     sleep 10"
echo "     docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy"
echo ""
echo "     # Seed the database with 92 rules"
echo "     docker compose -f docker-compose.prod.yml run --rm app npx prisma db seed"
echo ""
echo "  3. Set up cron jobs:"
echo "     crontab -e"
echo "     # Add these lines (replace YOUR_CRON_SECRET):"
echo '     0 3 * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://risparmiami.pro/api/cron/generate-pdf'
echo '     0 8 1 * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://risparmiami.pro/api/cron/monthly-report'
echo ""
echo "  4. Verify everything works:"
echo "     curl -I https://risparmiami.pro"
echo "     docker compose -f docker-compose.prod.yml logs app"
echo "     docker compose -f docker-compose.prod.yml logs scraper"
echo ""
