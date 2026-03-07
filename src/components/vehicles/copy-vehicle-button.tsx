'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Vehicle } from '@/types'

export function CopyVehicleButton({ vehicle }: { vehicle: Vehicle }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        const formatPrice = (price: number) => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(price)
        }

        const textToCopy = `${vehicle.brand.toUpperCase()} ${vehicle.model.toUpperCase()}
${vehicle.version || ''}
Ano: ${vehicle.year_model}
Quilometragem: ${vehicle.mileage.toLocaleString('pt-BR')} km
Valor: ${formatPrice(vehicle.price)}`

        try {
            await navigator.clipboard.writeText(textToCopy.trim())
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    return (
        <button
            onClick={handleCopy}
            className="p-2 text-foreground-secondary hover:text-white transition-colors hover:bg-white/5 rounded-md flex items-center justify-center cursor-pointer"
            title="Copiar informações do veículo"
            aria-label="Copiar informações básicas do veículo"
        >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
        </button>
    )
}
