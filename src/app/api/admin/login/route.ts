import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

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

    // Check if user has admin access
    const { data: adminUser, error: adminError } = await supabase
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
      const adminClient = createAdminClient()
      await adminClient.rpc('update_admin_last_login', { user_id: data.user.id })
    } catch (e) {
      // Non-critical, continue
      console.warn('Failed to update last_login:', e)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

