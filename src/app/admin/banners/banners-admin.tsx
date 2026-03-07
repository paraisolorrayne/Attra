'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Trash2, Loader2, Pencil, Eye, EyeOff, Upload,
  Image as ImageIcon, GripVertical, ExternalLink, X, Check
} from 'lucide-react'
import type { SiteBanner } from '@/types/database'

// =============================================
// TYPES
// =============================================

interface BannerFormData {
  title: string
  description: string
  image_url: string
  image_mobile_url: string
  target_url: string
  display_order: number
  is_active: boolean
  start_date: string
  end_date: string
  device_type: 'all' | 'desktop' | 'mobile'
}

const EMPTY_FORM: BannerFormData = {
  title: '',
  description: '',
  image_url: '',
  image_mobile_url: '',
  target_url: '',
  display_order: 0,
  is_active: true,
  start_date: '',
  end_date: '',
  device_type: 'all',
}

// =============================================
// MAIN COMPONENT
// =============================================

export function BannersAdmin() {
  const [banners, setBanners] = useState<SiteBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<SiteBanner | null>(null)
  const [formData, setFormData] = useState<BannerFormData>({ ...EMPTY_FORM })
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadTarget, setUploadTarget] = useState<'desktop' | 'mobile'>('desktop')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const router = useRouter()

  // =============================================
  // DATA FETCHING
  // =============================================

  const fetchBanners = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/banners')
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  // =============================================
  // IMAGE UPLOAD
  // =============================================

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/admin/banners/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }
      const data = await res.json()
      if (uploadTarget === 'mobile') {
        setFormData(prev => ({ ...prev, image_mobile_url: data.url }))
      } else {
        setFormData(prev => ({ ...prev, image_url: data.url }))
      }
      showFeedback('success', 'Imagem enviada com sucesso!')
    } catch (error) {
      console.error('Upload error:', error)
      showFeedback('error', error instanceof Error ? error.message : 'Erro no upload')
    } finally {
      setIsUploading(false)
    }
  }

  // =============================================
  // CRUD OPERATIONS
  // =============================================

  const handleSave = async () => {
    if (!formData.title || !formData.image_url) {
      showFeedback('error', 'Título e imagem são obrigatórios')
      return
    }

    setIsSaving(true)
    try {
      const url = editingBanner
        ? `/api/admin/banners/${editingBanner.id}`
        : '/api/admin/banners'
      const method = editingBanner ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao salvar')
      }

      showFeedback('success', editingBanner ? 'Banner atualizado!' : 'Banner criado!')
      setShowModal(false)
      setEditingBanner(null)
      setFormData({ ...EMPTY_FORM })
      fetchBanners()
    } catch (error) {
      showFeedback('error', error instanceof Error ? error.message : 'Erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return

    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir')
      showFeedback('success', 'Banner excluído!')
      fetchBanners()
    } catch (error) {
      showFeedback('error', error instanceof Error ? error.message : 'Erro ao excluir')
    }
  }

  const handleToggleActive = async (banner: SiteBanner) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, is_active: !banner.is_active }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar')
      fetchBanners()
    } catch (error) {
      showFeedback('error', error instanceof Error ? error.message : 'Erro ao atualizar')
    }
  }

  const openEditModal = (banner: SiteBanner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image_url: banner.image_url,
      image_mobile_url: banner.image_mobile_url || '',
      target_url: banner.target_url || '',
      display_order: banner.display_order,
      is_active: banner.is_active,
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
      device_type: banner.device_type,
    })
    setShowModal(true)
  }

  const openNewModal = () => {
    setEditingBanner(null)
    setFormData({ ...EMPTY_FORM, display_order: banners.length })
    setShowModal(true)
  }

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 3000)
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
          <h1 className="text-2xl font-bold text-foreground">Banners do Site</h1>
          <p className="text-foreground-secondary">Gerencie os banners exibidos na página inicial</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Banner
        </button>
      </div>

      {/* Banners List */}
      <div className="bg-background-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-foreground-secondary">
            <ImageIcon className="w-12 h-12 mb-4" />
            <p>Nenhum banner cadastrado</p>
            <button onClick={openNewModal} className="mt-3 text-primary hover:underline">
              Criar primeiro banner
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {banners.map((banner) => (
              <div key={banner.id} className="flex items-center gap-4 p-4 hover:bg-background-soft transition-colors">
                <GripVertical className="w-5 h-5 text-foreground-secondary flex-shrink-0" />

                {/* Preview */}
                <div className="w-24 h-16 bg-background rounded-lg overflow-hidden flex-shrink-0">
                  {banner.image_url ? (
                    <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-foreground-secondary" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground truncate">{banner.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      banner.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {banner.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {banner.device_type === 'all' ? 'Todos' : banner.device_type === 'desktop' ? 'Desktop' : 'Mobile'}
                    </span>
                  </div>
                  <p className="text-sm text-foreground-secondary truncate">
                    {banner.description || 'Sem descrição'}
                    {banner.target_url && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {banner.target_url}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-foreground-secondary mt-1">
                    Ordem: {banner.display_order}
                    {banner.start_date && ` • Início: ${new Date(banner.start_date).toLocaleDateString('pt-BR')}`}
                    {banner.end_date && ` • Fim: ${new Date(banner.end_date).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className="p-2 rounded-lg hover:bg-background transition-colors"
                    title={banner.is_active ? 'Desativar' : 'Ativar'}
                  >
                    {banner.is_active ? <EyeOff className="w-4 h-4 text-foreground-secondary" /> : <Eye className="w-4 h-4 text-foreground-secondary" />}
                  </button>
                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-2 rounded-lg hover:bg-background transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4 text-foreground-secondary" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-background rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Título *</label>
                <input
                  type="text" value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  placeholder="Título do banner"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  rows={2} placeholder="Descrição opcional"
                />
              </div>

              {/* Desktop Image */}
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Imagem Desktop *</label>
                {formData.image_url && (
                  <div className="mb-2 relative w-full h-40 bg-background rounded-lg overflow-hidden">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-background-soft transition-colors">
                  <Upload className="w-4 h-4 text-foreground-secondary" />
                  <span className="text-sm text-foreground-secondary">
                    {isUploading && uploadTarget === 'desktop' ? 'Enviando...' : 'Escolher imagem desktop'}
                  </span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { setUploadTarget('desktop'); handleImageUpload(e) }}
                  />
                </label>
              </div>

              {/* Mobile Image */}
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Imagem Mobile (opcional)</label>
                {formData.image_mobile_url && (
                  <div className="mb-2 relative w-32 h-40 bg-background rounded-lg overflow-hidden">
                    <img src={formData.image_mobile_url} alt="Preview mobile" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-background-soft transition-colors">
                  <Upload className="w-4 h-4 text-foreground-secondary" />
                  <span className="text-sm text-foreground-secondary">
                    {isUploading && uploadTarget === 'mobile' ? 'Enviando...' : 'Escolher imagem mobile'}
                  </span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { setUploadTarget('mobile'); handleImageUpload(e) }}
                  />
                </label>
              </div>

              {/* Target URL */}
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">Link de Destino</label>
                <input type="url" value={formData.target_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  placeholder="https://..."
                />
              </div>

              {/* Row: Order, Device, Active */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-1">Ordem</label>
                  <input type="number" value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-1">Dispositivo</label>
                  <select value={formData.device_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, device_type: e.target.value as 'all' | 'desktop' | 'mobile' }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  >
                    <option value="all">Todos</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-1">Status</label>
                  <select value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-1">Data Início</label>
                  <input type="date" value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-1">Data Fim</label>
                  <input type="date" value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-foreground-secondary hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button onClick={handleSave} disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingBanner ? 'Salvar' : 'Criar Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

