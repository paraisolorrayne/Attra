import { AttraLoader, VehicleDetailSkeleton } from '@/components/ui/skeleton'

export default function VehicleLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Branded loader overlay */}
      <div className="pt-28 pb-8">
        <AttraLoader variant="section" text="Carregando veículo" className="min-h-[200px]" />
      </div>
      <VehicleDetailSkeleton />
    </main>
  )
}

