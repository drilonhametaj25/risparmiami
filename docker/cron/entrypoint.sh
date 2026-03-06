#!/bin/sh
set -e

# ============================================================
# RisparmiaMi — Cron Scheduler
# Generates crontab from environment variables and runs crond.
# All times are in Europe/Rome (CET/CEST) thanks to TZ env var.
# ============================================================

if [ -z "$CRON_SECRET" ]; then
  echo "ERROR: CRON_SECRET is not set. Exiting."
  exit 1
fi

CURL="curl -sf -m 300 -H \"Authorization: Bearer ${CRON_SECRET}\""
APP="http://app:3000"

# Generate crontab (busybox crond does NOT pass env vars to jobs)
cat <<EOF | crontab -
# -- Email drip campaign -- every 6 hours
0 */6 * * * ${CURL} ${APP}/api/cron/email-drip >> /proc/1/fd/1 2>&1

# -- Deadline alerts -- daily at 08:00 CET
0 8 * * * ${CURL} ${APP}/api/cron/deadline-alerts >> /proc/1/fd/1 2>&1

# -- Monthly report -- 1st of each month at 09:00 CET
0 9 1 * * ${CURL} ${APP}/api/cron/monthly-report >> /proc/1/fd/1 2>&1

# -- Re-match stale users -- every 4 hours
0 */4 * * * ${CURL} ${APP}/api/cron/rematch-users >> /proc/1/fd/1 2>&1

# -- PDF generation -- weekly Sunday at 03:00 CET
0 3 * * 0 curl -sf -m 600 -H "Authorization: Bearer ${CRON_SECRET}" ${APP}/api/cron/generate-pdf >> /proc/1/fd/1 2>&1

EOF

echo "============================================"
echo "  Cron jobs installed (TZ=${TZ}):"
echo "============================================"
crontab -l
echo "============================================"
echo "  Starting crond in foreground..."
echo "============================================"

# Run crond in foreground so Docker can track PID 1
exec crond -f -l 2
