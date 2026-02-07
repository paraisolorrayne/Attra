'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageCircle,
  Bot,
  MessageSquare,
  Loader2,
  Check,
  ChevronDown,
  AlertCircle,
  Globe,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ChannelBehavior = 'leadster_static' | 'leadster_ai' | 'whatsapp_direct' | 'default'

interface PageChannelSetting {
  id: string
  page_path: string
  page_name: string
  channel_behavior: ChannelBehavior
  custom_greeting: string | null
  custom_whatsapp_message: string | null
  is_enabled: boolean
}

const channelOptions: { value: ChannelBehavior; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'default',
    label: 'Automático',
    description: 'Detecta automaticamente baseado no tipo da página',
    icon: <Globe className="w-4 h-4" />,
  },
  {
    value: 'leadster_ai',
    label: 'Leadster com IA',
    description: 'Chat widget com respostas inteligentes do assistente virtual',
    icon: <Bot className="w-4 h-4" />,
  },
  {
    value: 'leadster_static',
    label: 'Leadster Estático',
    description: 'Chat widget simples para captura de mensagens (sem IA)',
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    value: 'whatsapp_direct',
    label: 'WhatsApp Direto',
    description: 'Redireciona imediatamente para o WhatsApp',
    icon: <MessageCircle className="w-4 h-4" />,
  },
]

export function PageChannelsAdmin() {
  const [settings, setSettings] = useState<PageChannelSetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/page-channels')
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (err) {
      console.error('Error fetching page channel settings:', err)
      setError('Erro ao carregar configurações de canais')
    } finally {
      setIsLoading(false)
    }
  }

  const updateChannelBehavior = async (id: string, channel_behavior: ChannelBehavior) => {
    setSavingId(id)
    setError(null)
    setSuccessId(null)

    try {
      const res = await fetch('/api/admin/page-channels', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, channel_behavior }),
      })

      if (res.status === 401) {
        router.push('/admin/login')
        return
      }

      if (res.status === 403) {
        setError('Apenas administradores podem alterar configurações')
        return
      }

      if (!res.ok) {
        throw new Error('Failed to update setting')
      }

      setSettings(prev => prev.map(s => s.id === id ? { ...s, channel_behavior } : s))
      setSuccessId(id)
      setTimeout(() => setSuccessId(null), 2000)
    } catch (err) {
      console.error('Error updating channel behavior:', err)
      setError('Erro ao salvar configuração')
    } finally {
      setSavingId(null)
    }
  }

  const toggleEnabled = async (id: string, is_enabled: boolean) => {
    setSavingId(id)
    setError(null)

    try {
      const res = await fetch('/api/admin/page-channels', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_enabled }),
      })

      if (!res.ok) throw new Error('Failed to update')

      setSettings(prev => prev.map(s => s.id === id ? { ...s, is_enabled } : s))
    } catch (err) {
      console.error('Error toggling enabled:', err)
      setError('Erro ao atualizar')
    } finally {
      setSavingId(null)
    }
  }

  const getChannelOption = (behavior: ChannelBehavior) => {
    return channelOptions.find(o => o.value === behavior) || channelOptions[0]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {settings.length === 0 ? (
        <div className="text-center py-12 text-foreground-secondary">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma configuração de canal encontrada.</p>
          <p className="text-sm mt-2">Execute a migração do banco de dados para criar as configurações padrão.</p>
        </div>
      ) : (
        settings.map((setting) => {
          const currentOption = getChannelOption(setting.channel_behavior)
          const isExpanded = expandedId === setting.id

          return (
            <div
              key={setting.id}
              className={cn(
                "bg-background-card border rounded-xl transition-all",
                setting.is_enabled ? "border-border" : "border-border/50 opacity-60"
              )}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                    setting.channel_behavior === 'whatsapp_direct' ? 'bg-green-500/10 text-green-500' :
                    setting.channel_behavior === 'leadster_ai' ? 'bg-primary/10 text-primary' :
                    setting.channel_behavior === 'leadster_static' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-foreground-secondary/10 text-foreground-secondary'
                  )}>
                    {currentOption.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{setting.page_name}</h3>
                      {successId === setting.id && (
                        <span className="text-emerald-500 text-xs font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Salvo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground-secondary font-mono truncate">{setting.page_path}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Channel Behavior Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : setting.id)}
                      disabled={savingId === setting.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors min-w-[160px]",
                        isExpanded ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                        savingId === setting.id && "opacity-50"
                      )}
                    >
                      {savingId === setting.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        currentOption.icon
                      )}
                      <span className="text-sm font-medium flex-1 text-left">{currentOption.label}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                    </button>

                    {/* Dropdown Menu */}
                    {isExpanded && (
                      <div className="absolute right-0 mt-2 w-72 bg-background-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                        {channelOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              updateChannelBehavior(setting.id, option.value)
                              setExpandedId(null)
                            }}
                            className={cn(
                              "w-full flex items-start gap-3 p-3 text-left hover:bg-background-soft transition-colors",
                              setting.channel_behavior === option.value && "bg-primary/5"
                            )}
                          >
                            <div className={cn(
                              "mt-0.5 shrink-0",
                              setting.channel_behavior === option.value ? "text-primary" : "text-foreground-secondary"
                            )}>
                              {option.icon}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">{option.label}</p>
                              <p className="text-xs text-foreground-secondary">{option.description}</p>
                            </div>
                            {setting.channel_behavior === option.value && (
                              <Check className="w-4 h-4 text-primary ml-auto mt-0.5" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Enable/Disable Toggle */}
                  <button
                    onClick={() => toggleEnabled(setting.id, !setting.is_enabled)}
                    disabled={savingId === setting.id}
                    className={cn(
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                      setting.is_enabled ? "bg-primary" : "bg-foreground-secondary/30"
                    )}
                    role="switch"
                    aria-checked={setting.is_enabled}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        setting.is_enabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Custom Greeting Preview */}
              {setting.custom_greeting && setting.is_enabled && (
                <div className="px-4 pb-4 pt-0">
                  <div className="flex items-start gap-2 p-3 bg-background rounded-lg border border-border/50">
                    <MessageSquare className="w-4 h-4 text-foreground-secondary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground-secondary italic">&ldquo;{setting.custom_greeting}&rdquo;</p>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}

      {/* Legend */}
      <div className="mt-6 p-4 bg-background-soft rounded-xl">
        <h4 className="font-medium text-foreground mb-3">Legenda dos Canais</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {channelOptions.map((option) => (
            <div key={option.value} className="flex items-start gap-2">
              <div className="mt-0.5 text-foreground-secondary">{option.icon}</div>
              <div>
                <p className="text-sm font-medium text-foreground">{option.label}</p>
                <p className="text-xs text-foreground-secondary">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

