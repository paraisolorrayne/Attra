'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, Square, Loader2, AlertCircle, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSiteSettings } from '@/hooks/use-site-settings'

interface ListenToContentProps {
  content: string // HTML content from post
  title?: string // Post title for context
}

type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

// ============================================================================
// VOICE SELECTION — prioriza vozes naturais/premium em pt-BR
// ============================================================================

/** Ranking de preferência de vozes pt-BR (maior = melhor) */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()

  // Deve ser português brasileiro
  if (!lang.startsWith('pt-br') && !lang.startsWith('pt_br')) return -1

  let score = 0

  // Vozes "Premium" / "Enhanced" / "Natural" são muito superiores
  if (name.includes('premium')) score += 100
  if (name.includes('natural')) score += 90
  if (name.includes('enhanced')) score += 80
  if (name.includes('neural')) score += 80

  // Google e Microsoft geralmente têm vozes melhores
  if (name.includes('google')) score += 40
  if (name.includes('microsoft')) score += 35

  // Vozes femininas tendem a soar mais claras em pt-BR
  if (name.includes('luciana')) score += 25
  if (name.includes('francisca')) score += 25
  if (name.includes('fernanda')) score += 20
  if (name.includes('maria')) score += 15

  // Vozes masculinas boas
  if (name.includes('daniel')) score += 15
  if (name.includes('antonio')) score += 10

  // Penalizar vozes genéricas/compactas
  if (name.includes('compact')) score -= 20
  if (name.includes('espeak')) score -= 50

  // Bônus para vozes locais (não-remote) — menor latência
  if (!voice.localService) score += 5

  return score
}

function selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const scored = voices
    .map(v => ({ voice: v, score: scoreVoice(v) }))
    .filter(v => v.score >= 0)
    .sort((a, b) => b.score - a.score)

  return scored.length > 0 ? scored[0].voice : null
}

// ============================================================================
// TEXT PROCESSING — extrai texto limpo e adiciona pausas naturais
// ============================================================================

function extractTextFromHTML(html: string): string {
  if (typeof window === 'undefined') return ''

  const temp = document.createElement('div')
  temp.innerHTML = html

  // Remover elementos não-conteúdo
  const remove = temp.querySelectorAll(
    'script, style, nav, aside, footer, .sr-only, [aria-hidden="true"], figcaption, .wp-caption-text'
  )
  remove.forEach(el => el.remove())

  // Adicionar quebras semânticas antes de extrair texto
  // Headings → pausa longa antes e depois
  temp.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
    el.textContent = `\n\n${el.textContent?.trim()}.\n\n`
  })

  // Parágrafos e list items → pausa curta
  temp.querySelectorAll('p, li').forEach(el => {
    el.textContent = `${el.textContent?.trim()}\n`
  })

  // Blockquotes → pausa e entonação
  temp.querySelectorAll('blockquote').forEach(el => {
    el.textContent = `\n... ${el.textContent?.trim()} ...\n`
  })

  let text = temp.textContent || temp.innerText || ''

  // Limpeza e normalização para ritmo natural
  text = text
    // Normalizar whitespace
    .replace(/[ \t]+/g, ' ')
    // Converter múltiplas quebras em pausa (ponto final)
    .replace(/\n{2,}/g, '.\n')
    .replace(/\n/g, '. ')
    // Limpar pontuação duplicada
    .replace(/\.{2,}/g, '.')
    .replace(/\.\s*\./g, '.')
    .replace(/\.\s*,/g, ',')
    // Adicionar micro-pausas em listas com ";" ou "•"
    .replace(/[;•–—]/g, ',')
    // Números com unidades — adicionar espaço para pronúncia
    .replace(/(\d)(km\/h|cv|hp|kgfm|Nm|mph|kg|mm|cm)/gi, '$1 $2')
    // Siglas comuns em reviews automotivos
    .replace(/\bHP\b/g, 'cavalos')
    .replace(/\bCV\b/g, 'cavalos')
    .replace(/\bNm\b/g, 'Newton metros')
    .replace(/\bkgfm\b/g, 'quilograma-força metro')
    .replace(/\bkm\/h\b/gi, 'quilômetros por hora')
    .replace(/\bRPM\b/gi, 'rotações por minuto')
    .replace(/\b0-100\b/g, 'zero a cem')
    // Limpar espaços extras
    .replace(/\s+/g, ' ')
    .trim()

  return text
}

/**
 * Divide texto longo em chunks por sentença para evitar
 * que o sintetizador corte ou engasgue em textos grandes.
 * Cada chunk tem no máximo ~800 caracteres (limite seguro).
 */
function splitIntoChunks(text: string, maxLen = 800): string[] {
  if (text.length <= maxLen) return [text]

  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text]
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen && current.length > 0) {
      chunks.push(current.trim())
      current = ''
    }
    current += sentence
  }
  if (current.trim()) chunks.push(current.trim())

  return chunks
}

// ============================================================================
// SPEED OPTIONS
// ============================================================================
const SPEED_OPTIONS = [0.8, 0.9, 1.0, 1.1, 1.2] as const
const DEFAULT_SPEED = 1.0

