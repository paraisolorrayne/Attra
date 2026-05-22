# Testing the Attra Vehicle Platform

## Overview
Attra is a Next.js 16 premium automotive dealership platform with inventory from the AutoConf CRM API, Supabase caching, and bundled JSON fallback.

## Building & Running Locally

```bash
cd /home/ubuntu/repos/Attra
npm ci
npm run build

# Copy static assets to standalone
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# Start standalone server
node .next/standalone/server.js &
```

**Important:** Without AutoConf API credentials or Supabase env vars, the app falls back to bundled data in `list_vehicle.json`. This is expected for local testing.

## Key Test Flows

### 1. Home Page (`/`)
- Hero section with featured vehicle (real S3 photo from `autoconf-production.s3.amazonaws.com`)
- Editorial section ("Seleção editorial") shows 3 curated vehicles with prices and years
- Verify zero occurrences of "NaN" on the page
- **SEO metadata**: Title should be `Comprar Carros de Luxo e Supercarros no Brasil | Attra Veículos` (not the generic layout title)
- Check via console: `document.title`, `document.querySelector('meta[property="og:title"]').content`, `document.querySelector('meta[name="keywords"]').content`

### 2. Listing Page (`/veiculos`)
- Should show 15 vehicles (from bundled fallback)
- Each card: brand, model, year, mileage, fuel type, price
- Prices in `R$ X.XXX.XXX,XX` format (Brazilian currency)
- Year filter sidebar shows years 2016–2025
- Pagination: 2 pages (12 on page 1, 3 on page 2)
- **JSON-LD ItemList schema**: Check via console — `document.querySelectorAll('script[type="application/ld+json"]')` should include an `ItemList` type with `numberOfItems` matching total vehicles and correct `position` values (1-indexed, pagination-aware)

### 3. Detail Page (`/veiculo/[slug]`)
- Good test vehicle: Corvette Z06 (`/veiculo/chevrolet-corvette-z06-2023-989248`)
  - Has different fab/mod years (2022/2023) — proves both `anofabricacao` and `anomodelo` fields work
- Check: price, year, mileage, transmission, color, gallery (20 photos), breadcrumb
- "Ficha Técnica" section has all specs
- No visible "LLMO lede" paragraph (was removed — summary text only in meta tags)

### 4. Merchant Feed (`/api/feed/estoque`)
- Google Merchant Center XML feed
- Validate via shell:
  ```bash
  curl -s http://localhost:3000/api/feed/estoque | python3 -c "
  import sys, xml.etree.ElementTree as ET
  data = sys.stdin.read()
  root = ET.fromstring(data)
  ns = {'g': 'http://base.google.com/ns/1.0'}
  items = root.findall('.//item')
  print(f'Total items: {len(items)}')
  for item in items:
      price = item.find('g:price', ns)
      img = item.find('g:image_link', ns)
      add_imgs = item.findall('g:additional_image_link', ns)
      if 'NaN' in (price.text or ''):
          print(f'NaN PRICE: {item.find(\"title\").text}')
      if any(ai.text == img.text for ai in add_imgs):
          print(f'DEDUP VIOLATION: {item.find(\"title\").text}')
  print('Done')
  "
  ```
- Key checks: no NaN prices, no zero prices, no placeholder images, no primary image duplicated in additional_image_link, all vehicles "in stock"

### 5. LLM Crawler Endpoint (`/api/llm/vehicles`)
- **JSON format** (default): Returns Schema.org `ItemList` with `@context`, `@type`, `numberOfItems`, `provider` (AutoDealer), and `itemListElement` array of `Vehicle` items
- **Markdown format** (`?format=text`): Returns `# Attra Veículos — Estoque Atual (N veículos)` with structured vehicle data
- **Brand filter** (`?brand=chevrolet`): Returns filtered subset
- All three formats should work with bundled fallback data

