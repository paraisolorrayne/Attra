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
  Loader2
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

export default function ClientesPage() {
  const router = useRouter()
  
  const [clientes, setClientes] = useState<ClienteWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      if (search) params.set('search', search)

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
  }, [pagination.page, pagination.limit, search])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchClientes()
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

      {/* Search */}
      <div className="bg-background-card rounded-xl border border-border p-4">
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
            type="submit"
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Buscar
          </button>
        </form>
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

