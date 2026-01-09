# Attra Veículos - Premium Automotive Dealership

Website de catálogo automotivo premium desenvolvido com Next.js 15, React 19 e Tailwind CSS v4.

## 🚗 Funcionalidades

- **Catálogo de veículos** com filtros avançados (marca, modelo, ano, preço, combustível, carroceria)
- **Integração com API AutoConf** para dados de veículos em tempo real
- **Descrições automáticas com IA** usando Google Gemini
- **Blog dual** com templates educativos e reviews de veículos
- **SEO otimizado** com Schema.org (Vehicle, LocalBusiness, FAQ)
- **Design responsivo** com tema claro/escuro
- **Formulários integrados** com webhooks N8N para automação de leads
- **Galeria cinematográfica** para visualização de veículos

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **React**: 19
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Ícones**: Lucide React
- **Database**: Supabase
- **AI**: Google Gemini
- **API de Veículos**: AutoConf

## 🚀 Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- npm, yarn, pnpm ou bun

### Instalação

```bash
# Clone o repositório
git clone git@github.com:paraisolorrayne/Attra.git
cd Attra

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Execute o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env.local` (ou `.env.production` para produção) com:

```env
# AutoConf API Configuration (obrigatório)
AUTOCONF_BEARER_TOKEN=seu_bearer_token
AUTOCONF_DEALER_TOKEN=seu_dealer_token

# Supabase Configuration (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Google Gemini AI Configuration (obrigatório para descrições IA)
GEMINI_API_KEY=sua_api_key_gemini

# Site Configuration (obrigatório)
NEXT_PUBLIC_SITE_URL=https://seudominio.com.br

# N8N Webhook Configuration (opcional)
NEXT_PUBLIC_LEADSTER_SDR_WEBHOOK_URL=https://seu-webhook-url
```

---

## 📦 Deploy e Migração

### Opção 1: Deploy com Node.js (Recomendado)

#### Build de Produção

```bash
# Gere o build de produção
npm run build

# Execute o servidor de produção
npm run start
```

O servidor iniciará na porta 3000 por padrão. Use `PORT=8080` para outra porta.

#### Configuração do Servidor

1. **Instale Node.js 18+** no servidor
2. **Clone o repositório** e instale dependências
3. **Configure variáveis de ambiente** em `.env.production`
4. **Use PM2** para gerenciamento de processos:

```bash
# Instale PM2 globalmente
npm install -g pm2

# Inicie a aplicação
pm2 start npm --name "attra" -- start

# Configure para iniciar no boot
pm2 startup
pm2 save
```

### Opção 2: Deploy com Docker

#### Dockerfile

Crie um `Dockerfile` na raiz do projeto:

```dockerfile
FROM node:18-alpine AS base

# Instalar dependências apenas quando necessário
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build da aplicação
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Imagem de produção
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'
services:
  attra:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - AUTOCONF_BEARER_TOKEN=${AUTOCONF_BEARER_TOKEN}
      - AUTOCONF_DEALER_TOKEN=${AUTOCONF_DEALER_TOKEN}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
    restart: unless-stopped
```

#### Comandos Docker

```bash
# Build da imagem
docker build -t attra .

# Execute o container
docker run -p 3000:3000 --env-file .env.production attra

# Ou com docker-compose
docker-compose up -d
```

### Opção 3: Exportação Estática (SSG)

> ⚠️ **Nota**: Esta opção tem limitações. Rotas de API e funcionalidades server-side não funcionarão.

Para sites puramente estáticos:

1. Adicione ao `next.config.ts`:
```typescript
const nextConfig = {
  output: 'export',
  // ... outras configurações
}
```

2. Execute o build:
```bash
npm run build
```

3. Os arquivos estáticos estarão em `out/`. Sirva com qualquer servidor web (Nginx, Apache, Caddy).

---

## 🌐 Migração do Vercel para Servidor Próprio

### Passo 1: Preparar o Servidor

1. **Provisione um servidor** (VPS, EC2, DigitalOcean, etc.)
   - Mínimo: 1 vCPU, 1GB RAM
   - Recomendado: 2 vCPU, 2GB RAM

2. **Instale dependências**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx

# Ou use NVM para Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

### Passo 2: Configurar a Aplicação

```bash
# Clone e configure
git clone git@github.com:paraisolorrayne/Attra.git /var/www/attra
cd /var/www/attra
npm install

# Configure variáveis de ambiente
cp .env.example .env.production
nano .env.production  # Edite com suas credenciais

# Build
npm run build
```

### Passo 3: Configurar PM2

```bash
npm install -g pm2

# Inicie a aplicação
pm2 start npm --name "attra" -- start
pm2 startup
pm2 save

# Comandos úteis
pm2 logs attra      # Ver logs
pm2 restart attra   # Reiniciar
pm2 status          # Status
```

### Passo 4: Configurar Nginx como Reverse Proxy

Crie `/etc/nginx/sites-available/attra`:

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site:
```bash
sudo ln -s /etc/nginx/sites-available/attra /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Passo 5: Configurar SSL com Let's Encrypt

```bash
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

### Passo 6: Configurar DNS

No painel do seu registrador de domínio:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | @ | IP_DO_SERVIDOR | 300 |
| A | www | IP_DO_SERVIDOR | 300 |

### Passo 7: Atualizar Variáveis de Ambiente

Atualize `NEXT_PUBLIC_SITE_URL` no `.env.production`:
```env
NEXT_PUBLIC_SITE_URL=https://seudominio.com.br
```

Reconstrua e reinicie:
```bash
npm run build
pm2 restart attra
```

---

## 🔄 CI/CD com GitHub Actions (Opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/attra
            git pull origin master
            npm install
            npm run build
            pm2 restart attra
```

Configure os secrets no GitHub:
- `SERVER_HOST`: IP ou domínio do servidor
- `SERVER_USER`: Usuário SSH
- `SSH_PRIVATE_KEY`: Chave SSH privada

---

## 📝 Comandos Úteis

```bash
# Desenvolvimento
npm run dev         # Servidor de desenvolvimento
npm run build       # Build de produção
npm run start       # Servidor de produção
npm run lint        # Verificar linting

# PM2 (produção)
pm2 logs attra      # Ver logs em tempo real
pm2 restart attra   # Reiniciar aplicação
pm2 stop attra      # Parar aplicação
pm2 delete attra    # Remover do PM2
pm2 monit           # Monitor de recursos

# Docker
docker-compose up -d      # Iniciar containers
docker-compose down       # Parar containers
docker-compose logs -f    # Ver logs
docker-compose build      # Rebuild
```

## 📄 Licença

Projeto privado - Attra Veículos © 2026
