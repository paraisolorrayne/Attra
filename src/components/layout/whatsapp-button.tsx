'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Car, Wrench, HelpCircle, Loader2, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sendWhatsAppWebhook, sendToLeadsterWithoutAI, sendToLeadsterWithAI, getGeoLocation, generateVehicleMessage } from '@/lib/webhook'
import { useToast } from '@/components/ui/toast'
import { WHATSAPP_NUMBER } from '@/lib/constants'
import { GeoLocation } from '@/types'

interface WhatsAppButtonProps {
  vehicleId?: string
  vehicleBrand?: string
  vehicleModel?: string
  sourcePage: string
}

// Page behavior types
type PageBehavior = 'vehicle' | 'estoque' | 'general'

// Determine page behavior based on sourcePage
const getPageBehavior = (sourcePage: string, vehicleId?: string): PageBehavior => {
  // Vehicle page: /veiculo/[slug] - uses N8N webhook, shows toast
  if (sourcePage.includes('/veiculo/') || vehicleId) {
    return 'vehicle'
  }

  // Estoque page: /estoque - Leadster sem IA + redirect WhatsApp
  if (sourcePage === '/estoque' || sourcePage.startsWith('/estoque')) {
    return 'estoque'
  }

  // All other pages: Leadster com IA + chat widget
  return 'general'
}

// Context-aware messages based on page and behavior
const getContextMessage = (sourcePage: string, vehicleBrand?: string, vehicleModel?: string) => {
  const behavior = getPageBehavior(sourcePage, vehicleBrand ? 'temp' : undefined)

  if (vehicleBrand && vehicleModel) {
    return {
      title: `Interesse no ${vehicleBrand} ${vehicleModel}?`,
      subtitle: 'Fale com um consultor especializado',
      message: `Olá! Tenho interesse no ${vehicleBrand} ${vehicleModel}. Gostaria de mais informações.`,
      icon: Car,
      buttonText: 'Tenho interesse',
      behavior: 'vehicle' as PageBehavior,
    }
  }

  if (behavior === 'estoque') {
    return {
      title: 'Procurando algo específico?',
      subtitle: 'Fale diretamente no WhatsApp',
      message: 'Olá! Estou navegando pelo estoque e gostaria de ajuda para encontrar o veículo ideal.',
      icon: Car,
      buttonText: 'Abrir WhatsApp',
      behavior: 'estoque' as PageBehavior,
    }
  }

  if (sourcePage.includes('financiamento') || sourcePage.includes('servico')) {
    return {
      title: 'Dúvidas sobre serviços?',
      subtitle: 'Atendimento com IA inteligente',
      message: 'Olá! Gostaria de informações sobre os serviços da Attra.',
      icon: Wrench,
      buttonText: 'Iniciar chat',
      behavior: 'general' as PageBehavior,
    }
  }

  if (sourcePage.includes('jornada')) {
    return {
      title: 'Quer agendar uma visita?',
      subtitle: 'Nosso assistente pode ajudar',
      message: 'Olá! Gostaria de agendar uma visita ao showroom da Attra.',
      icon: Car,
      buttonText: 'Iniciar chat',
      behavior: 'general' as PageBehavior,
    }
  }

  return {
    title: 'Fale conosco!',
    subtitle: 'Atendimento inteligente 24h',
    message: 'Olá! Gostaria de mais informações sobre a Attra Veículos.',
    icon: Bot,
    buttonText: 'Iniciar chat',
    behavior: 'general' as PageBehavior,
  }
}

