import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export const metadata: Metadata = {
	title: 'Compramos seu carro | Attra Veiculos',
	description: 'Envie os dados do seu veiculo premium para avaliacao personalizada com a equipe Attra.',
}

export default function SellYourCarPage() {
	const breadcrumbItems = [
		{ label: 'Compramos seu carro', href: '/compramos-seu-carro' },
	]

	return (
		<section className="pt-28 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-b from-background-soft to-background">
			<Container>
				<Breadcrumb items={breadcrumbItems} afterHero />
				<div className="mt-8">
					<h1 className="text-3xl lg:text-4xl font-bold text-foreground">Compramos seu carro</h1>
					<p className="mt-4 text-foreground-secondary max-w-2xl">
						Preencha o formulário de contato ou fale com nossa equipe para receber uma avaliação exclusiva
						para o seu veículo premium.
					</p>
				</div>
			</Container>
		</section>
	)
}
