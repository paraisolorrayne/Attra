import { redirect } from 'next/navigation'

export default async function ClienteDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/admin/crm/contatos/${id}`)
}
