#!/usr/bin/env bash
# Ingestão semanal de notícias via /api/cron/news-ingestion.
# Disparado por /etc/cron.d/attra-news-ingestion. Log: /var/log/attra-news.log
set -e
cd /var/www/attra
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
set -a
. /var/www/attra/.env.production
set +a
echo "===== $(date -Iseconds) — news-ingestion start ====="
curl -sS --max-time 300 "http://localhost:3000/api/cron/news-ingestion?secret=$CRON_SECRET"
echo ""
echo "===== $(date -Iseconds) — news-ingestion done ====="
