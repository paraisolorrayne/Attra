'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Info } from 'lucide-react'
import { ManualAttraTerm } from '@/lib/manual-attra-data'

interface GlossaryTooltipProps {
  term: ManualAttraTerm
  children: React.ReactNode
}

/**
 * Tooltip premium para integrar termos do Manual Attra nas fichas de veículo.
 * UX de luxo: fundo claro, tipografia refinada, bordas suaves, animação sutil.
 */
export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <span className="relative inline-flex items-center gap-1.5">
      {children}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-label={`Saiba mais sobre ${term.title}`}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-primary/60 hover:text-primary transition-colors cursor-help"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* Tooltip */}
      {isOpen && (
        <div
          ref={tooltipRef}
          role="tooltip"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute left-0 bottom-full mb-2 z-50 w-72 sm:w-80
            bg-background-card border border-border/60 rounded-xl shadow-lg shadow-black/10
            p-4 animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-background-card border-r border-b border-border/60 rotate-45" />

          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
            {term.title}
          </p>
          <p className="text-sm text-foreground-secondary leading-relaxed mb-3">
            {term.shortDescription}
          </p>
          <Link
            href={`/manual-attra/${term.slug}`}
            className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Ver explicação completa no Manual Attra →
          </Link>
        </div>
      )}
    </span>
  )
}

