'use client'

import { useState } from 'react'
import { Calendar, MessageCircle, Info } from 'lucide-react'
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
  const [isHovered, setIsHovered] = useState(false)
  
  const vehicleName = `${vehicle.brand} ${vehicle.model} ${vehicle.year_model}`
  
  const testDriveMessage = `Olá! Gostaria de agendar um test drive no ${vehicleName}.
  
Valor: ${formatPrice(vehicle.price)}

Quando poderia fazer o agendamento?`

  const moreInfoMessage = `Olá! Vi o ${vehicleName} no site e gostaria de mais informações.

Valor: ${formatPrice(vehicle.price)}

Podem me enviar mais detalhes sobre este veículo?`

  if (variant === 'icon-only') {
    return (
      <div 
        className={`flex gap-2 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <a
          href={getWhatsAppUrl(testDriveMessage)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-lg transition-all"
          title="Agendar Test Drive"
        >
          <Calendar className="w-4 h-4" />
        </a>
        <a
          href={getWhatsAppUrl(moreInfoMessage)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-lg transition-all"
          title="Solicitar Mais Info"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <a href={getWhatsAppUrl(testDriveMessage)} target="_blank" rel="noopener noreferrer">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Test Drive
          </a>
        </Button>
        <Button
          asChild
          size="sm"
          className="flex-1 text-xs"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <a href={getWhatsAppUrl(moreInfoMessage)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            Mais Info
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
          Solicitar Mais Info
        </a>
      </Button>
    </div>
  )
}

