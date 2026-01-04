import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    // Create response to capture cookies
    const response = NextResponse.json({ success: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Falha no login' },
        { status: 401 }
      )
    }

    // Check if user has admin access (use admin client to bypass RLS)
    const adminClient = createAdminClient()
    const { data: adminUser, error: adminError } = await adminClient
      .from('admin_users')
      .select('id, email, role, is_active')
      .eq('id', data.user.id)
      .single()

    if (adminError || !adminUser) {
      // Sign out - user doesn't have admin access
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Acesso não autorizado ao painel admin' },
        { status: 403 }
      )
    }

    if (!adminUser.is_active) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Conta desativada. Entre em contato com o administrador.' },
        { status: 403 }
      )
    }

    // Update last login
    try {
      await adminClient.rpc('update_admin_last_login', { user_id: data.user.id })
    } catch (e) {
      // Non-critical, continue
      console.warn('Failed to update last_login:', e)
    }

    // Return response with cookies set
    const successResponse = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
    })

    // Copy cookies from the supabase response
    response.cookies.getAll().forEach(cookie => {
      successResponse.cookies.set(cookie.name, cookie.value, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    })

    return successResponse
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

