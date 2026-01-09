export interface GlossaryTerm {
  term: string
  slug: string
  definition: string
  category: 'performance' | 'technology' | 'body' | 'engine' | 'safety' | 'luxury'
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'Aspirado',
    slug: 'aspirado',
    definition: 'Motor que utiliza apenas a pressão atmosférica para admissão de ar, sem auxílio de turbo ou compressor. Motores aspirados são conhecidos pela resposta linear e som característico.',
    category: 'engine',
  },
  {
    term: 'Biturbo',
    slug: 'biturbo',
    definition: 'Sistema com dois turbocompressores que trabalham em conjunto para aumentar a potência do motor. Pode ser sequencial (um turbo para baixas rotações, outro para altas) ou paralelo.',
    category: 'engine',
  },
  {
    term: 'Câmbio PDK',
    slug: 'cambio-pdk',
    definition: 'Porsche Doppelkupplung - transmissão de dupla embreagem desenvolvida pela Porsche. Oferece trocas de marcha extremamente rápidas (menos de 100ms) mantendo conforto.',
    category: 'technology',
  },
  {
    term: 'Carbono Cerâmico',
    slug: 'carbono-ceramico',
    definition: 'Sistema de freios que utiliza discos de carbono-cerâmica (PCCB, CCB). Mais leves que discos de aço, resistem a temperaturas extremas e têm vida útil muito superior.',
    category: 'performance',
  },
  {
    term: 'Cavalo-Vapor (cv)',
    slug: 'cavalo-vapor',
    definition: 'Unidade de medida de potência. 1 cv equivale a aproximadamente 735,5 watts. Supercarros modernos frequentemente ultrapassam 700 cv.',
    category: 'performance',
  },
  {
    term: 'Chassi Monocoque',
    slug: 'chassi-monocoque',
    definition: 'Estrutura onde chassi e carroceria formam uma única peça, comum em supercarros. Oferece maior rigidez torcional com menor peso.',
    category: 'body',
  },
  {
    term: 'Downforce',
    slug: 'downforce',
    definition: 'Força aerodinâmica que empurra o veículo contra o solo, aumentando aderência em altas velocidades. Gerada por asas, difusores e design da carroceria.',
    category: 'performance',
  },
  {
    term: 'Fibra de Carbono',
    slug: 'fibra-de-carbono',
    definition: 'Material composto extremamente leve e resistente usado em supercarros. Pode ser até 5x mais leve que aço com resistência similar.',
    category: 'body',
  },
  {
    term: 'Híbrido Plug-in',
    slug: 'hibrido-plug-in',
    definition: 'Veículo que combina motor a combustão com motor elétrico, podendo ser carregado em tomada. Oferece autonomia elétrica para uso urbano.',
    category: 'technology',
  },
  {
    term: 'Launch Control',
    slug: 'launch-control',
    definition: 'Sistema eletrônico que otimiza a arrancada do veículo, controlando rotação do motor, tração e câmbio para máxima aceleração sem patinar.',
    category: 'technology',
  },
  {
    term: 'Mid-Engine',
    slug: 'mid-engine',
    definition: 'Configuração onde o motor está posicionado entre os eixos, atrás do motorista. Oferece distribuição de peso ideal (geralmente 40/60) para melhor dinâmica.',
    category: 'body',
  },
  {
    term: 'Nm (Newton-metro)',
    slug: 'newton-metro',
    definition: 'Unidade de medida de torque. Indica a força de rotação do motor. Supercarros modernos podem ter mais de 700 Nm de torque.',
    category: 'performance',
  },
  {
    term: 'Portas Tesoura',
    slug: 'portas-tesoura',
    definition: 'Portas que abrem verticalmente, girando em dobradiças na parte frontal. Icônicas em Lamborghini, também chamadas de "scissor doors".',
    category: 'body',
  },
  {
    term: 'Quattro',
    slug: 'quattro',
    definition: 'Sistema de tração integral permanente da Audi. Distribui torque entre os eixos automaticamente para máxima tração em qualquer condição.',
    category: 'technology',
  },
  {
    term: 'Relação Peso/Potência',
    slug: 'relacao-peso-potencia',
    definition: 'Métrica que divide o peso do veículo pela potência (kg/cv). Quanto menor, melhor a performance. Supercarros buscam menos de 3 kg/cv.',
    category: 'performance',
  },
  {
    term: 'Suspensão Ativa',
    slug: 'suspensao-ativa',
    definition: 'Sistema que ajusta a rigidez dos amortecedores em tempo real, adaptando-se às condições da pista e estilo de condução.',
    category: 'technology',
  },
  {
    term: 'Targa',
    slug: 'targa',
    definition: 'Tipo de carroceria com teto removível e barra de proteção traseira fixa. Nome popularizado pelo Porsche 911 Targa.',
    category: 'body',
  },
  {
    term: 'Torque Vectoring',
    slug: 'torque-vectoring',
    definition: 'Sistema que distribui torque individualmente para cada roda, melhorando a dinâmica em curvas e estabilidade.',
    category: 'technology',
  },
  {
    term: 'V12',
    slug: 'v12',
    definition: 'Configuração de motor com 12 cilindros em V. Oferece potência elevada, funcionamento suave e som característico. Comum em Ferrari e Lamborghini.',
    category: 'engine',
  },
  {
    term: 'Wet Mode',
    slug: 'wet-mode',
    definition: 'Modo de condução específico para piso molhado, presente em supercarros como Ferrari SF90. Ajusta tração, suspensão e resposta do acelerador.',
    category: 'safety',
  },
]

export const glossaryCategories = {
  performance: { label: 'Performance', icon: '⚡' },
  technology: { label: 'Tecnologia', icon: '🔧' },
  body: { label: 'Carroceria', icon: '🚗' },
  engine: { label: 'Motor', icon: '🔥' },
  safety: { label: 'Segurança', icon: '🛡️' },
  luxury: { label: 'Luxo', icon: '✨' },
}

