'use client'

import { useState, useEffect, useCallback, Suspense, useRef } from 'react'
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
  Loader2,
  MessageCircle,
  X,
  Plus,
  FileText,
  Clock,
  UserCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeadWithCliente, StatusLead, PrioridadeLead, EtapaFunil, OrigemLead, EventoLeadTipo } from '@/types/database'
import { etapaLabels, etapaColors, etapaOrdem, etapaDotColors } from '@/lib/crm/funil'

const statusLabels: Record<StatusLead, string> = {
  novo: 'Novo',
  em_atendimento: 'Em Atendimento',
  concluido: 'Concluído',
  ganho: 'Ganho',
  perdido: 'Perdido'
}

const statusColors: Record<StatusLead, string> = {
  novo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  em_atendimento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  concluido: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  ganho: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  perdido: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

const prioridadeColors: Record<PrioridadeLead, string> = {
  baixa: 'text-gray-500',
  media: 'text-yellow-500',
  alta: 'text-red-500'
}

const origemLabels: Record<OrigemLead, string> = {
  site_chat: 'Chat do Site',
  whatsapp_ia: 'WhatsApp IA',
  instagram_form: 'Formulário Instagram',
  crm_externo: 'CRM Externo'
}

const followUpTipos: { value: EventoLeadTipo; label: string }[] = [
  { value: 'ligacao', label: 'Ligação' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'visita', label: 'Visita' },
  { value: 'email', label: 'Email' },
  { value: 'contato_realizado', label: 'Contato Realizado' },
  { value: 'retorno_pendente', label: 'Retorno Pendente' },
]

const tipoDotColors: Record<string, string> = {
  ligacao:           'bg-blue-500',
  whatsapp:          'bg-green-500',
  visita:            'bg-purple-500',
  email:             'bg-orange-500',
  contato_realizado: 'bg-emerald-500',
  retorno_pendente:  'bg-yellow-400',
}

function TipoDropdown({
  value,
  onChange
}: {
  value: EventoLeadTipo
  onChange: (v: EventoLeadTipo) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selected = followUpTipos.find(t => t.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground hover:border-primary/50 transition-colors"
      >
        <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', tipoDotColors[value] ?? 'bg-gray-400')} />
        <span className="flex-1 text-left">{selected?.label ?? value}</span>
        <svg className="w-4 h-4 text-foreground-secondary flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-full bg-background-card border border-border rounded-xl shadow-xl overflow-hidden">
          {followUpTipos.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => { onChange(t.value); setOpen(false) }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-background-soft',
                t.value === value ? 'bg-background-soft font-medium' : 'text-foreground'
              )}
            >
              <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', tipoDotColors[t.value] ?? 'bg-gray-400')} />
              <span>{t.label}</span>
              {t.value === value && (
                <svg className="w-3.5 h-3.5 ml-auto text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
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

interface FollowUpForm {
  tipo: EventoLeadTipo
  descricao: string
  proximo_contato_em: string
  responsavel: string
}

// Formata telefone para wa.me (remove não-dígitos, garante DDI 55)
function formatWhatsApp(tel: string): string {
  const digits = tel.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

function EtapaDropdown({
  lead,
  changing,
  onChange
}: {
  lead: LeadWithCliente
  changing: boolean
  onChange: (leadId: string, etapa: EtapaFunil) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (changing) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', etapaColors[lead.etapa_funil])}>
        <Loader2 className="w-3 h-3 animate-spin" />
        {etapaLabels[lead.etapa_funil]}
      </span>
    )
  }

  return (
    <div ref={ref} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80',
          etapaColors[lead.etapa_funil]
        )}
      >
        {etapaLabels[lead.etapa_funil]}
        <svg className="w-3 h-3 opacity-60" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-background-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[160px]">
          {etapaOrdem.map((etapa) => (
            <button
              key={etapa}
              onClick={() => { onChange(lead.id, etapa); setOpen(false) }}
              className={cn(
                'w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 transition-colors hover:bg-background-soft',
                etapa === lead.etapa_funil ? 'bg-background-soft' : ''
              )}
            >
              <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', etapaDotColors[etapa])} />
              <span className="text-foreground">{etapaLabels[etapa]}</span>
              {etapa === lead.etapa_funil && (
                <svg className="w-3 h-3 ml-auto text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
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
  const [etapaFilter, setEtapaFilter] = useState<EtapaFunil | ''>('')
  const [origemFilter, setOrigemFilter] = useState<OrigemLead | ''>('')
  const [vendedorFilter, setVendedorFilter] = useState('')
  const [modeloFilter, setModeloFilter] = useState('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [lastContactFrom, setLastContactFrom] = useState('')
  const [lastContactTo, setLastContactTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Follow-up modal
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpLeadId, setFollowUpLeadId] = useState<string | null>(null)
  const [followUpLeadName, setFollowUpLeadName] = useState('')
  const [savingFollowUp, setSavingFollowUp] = useState(false)
  const [followUpForm, setFollowUpForm] = useState<FollowUpForm>({
    tipo: 'ligacao',
    descricao: '',
    proximo_contato_em: '',
    responsavel: ''
  })

  // Inline etapa change
  const [changingEtapa, setChangingEtapa] = useState<string | null>(null)

  // Convert to cliente
  const [converting, setConverting] = useState<string | null>(null)

  const activeFilterCount = [
    statusFilter, prioridadeFilter, etapaFilter, origemFilter,
    vendedorFilter, modeloFilter, dateFromFilter, dateToFilter,
    lastContactFrom, lastContactTo
  ].filter(Boolean).length

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (prioridadeFilter) params.set('prioridade', prioridadeFilter)
      if (etapaFilter) params.set('etapa_funil', etapaFilter)
      if (origemFilter) params.set('origem', origemFilter)
      if (vendedorFilter) params.set('vendedor', vendedorFilter)
      if (modeloFilter) params.set('modelo', modeloFilter)
      if (dateFromFilter) params.set('dateFrom', dateFromFilter)
      if (dateToFilter) params.set('dateTo', dateToFilter)
      if (lastContactFrom) params.set('lastContactFrom', lastContactFrom)
      if (lastContactTo) params.set('lastContactTo', lastContactTo)

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
  }, [
    pagination.page, pagination.limit, search,
    statusFilter, prioridadeFilter, etapaFilter,
    origemFilter, vendedorFilter, modeloFilter,
    dateFromFilter, dateToFilter, lastContactFrom, lastContactTo
  ])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchLeads()
  }

  const clearFilters = () => {
    setStatusFilter('')
    setPrioridadeFilter('')
    setEtapaFilter('')
    setOrigemFilter('')
    setVendedorFilter('')
    setModeloFilter('')
    setDateFromFilter('')
    setDateToFilter('')
    setLastContactFrom('')
    setLastContactTo('')
    setSearch('')
  }

  const openFollowUp = (e: React.MouseEvent, lead: LeadWithCliente) => {
    e.stopPropagation()
    setFollowUpLeadId(lead.id)
    setFollowUpLeadName(lead.nome)
    setFollowUpForm({ tipo: 'ligacao', descricao: '', proximo_contato_em: '', responsavel: '' })
    setShowFollowUp(true)
  }

  const updateEtapa = async (e: React.ChangeEvent<HTMLSelectElement>, leadId: string) => {
    e.stopPropagation()
    const newEtapa = e.target.value as EtapaFunil
    setChangingEtapa(leadId)
    try {
      await fetch(`/api/admin/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapa_funil: newEtapa })
      })
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, etapa_funil: newEtapa } : l))
    } catch (err) {
      console.error('Failed to update etapa:', err)
    } finally {
      setChangingEtapa(null)
    }
  }

  const convertToCliente = async (e: React.MouseEvent, lead: LeadWithCliente) => {
    e.stopPropagation()
    if (!confirm(`Converter "${lead.nome}" em contato/cliente?`)) return
    setConverting(lead.id)
    try {
      const res = await fetch(`/api/admin/crm/leads/${lead.id}/converter`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        fetchLeads()
      }
    } catch (err) {
      console.error('Failed to convert lead:', err)
    } finally {
      setConverting(null)
    }
  }

  const createFollowUp = async () => {
    if (!followUpLeadId || !followUpForm.descricao.trim()) return
    setSavingFollowUp(true)
    try {
      const response = await fetch(`/api/admin/crm/leads/${followUpLeadId}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: followUpForm.tipo,
          descricao: followUpForm.descricao.trim(),
          proximo_contato_em: followUpForm.proximo_contato_em || null,
          responsavel: followUpForm.responsavel || 'CRM'
        })
      })
      if (response.ok) {
        setShowFollowUp(false)
        fetchLeads()
      }
    } catch (err) {
      console.error('Failed to create follow-up:', err)
    } finally {
      setSavingFollowUp(false)
    }
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
              placeholder="Buscar por nome, telefone, email, marca, modelo ou placa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors relative',
              showFilters
                ? 'bg-primary text-white border-primary'
                : 'border-border text-foreground-secondary hover:bg-background-soft'
            )}
          >
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className={cn(
                'absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold',
                showFilters ? 'bg-white text-primary' : 'bg-primary text-white'
              )}>
                {activeFilterCount}
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

        {/* Filter options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            {/* Row 1: Etapa, Status, Origem, Prioridade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Etapa do Funil</label>
                <select
                  value={etapaFilter}
                  onChange={(e) => setEtapaFilter(e.target.value as EtapaFunil | '')}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                >
                  <option value="">Todas</option>
                  {etapaOrdem.map((etapa) => (
                    <option key={etapa} value={etapa}>{etapaLabels[etapa]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusLead | '')}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                >
                  <option value="">Todos</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Origem</label>
                <select
                  value={origemFilter}
                  onChange={(e) => setOrigemFilter(e.target.value as OrigemLead | '')}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                >
                  <option value="">Todas</option>
                  {Object.entries(origemLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Prioridade</label>
                <select
                  value={prioridadeFilter}
                  onChange={(e) => setPrioridadeFilter(e.target.value as PrioridadeLead | '')}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                >
                  <option value="">Todas</option>
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
            </div>

            {/* Row 2: Vendedor, Modelo, Criado de/até */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Vendedor Responsável</label>
                <input
                  type="text"
                  placeholder="Ex: João"
                  value={vendedorFilter}
                  onChange={(e) => setVendedorFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Veículo / Modelo</label>
                <input
                  type="text"
                  placeholder="Ex: Porsche, Cayenne..."
                  value={modeloFilter}
                  onChange={(e) => setModeloFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Criado após</label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Criado até</label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                />
              </div>
            </div>

            {/* Row 3: Último contato de/até */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Último contato após</label>
                <input
                  type="date"
                  value={lastContactFrom}
                  onChange={(e) => setLastContactFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Último contato até</label>
                <input
                  type="date"
                  value={lastContactTo}
                  onChange={(e) => setLastContactTo(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                />
              </div>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                  Limpar {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''}
                </button>
              </div>
            )}
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
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-soft border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Lead</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Etapa</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Contato</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Interesse</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Vendedor</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Prob. (%)</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Próx. Contato</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Últ. Contato</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Criado</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">Ações</th>
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
                        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', prioridadeColors[lead.prioridade])} />
                        <div>
                          <p className="font-medium text-foreground">{lead.nome}</p>
                          <p className="text-sm text-foreground-secondary">{origemLabels[lead.origem] ?? lead.origem}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <EtapaDropdown
                        lead={lead}
                        changing={changingEtapa === lead.id}
                        onChange={(leadId, etapa) => {
                          setChangingEtapa(leadId)
                          fetch(`/api/admin/crm/leads/${leadId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ etapa_funil: etapa })
                          }).then(() => {
                            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, etapa_funil: etapa } : l))
                          }).finally(() => setChangingEtapa(null))
                        }}
                      />
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
                          {[lead.marca_interesse, lead.modelo_interesse].filter(Boolean).join(' ') || '---'}
                        </p>
                        <p className="text-xs text-foreground-secondary">
                          {lead.valor_potencial
                            ? formatPrice(lead.valor_potencial)
                            : `${formatPrice(lead.faixa_preco_interesse_min)} - ${formatPrice(lead.faixa_preco_interesse_max)}`}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {lead.vendedor_responsavel ? (
                        <span className="text-sm text-foreground">{lead.vendedor_responsavel}</span>
                      ) : (
                        <span className="text-sm text-foreground-secondary">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[lead.status])}>
                        {statusLabels[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {lead.probabilidade_fechamento != null
                        ? <span className="font-semibold text-foreground">{lead.probabilidade_fechamento}%</span>
                        : <span className="text-foreground-secondary">-</span>}
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
                    <td className="px-4 py-3">
                      {(lead as any).data_ultimo_contato ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-3 h-3 text-foreground-secondary" />
                          <span className="text-foreground-secondary">{formatDate((lead as any).data_ultimo_contato)}</span>
                        </div>
                      ) : (
                        <span className="text-foreground-secondary text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">
                      {formatDate(lead.criado_em)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {lead.telefone && (
                          <a
                            href={`https://wa.me/${formatWhatsApp(lead.telefone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir WhatsApp"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={(e) => openFollowUp(e, lead)}
                          title="Registrar follow-up ou nota"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {lead.etapa_funil === 'ganho' && (
                          <button
                            onClick={(e) => convertToCliente(e, lead)}
                            title="Converter em cliente"
                            disabled={converting === lead.id}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                          >
                            {converting === lead.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
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

      {/* Follow-up / Note Modal */}
      {showFollowUp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background-card rounded-xl border border-border p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Registrar Atividade</h2>
                <p className="text-sm text-foreground-secondary">{followUpLeadName}</p>
              </div>
              <button
                onClick={() => setShowFollowUp(false)}
                className="p-2 rounded-lg hover:bg-background-soft text-foreground-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Tipo</label>
                <TipoDropdown
                  value={followUpForm.tipo}
                  onChange={(v) => setFollowUpForm(prev => ({ ...prev, tipo: v }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Observação</label>
                <textarea
                  value={followUpForm.descricao}
                  onChange={(e) => setFollowUpForm(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva o que foi discutido ou a nota..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-1">Próximo contato</label>
                  <input
                    type="datetime-local"
                    value={followUpForm.proximo_contato_em}
                    onChange={(e) => setFollowUpForm(prev => ({ ...prev, proximo_contato_em: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-1">Responsável</label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={followUpForm.responsavel}
                    onChange={(e) => setFollowUpForm(prev => ({ ...prev, responsavel: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowFollowUp(false)}
                className="px-4 py-2 text-foreground-secondary hover:text-foreground transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={createFollowUp}
                disabled={savingFollowUp || !followUpForm.descricao.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm disabled:opacity-50"
              >
                {savingFollowUp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
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
