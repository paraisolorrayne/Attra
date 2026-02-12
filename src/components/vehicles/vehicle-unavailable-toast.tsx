'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

/**
 * Client component that detects when a user was redirected from a
 * sold/unavailable vehicle page and shows a toast notification.
 * 
 * Reads the `veiculo_indisponivel` query parameter and cleans up the URL.
 */
export function VehicleUnavailableToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showToast } = useToast()
  const hasShown = useRef(false)

  useEffect(() => {
    if (hasShown.current) return

    const isUnavailable = searchParams.get('veiculo_indisponivel') === 'true'
    if (isUnavailable) {
      hasShown.current = true
      showToast('error', 'Este veículo não está mais disponível. Veja nosso estoque atual.', 6000)

      // Clean up the URL by removing the query parameter
      const params = new URLSearchParams(searchParams.toString())
      params.delete('veiculo_indisponivel')
      const newQuery = params.toString()
      const newPath = newQuery ? `/estoque?${newQuery}` : '/estoque'
      router.replace(newPath, { scroll: false })
    }
  }, [searchParams, router, showToast])

  return null
}

