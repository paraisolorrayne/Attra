'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  CreditCard,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Boleto, Cliente, EventoBoleto, StatusBoleto, EventoBoletoTipo } from '@/types/database'

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

const eventoLabels: Record<EventoBoletoTipo, string> = {
  envio: 'Envio',
  lembrete: 'Lembrete',
  cobranca: 'Cobrança',
  promessa_pagamento: 'Promessa de Pagamento',
  pagamento_parcial: 'Pagamento Parcial',
  pagamento_total: 'Pagamento Total',
  cancelamento: 'Cancelamento',
  negociacao: 'Negociação',
  observacao: 'Observação'
}

const eventoIcons: Record<EventoBoletoTipo, React.ElementType> = {
  envio: Receipt,
  lembrete: Clock,
  cobranca: Phone,
  promessa_pagamento: Calendar,
  pagamento_parcial: CreditCard,
  pagamento_total: CheckCircle,
  cancelamento: AlertTriangle,
  negociacao: MessageSquare,
  observacao: MessageSquare
}

interface BoletoDetailResponse {
  success: boolean
  data: Boleto & {
    cliente: Cliente | null
    eventos: EventoBoleto[]
  }
}

export default function BoletoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const [boleto, setBoleto] = useState<BoletoDetailResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)

  const [newEvent, setNewEvent] = useState({
    tipo: 'lembrete' as EventoBoletoTipo,
    descricao: '',
    valor_negociado: ''
  })

  useEffect(() => {
    fetchBoleto()
  }, [id])

  const fetchBoleto = async () => {
    try {
      const response = await fetch(`/api/admin/crm/cobrancas/${id}`)
      const data: BoletoDetailResponse = await response.json()

      if (data.success) {
        setBoleto(data.data)
      } else {
        setError('Boleto não encontrado')
      }
    } catch (err) {
      setError('Erro ao carregar boleto')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: StatusBoleto) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/crm/cobrancas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchBoleto()
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setSaving(false)
    }
  }

  const createEvent = async () => {
    if (!newEvent.descricao.trim()) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/crm/cobrancas/${id}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEvent,
          valor_negociado: newEvent.valor_negociado ? parseFloat(newEvent.valor_negociado) : null
        })
      })

      if (response.ok) {
        await fetchBoleto()
        setShowEventModal(false)
        setNewEvent({ tipo: 'lembrete', descricao: '', valor_negociado: '' })
      }
    } catch (err) {
      console.error('Failed to create event:', err)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatPrice = (value: number | null) => {
    if (!value) return 'R$ 0'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getDaysUntilDue = () => {
    if (!boleto?.data_vencimento) return 0
    const today = new Date()
    const due = new Date(boleto.data_vencimento)
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !boleto) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-foreground-secondary">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>{error || 'Boleto não encontrado'}</p>
        <Link href="/admin/crm/cobrancas" className="mt-4 text-primary hover:underline">
          Voltar para Cobranças
        </Link>
      </div>
    )
  }

  const daysUntilDue = getDaysUntilDue()

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
            <h1 className="text-2xl font-bold text-foreground">
              {boleto.descricao || boleto.identificador_externo}
            </h1>
            <p className="text-foreground-secondary">
              {boleto.cliente?.nome || 'Cliente não vinculado'}
            </p>
          </div>
        </div>
        <div className={cn('px-4 py-2 rounded-full text-sm font-medium', statusColors[boleto.status])}>
          {statusLabels[boleto.status]}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Value Card */}
          <div className="bg-background-card rounded-xl border border-border p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-background-soft rounded-lg">
                <p className="text-sm text-foreground-secondary">Valor Total</p>
                <p className="text-2xl font-bold text-foreground">{formatPrice(boleto.valor_total)}</p>
              </div>
              <div className="text-center p-4 bg-background-soft rounded-lg">
                <p className="text-sm text-foreground-secondary">Valor Pago</p>
                <p className="text-2xl font-bold text-green-500">{formatPrice(boleto.valor_pago)}</p>
              </div>
              <div className="text-center p-4 bg-background-soft rounded-lg">
                <p className="text-sm text-foreground-secondary">Pendente</p>
                <p className="text-2xl font-bold text-red-500">
                  {formatPrice((boleto.valor_total || 0) - (boleto.valor_pago || 0))}
                </p>
              </div>
              <div className="text-center p-4 bg-background-soft rounded-lg">
                <p className="text-sm text-foreground-secondary">Vencimento</p>
                <p className={cn(
                  'text-lg font-bold',
                  daysUntilDue < 0 ? 'text-red-500' : daysUntilDue <= 3 ? 'text-yellow-500' : 'text-foreground'
                )}>
                  {formatDate(boleto.data_vencimento)}
                </p>
                <p className={cn(
                  'text-xs',
                  daysUntilDue < 0 ? 'text-red-500' : daysUntilDue <= 3 ? 'text-yellow-500' : 'text-foreground-secondary'
                )}>
                  {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} dias em atraso` :
                   daysUntilDue === 0 ? 'Vence hoje' :
                   `${daysUntilDue} dias restantes`}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-background-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Detalhes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background-soft rounded-lg">
                  <Receipt className="w-5 h-5 text-foreground-secondary" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Identificador</p>
                  <p className="text-foreground font-mono">{boleto.identificador_externo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background-soft rounded-lg">
                  <Calendar className="w-5 h-5 text-foreground-secondary" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Data Emissão</p>
                  <p className="text-foreground">{formatDate(boleto.data_emissao)}</p>
                </div>
              </div>
              {boleto.cliente && (
                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="p-2 bg-background-soft rounded-lg">
                    <User className="w-5 h-5 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Cliente</p>
                    <Link href={`/admin/crm/clientes/${boleto.cliente.id}`} className="text-primary hover:underline">
                      {boleto.cliente.nome}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-background-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Histórico de Cobrança</h2>
              <button
                onClick={() => setShowEventModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Registrar Ação
              </button>
            </div>

            {boleto.eventos.length === 0 ? (
              <p className="text-foreground-secondary text-center py-8">Nenhuma ação registrada</p>
            ) : (
              <div className="space-y-4">
                {boleto.eventos.map((evento, index) => {
                  const Icon = eventoIcons[evento.tipo] || MessageSquare
                  return (
                    <div key={evento.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          evento.tipo === 'pagamento_total' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                          evento.tipo === 'cancelamento' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                          'bg-primary/10 text-primary'
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {index < boleto.eventos.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">{eventoLabels[evento.tipo]}</p>
                            <p className="text-sm text-foreground-secondary">{evento.descricao}</p>
                            {evento.valor_negociado && (
                              <p className="text-sm text-primary mt-1">
                                Valor negociado: {formatPrice(evento.valor_negociado)}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-foreground-secondary whitespace-nowrap ml-4">
                            {formatDateTime(evento.criado_em)}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-foreground-secondary">por {evento.responsavel}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Change */}
          <div className="bg-background-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Alterar Status</h2>
            <div className="space-y-2">
              {Object.entries(statusLabels).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status as StatusBoleto)}
                  disabled={boleto.status === status || saving}
                  className={cn(
                    'w-full px-4 py-2 rounded-lg text-left transition-colors disabled:opacity-50',
                    boleto.status === status
                      ? statusColors[status as StatusBoleto]
                      : 'bg-background-soft text-foreground-secondary hover:bg-background hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          {boleto.cliente && (
            <div className="bg-background-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
              <div className="space-y-2">
                <a
                  href={`https://wa.me/55${boleto.cliente.telefone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Olá ${boleto.cliente.nome.split(' ')[0]}, estamos entrando em contato referente ao boleto ${boleto.identificador_externo} no valor de ${formatPrice(boleto.valor_total)}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Cobrar via WhatsApp</span>
                </a>
                <a
                  href={`tel:${boleto.cliente.telefone}`}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-background-soft text-foreground rounded-lg hover:bg-background transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>Ligar</span>
                </a>
                <a
                  href={`mailto:${boleto.cliente.email}?subject=Boleto ${boleto.identificador_externo}`}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-background-soft text-foreground rounded-lg hover:bg-background transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>Enviar Email</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background-card rounded-xl border border-border p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-foreground mb-4">Registrar Ação</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Tipo de Ação</label>
                <select
                  value={newEvent.tipo}
                  onChange={(e) => setNewEvent({ ...newEvent, tipo: e.target.value as EventoBoletoTipo })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                >
                  {Object.entries(eventoLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Descrição</label>
                <textarea
                  value={newEvent.descricao}
                  onChange={(e) => setNewEvent({ ...newEvent, descricao: e.target.value })}
                  placeholder="Descreva a ação realizada..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground resize-none"
                />
              </div>

              {(newEvent.tipo === 'negociacao' || newEvent.tipo === 'promessa_pagamento') && (
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-1">Valor Negociado</label>
                  <input
                    type="number"
                    value={newEvent.valor_negociado}
                    onChange={(e) => setNewEvent({ ...newEvent, valor_negociado: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-foreground-secondary hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createEvent}
                disabled={saving || !newEvent.descricao.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

