import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/admin-auth'
import { EngineSoundsAdmin } from './engine-sounds-admin'

export default async function AdminEngineSoundsPage() {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    redirect('/admin/login')
  }

  return <EngineSoundsAdmin />
}

