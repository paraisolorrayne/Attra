import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { VisitorsDashboard } from './visitors-dashboard'

export const metadata = {
  title: 'Visitor Intelligence',
  description: 'Dashboard de inteligência de visitantes e leads',
}

export default async function VisitorsPage() {
  const admin = await getCurrentAdmin()
  
  if (!admin) {
    redirect('/admin/login')
  }

  // Only admin role can access visitor intelligence
  if (admin.role !== 'admin') {
    redirect('/admin')
  }

  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <VisitorsDashboard adminId={admin.id} />
    </Suspense>
  )
}