export function WhatsAppButton({ vehicleId, vehicleBrand, vehicleModel, sourcePage }: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([])
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null)
  const { showToast, hideToast } = useToast()

  const context = getContextMessage(sourcePage, vehicleBrand, vehicleModel)
  const IconComponent = context.icon
  const pageBehavior = getPageBehavior(sourcePage, vehicleId)

  // Fetch geolocation on mount (only once)
  useEffect(() => {
    const fetchGeoLocation = async () => {
      const location = await getGeoLocation()
      if (location) {
        setGeoLocation(location)
        console.log('[WhatsAppButton] GeoLocation loaded:', location.city, location.region)
      }
    }
    fetchGeoLocation()
  }, [])

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
    if (!hasInteracted && !isChatOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [hasInteracted, isChatOpen])

  // Generate WhatsApp redirect URL with formatted message including location
  const getWhatsAppRedirectUrl = () => {
    const formattedMessage = generateVehicleMessage(vehicleBrand, vehicleModel, undefined, geoLocation)
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(formattedMessage)}`
  }

  const handleClick = async () => {
    if (isLoading) return

    setHasInteracted(true)
    setIsOpen(false)
    setIsLoading(true)

    const basePayload = {
      eventType: vehicleId ? 'vehicle_inquiry' : 'chat_request' as const,
      sourcePage,
      context: {
        vehicleId,
        vehicleBrand,
        vehicleModel,
        scrollProgress: Math.round(scrollProgress),
        timeOnPage: Math.round(performance.now() / 1000),
        userMessage: context.message,
      },
    }

    // BEHAVIOR 1: Vehicle page - N8N webhook + redirect to WhatsApp
    if (pageBehavior === 'vehicle') {
      const loadingId = showToast('loading', 'Conectando ao WhatsApp...')

      // Send to N8N webhook with geolocation
      await sendWhatsAppWebhook(basePayload, geoLocation)

      hideToast(loadingId)
      setIsLoading(false)

      // Redirect to WhatsApp with formatted message
      showToast('success', 'Abrindo WhatsApp...')

      setTimeout(() => {
        window.open(getWhatsAppRedirectUrl(), '_blank')
      }, 300)
      return
    }

    // BEHAVIOR 2: Estoque page - Leadster sem IA + chat widget estático
    if (pageBehavior === 'estoque') {
      const loadingId = showToast('loading', 'Iniciando atendimento...')

      // Send to Leadster (no AI)
      await sendToLeadsterWithoutAI(basePayload)

      hideToast(loadingId)
      setIsLoading(false)

      // Open static chat widget (no AI)
      setChatMessages([
        { role: 'assistant', content: 'Olá! Bem-vindo ao atendimento da Attra Veículos. Em que posso ajudar?' },
        { role: 'assistant', content: 'Um consultor especializado irá responder sua mensagem em breve. Enquanto isso, pode me contar o que está procurando!' }
      ])
      setIsChatOpen(true)
      return
    }

    // BEHAVIOR 3: General pages - Leadster com IA + chat widget
    const loadingId = showToast('loading', 'Iniciando chat inteligente...')

    const result = await sendToLeadsterWithAI(basePayload)

    hideToast(loadingId)
    setIsLoading(false)

    if (result.success) {
      // Open chat widget with initial message
      setChatMessages([
        { role: 'assistant', content: 'Olá! Sou o assistente virtual da Attra Veículos. Como posso ajudar você hoje?' }
      ])
      setIsChatOpen(true)
    } else {
      showToast('error', result.message)
    }
  }

  // Close chat widget
  const handleCloseChat = () => {
    setIsChatOpen(false)
  }

  // Get loading text based on behavior
  const getLoadingText = () => {
    switch (pageBehavior) {
      case 'vehicle': return 'Enviando...'
      case 'estoque': return 'Abrindo WhatsApp...'
      case 'general': return 'Iniciando chat...'
    }
  }

  // Get subtitle text based on behavior
  const getSubtitleText = () => {
    switch (pageBehavior) {
      case 'vehicle': return 'Nossa equipe entrará em contato'
      case 'estoque': return 'Atendimento direto no WhatsApp'
      case 'general': return 'Atendimento inteligente 24h'
    }
  }

  return (
    <>
      {/* Floating button with pulse animation */}
      <button
        onClick={isChatOpen ? handleCloseChat : handleClick}
        onMouseEnter={() => { if (!isLoading && !isChatOpen) { setIsOpen(true); setHasInteracted(true) } }}
        disabled={isLoading}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110',
          pageBehavior === 'general' ? 'bg-primary hover:bg-primary-hover' : 'bg-green-500 hover:bg-green-600',
          !hasInteracted && !isLoading && !isChatOpen && 'animate-pulse-glow',
          isLoading && 'opacity-80 cursor-wait'
        )}
        aria-label={isChatOpen ? 'Fechar chat' : 'Iniciar conversa'}
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isChatOpen ? (
          <X className="w-6 h-6" />
        ) : pageBehavior === 'general' ? (
          <Bot className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Context-aware tooltip */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 bg-background-card border border-border rounded-2xl shadow-2xl p-5 w-72 transition-all duration-300',
          isOpen && !isLoading && !isChatOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
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
          <div className={cn(
            'p-2 rounded-xl shrink-0',
            pageBehavior === 'general' ? 'bg-primary/10' : 'bg-green-500/10'
          )}>
            <IconComponent className={cn(
              'w-5 h-5',
              pageBehavior === 'general' ? 'text-primary' : 'text-green-500'
            )} />
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
            'w-full flex items-center justify-center gap-2 text-white rounded-xl py-3 px-4 font-medium transition-colors btn-press',
            pageBehavior === 'general' ? 'bg-primary hover:bg-primary-hover' : 'bg-green-500 hover:bg-green-600',
            isLoading && 'opacity-80 cursor-wait'
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : pageBehavior === 'general' ? (
            <Bot className="w-5 h-5" />
          ) : (
            <MessageCircle className="w-5 h-5" />
          )}
          {isLoading ? getLoadingText() : context.buttonText}
        </button>

        <p className="text-xs text-foreground-secondary text-center mt-3">
          {getSubtitleText()}
        </p>
      </div>

      {/* Chat Widget - appears for both estoque (static) and general (AI) pages */}
      {isChatOpen && (pageBehavior === 'general' || pageBehavior === 'estoque') && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] max-h-[70vh] bg-background-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Chat Header */}
          <div className={cn(
            "flex items-center justify-between p-4 border-b border-border text-white rounded-t-2xl",
            pageBehavior === 'estoque' ? 'bg-secondary' : 'bg-primary'
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                {pageBehavior === 'estoque' ? <MessageCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-semibold">{pageBehavior === 'estoque' ? 'Atendimento Attra' : 'Assistente Attra'}</p>
                <p className="text-xs text-white/80">{pageBehavior === 'estoque' ? 'Aguardando consultor' : 'Online agora'}</p>
              </div>
            </div>
            <button
              onClick={handleCloseChat}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'max-w-[80%] p-3 rounded-2xl',
                  msg.role === 'assistant'
                    ? 'bg-background border border-border rounded-bl-sm'
                    : 'bg-primary text-white ml-auto rounded-br-sm'
                )}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const userMessage = e.currentTarget.value.trim()
                    // Different response based on page behavior
                    const assistantResponse = pageBehavior === 'estoque'
                      ? 'Mensagem recebida! Um consultor irá responder em breve. Obrigado pela paciência.'
                      : 'Obrigado pela sua mensagem! Um consultor especializado entrará em contato em breve. Enquanto isso, posso ajudar com informações gerais sobre nossos veículos e serviços.'
                    setChatMessages(prev => [
                      ...prev,
                      { role: 'user', content: userMessage },
                      { role: 'assistant', content: assistantResponse }
                    ])
                    e.currentTarget.value = ''
                  }
                }}
              />
              <button className="px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-foreground-secondary text-center mt-2">
              {pageBehavior === 'estoque' ? 'Atendimento humano' : 'Powered by Leadster AI'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

