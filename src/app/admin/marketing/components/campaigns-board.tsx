'use client'

import { useState } from 'react'
import {
  Calendar,
  Car,
  ChevronRight,
  Trophy,
  TrendingDown,
  Megaphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CampaignWithVehicles, CampaignStatus } from '@/types/database'

interface CampaignsBoardProps {
  campaigns: CampaignWithVehicles[]
  onCampaignClick: (campaign: CampaignWithVehicles) => void
  onStatusChange: (campaignId: string, newStatus: CampaignStatus) => void
  isAdmin: boolean
}

const COLUMNS: { id: CampaignStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { id: 'publicada', label: 'Publicada', color: 'bg-blue-500', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'encerrada_ganho', label: 'Encerrada por Ganho', color: 'bg-green-500', icon: <Trophy className="w-4 h-4" /> },
  { id: 'encerrada_desempenho', label: 'Encerrada por Desempenho', color: 'bg-orange-500', icon: <TrendingDown className="w-4 h-4" /> },
]

export function CampaignsBoard({ campaigns, onCampaignClick, onStatusChange, isAdmin }: CampaignsBoardProps) {
  const [draggedCampaign, setDraggedCampaign] = useState<CampaignWithVehicles | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<CampaignStatus | null>(null)

  const handleDragStart = (e: React.DragEvent, campaign: CampaignWithVehicles) => {
    if (!isAdmin) return
    setDraggedCampaign(campaign)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, columnId: CampaignStatus) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, columnId: CampaignStatus) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (draggedCampaign && draggedCampaign.status !== columnId) {
      onStatusChange(draggedCampaign.id, columnId)
    }
    setDraggedCampaign(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
      {COLUMNS.map(column => {
        const columnCampaigns = campaigns.filter(c => c.status === column.id)

        return (
          <div
            key={column.id}
            className={cn(
              "bg-background-soft rounded-lg border border-border min-h-[400px]",
              dragOverColumn === column.id && "ring-2 ring-primary"
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", column.color)} />
                <span className="font-medium text-foreground text-sm">{column.label}</span>
              </div>
              <span className="text-sm text-foreground-secondary bg-background-card px-2 py-0.5 rounded-full">
                {columnCampaigns.length}
              </span>
            </div>

            {/* Campaigns */}
            <div className="p-2 space-y-3 min-h-[200px] max-h-[600px] overflow-y-auto">
              {columnCampaigns.length === 0 && (
                <div className="flex items-center justify-center py-8 text-foreground-secondary text-sm">
                  Nenhuma campanha
                </div>
              )}
              {columnCampaigns.map(campaign => (
                <div
                  key={campaign.id}
                  draggable={isAdmin}
                  onDragStart={(e) => handleDragStart(e, campaign)}
                  onClick={() => onCampaignClick(campaign)}
                  className={cn(
                    "bg-background-card border border-border rounded-lg p-4 cursor-pointer",
                    "hover:border-primary/50 hover:shadow-sm transition-all",
                    draggedCampaign?.id === campaign.id && "opacity-50"
                  )}
                >
                  {/* Campaign Name */}
                  <h4 className="font-semibold text-foreground text-sm mb-1">
                    {campaign.name}
                  </h4>

                  {campaign.description && (
                    <p className="text-xs text-foreground-secondary mb-3 line-clamp-2">
                      {campaign.description}
                    </p>
                  )}

                  {/* Vehicle List */}
                  {campaign.vehicles && campaign.vehicles.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {campaign.vehicles.map((v, i) => (
                        <div key={v.id} className="flex items-start gap-2 text-xs">
                          <span className="text-foreground-secondary font-mono min-w-[1.2rem] text-right">{i + 1}.</span>
                          <div className="flex-1">
                            <span className="text-foreground">{v.vehicle_name}</span>
                            {v.added_date && (
                              <span className="text-foreground-secondary ml-1">
                                ({new Date(v.added_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer Meta */}
                  <div className="flex items-center gap-3 text-xs text-foreground-secondary pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      {campaign.vehicles?.length || 0} veículo{(campaign.vehicles?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

