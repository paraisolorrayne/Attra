import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'
import { MarketingAdmin } from './marketing-admin'

export default async function AdminMarketingPage() {
  const admin = await getCurrentAdmin()
  
  if (!admin) {
    redirect('/admin/login')
  }

  return <MarketingAdmin admin={admin} />
}

