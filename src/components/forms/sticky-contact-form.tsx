'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Loader2, X, MessageCircle } from 'lucide-react'
import { sendWhatsAppWebhook, getGeoLocation } from '@/lib/webhook'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  interestType: z.string().min(1, 'Selecione uma opção'),
})

type FormData = z.infer<typeof schema>

const interestOptions = [
  { value: 'comprar', label: 'Comprar' },
  { value: 'vender', label: 'Vender' },
  { value: 'financiamento', label: 'Financiamento' },
  { value: 'test_drive', label: 'Test Drive' },
]

// Storage key to track if user has made contact
const CONTACT_MADE_KEY = 'attra_contact_made'

export function StickyContactForm() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasUserMadeContact, setHasUserMadeContact] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Check if user has already made contact (persisted in sessionStorage)
  useEffect(() => {
    const contactMade = sessionStorage.getItem(CONTACT_MADE_KEY)
    if (contactMade === 'true') {
      setHasUserMadeContact(true)
    }
  }, [])

  // Exit intent detection - only show when user tries to leave without making contact
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger on exit toward top of viewport (leaving page intent)
    if (e.clientY <= 0 && !isDismissed && !hasUserMadeContact && !isVisible) {
      setIsVisible(true)
    }
  }, [isDismissed, hasUserMadeContact, isVisible])

  useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [handleMouseLeave])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const geoLocation = await getGeoLocation()

      await sendWhatsAppWebhook({
        eventType: 'general_inquiry',
        sourcePage: 'exit_intent_form',
        context: {
          userMessage: `Nome: ${data.name}, Email: ${data.email}, Interesse: ${data.interestType}`,
        },
      }, geoLocation)

      // Mark that user has made contact
      sessionStorage.setItem(CONTACT_MADE_KEY, 'true')
      setHasUserMadeContact(true)
      setIsSuccess(true)
      reset()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
  }

  if (!isVisible || isDismissed) return null

  return (
    <div className={cn(
      'fixed right-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-500',
      'hidden lg:block', // Only show on desktop
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    )}>
      <div className="bg-background-card border border-border rounded-l-2xl shadow-2xl shadow-black/20 w-80 overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold text-sm">Fale Conosco</span>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Fechar formulário"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-foreground font-medium mb-1">Mensagem enviada!</p>
              <p className="text-foreground-secondary text-sm">Entraremos em contato em breve.</p>
              <button 
                onClick={() => setIsSuccess(false)} 
                className="text-primary text-sm mt-3 hover:underline"
              >
                Enviar nova mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <p className="text-foreground-secondary text-sm mb-3">
                Preencha seus dados e entraremos em contato rapidamente.
              </p>
              
              <div>
                <Input 
                  {...register('name')} 
                  placeholder="Seu nome *" 
                  error={errors.name?.message}
                  className="h-9 text-sm"
                />
              </div>

              <div>
                <Input 
                  {...register('email')} 
                  type="email" 
                  placeholder="Seu e-mail *" 
                  error={errors.email?.message}
                  className="h-9 text-sm"
                />
              </div>

              <div>
                <Select 
                  {...register('interestType')} 
                  options={interestOptions} 
                  placeholder="Tipo de interesse *"
                  className="h-9 text-sm"
                />
                {errors.interestType && (
                  <p className="mt-1 text-xs text-primary">{errors.interestType.message}</p>
                )}
              </div>

              <Button type="submit" size="sm" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
                ) : (
                  'Enviar Mensagem'
                )}
              </Button>

              <p className="text-[10px] text-foreground-secondary text-center">
                Ao enviar, você concorda com nossa política de privacidade.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

