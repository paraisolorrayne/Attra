'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Phone,
  Mail,
  User,
  Calendar,
  ShoppingBag,
  Receipt,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit2,
  Loader2,
  AlertCircle,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Cliente, Lead, HistoricoCompra, Boleto, StatusLead, StatusBoleto } from '@/types/database'

const statusLeadLabels: Record<StatusLead, string> = {
  novo: 'Novo',
  em_atendimento: 'Em Atendimento',
  concluido: 'Concluído',
  ganho: 'Ganho',
  perdido: 'Perdido'
}

const statusLeadColors: Record<StatusLead, string> = {
  novo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  em_atendimento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  concluido: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  ganho: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  perdido: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

const statusBoletoColors: Record<StatusBoleto, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  pago: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  vencido: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelado: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  em_negociacao: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
}

interface ClienteDetailResponse {
  success: boolean
  data: Cliente & {
    historico_compras: HistoricoCompra[]
    leads: Lead[]
    boletos: Boleto[]
    stats: {
      total_compras: number
      total_gasto: number
      total_leads: number
      boletos_pendentes: number
      valor_pendente: number
    }
  }
}

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const [cliente, setCliente] = useState<ClienteDetailResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'compras' | 'leads' | 'boletos'>('compras')

  useEffect(() => {
    fetchCliente()
  }, [id])

  const fetchCliente = async () => {
    try {
      const response = await fetch(`/api/admin/crm/clientes/${id}`)
      const data: ClienteDetailResponse = await response.json()

      if (data.success) {
        setCliente(data.data)
      } else {
        setError('Cliente não encontrado')
      }
    } catch (err) {
      setError('Erro ao carregar cliente')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatPrice = (value: number | null | undefined) => {
    if (!value) return 'R$ 0'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-foreground-secondary">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>{error || 'Cliente não encontrado'}</p>
        <Link href="/admin/crm/clientes" className="mt-4 text-primary hover:underline">
          Voltar para Clientes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-border hover:bg-background-soft transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{cliente.nome}</h1>
            <p className="text-foreground-secondary">Cliente desde {formatDate(cliente.criado_em)}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Total Gasto</p>
              <p className="text-xl font-bold text-foreground">{formatPrice(cliente.stats.total_gasto)}</p>
            </div>
          </div>
        </div>
        <div className="bg-background-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Compras</p>
              <p className="text-xl font-bold text-foreground">{cliente.stats.total_compras}</p>
            </div>
          </div>
        </div>
        <div className="bg-background-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Leads</p>
              <p className="text-xl font-bold text-foreground">{cliente.stats.total_leads}</p>
            </div>
          </div>
        </div>
        <div className="bg-background-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Pendente</p>
              <p className="text-xl font-bold text-foreground">{formatPrice(cliente.stats.valor_pendente)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-background-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Informações de Contato</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cliente.telefone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background-soft rounded-lg">
                    <Phone className="w-5 h-5 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Telefone</p>
                    <a href={`tel:${cliente.telefone}`} className="text-foreground hover:text-primary">
                      {cliente.telefone}
                    </a>
                  </div>
                </div>
              )}
              {cliente.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background-soft rounded-lg">
                    <Mail className="w-5 h-5 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Email</p>
                    <a href={`mailto:${cliente.email}`} className="text-foreground hover:text-primary">
                      {cliente.email}
                    </a>
                  </div>
                </div>
              )}
              {cliente.cpf_cnpj && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background-soft rounded-lg">
                    <Tag className="w-5 h-5 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">CPF/CNPJ</p>
                    <p className="text-foreground">{cliente.cpf_cnpj}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background-soft rounded-lg">
                  <User className="w-5 h-5 text-foreground-secondary" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Origem</p>
                  <p className="text-foreground">{cliente.origem_principal || 'Não definida'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-background-card rounded-xl border border-border overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('compras')}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'compras' ? 'bg-primary text-white' : 'text-foreground-secondary hover:text-foreground'
                )}
              >
                Histórico de Compras ({cliente.historico_compras.length})
              </button>
              <button
                onClick={() => setActiveTab('leads')}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'leads' ? 'bg-primary text-white' : 'text-foreground-secondary hover:text-foreground'
                )}
              >
                Leads ({cliente.leads.length})
              </button>
              <button
                onClick={() => setActiveTab('boletos')}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'boletos' ? 'bg-primary text-white' : 'text-foreground-secondary hover:text-foreground'
                )}
              >
                Boletos ({cliente.boletos.length})
              </button>
            </div>

            <div className="p-4">
              {/* Purchase History */}
              {activeTab === 'compras' && (
                cliente.historico_compras.length === 0 ? (
                  <p className="text-center text-foreground-secondary py-8">Nenhuma compra registrada</p>
                ) : (
                  <div className="space-y-3">
                    {cliente.historico_compras.map((compra) => (
                      <div key={compra.id} className="flex items-center justify-between p-3 bg-background-soft rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{compra.descricao || 'Compra'}</p>
                          <p className="text-sm text-foreground-secondary">{formatDate(compra.data_compra)}</p>
                        </div>
                        <p className="font-bold text-green-500">{formatPrice(compra.valor_compra)}</p>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Leads */}
              {activeTab === 'leads' && (
                cliente.leads.length === 0 ? (
                  <p className="text-center text-foreground-secondary py-8">Nenhum lead registrado</p>
                ) : (
                  <div className="space-y-3">
                    {cliente.leads.map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/admin/crm/leads/${lead.id}`}
                        className="flex items-center justify-between p-3 bg-background-soft rounded-lg hover:bg-background transition-colors"
                      >
                        <div>
                          <p className="font-medium text-foreground">{lead.nome}</p>
                          <p className="text-sm text-foreground-secondary">{lead.origem} • {formatDate(lead.criado_em)}</p>
                        </div>
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusLeadColors[lead.status])}>
                          {statusLeadLabels[lead.status]}
                        </span>
                      </Link>
                    ))}
                  </div>
                )
              )}

              {/* Boletos */}
              {activeTab === 'boletos' && (
                cliente.boletos.length === 0 ? (
                  <p className="text-center text-foreground-secondary py-8">Nenhum boleto registrado</p>
                ) : (
                  <div className="space-y-3">
                    {cliente.boletos.map((boleto) => (
                      <Link
                        key={boleto.id}
                        href={`/admin/crm/cobrancas/${boleto.id}`}
                        className="flex items-center justify-between p-3 bg-background-soft rounded-lg hover:bg-background transition-colors"
                      >
                        <div>
                          <p className="font-medium text-foreground">{boleto.descricao || boleto.identificador_externo}</p>
                          <p className="text-sm text-foreground-secondary">Vence em {formatDate(boleto.data_vencimento)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">{formatPrice(boleto.valor_total)}</p>
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusBoletoColors[boleto.status])}>
                            {boleto.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preferences */}
          <div className="bg-background-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Preferências</h2>
            <div className="space-y-4">
              {(cliente.faixa_valor_preferida_min || cliente.faixa_valor_preferida_max) && (
                <div>
                  <p className="text-sm text-foreground-secondary">Faixa de Valor</p>
                  <p className="text-foreground">
                    {formatPrice(cliente.faixa_valor_preferida_min)} - {formatPrice(cliente.faixa_valor_preferida_max)}
                  </p>
                </div>
              )}
              {cliente.tipos_preferidos && cliente.tipos_preferidos.length > 0 && (
                <div>
                  <p className="text-sm text-foreground-secondary">Tipos Preferidos</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cliente.tipos_preferidos.map((tipo, i) => (
                      <span key={i} className="px-2 py-1 bg-background-soft rounded text-sm text-foreground">
                        {tipo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {cliente.marcas_preferidas && cliente.marcas_preferidas.length > 0 && (
                <div>
                  <p className="text-sm text-foreground-secondary">Marcas Preferidas</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cliente.marcas_preferidas.map((marca, i) => (
                      <span key={i} className="px-2 py-1 bg-background-soft rounded text-sm text-foreground">
                        {marca}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-background-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
            <div className="space-y-2">
              <a
                href={`https://wa.me/55${cliente.telefone?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`mailto:${cliente.email}`}
                className="flex items-center gap-3 w-full px-4 py-3 bg-background-soft text-foreground rounded-lg hover:bg-background transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>Enviar Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

