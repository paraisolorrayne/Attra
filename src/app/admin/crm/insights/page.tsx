'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  Tag,
  Users,
  Loader2,
  BarChart3,
  PieChart,
  UserCheck,
  Target,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Periodo = 'mensal' | 'trimestral' | 'semestral' | 'anual'

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

interface VendaVendedor {
  vendedor: string
  total_vendas: number
  valor_total: number
  ticket_medio: number
  percentual: number
}

interface VendasData {
  periodo: string
  resumo: {
    total_vendas: number
    valor_total: number
    ticket_medio: number
    total_vendedores: number
  }
  por_vendedor: VendaVendedor[]
  por_mes: { mes: string; total_vendas: number; valor_total: number }[]
}

interface ConversaoData {
  periodo: string
  resumo: {
    total_leads: number
    taxa_conversao: number
    leads_ganhos: number
    leads_perdidos: number
    leads_em_andamento: number
  }
  por_status: { status: string; quantidade: number }[]
  por_origem: { origem: string; quantidade: number }[]
  evolucao_mensal: { mes: string; total: number }[]
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'leads' | 'vendas'>('vendas')
  const [periodo, setPeriodo] = useState<Periodo>('anual')
  const [days, setDays] = useState(90)

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
  const [vendasData, setVendasData] = useState<VendasData | null>(null)
  const [conversaoData, setConversaoData] = useState<ConversaoData | null>(null)

