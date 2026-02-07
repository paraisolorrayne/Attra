'use client'

import { useState } from 'react'
import {
  Calendar,
  User,
  AlertCircle,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TaskWithDetails } from '../marketing-admin'
import type { TaskStatus } from '@/types/database'

interface KanbanBoardProps {
  tasks: TaskWithDetails[]
  onTaskClick: (task: TaskWithDetails) => void
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
  isAdmin: boolean
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'bg-gray-500' },
  { id: 'in_progress', label: 'Em Progresso', color: 'bg-blue-500' },
  { id: 'review', label: 'Revisão', color: 'bg-yellow-500' },
  { id: 'completed', label: 'Concluído', color: 'bg-green-500' },
  { id: 'failed', label: 'Falhou', color: 'bg-red-500' },
]

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const CATEGORY_LABELS: Record<string, string> = {
  seo: 'SEO',
  social_media: 'Social Media',
  content: 'Conteúdo',
  paid_ads: 'Anúncios',
  email: 'E-mail',
  events: 'Eventos',
  partnerships: 'Parcerias',
  other: 'Outros',
}

export function KanbanBoard({ tasks, onTaskClick, onStatusChange, isAdmin }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<TaskWithDetails | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

  const handleDragStart = (e: React.DragEvent, task: TaskWithDetails) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (draggedTask && draggedTask.status !== columnId) {
      onStatusChange(draggedTask.id, columnId)
    }
    setDraggedTask(null)
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pb-4">
      {COLUMNS.map(column => {
        const columnTasks = tasks.filter(t => t.status === column.id)

        return (
          <div
            key={column.id}
            className={cn(
              "bg-background-soft rounded-lg border border-border min-h-[300px]",
              dragOverColumn === column.id && "ring-2 ring-primary"
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", column.color)} />
                <span className="font-medium text-foreground">{column.label}</span>
              </div>
              <span className="text-sm text-foreground-secondary bg-background-card px-2 py-0.5 rounded-full">
                {columnTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="p-2 space-y-2 min-h-[150px] max-h-[500px] overflow-y-auto">
              {columnTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => onTaskClick(task)}
                  className={cn(
                    "bg-background-card border border-border rounded-lg p-3 cursor-pointer",
                    "hover:border-primary/50 hover:shadow-sm transition-all",
                    draggedTask?.id === task.id && "opacity-50"
                  )}
                >
                  {/* Category & Priority */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {CATEGORY_LABELS[task.category] || task.category}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded", PRIORITY_COLORS[task.priority])}>
                      {task.priority === 'urgent' ? '🔥' : ''} {task.priority}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-medium text-foreground text-sm mb-2 line-clamp-2">
                    {task.title}
                  </h4>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-foreground-secondary">
                    {task.due_date && (
                      <div className={cn(
                        "flex items-center gap-1",
                        isOverdue(task.due_date) && task.status !== 'completed' && "text-red-500"
                      )}>
                        {isOverdue(task.due_date) && task.status !== 'completed' ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : (
                          <Calendar className="w-3 h-3" />
                        )}
                        {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {task.assignees && task.assignees.length > 0 && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assignees.length}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

