'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricsDashboardProps {
  isAdmin: boolean
}

interface Metrics {
  totalTasks: number
  byStatus: Record<string, number>
  byCategory: Record<string, number>
  byPriority: Record<string, number>
  completionRate: number
  successRate: number
  overdueCount: number
  completionsLast30Days: number
  totalEstimatedHours: number
  totalActualHours: number
  hoursEfficiency: number
}

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  in_progress: 'Em Progresso',
  review: 'Revisão',
  completed: 'Concluído',
  failed: 'Falhou',
}

const CATEGORY_LABELS: Record<string, string> = {
  seo: 'SEO',
  social_media: 'Social Media',
  content: 'Conteúdo',
  paid_ads: 'Anúncios',
  email: 'E-mail',
  events: 'Eventos',
  partnerships: 'Parcerias',
  other: 'Outros',
}

export function MetricsDashboard({ isAdmin }: MetricsDashboardProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/admin/marketing/metrics')
        const data = await res.json()
        setMetrics(data.metrics)
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-20 text-foreground-secondary">
        Erro ao carregar métricas
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Total de Tarefas"
          value={metrics.totalTasks}
          color="text-blue-500"
        />
        <MetricCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Taxa de Conclusão"
          value={`${metrics.completionRate}%`}
          color="text-green-500"
        />
        <MetricCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Tarefas Atrasadas"
          value={metrics.overdueCount}
          color="text-red-500"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Concluídas (30 dias)"
          value={metrics.completionsLast30Days}
          color="text-primary"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-background-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Distribuição por Status</h3>
          <div className="space-y-3">
            {Object.entries(metrics.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-sm text-foreground-secondary w-28">
                  {STATUS_LABELS[status] || status}
                </span>
                <div className="flex-1 bg-background-soft rounded-full h-4 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      status === 'completed' ? 'bg-green-500' :
                      status === 'failed' ? 'bg-red-500' :
                      status === 'in_progress' ? 'bg-blue-500' :
                      status === 'review' ? 'bg-yellow-500' : 'bg-gray-500'
                    )}
                    style={{ width: `${(count / metrics.totalTasks) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-background-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Distribuição por Categoria</h3>
          <div className="space-y-3">
            {Object.entries(metrics.byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center gap-3">
                <span className="text-sm text-foreground-secondary w-28">
                  {CATEGORY_LABELS[category] || category}
                </span>
                <div className="flex-1 bg-background-soft rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(count / metrics.totalTasks) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-background-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-background-soft", color)}>{icon}</div>
        <div>
          <p className="text-sm text-foreground-secondary">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

