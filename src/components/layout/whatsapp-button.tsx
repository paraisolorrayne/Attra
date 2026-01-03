'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Car, Wrench, HelpCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sendWhatsAppWebhook } from '@/lib/webhook'
import { useToast } from '@/components/ui/toast'

interface WhatsAppButtonProps {
  vehicleId?: string
  vehicleBrand?: string
  vehicleModel?: string
  sourcePage: string
}

// Context-aware messages based on page
const getContextMessage = (sourcePage: string, vehicleBrand?: string, vehicleModel?: string) => {
  if (vehicleBrand && vehicleModel) {
    return {
      title: `Interesse no ${vehicleBrand} ${vehicleModel}?`,
      subtitle: 'Fale com um consultor especializado',
      message: `Olá! Tenho interesse no ${vehicleBrand} ${vehicleModel}. Gostaria de mais informações.`,
      icon: Car,
    }
  }

  if (sourcePage.includes('estoque')) {
    return {
      title: 'Procurando algo específico?',
      subtitle: 'Nossos consultores podem ajudar',
      message: 'Olá! Estou navegando pelo estoque e gostaria de ajuda para encontrar o veículo ideal.',
      icon: Car,
    }
  }

  if (sourcePage.includes('financiamento') || sourcePage.includes('servico')) {
    return {
      title: 'Dúvidas sobre serviços?',
      subtitle: 'Atendimento especializado',
      message: 'Olá! Gostaria de informações sobre os serviços da Attra.',
      icon: Wrench,
    }
  }

  if (sourcePage.includes('jornada')) {
    return {
      title: 'Quer agendar uma visita?',
      subtitle: 'Conheça nosso showroom',
      message: 'Olá! Gostaria de agendar uma visita ao showroom da Attra.',
      icon: Car,
    }
  }

  return {
    title: 'Fale conosco!',
    subtitle: 'Atendimento rápido e personalizado',
    message: 'Olá! Gostaria de mais informações sobre a Attra Veículos.',
    icon: HelpCircle,
  }
}

export function WhatsAppButton({ vehicleId, vehicleBrand, vehicleModel, sourcePage }: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { showToast, hideToast } = useToast()

  const context = getContextMessage(sourcePage, vehicleBrand, vehicleModel)
  const IconComponent = context.icon

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-show tooltip after 10 seconds if user hasn't interacted
  useEffect(() => {
    if (!hasInteracted) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [hasInteracted])

  const handleClick = async () => {
    if (isLoading) return

    setHasInteracted(true)
    setIsOpen(false)
    setIsLoading(true)

    // Show loading toast
    const loadingId = showToast('loading', 'Enviando mensagem...')

    // Send to N8N webhook (no more WhatsApp redirect)
    const result = await sendWhatsAppWebhook({
      eventType: vehicleId ? 'vehicle_inquiry' : 'chat_request',
      sourcePage,
      context: {
        vehicleId,
        vehicleBrand,
        vehicleModel,
        scrollProgress: Math.round(scrollProgress),
        timeOnPage: Math.round(performance.now() / 1000),
        userMessage: context.message,
      },
    })

    // Hide loading and show result
    hideToast(loadingId)
    setIsLoading(false)

    if (result.success) {
      showToast('success', result.message)
    } else {
      showToast('error', result.message)
    }
  }

  return (
    <>
      {/* Floating button with pulse animation */}
      <button
        onClick={handleClick}
        onMouseEnter={() => { if (!isLoading) { setIsOpen(true); setHasInteracted(true) } }}
        disabled={isLoading}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-300 hover:scale-110',
          !hasInteracted && !isLoading && 'animate-pulse-glow',
          isLoading && 'opacity-80 cursor-wait'
        )}
        aria-label="Conversar no WhatsApp"
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Context-aware tooltip */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 bg-background-card border border-border rounded-2xl shadow-2xl p-5 w-72 transition-all duration-300',
          isOpen && !isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          onClick={() => { setIsOpen(false); setHasInteracted(true) }}
          className="absolute top-3 right-3 p-1 text-foreground-secondary hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-green-500/10 rounded-xl shrink-0">
            <IconComponent className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-foreground font-semibold">{context.title}</p>
            <p className="text-foreground-secondary text-sm">{context.subtitle}</p>
          </div>
        </div>

        <button
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            'w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 px-4 font-medium transition-colors btn-press',
            isLoading && 'opacity-80 cursor-wait'
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <MessageCircle className="w-5 h-5" />
          )}
          {isLoading ? 'Enviando...' : 'Iniciar conversa'}
        </button>

        <p className="text-xs text-foreground-secondary text-center mt-3">
          Resposta em até 5 minutos
        </p>
      </div>
    </>
  )
}

