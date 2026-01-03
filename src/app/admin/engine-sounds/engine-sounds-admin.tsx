'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Volume2,
  Plus,
  Trash2,
  Play,
  Pause,
  Upload,
  Search,
  LogOut,
  Loader2,
  Check,
  X,
  RefreshCw,
  Settings,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface VehicleSound {
  id: string
  vehicle_id: string
  vehicle_name: string
  vehicle_brand: string
  vehicle_slug: string
  sound_file_url: string
  description: string | null
  icon: string
  is_electric: boolean
  is_active: boolean
  display_order: number
}

interface Vehicle {
  id: string
  slug: string
  brand: string
  model: string
  version: string | null
  year_model: number
}

export function EngineSoundsAdmin() {
  const [sounds, setSounds] = useState<VehicleSound[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSoundData, setNewSoundData] = useState({
    description: '',
    icon: '🏎️',
    is_electric: false,
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const router = useRouter()

  // Fetch existing sounds
  useEffect(() => {
    fetchSounds()
  }, [])

  const fetchSounds = async () => {
    try {
      const res = await fetch('/api/admin/engine-sounds')
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      setSounds(data.sounds || [])
    } catch (error) {
      console.error('Error fetching sounds:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Search vehicles from inventory
  const searchVehicles = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await fetch(`/api/vehicles?search=${encodeURIComponent(searchQuery)}&limit=10`)
      const data = await res.json()
      setVehicles(data.vehicles || [])
    } catch (error) {
      console.error('Error searching vehicles:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/engine-sounds/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setUploadedFile({ url: data.url, name: file.name })
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Erro ao fazer upload do arquivo')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  // Play/pause audio
  const togglePlay = (soundUrl: string, id: string) => {
    if (playingId === id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = soundUrl
        audioRef.current.play()
        setPlayingId(id)
      }
    }
  }

  // Create new sound association
  const createSound = async () => {
    if (!selectedVehicle || !uploadedFile) {
      alert('Selecione um veículo e faça upload de um arquivo de áudio')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/admin/engine-sounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: selectedVehicle.id,
          vehicle_name: `${selectedVehicle.brand} ${selectedVehicle.model}${selectedVehicle.version ? ` ${selectedVehicle.version}` : ''}`,
          vehicle_brand: selectedVehicle.brand,
          vehicle_slug: selectedVehicle.slug,
          sound_file_url: uploadedFile.url,
          description: newSoundData.description || null,
          icon: newSoundData.icon,
          is_electric: newSoundData.is_electric,
          display_order: sounds.length,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create sound')
      }

      await fetchSounds()
      resetForm()
    } catch (error) {
      console.error('Error creating sound:', error)
      alert(error instanceof Error ? error.message : 'Erro ao criar associação')
    } finally {
      setIsCreating(false)
    }
  }

  // Delete sound
  const deleteSound = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este som?')) return

    try {
      const res = await fetch(`/api/admin/engine-sounds/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      await fetchSounds()
    } catch (error) {
      console.error('Error deleting sound:', error)
      alert('Erro ao remover som')
    }
  }

  // Toggle active status
  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/engine-sounds/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })
      await fetchSounds()
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  // Reset form
  const resetForm = () => {
    setShowAddForm(false)
    setSelectedVehicle(null)
    setUploadedFile(null)
    setSearchQuery('')
    setVehicles([])
    setNewSoundData({ description: '', icon: '🏎️', is_electric: false })
  }

  return (
    <div className="min-h-screen bg-background">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      {/* Admin Header */}
      <header className="bg-background-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Painel Admin</h1>
              <p className="text-xs text-foreground-secondary">Sons de Motor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-foreground-secondary hover:text-foreground hover:bg-background-soft rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-foreground-secondary">
            {sounds.length} som(ns) cadastrado(s)
          </p>
          <div className="flex gap-3">
            <button
              onClick={fetchSounds}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-background-soft transition-colors text-foreground"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Som
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Existing Sounds List */}
            {sounds.length === 0 ? (
              <div className="text-center py-20 bg-background-card border border-border rounded-2xl">
                <Volume2 className="w-12 h-12 text-foreground-secondary mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Nenhum som cadastrado
                </h2>
                <p className="text-foreground-secondary mb-6">
                  Adicione sons de motor aos veículos do estoque
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Primeiro Som
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {sounds.map((sound) => (
                  <div
                    key={sound.id}
                    className="bg-background-card border border-border rounded-xl p-4 flex items-center gap-4"
                  >
                    <span className="text-3xl">{sound.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {sound.vehicle_name}
                      </h3>
                      <p className="text-sm text-foreground-secondary">
                        {sound.description || 'Sem descrição'}
                        {sound.is_electric && (
                          <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                            EV
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Play Button */}
                      <button
                        onClick={() => togglePlay(sound.sound_file_url, sound.id)}
                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {playingId === sound.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      {/* Active Toggle */}
                      <button
                        onClick={() => toggleActive(sound.id, sound.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          sound.is_active
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                        title={sound.is_active ? 'Ativo (clique para desativar)' : 'Inativo (clique para ativar)'}
                      >
                        {sound.is_active ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => deleteSound(sound.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add Sound Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Adicionar Som de Motor</h2>
                <button onClick={resetForm} className="text-foreground-secondary hover:text-foreground">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Step 1: Search Vehicle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  1. Buscar Veículo do Estoque
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchVehicles()}
                    placeholder="Ex: Ferrari 812, Porsche 911..."
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                  <button
                    onClick={searchVehicles}
                    disabled={isSearching}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                </div>
                {vehicles.length > 0 && !selectedVehicle && (
                  <div className="mt-2 border border-border rounded-lg overflow-hidden">
                    {vehicles.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        className="w-full px-4 py-2 text-left hover:bg-background-soft text-foreground border-b border-border last:border-0"
                      >
                        {v.brand} {v.model} {v.version || ''} ({v.year_model})
                      </button>
                    ))}
                  </div>
                )}
                {selectedVehicle && (
                  <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                    <span className="text-foreground">
                      ✓ {selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.version || ''}
                    </span>
                    <button onClick={() => setSelectedVehicle(null)} className="text-foreground-secondary hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Upload Audio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  2. Upload do Arquivo de Áudio (.mp3 ou .wav)
                </label>
                {!uploadedFile ? (
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-foreground-secondary mb-2" />
                        <span className="text-sm text-foreground-secondary">Clique para selecionar</span>
                      </>
                    )}
                    <input type="file" accept=".mp3,.wav,audio/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                    <span className="text-foreground">✓ {uploadedFile.name}</span>
                    <button onClick={() => setUploadedFile(null)} className="text-foreground-secondary hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Step 3: Additional Info */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">3. Descrição (opcional)</label>
                  <input
                    type="text"
                    value={newSoundData.description}
                    onChange={(e) => setNewSoundData({ ...newSoundData, description: e.target.value })}
                    placeholder="Ex: V12 naturalmente aspirado"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground mb-2">Ícone</label>
                    <select
                      value={newSoundData.icon}
                      onChange={(e) => setNewSoundData({ ...newSoundData, icon: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    >
                      <option value="🏎️">🏎️ Supercarro</option>
                      <option value="🔥">🔥 Esportivo</option>
                      <option value="⚡">⚡ Elétrico/Performance</option>
                      <option value="🏁">🏁 Corrida</option>
                      <option value="🦅">🦅 Americano</option>
                      <option value="🚀">🚀 Turbo</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSoundData.is_electric}
                        onChange={(e) => setNewSoundData({ ...newSoundData, is_electric: e.target.checked })}
                        className="w-5 h-5 rounded border-border"
                      />
                      <span className="text-foreground">Elétrico</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={createSound}
                disabled={!selectedVehicle || !uploadedFile || isCreating}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Salvar Som
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

