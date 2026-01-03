/**
 * Supabase Storage Service
 * Handles file uploads, downloads, and deletions using Supabase Storage
 */

import { createAdminClient } from './server'

// Storage bucket name for audio files
export const AUDIO_BUCKET = 'audio-files'

// Allowed audio MIME types
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
]

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export interface DeleteResult {
  success: boolean
  error?: string
}

/**
 * Generate a unique filename for uploaded files
 */
function generateFilename(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'mp3'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `engine-sound-${timestamp}-${random}.${ext}`
}

/**
 * Validate audio file before upload
 */
function validateAudioFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only MP3 and WAV files are allowed.',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    }
  }

  return { valid: true }
}

/**
 * Upload an audio file to Supabase Storage
 */
export async function uploadAudioFile(file: File): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateAudioFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const supabase = createAdminClient()
    const filename = generateFilename(file.name)
    const filePath = `sounds/${filename}`

    // Convert File to ArrayBuffer then to Uint8Array for Supabase
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error('Error uploading audio file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Delete an audio file from Supabase Storage
 */
export async function deleteAudioFile(fileUrl: string): Promise<DeleteResult> {
  try {
    const supabase = createAdminClient()

    // Extract the path from the URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/audio-files/sounds/filename.mp3
    const urlParts = fileUrl.split(`/storage/v1/object/public/${AUDIO_BUCKET}/`)
    if (urlParts.length !== 2) {
      // Not a Supabase Storage URL, might be legacy local file
      console.warn('Not a Supabase Storage URL, skipping deletion:', fileUrl)
      return { success: true }
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Supabase delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting audio file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check if a URL is a Supabase Storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage/v1/object/public/')
}

/**
 * Check if a URL is a legacy local upload URL
 */
export function isLegacyLocalUrl(url: string): boolean {
  return url.startsWith('/uploads/sounds/')
}

