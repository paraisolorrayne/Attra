'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Trash2, Loader2, Pencil, X, Check,
  Mail, Send, Clock, FileText, Eye, Calendar
} from 'lucide-react'
import type { NewsletterCampaign, NewsletterCampaignStatus } from '@/types/database'

// =============================================
// TYPES
// =============================================

interface CampaignFormData {
  title: string
  subject: string
  featured_image: string
  sections: CampaignSection[]
  html_content: string
  status: NewsletterCampaignStatus
  scheduled_at: string
}

interface CampaignSection {
  type: 'heading' | 'text' | 'image' | 'button' | 'divider'
  content: string
  url?: string
  imageUrl?: string
}

const EMPTY_FORM: CampaignFormData = {
  title: '',
  subject: '',
  featured_image: '',
  sections: [],
  html_content: '',
  status: 'draft',
  scheduled_at: '',
}

const statusConfig: Record<NewsletterCampaignStatus, { label: string; color: string; icon: typeof Mail }> = {
  draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: FileText },
  scheduled: { label: 'Agendada', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
  sent: { label: 'Enviada', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Send },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: X },
}

// =============================================
// MAIN COMPONENT
// =============================================

export function CampaignsAdmin() {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<NewsletterCampaign | null>(null)
  const [formData, setFormData] = useState<CampaignFormData>({ ...EMPTY_FORM })
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const router = useRouter()

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/newsletter/campaigns')
      if (res.status === 401) { router.push('/admin/login'); return }
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  const showFeedbackMsg = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleSave = async () => {
    if (!formData.title) {
      showFeedbackMsg('error', 'Título é obrigatório')
      return
    }
    setIsSaving(true)
    try {
      const url = editingCampaign
        ? `/api/admin/newsletter/campaigns/${editingCampaign.id}`
        : '/api/admin/newsletter/campaigns'
      const method = editingCampaign ? 'PUT' : 'POST'

      // Generate HTML from sections
      const html = generateHtml(formData)

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          html_content: html,
          scheduled_at: formData.scheduled_at || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao salvar')
      }
      showFeedbackMsg('success', editingCampaign ? 'Campanha atualizada!' : 'Campanha criada!')
      setShowModal(false)
      setEditingCampaign(null)
      setFormData({ ...EMPTY_FORM })
      fetchCampaigns()
    } catch (error) {
      showFeedbackMsg('error', error instanceof Error ? error.message : 'Erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta campanha?')) return
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao excluir')
      }
      showFeedbackMsg('success', 'Campanha excluída!')
      fetchCampaigns()
    } catch (error) {
      showFeedbackMsg('error', error instanceof Error ? error.message : 'Erro ao excluir')
    }
  }

  const openEditModal = (campaign: NewsletterCampaign) => {
    setEditingCampaign(campaign)
    setFormData({
      title: campaign.title,
      subject: campaign.subject || '',
      featured_image: campaign.featured_image || '',
      sections: (campaign.sections as CampaignSection[]) || [],
      html_content: campaign.html_content || '',
      status: campaign.status,
      scheduled_at: campaign.scheduled_at ? campaign.scheduled_at.split('T')[0] + 'T' + campaign.scheduled_at.split('T')[1]?.substring(0, 5) : '',
    })
    setShowModal(true)
  }

  const openNewModal = () => {
    setEditingCampaign(null)
    setFormData({ ...EMPTY_FORM })
    setShowModal(true)
  }

  const addSection = (type: CampaignSection['type']) => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { type, content: '', url: '', imageUrl: '' }],
    }))
  }

  const updateSection = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i === index ? { ...s, [field]: value } : s),
    }))
  }

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }))
  }

  // =============================================
  // RENDER
  // =============================================

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {feedback && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
        }`}>
          {feedback.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {feedback.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campanhas Newsletter</h1>
          <p className="text-foreground-secondary">Crie e gerencie campanhas de email marketing</p>
        </div>
        <button onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
          <Plus className="w-5 h-5" />
          Nova Campanha
        </button>
      </div>

      {/* Campaign List */}
      <div className="bg-background-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-foreground-secondary">
            <Mail className="w-12 h-12 mb-4" />
            <p>Nenhuma campanha criada</p>
            <button onClick={openNewModal} className="mt-3 text-primary hover:underline">
              Criar primeira campanha
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {campaigns.map((campaign) => {
              const cfg = statusConfig[campaign.status]
              const StatusIcon = cfg.icon
              return (
                <div key={campaign.id} className="flex items-center gap-4 p-4 hover:bg-background-soft transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">{campaign.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-foreground-secondary truncate">
                      {campaign.subject || 'Sem assunto'}
                      {campaign.recipient_count > 0 && ` • ${campaign.recipient_count} destinatários`}
                    </p>
                    <p className="text-xs text-foreground-secondary mt-1">
                      Criada em {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                      {campaign.scheduled_at && ` • Agendada: ${new Date(campaign.scheduled_at).toLocaleString('pt-BR')}`}
                      {campaign.sent_at && ` • Enviada: ${new Date(campaign.sent_at).toLocaleString('pt-BR')}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {campaign.html_content && (
                      <button onClick={() => { setEditingCampaign(campaign); setShowPreview(true) }}
                        className="p-2 rounded-lg hover:bg-background transition-colors" title="Preview">
                        <Eye className="w-4 h-4 text-foreground-secondary" />
                      </button>
                    )}
                    {campaign.status !== 'sent' && (
                      <>
                        <button onClick={() => openEditModal(campaign)}
                          className="p-2 rounded-lg hover:bg-background transition-colors" title="Editar">
                          <Pencil className="w-4 h-4 text-foreground-secondary" />
                        </button>
                        <button onClick={() => handleDelete(campaign.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Excluir">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && editingCampaign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background-card rounded-xl border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Preview: {editingCampaign.title}</h2>
              <button onClick={() => { setShowPreview(false); setEditingCampaign(null) }} className="p-2 hover:bg-background rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <iframe
                srcDoc={editingCampaign.html_content || '<p>Sem conteúdo HTML</p>'}
                className="w-full min-h-[500px] border border-border rounded-lg bg-white"
                title="Email Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background-card rounded-xl border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">
                {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-background rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Título *</label>
                <input type="text" value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  placeholder="Nome da campanha" />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Assunto do Email</label>
                <input type="text" value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  placeholder="Assunto que aparecerá no email" />
              </div>

              {/* Status & Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-1">Status</label>
                  <select value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as NewsletterCampaignStatus }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground">
                    <option value="draft">Rascunho</option>
                    <option value="scheduled">Agendada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                {formData.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary mb-1">Agendamento</label>
                    <input type="datetime-local" value={formData.scheduled_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
                  </div>
                )}
              </div>

              {/* Sections Editor */}
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-2">Seções do Email</label>
                <div className="space-y-3">
                  {formData.sections.map((section, idx) => (
                    <div key={idx} className="p-3 border border-border rounded-lg bg-background space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground-secondary uppercase">
                          {section.type === 'heading' ? 'Título' : section.type === 'text' ? 'Texto' : section.type === 'image' ? 'Imagem' : section.type === 'button' ? 'Botão' : 'Divisor'}
                        </span>
                        <button onClick={() => removeSection(idx)} className="p-1 hover:bg-red-500/10 rounded"><X className="w-3 h-3 text-red-500" /></button>
                      </div>
                      {section.type !== 'divider' && (
                        <input type="text" value={section.content} placeholder={section.type === 'heading' ? 'Texto do título' : section.type === 'text' ? 'Parágrafo de texto' : section.type === 'image' ? 'URL da imagem' : 'Texto do botão'}
                          onChange={(e) => updateSection(idx, section.type === 'image' ? 'imageUrl' : 'content', e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-background-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground" />
                      )}
                      {(section.type === 'button' || section.type === 'image') && (
                        <input type="text" value={section.url || ''} placeholder="URL de destino"
                          onChange={(e) => updateSection(idx, 'url', e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-background-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-3">
                  {(['heading', 'text', 'image', 'button', 'divider'] as const).map(type => (
                    <button key={type} onClick={() => addSection(type)}
                      className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-background-soft transition-colors text-foreground-secondary">
                      + {type === 'heading' ? 'Título' : type === 'text' ? 'Texto' : type === 'image' ? 'Imagem' : type === 'button' ? 'Botão' : 'Divisor'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-foreground-secondary hover:text-foreground transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingCampaign ? 'Salvar' : 'Criar Campanha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================
// HTML GENERATOR
// =============================================

function generateHtml(formData: CampaignFormData): string {
  const sectionsHtml = formData.sections.map(section => {
    switch (section.type) {
      case 'heading':
        return `<h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:20px 0 10px;">${section.content}</h2>`
      case 'text':
        return `<p style="font-size:16px;line-height:1.6;color:#333;margin:10px 0;">${section.content}</p>`
      case 'image':
        return `<img src="${section.imageUrl || section.content}" alt="" style="max-width:100%;height:auto;border-radius:8px;margin:15px 0;" />`
      case 'button':
        return `<div style="text-align:center;margin:20px 0;"><a href="${section.url || '#'}" style="display:inline-block;padding:12px 32px;background-color:#c8a870;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">${section.content}</a></div>`
      case 'divider':
        return `<hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0;" />`
      default:
        return ''
    }
  }).join('\n')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;padding:40px 30px;">
  ${formData.featured_image ? `<img src="${formData.featured_image}" alt="" style="max-width:100%;height:auto;border-radius:8px;margin-bottom:20px;" />` : ''}
  ${sectionsHtml}
  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e5e5;text-align:center;">
    <p style="font-size:12px;color:#999;">Attra Veículos • Av. Rondon Pacheco, 1670 • Uberlândia/MG</p>
  </div>
</div>
</body>
</html>`
}

