'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const suggestionDatabase = {
  brands: ['Ferrari', 'Lamborghini', 'Porsche', 'McLaren', 'Audi', 'BMW', 'Mercedes-Benz', 'Cadillac', 'Land Rover', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'Maserati', 'Jaguar', 'Volvo', 'Lexus'],
  models: ['911', 'Cayenne', 'M3', 'M4', 'M5', 'C63', 'AMG GT', '488', 'F8', 'Huracan', 'Aventador', 'Urus', '720S'],
  categories: ['superesportivo', 'conversível', 'SUV', 'sedan', 'cupê', 'importado', 'premium'],
}

interface Suggestion {
  type: 'brand' | 'model' | 'category'
  value: string
  label: string
}

export function VehicleSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const generateSuggestions = useCallback((q: string): Suggestion[] => {
    if (!q || q.length < 2) return []
    const lower = q.toLowerCase()
    const results: Suggestion[] = []
    suggestionDatabase.brands.forEach(b => {
      if (b.toLowerCase().includes(lower)) results.push({ type: 'brand', value: b, label: b })
    })
    suggestionDatabase.models.forEach(m => {
      if (m.toLowerCase().includes(lower)) results.push({ type: 'model', value: m, label: m })
    })
    suggestionDatabase.categories.forEach(c => {
      if (c.toLowerCase().includes(lower)) results.push({ type: 'category', value: c, label: c })
    })
    return results.slice(0, 6)
  }, [])

  useEffect(() => {
    setSuggestions(generateSuggestions(query))
    setSelectedIndex(-1)
  }, [query, generateSuggestions])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query
    const params = new URLSearchParams(searchParams.toString())
    if (q.trim()) {
      params.set('q', q.trim())
    } else {
      params.delete('q')
    }
    params.delete('pagina')
    router.push(`/veiculos?${params.toString()}`)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        setQuery(suggestions[selectedIndex].value)
        handleSearch(suggestions[selectedIndex].value)
      } else {
        handleSearch()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const typeLabels: Record<string, string> = { brand: 'Marca', model: 'Modelo', category: 'Categoria' }

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-foreground-secondary/60 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar marca, modelo, ano, cor..."
          className="w-full bg-background-card border border-border/50 hover:border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 rounded-xl pl-12 pr-24 py-3.5 text-foreground placeholder:text-foreground-secondary/50 focus:outline-none transition-all text-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); handleSearch('') }}
            className="absolute right-20 p-1.5 text-foreground-secondary hover:text-foreground transition-colors"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => handleSearch()}
          className="absolute right-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          Buscar
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-background-card backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl overflow-hidden z-50"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}`}
              onClick={() => { setQuery(suggestion.value); handleSearch(suggestion.value) }}
              className={cn(
                'w-full px-4 py-3 text-left flex items-center justify-between transition-colors text-sm',
                index === selectedIndex
                  ? 'bg-primary/10 text-foreground'
                  : 'text-foreground-secondary hover:bg-background-soft hover:text-foreground'
              )}
            >
              <span className="font-medium">{suggestion.label}</span>
              <span className="text-xs text-foreground-secondary bg-background-soft px-2 py-0.5 rounded">
                {typeLabels[suggestion.type]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

