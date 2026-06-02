# Kit de cron — rotinas automáticas da Attra (VPS)

Fonte da verdade versionada dos crons nativos do Linux que rodam na VPS. Antes
disso, wrappers e crontabs existiam **só na VPS** e sumiam em silêncio (o
`attra-news-ingestion.sh` desapareceu 2x, deixando `/news` sem ciclo novo por
semanas). Agora o estado desejado vive no repo e o `install-crons.sh` o aplica.

> Por que cron nativo e não pg_cron: o pg_cron do Supabase managed **agenda mas
> não executa** (pg_net não dispara). Diagnóstico e troubleshooting em
> [`../../docs/CRON_TROUBLESHOOTING.md`](../../docs/CRON_TROUBLESHOOTING.md).

## Conteúdo

```
deploy/cron/
  wrappers/                     # -> /usr/local/bin/ (0755)
    attra-blog-ai.sh            # curl /api/cron/blog-ai
    attra-news-ingestion.sh     # curl /api/cron/news-ingestion
    attra-hero-preprocess.sh    # npm run hero:preprocess (tsx, sem HTTP)
  cron.d/                       # -> /etc/cron.d/ (0644, root)
    attra-blog-ai               # 0 4 * * *   (diário 04:00)
    attra-news-ingestion        # 0 3 * * 0   (domingo 03:00)
    attra-hero-preprocess       # 0 */6 * * * (a cada 6h)
  install-crons.sh              # aplica tudo, idempotente, valida com ls
```

Todos os horários são **hora local da VPS** (atualmente UTC+2). Cada job loga em
`/var/log/attra-<job>.log`.

## Instalar / atualizar na VPS

```bash
cd /var/www/attra
git pull --ff-only origin master
sudo bash deploy/cron/install-crons.sh
```

O script copia os wrappers (chmod +x), instala os crontabs com permissão correta,
recarrega o cron e **valida com `ls` que os 3 wrappers existem e são
executáveis** — se algum sumir de novo, o erro aparece aqui em vez de falhar
silenciosamente no domingo seguinte.

## Disparar manualmente (testar agora)

```bash
/usr/local/bin/attra-news-ingestion.sh
/usr/local/bin/attra-blog-ai.sh          # aceita force via endpoint: &force=1
/usr/local/bin/attra-hero-preprocess.sh
```