  // Map periodo to days for legacy APIs
  useEffect(() => {
    switch (periodo) {
      case 'mensal': setDays(30); break
      case 'trimestral': setDays(90); break
      case 'semestral': setDays(180); break
      case 'anual': setDays(365); break
    }
  }, [periodo])

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true)
      try {
        const [faixas, catMarcas, quentes, vendas, conversao] = await Promise.all([
          fetch(`/api/admin/crm/insights/faixas-valor?days=${days}`).then(r => r.json()),
          fetch(`/api/admin/crm/insights/categorias-marcas?days=${days}`).then(r => r.json()),
          fetch('/api/admin/crm/insights/clientes-quentes?limit=10').then(r => r.json()),
          fetch(`/api/admin/crm/insights/vendas-vendedor?periodo=${periodo}`).then(r => r.json()),
          fetch(`/api/admin/crm/insights/conversao-leads?periodo=${periodo}`).then(r => r.json())
        ])

        if (faixas.success) setFaixasValor(faixas.data)
        if (catMarcas.success) setCategoriasMarcas(catMarcas.data)
        if (quentes.success) setClientesQuentes(quentes.data)
        if (vendas.success) setVendasData(vendas.data)
        if (conversao.success) setConversaoData(conversao.data)
      } catch (error) {
        console.error('Failed to fetch insights:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [days, periodo])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatMes = (mes: string) => {
    const [ano, mesNum] = mes.split('-')
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${meses[parseInt(mesNum) - 1]}/${ano.slice(2)}`
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
          <p className="text-foreground-secondary">Análise de leads, vendas e comportamento de clientes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-background-card border border-border rounded-lg p-1">
            {(['mensal', 'trimestral', 'semestral', 'anual'] as Periodo[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  periodo === p
                    ? "bg-primary text-white"
                    : "text-foreground-secondary hover:text-foreground hover:bg-background-soft"
                )}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('vendas')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === 'vendas'
              ? "border-primary text-primary"
              : "border-transparent text-foreground-secondary hover:text-foreground"
          )}
        >
          <DollarSign className="w-4 h-4 inline-block mr-2" />
          Vendas & Vendedores
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === 'leads'
              ? "border-primary text-primary"
              : "border-transparent text-foreground-secondary hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4 inline-block mr-2" />
          Leads & Conversão
        </button>
      </div>

      {/* Tab Content: Vendas & Vendedores */}
      {activeTab === 'vendas' && (
        <>
          {/* Summary Cards - Vendas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-background-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Total em Vendas</p>
                  <p className="text-xl font-bold text-foreground">{formatPrice(vendasData?.resumo.valor_total || 0)}</p>
                </div>
              </div>
            </div>
            <div className="bg-background-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Vendas Realizadas</p>
                  <p className="text-xl font-bold text-foreground">{vendasData?.resumo.total_vendas || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-background-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Ticket Médio</p>
                  <p className="text-xl font-bold text-foreground">{formatPrice(vendasData?.resumo.ticket_medio || 0)}</p>
                </div>
              </div>
            </div>
            <div className="bg-background-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Vendedores Ativos</p>
                  <p className="text-xl font-bold text-foreground">{vendasData?.resumo.total_vendedores || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid - Vendas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance por Vendedor */}
            <div className="bg-background-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Performance por Vendedor</h2>
              </div>
              <div className="space-y-3">
                {vendasData?.por_vendedor.slice(0, 8).map((v, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {index + 1}
                        </span>
                        <span className="text-foreground">{v.vendedor}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-foreground font-medium">{v.total_vendas} vendas</span>
                        <span className="text-foreground-secondary ml-2">({v.percentual}%)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-background-soft rounded-full overflow-hidden ml-8">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${v.percentual}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-foreground-secondary mt-1 ml-8">
                      <span>Total: {formatPrice(v.valor_total)}</span>
                      <span>Ticket: {formatPrice(v.ticket_medio)}</span>
                    </div>
                  </div>
                ))}
                {(!vendasData?.por_vendedor || vendasData.por_vendedor.length === 0) && (
                  <p className="text-center text-foreground-secondary py-4">Nenhuma venda no período</p>
                )}
              </div>
            </div>

            {/* Evolução Mensal */}
            <div className="bg-background-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Evolução Mensal</h2>
              </div>
              <div className="space-y-3">
                {vendasData?.por_mes.map((m, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-foreground font-medium">{formatMes(m.mes)}</span>
                    <div className="text-right">
                      <span className="text-foreground">{m.total_vendas} vendas</span>
                      <span className="text-green-500 ml-3">{formatPrice(m.valor_total)}</span>
                    </div>
                  </div>
                ))}
                {(!vendasData?.por_mes || vendasData.por_mes.length === 0) && (
                  <p className="text-center text-foreground-secondary py-4">Nenhum dado disponível</p>
                )}
              </div>
            </div>

            {/* Top Brands */}
            <div className="bg-background-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Marcas Mais Vendidas</h2>
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
                    <span className="text-foreground-secondary">{marca.quantidade} vendas</span>
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
        </>
      )}

      {/* Tab Content: Leads & Conversão */}
      {activeTab === 'leads' && (
        <>
          {/* Summary Cards - Leads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-background-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Total de Leads</p>
                  <p className="text-xl font-bold text-foreground">{conversaoData?.resumo.total_leads || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-background-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Taxa de Conversão</p>
                  <p className="text-xl font-bold text-foreground">{conversaoData?.resumo.taxa_conversao || 0}%</p>
                </div>
              </div>
            </div>
            <div className="bg-background-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Leads Ganhos</p>
                  <p className="text-xl font-bold text-foreground">{conversaoData?.resumo.leads_ganhos || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-background-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Em Andamento</p>
                  <p className="text-xl font-bold text-foreground">{conversaoData?.resumo.leads_em_andamento || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid - Leads */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Por Status */}
            <div className="bg-background-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Leads por Status</h2>
              </div>
              <div className="space-y-3">
                {conversaoData?.por_status.map((s, index) => {
                  const total = conversaoData.resumo.total_leads || 1
                  const perc = Math.round((s.quantidade / total) * 100)
                  const colors: Record<string, string> = {
                    'Novo': 'bg-blue-500',
                    'Em Atendimento': 'bg-yellow-500',
                    'Concluído': 'bg-gray-500',
                    'Ganho': 'bg-green-500',
                    'Perdido': 'bg-red-500'
                  }
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{s.status}</span>
                        <span className="text-foreground-secondary">{s.quantidade} ({perc}%)</span>
                      </div>
                      <div className="h-2 bg-background-soft rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", colors[s.status] || 'bg-primary')}
                          style={{ width: `${perc}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Por Origem */}
            <div className="bg-background-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Leads por Origem</h2>
              </div>
              <div className="space-y-3">
                {conversaoData?.por_origem.slice(0, 6).map((o, index) => {
                  const origemLabels: Record<string, string> = {
                    'site_chat': 'Chat do Site',
                    'whatsapp_ia': 'WhatsApp IA',
                    'instagram_form': 'Instagram',
                    'crm_externo': 'CRM Externo'
                  }
                  return (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-foreground">{origemLabels[o.origem] || o.origem}</span>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {o.quantidade} leads
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Evolução Mensal Leads */}
            <div className="bg-background-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Leads por Mês</h2>
              </div>
              <div className="space-y-3">
                {conversaoData?.evolucao_mensal.map((m, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-foreground font-medium">{formatMes(m.mes)}</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      {m.total} leads
                    </span>
                  </div>
                ))}
                {(!conversaoData?.evolucao_mensal || conversaoData.evolucao_mensal.length === 0) && (
                  <p className="text-center text-foreground-secondary py-4">Nenhum dado disponível</p>
                )}
              </div>
            </div>

            {/* Faixas de Valor */}
            <div className="bg-background-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Interesse por Faixa de Valor</h2>
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
          </div>
        </>
      )}
    </div>
  )
}
