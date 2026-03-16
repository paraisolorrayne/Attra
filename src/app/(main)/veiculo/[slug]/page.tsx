import { Metadata } from 'next'
import { redirect } from 'next/navigation'
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
import { RelatedVehiclesSkeleton } from '@/components/ui/skeleton'
import { VehicleContextSetter } from '@/components/vehicles/vehicle-context-setter'
import { FAQSection } from '@/components/home'
import { FAQSchema } from '@/components/seo'
import { getVehicleBySlug } from '@/lib/autoconf-api'
import { getVehicleSoundByVehicleId } from '@/lib/vehicle-sounds-storage'
import { formatPrice, formatMileage } from '@/lib/utils'
import { Vehicle } from '@/types'

/** Generate dynamic FAQ items based on vehicle data for SEO */
function generateVehicleFAQs(vehicle: Vehicle) {
	const name = `${vehicle.brand} ${vehicle.model}`
	const faqs: { question: string; answer: string }[] = []

	faqs.push({
		question: `Qual o preço do ${name} na Attra Veículos?`,
		answer: `O ${name} ${vehicle.year_model} está disponível por ${formatPrice(vehicle.price)} na Attra Veículos. ${vehicle.mileage === 0 ? 'Este veículo é 0 km.' : `Este veículo possui ${formatMileage(vehicle.mileage)} rodados.`} Entre em contato para condições de financiamento e formas de pagamento.`,
	})

	faqs.push({
		question: `O ${name} possui garantia?`,
		answer: `${vehicle.is_new || vehicle.mileage === 0 ? `Sim, o ${name} 0 km possui garantia de fábrica integral.` : `Sim, o ${name} seminovo passou pela inspeção rigorosa da Attra e conta com garantia.`} Todos os veículos da Attra passam por curadoria técnica antes de serem disponibilizados para venda.`,
	})

	faqs.push({
		question: `Quais as especificações do ${name} ${vehicle.year_model}?`,
		answer: `O ${name} ${vehicle.year_model} possui motor ${vehicle.fuel_type}, câmbio ${vehicle.transmission}, cor ${vehicle.color}${vehicle.horsepower ? `, ${vehicle.horsepower} cv de potência` : ''}${vehicle.torque ? ` e ${vehicle.torque} Nm de torque` : ''}. ${vehicle.version ? `Versão: ${vehicle.version}.` : ''}`,
	})

	faqs.push({
		question: `A Attra entrega o ${name} em todo o Brasil?`,
		answer: `Sim, a Attra Veículos realiza entrega nacional com logística especializada para veículos de alto valor. O ${name} pode ser entregue em qualquer cidade do Brasil com transporte em caminhão fechado, seguro completo e rastreamento em tempo real.`,
	})

	if (vehicle.mileage > 0) {
		faqs.push({
			question: `Qual a quilometragem do ${name}?`,
			answer: `Este ${name} ${vehicle.year_model} possui ${formatMileage(vehicle.mileage)} rodados. ${vehicle.mileage <= 10000 ? 'Trata-se de um veículo com baixíssima quilometragem, em excelente estado de conservação.' : 'O veículo passou por inspeção completa da equipe técnica da Attra.'}`,
		})
	}

	return faqs
}

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
		redirect('/veiculos?veiculo_indisponivel=true')
	}

	const vehicle = await getVehicleBySlug(slug)

	if (!vehicle) {
		redirect('/veiculos?veiculo_indisponivel=true')
	}

	// Fetch engine sound from admin panel database (if configured)
	const vehicleSound = await getVehicleSoundByVehicleId(vehicle.id)

	const breadcrumbItems = [
		{ label: 'Veículos', href: '/veiculos' },
		{ label: vehicle.brand, href: `/veiculos?marca=${vehicle.brand.toLowerCase()}` },
		{ label: `${vehicle.model} ${vehicle.year_model}` },
	]

	return (
		<main className="min-h-screen bg-background">
			{/* Set vehicle data in global context for WhatsApp button and analytics tracking */}
			<VehicleContextSetter
				vehicleId={vehicle.id}
				vehicleBrand={vehicle.brand}
				vehicleModel={vehicle.model}
				vehicleYear={vehicle.year_model}
				vehiclePrice={vehicle.price}
				vehicleSlug={slug}
				vehicleCategory={vehicle.category}
			/>

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
			<Suspense fallback={<RelatedVehiclesSkeleton />}>
				<RelatedVehicles
					currentVehicleId={vehicle.id}
					brand={vehicle.brand}
					category={vehicle.category}
				/>
			</Suspense>

			{/* Vehicle FAQ — SEO structured data */}
			{(() => {
				const vehicleFaqs = generateVehicleFAQs(vehicle)
				return (
					<>
						<FAQSection
							faqs={vehicleFaqs}
							title={`Perguntas sobre o ${vehicle.brand} ${vehicle.model}`}
							subtitle={`Dúvidas frequentes sobre este ${vehicle.brand} ${vehicle.model} ${vehicle.year_model}`}
							className="mt-0"
						/>
						<FAQSchema faqs={vehicleFaqs} pageName={`${vehicle.brand} ${vehicle.model} ${vehicle.year_model}`} />
					</>
				)
			})()}
		</main>
	)
}
