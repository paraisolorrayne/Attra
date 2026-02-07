'use client'

import { useState, useEffect } from 'react'

const CSRF_ENDPOINT = '/api/csrf-token'

/**
 * Hook to get CSRF token for form submissions
 * 
 * Usage:
 * const { token, loading, error } = useCsrfToken()
 * 
 * Then include in fetch requests:
 * fetch('/api/some-endpoint', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'X-CSRF-Token': token || '',
 *   },
 *   body: JSON.stringify(data),
 * })
 */
export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch(CSRF_ENDPOINT)
        
        if (!response.ok) {
          throw new Error('Failed to fetch CSRF token')
        }
        
        const data = await response.json()
        setToken(data.token)
      } catch (err) {
        console.error('[useCsrfToken] Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [])

  return { token, loading, error }
}

/**
 * Helper to create headers with CSRF token
 */
export function createCsrfHeaders(token: string | null): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'X-CSRF-Token': token } : {}),
  }
}

