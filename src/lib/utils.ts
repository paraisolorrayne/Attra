import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('pt-BR').format(mileage) + ' km'
}

export function generateVehicleSlug(
  brand: string,
  model: string,
  year: number,
  id: string
): string {
  const slugPart = `${brand}-${model}-${year}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  
  const shortId = id.substring(0, 8)
  return `${slugPart}-${shortId}`
}

export function generateBlogSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Generate a URL-friendly slug for news articles
 * Includes a short hash to ensure uniqueness
 */
export function generateNewsSlug(title: string, id?: string): string {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
    .substring(0, 80) // Limit length

  // Add short ID suffix for uniqueness (first 8 chars of UUID)
  if (id) {
    const shortId = id.substring(0, 8)
    return `${baseSlug}-${shortId}`
  }

  return baseSlug
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const encodedMessage = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function getVehicleWhatsAppMessage(vehicle: {
  brand: string
  model: string
  year_model: number
}): string {
  return `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year_model}. Gostaria de mais informações.`
}

