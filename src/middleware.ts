import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/auth.config'
import { canAccessRoute, isAdminRole } from '@/lib/auth/roles'

// Auth.js edge-safe (sem providers/DB) só pra ler a sessão (JWT) no middleware.
// Migrado do Supabase GoTrue → Auth.js (ver docs/MIGRACAO_POSTGRES_PURO.md).
// Substitui o bypass temporário que existia aqui.
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Só protege /admin/*; login e reset são livres.
  if (!pathname.startsWith('/admin')) return
  if (pathname === '/admin/login' || pathname.startsWith('/admin/reset-password')) return

  const role = req.auth?.user?.role

  // Sem sessão válida → login
  if (!role || !isAdminRole(role)) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  // /admin puro → renderiza a landing (hub de cards). Todo papel autenticado vê.
  if (pathname === '/admin') return

  // Gate por papel — sem acesso volta pro hub (nem todo papel acessa engine-sounds)
  if (!canAccessRoute(role, pathname)) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
})

export const config = {
  matcher: ['/admin/:path*'],
}
