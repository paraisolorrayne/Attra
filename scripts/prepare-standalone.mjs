#!/usr/bin/env node
/**
 * Prepare the Next.js standalone build for production deployment.
 *
 * Next.js 16 + `output: 'standalone'` emite `.next/standalone/server.js` com
 * um subset enxuto de node_modules, mas NÃO copia automaticamente:
 *   - `.next/static` (chunks JS/CSS, fontes, imagens otimizadas)
 *   - `public` (em alguns cenários o Next copia, mas não é garantido em
 *     todas as versões 16.x)
 *
 * Sem esses dois diretórios ao lado do `server.js`, o servidor sobe, a home
 * chega a renderizar em SSR, mas os chunks do cliente (/_next/static/...)
 * retornam 404 — quebrando a hidratação e a navegação client-side. O sintoma
 * típico é: "a home carrega, mas as demais rotas não carregam".
 *
 * Este script roda como `postbuild` e garante que o bundle em
 * `.next/standalone/` esteja 100% pronto para ser servido por:
 *
 *     node .next/standalone/server.js
 *
 * — que é o comando recomendado pelo Next quando `output: 'standalone'`
 * está ativo em `next.config.ts`.
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

const standaloneDir = resolve(projectRoot, '.next', 'standalone')
const staticSrc = resolve(projectRoot, '.next', 'static')
const staticDest = resolve(standaloneDir, '.next', 'static')
const publicSrc = resolve(projectRoot, 'public')
const publicDest = resolve(standaloneDir, 'public')

if (!existsSync(standaloneDir)) {
  console.error(
    '[prepare-standalone] .next/standalone not found. Ensure next.config has ' +
      "`output: 'standalone'` and that `next build` completed successfully.",
  )
  process.exit(1)
}

function copyDir(src, dest, label) {
  if (!existsSync(src)) {
    console.warn(`[prepare-standalone] skip: ${label} (source missing at ${src})`)
    return
  }
  // Start fresh so stale files never linger between builds.
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(src, dest, { recursive: true })
  console.log(`[prepare-standalone] copied ${label}: ${src} -> ${dest}`)
}

copyDir(staticSrc, staticDest, '.next/static')
copyDir(publicSrc, publicDest, 'public')

console.log('[prepare-standalone] done. Start with: node .next/standalone/server.js')
