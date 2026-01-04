'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BoletoWithCliente, StatusBoleto } from '@/types/database'

const statusLabels: Record<StatusBoleto, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  vencido: 'Vencido',
  cancelado: 'Cancelado',
  em_negociacao: 'Em Negociação'
}

const statusColors: Record<StatusBoleto, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  pago: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  vencido: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelado: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  em_negociacao: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
}

const statusIcons: Record<StatusBoleto, React.ElementType> = {
  pendente: Clock,
  pago: CheckCircle,
  vencido: AlertTriangle,
  cancelado: XCircle,
  em_negociacao: DollarSign
}

interface CobrancasResponse {
  success: boolean
  data: BoletoWithCliente[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function CobrancasPage() {
  const router = useRouter()
  
  const [boletos, setBoletos] = useState<BoletoWithCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [statusFilter, setStatusFilter] = useState<StatusBoleto | ''>('')
  const [showFilters, setShowFilters] = useState(false)

  // Summary stats
  const [stats, setStats] = useState({
    pendentes: 0,
    vencidos: 0,
    valorPendente: 0,
    valorVencido: 0
  })

  const fetchBoletos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      if (statusFilter) params.set('status', statusFilter)

      const response = await fetch(`/api/admin/crm/cobrancas?${params}`)
      const data: CobrancasResponse = await response.json()

      if (data.success) {
        setBoletos(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch boletos:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter])

  // Fetch summary stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [paraHoje, emAtraso] = await Promise.all([
          fetch('/api/admin/crm/cobrancas/para-hoje').then(r => r.json()),
          fetch('/api/admin/crm/cobrancas/em-atraso').then(r => r.json())
        ])

        setStats({
          pendentes: paraHoje.total || 0,
          vencidos: emAtraso.total || 0,
          valorPendente: paraHoje.data?.reduce((sum: number, b: { boleto: { valor_total: number } }) => sum + (b.boleto.valor_total || 0), 0) || 0,
          valorVencido: emAtraso.total_valor || 0
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    fetchBoletos()
  }, [fetchBoletos])

  const formatPrice = (value: number | null) => {
    if (!value) return 'R$ 0'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cobranças</h1>
        <p className="text-foreground-secondary">Gestão de boletos e cobranças</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Vencem Hoje</p>
              <p className="text-xl font-bold text-foreground">{stats.pendentes}</p>
            </div>
          </div>
        </div>
        <div className="bg-background-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Em Atraso</p>
              <p className="text-xl font-bold text-foreground">{stats.vencidos}</p>
            </div>
          </div>
        </div>
        <div className="bg-background-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Valor Pendente</p>
              <p className="text-xl font-bold text-foreground">{formatPrice(stats.valorPendente)}</p>
            </div>
          </div>
        </div>
        <div className="bg-background-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Valor em Atraso</p>
              <p className="text-xl font-bold text-foreground">{formatPrice(stats.valorVencido)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              statusFilter === '' ? 'bg-primary text-white' : 'bg-background-soft text-foreground-secondary hover:text-foreground'
            )}
          >
            Todos
          </button>
          {Object.entries(statusLabels).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value as StatusBoleto)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                statusFilter === value ? 'bg-primary text-white' : 'bg-background-soft text-foreground-secondary hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Boletos Table */}
      <div className="bg-background-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : boletos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-foreground-secondary">
            <CheckCircle className="w-12 h-12 mb-4" />
            <p>Nenhum boleto encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-soft border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Cliente</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Descrição</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Valor</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Vencimento</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Atraso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {boletos.map((boleto) => {
                  const StatusIcon = statusIcons[boleto.status]
                  return (
                    <tr
                      key={boleto.id}
                      onClick={() => router.push(`/admin/crm/cobrancas/${boleto.id}`)}
                      className="hover:bg-background-soft cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{boleto.cliente?.nome || 'Cliente não identificado'}</p>
                        <p className="text-sm text-foreground-secondary">{boleto.cliente?.telefone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground">{boleto.descricao || boleto.identificador_externo}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{formatPrice(boleto.valor_total)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-foreground-secondary" />
                          <span className="text-foreground">{formatDate(boleto.data_vencimento)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusColors[boleto.status])}>
                          <StatusIcon className="w-3 h-3" />
                          {statusLabels[boleto.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {boleto.dias_em_atraso && boleto.dias_em_atraso > 0 ? (
                          <span className="text-red-500 font-medium">{boleto.dias_em_atraso} dias</span>
                        ) : (
                          <span className="text-foreground-secondary">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
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

