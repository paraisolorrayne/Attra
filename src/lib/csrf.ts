/**
 * CSRF Protection Utility
 * 
 * Implements double-submit cookie pattern for CSRF protection.
 * - Generates a random token stored in a secure cookie
 * - Client includes token in request header or body
 * - Server validates token matches cookie value
 */

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const CSRF_COOKIE_NAME = '__csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_TOKEN_LENGTH = 32

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get or create CSRF token for the current session
 * This should be called on pages that have forms
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value
  
  if (!token) {
    token = generateToken()
    // Token will be set when response is created
  }
  
  return token
}

/**
 * Set CSRF cookie on response
 */
export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

/**
 * Validate CSRF token from request against cookie
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  
  if (!cookieToken) {
    console.warn('[CSRF] No cookie token found')
    return false
  }
  
  // Get token from header
  let requestToken = request.headers.get(CSRF_HEADER_NAME)
  
  // Fallback: try to get from body for form submissions
  if (!requestToken) {
    try {
      const body = await request.clone().json()
      requestToken = body._csrf || body.csrfToken
    } catch {
      // Not JSON or no body
    }
  }
  
  if (!requestToken) {
    console.warn('[CSRF] No request token found in header or body')
    return false
  }
  
  // Compare tokens using timing-safe comparison
  const isValid = timingSafeEqual(cookieToken, requestToken)
  
  if (!isValid) {
    console.warn('[CSRF] Token mismatch')
  }
  
  return isValid
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * CSRF validation result with error response helper
 */
export interface CsrfValidationResult {
  valid: boolean
  error?: NextResponse
}

/**
 * Validate CSRF and return appropriate error response if invalid
 */
export async function validateCsrfWithResponse(request: NextRequest): Promise<CsrfValidationResult> {
  const valid = await validateCsrfToken(request)
  
  if (!valid) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Invalid CSRF token', code: 'CSRF_INVALID' },
        { status: 403 }
      ),
    }
  }
  
  return { valid: true }
}

/**
 * List of safe HTTP methods that don't require CSRF validation
 */
export const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'] as const

/**
 * Check if request method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  return !SAFE_METHODS.includes(method as typeof SAFE_METHODS[number])
}

