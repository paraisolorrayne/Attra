'use client'

import { Calendar, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getWhatsAppUrl } from '@/lib/constants'
import { Vehicle } from '@/types'
import { formatPrice } from '@/lib/utils'

interface VehicleCardCTAsProps {
  vehicle: Vehicle
  variant?: 'full' | 'compact' | 'icon-only'
  className?: string
}

export function VehicleCardCTAs({ vehicle, variant = 'compact', className = '' }: VehicleCardCTAsProps) {
  const vehicleName = `${vehicle.brand} ${vehicle.model} ${vehicle.year_model}`

  const testDriveMessage = `Olá! Gostaria de agendar um test drive no ${vehicleName}.

Valor: ${formatPrice(vehicle.price)}

Quando poderia fazer o agendamento?`

  const moreInfoMessage = `Olá! Vi o ${vehicleName} no site e gostaria de falar com um consultor sobre este veículo.

Valor: ${formatPrice(vehicle.price)}

Podem me enviar mais detalhes?`

  if (variant === 'icon-only') {
    return (
      <div className={`flex gap-2 ${className}`}>
        <a
          href={getWhatsAppUrl(moreInfoMessage)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-lg transition-all"
          title="Conversar com consultor no WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`${className}`}>
        <Button
          asChild
          size="md"
          className="w-full"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <a href={getWhatsAppUrl(moreInfoMessage)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Falar com Consultor
          </a>
        </Button>
      </div>
    )
  }

  // Full variant
  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        asChild
        variant="outline"
        className="w-full justify-start"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <a href={getWhatsAppUrl(testDriveMessage)} target="_blank" rel="noopener noreferrer">
          <Calendar className="w-4 h-4 mr-2" />
          Agendar Test Drive
        </a>
      </Button>
      <Button
        asChild
        className="w-full justify-start"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <a href={getWhatsAppUrl(moreInfoMessage)} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="w-4 h-4 mr-2" />
          Conversar com Consultor no WhatsApp
        </a>
      </Button>
    </div>
  )
}

