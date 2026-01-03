'use client'

import { useState } from 'react'
import { MessageCircle, Phone, Mail, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Vehicle } from '@/types'
import { getVehicleWhatsAppMessage } from '@/lib/utils'
import { sendWhatsAppWebhook } from '@/lib/webhook'
import { useToast } from '@/components/ui/toast'

interface VehicleContactProps {
  vehicle: Vehicle
  compact?: boolean
}

export function VehicleContact({ vehicle, compact = false }: VehicleContactProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { showToast, hideToast } = useToast()

  const handleWhatsAppClick = async () => {
    if (isLoading) return

    setIsLoading(true)
    const loadingId = showToast('loading', 'Enviando mensagem...')

    const result = await sendWhatsAppWebhook({
      eventType: 'vehicle_inquiry',
      sourcePage: `/veiculo/${vehicle.slug}`,
      context: {
        vehicleId: vehicle.id,
        vehicleBrand: vehicle.brand,
        vehicleModel: vehicle.model,
        vehicleYear: vehicle.year_model,
        vehiclePrice: vehicle.price,
        vehicleSlug: vehicle.slug,
        userMessage: getVehicleWhatsAppMessage(vehicle),
      },
    })

    hideToast(loadingId)
    setIsLoading(false)

    if (result.success) {
      showToast('success', result.message)
    } else {
      showToast('error', result.message)
    }
  }

  const isSold = vehicle.status === 'sold'

  // Compact mode for sidebar
  if (compact) {
    return (
      <div className="space-y-3">
        <Button
          onClick={handleWhatsAppClick}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-hover text-white"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <MessageCircle className="w-5 h-5 mr-2" />
          )}
          {isLoading ? 'Enviando...' : 'Falar com consultor'}
        </Button>
        <div className="flex gap-2">
          <a
            href="tel:+553432563100"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-background border border-border rounded-lg text-foreground hover:bg-background-soft transition-colors text-sm"
          >
            <Phone className="w-4 h-4" />
            Ligar
          </a>
          <a
            href={`/financiamento?veiculo=${vehicle.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-background border border-border rounded-lg text-foreground hover:bg-background-soft transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            Financiar
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        {isSold ? 'Buscar veículo similar' : 'Interessado?'}
      </h2>

      <div className="space-y-3">
        {/* WhatsApp CTA */}
        <Button
          onClick={handleWhatsAppClick}
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <MessageCircle className="w-5 h-5 mr-2" />
          )}
          {isLoading
            ? 'Enviando...'
            : isSold
              ? 'Buscar similar no WhatsApp'
              : 'Falar no WhatsApp'
          }
        </Button>

        {/* Phone */}
        <a
          href="tel:+553432563100"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-background border border-border rounded-lg text-foreground hover:bg-background-soft transition-colors"
        >
          <Phone className="w-5 h-5" />
          Ligar agora
        </a>

        {/* Email */}
        <a
          href={`mailto:contato@attraveiculos.com.br?subject=Interesse: ${vehicle.brand} ${vehicle.model} ${vehicle.year_model}`}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-background border border-border rounded-lg text-foreground hover:bg-background-soft transition-colors"
        >
          <Mail className="w-5 h-5" />
          Enviar e-mail
        </a>

        {/* Financing */}
        {!isSold && (
          <a
            href={`/financiamento?veiculo=${vehicle.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-background border border-border rounded-lg text-foreground hover:bg-background-soft transition-colors"
          >
            <FileText className="w-5 h-5" />
            Simular financiamento
          </a>
        )}
      </div>

      {/* Trust badges */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-foreground-secondary text-center">
          ✓ Veículo verificado • ✓ Documentação em dia • ✓ Garantia de procedência
        </p>
      </div>
    </div>
  )
}

