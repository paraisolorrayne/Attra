'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSiteSettings } from '@/hooks/use-site-settings'

interface ListenToContentProps {
  content: string // HTML content from post
  title?: string // Post title for context
}

type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

/**
 * Extract clean text from HTML content for TTS
 */
function extractTextFromHTML(html: string): string {
  // Create a temporary element to parse HTML
  if (typeof window === 'undefined') return ''
  
  const temp = document.createElement('div')
  temp.innerHTML = html
  
  // Remove script, style, nav, and other non-content elements
  const elementsToRemove = temp.querySelectorAll('script, style, nav, aside, footer, .sr-only, [aria-hidden="true"]')
  elementsToRemove.forEach(el => el.remove())
  
  // Get text content and clean it up
  let text = temp.textContent || temp.innerText || ''
  
  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '. ')
    .trim()
  
  return text
}

export function ListenToContent({ content, title }: ListenToContentProps) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle')
  const [isSupported, setIsSupported] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Check if this feature is enabled in site settings
  const { settings, isLoading: settingsLoading } = useSiteSettings()

  // Check for browser support on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false)
      return
    }
    synthRef.current = window.speechSynthesis
  }, [])

  // Cleanup on unmount or navigation
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const handlePlay = useCallback(() => {
    if (!synthRef.current) return

    // If paused, resume
    if (playbackState === 'paused') {
      synthRef.current.resume()
      setPlaybackState('playing')
      return
    }

    // Cancel any existing speech
    synthRef.current.cancel()
    setPlaybackState('loading')

    // Extract clean text
    const textToSpeak = title 
      ? `${title}. ${extractTextFromHTML(content)}`
      : extractTextFromHTML(content)

    if (!textToSpeak) {
      setErrorMessage('Não há conteúdo para ler')
      setPlaybackState('error')
      return
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.lang = 'pt-BR'
    utterance.rate = 1.25
    utterance.pitch = 1.4

    // Event handlers
    utterance.onstart = () => setPlaybackState('playing')
    utterance.onend = () => setPlaybackState('idle')
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setErrorMessage('Erro ao reproduzir áudio')
      setPlaybackState('error')
    }

    utteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }, [content, title, playbackState])

  const handlePause = useCallback(() => {
    if (synthRef.current && playbackState === 'playing') {
      synthRef.current.pause()
      setPlaybackState('paused')
    }
  }, [playbackState])

  const handleStop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setPlaybackState('idle')
    }
  }, [])

  const handleToggle = useCallback(() => {
    if (playbackState === 'playing') {
      handlePause()
    } else if (playbackState === 'paused' || playbackState === 'idle') {
      handlePlay()
    } else if (playbackState === 'error') {
      setPlaybackState('idle')
      setErrorMessage('')
    }
  }, [playbackState, handlePause, handlePlay])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleToggle()
    } else if (e.key === 'Escape' && playbackState !== 'idle') {
      handleStop()
    }
  }, [handleToggle, handleStop, playbackState])

  // Don't render if not supported or if feature is disabled
  if (!isSupported) {
    return null
  }

  // Don't render if feature is disabled in site settings
  if (!settingsLoading && !settings.listen_to_content_enabled) {
    return null
  }

  const isActive = playbackState === 'playing' || playbackState === 'paused'
  const isLoading = playbackState === 'loading'
  const isError = playbackState === 'error'

  return (
    <button
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      disabled={isLoading}
      aria-label={isActive ? 'Pausar leitura do artigo' : 'Ouvir leitura do artigo'}
      className={cn(
        'group flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300',
        'bg-background-card border border-border',
        'hover:border-primary/40 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'disabled:opacity-70 disabled:cursor-wait',
        isActive && 'border-primary/50 bg-primary/5',
        isError && 'border-red-500/30 bg-red-500/5'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300',
        isError 
          ? 'bg-red-500/10 text-red-500'
          : isActive 
            ? 'bg-primary text-white' 
            : 'bg-primary/10 text-primary group-hover:bg-primary/20'
      )}>
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isError ? (
          <AlertCircle className="w-5 h-5" />
        ) : playbackState === 'playing' ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col items-start">
        <span className={cn(
          'text-sm font-semibold transition-colors',
          isError ? 'text-red-500' : 'text-foreground'
        )}>
          {isError 
            ? errorMessage 
            : isLoading 
              ? 'Preparando...'
              : playbackState === 'playing' 
                ? 'Pausar leitura' 
                : playbackState === 'paused'
                  ? 'Continuar leitura'
                  : 'Ouvir esta matéria'}
        </span>
        {!isError && !isLoading && (
          <span className="text-xs text-foreground-secondary">
            {isActive ? 'Clique para pausar' : 'Síntese de voz'}
          </span>
        )}
      </div>

      {/* Sound wave animation when playing */}
      {playbackState === 'playing' && (
        <div className="flex items-center gap-0.5 ml-auto" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-pulse"
              style={{
                height: `${12 + i * 4}px`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.6s',
              }}
            />
          ))}
        </div>
      )}
    </button>
  )
}

