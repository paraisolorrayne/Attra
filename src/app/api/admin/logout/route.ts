import { NextResponse } from 'next/server'
import { getSessionToken, adminLogout, clearSessionCookie } from '@/lib/admin-auth'

export async function POST() {
  try {
    const token = await getSessionToken()
    
    if (token) {
      await adminLogout(token)
    }
    
    await clearSessionCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

