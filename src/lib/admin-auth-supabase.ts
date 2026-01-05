/**
 * Supabase-based Admin Authentication Service
 * Replaces the simple token-based authentication with Supabase Auth
 * Supports role-based access control (admin, gerente)
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AdminRole = 'admin' | 'gerente'

export interface AdminUser {
  id: string
  email: string
  role: AdminRole
  name: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface AuthResult {
  success: boolean
  error?: string
  user?: AdminUser
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data.user) {
    return { success: false, error: 'Login failed' }
  }

  // Check if user has admin access
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', data.user.id)
    .eq('is_active', true)
    .single()

  if (adminError || !adminUser) {
    // Sign out the user - they don't have admin access
    await supabase.auth.signOut()
    return { success: false, error: 'Acesso não autorizado ao painel admin' }
  }

  // Update last login
  const adminClient = createAdminClient()
  await adminClient.rpc('update_admin_last_login', { user_id: data.user.id })

  return { success: true, user: adminUser as AdminUser }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

/**
 * Get current authenticated admin user
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  console.log('[getCurrentAdmin] User from session:', user?.id, 'Error:', userError?.message)

  if (!user) return null

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .eq('is_active', true)
    .single()

  console.log('[getCurrentAdmin] Admin user lookup result:', adminUser?.email, 'Error:', adminError?.message)

  return adminUser as AdminUser | null
}

/**
 * Check if current user is authenticated as admin
 */
export async function isAuthenticated(): Promise<boolean> {
  const admin = await getCurrentAdmin()
  return admin !== null
}

/**
 * Check if current user has specific role
 */
export async function hasRole(requiredRole: AdminRole): Promise<boolean> {
  const admin = await getCurrentAdmin()
  if (!admin) return false
  
  // Admin has access to everything
  if (admin.role === 'admin') return true
  
  return admin.role === requiredRole
}

/**
 * Check if current user can access a specific route
 */
export async function canAccessRoute(pathname: string): Promise<boolean> {
  const admin = await getCurrentAdmin()
  if (!admin) return false
  
  // Admin has full access
  if (admin.role === 'admin') return true
  
  // Gerente can only access engine-sounds
  if (admin.role === 'gerente') {
    return pathname.startsWith('/admin/engine-sounds') ||
           pathname === '/admin/login' ||
           pathname === '/admin/reset-password'
  }
  
  return false
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Update password (after reset token validation)
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

