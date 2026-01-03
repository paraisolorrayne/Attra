/**
 * Admin Authentication Service
 * Simple token-based authentication for the admin panel
 * Uses environment variables for admin credentials
 */

import { cookies } from 'next/headers'
import { promises as fs } from 'fs'
import path from 'path'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'attra2024!'
const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION_HOURS = 24

interface AdminSession {
  token: string
  expires_at: string
  created_at: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const SESSIONS_FILE = path.join(DATA_DIR, 'admin-sessions.json')

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Read all sessions
async function getAllSessions(): Promise<AdminSession[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(SESSIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Save all sessions
async function saveSessions(sessions: AdminSession[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2))
}

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Validate admin credentials and create session
export async function adminLogin(username: string, password: string): Promise<string | null> {
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return null
  }

  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000)

  const session: AdminSession = {
    token,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  }

  const sessions = await getAllSessions()
  // Clean up expired sessions
  const validSessions = sessions.filter(s => new Date(s.expires_at) > new Date())
  validSessions.push(session)
  await saveSessions(validSessions)

  return token
}

// Validate session token
export async function validateSession(token: string): Promise<boolean> {
  if (!token) return false

  const sessions = await getAllSessions()
  const session = sessions.find(s => s.token === token)

  if (!session) return false
  if (new Date(session.expires_at) <= new Date()) {
    // Session expired, clean it up
    const validSessions = sessions.filter(s => s.token !== token)
    await saveSessions(validSessions)
    return false
  }

  return true
}

// Logout - invalidate session
export async function adminLogout(token: string): Promise<void> {
  const sessions = await getAllSessions()
  const validSessions = sessions.filter(s => s.token !== token)
  await saveSessions(validSessions)
}

// Get session token from cookies (server-side)
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null
}

// Check if current request is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionToken()
  if (!token) return false
  return validateSession(token)
}

// Set session cookie (used after login)
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_HOURS * 60 * 60,
    path: '/',
  })
}

// Clear session cookie (used after logout)
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

