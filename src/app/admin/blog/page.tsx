import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/admin-auth'
import { BlogAdmin } from './blog-admin'

export default async function AdminBlogPage() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect('/admin/login')
  }

  return <BlogAdmin />
}

