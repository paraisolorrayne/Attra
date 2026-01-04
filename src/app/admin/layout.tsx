import type { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/admin-header'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'

export const metadata: Metadata = {
  title: 'Admin Panel | Attra Veículos',
  description: 'Painel administrativo Attra Veículos',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current admin user (may be null on login page)
  const admin = await getCurrentAdmin()

  // Admin pages have a clean layout without main site header/footer
  return (
    <div className="min-h-screen bg-background">
      {admin && <AdminHeader admin={admin} />}
      {children}
    </div>
  )
}

