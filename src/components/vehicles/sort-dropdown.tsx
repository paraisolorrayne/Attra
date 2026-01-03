'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface SortDropdownProps {
  currentSort?: string
}

export function SortDropdown({ currentSort }: SortDropdownProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'recentes') {
      params.set('ordenar', value)
    } else {
      params.delete('ordenar')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      name="ordenar"
      value={currentSort || 'recentes'}
      onChange={(e) => handleChange(e.target.value)}
      className="bg-background-card border border-border rounded-lg px-4 py-2 text-foreground text-sm cursor-pointer"
    >
      <option value="recentes">Mais recentes</option>
      <option value="preco-asc">Menor preço</option>
      <option value="preco-desc">Maior preço</option>
      <option value="km-asc">Menor km</option>
      <option value="ano-desc">Mais novos</option>
    </select>
  )
}

