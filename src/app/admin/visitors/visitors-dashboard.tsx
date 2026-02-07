'use client'

import { useState, useEffect } from 'react'
import {
  Users, Eye, MousePointer, Building2, Mail, Phone,
  TrendingUp, Clock, Car, Filter, Download, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VisitorProfileWithDetails, VisitorFingerprint, VisitorSession } from '@/types/database'

interface Props {
  adminId: string
}

interface DashboardMetrics {
  total_visitors: number
  identified_visitors: number
  enriched_visitors: number
  total_sessions: number
  total_page_views: number
  avg_session_duration: number
  whatsapp_clicks: number
  top_vehicles: Array<{ slug: string; brand: string; model: string; views: number }>
}

export function VisitorsDashboard({ adminId }: Props) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [visitors, setVisitors] = useState<VisitorProfileWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'identified' | 'enriched'>('all')
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorProfileWithDetails | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [metricsRes, visitorsRes] = await Promise.all([
        fetch('/api/admin/visitors/metrics'),
        fetch(`/api/admin/visitors?status=${filter}`),
      ])

      if (metricsRes.ok) {
        setMetrics(await metricsRes.json())
      }
      if (visitorsRes.ok) {
        setVisitors(await visitorsRes.json())
      }
    } catch (error) {
      console.error('Error fetching visitor data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filter])

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    subValue,
    color = 'text-primary'
  }: {
    icon: typeof Users
    label: string
    value: string | number
    subValue?: string
    color?: string
  }) => (
    <div className="bg-background-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-background-soft", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-foreground-muted">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subValue && <p className="text-xs text-foreground-muted">{subValue}</p>}
        </div>
      </div>
    </div>
  )

  const getStatusBadge = (status: string) => {
    const styles = {
      anonymous: 'bg-gray-500/10 text-gray-500',
      identified: 'bg-blue-500/10 text-blue-500',
      enriched: 'bg-green-500/10 text-green-500',
      converted: 'bg-purple-500/10 text-purple-500',
    }
    return styles[status as keyof typeof styles] || styles.anonymous
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visitor Intelligence</h1>
          <p className="text-foreground-muted">Análise de comportamento e identificação de leads</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-background-soft"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          icon={Users}
          label="Total Visitantes"
          value={metrics?.total_visitors || 0}
          color="text-blue-500"
        />
        <MetricCard
          icon={Mail}
          label="Identificados"
          value={metrics?.identified_visitors || 0}
          subValue={metrics ? `${Math.round((metrics.identified_visitors / metrics.total_visitors) * 100)}%` : undefined}
          color="text-green-500"
        />
        <MetricCard
          icon={Building2}
          label="Enriquecidos"
          value={metrics?.enriched_visitors || 0}
          color="text-purple-500"
        />
        <MetricCard
          icon={Eye}
          label="Page Views"
          value={metrics?.total_page_views || 0}
          color="text-yellow-500"
        />
        <MetricCard
          icon={Clock}
          label="Tempo Médio"
          value={metrics ? `${Math.round(metrics.avg_session_duration / 60)}min` : '0min'}
          color="text-orange-500"
        />
        <MetricCard
          icon={MousePointer}
          label="WhatsApp Clicks"
          value={metrics?.whatsapp_clicks || 0}
          color="text-green-600"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['all', 'identified', 'enriched'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              filter === f
                ? "border-primary text-primary"
                : "border-transparent text-foreground-muted hover:text-foreground"
            )}
          >
            {f === 'all' ? 'Todos' : f === 'identified' ? 'Identificados' : 'Enriquecidos'}
          </button>
        ))}
      </div>

      {/* Visitors Table */}
      <div className="bg-background-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-soft">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Visitante</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Status</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Empresa</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Visitas</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Veículos</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Lead Score</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Última Visita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-foreground-muted">
                    Carregando...
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-foreground-muted">
                    Nenhum visitante encontrado
                  </td>
                </tr>
              ) : (
                visitors.map(visitor => (
                  <tr
                    key={visitor.id}
                    onClick={() => setSelectedVisitor(visitor)}
                    className="hover:bg-background-soft cursor-pointer"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {visitor.full_name || visitor.email || 'Anônimo'}
                        </p>
                        <div className="flex gap-2 text-sm text-foreground-muted">
                          {visitor.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {visitor.email}
                            </span>
                          )}
                          {visitor.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {visitor.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadge(visitor.status))}>
                        {visitor.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {visitor.company_name ? (
                        <div>
                          <p className="font-medium text-foreground">{visitor.company_name}</p>
                          <p className="text-sm text-foreground-muted">{visitor.job_title}</p>
                        </div>
                      ) : (
                        <span className="text-foreground-muted">-</span>
                      )}
                    </td>
                    <td className="p-4 text-foreground">
                      {visitor.total_sessions || 0}
                    </td>
                    <td className="p-4">
                      {visitor.vehicles_interested?.length ? (
                        <div className="flex items-center gap-1">
                          <Car className="w-4 h-4 text-foreground-muted" />
                          <span className="text-foreground">{visitor.vehicles_interested.length}</span>
                        </div>
                      ) : (
                        <span className="text-foreground-muted">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-background-soft rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${visitor.lead_score}%` }}
                          />
                        </div>
                        <span className="text-sm text-foreground">{visitor.lead_score}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground-muted">
                      {new Date(visitor.updated_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Vehicles Section */}
      {metrics?.top_vehicles && metrics.top_vehicles.length > 0 && (
        <div className="bg-background-card rounded-lg border border-border p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Veículos Mais Visualizados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {metrics.top_vehicles.map((vehicle, index) => (
              <div key={vehicle.slug} className="p-3 bg-background-soft rounded-lg">
                <p className="font-medium text-foreground">{vehicle.brand} {vehicle.model}</p>
                <p className="text-sm text-foreground-muted">{vehicle.views} visualizações</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
