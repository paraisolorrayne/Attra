'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeadWithCliente, StatusLead, PrioridadeLead } from '@/types/database'

const statusLabels: Record<StatusLead, string> = {
  novo: 'Novo',
  em_atendimento: 'Em Atendimento',
  aguardando_cliente: 'Aguardando Cliente',
  ganho: 'Ganho',
  perdido: 'Perdido'
}

const statusColors: Record<StatusLead, string> = {
  novo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  em_atendimento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  aguardando_cliente: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  ganho: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  perdido: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

const prioridadeColors: Record<PrioridadeLead, string> = {
  baixa: 'text-gray-500',
  media: 'text-yellow-500',
  alta: 'text-red-500'
}

interface LeadsResponse {
  success: boolean
  data: LeadWithCliente[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function LeadsContent() {
  const router = useRouter()

  const [leads, setLeads] = useState<LeadWithCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusLead | ''>('')
  const [prioridadeFilter, setPrioridadeFilter] = useState<PrioridadeLead | ''>('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (prioridadeFilter) params.set('prioridade', prioridadeFilter)

      const response = await fetch(`/api/admin/crm/leads?${params}`)
      const data: LeadsResponse = await response.json()

      if (data.success) {
        setLeads(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, statusFilter, prioridadeFilter])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchLeads()
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  const formatPrice = (value: number | null) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-foreground-secondary">Gerencie seus leads e oportunidades</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-secondary">
            {pagination.total} leads encontrados
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-background-card rounded-xl border border-border p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors',
              showFilters
                ? 'bg-primary text-white border-primary'
                : 'border-border text-foreground-secondary hover:bg-background-soft'
            )}
          >
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Buscar
          </button>
        </form>

        {/* Filter options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusLead | '')}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              >
                <option value="">Todos</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-1">Prioridade</label>
              <select
                value={prioridadeFilter}
                onChange={(e) => setPrioridadeFilter(e.target.value as PrioridadeLead | '')}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              >
                <option value="">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('')
                  setPrioridadeFilter('')
                  setSearch('')
                }}
                className="px-4 py-2 text-foreground-secondary hover:text-foreground transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-background-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-foreground-secondary">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p>Nenhum lead encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-soft border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Lead</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Contato</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Interesse</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Próx. Contato</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Criado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => router.push(`/admin/crm/leads/${lead.id}`)}
                    className="hover:bg-background-soft cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-2 h-2 rounded-full', prioridadeColors[lead.prioridade])} />
                        <div>
                          <p className="font-medium text-foreground">{lead.nome}</p>
                          <p className="text-sm text-foreground-secondary">{lead.origem}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {lead.telefone && (
                          <div className="flex items-center gap-1 text-sm text-foreground-secondary">
                            <Phone className="w-3 h-3" />
                            <span>{lead.telefone}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1 text-sm text-foreground-secondary">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{lead.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-foreground">
                          {lead.marca_interesse} {lead.modelo_interesse}
                        </p>
                        <p className="text-sm text-foreground-secondary">
                          {formatPrice(lead.faixa_preco_interesse_min)} - {formatPrice(lead.faixa_preco_interesse_max)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[lead.status])}>
                        {statusLabels[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {lead.proximo_contato ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-primary" />
                          <span className="text-foreground">{formatDate(lead.proximo_contato)}</span>
                        </div>
                      ) : (
                        <span className="text-foreground-secondary text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">
                      {formatDate(lead.criado_em)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
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
    </div>
  )
}

export default function LeadsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LeadsContent />
    </Suspense>
  )
}
