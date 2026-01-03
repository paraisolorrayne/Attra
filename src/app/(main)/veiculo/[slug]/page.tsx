import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Container } from '@/components/ui/container'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { CinematicGallery } from '@/components/vehicles/cinematic-gallery'
import { VehicleInfo } from '@/components/vehicles/vehicle-info'
import { VehicleSpecs } from '@/components/vehicles/vehicle-specs'
import { VehicleOptions } from '@/components/vehicles/vehicle-options'
import { VehicleContact } from '@/components/vehicles/vehicle-contact'
import { RelatedVehicles } from '@/components/vehicles/related-vehicles'
import { EngineAudioPlayer } from '@/components/vehicles/engine-audio-player'
import { AIVehicleDescription, AIVehicleDescriptionSkeleton } from '@/components/vehicles/ai-vehicle-description'
import { getVehicleBySlug } from '@/lib/autoconf-api'
import { getVehicleSoundByVehicleId } from '@/lib/vehicle-sounds-storage'
import { formatPrice } from '@/lib/utils'

interface VehiclePageProps {
	params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: VehiclePageProps): Promise<Metadata> {
	const { slug } = await params
	const vehicle = await getVehicleBySlug(slug)

	if (!vehicle) {
		return {
			title: 'Veículo não encontrado | Attra Veículos',
			description: 'O veículo solicitado não foi encontrado em nosso estoque.',
		}
	}

	return {
		title: vehicle.seo_title || `${vehicle.brand} ${vehicle.model} ${vehicle.year_model} | Attra Veículos`,
		description: vehicle.seo_description || `${vehicle.brand} ${vehicle.model} ${vehicle.year_model} com ${vehicle.mileage.toLocaleString('pt-BR')} km. ${formatPrice(vehicle.price)}. Compre com a Attra Veículos em Uberlândia.`,
		openGraph: {
			title: `${vehicle.brand} ${vehicle.model} ${vehicle.year_model}`,
			description: vehicle.description || `${vehicle.brand} ${vehicle.model} à venda na Attra Veículos`,
			images: vehicle.photos?.[0] ? [{ url: vehicle.photos[0] }] : [],
		},
	}
}

export default async function VehiclePage({ params }: VehiclePageProps) {
	const { slug } = await params

	if (!slug) {
		notFound()
	}

	const vehicle = await getVehicleBySlug(slug)

	if (!vehicle) {
		notFound()
	}

	// Fetch engine sound from admin panel database (if configured)
	const vehicleSound = await getVehicleSoundByVehicleId(vehicle.id)

	const breadcrumbItems = [
		{ label: 'Estoque', href: '/estoque' },
		{ label: vehicle.brand, href: `/estoque?marca=${vehicle.brand.toLowerCase()}` },
		{ label: `${vehicle.model} ${vehicle.year_model}` },
	]

	return (
		<main className="min-h-screen bg-background">
			{/* Hero Gallery - 60-70% viewport */}
			{vehicle.photos && vehicle.photos.length > 0 ? (
				<CinematicGallery
					photos={vehicle.photos}
					vehicleName={`${vehicle.brand} ${vehicle.model}`}
				/>
			) : (
				<div className="h-[40vh] bg-background-soft flex items-center justify-center">
					<p className="text-foreground-secondary">Sem imagens disponíveis</p>
				</div>
			)}

			{/* Vehicle Details Section */}
			<Container className="py-8 lg:py-12">
				{/* Breadcrumb - afterHero because it comes after full-screen gallery */}
				<Breadcrumb items={breadcrumbItems} afterHero />

				{/* Main content grid */}
				<div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left column - Main info */}
					<div className="lg:col-span-2 space-y-8">
						{/* Title and price - mobile visible */}
						<div className="lg:hidden">
							<p className="text-primary text-sm font-medium uppercase tracking-wider mb-1">
								{vehicle.brand}
							</p>
							<h1 className="text-3xl font-bold text-foreground mb-2">
								{vehicle.model}
							</h1>
							<p className="text-foreground-secondary mb-4">
								{vehicle.version && `${vehicle.version} • `}
								{vehicle.year_manufacture}/{vehicle.year_model}
							</p>
							<p className="text-3xl font-bold text-foreground">
								{formatPrice(vehicle.price)}
							</p>
						</div>

						{/* Engine Audio Player - shows if vehicle has sound configured in admin */}
						{vehicleSound && (
							<EngineAudioPlayer
								audioUrl={vehicleSound.sound_file_url}
								vehicleName={`${vehicle.brand} ${vehicle.model}`}
								isElectric={vehicleSound.is_electric}
							/>
						)}

						{/* AI-Generated Description */}
						<Suspense fallback={<AIVehicleDescriptionSkeleton />}>
							<AIVehicleDescription vehicle={vehicle} />
						</Suspense>

						{/* Specs */}
						<VehicleSpecs vehicle={vehicle} />

						{/* Options */}
						{vehicle.options && vehicle.options.length > 0 && (
							<VehicleOptions options={vehicle.options} />
						)}

						{/* Performance specs (if available) */}
						{(vehicle.horsepower || vehicle.torque || vehicle.acceleration || vehicle.top_speed) && (
							<div className="bg-background-card border border-border rounded-xl p-6">
								<h2 className="text-xl font-semibold text-foreground mb-6">
									Performance
								</h2>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
									{vehicle.horsepower && (
										<div className="text-center p-4 bg-background rounded-xl">
											<p className="text-3xl font-bold text-primary">{vehicle.horsepower}</p>
											<p className="text-sm text-foreground-secondary">cv</p>
										</div>
									)}
									{vehicle.torque && (
										<div className="text-center p-4 bg-background rounded-xl">
											<p className="text-3xl font-bold text-primary">{vehicle.torque}</p>
											<p className="text-sm text-foreground-secondary">Nm</p>
										</div>
									)}
									{vehicle.acceleration && (
										<div className="text-center p-4 bg-background rounded-xl">
											<p className="text-3xl font-bold text-primary">{vehicle.acceleration}</p>
											<p className="text-sm text-foreground-secondary">0-100 km/h</p>
										</div>
									)}
									{vehicle.top_speed && (
										<div className="text-center p-4 bg-background rounded-xl">
											<p className="text-3xl font-bold text-primary">{vehicle.top_speed}</p>
											<p className="text-sm text-foreground-secondary">km/h máx</p>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Contact - Mobile */}
						<div className="lg:hidden">
							<VehicleContact vehicle={vehicle} />
						</div>
					</div>

					{/* Right column - Sidebar */}
					<div className="hidden lg:block">
						<div className="sticky top-24 space-y-6">
							<VehicleInfo vehicle={vehicle} />
							<VehicleContact vehicle={vehicle} compact />
						</div>
					</div>
				</div>
			</Container>

			{/* Related Vehicles */}
			<Suspense fallback={
				<div className="py-16 bg-background-soft">
					<Container>
						<div className="animate-pulse">
							<div className="h-8 bg-foreground-secondary/10 rounded w-48 mb-8" />
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="bg-background-card rounded-xl overflow-hidden">
										<div className="aspect-[4/3] bg-foreground-secondary/10" />
										<div className="p-4 space-y-3">
											<div className="h-5 bg-foreground-secondary/10 rounded w-3/4" />
											<div className="h-4 bg-foreground-secondary/10 rounded w-1/2" />
										</div>
									</div>
								))}
							</div>
						</div>
					</Container>
				</div>
			}>
				<RelatedVehicles
					currentVehicleId={vehicle.id}
					brand={vehicle.brand}
					category={vehicle.category}
				/>
			</Suspense>
		</main>
	)
}
