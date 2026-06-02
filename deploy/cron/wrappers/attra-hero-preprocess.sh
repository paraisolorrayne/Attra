#!/usr/bin/env bash
# Pré-processa os assets do hero (remove-bg + composite) rodando o script tsx
# direto — NÃO usa o endpoint HTTP nem CRON_SECRET, mas precisa do .env.production
# (Supabase/Replicate). Disparado por /etc/cron.d/attra-hero-preprocess a cada 6h.
# Log: /var/log/attra-hero.log
set -e
cd /var/www/attra
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
set -a
. /var/www/attra/.env.production
set +a
echo "===== $(date -Iseconds) — hero:preprocess start ====="
npm run hero:preprocess
echo "===== $(date -Iseconds) — hero:preprocess done ====="
