import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { AdminUser } from '@/lib/admin-auth-supabase'

// Supervisão de admins: contas listadas aqui têm papel `admin` mas as ações
// destrutivas (deletes, mudanças de configuração) são bloqueadas e geram
// alerta por e-mail para a aprovadora executar/autorizar.
//
// Lista configurável por env (csv) sem depender de mudança de schema:
//   ADMIN_SUPERVISED_EMAILS=fulana@x.com,beltrano@y.com
// Sem a env, vale o default abaixo.
const DEFAULT_SUPERVISED = ['cristiane@attraveiculos.com.br']
const APPROVER_EMAIL = process.env.ADMIN_APPROVER_EMAIL || 'lorrayne@dexidigital.com.br'

function supervisedEmails(): string[] {
  const env = process.env.ADMIN_SUPERVISED_EMAILS
  if (env) return env.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return DEFAULT_SUPERVISED
}

export function isSupervisedAdmin(admin: Pick<AdminUser, 'email'>): boolean {
  return supervisedEmails().includes(admin.email.toLowerCase())
}

async function notifyApprover(adminEmail: string, action: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  try {
    await new Resend(apiKey).emails.send({
      from: 'Attra Admin <notificacoes@attraveiculos.com.br>',
      to: [APPROVER_EMAIL],
      subject: `🔒 Aprovação necessária: ${adminEmail} tentou "${action}"`,
      html: `<p><strong>${adminEmail}</strong> tentou executar uma ação supervisionada no painel admin:</p>
<p style="background:#f5f5f5;padding:12px;border-radius:8px"><strong>${action}</strong></p>
<p>A ação foi bloqueada. Se estiver de acordo, execute-a com a sua conta ou oriente os próximos passos.</p>
<p style="color:#888;font-size:12px">${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} — attraveiculos.com.br/admin</p>`,
    })
  } catch (err) {
    console.error('[Supervision] Falha ao notificar aprovadora:', err)
  }
}

/**
 * Guard para rotas de API destrutivas. Uso, logo após obter o admin:
 *
 *   const blocked = await guardSupervisedAction(admin, 'Excluir post do blog')
 *   if (blocked) return blocked
 *
 * Retorna a resposta 403 quando o admin é supervisionado (e alerta a
 * aprovadora); retorna null quando a ação pode seguir.
 */
export async function guardSupervisedAction(
  admin: Pick<AdminUser, 'email'>,
  action: string,
): Promise<NextResponse | null> {
  if (!isSupervisedAdmin(admin)) return null

  console.warn(`[Supervision] Bloqueado: ${admin.email} → ${action}`)
  await notifyApprover(admin.email, action)

  return NextResponse.json({
    error: 'Ação supervisionada',
    message: `Esta ação precisa da aprovação da Lorrayne. Ela acabou de ser notificada por e-mail sobre a sua solicitação ("${action}").`,
  }, { status: 403 })
}
