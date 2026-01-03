'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const brands = ['Ferrari', 'Lamborghini', 'Porsche', 'McLaren', 'Audi', 'BMW', 'Mercedes-Benz', 'Cadillac', 'Land Rover']
const years = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018']
const priceRanges = [
  { label: 'Qualquer preço', value: '' },
  { label: 'Até R$ 300 mil', value: '0-300000' },
  { label: 'R$ 300k - 500k', value: '300000-500000' },
  { label: 'R$ 500k - 1M', value: '500000-1000000' },
  { label: 'R$ 1M - 2M', value: '1000000-2000000' },
  { label: 'Acima de R$ 2M', value: '2000000-' },
]

// Popular search chips for quick access
const searchChips = [
  { label: 'Ferrari 488 vermelha', query: 'Ferrari 488 vermelha' },
  { label: 'BMW M3 2024', query: 'BMW M3 2024' },
  { label: 'Porsche conversível', query: 'Porsche conversível' },
  { label: 'Lamborghini Huracan', query: 'Lamborghini Huracan' },
]

// Autocomplete suggestions database
const suggestionDatabase = {
  brands: brands,
  models: ['911', 'Cayenne', 'M3', 'M4', 'M5', 'C63', 'AMG GT', '488', 'F8', 'Huracan', 'Aventador', 'Urus', '720S'],
  categories: ['superesportivo', 'conversível', 'SUV', 'sedan', 'cupê', 'importado', 'premium'],
  years: years,
}

type SearchMode = 'free' | 'filters'

interface Suggestion {
  type: 'brand' | 'model' | 'category' | 'year'
  value: string
  label: string
}

