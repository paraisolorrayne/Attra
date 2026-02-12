'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
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
  { label: 'Ferrari amarela', query: 'Ferrari amarela' },
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

  const selectClasses = "bg-background border border-border/50 hover:border-border focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5 rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-foreground-secondary/50 focus:outline-none transition-all appearance-none cursor-pointer w-full"
  const inputClasses = "bg-background border border-border/50 hover:border-border focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5 rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-foreground-secondary/50 focus:outline-none transition-all w-full"

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Premium Container - Luxury Dashboard Panel */}
      <div className="bg-background-card/80 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-4 md:p-10 shadow-xl shadow-black/5 border border-border/40">

        {/* Primary CTA - Ver Estoque Completo */}
        <div className="text-center mb-4 md:mb-10">
          <Link
            href="/estoque?ordenar=preco-desc"
            className="group inline-flex items-center justify-center gap-2 md:gap-3 bg-foreground/[0.92] hover:bg-foreground/[0.98] text-background font-normal text-xs md:text-base uppercase tracking-[0.08em] px-6 md:px-12 py-2.5 md:py-3.5 rounded-lg md:rounded-xl transition-all duration-300 ease-out shadow-sm shadow-black/5 hover:shadow-md hover:shadow-black/8 focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:ring-offset-2 focus:ring-offset-background-card w-full md:w-auto"
          >
            Ver Estoque Completo
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Transition Text - Elegant Divider (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-5 mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          <span className="text-foreground-secondary text-sm tracking-wide whitespace-nowrap">
            Ou explore nossa busca personalizada
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        </div>

        {/* Mobile: simple separator line */}
        <div className="md:hidden mb-4">
          <div className="h-px bg-border/30" />
        </div>

        {/* Search Section */}
        <div className="space-y-3 md:space-y-5">
          {/* Desktop: Search + Buscar + Filtros in one line | Mobile: compact stack */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            {/* Search Input with Autocomplete */}
            <div className="relative flex-1">
              <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-foreground-secondary/60 z-10">
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={freeSearch}
                onChange={(e) => setFreeSearch(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar marca, modelo, ano..."
                className="w-full bg-background border border-border/50 hover:border-border focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5 rounded-lg md:rounded-xl pl-10 md:pl-12 pr-9 md:pr-10 py-2.5 md:py-3.5 text-foreground placeholder:text-foreground-secondary/50 focus:outline-none transition-all text-sm"
              />

              {/* Clear button */}
              {freeSearch && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 p-1 md:p-1.5 text-foreground-secondary hover:text-foreground transition-colors"
                  aria-label="Limpar busca"
                >
                  <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              )}

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1.5 md:mt-2 bg-background-card backdrop-blur-xl border border-border/60 rounded-lg md:rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.value}`}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={cn(
                        'w-full px-3 md:px-4 py-2.5 md:py-3 text-left flex items-center justify-between transition-colors text-sm',
                        index === selectedSuggestionIndex
                          ? 'bg-foreground/10 text-foreground'
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

            {/* Mobile: Buscar + Filtros side by side | Desktop: separate buttons */}
            <div className="flex gap-2 md:contents">
              {/* Buscar Button */}
              <button
                onClick={handleSearch}
                className="bg-foreground hover:bg-foreground/90 text-background rounded-lg md:rounded-xl px-4 md:px-6 py-2.5 md:py-3.5 flex-1 md:flex-none flex items-center justify-center gap-2 transition-all font-medium text-sm"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>

              {/* Filtros Button */}
              <button
                onClick={() => setSearchMode(searchMode === 'filters' ? 'free' : 'filters')}
                className={cn(
                  'rounded-lg md:rounded-xl px-3 md:px-5 py-2.5 md:py-3.5 flex items-center justify-center gap-1.5 md:gap-2 transition-all font-medium text-sm border',
                  searchMode === 'filters'
                    ? 'bg-foreground/10 border-foreground/20 text-foreground'
                    : 'bg-transparent border-border/50 text-foreground-secondary hover:text-foreground hover:border-border'
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden md:inline">Filtros</span>
                {searchMode === 'filters' ? <ChevronUp className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              </button>
            </div>
          </div>

          {/* Suggestion Chips - Hidden on mobile, visible on desktop */}
          <div className="hidden md:flex flex-wrap justify-center gap-2.5 pt-1">
            {searchChips.map((chip) => (
              <button
                key={chip.query}
                onClick={() => handleChipClick(chip.query)}
                className="group px-4 py-2 text-sm bg-transparent hover:bg-foreground/[0.03] active:bg-foreground/[0.06] border border-border/40 hover:border-foreground/25 rounded-full text-foreground-secondary hover:text-foreground transition-all duration-200 ease-out"
              >
                <span className="tracking-wide">{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Filters Panel - Expandable with smooth transition */}
          {searchMode === 'filters' && (
            <div className="pt-4 md:pt-6 mt-0.5 md:mt-1 border-t border-border/30 space-y-3 md:space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Primary Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
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

              {/* Advanced Filters Toggle - hidden on mobile */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="hidden md:flex group items-center gap-2 text-sm text-foreground-secondary/70 hover:text-foreground transition-all duration-200 mx-auto py-1"
              >
                <span className="tracking-wide">Filtros avançados</span>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 transition-transform duration-200" />
                ) : (
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                )}
              </button>

              {/* Advanced Filters - Collapsible (desktop only) */}
              {showAdvanced && (
                <div className="hidden md:grid grid-cols-3 gap-3 pt-4 border-t border-border/20 animate-in fade-in slide-in-from-top-1 duration-150">
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

              {/* Result counter - subtle premium indicator */}
              {resultCount !== null && (
                <div className="text-center pt-2 md:pt-4">
                  <span className="text-foreground-secondary/70 text-xs md:text-sm tracking-wide">
                    <span className="text-foreground font-medium tabular-nums">{resultCount}</span> veículos encontrados
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

