import { NextResponse } from 'next/server'

/**
 * Gemini API test endpoint - DISABLED for security
 * This endpoint was removed because it exposed API key prefixes.
 * Use server-side logs or admin panel for API diagnostics instead.
 *
 * GET /api/gemini-test
 */
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint has been disabled for security reasons' },
    { status: 404 }
  )
}

