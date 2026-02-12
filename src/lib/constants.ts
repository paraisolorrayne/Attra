// Constantes centralizadas do site Attra Veículos

// Número de WhatsApp oficial da Attra
export const WHATSAPP_NUMBER = '5534999444747'

// Número de telefone comercial
export const PHONE_NUMBER = '+553430143232'
export const PHONE_DISPLAY = '(34) 3014-3232'

// Telefone secundário (não WhatsApp)
export const PHONE_NUMBER_2 = '+553432260202'
export const PHONE_DISPLAY_2 = '(34) 3226-0202'

// Endereço
export const ADDRESS = {
  street: 'Av. Rondon Pacheco',
  city: 'Uberlândia',
  state: 'MG',
  country: 'Brasil',
}

// Email
export const EMAIL = 'faleconosco@attraveiculos.com.br'

// URLs
export const SITE_URL = 'https://attraveiculos.com.br'

// Seção Editorial (Blog/Insights) - Configurável para testes A/B
export const EDITORIAL_SECTION = {
  menuLabel: 'Insights',           // Label exibido no menu de navegação
  alternatives: ['Garage', 'Lab', 'Editorial', 'Universe'], // Alternativas para testes futuros
  route: '/blog',                  // Rota mantida para SEO
  seoTitle: 'Blog Attra',          // Título otimizado para SEO
  brandName: 'Attra Insights',     // Nome da marca editorial
} as const

// Função helper para gerar link do WhatsApp
export function getWhatsAppUrl(message?: string): string {
  const encodedMessage = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${WHATSAPP_NUMBER}${encodedMessage ? `?text=${encodedMessage}` : ''}`
}

