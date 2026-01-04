/**
 * Review Relevance Analyzer
 * Calculates a relevance score (0-100) for Google reviews
 * based on rating, text quality, and keyword presence
 */

import { GoogleReview } from './google-places'

// Positive keywords that increase relevance (Portuguese)
const POSITIVE_KEYWORDS = [
  'excelente', 'maravilhoso', 'incrível', 'fantástico', 'perfeito',
  'ótimo', 'ótima', 'muito bom', 'muito boa', 'sensacional',
  'recomendo', 'super recomendo', 'indico', 'melhor', 'top',
  'satisfeito', 'satisfeita', 'adorei', 'amei', 'encantado',
  'profissional', 'profissionais', 'atencioso', 'atenciosos',
  'confiança', 'confiável', 'seguro', 'honesto', 'transparente',
  'rápido', 'ágil', 'eficiente', 'organizado', 'impecável',
  'qualidade', 'premium', 'luxo', 'diferenciado', 'exclusivo',
]

// Keywords related to services offered
const SERVICE_KEYWORDS = [
  'financiamento', 'financiei', 'parcelas', 'entrada',
  'importação', 'importado', 'importados',
  'entrega', 'logística', 'transporte',
  'documentação', 'transferência', 'ipva',
  'troca', 'consignação', 'avaliação',
]

// Keywords related to vehicles
const VEHICLE_KEYWORDS = [
  'carro', 'veículo', 'automóvel', 'ferrari', 'porsche', 'lamborghini',
  'mclaren', 'mercedes', 'bmw', 'audi', 'lexus', 'land rover',
  'superesportivo', 'esportivo', 'luxo', 'seminovo', 'importado',
  'motor', 'potência', 'performance', 'acabamento', 'interior',
]

// Keywords about team/service
const TEAM_KEYWORDS = [
  'vendedor', 'vendedores', 'atendente', 'equipe', 'time',
  'atendimento', 'suporte', 'funcionário', 'funcionários',
  'gerente', 'dono', 'proprietário', 'consultor',
]

export interface ReviewAnalysis {
  relevanceScore: number
  sentimentKeywords: string[]
  mentionsServices: boolean
  mentionsVehicles: boolean
  mentionsTeam: boolean
  shouldApprove: boolean
  reasons: string[]
}

/**
 * Analyze a review and calculate relevance score
 */
export function analyzeReview(review: GoogleReview): ReviewAnalysis {
  const text = (review.text || '').toLowerCase()
  const rating = review.rating || 0
  
  let score = 0
  const reasons: string[] = []
  const foundKeywords: string[] = []
  
  // 1. Rating score (0-40 points)
  // 5 stars = 40, 4 stars = 30, 3 stars = 15, 2 stars = 5, 1 star = 0
  const ratingScores: Record<number, number> = { 5: 40, 4: 30, 3: 15, 2: 5, 1: 0 }
  score += ratingScores[rating] || 0
  reasons.push(`Rating ${rating}★ = ${ratingScores[rating] || 0} pontos`)
  
  // 2. Text presence (0-15 points)
  if (text.length > 0) {
    if (text.length >= 200) {
      score += 15
      reasons.push('Texto detalhado (+15)')
    } else if (text.length >= 100) {
      score += 10
      reasons.push('Texto médio (+10)')
    } else if (text.length >= 30) {
      score += 5
      reasons.push('Texto curto (+5)')
    }
  }
  
  // 3. Positive keywords (0-25 points, max 5 keywords x 5 points each)
  let positiveCount = 0
  for (const keyword of POSITIVE_KEYWORDS) {
    if (text.includes(keyword) && positiveCount < 5) {
      positiveCount++
      foundKeywords.push(keyword)
    }
  }
  const positiveScore = positiveCount * 5
  score += positiveScore
  if (positiveCount > 0) {
    reasons.push(`${positiveCount} palavras positivas (+${positiveScore})`)
  }
  
  // 4. Service mentions (0-10 points)
  const mentionsServices = SERVICE_KEYWORDS.some(kw => text.includes(kw))
  if (mentionsServices) {
    score += 10
    reasons.push('Menciona serviços (+10)')
  }
  
  // 5. Vehicle mentions (0-5 points)
  const mentionsVehicles = VEHICLE_KEYWORDS.some(kw => text.includes(kw))
  if (mentionsVehicles) {
    score += 5
    reasons.push('Menciona veículos (+5)')
  }
  
  // 6. Team/service mentions (0-5 points)
  const mentionsTeam = TEAM_KEYWORDS.some(kw => text.includes(kw))
  if (mentionsTeam) {
    score += 5
    reasons.push('Menciona equipe (+5)')
  }
  
  // Cap score at 100
  score = Math.min(100, score)
  
  // Auto-approve criteria: rating >= 4 AND (has text OR score >= 50)
  const shouldApprove = rating >= 4 && (text.length >= 30 || score >= 50)
  
  return {
    relevanceScore: score,
    sentimentKeywords: foundKeywords,
    mentionsServices,
    mentionsVehicles,
    mentionsTeam,
    shouldApprove,
    reasons,
  }
}

/**
 * Sort reviews by relevance score (descending)
 */
export function sortByRelevance(
  reviews: Array<GoogleReview & { analysis?: ReviewAnalysis }>
): Array<GoogleReview & { analysis: ReviewAnalysis }> {
  return reviews
    .map(review => ({
      ...review,
      analysis: review.analysis || analyzeReview(review),
    }))
    .sort((a, b) => b.analysis.relevanceScore - a.analysis.relevanceScore)
}

