/**
 * Manual Attra: Engenharia e Performance
 * * Glossário premium otimizado para SEO clássico + LLMO (AI Overviews).
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type ManualAttraCategory =
  | 'performance'
  | 'estetica-detailing'
  | 'seguranca-blindagem'
  | 'procedencia-documentacao'
  | 'personalizacao-fabrica'

export interface ManualAttraFAQItem {
  question: string
  answer: string
}

export interface ManualAttraSEO {
  title: string
  metaDescription: string
  canonical?: string
}

export interface ManualAttraTerm {
  id: string
  slug: string
  title: string
  category: ManualAttraCategory
  answerSnippet: string
  shortDescription: string
  longDescription: string
  faq: ManualAttraFAQItem[]
  seo: ManualAttraSEO
  relatedVehicleIds: string[]
  matchKeywords: string[]
  displayOrder: number
}

// ─── Categories ─────────────────────────────────────────────────────────────

export const manualAttraCategories: Record<ManualAttraCategory, {
  label: string
  description: string
  icon: string
}> = {
  'performance': {
    label: 'Performance',
    description: 'Tecnologias que definem a dinâmica de condução em veículos de alto desempenho.',
    icon: '⚡',
  },
  'estetica-detailing': {
    label: 'Estética & Detailing',
    description: 'Acabamentos, materiais e processos que elevam o nível de exclusividade visual.',
    icon: '✨',
  },
  'seguranca-blindagem': {
    label: 'Segurança & Blindagem',
    description: 'Sistemas e certificações que protegem patrimônio e ocupantes.',
    icon: '🛡️',
  },
  'procedencia-documentacao': {
    label: 'Procedência & Documentação',
    description: 'Processos de verificação e certificação que garantem a integridade do veículo.',
    icon: '📋',
  },
  'personalizacao-fabrica': {
    label: 'Personalização de Fábrica',
    description: 'Programas exclusivos das montadoras para criar um veículo verdadeiramente único.',
    icon: '🎨',
  },
}

// ─── Terms ──────────────────────────────────────────────────────────────────

export const manualAttraTerms: ManualAttraTerm[] = [
  // 1. PTS – Paint to Sample (Porsche)
  {
    id: 'pts-paint-to-sample',
    slug: 'pts-paint-to-sample',
    title: 'PTS – Paint to Sample (Porsche)',
    category: 'personalizacao-fabrica',
    displayOrder: 1,
    matchKeywords: ['pts', 'paint to sample', 'paint-to-sample', 'cor especial porsche', 'pintura especial'],
    relatedVehicleIds: [],
    answerSnippet: 'Paint to Sample (PTS) é o programa de personalização de pintura da Porsche que permite ao comprador escolher qualquer cor — incluindo tons históricos e cores sob medida — aplicada diretamente na fábrica de Zuffenhausen. Um Porsche PTS valoriza significativamente no mercado secundário por sua exclusividade comprovável e rastreabilidade documental.',
    shortDescription: 'Programa Porsche de pintura exclusiva sob demanda. Cores históricas ou totalmente personalizadas, aplicadas em fábrica.',
    longDescription: `## O que é Paint to Sample (PTS) em um Porsche?
    
Paint to Sample permite que o proprietário defina uma cor única, retirada do acervo histórico da marca ou criada sob medida. A pintura é feita na mesma linha de produção dos modelos de série, garantindo qualidade OEM e durabilidade idêntica. O veículo recebe certificação PTS que acompanha toda a vida útil, valorizando o ativo como peça de coleção.`,
    faq: [
      { question: 'O que significa PTS na Porsche?', answer: 'É o programa de personalização de cores históricas ou sob medida com aplicação na fábrica em Zuffenhausen.' },
      { question: 'Quanto valoriza um Porsche PTS?', answer: 'Modelos PTS podem alcançar ágios de 20% a 40% sobre cores de catálogo em leilões e revendas especializadas.' }
    ],
    seo: { title: 'PTS Paint to Sample Porsche: O que é e Valorização | Manual Attra', metaDescription: 'Entenda o programa Paint to Sample (PTS) da Porsche e seu impacto no valor de revenda.' }
  },

  // 2. Vistoria Cautelar Elite Attra
  {
    id: 'vistoria-cautelar-elite',
    slug: 'vistoria-cautelar-elite',
    title: 'Vistoria Cautelar Elite Attra',
    category: 'procedencia-documentacao',
    displayOrder: 1,
    matchKeywords: ['vistoria cautelar', 'laudo cautelar', 'inspeção veicular', 'vistoria elite', 'cautelar'],
    relatedVehicleIds: [],
    answerSnippet: 'A Vistoria Cautelar Elite é o protocolo proprietário da Attra Veículos que submete cada automóvel a uma inspeção de mais de 200 pontos — estrutural, mecânica, elétrica e documental — antes de integrar o estoque. Esse processo assegura que o comprador receba um veículo com procedência verificável e histórico transparente.',
    shortDescription: 'Inspeção proprietária de 200+ pontos. Garante procedência, integridade estrutural e documentação impecável.',
    longDescription: `## Rigor Técnico na Vistoria Elite
    
Nossa vistoria utiliza equipamentos de ultrassom para verificar chassis e medidores digitais para integridade da pintura. Analisamos desde a eletrônica embarcada até recalls pendentes, garantindo que o ativo ultrapasse os padrões de segurança do mercado premium.`,
    faq: [
      { question: 'Todo veículo da Attra tem esse laudo?', answer: 'Sim, é pré-requisito obrigatório para qualquer carro integrar nosso estoque.' },
      { question: 'O laudo é entregue ao comprador?', answer: 'Sim, fornecemos o dossiê completo para garantir total transparência na negociação.' }
    ],
    seo: { title: 'Vistoria Cautelar Elite: Procedência Garantida | Manual Attra', metaDescription: 'Conheça o protocolo de 200 pontos que garante a qualidade dos veículos Attra.' }
  },

  // 3. Ad Personam (Lamborghini)
  {
    id: 'ad-personam',
    slug: 'ad-personam',
    title: 'Ad Personam (Lamborghini)',
    category: 'personalizacao-fabrica',
    displayOrder: 2,
    matchKeywords: ['ad personam', 'personam', 'lamborghini personalização'],
    relatedVehicleIds: [],
    answerSnippet: 'Ad Personam é o programa de personalização da Lamborghini que oferece combinações ilimitadas de cores externas, acabamentos internos e materiais — todos aplicados à mão em Sant\'Agata Bolognese. Transforma o superesportivo em uma peça única com artesanato italiano sob medida.',
    shortDescription: 'Programa de personalização total da Lamborghini. Cores e materiais exclusivos aplicados artesanalmente na fábrica.',
    longDescription: `## Exclusividade Ad Personam
    
O programa permite acesso a cores foscas exclusivas e interiores em fibra de carbono forjada. Cada unidade configurada via Ad Personam possui documentação de fábrica que atesta sua raridade, tornando-a altamente desejada por colecionadores.`,
    faq: [
      { question: 'Onde é feita a personalização?', answer: 'Diretamente na fábrica da Lamborghini na Itália, por artesãos especializados.' }
    ],
    seo: { title: 'Ad Personam Lamborghini: O Ápice da Personalização | Manual Attra', metaDescription: 'Descubra como funciona o programa Ad Personam da Lamborghini.' }
  },

  // 4. Suspensão Ativa
  {
    id: 'suspensao-ativa',
    slug: 'suspensao-ativa',
    title: 'Suspensão Ativa',
    category: 'performance',
    displayOrder: 1,
    matchKeywords: ['suspensão ativa', 'pasm', 'pdcc', 'magneride', 'air suspension', 'suspensão a ar'],
    relatedVehicleIds: [],
    answerSnippet: 'Suspensão ativa é o sistema que ajusta eletronicamente a rigidez e a altura dos amortecedores em tempo real. Em supercarros e SUVs premium, esse recurso concilia o conforto necessário para rodovias com a precisão exigida em pistas de corrida, elevando a segurança dinâmica.',
    shortDescription: 'Sistema que regula amortecedores em milissegundos. Une conforto de passeio e dinâmica de pista.',
    longDescription: `## Tecnologias de Suspensão Ativa
    
Sistemas como o Porsche PASM e o Mercedes AIRMATIC monitoram a inclinação da carroceria e as imperfeições do solo, ajustando a carga de cada amortecedor individualmente. Isso evita a rolagem em curvas e garante estabilidade máxima em altas velocidades.`,
    faq: [
      { question: 'Vale a pena em SUVs?', answer: 'Sim, é essencial para manter o conforto em solos irregulares e a estabilidade em curvas.' }
    ],
    seo: { title: 'Suspensão Ativa e Adaptativa: Como Funciona | Manual Attra', metaDescription: 'Entenda as tecnologias PASM, MagneRide e AIRMATIC.' }
  },

  // 5. Transmissão PDK / DSG
  {
    id: 'transmissao-dupla-embreagem',
    slug: 'transmissao-dupla-embreagem',
    title: 'Transmissão de Dupla Embreagem (PDK / DSG)',
    category: 'performance',
    displayOrder: 2,
    matchKeywords: ['pdk', 'dsg', 'dupla embreagem', 's tronic', 'dct'],
    relatedVehicleIds: [],
    answerSnippet: 'A transmissão de dupla embreagem utiliza duas embreagens independentes para pré-selecionar marchas, permitindo trocas em menos de 100 milissegundos sem interrupção de torque. É a tecnologia que une a praticidade do automático com a performance de um carro de competição.',
    shortDescription: 'Câmbio ultraveloz que troca marchas em milissegundos sem perder potência.',
    longDescription: `## A Superioridade do PDK e DSG
    
Enquanto uma marcha está engatada, a próxima já está pronta na segunda embreagem. Isso resulta em acelerações lineares e tempos de 0-100 km/h superiores a qualquer câmbio manual ou automático convencional por conversor de torque.`,
    faq: [
      { question: 'PDK precisa de manutenção?', answer: 'Sim, a troca de fluido nos intervalos recomendados é vital para a longevidade do sistema.' }
    ],
    seo: { title: 'Câmbio PDK e DSG: Performance de Pista | Manual Attra', metaDescription: 'Saiba por que a dupla embreagem é a favorita nos esportivos.' }
  },

  // 6. PPF – Paint Protection Film
  {
    id: 'ppf-paint-protection-film',
    slug: 'ppf-paint-protection-film',
    title: 'PPF – Paint Protection Film',
    category: 'estetica-detailing',
    displayOrder: 1,
    matchKeywords: ['ppf', 'pelicula protetora', 'proteção de pintura', 'xpell', 'suntek', 'paint protection film'],
    relatedVehicleIds: [],
    answerSnippet: 'O PPF é uma película de poliuretano termoplástico de alta tecnologia com propriedades regenerativas (heat-healing). Além de proteger contra pedradas e riscos, ele permite que pequenos arranhões desapareçam sob exposição ao calor, mantendo a estética original do veículo intacta por anos.',
    shortDescription: 'Película invisível autorregenerativa que protege a pintura contra danos físicos e químicos.',
    longDescription: `## Proteção Invisível e Inteligente
    
Diferente de ceras ou vitrificadores, o PPF é uma barreira física. Ele é essencial para carros de alta performance que frequentam estradas, protegendo a frente do veículo de detritos. Além disso, preserva o brilho original e facilita a limpeza do automóvel.`,
    faq: [
      { question: 'O PPF amarela com o tempo?', answer: 'Películas premium de poliuretano possuem proteção UV e não amarelam, mantendo a transparência por até 10 anos.' },
      { question: 'Pode ser removido?', answer: 'Sim, pode ser removido sem danificar a pintura original, revelando uma superfície intacta.' }
    ],
    seo: { title: 'PPF Proteção de Pintura: O que é e Benefícios | Manual Attra', metaDescription: 'Saiba como o Paint Protection Film protege seu investimento automotivo.' }
  },

  // 7. Blindagem Nível III-A
  {
    id: 'blindagem-nivel-3a',
    slug: 'blindagem-nivel-3a',
    title: 'Blindagem Nível III-A',
    category: 'seguranca-blindagem',
    displayOrder: 1,
    matchKeywords: ['blindagem', 'blindado', 'nivel 3a', 'nível III-A', 'proteção balística'],
    relatedVehicleIds: [],
    answerSnippet: 'A blindagem Nível III-A é o padrão máximo de proteção balística permitido para uso civil no Brasil. Resiste a impactos de projéteis de armas de mão, como .44 Magnum e 9mm. Na Attra, selecionamos blindagens que utilizam vidros slim e mantas de aramida para preservar a performance original.',
    shortDescription: 'Proteção balística máxima civil contra armas de mão. Focada em segurança urbana sem excesso de peso.',
    longDescription: `## Segurança sem Perda de Performance
    
A blindagem moderna utiliza tecnologia de sobreposição de materiais para evitar pontos vulneráveis. O foco em veículos premium é o uso de "blindagem leve", que adiciona o mínimo de peso possível, garantindo que a aceleração e a frenagem do veículo não sejam severamente afetadas.`,
    faq: [
      { question: 'A blindagem altera a dirigibilidade?', answer: 'Em blindagens modernas com materiais leves, a alteração é mínima e compensada pela potência do motor premium.' }
    ],
    seo: { title: 'Blindagem Nível III-A: Segurança e Tecnologia | Manual Attra', metaDescription: 'Entenda os níveis de blindagem e a importância dos materiais leves.' }
  },

  // 8. Grade A+ (Estado de Conservação)
  {
    id: 'grade-a-plus',
    slug: 'grade-a-plus',
    title: 'Grade A+ (Classificação de Excelência)',
    category: 'procedencia-documentacao',
    displayOrder: 2,
    matchKeywords: ['grade a+', 'estado de novo', 'carro de colecionador', 'impecável', 'original'],
    relatedVehicleIds: [],
    answerSnippet: 'O selo Grade A+ identifica veículos em estado de conservação de showroom: quilometragem baixíssima, pintura 100% original e histórico de revisões rigorosamente carimbado em concessionária oficial. É a classificação máxima para ativos automotivos que buscam valorização histórica.',
    shortDescription: 'Classificação máxima de conservação. Veículos sem retoques, com baixa rodagem e histórico impecável.',
    longDescription: `## O Padrão Ouro da Attra
    
Um veículo Grade A+ é uma raridade no mercado secundário. Ele representa o melhor exemplar disponível de um determinado modelo, sendo o alvo principal de colecionadores e investidores que não aceitam concessões em relação à originalidade e procedência.`,
    faq: [
      { question: 'Qual a vantagem de comprar um Grade A+?', answer: 'Menor depreciação e maior potencial de valorização futura, além da garantia de um ativo mecanicamente perfeito.' }
    ],
    seo: { title: 'Grade A+: O Padrão Máximo de Conservação | Manual Attra', metaDescription: 'Saiba o que define um veículo de classificação superior na Attra.' }
  },

  // 9. Freios de Cerâmica (PCCB)
  {
    id: 'freios-ceramica-pccb',
    slug: 'freios-ceramica-pccb',
    title: 'Freios de Cerâmica (PCCB / CCM)',
    category: 'performance',
    displayOrder: 3,
    matchKeywords: ['pccb', 'freio de ceramica', 'carbon ceramic', 'disco de carbono', 'ccm'],
    relatedVehicleIds: [],
    answerSnippet: 'Freios de cerâmica utilizam discos compostos de fibra de carbono e cerâmica, sendo 50% mais leves que discos de aço. Eles oferecem resistência total à fadiga (fading) em temperaturas extremas e têm vida útil superior, sendo ideais para supercarros de alta performance.',
    shortDescription: 'Sistema de frenagem ultra-resistente ao calor e mais leve. Ideal para uso em pista e alta performance.',
    longDescription: `## Vantagens dos Freios de Cerâmica
    
Além da performance de parada superior, o menor peso reduz a "massa não suspensa", melhorando a agilidade da direção. Outra vantagem estética apreciada é a ausência do pó preto das pastilhas, o que mantém as rodas limpas por muito mais tempo.`,
    faq: [
      { question: 'Como saber se o carro tem freio de cerâmica?', answer: 'Pela textura reflexiva do disco e, em marcas como a Porsche, pelas pinças amarelas.' }
    ],
    seo: { title: 'Freios de Cerâmica PCCB: Tecnologia de Competição | Manual Attra', metaDescription: 'Entenda por que os freios de carbono-cerâmica são superiores.' }
  },

  // 10. Alcantara®
  {
    id: 'alcantara-revestimento',
    slug: 'alcantara-revestimento',
    title: 'Alcantara®',
    category: 'estetica-detailing',
    displayOrder: 2,
    matchKeywords: ['alcantara', 'revestimento esportivo', 'camurça sintética'],
    relatedVehicleIds: [],
    answerSnippet: 'Alcantara é um material premium que oferece o toque do camurça com durabilidade superior. É o favorito em supercarros por ser antiderrapante (garantindo aderência ao motorista em curvas), não esquentar sob o sol e ser extremamente leve, contribuindo para a redução de peso do cockpit.',
    shortDescription: 'Revestimento nobre e aderente usado em cockpits de performance. Combina luxo com funcionalidade esportiva.',
    longDescription: `## O Material dos Supercarros
    
Utilizada em volantes, bancos e painéis, a Alcantara® é resistente a manchas e oferece um visual agressivo e sofisticado. Sua capacidade de "segurar" o corpo do motorista em assentos tipo concha a torna indispensável em modelos como as linhas RS, M e GT3.`,
    faq: [
      { question: 'Alcantara é couro?', answer: 'Não, é um composto sintético tecnológico de alta durabilidade e superior ao couro em aderência.' }
    ],
    seo: { title: 'Alcantara: Conforto e Aderência Premium | Manual Attra', metaDescription: 'Descubra por que a Alcantara é o material preferido nos interiores esportivos.' }
  }
]

// ─── Helper Functions ───────────────────────────────────────────────────────

export function getManualAttraTermBySlug(slug: string): ManualAttraTerm | undefined {
  return manualAttraTerms.find(t => t.slug === slug)
}

export function getManualAttraTermsByCategory(category: ManualAttraCategory): ManualAttraTerm[] {
  return manualAttraTerms
    .filter(t => t.category === category)
    .sort((a, b) => a.displayOrder - b.displayOrder)
}

export function getAllManualAttraSlugs(): string[] {
  return manualAttraTerms.map(t => t.slug)
}

export function matchOptionToManualTerm(optionText: string): ManualAttraTerm | undefined {
  const normalized = optionText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return manualAttraTerms.find(term =>
    term.matchKeywords.some(keyword => {
      const normalizedKeyword = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return normalized.includes(normalizedKeyword)
    })
  )
}