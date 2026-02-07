'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Send, Clock, User, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TaskWithDetails, AdminUserBasic } from '../marketing-admin'
import type { MarketingStrategy, TaskStatus, TaskPriority, MarketingCategory } from '@/types/database'

interface TaskModalProps {
  task: TaskWithDetails | null
  strategies: MarketingStrategy[]
  users: AdminUserBasic[]
  isAdmin: boolean
  currentUserId: string
  onClose: () => void
  onSaved: () => void
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'Em Progresso' },
  { value: 'review', label: 'Revisão' },
  { value: 'completed', label: 'Concluído' },
  { value: 'failed', label: 'Falhou' },
]

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
]

const CATEGORY_OPTIONS: { value: MarketingCategory; label: string }[] = [
  { value: 'seo', label: 'SEO' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'content', label: 'Conteúdo' },
  { value: 'paid_ads', label: 'Anúncios Pagos' },
  { value: 'email', label: 'E-mail Marketing' },
  { value: 'events', label: 'Eventos' },
  { value: 'partnerships', label: 'Parcerias' },
  { value: 'other', label: 'Outros' },
]

export function TaskModal({ task, strategies, users, isAdmin, currentUserId, onClose, onSaved }: TaskModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [taskDetails, setTaskDetails] = useState<TaskWithDetails | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isSendingComment, setIsSendingComment] = useState(false)

  // Form state
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [category, setCategory] = useState<MarketingCategory>(task?.category || 'other')
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'backlog')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium')
  const [strategyId, setStrategyId] = useState(task?.strategy_id || '')
  const [dueDate, setDueDate] = useState(task?.due_date?.split('T')[0] || '')
  const [estimatedHours, setEstimatedHours] = useState(task?.estimated_hours?.toString() || '')
  const [actualHours, setActualHours] = useState(task?.actual_hours?.toString() || '')
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    task?.assignees?.map(a => a.id) || []
  )

  // Fetch task details if editing
  useEffect(() => {
    if (task?.id) {
      setIsLoading(true)
      fetch(`/api/admin/marketing/tasks/${task.id}`)
        .then(res => res.json())
        .then(data => {
          setTaskDetails(data.task)
          if (data.task) {
            setTitle(data.task.title)
            setDescription(data.task.description || '')
            setCategory(data.task.category)
            setStatus(data.task.status)
            setPriority(data.task.priority)
            setStrategyId(data.task.strategy_id || '')
            setDueDate(data.task.due_date?.split('T')[0] || '')
            setEstimatedHours(data.task.estimated_hours?.toString() || '')
            setActualHours(data.task.actual_hours?.toString() || '')
            setSelectedAssignees(data.task.assignees?.map((a: { id: string }) => a.id) || [])
          }
        })
        .finally(() => setIsLoading(false))
    }
  }, [task?.id])

  const handleSave = async () => {
    if (!title.trim()) return

    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        status,
        priority,
        strategy_id: strategyId || null,
        due_date: dueDate || null,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
        actual_hours: actualHours ? parseFloat(actualHours) : null,
      }

      if (isAdmin) {
        payload.assignees = selectedAssignees
      }

      const url = task?.id
        ? `/api/admin/marketing/tasks/${task.id}`
        : '/api/admin/marketing/tasks'
      
      const res = await fetch(url, {
        method: task?.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onSaved()
      }
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !task?.id) return

    setIsSendingComment(true)
    try {
      const res = await fetch(`/api/admin/marketing/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setTaskDetails(prev => prev ? {
          ...prev,
          comments: [data.comment, ...(prev.comments || [])]
        } : null)
        setNewComment('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSendingComment(false)
    }
  }

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-background-soft rounded-lg transition-colors">
            <X className="w-5 h-5 text-foreground-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!isAdmin && !!task}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground disabled:opacity-50"
                  placeholder="Título da tarefa"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isAdmin && !!task}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground resize-none disabled:opacity-50"
                  placeholder="Descrição detalhada..."
                />
              </div>

              {/* Row: Category, Status, Priority */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MarketingCategory)}
                    disabled={!isAdmin && !!task}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground disabled:opacity-50"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    disabled={!isAdmin && !!task}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground disabled:opacity-50"
                  >
                    {PRIORITY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Strategy, Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Estratégia</label>
                  <select
                    value={strategyId}
                    onChange={(e) => setStrategyId(e.target.value)}
                    disabled={!isAdmin && !!task}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground disabled:opacity-50"
                  >
                    <option value="">Nenhuma</option>
                    {strategies.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Data Limite</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={!isAdmin && !!task}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Row: Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Horas Estimadas</label>
                  <input
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    disabled={!isAdmin && !!task}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground disabled:opacity-50"
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Horas Realizadas</label>
                  <input
                    type="number"
                    value={actualHours}
                    onChange={(e) => setActualHours(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Assignees (Admin only) */}
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Responsáveis</label>
                  <div className="flex flex-wrap gap-2">
                    {users.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleAssignee(user.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm transition-colors",
                          selectedAssignees.includes(user.id)
                            ? "bg-primary text-white"
                            : "bg-background-soft text-foreground-secondary hover:bg-background"
                        )}
                      >
                        {user.name || user.email}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section (only for existing tasks) */}
              {task?.id && taskDetails && (
                <div className="border-t border-border pt-4 mt-4">
                  <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comentários
                  </h3>

                  {/* Add Comment */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Adicionar comentário..."
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={isSendingComment || !newComment.trim()}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isSendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {(taskDetails as { comments?: { id: string; content: string; created_at: string; user?: { name: string | null; email: string } }[] }).comments?.map((comment) => (
                      <div key={comment.id} className="bg-background-soft rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {comment.user?.name || comment.user?.email}
                          </span>
                          <span className="text-xs text-foreground-secondary">
                            {new Date(comment.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-foreground-secondary">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-foreground-secondary hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

