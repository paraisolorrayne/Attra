'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  Tag,
  Users,
  Loader2,
  BarChart3,
  PieChart
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FaixaValor {
  faixa: string
  quantidade: number
  percentual: number
}

interface CategoriasMarcas {
  nome: string
  quantidade: number
  percentual: number
}

interface ClienteQuente {
  cliente: {
    id: string
    nome: string
    telefone: string
    email: string
  }
  stats: {
    score: number
    leads_recentes: number
    leads_alta_prioridade: number
    boletos_pagos: number
    total_pago: number
    interesse_maximo: number
  }
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  
  const [faixasValor, setFaixasValor] = useState<{
    faixas: FaixaValor[]
    total_leads: number
    tipos_interesse: { comprar: number; vender: number; ambos: number }
    media_faixa: { min: number; max: number }
  } | null>(null)

  const [categoriasMarcas, setCategoriasMarcas] = useState<{
    categorias: CategoriasMarcas[]
    marcas: CategoriasMarcas[]
    modelos_mais_procurados: CategoriasMarcas[]
    total_leads: number
  } | null>(null)

  const [clientesQuentes, setClientesQuentes] = useState<ClienteQuente[]>([])

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true)
      try {
        const [faixas, catMarcas, quentes] = await Promise.all([
          fetch(`/api/admin/crm/insights/faixas-valor?days=${days}`).then(r => r.json()),
          fetch(`/api/admin/crm/insights/categorias-marcas?days=${days}`).then(r => r.json()),
          fetch('/api/admin/crm/insights/clientes-quentes?limit=10').then(r => r.json())
        ])

        if (faixas.success) setFaixasValor(faixas.data)
        if (catMarcas.success) setCategoriasMarcas(catMarcas.data)
        if (quentes.success) setClientesQuentes(quentes.data)
      } catch (error) {
        console.error('Failed to fetch insights:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [days])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insights</h1>
          <p className="text-foreground-secondary">Análise de leads e comportamento de clientes</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-secondary">Período:</span>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 bg-background border border-border rounded-lg text-foreground"
          >
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={60}>60 dias</option>
            <option value={90}>90 dias</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Total de Leads</p>
              <p className="text-xl font-bold text-foreground">{faixasValor?.total_leads || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-background-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Interesse em Comprar</p>
              <p className="text-xl font-bold text-foreground">{faixasValor?.tipos_interesse.comprar || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-background-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Faixa Média</p>
              <p className="text-lg font-bold text-foreground">
                {formatPrice(faixasValor?.media_faixa.min || 0)} - {formatPrice(faixasValor?.media_faixa.max || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-background-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Marcas Diferentes</p>
              <p className="text-xl font-bold text-foreground">{categoriasMarcas?.marcas.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Ranges */}
        <div className="bg-background-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Faixas de Preço</h2>
          </div>
          <div className="space-y-3">
            {faixasValor?.faixas.map((faixa, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-foreground">{faixa.faixa}</span>
                  <span className="text-foreground-secondary">{faixa.quantidade} ({faixa.percentual}%)</span>
                </div>
                <div className="h-2 bg-background-soft rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${faixa.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Brands */}
        <div className="bg-background-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Marcas Mais Procuradas</h2>
          </div>
          <div className="space-y-3">
            {categoriasMarcas?.marcas.slice(0, 8).map((marca, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {index + 1}
                  </span>
                  <span className="text-foreground capitalize">{marca.nome}</span>
                </div>
                <span className="text-foreground-secondary">{marca.quantidade} leads</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Models */}
        <div className="bg-background-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Modelos Mais Procurados</h2>
          </div>
          <div className="space-y-2">
            {categoriasMarcas?.modelos_mais_procurados.slice(0, 8).map((modelo, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-foreground capitalize">{modelo.nome}</span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {modelo.quantidade} leads
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hot Customers */}
        <div className="bg-background-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Clientes Quentes</h2>
          </div>
          <div className="space-y-3">
            {clientesQuentes.slice(0, 6).map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{item.cliente.nome}</p>
                  <p className="text-sm text-foreground-secondary">
                    {item.stats.leads_recentes} leads • {item.stats.boletos_pagos} pagos
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">Score: {item.stats.score}</p>
                  {item.stats.total_pago > 0 && (
                    <p className="text-sm text-green-500">{formatPrice(item.stats.total_pago)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

