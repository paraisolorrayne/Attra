'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EngineAudioPlayerProps {
  audioUrl?: string
  vehicleName: string
  isElectric?: boolean
}

export function EngineAudioPlayer({ audioUrl, vehicleName, isElectric = false }: EngineAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Handle audio element setup with ref callback
  const setupAudio = useCallback((audio: HTMLAudioElement | null) => {
    if (audio) {
      audioRef.current = audio

      const handleTimeUpdate = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setProgress((audio.currentTime / audio.duration) * 100)
        }
      }

      const handleEnded = () => {
        setIsPlaying(false)
        setProgress(0)
      }

      const handleCanPlay = () => {
        setIsLoaded(true)
        setError(null)
      }

      const handleError = () => {
        setError('Erro ao carregar áudio')
        setIsPlaying(false)
        console.error('Audio error:', audio.error)
      }

      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('canplaythrough', handleCanPlay)
      audio.addEventListener('error', handleError)

      // Cleanup
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('canplaythrough', handleCanPlay)
        audio.removeEventListener('error', handleError)
      }
    }
  }, [])

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          await audioRef.current.play()
          setIsPlaying(true)
        }
      } catch (err) {
        console.error('Audio play error:', err)
        setError('Não foi possível reproduzir o áudio')
      }
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // For electric vehicles, show a different component
  if (isElectric) {
    return (
      <div className="bg-background-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-xl">
            <Volume2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Silêncio é poder</h3>
            <p className="text-foreground-secondary text-sm">
              Este veículo elétrico oferece uma experiência de condução silenciosa e refinada
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!audioUrl) {
    return null
  }

  // Generate stable waveform heights (not random on every render)
  const waveformHeights = Array.from({ length: 40 }, (_, i) =>
    20 + Math.sin(i * 0.5) * 15 + (Math.sin(i * 1.3) * 5 + 5)
  )

  return (
    <div className="bg-background-card border border-border rounded-2xl p-6">
      <audio
        ref={setupAudio}
        src={audioUrl}
        preload="metadata"
      />

      <div className="flex items-center gap-4">
        {/* Play button */}
        <button
          onClick={togglePlay}
          disabled={!!error}
          className={cn(
            'p-4 rounded-xl transition-all',
            error
              ? 'bg-red-500/10 text-red-500 cursor-not-allowed'
              : isPlaying
                ? 'bg-primary text-white'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
          )}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        {/* Waveform/Progress */}
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-2">
            {error || 'Ouvir ronco do motor'}
          </p>

          {/* Waveform visualization */}
          <div className="relative h-8 flex items-center gap-[2px]">
            {waveformHeights.map((height, i) => (
              <div
                key={i}
                className={cn(
                  'w-1 rounded-full transition-all duration-150',
                  i < (progress / 100) * 40
                    ? 'bg-primary'
                    : 'bg-foreground-secondary/30'
                )}
                style={{ height: `${height}px` }}
              />
            ))}

            {/* Progress overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Volume toggle */}
        <button
          onClick={toggleMute}
          className="p-3 text-foreground-secondary hover:text-foreground transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <p className="text-xs text-foreground-secondary mt-3">
        Áudio captado em condições controladas. O som pode variar.
      </p>
    </div>
  )
}

