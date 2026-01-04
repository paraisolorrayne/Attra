'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  Tag,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  Edit2,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lead, Cliente, EventoLead, StatusLead, PrioridadeLead, EventoLeadTipo } from '@/types/database'

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

const prioridadeLabels: Record<PrioridadeLead, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta'
}

const prioridadeColors: Record<PrioridadeLead, string> = {
  baixa: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  alta: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

const eventoLabels: Record<EventoLeadTipo, string> = {
  primeiro_contato: 'Primeiro Contato',
  contato_realizado: 'Contato Realizado',
  proposta_enviada: 'Proposta Enviada',
  visita_agendada: 'Visita Agendada',
  visita_realizada: 'Visita Realizada',
  ganho: 'Ganho',
  perdido: 'Perdido',
  observacao: 'Observação'
}

const eventoIcons: Record<EventoLeadTipo, React.ElementType> = {
  primeiro_contato: MessageSquare,
  contato_realizado: Phone,
  proposta_enviada: DollarSign,
  visita_agendada: Calendar,
  visita_realizada: CheckCircle,
  ganho: CheckCircle,
  perdido: XCircle,
  observacao: Edit2
}

interface LeadDetailResponse {
  success: boolean
  data: Lead & {
    cliente: Cliente | null
    eventos: EventoLead[]
  }
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const [lead, setLead] = useState<(Lead & { cliente: Cliente | null; eventos: EventoLead[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Event form
  const [newEvent, setNewEvent] = useState({
    tipo: 'contato_realizado' as EventoLeadTipo,
    descricao: '',
    proximo_contato_em: ''
  })

  useEffect(() => {
    fetchLead()
  }, [id])

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/admin/crm/leads/${id}`)
      const data: LeadDetailResponse = await response.json()

      if (data.success) {
        setLead(data.data)
      } else {
        setError('Lead não encontrado')
      }
    } catch (err) {
      setError('Erro ao carregar lead')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: StatusLead) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/crm/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchLead()
        setShowStatusModal(false)
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
      const response = await fetch(`/api/admin/crm/leads/${id}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      })

      if (response.ok) {
        await fetchLead()
        setShowEventModal(false)
        setNewEvent({ tipo: 'contato_realizado', descricao: '', proximo_contato_em: '' })
      }
    } catch (err) {
      console.error('Failed to create event:', err)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-foreground-secondary">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>{error || 'Lead não encontrado'}</p>
        <Link href="/admin/crm/leads" className="mt-4 text-primary hover:underline">
          Voltar para Leads
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
            <h1 className="text-2xl font-bold text-foreground">{lead.nome}</h1>
            <p className="text-foreground-secondary">{lead.origem} • Criado em {formatDate(lead.criado_em)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('px-3 py-1.5 rounded-full text-sm font-medium', prioridadeColors[lead.prioridade])}>
            {prioridadeLabels[lead.prioridade]}
          </span>
          <button
            onClick={() => setShowStatusModal(true)}
            className={cn('px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer hover:opacity-80', statusColors[lead.status])}
          >
            {statusLabels[lead.status]}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-background-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Informações de Contato</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lead.telefone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background-soft rounded-lg">
                    <Phone className="w-5 h-5 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Telefone</p>
                    <a href={`tel:${lead.telefone}`} className="text-foreground hover:text-primary">
                      {lead.telefone}
                    </a>
                  </div>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background-soft rounded-lg">
                    <Mail className="w-5 h-5 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-foreground hover:text-primary">
                      {lead.email}
                    </a>
                  </div>
                </div>
              )}
              {lead.cliente && (
                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="p-2 bg-background-soft rounded-lg">
                    <User className="w-5 h-5 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Cliente Vinculado</p>
                    <Link href={`/admin/crm/clientes/${lead.cliente.id}`} className="text-primary hover:underline">
                      {lead.cliente.nome}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interest Info */}
          <div className="bg-background-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Interesse</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background-soft rounded-lg">
                  <Tag className="w-5 h-5 text-foreground-secondary" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Tipo de Interesse</p>
                  <p className="text-foreground capitalize">{lead.interesse_tipo || 'Não especificado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background-soft rounded-lg">
                  <DollarSign className="w-5 h-5 text-foreground-secondary" />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Faixa de Preço</p>
                  <p className="text-foreground">
                    {formatPrice(lead.faixa_preco_interesse_min)} - {formatPrice(lead.faixa_preco_interesse_max)}
                  </p>
                </div>
              </div>
              {lead.marca_interesse && (
                <div>
                  <p className="text-sm text-foreground-secondary">Marca</p>
                  <p className="text-foreground">{lead.marca_interesse}</p>
                </div>
              )}
              {lead.modelo_interesse && (
                <div>
                  <p className="text-sm text-foreground-secondary">Modelo</p>
                  <p className="text-foreground">{lead.modelo_interesse}</p>
                </div>
              )}
              {lead.categoria_interesse && (
                <div>
                  <p className="text-sm text-foreground-secondary">Categoria</p>
                  <p className="text-foreground">{lead.categoria_interesse}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-background-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
              <button
                onClick={() => setShowEventModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar Evento
              </button>
            </div>

            {lead.eventos.length === 0 ? (
              <p className="text-foreground-secondary text-center py-8">Nenhum evento registrado</p>
            ) : (
              <div className="space-y-4">
                {lead.eventos.map((evento, index) => {
                  const Icon = eventoIcons[evento.tipo] || MessageSquare
                  return (
                    <div key={evento.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          evento.tipo === 'ganho' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                          evento.tipo === 'perdido' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-primary/10 text-primary'
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {index < lead.eventos.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">{eventoLabels[evento.tipo]}</p>
                            <p className="text-sm text-foreground-secondary">{evento.descricao}</p>
                          </div>
                          <p className="text-xs text-foreground-secondary whitespace-nowrap ml-4">
                            {formatDate(evento.criado_em)}
                          </p>
                        </div>
                        {evento.proximo_contato_em && (
                          <div className="mt-2 flex items-center gap-1 text-sm text-primary">
                            <Clock className="w-4 h-4" />
                            <span>Próximo contato: {formatDate(evento.proximo_contato_em)}</span>
                          </div>
                        )}
                        <p className="mt-1 text-xs text-foreground-secondary">por {evento.responsavel}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="space-y-6">
          <div className="bg-background-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
            <div className="space-y-2">
              <a
                href={`https://wa.me/55${lead.telefone?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Enviar WhatsApp</span>
              </a>
              <a
                href={`tel:${lead.telefone}`}
                className="flex items-center gap-3 w-full px-4 py-3 bg-background-soft text-foreground rounded-lg hover:bg-background transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>Ligar</span>
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-3 w-full px-4 py-3 bg-background-soft text-foreground rounded-lg hover:bg-background transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>Enviar Email</span>
              </a>
            </div>
          </div>

          {/* Status Change */}
          <div className="bg-background-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Alterar Status</h2>
            <div className="space-y-2">
              {Object.entries(statusLabels).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status as StatusLead)}
                  disabled={lead.status === status || saving}
                  className={cn(
                    'w-full px-4 py-2 rounded-lg text-left transition-colors disabled:opacity-50',
                    lead.status === status
                      ? statusColors[status as StatusLead]
                      : 'bg-background-soft text-foreground-secondary hover:bg-background hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background-card rounded-xl border border-border p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-foreground mb-4">Adicionar Evento</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Tipo de Evento</label>
                <select
                  value={newEvent.tipo}
                  onChange={(e) => setNewEvent({ ...newEvent, tipo: e.target.value as EventoLeadTipo })}
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
                  placeholder="Descreva o evento..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Próximo Contato (opcional)</label>
                <input
                  type="datetime-local"
                  value={newEvent.proximo_contato_em}
                  onChange={(e) => setNewEvent({ ...newEvent, proximo_contato_em: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                />
              </div>
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