export function HeroSearchWidget() {
  const router = useRouter()
  const [searchMode, setSearchMode] = useState<SearchMode>('free')
  const [freeSearch, setFreeSearch] = useState('')
  const [brand, setBrand] = useState('')
  const [year, setYear] = useState('')
  const [price, setPrice] = useState('')
  const [model, setModel] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Calculate filtered result count (simulated - in production would use real API)
  const [resultCount, setResultCount] = useState<number | null>(null)

  // Generate suggestions based on input
  const generateSuggestions = useCallback((query: string): Suggestion[] => {
    if (!query || query.length < 2) return []

    const lowerQuery = query.toLowerCase()
    const results: Suggestion[] = []

    // Search in brands
    suggestionDatabase.brands.forEach(b => {
      if (b.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'brand', value: b, label: b })
      }
    })

    // Search in models
    suggestionDatabase.models.forEach(m => {
      if (m.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'model', value: m, label: m })
      }
    })

    // Search in categories
    suggestionDatabase.categories.forEach(c => {
      if (c.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'category', value: c, label: c })
      }
    })

    // Search in years
    suggestionDatabase.years.forEach(y => {
      if (y.includes(query)) {
        results.push({ type: 'year', value: y, label: y })
      }
    })

    return results.slice(0, 6) // Limit to 6 suggestions
  }, [])

  // Update suggestions when input changes
  useEffect(() => {
    const newSuggestions = generateSuggestions(freeSearch)
    setSuggestions(newSuggestions)
    setSelectedSuggestionIndex(-1)
  }, [freeSearch, generateSuggestions])

  // Simulated result count update when filters change
  useEffect(() => {
    if (searchMode === 'filters') {
      // Simulate API call delay
      const timer = setTimeout(() => {
        // Generate a realistic number based on filters
        let count = 45 // Base count
        if (brand) count = Math.floor(count * 0.3)
        if (year) count = Math.floor(count * 0.4)
        if (price) count = Math.floor(count * 0.5)
        if (model) count = Math.floor(count * 0.2)
        setResultCount(Math.max(count, 1))
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setResultCount(null)
    }
  }, [searchMode, brand, year, price, model])

  // Close suggestions when clicking outside
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

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (searchMode === 'free') {
      if (freeSearch.trim()) {
        params.set('q', freeSearch.trim())
      }
    } else {
      if (brand) params.set('marca', brand.toLowerCase())
      if (year) params.set('anoMin', year)
      if (price) {
        const [min, max] = price.split('-')
        if (min) params.set('precoMin', min)
        if (max) params.set('precoMax', max)
      }
      if (model) params.set('q', model)
    }

    router.push(`/estoque?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        handleSelectSuggestion(suggestions[selectedSuggestionIndex])
      } else {
        handleSearch()
      }
      setShowSuggestions(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setFreeSearch(suggestion.value)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleChipClick = (query: string) => {
    setFreeSearch(query)
    inputRef.current?.focus()
  }

  const clearSearch = () => {
    setFreeSearch('')
    inputRef.current?.focus()
  }

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'brand': return 'Marca'
      case 'model': return 'Modelo'
      case 'category': return 'Categoria'
      case 'year': return 'Ano'
      default: return ''
    }
  }

  const selectClasses = "bg-background-card border border-border rounded-lg px-4 py-3 text-foreground text-sm placeholder:text-foreground-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer w-full"
  const inputClasses = "bg-background-card border border-border rounded-lg px-4 py-3 text-foreground text-sm placeholder:text-foreground-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all w-full"

  return (
    <div className="bg-background-card/95 backdrop-blur-xl rounded-2xl p-3 sm:p-5 max-w-4xl mx-auto shadow-2xl border border-border">
      {/* Mode Toggle - Enhanced hierarchy, compact on mobile */}
      <div className="flex items-center justify-center gap-1 mb-3 sm:mb-4">
        <button
          onClick={() => setSearchMode('free')}
          className={cn(
            'px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2',
            searchMode === 'free'
              ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
              : 'bg-background-soft text-foreground-secondary hover:text-foreground hover:bg-background border border-border'
          )}
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Busca Livre
        </button>
        <button
          onClick={() => setSearchMode('filters')}
          className={cn(
            'px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2',
            searchMode === 'filters'
              ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
              : 'bg-background-soft text-foreground-secondary hover:text-foreground hover:bg-background border border-border'
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Filtros
        </button>
      </div>

      {/* Free Search Mode - Enhanced & mobile-optimized */}
      {searchMode === 'free' && (
        <div className="space-y-2 sm:space-y-3">
          {/* Search Input with Autocomplete */}
          <div className="relative">
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary z-10">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={freeSearch}
              onChange={(e) => setFreeSearch(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar marca, modelo..."
              className="w-full bg-background border-2 border-primary/50 hover:border-primary focus:border-primary rounded-full pl-10 sm:pl-12 pr-20 sm:pr-32 py-3 sm:py-4 text-foreground placeholder:text-foreground-secondary focus:outline-none transition-all text-sm sm:text-base"
            />

            {/* Clear button - hidden on very small screens */}
            {freeSearch && (
              <button
                onClick={clearSearch}
                className="absolute right-16 sm:right-28 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 text-foreground-secondary hover:text-foreground transition-colors hidden xs:block"
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {/* Search button - compact on mobile */}
            <button
              onClick={handleSearch}
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-hover text-white rounded-full px-3 sm:px-6 py-2 sm:py-2.5 flex items-center gap-1 sm:gap-2 transition-all font-medium hover:shadow-lg hover:shadow-primary/30 text-xs sm:text-base"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Buscar</span>
            </button>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-background-card backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.value}`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={cn(
                      'w-full px-4 py-3 text-left flex items-center justify-between transition-colors',
                      index === selectedSuggestionIndex
                        ? 'bg-primary/20 text-foreground'
                        : 'text-foreground-secondary hover:bg-background-soft hover:text-foreground'
                    )}
                  >
                    <span className="font-medium">{suggestion.label}</span>
                    <span className="text-xs text-foreground-secondary bg-background-soft px-2 py-0.5 rounded">
                      {getSuggestionTypeLabel(suggestion.type)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clickable Search Chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {searchChips.map((chip) => (
              <button
                key={chip.query}
                onClick={() => handleChipClick(chip.query)}
                className="px-3 py-1.5 text-xs sm:text-sm bg-background-soft hover:bg-background border border-border hover:border-primary/50 rounded-full text-foreground-secondary hover:text-foreground transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters Mode - Enhanced slide-down panel */}
      {searchMode === 'filters' && (
        <div className="space-y-4">
          {/* Primary Filters - Always visible */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Brand */}
            <div className="relative">
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className={selectClasses}
              >
                <option value="" className="bg-background text-foreground">Marca</option>
                {brands.map((b) => (
                  <option key={b} value={b} className="bg-background text-foreground">{b}</option>
                ))}
              </select>
            </div>

            {/* Model */}
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Modelo"
              className={inputClasses}
            />

            {/* Price Range */}
            <select
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={selectClasses}
            >
              {priceRanges.map((p) => (
                <option key={p.value} value={p.value} className="bg-background text-foreground">{p.label}</option>
              ))}
            </select>

            {/* Year */}
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={selectClasses}
            >
              <option value="" className="bg-background text-foreground">Ano</option>
              {years.map((y) => (
                <option key={y} value={y} className="bg-background text-foreground">{y}</option>
              ))}
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors mx-auto"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Filtros avançados
          </button>

          {/* Advanced Filters - Collapsible */}
          {showAdvanced && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-border">
              <select className={selectClasses}>
                <option value="" className="bg-background text-foreground">Combustível</option>
                <option value="gasolina" className="bg-background text-foreground">Gasolina</option>
                <option value="flex" className="bg-background text-foreground">Flex</option>
                <option value="eletrico" className="bg-background text-foreground">Elétrico</option>
                <option value="hibrido" className="bg-background text-foreground">Híbrido</option>
              </select>
              <select className={selectClasses}>
                <option value="" className="bg-background text-foreground">Câmbio</option>
                <option value="automatico" className="bg-background text-foreground">Automático</option>
                <option value="manual" className="bg-background text-foreground">Manual</option>
              </select>
              <select className={selectClasses}>
                <option value="" className="bg-background text-foreground">Carroceria</option>
                <option value="sedan" className="bg-background text-foreground">Sedan</option>
                <option value="suv" className="bg-background text-foreground">SUV</option>
                <option value="coupe" className="bg-background text-foreground">Cupê</option>
                <option value="conversivel" className="bg-background text-foreground">Conversível</option>
              </select>
            </div>
          )}

          {/* Search Button with Result Count */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white rounded-xl px-8 py-3.5 flex items-center justify-center gap-2 transition-all font-medium hover:shadow-lg hover:shadow-primary/30"
            >
              <Search className="w-5 h-5" />
              Buscar veículos
            </button>

            {/* Real-time result counter */}
            {resultCount !== null && (
              <span className="text-foreground-secondary text-sm">
                <span className="text-primary font-semibold">{resultCount}</span> veículos encontrados
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

