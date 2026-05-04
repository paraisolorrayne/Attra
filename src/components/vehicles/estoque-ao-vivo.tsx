'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Car, ArrowRight, Loader2 } from 'lucide-react'
import { formatPrice, formatMileage } from '@/lib/utils'

interface VehicleItem {
	id: string
	slug: string
	brand: string
	model: string
	version: string | null
	year_model: number
	mileage: number
	price: number
	photos: string[]
	is_new: boolean
	status: string
}

interface EstoqueAoVivoProps {
	brand: string
	model: string
	limit?: number
}

export function EstoqueAoVivo({ brand, model, limit = 5 }: EstoqueAoVivoProps) {
	const [vehicles, setVehicles] = useState<VehicleItem[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(false)

	useEffect(() => {
		const fetchVehicles = async () => {
			try {
				const searchQuery = `${brand} ${model}`
				const res = await fetch(
					`/api/vehicles?search=${encodeURIComponent(searchQuery)}&limit=${limit}&sort=price&order=asc`
				)
				const data = await res.json()

				if (data.success && data.vehicles?.length > 0) {
					const available = data.vehicles.filter(
						(v: VehicleItem) => v.status === 'available' || v.status === 'highlight'
					)
					setVehicles(available)
				}
			} catch {
				setError(true)
			} finally {
				setIsLoading(false)
			}
		}

		fetchVehicles()
	}, [brand, model, limit])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8 text-foreground-secondary">
				<Loader2 className="w-5 h-5 animate-spin mr-2" />
				Consultando estoque...
			</div>
		)
	}

	if (error || vehicles.length === 0) {
		return (
			<div className="p-6 bg-background-card border border-border rounded-xl text-center">
				<Car className="w-8 h-8 text-foreground-secondary mx-auto mb-3" />
				<p className="text-foreground-secondary mb-4">
					Nenhum {brand} {model} disponível no estoque no momento.
				</p>
				<Link
					href="/veiculos"
					className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
				>
					Ver estoque completo <ArrowRight className="w-4 h-4" />
				</Link>
			</div>
		)
	}

	const lowestPrice = Math.min(...vehicles.map(v => v.price))

	return (
		<div>
			<p className="text-sm text-foreground-secondary mb-4">
				{vehicles.length} unidade{vehicles.length > 1 ? 's' : ''} disponíve{vehicles.length > 1 ? 'is' : 'l'} a partir de{' '}
				<span className="font-semibold text-foreground">{formatPrice(lowestPrice)}</span>
			</p>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{vehicles.slice(0, limit).map(v => (
					<Link
						key={v.id}
						href={`/veiculo/${v.slug}`}
						className="group block p-3 bg-background-card border border-border rounded-xl hover:border-primary/50 transition-colors"
					>
						{v.photos[0] && (
							<div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3">
								<Image
									src={v.photos[0]}
									alt={`${v.brand} ${v.model} ${v.year_model}`}
									fill
									className="object-cover group-hover:scale-105 transition-transform duration-300"
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
								/>
								{v.is_new && (
									<span className="absolute top-2 left-2 px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded">
										0 km
									</span>
								)}
							</div>
						)}
						<div>
							<h3 className="text-sm font-semibold text-foreground truncate">
								{v.brand} {v.model} {v.version ? v.version : ''} {v.year_model}
							</h3>
							<p className="text-xs text-foreground-secondary mt-0.5">
								{v.is_new ? '0 km' : formatMileage(v.mileage)}
							</p>
							<p className="text-base font-bold text-foreground mt-1">
								{formatPrice(v.price)}
							</p>
						</div>
					</Link>
				))}
			</div>
			<div className="mt-4 text-center">
				<Link
					href={`/veiculos?search=${encodeURIComponent(`${brand} ${model}`)}`}
					className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
				>
					Ver todos os {brand} {model} disponíveis <ArrowRight className="w-4 h-4" />
				</Link>
			</div>
		</div>
	)
}
