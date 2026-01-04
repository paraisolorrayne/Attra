/**
 * Admin Authentication Service
 * DEPRECATED: This file is kept for backwards compatibility.
 * New code should use admin-auth-supabase.ts instead.
 *
 * All functions now delegate to the Supabase-based authentication system.
 */

import {
  isAuthenticated as supabaseIsAuthenticated,
  getCurrentAdmin,
  signOut,
  type AdminUser
} from './admin-auth-supabase'

// Re-export types for backwards compatibility
export type { AdminUser }

/**
 * Check if current request is authenticated
 * @deprecated Use isAuthenticated from admin-auth-supabase.ts
 */
export async function isAuthenticated(): Promise<boolean> {
  return supabaseIsAuthenticated()
}

/**
 * Get current admin user
 * @deprecated Use getCurrentAdmin from admin-auth-supabase.ts
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  return getCurrentAdmin()
}

/**
 * Logout current user
 * @deprecated Use signOut from admin-auth-supabase.ts
 */
export async function adminLogout(): Promise<void> {
  return signOut()
}

// Legacy functions - no longer needed but kept for compatibility
// These are no-ops since Supabase handles everything

/** @deprecated No longer used with Supabase auth */
export async function getSessionToken(): Promise<string | null> {
  console.warn('getSessionToken is deprecated. Use Supabase auth instead.')
  return null
}

/** @deprecated No longer used with Supabase auth */
export async function setSessionCookie(_token: string): Promise<void> {
  console.warn('setSessionCookie is deprecated. Use Supabase auth instead.')
}

/** @deprecated No longer used with Supabase auth */
export async function clearSessionCookie(): Promise<void> {
  console.warn('clearSessionCookie is deprecated. Use Supabase auth instead.')
}

/** @deprecated No longer used with Supabase auth */
export async function validateSession(_token: string): Promise<boolean> {
  console.warn('validateSession is deprecated. Use Supabase auth instead.')
  return supabaseIsAuthenticated()
}

/** @deprecated No longer used with Supabase auth */
export async function adminLogin(_username: string, _password: string): Promise<string | null> {
  console.warn('adminLogin is deprecated. Use signInWithEmail from admin-auth-supabase.ts instead.')
  return null
}

