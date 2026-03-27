/**
 * Constantes compartilhadas do funil de leads (CRM).
 * Importe daqui em listagem, detalhe e qualquer outro ponto que precise de labels/cores.
 */
import type { EtapaFunil, MotivoPerdaTipo } from '@/types/database'

export const etapaLabels: Record<EtapaFunil, string> = {
  novo_lead:        'Novo Lead',
  primeiro_contato: 'Primeiro Contato',
  visita_agendada:  'Visita Agendada',
  visita_realizada: 'Visita Realizada',
  proposta_enviada: 'Proposta Enviada',
  negociacao:       'Negociação',
  ganho:            'Ganho',
  perdido:          'Perdido',
}

export const etapaColors: Record<EtapaFunil, string> = {
  novo_lead:        'bg-gray-100   text-gray-700   dark:bg-gray-900/30   dark:text-gray-400',
  primeiro_contato: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  visita_agendada:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  visita_realizada: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  proposta_enviada: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  negociacao:       'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  ganho:            'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  perdido:          'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
}

/** Cores vivas para as bolinhas indicadoras (dropdown e lista) */
export const etapaDotColors: Record<EtapaFunil, string> = {
  novo_lead:        'bg-gray-400',
  primeiro_contato: 'bg-blue-500',
  visita_agendada:  'bg-purple-500',
  visita_realizada: 'bg-indigo-500',
  proposta_enviada: 'bg-yellow-400',
  negociacao:       'bg-orange-500',
  ganho:            'bg-green-500',
  perdido:          'bg-red-500',
}

export const motivoPerdaLabels: Record<MotivoPerdaTipo, string> = {
  preco:               'Preço',
  credito_recusado:    'Crédito Recusado',
  comprou_outro_lugar: 'Comprou em Outro Lugar',
  desistiu:            'Desistiu da Compra',
  outro:               'Outro (especificar)',
}

/** Ordem visual das etapas no funil (do topo à base) */
export const etapaOrdem: EtapaFunil[] = [
  'novo_lead',
  'primeiro_contato',
  'visita_agendada',
  'visita_realizada',
  'proposta_enviada',
  'negociacao',
  'ganho',
  'perdido',
]