export function ListenToContent({ content, title }: ListenToContentProps) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle')
  const [isSupported, setIsSupported] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(DEFAULT_SPEED)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const chunksRef = useRef<string[]>([])
  const chunkIndexRef = useRef<number>(0)
  const bestVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const isPlayingRef = useRef<boolean>(false)

  // Check if this feature is enabled in site settings
  const { settings, isLoading: settingsLoading } = useSiteSettings()

  // Check for browser support + load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false)
      return
    }
    synthRef.current = window.speechSynthesis

    // Voices may load asynchronously — try to pick the best one
    const pickVoice = () => {
      const voices = synthRef.current?.getVoices() || []
      if (voices.length > 0) {
        bestVoiceRef.current = selectBestVoice(voices)
      }
    }
    pickVoice()
    // Some browsers fire onvoiceschanged later
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = pickVoice
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Play chunks sequentially
  const playNextChunk = useCallback(() => {
    const synth = synthRef.current
    if (!synth || !isPlayingRef.current) return

    if (chunkIndexRef.current >= chunksRef.current.length) {
      isPlayingRef.current = false
      setPlaybackState('idle')
      return
    }

    const text = chunksRef.current[chunkIndexRef.current]
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = playbackSpeed * 0.95
    utterance.pitch = 1.0
    utterance.volume = 1.0

    if (bestVoiceRef.current) {
      utterance.voice = bestVoiceRef.current
    }

    utterance.onstart = () => setPlaybackState('playing')
    utterance.onend = () => {
      chunkIndexRef.current++
      setTimeout(() => playNextChunk(), 120)
    }
    utterance.onerror = (event) => {
      if (event.error === 'interrupted' || event.error === 'canceled') return
      console.error('Speech synthesis error:', event)
      isPlayingRef.current = false
      setErrorMessage('Erro ao reproduzir áudio')
      setPlaybackState('error')
    }

    synth.speak(utterance)
  }, [playbackSpeed])

  const handlePlay = useCallback(() => {
    if (!synthRef.current) return

    if (playbackState === 'paused') {
      synthRef.current.resume()
      setPlaybackState('playing')
      return
    }

    synthRef.current.cancel()
    isPlayingRef.current = false
    setPlaybackState('loading')

    const textToSpeak = title
      ? `${title}. ${extractTextFromHTML(content)}`
      : extractTextFromHTML(content)

    if (!textToSpeak) {
      setErrorMessage('Não há conteúdo para ler')
      setPlaybackState('error')
      return
    }

    chunksRef.current = splitIntoChunks(textToSpeak)
    chunkIndexRef.current = 0
    isPlayingRef.current = true
    playNextChunk()
  }, [content, title, playbackState, playNextChunk])

  const handlePause = useCallback(() => {
    if (synthRef.current && playbackState === 'playing') {
      synthRef.current.pause()
      setPlaybackState('paused')
    }
  }, [playbackState])

  const handleStop = useCallback(() => {
    if (synthRef.current) {
      isPlayingRef.current = false
      synthRef.current.cancel()
      chunkIndexRef.current = 0
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

  const adjustSpeed = useCallback((delta: number) => {
    setPlaybackSpeed(prev => {
      const idx = SPEED_OPTIONS.indexOf(prev as typeof SPEED_OPTIONS[number])
      const newIdx = Math.max(0, Math.min(SPEED_OPTIONS.length - 1, idx + delta))
      return SPEED_OPTIONS[newIdx]
    })
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleToggle()
    } else if (e.key === 'Escape' && playbackState !== 'idle') {
      handleStop()
    }
  }, [handleToggle, handleStop, playbackState])

  if (!isSupported) return null
  if (!settingsLoading && !settings.listen_to_content_enabled) return null

  const isActive = playbackState === 'playing' || playbackState === 'paused'
  const isLoading = playbackState === 'loading'
  const isError = playbackState === 'error'

  return (
    <div className="flex flex-col gap-2">
      {/* Main play/pause button */}
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
            {isActive ? 'Clique para pausar' : 'Narração por voz'}
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

      {/* Controls row — speed + stop (visible only when active) */}
      {isActive && (
        <div className="flex items-center gap-2 px-2">
          {/* Stop button */}
          <button
            onClick={handleStop}
            aria-label="Parar leitura"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-background-card border border-border hover:border-red-400/50 hover:bg-red-500/5 transition-all text-foreground-secondary hover:text-red-500"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          {/* Speed control */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => adjustSpeed(-1)}
              disabled={playbackSpeed <= SPEED_OPTIONS[0]}
              aria-label="Diminuir velocidade"
              className="flex items-center justify-center w-7 h-7 rounded-md bg-background-card border border-border hover:border-primary/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-foreground-secondary hover:text-primary"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-medium text-foreground-secondary min-w-[2.5rem] text-center tabular-nums">
              {playbackSpeed.toFixed(1)}x
            </span>
            <button
              onClick={() => adjustSpeed(1)}
              disabled={playbackSpeed >= SPEED_OPTIONS[SPEED_OPTIONS.length - 1]}
              aria-label="Aumentar velocidade"
              className="flex items-center justify-center w-7 h-7 rounded-md bg-background-card border border-border hover:border-primary/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-foreground-secondary hover:text-primary"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
