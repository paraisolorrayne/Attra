#!/usr/bin/env bash
# Gera o post diário do blog via IA chamando o endpoint /api/cron/blog-ai.
# Disparado por /etc/cron.d/attra-blog-ai. Log: /var/log/attra-blog.log
set -e
cd /var/www/attra
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
set -a
. /var/www/attra/.env.production
set +a
echo "===== $(date -Iseconds) — blog-ai start ====="
curl -sS --max-time 300 "http://localhost:3000/api/cron/blog-ai?secret=$CRON_SECRET"
echo ""
echo "===== $(date -Iseconds) — blog-ai done ====="
