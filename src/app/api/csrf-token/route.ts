import { NextResponse } from 'next/server'
import { getCsrfToken, setCsrfCookie } from '@/lib/csrf'

/**
 * GET /api/csrf-token
 * 
 * Returns a CSRF token for use in form submissions.
 * Sets an httpOnly cookie with the token for validation.
 */
export async function GET() {
  try {
    const token = await getCsrfToken()
    
    const response = NextResponse.json({ token })
    
    // Set the token in an httpOnly cookie for validation
    setCsrfCookie(response, token)
    
    return response
  } catch (error) {
    console.error('[CSRF Token] Error generating token:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}

