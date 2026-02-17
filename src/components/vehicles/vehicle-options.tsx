import { Check } from 'lucide-react'
import { matchOptionToManualTerm } from '@/lib/manual-attra-data'
import { GlossaryTooltip } from './glossary-tooltip'

interface VehicleOptionsProps {
  options: string[]
}

export function VehicleOptions({ options }: VehicleOptionsProps) {
  if (!options || options.length === 0) return null

  return (
    <div className="bg-background-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Opcionais</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, index) => {
          const matchedTerm = matchOptionToManualTerm(option)

          return (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-background transition-colors"
            >
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              {matchedTerm ? (
                <GlossaryTooltip term={matchedTerm}>
                  <span className="text-foreground">{option}</span>
                </GlossaryTooltip>
              ) : (
                <span className="text-foreground">{option}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

