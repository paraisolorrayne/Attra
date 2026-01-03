import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { BlogTabs } from '@/components/blog'
import { getBlogPosts } from '@/lib/blog-api'
import { EDITORIAL_SECTION } from '@/lib/constants'

export const metadata: Metadata = {
	title: 'Blog Attra | Insights sobre Superesportivos e Veículos Premium',
	description: 'No Blog Attra você encontra Insights exclusivos sobre superesportivos, colecionáveis e mercado premium automotivo. Reviews, análises de especialistas e tendências do setor.',
	keywords: ['blog attra', 'attra insights', 'superesportivos', 'carros premium', 'reviews automotivos', 'mercado de luxo'],
	openGraph: {
		title: 'Blog Attra | Insights sobre Superesportivos e Veículos Premium',
		description: 'Insights exclusivos sobre superesportivos, colecionáveis e mercado premium automotivo.',
		type: 'website',
	},
}

export default async function BlogPage() {
	const breadcrumbItems = [{ label: 'Blog', href: EDITORIAL_SECTION.route }]

	// Fetch posts by type
	const [educativoPosts, reviewPosts] = await Promise.all([
		getBlogPosts({ type: 'educativo' }),
		getBlogPosts({ type: 'car_review' })
	])

	return (
		<main className="bg-background min-h-screen">
			{/* Hero Section */}
			<section className="pt-28 pb-12 bg-gradient-to-b from-background-soft to-background">
				<Container>
					<Breadcrumb items={breadcrumbItems} afterHero />
					<h1 className="mt-6 text-3xl lg:text-5xl font-bold text-foreground">
						{EDITORIAL_SECTION.seoTitle}
					</h1>
					<p className="mt-4 text-lg text-foreground-secondary max-w-2xl">
						No <strong className="text-foreground">{EDITORIAL_SECTION.brandName}</strong>, você encontra
						análises de modelos, reviews exclusivos, tendências de mercado e conteúdos
						especializados do universo dos superesportivos e veículos premium.
					</p>
					<p className="mt-3 text-sm text-foreground-secondary/80 max-w-2xl">
						Acompanhe nosso Blog Attra para insights sobre o mercado automotivo de alto padrão.
					</p>
				</Container>
			</section>

			{/* Blog Content */}
			<section className="py-12">
				<Container>
					<BlogTabs
						educativoPosts={educativoPosts}
						reviewPosts={reviewPosts}
					/>
				</Container>
			</section>
		</main>
	)
}