### 6. Protected Admin Endpoints (Auth Rejection)
These endpoints require `CRON_SECRET` header. Without it configured, they should return `500` with `{"error":"CRON_SECRET not configured"}`:
```bash
curl -s -X POST http://localhost:3000/api/embeddings/sync
curl -s -X POST http://localhost:3000/api/llm/monitor
curl -s -X POST http://localhost:3000/api/llm/gaps
```

### 7. Semantic Search Graceful Degradation
Without `JINA_API_KEY`, `/api/vehicles/search?q=anything` should return `503` with `{"error":"Semantic search not configured"}`.

### 8. llms.txt (`/llms.txt`)
- Should contain `## APIs para LLMs` section listing 4 endpoints
- Should include `## Acervo icônico` section with iconic vehicle descriptions
- Should list all main pages, reviews, and educational content

### 9. Jornada Iconic Cars (`/jornada`)
- Scroll to "Carros Icônicos que Passaram pela Attra" section
- Should show exactly 8 cards (not the old 12)
- First card: Ferrari 812 GTS (Supercarro, 2023, 0 km)
- Last card: Audi R8 (Supercarro, 2021, 16.000 km)
- Zero "R$" price tags in iconic section (these are sold vehicles)
- All photos should load from S3 (no broken images)
- Category badges: "Supercarro", "SUV Premium", "Luxo", "Esportivo"

## Common Pitfalls

### Stale Server Process
If you rebuild the code but don't restart the server, it serves old compiled output. Always verify:
```bash
# Check if server process is older than build
ps aux | grep server.js
ls -la .next/standalone/server.js
```
Kill old process and restart after each rebuild.

### NaN Values in Vehicle Data
The vehicle data pipeline maps AutoConf API fields (`valorvenda`, `anofabricacao`, `anomodelo`, `km`) to internal schema. If field names are wrong in `list_vehicle.json`, `parseFloat(undefined)` produces NaN.
- Key fields: `valorvenda` (not `preco`), `anofabricacao`/`anomodelo` (not `ano`), `km` (not `km_total`), `foto`/`fotos` (not `foto_principal_url`)

### Brazilian Mileage Parsing
Mileage values like "2.500 km" use Brazilian number format (dots as thousand separators). The code uses `replaceAll('.',  '')` before `parseInt` to handle this — if you see mileage of 2 instead of 2500 in JSON-LD, check the parsing logic.

### WhatsApp Chat Widget
A chat widget may overlay content. Close it by clicking the X before taking screenshots.

### JSON-LD Script Index
The `/veiculos` page has multiple `<script type="application/ld+json">` tags. The ItemList is typically at index 4 (after AutoDealer, WebSite duplicates). Use a loop to find by `@type` rather than hardcoding the index.

### Computer Tool Keyboard Shortcuts
When using the browser computer tool:
- Use `{"action": "key", "text": "ctrl+l"}` to focus the address bar (not `"key"` parameter)
- Use `{"action": "triple_click"}` on address bar to select all before typing a new URL
- The `console` method runs JavaScript in the page context — use `console.log()` for output

## Data Schema (list_vehicle.json)
Each vehicle object must have:
- `id`, `marca_nome`, `modelopai_nome`
- `valorvenda` (string, e.g. "190000.00")
- `anofabricacao`, `anomodelo` (string, e.g. "2023")
- `km` (number, e.g. 7500)
- `combustivel_nome`, `cambio_nome`, `cor_nome`
- `foto` (string URL), `fotos` (array of `{url: string}` objects)
- `status_id` (9 = in stock)
- `placa` (masked, e.g. "C**-***0") — never include `placa_completa`

## Devin Secrets Needed
- None required for local testing with bundled fallback data
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — needed only to test Supabase snapshot layer
- `AUTOCONF_API_URL` + `AUTOCONF_API_TOKEN` — needed only to test live API integration
- `JINA_API_KEY` — needed only to test semantic search and embedding sync
- `CRON_SECRET` — needed only to test admin endpoint access (embeddings sync, monitor, gaps)
