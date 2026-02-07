import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'
import { SettingsAdmin } from './settings-admin'

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin()
  
  if (!admin) {
    redirect('/admin/login')
  }

  // Only admin role can access settings
  if (admin.role !== 'admin') {
    redirect('/admin/engine-sounds')
  }

  return <SettingsAdmin />
}

