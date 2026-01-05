'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Phone,
  Mail,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  X,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClienteWithStats } from '@/types/database'

interface ClientesResponse {
  success: boolean
  data: ClienteWithStats[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface Filters {
  origem: string
  faixaValorMin: string
  faixaValorMax: string
  totalGastoMin: string
  totalGastoMax: string
  atividadeRecente: string
}

const ORIGENS = [
  { value: '', label: 'Todas as origens' },
  { value: 'site', label: 'Site' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'crm_externo', label: 'CRM Externo' }
]

const TOTAL_GASTO_RANGES = [
  { value: '', label: 'Qualquer valor gasto' },
  { value: '0-50000', label: 'R$ 0 - R$ 50.000' },
  { value: '50000-100000', label: 'R$ 50.000 - R$ 100.000' },
  { value: '100000-500000', label: 'R$ 100.000 - R$ 500.000' },
  { value: '500000-', label: 'Acima de R$ 500.000' }
]

const ATIVIDADE_OPTIONS = [
  { value: '', label: 'Qualquer período' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: '180', label: 'Últimos 6 meses' }
]

export default function ClientesPage() {
  const router = useRouter()

  const [clientes, setClientes] = useState<ClienteWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    origem: '',
    faixaValorMin: '',
    faixaValorMax: '',
    totalGastoMin: '',
    totalGastoMax: '',
    atividadeRecente: ''
  })

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      if (search) params.set('search', search)
      if (filters.origem) params.set('origem', filters.origem)
      if (filters.faixaValorMin) params.set('faixa_valor_min', filters.faixaValorMin)
      if (filters.faixaValorMax) params.set('faixa_valor_max', filters.faixaValorMax)
      if (filters.totalGastoMin) params.set('total_gasto_min', filters.totalGastoMin)
      if (filters.totalGastoMax) params.set('total_gasto_max', filters.totalGastoMax)
      if (filters.atividadeRecente) params.set('atividade_recente', filters.atividadeRecente)

      const response = await fetch(`/api/admin/crm/clientes?${params}`)
      const data: ClientesResponse = await response.json()

      if (data.success) {
        setClientes(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch clientes:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, filters])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    // Handle total gasto range parsing
    if (key === 'totalGastoMin' || key === 'totalGastoMax') {
      setFilters(prev => ({ ...prev, [key]: value }))
    } else {
      setFilters(prev => ({ ...prev, [key]: value }))
    }
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleTotalGastoChange = (rangeValue: string) => {
    if (!rangeValue) {
      setFilters(prev => ({ ...prev, totalGastoMin: '', totalGastoMax: '' }))
    } else {
      const [min, max] = rangeValue.split('-')
      setFilters(prev => ({
        ...prev,
        totalGastoMin: min || '',
        totalGastoMax: max || ''
      }))
    }
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      origem: '',
      faixaValorMin: '',
      faixaValorMax: '',
      totalGastoMin: '',
      totalGastoMax: '',
      atividadeRecente: ''
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const formatPrice = (value: number | null | undefined) => {
    if (!value) return 'R$ 0'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getCurrentTotalGastoRange = () => {
    if (filters.totalGastoMin || filters.totalGastoMax) {
      return `${filters.totalGastoMin}-${filters.totalGastoMax}`
    }
    return ''
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-foreground-secondary">Base de clientes e histórico de compras</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-secondary">
            {pagination.total} clientes
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-background-card rounded-xl border border-border p-4 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone, email ou CPF/CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors",
              showFilters || activeFiltersCount > 0
                ? "bg-primary/10 border-primary text-primary"
                : "border-border text-foreground-secondary hover:text-foreground hover:bg-background-soft"
            )}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Buscar
          </button>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Filtros Avançados</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Limpar filtros
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Origem */}
              <div>
                <label className="block text-sm text-foreground-secondary mb-1.5">Origem</label>
                <div className="relative">
                  <select
                    value={filters.origem}
                    onChange={(e) => handleFilterChange('origem', e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground appearance-none cursor-pointer"
                  >
                    {ORIGENS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary pointer-events-none" />
                </div>
              </div>

              {/* Total Gasto */}
              <div>
                <label className="block text-sm text-foreground-secondary mb-1.5">Total Gasto</label>
                <div className="relative">
                  <select
                    value={getCurrentTotalGastoRange()}
                    onChange={(e) => handleTotalGastoChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground appearance-none cursor-pointer"
                  >
                    {TOTAL_GASTO_RANGES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary pointer-events-none" />
                </div>
              </div>

              {/* Atividade Recente */}
              <div>
                <label className="block text-sm text-foreground-secondary mb-1.5">Atividade Recente</label>
                <div className="relative">
                  <select
                    value={filters.atividadeRecente}
                    onChange={(e) => handleFilterChange('atividadeRecente', e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground appearance-none cursor-pointer"
                  >
                    {ATIVIDADE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary pointer-events-none" />
                </div>
              </div>

              {/* Faixa de Valor Preferida */}
              <div>
                <label className="block text-sm text-foreground-secondary mb-1.5">Faixa de Valor Preferida</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.faixaValorMin}
                    onChange={(e) => handleFilterChange('faixaValorMin', e.target.value)}
                    className="w-1/2 px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.faixaValorMax}
                    onChange={(e) => handleFilterChange('faixaValorMax', e.target.value)}
                    className="w-1/2 px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clientes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : clientes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-foreground-secondary">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p>Nenhum cliente encontrado</p>
          </div>
        ) : (
          clientes.map((cliente) => (
            <div
              key={cliente.id}
              onClick={() => router.push(`/admin/crm/clientes/${cliente.id}`)}
              className="bg-background-card rounded-xl border border-border p-4 hover:border-primary/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{cliente.nome}</h3>
                  <p className="text-sm text-foreground-secondary">{cliente.origem_principal || 'Origem não definida'}</p>
                </div>
                {(cliente.lead_count ?? 0) > 0 && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {cliente.lead_count} leads
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {cliente.telefone && (
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <Phone className="w-4 h-4" />
                    <span>{cliente.telefone}</span>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-sm">
                  <ShoppingBag className="w-4 h-4 text-foreground-secondary" />
                  <span className="text-foreground">{cliente.purchase_count || 0} compras</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-foreground font-medium">{formatPrice(cliente.total_spent)}</span>
                </div>
              </div>

              {cliente.last_purchase_date && (
                <p className="text-xs text-foreground-secondary mt-2">
                  Última compra: {formatDate(cliente.last_purchase_date)}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-background-card rounded-xl border border-border px-4 py-3">
          <p className="text-sm text-foreground-secondary">
            Página {pagination.page} de {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-border hover:bg-background-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border border-border hover:bg-background-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

