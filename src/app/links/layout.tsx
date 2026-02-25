import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Links | Attra Veículos',
  description:
    'Seu hub de acesso rápido à Attra Veículos. Fale com um especialista no WhatsApp, veja o estoque completo e conheça nosso showroom.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Attra Veículos – Links',
    description:
      'Curadoria de veículos nacionais, importados e esportivos, com showroom em Uberlândia e entregas em todo o Brasil.',
    type: 'website',
  },
}

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

