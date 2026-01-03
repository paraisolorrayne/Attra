import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel | Attra Veículos',
  description: 'Painel administrativo Attra Veículos',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Admin pages have a clean layout without main site header/footer
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}

