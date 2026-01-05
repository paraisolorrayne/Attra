import { createServerClient, createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect admin routes (except login and reset-password)
  if (!pathname.startsWith('/admin') ||
      pathname === '/admin/login' ||
      pathname.startsWith('/admin/reset-password')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Client for auth session management (uses anon key)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get current session
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  console.log('[Middleware] User from session:', user?.id, 'Error:', userError?.message)

  if (!user) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin client to bypass RLS for checking admin_users table
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  // Check if user has admin access
  const { data: adminUser, error: adminError } = await adminClient
    .from('admin_users')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  console.log('[Middleware] Admin user lookup:', adminUser, 'Error:', adminError?.message)

  if (!adminUser || !adminUser.is_active) {
    // User is authenticated but not an admin - redirect to login
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access control
  const role = adminUser.role as 'admin' | 'gerente'

  // Admins have full access
  if (role === 'admin') {
    return response
  }

  // Gerente can only access /admin/engine-sounds
  if (role === 'gerente') {
    if (pathname.startsWith('/admin/engine-sounds')) {
      return response
    }
    // Redirect gerente to their allowed page
    return NextResponse.redirect(new URL('/admin/engine-sounds', request.url))
  }

  // Unknown role - deny access
  return NextResponse.redirect(new URL('/admin/login', request.url))
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}

