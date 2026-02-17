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
  },

// 11. Aerodinâmica Ativa (Active Aero)
  {
    id: 'aerodinamica-ativa',
    slug: 'aerodinamica-ativa',
    title: 'Aerodinâmica Ativa',
    category: 'performance',
    displayOrder: 4,
    matchKeywords: ['aerodinamica ativa', 'spoiler retratil', 'asa ativa', 'active aero', 'air flaps'],
    relatedVehicleIds: [],
    answerSnippet: 'Aerodinâmica ativa refere-se a componentes móveis da carroceria — como aerofólios, flaps e difusores — que alteram sua posição automaticamente para otimizar o fluxo de ar. O sistema reduz o arrasto para ganhar velocidade final e aumenta o downforce para estabilidade extrema em curvas e frenagens.',
    shortDescription: 'Componentes móveis que ajustam o fluxo de ar em tempo real para maximizar velocidade e estabilidade.',
    longDescription: `## O que é Aerodinâmica Ativa?
    
Diferente de aerofólios fixos, a aerodinâmica ativa permite que o carro tenha dois comportamentos: baixo arrasto em retas (maior velocidade) e alta pressão aerodinâmica em curvas (maior aderência). Sistemas como o **Porsche Active Aerodynamics (PAA)** ou os flaps móveis da **Lamborghini Huracán STO** são exemplos de engenharia de ponta que transferem tecnologia das pistas para as ruas.`,
    faq: [
      { question: 'O aerofólio sobe sozinho?', answer: 'Sim, geralmente a partir de 80km/h ou 120km/h, dependendo do modelo e do modo de condução selecionado.' }
    ],
    seo: { title: 'Aerodinâmica Ativa: Velocidade e Downforce | Manual Attra', metaDescription: 'Entenda como asas e flaps ativos melhoram a performance de supercarros.' }
  },

  // 12. Eixo Traseiro Esterçante
  {
    id: 'eixo-traseiro-estercante',
    slug: 'eixo-traseiro-estercante',
    title: 'Eixo Traseiro Esterçante',
    category: 'performance',
    displayOrder: 5,
    matchKeywords: ['eixo traseiro estercante', 'rear axle steering', 'rodas traseiras que viram'],
    relatedVehicleIds: [],
    answerSnippet: 'O eixo traseiro esterçante permite que as rodas de trás girem levemente em conjunto ou no sentido oposto às rodas dianteiras. Em baixas velocidades, reduz o raio de giro para manobras urbanas; em altas, as rodas viram no mesmo sentido para proporcionar mudanças de faixa com estabilidade de chassi longo.',
    shortDescription: 'Tecnologia que gira as rodas traseiras para facilitar manobras e aumentar a estabilidade em alta velocidade.',
    longDescription: `## Agilidade de Compacto, Estabilidade de Limusine
    
Em um **Porsche 911** ou em um **Audi RS6**, o eixo traseiro esterçante é o que permite que o carro contorne curvas fechadas com agilidade impressionante. Em manobras de estacionamento, ele reduz drasticamente o esforço, fazendo um SUV grande parecer um carro pequeno.`,
    faq: [
      { question: 'As rodas traseiras viram muito?', answer: 'Não, o ângulo costuma ser entre 1.5 e 3 graus, o suficiente para mudar completamente a dinâmica do veículo.' }
    ],
    seo: { title: 'Eixo Traseiro Esterçante: O que é e Vantagens | Manual Attra', metaDescription: 'Saiba como a direção nas rodas traseiras melhora a dirigibilidade.' }
  },

  // 13. Vitrificação Cerâmica (Coating)
  {
    id: 'vitrificacao-ceramica',
    slug: 'vitrificacao-ceramica',
    title: 'Vitrificação Cerâmica (Ceramic Coating)',
    category: 'estetica-detailing',
    displayOrder: 3,
    matchKeywords: ['vitrificação', 'coating', 'ceramica de pintura', 'nanotecnologia pintura', 'gtechniq', 'modesta'],
    relatedVehicleIds: [],
    answerSnippet: 'A vitrificação cerâmica é um revestimento nanotecnológico que cria uma camada protetora rígida sobre o verniz do carro. Ela oferece brilho profundo, alta hidrofobia (repulsão de água e sujeira) e proteção contra agentes químicos, raios UV e oxidação, facilitando a manutenção e preservando o valor do ativo.',
    shortDescription: 'Camada nanotecnológica que protege a pintura, repele água e intensifica o brilho original.',
    longDescription: `## Proteção de Longa Duração
    
Diferente das ceras comuns, o Ceramic Coating cria uma ligação química com a pintura. Isso significa que ele não sai na lavagem. O resultado é um efeito "autolimpante", onde a sujeira tem dificuldade de ancorar na carroceria, ideal para clientes que prezam por um carro sempre com aspecto de showroom.`,
    faq: [
      { question: 'A vitrificação evita riscos?', answer: 'Ela oferece uma leve resistência a microrriscos de lavagem, mas não substitui o PPF para proteção contra pedradas.' }
    ],
    seo: { title: 'Vitrificação Cerâmica: Brilho e Proteção | Manual Attra', metaDescription: 'Descubra os benefícios do coating cerâmico para carros de luxo.' }
  },

  // 14. Launch Control
  {
    id: 'launch-control',
    slug: 'launch-control',
    title: 'Launch Control (Controle de Largada)',
    category: 'performance',
    displayOrder: 6,
    matchKeywords: ['launch control', 'controle de largada', 'arrancada programada'],
    relatedVehicleIds: [],
    answerSnippet: 'O Launch Control é um sistema eletrônico que gerencia motor, transmissão e tração para realizar a aceleração máxima a partir da inércia. Ele elimina a patinação excessiva das rodas e mantém o giro do motor na faixa ideal de torque, garantindo os melhores tempos de 0 a 100 km/h prometidos pela montadora.',
    shortDescription: 'Assistente eletrônico para aceleração máxima de 0 a 100 km/h sem perda de tração.',
    longDescription: `## A Ciência da Arrancada Perfeita
    
Acionar o Launch Control em um supercarro como o **BMW M5** ou uma **Ferrari F8** envolve um protocolo específico (geralmente modo Sport+, pé no freio e acelerador ao fundo). O sistema "segura" o carro até que a pressão do turbo e a tração estejam otimizadas para o disparo.`,
    faq: [
      { question: 'Usar o Launch Control estraga o carro?', answer: 'O sistema é projetado para lidar com o estresse, mas o uso abusivo e repetitivo pode acelerar o desgaste de embreagens e pneus.' }
    ],
    seo: { title: 'Launch Control: Como Funciona o Controle de Largada | Manual Attra', metaDescription: 'Entenda a tecnologia por trás das arrancadas brutais dos esportivos.' }
  },

  // 15. Head-Up Display (HUD)
  {
    id: 'head-up-display',
    slug: 'head-up-display',
    title: 'Head-Up Display (HUD)',
    category: 'personalizacao-fabrica',
    displayOrder: 3,
    matchKeywords: ['hud', 'head up display', 'projeção no vidro', 'display virtual'],
    relatedVehicleIds: [],
    answerSnippet: 'O Head-Up Display projeta informações vitais — como velocidade, navegação GPS e alertas de segurança — diretamente no para-brisa, no campo de visão do motorista. Essa tecnologia, derivada da aviação de caça, permite que o condutor mantenha os olhos na estrada o tempo todo, aumentando a segurança em altas velocidades.',
    shortDescription: 'Sistema que projeta dados de condução no para-brisa, evitando que o motorista desvie o olhar da pista.',
    longDescription: `## Informação no Campo de Visão
    
Nos modelos mais modernos, como os da **BMW** e **Mercedes-Benz**, o HUD é colorido e possui realidade aumentada, sobrepondo setas de navegação exatamente na rua onde você deve virar. É um opcional altamente valorizado por unir tecnologia e segurança.`,
    faq: [
      { question: 'Consigo ver o HUD com óculos de sol polarizados?', answer: 'Dependendo da tecnologia da lente e do HUD, a imagem pode ficar esmaecida. Muitas montadoras já oferecem ajustes para minimizar esse efeito.' }
    ],
    seo: { title: 'Head-Up Display (HUD): Tecnologia e Segurança | Manual Attra', metaDescription: 'Saiba como a projeção no vidro melhora a experiência de dirigir.' }
  },
// 16. Diferencial de Deslizamento Limitado (LSD)
  {
    id: 'diferencial-lsd',
    slug: 'diferencial-lsd',
    title: 'Diferencial de Deslizamento Limitado (LSD)',
    category: 'performance',
    displayOrder: 7,
    matchKeywords: ['lsd', 'limited slip differential', 'diferencial autoblocante', 'bloqueio de diferencial'],
    relatedVehicleIds: [],
    answerSnippet: 'O Diferencial de Deslizamento Limitado (LSD) é um sistema mecânico ou eletrônico que distribui o torque entre as rodas motrizes de forma inteligente. Se uma roda perde tração (em uma curva ou piso molhado), o LSD transfere a força para a roda com mais aderência, garantindo acelerações mais eficazes e maior controle dinâmico.',
    shortDescription: 'Sistema que distribui o torque entre as rodas para evitar que uma patine, maximizando a tração em curvas.',
    longDescription: `## Performance e Tração com LSD
    
Em veículos de tração traseira e alta potência, como os modelos **BMW M** e **Mercedes-AMG**, o LSD é fundamental para evitar que a potência do motor seja desperdiçada em fumaça de pneu. Ele permite que o motorista "ponha a potência no chão" mais cedo ao sair de uma curva, resultando em uma condução muito mais precisa e veloz.`,
    faq: [
      { question: 'Qual a diferença entre diferencial comum e LSD?', answer: 'O comum manda a força para a roda mais solta (que patina). O LSD trava essa diferença e manda a força para a roda que realmente tem tração.' }
    ],
    seo: { title: 'Diferencial LSD: Tração e Controle em Curvas | Manual Attra', metaDescription: 'Saiba como o diferencial de deslizamento limitado melhora a performance.' }
  },

  // 17. Fibra de Carbono Forjada (Forged Composites)
  {
    id: 'fibra-carbono-forjada',
    slug: 'fibra-carbono-forjada',
    title: 'Fibra de Carbono Forjada',
    category: 'personalizacao-fabrica',
    displayOrder: 4,
    matchKeywords: ['carbono forjado', 'forged carbon', 'forged composites', 'carbono prensado'],
    relatedVehicleIds: [],
    answerSnippet: 'A Fibra de Carbono Forjada é uma evolução do carbono trançado tradicional. Utiliza uma massa de fibras curtas misturadas com resina e prensadas sob alta pressão. O resultado é um material mais leve, resistente a impactos multidirecionais e com uma estética marmorizada única, popularizada pela Lamborghini.',
    shortDescription: 'Material ultraleve e de alta resistência com padrão visual exclusivo, superior ao carbono trançado em complexidade estrutural.',
    longDescription: `## A Estética do Futuro
    
Diferente da trama regular da fibra de carbono clássica, o carbono forjado parece mármore escuro. Ele permite a criação de peças com geometrias complexas que seriam impossíveis no método tradicional. É o material de escolha para componentes estruturais e aerodinâmicos da **Lamborghini Huracán Performante** e edições limitadas da **McLaren**.`,
    faq: [
      { question: 'Carbono forjado é melhor que o comum?', answer: 'Em termos de resistência a esforços complexos e leveza para peças moldadas, sim. Esteticamente, é uma questão de exclusividade.' }
    ],
    seo: { title: 'Fibra de Carbono Forjada: O Material dos Supercarros | Manual Attra', metaDescription: 'Descubra a tecnologia e a estética por trás do carbono forjado.' }
  },

  // 18. Matching Numbers (Originalidade Histórica)
  {
    id: 'matching-numbers',
    slug: 'matching-numbers',
    title: 'Matching Numbers',
    category: 'procedencia-documentacao',
    displayOrder: 3,
    matchKeywords: ['matching numbers', 'numeros correspondentes', 'motor original', 'cambio original'],
    relatedVehicleIds: [],
    answerSnippet: 'Matching Numbers é o termo que designa um veículo cujos componentes principais (motor, transmissão e chassi) são exatamente os mesmos com os quais ele saiu da linha de montagem. Para colecionadores de modelos clássicos ou edições limitadas, essa paridade numérica é o maior selo de autenticidade e valorização.',
    shortDescription: 'Certificação de que motor, câmbio e chassi são originais de fábrica. Crucial para valorização de colecionáveis.',
    longDescription: `## Por que Matching Numbers importa no mercado Premium?
    
Ao adquirir um Porsche 911 clássico ou uma Ferrari de década passada, a comprovação de *Matching Numbers* pode significar uma diferença de até 50% no preço de revenda. Isso prova que o carro não sofreu substituições severas de componentes e mantém sua integridade histórica preservada.`,
    faq: [
      { question: 'Como verificar se um carro é Matching Numbers?', answer: 'Através de certificados de autenticidade emitidos pela montadora (como o Porsche COA) e conferência física dos números de série.' }
    ],
    seo: { title: 'Matching Numbers: O Selo de Autenticidade Automotiva | Manual Attra', metaDescription: 'Entenda por que a originalidade de componentes eleva o preço de clássicos.' }
  },

  // 19. Sistema de Som Burmester / Bang & Olufsen
  {
    id: 'sistema-som-premium',
    slug: 'sistema-som-premium',
    title: 'Sistemas de Áudio High-End (Burmester / B&O)',
    category: 'personalizacao-fabrica',
    displayOrder: 5,
    matchKeywords: ['burmester', 'bang & olufsen', 'som premium', 'bowers & wilkins', 'meridian', 'som high-end'],
    relatedVehicleIds: [],
    answerSnippet: 'Sistemas de áudio High-End são parcerias entre montadoras e marcas de som audiófilas. Eles utilizam processamento digital de sinal (DSP), amplificadores dedicados de alta potência e tweeters de materiais nobres para entregar uma experiência de "sala de concerto" dentro do veículo, com fidelidade absoluta de frequências.',
    shortDescription: 'Sistemas de som de altíssima fidelidade desenvolvidos por marcas icônicas especificamente para o interior de carros de luxo.',
    longDescription: `## Experiência Sensorial no Cockpit
    
Em um **Porsche** ou **Mercedes-Benz**, o sistema Burmester não se trata apenas de volume, mas de palco sonoro. Já os sistemas **Bang & Olufsen** da Audi são famosos pelos tweeters que emergem do painel ao ligar o carro, unindo design acústico com tecnologia de ponta.`,
    faq: [
      { question: 'Vale a pena investir em som premium na revenda?', answer: 'Sim, em modelos de luxo, a ausência de um sistema de som assinado pode ser um fator de desvalorização ou de maior tempo de pátio.' }
    ],
    seo: { title: 'Som Premium Burmester e Bang & Olufsen: O que saber | Manual Attra', metaDescription: 'A diferença entre o som padrão e os sistemas de áudio high-end automotivos.' }
  },

  // 20. Sistema Start-Stop (e Baterias AGM)
  {
    id: 'sistema-start-stop',
    slug: 'sistema-start-stop',
    title: 'Sistema Start-Stop',
    category: 'performance',
    displayOrder: 8,
    matchKeywords: ['start stop', 'start-stop', 'desligamento automatico', 'bateria agm'],
    relatedVehicleIds: [],
    answerSnippet: 'O Start-Stop é uma tecnologia que desliga o motor automaticamente quando o veículo para (em semáforos ou trânsito) e o religa instantaneamente ao tocar no acelerador ou soltar o freio. O foco é a redução de emissões e consumo urbano, exigindo baterias de tecnologia AGM para suportar os ciclos frequentes de partida.',
    shortDescription: 'Tecnologia de economia de combustível que desliga o motor em paradas curtas.',
    longDescription: `## Eficiência e Manutenção do Start-Stop
    
Muitos proprietários de carros premium optam por desativar o sistema, mas sua presença é obrigatória para atender às normas ambientais globais. É importante notar que veículos com Start-Stop exigem **baterias AGM**, que são mais caras e resistentes, para evitar falhas prematuras no sistema elétrico.`,
    faq: [
      { question: 'O Start-Stop vicia o motor?', answer: 'Não. Os motores modernos são projetados com lubrificação e motores de partida reforçados para aguentar esse ciclo sem danos.' }
    ],
    seo: { title: 'Sistema Start-Stop: Como funciona e Cuidados | Manual Attra', metaDescription: 'Entenda a economia e a exigência de baterias AGM no sistema Start-Stop.' }
  },

  // 21. Matriz de LED (Matrix LED / Laser Light)
  {
    id: 'matriz-led-laser',
    slug: 'matriz-led-laser',
    title: 'Faróis Matrix LED e Laser Light',
    category: 'seguranca-blindagem',
    displayOrder: 2,
    matchKeywords: ['matrix led', 'farol laser', 'laser light', 'multibeam led', 'farol adaptativo'],
    relatedVehicleIds: [],
    answerSnippet: 'Faróis Matrix LED utilizam dezenas de diodos controlados individualmente que "recortam" o feixe de luz para não ofuscar outros motoristas, mantendo a iluminação máxima ao redor deles. Já o Laser Light oferece um alcance de até 600 metros, o dobro dos LEDs convencionais, garantindo visibilidade diurna em condução noturna.',
    shortDescription: 'Tecnologia de iluminação inteligente que adapta o feixe de luz para máxima visibilidade sem cegar outros condutores.',
    longDescription: `## A Revolução da Iluminação Noturna
    
Presente em modelos da **Audi (Matrix)** e **BMW (Laser)**, essa tecnologia transforma a segurança em estradas. O sistema identifica câmeras e faróis de outros carros e apaga apenas os pixels que atingiriam os olhos dos outros motoristas, mantendo todo o resto da estrada sob luz alta.`,
    faq: [
      { question: 'O farol laser fica ligado o tempo todo?', answer: 'Não, ele só ativa em velocidades acima de 60km/h e em condições de escuridão total, complementando o LED.' }
    ],
    seo: { title: 'Faróis Matrix LED e Laser: Segurança Noturna | Manual Attra', metaDescription: 'Como funcionam os faróis mais inteligentes do mundo.' }
  },

// 22. Recuperação de Energia (KERS / Frenagem Regenerativa)
  {
    id: 'frenagem-regenerativa',
    slug: 'frenagem-regenerativa',
    title: 'Frenagem Regenerativa (KERS)',
    category: 'performance',
    displayOrder: 9,
    matchKeywords: ['frenagem regenerativa', 'kers', 'recuperação de energia', 'energy recovery'],
    relatedVehicleIds: [],
    answerSnippet: 'A frenagem regenerativa converte a energia cinética perdida durante a desaceleração em energia elétrica, armazenando-a na bateria. Em veículos híbridos e elétricos de alta performance, como o Porsche Taycan, esse sistema atua como um freio motor eletrônico, aumentando a autonomia e reduzindo o desgaste dos freios físicos.',
    shortDescription: 'Sistema que transforma desaceleração em carga para a bateria, aumentando a eficiência e autonomia.',
    longDescription: `## Tecnologia das Pistas para as Ruas
    
Originalmente popularizado na Fórmula 1 como KERS, o sistema de recuperação de energia é a espinha dorsal da eficiência nos modelos eletrificados. Em condução esportiva, ele permite que o motorista recupere carga rapidamente entre frenagens bruscas, garantindo que o motor elétrico sempre tenha potência máxima disponível para a próxima aceleração.`,
    faq: [
      { question: 'O carro freia sozinho ao soltar o acelerador?', answer: 'Sim, em muitos elétricos o nível de regeneração pode ser ajustado, permitindo a condução com apenas um pedal (One-Pedal Drive).' }
    ],
    seo: { title: 'Frenagem Regenerativa: Como Funciona em Elétricos | Manual Attra', metaDescription: 'Entenda a recuperação de energia e como ela aumenta a autonomia do seu veículo.' }
  },

  // 23. Couro Nappa
  {
    id: 'couro-nappa',
    slug: 'couro-nappa',
    title: 'Couro Nappa',
    category: 'estetica-detailing',
    displayOrder: 4,
    matchKeywords: ['couro nappa', 'nappa leather', 'couro integral', 'pele de napa'],
    relatedVehicleIds: [],
    answerSnippet: 'O Couro Nappa é um tipo de pele de alta qualidade, caracterizado por ser integral (full-grain), extremamente macio e não ter a textura natural alterada por lixamento. É tingido com pigmentos solúveis em água, resultando em um material respirável, luxuoso ao toque e que desenvolve uma pátina nobre com o passar dos anos.',
    shortDescription: 'Pele premium de toque ultra-macio e alta respirabilidade, padrão em interiores de alto luxo.',
    longDescription: `## O Ápice do Conforto Tátil
    
Diferente dos couros corrigidos ou sintéticos, o Nappa preserva as características originais da pele. É o padrão em modelos **BMW Individual** e **Mercedes-Benz Designo**. Exige hidratação periódica com produtos específicos para manter sua elasticidade e evitar o ressecamento prematuro causado pelo sol.`,
    faq: [
      { question: 'Como limpar couro Nappa?', answer: 'Apenas com panos levemente úmidos e sabão neutro específico. Evite produtos químicos agressivos que podem remover o tingimento natural.' }
    ],
    seo: { title: 'O que é Couro Nappa: Luxo e Durabilidade | Manual Attra', metaDescription: 'Descubra por que o couro Nappa é preferido pelas montadoras de luxo.' }
  },

  // 24. Torque Vectoring (Vetorização de Torque)
  {
    id: 'torque-vectoring',
    slug: 'torque-vectoring',
    title: 'Torque Vectoring (Vetorização de Torque)',
    category: 'performance',
    displayOrder: 10,
    matchKeywords: ['torque vectoring', 'vetorização de torque', 'ptv', 'porsche torque vectoring'],
    relatedVehicleIds: [],
    answerSnippet: 'Torque Vectoring é uma tecnologia que distribui o torque individualmente para cada roda, dependendo da necessidade de curva. Ao frear levemente a roda interna e mandar mais força para a externa, o sistema ajuda a "empurrar" o carro para dentro da curva, eliminando o subesterço (saída de frente) e aumentando a velocidade de contorno.',
    shortDescription: 'Sistema inteligente que distribui a força do motor entre as rodas para melhorar a agilidade em curvas.',
    longDescription: `## Curvas com Precisão de Trilho
    
Sistemas como o **PTV Plus (Porsche)** transformam a dinâmica do veículo. Em vez de o carro lutar contra a física, a vetorização de torque usa a força do motor para ajudar no esterço. Isso é perceptível tanto em SUVs pesados (onde ajuda a disfarçar o peso) quanto em supercarros leves, onde torna a direção extremamente afiada.`,
    faq: [
      { question: 'É um sistema de segurança ou performance?', answer: 'Ambos. Melhora a segurança em manobras evasivas e a performance em trackdays.' }
    ],
    seo: { title: 'Torque Vectoring: Agilidade em Curvas | Manual Attra', metaDescription: 'Entenda como a vetorização de torque melhora a dinâmica do seu carro.' }
  },

  // 25. Soft Close (Fechamento Suave de Portas)
  {
    id: 'soft-close',
    slug: 'soft-close',
    title: 'Soft Close (Fechamento Suave)',
    category: 'personalizacao-fabrica',
    displayOrder: 6,
    matchKeywords: ['soft close', 'fechamento suave', 'sucção de portas', 'portas com fechamento automatico'],
    relatedVehicleIds: [],
    answerSnippet: 'O Soft Close é um sistema de sensores e motores elétricos que finaliza o fechamento das portas automaticamente. Quando a porta encosta no batente, um mecanismo de sucção a puxa suavemente até o travamento completo, eliminando a necessidade de batê-las e proporcionando uma experiência de luxo silenciosa e refinada.',
    shortDescription: 'Mecanismo que puxa e trava a porta suavemente quando ela é apenas encostada.',
    longDescription: `## O Silêncio do Luxo
    
O Soft Close é um opcional icônico em modelos como o **BMW Série 7**, **Audi A8** e **Mercedes Classe S**. Além do conforto sonoro, ele preserva os mecanismos internos das portas e guarnições ao evitar impactos desnecessários, sendo um detalhe que denota uma especificação de alto nível do veículo.`,
    faq: [
      { question: 'Funciona com o porta-malas?', answer: 'Sim, muitos veículos premium possuem o fechamento suave também no porta-malas (Power Tailgate com Soft Close).' }
    ],
    seo: { title: 'Soft Close: O Conforto das Portas por Sucção | Manual Attra', metaDescription: 'Entenda como funciona o sistema de fechamento suave de portas.' }
  },

  // 26. Arquitetura de 800 Volts
  {
    id: 'arquitetura-800v',
    slug: 'arquitetura-800v',
    title: 'Arquitetura Elétrica de 800V',
    category: 'performance',
    displayOrder: 11,
    matchKeywords: ['800v', 'arquitetura 800 volts', 'carregamento ultra rapido', 'carregamento taycan'],
    relatedVehicleIds: [],
    answerSnippet: 'A arquitetura de 800V é o novo padrão de voltagem para sistemas de propulsão elétrica de alto desempenho. Ao dobrar a voltagem comum de 400V, o sistema permite carregamentos ultra-rápidos (até 270kW), cabos internos mais leves e uma gestão térmica superior, resultando em performance constante mesmo sob uso severo.',
    shortDescription: 'Sistema elétrico de alta voltagem que permite carregamento ultra-rápido e maior eficiência térmica.',
    longDescription: `## O Fim da Ansiedade de Carregamento
    
Pioneira no **Porsche Taycan** e no **Audi e-tron GT**, a arquitetura de 800V permite recuperar de 5% a 80% da bateria em cerca de 22 minutos (em carregadores compatíveis). Além da velocidade de carga, a voltagem maior reduz a produção de calor, permitindo que o carro mantenha acelerações brutais repetidamente sem entrar em modo de proteção.`,
    faq: [
      { question: 'Posso carregar em carregadores comuns?', answer: 'Sim, o sistema é retrocompatível, mas a velocidade máxima de carga só é atingida em estações ultra-rápidas de Corrente Contínua (DC).' }
    ],
    seo: { title: 'Arquitetura 800V: O Futuro dos Elétricos | Manual Attra', metaDescription: 'Saiba por que a voltagem de 800V é um diferencial nos elétricos premium.' }
  },

  // 27. Night Vision (Visão Noturna)
  {
    id: 'night-vision',
    slug: 'night-vision',
    title: 'Night Vision (Assistente de Visão Noturna)',
    category: 'seguranca-blindagem',
    displayOrder: 3,
    matchKeywords: ['night vision', 'visão noturna', 'camera termica', 'assistente noturno'],
    relatedVehicleIds: [],
    answerSnippet: 'O Night Vision utiliza uma câmera infravermelha (térmica) montada na dianteira para detectar pedestres e animais de grande porte em condições de escuridão total. O sistema projeta uma imagem térmica no painel ou Head-Up Display, emitindo alertas visuais e sonoros muito antes de o obstáculo ser visível pelos faróis.',
    shortDescription: 'Câmera térmica que detecta seres vivos na pista em total escuridão, antecipando perigos.',
    longDescription: `## Segurança Além do Alcance dos Olhos
    
Em rodovias sem iluminação, o alcance do Night Vision supera em até três vezes o alcance dos faróis altos. Em modelos como o **Audi Q8** ou **Porsche Cayenne**, o sistema consegue até piscar o farol individualmente para alertar um pedestre na beira da pista (se equipado com faróis Matrix).`,
    faq: [
      { question: 'Funciona com neblina?', answer: 'Sim, a tecnologia térmica atravessa a neblina e chuva intensa muito melhor do que a visão humana ou câmeras convencionais.' }
    ],
    seo: { title: 'Night Vision Automotivo: Segurança Térmica | Manual Attra', metaDescription: 'Conheça o sistema de visão noturna infravermelha dos carros de luxo.' }
  },

  // 28. Cárter Seco (Dry Sump)
  {
    id: 'carter-seco',
    slug: 'carter-seco',
    title: 'Cárter Seco (Dry Sump)',
    category: 'performance',
    displayOrder: 12,
    matchKeywords: ['carter seco', 'dry sump', 'lubrificação esportiva'],
    relatedVehicleIds: [],
    answerSnippet: 'O sistema de Cárter Seco utiliza um reservatório externo para o óleo do motor, em vez de um cárter convencional abaixo do bloco. Isso garante lubrificação constante sob altas forças G (curvas extremas) e permite montar o motor em uma posição mais baixa, reduzindo o centro de gravidade do veículo.',
    shortDescription: 'Sistema de lubrificação de competição que evita a falta de óleo em curvas e permite um centro de gravidade mais baixo.',
    longDescription: `## Engenharia de Supercarros
    
Em um supercarro como a **Ferrari 488** ou o **Porsche 911 GT3**, o óleo não fica "sacudindo" em uma bandeja sob o motor. Ele é bombeado para um tanque separado. Isso impede que a força centrífuga em curvas de alta velocidade desloque o óleo e deixe o motor sem lubrificação, um risco real em motores de alta performance sem essa tecnologia.`,
    faq: [
      { question: 'Por que o cárter seco melhora a estabilidade?', answer: 'Ao remover a bandeja de óleo debaixo do motor, o motor pode ser instalado alguns centímetros mais próximo do chão, baixando o centro de massa do carro.' }
    ],
    seo: { title: 'Cárter Seco: Lubrificação em Alta Performance | Manual Attra', metaDescription: 'Saiba por que o cárter seco é essencial em carros que frequentam as pistas.' }
  },

  // 29. Overboost
  {
    id: 'overboost',
    slug: 'overboost',
    title: 'Overboost (Pico de Pressão Temporário)',
    category: 'performance',
    displayOrder: 13,
    matchKeywords: ['overboost', 'pressão de turbo extra', 'pico de torque'],
    relatedVehicleIds: [],
    answerSnippet: 'O Overboost é uma função eletrônica que permite ao turbocompressor operar acima de sua pressão nominal por um curto período (geralmente 10 a 20 segundos). O sistema entrega um ganho imediato de torque e potência para situações específicas, como ultrapassagens ou saídas de curva em trackdays.',
    shortDescription: 'Aumento temporário na pressão do turbo para ganhos rápidos de potência e torque.',
    longDescription: `## Potência Extra sob Demanda
    
Presente em modelos como o **Porsche 911 Turbo** e a linha **BMW M**, o Overboost é acionado automaticamente em aceleração plena. Ele extrai o máximo do motor sem comprometer a durabilidade a longo prazo, já que o pico de pressão é controlado pela ECU (Central Eletrônica) para evitar superaquecimento.`,
    faq: [
      { question: 'O Overboost estraga o motor?', answer: 'Não, ele é mapeado de fábrica para ser usado com segurança em intervalos curtos.' }
    ],
    seo: { title: 'Overboost: O Que é e Como Funciona | Manual Attra', metaDescription: 'Entenda o ganho de potência temporário nos motores turbo de luxo.' }
  },

  // 30. Descontaminação Ferrosa
  {
    id: 'descontaminacao-ferrosa',
    slug: 'descontaminacao-ferrosa',
    title: 'Descontaminação Ferrosa',
    category: 'estetica-detailing',
    displayOrder: 5,
    matchKeywords: ['descontaminação ferrosa', 'limpeza química pintura', 'particulas de ferro pintura'],
    relatedVehicleIds: [],
    answerSnippet: 'A descontaminação ferrosa é o processo químico de remoção de partículas metálicas microscópicas (provenientes de pastilhas de freio e poluição industrial) presas no verniz do carro. Se não removidas, essas partículas oxidam, causando pontos de ferrugem invisíveis e deixando a pintura áspera ao toque.',
    shortDescription: 'Limpeza química profunda que remove resíduos metálicos da pintura, essencial antes de vitrificações.',
    longDescription: `## Preparação Premium
    
Na Attra, a descontaminação ferrosa é parte do processo de preparação de estoque. Utilizamos produtos que reagem com o ferro, mudando de cor para indicar a presença da contaminação. É um passo fundamental para garantir que qualquer proteção (como PPF ou Cera de Carnaúba) tenha 100% de aderência à superfície.`,
    faq: [
      { question: 'Com que frequência deve ser feita?', answer: 'Idealmente a cada 6 meses ou antes de qualquer aplicação de selantes e vitrificadores.' }
    ],
    seo: { title: 'Descontaminação Ferrosa: Pintura Perfeita | Manual Attra', metaDescription: 'A importância de remover partículas metálicas para preservar o brilho.' }
  },

  // 31. Diferencial de Deslizamento Limitado (LSD)
  {
    id: 'lsd-diferencial',
    slug: 'lsd-diferencial',
    title: 'LSD (Limited Slip Differential)',
    category: 'performance',
    displayOrder: 14,
    matchKeywords: ['lsd', 'diferencial blocante', 'limited slip', 'tração diferencial'],
    relatedVehicleIds: [],
    answerSnippet: 'O Diferencial de Deslizamento Limitado (LSD) evita que a potência do motor seja "desperdiçada" em uma roda que perdeu tração. Ele redistribui o torque entre as rodas traseiras, garantindo que o carro tenha aderência máxima ao acelerar na saída de curvas ou em pisos escorregadios.',
    shortDescription: 'Sistema que impede que uma roda patine sozinha, transferindo força para a roda com mais aderência.',
    longDescription: `## Controle em Saídas de Curva
    
Em esportivos de tração traseira como o **Chevrolet Corvette** ou **BMW M3**, o LSD é o que permite derrapagens controladas (drifts) e acelerações lineares. Sem ele, a roda interna à curva giraria livremente, perdendo velocidade. É um componente vital para quem busca uma experiência de direção purista e veloz.`,
    faq: [
      { question: 'Diferencial blocante é o mesmo que LSD?', answer: 'O LSD é um tipo de diferencial blocante que atua de forma progressiva e suave, ideal para uso em asfalto.' }
    ],
    seo: { title: 'Diferencial LSD: Performance e Tração | Manual Attra', metaDescription: 'Entenda como o diferencial limitado melhora a agilidade do esportivo.' }
  },

  // 32. Nota Fiscal de Origem (NFO)
  {
    id: 'nota-fiscal-origem',
    slug: 'nota-fiscal-origem',
    title: 'Nota Fiscal de Origem (A Importância na Recompra)',
    category: 'procedencia-documentacao',
    displayOrder: 4,
    matchKeywords: ['nota fiscal de origem', 'nfo', 'nota fiscal fabrica', 'procedência nota fiscal'],
    relatedVehicleIds: [],
    answerSnippet: 'A Nota Fiscal de Origem é o documento que comprova o faturamento inicial do veículo pela concessionária autorizada ou importadora oficial. No mercado premium, a posse desse documento (mesmo em carros seminovos) é um selo de procedência que facilita a rastreabilidade de donos anteriores e valoriza o ativo na hora da revenda.',
    shortDescription: 'Documento original de venda de fábrica que atesta a procedência e histórico inicial do veículo.',
    longDescription: `## Valorização Documental
    
Ter a nota fiscal de quando o carro era 0km ajuda a confirmar pacotes de opcionais que foram pagos na época e evita dúvidas sobre a origem do veículo (se foi importação oficial ou direta). Na Attra, priorizamos veículos que possuem o histórico documental completo, incluindo as notas de serviços realizados.`,
    faq: [
      { question: 'É obrigatório ter a nota fiscal original?', answer: 'Não é obrigatório para a transferência, mas é um diferencial de valorização enorme em modelos de coleção e luxo.' }
    ],
    seo: { title: 'Nota Fiscal de Origem: Procedência Premium | Manual Attra', metaDescription: 'Por que a nota fiscal original valoriza seu carro seminovo.' }
  },

  // 33. Pneus Homologados (Star Marked / N-Rated)
  {
    id: 'pneus-homologados',
    slug: 'pneus-homologados',
    title: 'Pneus Homologados (N-Rated / Star Mark)',
    category: 'performance',
    displayOrder: 15,
    matchKeywords: ['pneu homologado', 'pneu estrela bmw', 'pneu n0 porsche', 'pneu n1 porsche', 'pneus marcados'],
    relatedVehicleIds: [],
    answerSnippet: 'Pneus homologados são desenvolvidos em parceria entre a montadora e a fabricante de pneus (como Michelin ou Pirelli) especificamente para um modelo. Eles possuem marcações como "*" para BMW ou "N0, N1, N2" para Porsche, indicando que a estrutura e o composto do pneu foram otimizados para o chassi daquele carro.',
    shortDescription: 'Pneus desenvolvidos sob medida para marcas específicas, garantindo o comportamento dinâmico ideal do projeto original.',
    longDescription: `## Mais que um Pneu Comum
    
Um pneu Michelin Pilot Sport sem a marcação "N" pode parecer igual a um com a marcação, mas a estrutura interna (cintas de aço e dureza da borracha) é diferente. Usar pneus homologados garante que o sistema de tração, frenagem e suspensão do seu **Porsche** ou **BMW** funcione exatamente como os engenheiros da fábrica planejaram.`,
    faq: [
      { question: 'Posso usar pneu sem a marcação?', answer: 'Sim, mas o comportamento do carro no limite de aderência pode mudar ligeiramente, e em alguns países, pode afetar a garantia de sistemas de tração integral.' }
    ],
    seo: { title: 'Pneus Homologados Porsche e BMW: Por que Usar | Manual Attra', metaDescription: 'A diferença entre pneus comuns e pneus desenvolvidos para marcas de luxo.' }
  },
  // 34. Delaminação de Vidros (Blindados)
  {
    id: 'delaminacao-vidros',
    slug: 'delaminacao-vidros',
    title: 'Delaminação de Vidros',
    category: 'seguranca-blindagem',
    displayOrder: 4,
    matchKeywords: ['delaminação', 'vidro delaminado', 'bolhas no vidro blindado', 'manutenção blindagem'],
    relatedVehicleIds: [],
    answerSnippet: 'A delaminação é o descolamento das camadas de policarbonato e vidro que compõem o conjunto balístico de um blindado, manifestando-se como bolhas ou manchas esbranquiçadas. Na Attra, avaliamos rigorosamente a integridade dos vidros, pois a delaminação severa compromete a visibilidade e a estética do veículo.',
    shortDescription: 'Separação das camadas de vidro e policarbonato em blindados, gerando bolhas que afetam estética e segurança.',
    longDescription: `## O que causa a delaminação?
    
A exposição excessiva ao calor e variações de pressão são as principais causas. Em veículos premium, a delaminação desvaloriza o ativo. Existem processos de **autoclavagem** para restaurar vidros levemente delaminados, mas em casos avançados, a substituição é o caminho para manter o padrão de segurança e o valor de revenda do automóvel.`,
    faq: [
      { question: 'Vidro delaminado perde a proteção balística?', answer: 'A proteção contra disparos geralmente permanece, mas a resistência mecânica e, principalmente, a visibilidade do motorista ficam seriamente comprometidas.' }
    ],
    seo: { title: 'Delaminação em Blindados: O que é e como resolver | Manual Attra', metaDescription: 'Entenda por que surgem bolhas nos vidros blindados e como isso afeta o valor do carro.' }
  },

  // 35. Apple CarPlay e Android Auto Wireless
  {
    id: 'carplay-android-auto-wireless',
    slug: 'carplay-android-auto-wireless',
    title: 'Conectividade Wireless (CarPlay / Android Auto)',
    category: 'personalizacao-fabrica',
    displayOrder: 7,
    matchKeywords: ['carplay sem fio', 'android auto wireless', 'espelhamento sem fio', 'conectividade smartphone'],
    relatedVehicleIds: [],
    answerSnippet: 'A conectividade wireless permite o espelhamento de aplicativos do smartphone (Waze, Spotify, WhatsApp) diretamente na central multimídia via Wi-Fi de 5GHz, sem a necessidade de cabos USB. Em veículos modernos, essa tecnologia se integra ao carregador por indução, eliminando fios no console central e elevando o minimalismo do cockpit.',
    shortDescription: 'Espelhamento de smartphone na central multimídia sem necessidade de cabos, via conexão Wi-Fi dedicada.',
    longDescription: `## Conveniência e Estética
    
A transição para o sistema sem fio resolve o problema de desgaste de cabos e portas USB, além de permitir que o sistema se conecte assim que o motorista entra no veículo. Em marcas como **BMW** e **Audi**, a integração é tão profunda que as instruções do GPS do smartphone podem ser projetadas no **Head-Up Display** do carro.`,
    faq: [
      { question: 'A conexão wireless consome muita bateria?', answer: 'Sim, por usar Wi-Fi e GPS simultaneamente, recomenda-se usar o carregador por indução (Wireless Charging) durante viagens longas.' }
    ],
    seo: { title: 'CarPlay e Android Auto Sem Fio: Conectividade Premium | Manual Attra', metaDescription: 'Saiba como funciona o espelhamento wireless nos veículos de luxo.' }
  },

  // 36. Câmbio Borboleta (Paddle Shifters)
  {
    id: 'paddle-shifters',
    slug: 'paddle-shifters',
    title: 'Paddle Shifters (Câmbio Borboleta)',
    category: 'performance',
    displayOrder: 16,
    matchKeywords: ['paddle shift', 'cambio borboleta', 'troca no volante', 'borboletas de cambio'],
    relatedVehicleIds: [],
    answerSnippet: 'Paddle Shifters são alavancas posicionadas atrás do volante que permitem a troca manual de marchas sem retirar as mãos da direção. Essenciais em transmissões de dupla embreagem (PDK, DSG), oferecem ao motorista o controle total da faixa de rotação do motor, simulando a experiência de um cockpit de Fórmula 1.',
    shortDescription: 'Alavancas no volante para trocas de marcha manuais, focadas em controle e esportividade.',
    longDescription: `## Controle Dinâmico nas Mãos
    
Originalmente desenvolvidos para as pistas, os Paddle Shifters permitem reduções rápidas para ultrapassagens ou para usar o freio motor em descidas de serra. Em supercarros como os da **Ferrari** e **Lamborghini**, as borboletas são fixas na coluna de direção e feitas de materiais nobres como fibra de carbono ou magnésio.`,
    faq: [
      { question: 'Posso trocar marchas no automático a qualquer momento?', answer: 'Sim, na maioria dos sistemas, ao tocar na borboleta o câmbio entra em modo manual temporário ou permanente, dependendo da configuração do drive mode.' }
    ],
    seo: { title: 'Paddle Shifters: Trocas de Marcha no Volante | Manual Attra', metaDescription: 'Entenda a utilidade e a performance das borboletas de câmbio.' }
  },

  // 37. Revisão por Tempo vs. Quilometragem
  {
    id: 'revisao-tempo-km',
    slug: 'revisao-tempo-km',
    title: 'Revisão por Tempo vs. Quilometragem',
    category: 'procedencia-documentacao',
    displayOrder: 5,
    matchKeywords: ['revisão anual', 'revisão por tempo', 'manutenção preventiva porsche', 'plano de manutenção'],
    relatedVehicleIds: [],
    answerSnippet: 'No mercado premium, a manutenção é ditada pelo que ocorrer primeiro: quilometragem ou tempo (geralmente 12 meses). Mesmo que um supercarro rode pouco, fluídos como óleo e fluido de freio oxidam e perdem propriedades. Um histórico de revisões anuais carimbado, mesmo com baixa rodagem, é o maior comprovante de zelo e procedência.',
    shortDescription: 'Manutenção baseada no calendário ou uso. Vital para preservar a garantia e o valor de revenda em carros de baixa rodagem.',
    longDescription: `## A Importância do Histórico Carimbado
    
Um Porsche com 5.000km, mas que ficou 3 anos sem trocar o óleo, pode apresentar problemas internos por borra ou acidez. Na Attra, auditamos o manual de todos os veículos para garantir que o ciclo de tempo foi respeitado, garantindo que o motor opere com lubrificação sempre nova, independente do uso.`,
    faq: [
      { question: 'Se eu não rodar, preciso revisar?', answer: 'Sim. Itens como óleo do motor, filtros e correias possuem validade química e estrutural que independe da rodagem.' }
    ],
    seo: { title: 'Revisão por Tempo: Por que é vital para o seu carro? | Manual Attra', metaDescription: 'Entenda por que carros de luxo precisam de revisão anual mesmo sem rodar.' }
  },

  // 38. Suspensão Magnética (MagneRide)
  {
    id: 'suspensao-magnetica',
    slug: 'suspensao-magnetica',
    title: 'Suspensão Magnética (MagneRide)',
    category: 'performance',
    displayOrder: 17,
    matchKeywords: ['magneride', 'magnetic ride', 'suspensao magnetica', 'fluido magnetoreologico'],
    relatedVehicleIds: [],
    answerSnippet: 'A suspensão magnética utiliza um fluido magnetorreológico dentro dos amortecedores, que contém partículas metálicas minúsculas. Ao aplicar um campo magnético, o fluido muda de viscosidade instantaneamente, alterando a rigidez da suspensão milhares de vezes por segundo para se adaptar a imperfeições do solo ou curvas fechadas.',
    shortDescription: 'Tecnologia que usa eletroímãs para ajustar a dureza da suspensão em milissegundos, oferecendo o melhor equilíbrio entre conforto e estabilidade.',
    longDescription: `## Resposta Ultrarrápida
    
Diferente da suspensão pneumática (a ar), a magnética foca em velocidade de resposta. É a tecnologia de escolha para o **Chevrolet Corvette**, **Audi R8** e vários modelos da **Ferrari**. O sistema consegue ler a estrada e endurecer a suspensão antes mesmo de o carro inclinar em uma curva, mantendo a carroceria sempre plana.`,
    faq: [
      { question: 'É melhor que suspensão a ar?', answer: 'Para performance e controle de carroceria em alta velocidade, sim. Para conforto absoluto e ajuste de altura, a suspensão a ar (Air Suspension) leva vantagem.' }
    ],
    seo: { title: 'Suspensão Magnética MagneRide: Como funciona | Manual Attra', metaDescription: 'Conheça a tecnologia de amortecimento mais rápida do mundo.' }
  },

  // 39. Correção de Pintura (Polimento Técnico)
  {
    id: 'correcao-pintura',
    slug: 'correcao-pintura',
    title: 'Correção de Pintura (Polimento Técnico)',
    category: 'estetica-detailing',
    displayOrder: 6,
    matchKeywords: ['correção de pintura', 'polimento técnico', 'remover hologramas', 'estética automotiva'],
    relatedVehicleIds: [],
    answerSnippet: 'A correção de pintura é um processo minucioso de nivelamento do verniz para remover defeitos como riscos superficiais, "teias de aranha" (swirl marks) e hologramas causados por lavagens incorretas. Diferente de um polimento comum, ele foca em preservar a espessura do verniz enquanto devolve a máxima refletividade e profundidade à cor.',
    shortDescription: 'Processo avançado de estética para remover imperfeições do verniz e restaurar o brilho espelhado original.',
    longDescription: `## O Padrão de Entrega Attra
    
Todo veículo que entra em nosso estoque passa por uma avaliação de pintura. A correção é feita com máquinas rotocêntricas e compostos importados, garantindo que o carro seja entregue com um acabamento superior ao de muitos carros 0km. É o passo essencial antes da aplicação de vitrificadores ou selantes.`,
    faq: [
      { question: 'Remove qualquer risco?', answer: 'Remove riscos que estão no verniz. Riscos que atingiram a base da tinta ou o metal exigem repintura.' }
    ],
    seo: { title: 'Correção de Pintura vs Polimento Comum | Manual Attra', metaDescription: 'Saiba como restaurar o brilho de showroom do seu veículo premium.' }
  },
  // 40. Piloto Automático Adaptativo (ACC - Adaptive Cruise Control)
  {
    id: 'acc-adaptive-cruise-control',
    slug: 'acc-adaptive-cruise-control',
    title: 'Piloto Automático Adaptativo (ACC)',
    category: 'seguranca-blindagem',
    displayOrder: 5,
    matchKeywords: ['acc', 'cruise control adaptativo', 'piloto automatico adaptativo', 'distronic', 'radar frontal'],
    relatedVehicleIds: [],
    answerSnippet: 'O ACC é uma evolução do piloto automático que utiliza radares e câmeras para manter uma distância segura do veículo à frente. Se o tráfego desacelera, o carro freia automaticamente; se o caminho libera, ele retoma a velocidade programada, proporcionando conforto e segurança em viagens longas.',
    shortDescription: 'Sistema inteligente que ajusta a velocidade automaticamente para manter distância do carro à frente.',
    longDescription: `## Condução Semi-Autônoma
    
Sistemas como o **Porsche InnoDrive** ou o **Mercedes-Benz Distronic Plus** não apenas mantêm a velocidade, mas interpretam curvas e limites de velocidade via GPS. Em congestionamentos, a função *Stop & Go* permite que o carro pare totalmente e retome o movimento sem intervenção do motorista, reduzindo drasticamente o cansaço urbano.`,
    faq: [
      { question: 'O ACC freia sozinho até parar?', answer: 'Sim, se possuir a função Stop & Go, o veículo pode frear totalmente e retomar a marcha de forma autônoma.' }
    ],
    seo: { title: 'ACC: Como funciona o Piloto Automático Adaptativo | Manual Attra', metaDescription: 'Entenda a tecnologia de radares que monitora o tráfego à frente.' }
  },

  // 41. Lane Keep Assist (Assistente de Permanência em Faixa)
  {
    id: 'lane-keep-assist',
    slug: 'lane-keep-assist',
    title: 'Lane Keep Assist (Assistente de Faixa)',
    category: 'seguranca-blindagem',
    displayOrder: 6,
    matchKeywords: ['lane assist', 'assistente de faixa', 'manutenção de faixa', 'lane departure warning'],
    relatedVehicleIds: [],
    answerSnippet: 'O Lane Keep Assist utiliza câmeras para monitorar as faixas da estrada. Caso o motorista saia da trajetória sem acionar a seta, o sistema aplica pequenas correções no volante para manter o veículo centralizado. É uma barreira crítica de segurança contra distrações e fadiga em rodovias.',
    shortDescription: 'Tecnologia que monitora as faixas da pista e corrige a direção para evitar saídas involuntárias.',
    longDescription: `## Inteligência Preventiva
    
Nos modelos premium da **Audi** e **Volvo**, o sistema é progressivo: primeiro ele vibra o volante (alerta) e, se não houver reação, assume brevemente o controle direcional. É importante notar que o sistema exige que o motorista mantenha as mãos no volante para garantir a supervisão humana constante.`,
    faq: [
      { question: 'O sistema funciona em qualquer estrada?', answer: 'Ele depende de faixas bem pintadas e visíveis. Em estradas com sinalização precária, o sistema pode ser desativado automaticamente.' }
    ],
    seo: { title: 'Assistente de Faixa: Segurança Ativa em Rodovias | Manual Attra', metaDescription: 'Saiba como o Lane Keep Assist evita acidentes por distração.' }
  },

  // 42. Injeção Direta de Combustível (GDI)
  {
    id: 'injecao-direta',
    slug: 'injecao-direta',
    title: 'Injeção Direta de Combustível',
    category: 'performance',
    displayOrder: 18,
    matchKeywords: ['injecao direta', 'gdi', 'fsi', 'dfi', 'direct injection'],
    relatedVehicleIds: [],
    answerSnippet: 'Na injeção direta, o combustível é pulverizado sob altíssima pressão diretamente dentro da câmara de combustão, e não no coletor de admissão. Isso permite uma queima mais eficiente, maior taxa de compressão e ganho imediato de potência e economia, sendo o padrão em motores turbo modernos.',
    shortDescription: 'Tecnologia que injeta combustível dentro do cilindro para máxima eficiência e potência.',
    longDescription: `## Performance com Eficiência
    
A injeção direta permite o "resfriamento" da câmara de combustão, o que possibilita que motores pequenos (downsizing) entreguem torque de motores grandes. Marcas como **Porsche (DFI)** e **Audi (FSI)** utilizam essa tecnologia para extrair o máximo de cada gota de combustível, resultando em respostas de acelerador muito mais rápidas.`,
    faq: [
      { question: 'Injeção direta exige gasolina especial?', answer: 'Embora funcionem com gasolina comum, o uso de gasolinas de alta octanagem (Podium/Octapro) é recomendado para evitar a formação de carvão nas válvulas.' }
    ],
    seo: { title: 'Injeção Direta: Potência e Economia | Manual Attra', metaDescription: 'Entenda a tecnologia por trás dos motores TSI, FSI e DFI.' }
  },

  // 43. Teto Solar Panorâmico com Controle de Opacidade
  {
    id: 'teto-panoramico-opacidade',
    slug: 'teto-panoramico-opacidade',
    title: 'Teto Panorâmico Eletrocromático',
    category: 'personalizacao-fabrica',
    displayOrder: 8,
    matchKeywords: ['teto panoramico', 'teto eletrocromatico', 'magic sky control', 'teto solar inteligente'],
    relatedVehicleIds: [],
    answerSnippet: 'O teto panorâmico eletrocromático utiliza uma camada de cristais líquidos que mudam de orientação sob uma corrente elétrica. Ao toque de um botão, o vidro passa de transparente para opaco (leitoso), bloqueando o calor e a luminosidade sem a necessidade de uma cortina física de tecido.',
    shortDescription: 'Vidro inteligente que escurece eletronicamente para controlar luz e calor no interior.',
    longDescription: `## Tecnologia Magic Sky
    
Popularizado pelo **Mercedes-Benz Magic Sky Control** e presente no **Porsche Taycan**, essa tecnologia aumenta o espaço interno (pois dispensa o mecanismo da cortina) e mantém o isolamento térmico impecável, filtrando mais de 99% dos raios UV mesmo no modo transparente.`,
    faq: [
      { question: 'O teto escurece sozinho quando desligo o carro?', answer: 'Sim, na maioria dos modelos o vidro assume o modo opaco automaticamente ao estacionar para proteger o interior do sol.' }
    ],
    seo: { title: 'Teto Eletrocromatico: Conforto Térmico e Luxo | Manual Attra', metaDescription: 'Saiba como funciona o teto solar que escurece com um botão.' }
  },

  // 44. Cilindros Desativáveis (Cylinder on Demand)
  {
    id: 'desativacao-cilindros',
    slug: 'desativacao-cilindros',
    title: 'Cilindros Desativáveis (COD)',
    category: 'performance',
    displayOrder: 19,
    matchKeywords: ['desativação de cilindros', 'cylinder on demand', 'cod', 'act', 'v8 para v4'],
    relatedVehicleIds: [],
    answerSnippet: 'A Desativação de Cilindros é uma tecnologia que "desliga" metade dos cilindros do motor em situações de baixa carga (como velocidade constante em estradas planas). O sistema fecha as válvulas de admissão e escape de cilindros específicos, transformando um motor V8 em um V4 temporário para economizar combustível.',
    shortDescription: 'Sistema que desliga parte do motor em velocidade de cruzeiro para reduzir o consumo.',
    longDescription: `## Eficiência Inteligente
    
Em um **Audi RS6** ou **Bentley Bentayga**, o motorista nem percebe a transição. O sistema reativa os cilindros em milissegundos assim que o acelerador é pressionado com mais força. Isso permite que carros de 600cv tenham médias de consumo surpreendentes em viagens tranquilas.`,
    faq: [
      { question: 'Sinto o carro vibrar quando desliga os cilindros?', answer: 'Não, os suportes de motor ativos e o volante de inércia compensam qualquer vibração para manter o refinamento total.' }
    ],
    seo: { title: 'Cylinder on Demand: Economia em Motores V8 | Manual Attra', metaDescription: 'Entenda como grandes motores conseguem ser econômicos na estrada.' }
  },

  // 45. Pneus Run Flat
  {
    id: 'pneus-run-flat',
    slug: 'pneus-run-flat',
    title: 'Pneus Run Flat',
    category: 'seguranca-blindagem',
    displayOrder: 7,
    matchKeywords: ['run flat', 'pneu blindado', 'pneu que roda furado', 'rsc', 'pneu reforçado'],
    relatedVehicleIds: [],
    answerSnippet: 'Pneus Run Flat possuem flancos reforçados que suportam o peso do veículo mesmo após uma perda total de pressão. Eles permitem que o motorista continue dirigindo por até 80 km a uma velocidade de 80 km/h, permitindo chegar a um local seguro sem a necessidade de parar no acostamento para trocar o estepe.',
    shortDescription: 'Pneus com estrutura reforçada que permitem rodar mesmo quando totalmente vazios.',
    longDescription: `## Segurança em Primeiro Lugar
    
Padrão na maioria dos modelos da **BMW**, os pneus Run Flat eliminam a necessidade de estepe, ganhando espaço no porta-malas. No Brasil, são um item de segurança preventiva contra abordagens em locais perigosos, permitindo que o condutor não fique vulnerável em caso de furo ou rasgo.`,
    faq: [
      { question: 'Posso consertar um Run Flat furado?', answer: 'A maioria dos fabricantes recomenda a substituição, pois rodar vazio pode comprometer a estrutura interna reforçada do flanco.' }
    ],
    seo: { title: 'Pneus Run Flat: Segurança contra Furos | Manual Attra', metaDescription: 'Vantagens e cuidados com os pneus que rodam sem pressão.' }
  },

  // 46. Tração Integral Inteligente (AWD vs 4WD)
  {
    id: 'tracao-integral-awd',
    slug: 'tracao-integral-awd',
    title: 'Tração Integral Inteligente (AWD)',
    category: 'performance',
    displayOrder: 20,
    matchKeywords: ['awd', '4matic', 'quattro', 'xDrive', 'tracao integral'],
    relatedVehicleIds: [],
    answerSnippet: 'A Tração Integral Inteligente (All-Wheel Drive) distribui a força do motor para as quatro rodas de forma variável. Diferente do 4x4 tradicional, o AWD é gerido eletronicamente e pode enviar até 100% do torque para apenas um eixo ou uma única roda em milissegundos, otimizando a aderência em qualquer piso.',
    shortDescription: 'Sistema automático que gerencia a força nas quatro rodas para máxima tração e segurança.',
    longDescription: `## Domínio sob Qualquer Condição
    
Sistemas icônicos como o **Audi Quattro**, **BMW xDrive** e **Mercedes 4MATIC** garantem que o carro não perca tração em acelerações fortes ou pisos molhados. Em modelos esportivos, o AWD é recalibrado para priorizar o eixo traseiro, mantendo a sensação de dirigibilidade esportiva com a segurança da tração total.`,
    faq: [
      { question: 'Aumenta o consumo de combustível?', answer: 'Ligeiramente, devido ao peso extra dos diferenciais, mas a segurança e estabilidade compensam o investimento para o público premium.' }
    ],
    seo: { title: 'Tração AWD Quattro e xDrive: Diferenças | Manual Attra', metaDescription: 'Saiba como a tração integral inteligente melhora a segurança.' }
  },

  // 47. Escapamento Ativo (Active Exhaust)
  {
    id: 'escapamento-ativo',
    slug: 'escapamento-ativo',
    title: 'Sistema de Escapamento Ativo',
    category: 'performance',
    displayOrder: 21,
    matchKeywords: ['escapamento ativo', 'valvula de escape', 'ronco esportivo', 'sport exhaust'],
    relatedVehicleIds: [],
    answerSnippet: 'O escapamento ativo utiliza válvulas controladas eletronicamente nos abafadores. No modo "Conforto", as válvulas fecham para um rodar silencioso; no modo "Sport", elas se abrem para liberar o fluxo de gases e o ronco autêntico do motor, alterando a contrapressão e melhorando o desempenho.',
    shortDescription: 'Válvulas eletrônicas que alteram o som e a performance do motor conforme o modo de condução.',
    longDescription: `## Dualidade Sonora
    
Em um **Jaguar F-Type** ou em um **Porsche com PSE (Porsche Sport Exhaust)**, o escapamento ativo permite que você saia da garagem em silêncio pela manhã e desfrute de toda a sinfonia mecânica em uma estrada aberta. É o opcional favorito dos entusiastas que valorizam a experiência auditiva da direção.`,
    faq: [
      { question: 'O botão de escape aumenta a potência?', answer: 'Em alguns modelos sim, pois reduz a restrição dos gases, mas o principal ganho é na experiência emocional e na resposta do acelerador.' }
    ],
    seo: { title: 'Escapamento Ativo: O Som da Performance | Manual Attra', metaDescription: 'Saiba como as válvulas de escape mudam o ronco do seu carro.' }
  },

  // 48. Apple CarPlay Wireless e Android Auto
  {
    id: 'conectividade-wireless',
    slug: 'conectividade-wireless',
    title: 'Conectividade Smartphone Wireless',
    category: 'personalizacao-fabrica',
    displayOrder: 9,
    matchKeywords: ['apple carplay wireless', 'android auto sem fio', 'waze no painel'],
    relatedVehicleIds: [],
    answerSnippet: 'A conectividade wireless permite espelhar as funções do smartphone diretamente na central multimídia via Wi-Fi de alta velocidade, sem cabos. Isso mantém o console limpo e permite que aplicativos de navegação e música estejam prontos para uso assim que o motorista entra no veículo.',
    shortDescription: 'Integração total do celular com o carro via conexão sem fio estável.',
    longDescription: `## Minimalismo Digital
    
A integração sem fio é um divisor de águas no cotidiano. Em conjunto com o carregamento por indução, ela elimina a necessidade de fios pendurados no painel de veículos luxuosos, mantendo a estética refinada do interior enquanto oferece acesso a Waze, Spotify e assistentes de voz.`,
    faq: [
      { question: 'A conexão cai com frequência?', answer: 'Nos sistemas premium originais, a conexão é feita via Wi-Fi 5GHz, sendo extremamente estável e com latência imperceptível.' }
    ],
    seo: { title: 'CarPlay Sem Fio: Conectividade no Luxo | Manual Attra', metaDescription: 'Vantagens do espelhamento de celular sem cabos.' }
  },

  // 49. Ciclo Miller (Eficiência de Motorização)
  {
    id: 'ciclo-miller',
    slug: 'ciclo-miller',
    title: 'Ciclo Miller / Ciclo Atkinson',
    category: 'performance',
    displayOrder: 22,
    matchKeywords: ['ciclo miller', 'ciclo atkinson', 'eficiencia termica', 'motor hibrido'],
    relatedVehicleIds: [],
    answerSnippet: 'O Ciclo Miller é uma variação do ciclo de quatro tempos que mantém a válvula de admissão aberta por mais tempo. Isso reduz o esforço de compressão do pistão e utiliza a sobrealimentação (turbo) para compensar a perda de ar, resultando em um motor muito mais eficiente termicamente e menos poluente.',
    shortDescription: 'Ajuste técnico no tempo das válvulas para extrair mais energia com menos combustível.',
    longDescription: `## Engenharia de Eficiência
    
Utilizado extensivamente nos motores **Audi TFSI** e em híbridos da **Volvo** e **Toyota**, o Ciclo Miller permite que o motor funcione com menos esforço mecânico em cargas parciais. É uma tecnologia invisível para o motorista, mas fundamental para que carros de alto luxo atendam às normas de emissões sem perder torque.`,
    faq: [
      { question: 'O carro fica mais lento?', answer: 'Não, o turbocompressor de geometria variável compensa a abertura das válvulas, garantindo torque vigoroso desde baixas rotações.' }
    ],
    seo: { title: 'Ciclo Miller: Entenda a Eficiência dos Novos Motores | Manual Attra', metaDescription: 'Como a engenharia de válvulas reduz o consumo em carros premium.' }
  },

// 51. Injeção de Água (Water Injection - BMW M)
  {
    id: 'injecao-agua-m',
    slug: 'injecao-agua-m',
    title: 'Injeção de Água (Water Injection)',
    category: 'performance',
    displayOrder: 23,
    matchKeywords: ['injecao de agua', 'water injection', 'm4 gts water injection'],
    relatedVehicleIds: [],
    answerSnippet: 'A injeção de água é uma tecnologia de resfriamento para motores turbo de altíssima performance. O sistema borrifa uma névoa de água destilada no coletor de admissão, reduzindo a temperatura do ar e permitindo que o motor opere com maior pressão de turbo e ponto de ignição avançado sem risco de detonação.',
    shortDescription: 'Sistema que borrifa água na admissão para resfriar o motor e permitir ganhos extremos de potência.',
    longDescription: `## Performance sob Temperatura Controlada
    
Famoso no **BMW M4 GTS**, o sistema permite que o motor extraia mais potência sem superaquecer a câmara de combustão. A água, ao evaporar, absorve o calor do ar comprimido pelo turbo, aumentando a densidade da mistura ar-combustível e resultando em uma queima muito mais eficiente e segura para o motor em uso de pista.`,
    faq: [
      { question: 'O motor consome água?', answer: 'Sim, o sistema utiliza um reservatório dedicado de água destilada que deve ser reabastecido periodicamente, dependendo da intensidade de uso.' }
    ],
    seo: { title: 'Injeção de Água BMW M: Como Funciona | Manual Attra', metaDescription: 'Entenda a tecnologia de resfriamento extremo usada em séries especiais.' }
  },

  // 52. E-LSD (Diferencial de Deslizamento Limitado Eletrônico)
  {
    id: 'e-lsd',
    slug: 'e-lsd',
    title: 'e-LSD (Diferencial Eletrônico)',
    category: 'performance',
    displayOrder: 24,
    matchKeywords: ['e-lsd', 'eletronic limited slip differential', 'diferencial eletronico'],
    relatedVehicleIds: [],
    answerSnippet: 'O e-LSD é a evolução eletrônica do diferencial autoblocante. Utiliza embreagens controladas por computador que podem abrir ou travar em milissegundos. Diferente do mecânico, o e-LSD é preditivo, ajustando a tração antes mesmo de uma roda começar a patinar, baseando-se nos sensores de estabilidade do veículo.',
    shortDescription: 'Diferencial inteligente controlado por computador para máxima precisão de tração em milissegundos.',
    longDescription: `## Inteligência na Tração
    
Presente em modelos da **Ferrari (E-Diff)** e **Audi (Sport Differential)**, o e-LSD permite que o carro faça curvas de forma muito mais agressiva. Ele pode enviar torque para a roda externa antes mesmo da entrada na curva, ajudando a rotacionar o carro e eliminando quase totalmente a saída de frente (subesterço).`,
    faq: [
      { question: 'É melhor que o LSD mecânico?', answer: 'Para uso em ruas e estradas, sim, pois é mais suave e inteligente. Para uso exclusivo em competições brutas, alguns puristas ainda preferem a simplicidade do mecânico.' }
    ],
    seo: { title: 'e-LSD: O Diferencial Inteligente | Manual Attra', metaDescription: 'Saiba como o diferencial eletrônico revoluciona o controle de tração.' }
  },

  // 53. Fibra de Carbono Aparente (Exposed Carbon Fiber)
  {
    id: 'carbono-aparente',
    slug: 'carbono-aparente',
    title: 'Fibra de Carbono Aparente',
    category: 'personalizacao-fabrica',
    displayOrder: 10,
    matchKeywords: ['carbono aparente', 'exposed carbon', 'carbon pack', 'fibra de carbono real'],
    relatedVehicleIds: [],
    answerSnippet: 'A Fibra de Carbono Aparente é o uso do material composto sem pintura, protegido apenas por um verniz transparente de alto brilho ou fosco. No mercado premium, o alinhamento perfeito das tramas é um sinal de maestria artesanal e exclusividade, elevando o valor estético e comercial do veículo.',
    shortDescription: 'Uso estético e estrutural da fibra de carbono com acabamento transparente, destacando a trama do material.',
    longDescription: `## Estética e Leveza
    
Peças em carbono aparente, como tetos, retrovisores e aerofólios, são os itens mais desejados em supercarros. A dificuldade reside em manter a trama perfeitamente simétrica (book-matching). Em marcas como **McLaren** e **Pagani**, o alinhamento das tramas entre diferentes painéis da carroceria é considerado uma forma de arte técnica.`,
    faq: [
      { question: 'O carbono aparente desbota no sol?', answer: 'Se utilizar vernizes com proteção UV de alta qualidade (padrão OEM), o material resiste por décadas sem amarelar ou perder o brilho.' }
    ],
    seo: { title: 'Fibra de Carbono Aparente: Status e Engenharia | Manual Attra', metaDescription: 'A importância da estética da fibra de carbono no mercado de luxo.' }
  },

  // 54. Ar-Condicionado Quadrizone
  {
    id: 'ar-quadrizone',
    slug: 'ar-quadrizone',
    title: 'Climatização Quadrizone',
    category: 'personalizacao-fabrica',
    displayOrder: 11,
    matchKeywords: ['quadrizone', 'ar condicionado 4 zonas', 'climatização traseira independente'],
    relatedVehicleIds: [],
    answerSnippet: 'O sistema Quadrizone oferece quatro controles de temperatura e intensidade de fluxo de ar totalmente independentes: dois na frente e dois atrás. Isso permite que cada ocupante ajuste o microclima de seu assento, sendo um item indispensável em sedãs executivos e SUVs de alto luxo.',
    shortDescription: 'Sistema de climatização com 4 zonas independentes de temperatura e fluxo de ar.',
    longDescription: `## Conforto Individualizado
    
Em um **Range Rover Vogue** ou **Mercedes Classe S**, o conforto térmico é prioridade. O sistema Quadrizone utiliza múltiplos sensores e misturadores de ar para garantir que, enquanto o motorista prefere 18°C, o passageiro de trás possa desfrutar de 24°C, sem interferência mútua.`,
    faq: [
      { question: 'Gasta mais combustível?', answer: 'O impacto é desprezível em relação ao ganho de conforto para todos os passageiros.' }
    ],
    seo: { title: 'Ar-Condicionado Quadrizone: Luxo Individual | Manual Attra', metaDescription: 'Entenda o funcionamento da climatização de 4 zonas em carros premium.' }
  },

  // 55. Suspensão a Ar com Leitura de Terreno (Scan)
  {
    id: 'suspensao-ar-scan',
    slug: 'suspensao-ar-scan',
    title: 'Suspensão a Ar com Scan de Superfície',
    category: 'performance',
    displayOrder: 25,
    matchKeywords: ['road surface scan', 'magic body control', 'leitura de terreno', 'suspensao preditiva'],
    relatedVehicleIds: [],
    answerSnippet: 'Essa tecnologia utiliza câmeras estéreo que escaneiam a estrada à frente em busca de irregularidades. O sistema pré-ajusta as bolsas de ar da suspensão antes mesmo de o carro atingir o buraco ou a lombada, "anulando" o impacto e mantendo a carroceria perfeitamente estável.',
    shortDescription: 'Sistema preditivo que lê buracos e lombadas à frente para ajustar a suspensão antes do impacto.',
    longDescription: `## O Efeito Tapete Mágico
    
O **Mercedes-Benz Magic Body Control** é o exemplo máximo dessa tecnologia. Ao identificar uma irregularidade, o carro prepara os amortecedores para absorver o choque com suavidade total. É a união definitiva entre visão computacional e engenharia mecânica de conforto.`,
    faq: [
      { question: 'Funciona à noite?', answer: 'Sim, mas a eficiência pode ser reduzida. Muitos sistemas usam lasers ou sensores infravermelhos para auxiliar as câmeras no escuro.' }
    ],
    seo: { title: 'Suspensão com Scan de Estrada: Conforto Absoluto | Manual Attra', metaDescription: 'Como os carros de luxo "preveem" buracos para manter o conforto.' }
  },

  // 56. Massagem nos Assentos (Multi-contour Seats)
  {
    id: 'bancos-massagem',
    slug: 'bancos-massagem',
    title: 'Bancos Multicontorno com Massagem',
    category: 'personalizacao-fabrica',
    displayOrder: 12,
    matchKeywords: ['banco massagem', 'assento multicontorno', 'hot stone massage', 'ventilação de bancos'],
    relatedVehicleIds: [],
    answerSnippet: 'Os assentos multicontorno possuem bolsas de ar internas que inflam e desinflam em sequências programadas para massagear as costas e pernas dos ocupantes. Com funções que simulam "pedras quentes", ajudam a reduzir a fadiga em viagens longas e melhoram a circulação sanguínea.',
    shortDescription: 'Assentos equipados com sistemas pneumáticos de massagem e ajuste ergonômico fino.',
    longDescription: `## Bem-estar a Bordo
    
Em modelos **Volvo**, **BMW** e **Mercedes-Benz**, esses bancos oferecem até 8 programas diferentes de massagem. Além da massagem, contam com ventilação e aquecimento, permitindo que o motorista chegue ao seu destino descansado, mesmo após horas de tráfego pesado.`,
    faq: [
      { question: 'A massagem distrai o motorista?', answer: 'Pelo contrário, ela ajuda a manter a musculatura relaxada e o condutor mais alerta, evitando dores lombares que causam irritabilidade.' }
    ],
    seo: { title: 'Bancos com Massagem: Ergonomia e Luxo | Manual Attra', metaDescription: 'Saiba como funcionam os sistemas de massagem dos carros de luxo.' }
  },

  // 57. Direção Direta (Variable Steering Ratio)
  {
    id: 'direcao-variavel',
    slug: 'direcao-variavel',
    title: 'Relação de Direção Variável',
    category: 'performance',
    displayOrder: 26,
    matchKeywords: ['direção variavel', 'variable steering', 'servotronic', 'direção ativa'],
    relatedVehicleIds: [],
    answerSnippet: 'A direção variável altera o quanto as rodas viram em relação ao giro do volante. Em baixas velocidades, o sistema exige menos voltas no volante para manobrar (mais direta); em altas velocidades, torna-se menos sensível (mais indireta) para garantir estabilidade e evitar movimentos bruscos.',
    shortDescription: 'Tecnologia que ajusta o esforço e o ângulo da direção conforme a velocidade do veículo.',
    longDescription: `## Precisão e Facilidade
    
O sistema **BMW Active Steering** é um pioneiro. Ele torna o carro extremamente ágil em trajetos urbanos e travados, mas mantém a sensação de "carro plantado" na rodovia. É uma solução de engenharia que elimina a fadiga de braço em manobras de estacionamento sem sacrificar o feedback esportivo.`,
    faq: [
      { question: 'A direção fica muito leve na estrada?', answer: 'Não, ela ganha peso propositalmente para dar mais segurança e precisão ao motorista.' }
    ],
    seo: { title: 'Direção Variável: Manobrabilidade e Estabilidade | Manual Attra', metaDescription: 'Entenda como a direção se adapta à velocidade do carro.' }
  },

  // 58. Rodas Forjadas (Forged Wheels)
  {
    id: 'rodas-forjadas',
    slug: 'rodas-forjadas',
    title: 'Rodas de Alumínio Forjado',
    category: 'performance',
    displayOrder: 27,
    matchKeywords: ['roda forjada', 'forged wheels', 'roda leve', 'center lock'],
    relatedVehicleIds: [],
    answerSnippet: 'Rodas forjadas são fabricadas a partir de um bloco sólido de alumínio prensado sob extrema pressão, diferentemente das rodas fundidas (que usam metal derretido em moldes). Esse processo cria rodas muito mais leves e resistentes, reduzindo o peso não suspenso e melhorando a resposta da suspensão e a frenagem.',
    shortDescription: 'Rodas de alta resistência e baixo peso, fabricadas via prensagem de metal sólido.',
    longDescription: `## Menos Peso, Mais Performance
    
Reduzir 1kg em uma roda (peso não suspenso) equivale a reduzir cerca de 4kg no chassi em termos de dinâmica. Por isso, rodas forjadas são padrão em modelos como o **Porsche 911 GT3** e **Lamborghini Huracán**. Elas deformam menos sob estresse lateral, garantindo que o pneu mantenha o contato ideal com o solo.`,
    faq: [
      { question: 'Como saber se a roda é forjada?', answer: 'Geralmente possuem design de raios mais finos (impossíveis de fundir com segurança) e são identificadas por marcações "Forged" no aro.' }
    ],
    seo: { title: 'Rodas Forjadas vs Fundidas: A Diferença | Manual Attra', metaDescription: 'Saiba por que rodas forjadas são essenciais para performance.' }
  },

  // 59. Vidros Acústicos (Acoustic Glass)
  {
    id: 'vidro-acustico',
    slug: 'vidro-acustico',
    title: 'Vidros Acústicos Laminados',
    category: 'personalizacao-fabrica',
    displayOrder: 13,
    matchKeywords: ['vidro acustico', 'isolamento sonoro', 'vidro duplo', 'quiet cabin'],
    relatedVehicleIds: [],
    answerSnippet: 'O vidro acústico é composto por duas camadas de vidro com uma película plástica especial (PVB) entre elas. Essa construção filtra ruídos externos, principalmente o vento e o som do rolamento dos pneus, reduzindo o nível de decibéis na cabine em até 10dB e aumentando o conforto auditivo.',
    shortDescription: 'Vidros com camadas duplas e película isolante para silêncio absoluto no interior.',
    longDescription: `## O Silêncio como Luxo
    
O isolamento acústico é o que separa um carro comum de um **Bentley** ou um **Audi A8**. Além do silêncio, os vidros laminados são mais seguros (não estilhaçam facilmente) e oferecem melhor proteção térmica, ajudando a manter a temperatura interna do ar-condicionado.`,
    faq: [
      { question: 'Posso identificar o vidro acústico?', answer: 'Sim, ao baixar o vidro, é possível ver a "fenda" da laminação na borda superior, parecendo dois vidros colados.' }
    ],
    seo: { title: 'Vidro Acústico: Silêncio e Refinamento | Manual Attra', metaDescription: 'Como os vidros duplos eliminam o ruído externo nos carros de luxo.' }
  },

  // 60. Head-up Display de Realidade Aumentada (AR-HUD)
  {
    id: 'ar-hud',
    slug: 'ar-hud',
    title: 'AR-HUD (Head-up Display com Realidade Aumentada)',
    category: 'personalizacao-fabrica',
    displayOrder: 14,
    matchKeywords: ['ar hud', 'realidade aumentada para-brisa', 'hud inteligente'],
    relatedVehicleIds: [],
    answerSnippet: 'O AR-HUD projeta gráficos que parecem estar "pintados" na estrada à frente do motorista. Setas de navegação flutuam sobre as ruas onde você deve virar, e alertas de segurança destacam o carro à frente em vermelho caso a distância seja perigosa, integrando o digital com o mundo real.',
    shortDescription: 'Evolução do HUD que projeta informações interativas diretamente sobre a visão da estrada.',
    longDescription: `## O Futuro no Para-brisa
    
Pioneiro na nova **Mercedes Classe S** e na linha **Audi e-tron**, o AR-HUD resolve o problema de distração. Você não olha para um mapa; você segue setas que aparecem virtualmente no asfalto. É a tecnologia que mais aproxima a direção real de uma experiência de videogame, focada em segurança total.`,
    faq: [
      { question: 'A imagem fica borrada?', answer: 'Não, o sistema foca a imagem a cerca de 10 metros à frente do motorista, permitindo que os olhos não precisem reajustar o foco entre a estrada e o display.' }
    ],
    seo: { title: 'Head-up Display com Realidade Aumentada: O que é | Manual Attra', metaDescription: 'Conheça o HUD que projeta setas virtuais na estrada.' }
  },
// 61. Motores Porsche Air-Cooled (Arrefecidos a Ar)
  {
    id: 'porsche-air-cooled',
    slug: 'porsche-air-cooled',
    title: 'Motores Porsche Air-Cooled (1963-1998)',
    category: 'performance',
    displayOrder: 28,
    matchKeywords: ['air cooled', 'arrefecido a ar', 'porsche a ar', 'motor a ar', '993 air cooled', '964 air cooled'],
    relatedVehicleIds: [],
    answerSnippet: 'Os motores Porsche Air-Cooled são os propulsores de seis cilindros opostos (boxer) que utilizam o ar ambiente para resfriamento. Presentes nos modelos 911 de 1963 até a geração 993 (1998), são celebrados pela sua sonoridade mecânica pura, simplicidade de engenharia e altíssima valorização no mercado de colecionáveis.',
    shortDescription: 'Motores icônicos da Porsche que dispensam radiadores de água. O coração dos clássicos 911 até 1998.',
    longDescription: `## A Era de Ouro da Porsche
    
O motor "a ar" define a experiência clássica da Porsche. Sem as camisas de água para abafar o som, a sinfonia mecânica é única. A transição para o arrefecimento a água ocorreu no final de 1997 com a geração 996, o que tornou as gerações anteriores (**930, 964 e 993**) ativos financeiros extremamente escassos. Em 1978, por exemplo, o 911 SC introduziu o motor 3.0L de alumínio, famoso pela durabilidade excepcional e por ser o preferido para projetos de restauração e "backdating".`,
    faq: [
      { question: 'Por que os Porsche a ar são mais caros?', answer: 'Pela escassez, pureza de condução e por representarem o design original de Ferdinand Porsche antes das restrições de emissões modernas.' }
    ],
    seo: { title: 'Porsche Air-Cooled: Guia dos Motores a Ar | Manual Attra', metaDescription: 'Entenda por que os modelos Porsche arrefecidos a ar (até 1998) são tão valiosos.' }
  },

  // 62. Nomenclatura Ferrari (Histórica e Moderna)
  {
    id: 'nomenclatura-ferrari',
    slug: 'nomenclatura-ferrari',
    title: 'Decifrando a Nomenclatura Ferrari',
    category: 'procedencia-documentacao',
    displayOrder: 7,
    matchKeywords: ['nomenclatura ferrari', 'significado nomes ferrari', 'ferrari 488 significado', 'ferrari 812 significado'],
    relatedVehicleIds: [],
    answerSnippet: 'A nomenclatura da Ferrari segue padrões lógicos baseados no motor. Historicamente, os três números indicavam o deslocamento e o número de cilindros (ex: 246 é 2.4L, 6 cilindros). Modelos V8 modernos como a 488 usam o deslocamento unitário de um cilindro. Já a 812 Superfast indica 800 cv e 12 cilindros.',
    shortDescription: 'Guia técnico para entender os códigos e números que batizam cada modelo da Casa de Maranello.',
    longDescription: `## A Lógica de Maranello
    
Entender a Ferrari é entender seus números:
- **Exemplo 1 (F355):** 3.5 Litros, 5 válvulas por cilindro.
- **Exemplo 2 (458 Italia):** 4.5 Litros, 8 cilindros (V8).
- **Exemplo 3 (488 GTB):** 488cm³ por cilindro (488 x 8 = 3.9L).
- **Suffixos:** **M** (Modificata), **GTO** (Gran Turismo Omologato), **Spider** (Conversível) e **Pista/Speciale** (Versões focadas em circuito).`,
    faq: [
      { question: 'O que significa o "F" antes do número?', answer: 'Originalmente significava Ferrari, mas foi caindo em desuso em modelos mais novos, retornando apenas em edições específicas.' }
    ],
    seo: { title: 'Nomes da Ferrari: O Significado dos Números | Manual Attra', metaDescription: 'Entenda como a Ferrari nomeia seus carros com base em cilindrada e cilindros.' }
  },

  // 63. Lamborghini ALA (Aerodinamica Lamborghini Attiva)
  {
    id: 'lamborghini-ala',
    slug: 'lamborghini-ala',
    title: 'Lamborghini ALA (Aerodinâmica Ativa)',
    category: 'performance',
    displayOrder: 29,
    matchKeywords: ['ala lamborghini', 'aerodinamica lamborghini ativa', 'huracan performante ala'],
    relatedVehicleIds: [],
    answerSnippet: 'O sistema ALA (Aerodinamica Lamborghini Attiva) utiliza flaps eletrônicos no spoiler dianteiro e no aerofólio traseiro para variar o fluxo de ar em menos de 500 milissegundos. Ele pode alternar entre "baixo arrasto" para velocidade final e "alto downforce" para curvas, incluindo vetorização aeroespacial.',
    shortDescription: 'Sistema patenteado da Lamborghini que "esconde" ou "mostra" o ar para otimizar velocidade e curva.',
    longDescription: `## Aerodinâmica de Caça
    
Estreado no **Huracán Performante**, o ALA é revolucionário porque permite a **Vetorização Aerodinâmica**. Ao fechar o flap de apenas um lado da asa traseira em uma curva, o sistema gera mais pressão na roda interna, ajudando o carro a girar com muito mais agilidade. É tecnologia de fluxo de ar puro, sem o peso de motores hidráulicos pesados.`,
    faq: [
      { question: 'O ALA realmente funciona na rua?', answer: 'Ele é mais perceptível acima de 120km/h, onde a pressão do ar se torna a força dominante na dinâmica do carro.' }
    ],
    seo: { title: 'O que é o sistema ALA da Lamborghini | Manual Attra', metaDescription: 'Saiba como a aerodinâmica ativa da Lamborghini vence recordes em Nürburgring.' }
  },

  // 64. Mezger Engine (O Motor Lendário da Porsche)
  {
    id: 'mezger-engine',
    slug: 'mezger-engine',
    title: 'Motor Mezger (A Herança das Pistas)',
    category: 'performance',
    displayOrder: 30,
    matchKeywords: ['mezger engine', 'motor mezger', 'mezger porsche', '911 gt3 mezger'],
    relatedVehicleIds: [],
    answerSnippet: 'O "Mezger Engine" refere-se ao motor projetado pelo engenheiro Hans Mezger, caracterizado por um cárter dividido e sistema de lubrificação de cárter seco real. É o motor que venceu as 24h de Le Mans e equipou os lendários 911 GT3 (996 e 997) e o 911 Turbo (996/997.1), sendo imune aos problemas de IMS.',
    shortDescription: 'Motor de corrida adaptado para as ruas, famoso por sua confiabilidade extrema e pedigree de Le Mans.',
    longDescription: `## Por que o Mezger é cultuado?
    
Diferente dos motores Porsche de produção em massa da época, o bloco Mezger deriva diretamente do Porsche 911 GT1 de corrida. Ele não possui o rolamento IMS (vulnerável em outros modelos) e foi projetado para suportar pressões de turbo e rotações altíssimas sem falhas estruturais. Encontrar um Porsche Turbo ou GT3 com bloco Mezger é garantia de valorização e robustez mecânica.`,
    faq: [
      { question: 'Quais carros têm motor Mezger?', answer: '911 Turbo (996 e 997.1), todos os 996 GT3, 997 GT3 e o GT2.' }
    ],
    seo: { title: 'Motor Mezger Porsche: Por que é lendário | Manual Attra', metaDescription: 'Descubra a história e a engenharia do motor mais confiável da Porsche.' }
  },

  // 65. Ferrari Manettino
  {
    id: 'ferrari-manettino',
    slug: 'ferrari-manettino',
    title: 'Manettino (Seletor de Condução Ferrari)',
    category: 'performance',
    displayOrder: 31,
    matchKeywords: ['manettino', 'seletor ferrari volante', 'manettino switch', 'modos de condução ferrari'],
    relatedVehicleIds: [],
    answerSnippet: 'O Manettino é o seletor rotativo posicionado no volante das Ferraris, inspirado nos controles da Fórmula 1. Ele permite ao motorista alterar instantaneamente o comportamento do motor, câmbio, suspensão, diferencial eletrônico e controles de tração/estabilidade, variando de "Wet" (chuva) a "ESC OFF" (pista total).',
    shortDescription: 'Interruptor no volante que altera a personalidade da Ferrari, de um carro dócil a um bólido de pista.',
    longDescription: `## O Controle na Ponta dos Dedos
    
Introduzido na **Ferrari F430**, o Manettino sintetiza a filosofia de Maranello: o motorista não deve tirar as mãos do volante para ajustar a performance. As posições mais comuns são:
- **Sport:** Configuração padrão para estrada.
- **Race:** Trocas de marcha mais rápidas e suspensão rígida.
- **CT OFF:** Desliga o controle de tração, mas mantém a estabilidade.
- **ESC OFF:** Remove todas as assistências eletrônicas.`,
    faq: [
      { question: 'Posso mudar o Manettino com o carro andando?', answer: 'Sim, ele foi projetado justamente para ser ajustado em tempo real conforme as condições da estrada ou pista.' }
    ],
    seo: { title: 'Manettino Ferrari: Como usar os modos de condução | Manual Attra', metaDescription: 'Entenda as funções do seletor no volante das Ferraris.' }
  },

  // 66. Lamborghini LMR (Magneto Rheological Suspension)
  {
    id: 'lamborghini-lmr',
    slug: 'lamborghini-lmr',
    title: 'LMR - Lamborghini Magneto-rheological Suspension',
    category: 'performance',
    displayOrder: 32,
    matchKeywords: ['lmr lamborghini', 'suspensao magnetica lamborghini', 'magne ride lamborghini'],
    relatedVehicleIds: [],
    answerSnippet: 'O sistema LMR utiliza amortecedores preenchidos com um fluido que reage a campos magnéticos. Sensores leem as condições da estrada a cada milissegundo e ajustam a viscosidade do fluido, permitindo que um Aventador ou Huracán seja confortável em asfalto irregular e extremamente rígido em curvas de alta velocidade.',
    shortDescription: 'Suspensão inteligente que usa magnetismo para equilibrar luxo e performance de pista.',
    longDescription: `## O Equilíbrio do Touro
    
Em um supercarro de motor central, a suspensão precisa ser "inteligente" para não ser punitiva no uso urbano. O sistema LMR da Lamborghini permite que, no modo *Strada*, o carro absorva imperfeições como um sedã premium, mas ao mudar para o modo *Corsa*, as partículas metálicas no fluido se alinham para travar qualquer rolagem da carroceria.`,
    faq: [
      { question: 'A manutenção é mais cara?', answer: 'Sim, por ser um componente eletrônico de alta precisão, mas a durabilidade é alta e o ganho em versatilidade de uso é inestimável.' }
    ],
    seo: { title: 'Suspensão LMR Lamborghini: Tecnologia Magnética | Manual Attra', metaDescription: 'Saiba como a Lamborghini concilia conforto e estabilidade extrema.' }
  },
  // 67. Ferrari Gated Shifter (Câmbio Manual em Grelha)
  {
    id: 'ferrari-gated-shifter',
    slug: 'ferrari-gated-shifter',
    title: 'Gated Shifter (O Câmbio Manual Ferrari)',
    category: 'performance',
    displayOrder: 33,
    matchKeywords: ['gated shifter', 'cambio grelha', 'ferrari manual', 'cambio h ferrari'],
    relatedVehicleIds: [],
    answerSnippet: 'O Gated Shifter é a icônica grelha metálica em formato de "H" que guia a alavanca de câmbio nas Ferraris manuais. Além do visual artístico, ela produz um clique metálico característico em cada troca de marcha, simbolizando a era analógica e purista da marca, sendo hoje um dos itens que mais gera ágio em modelos seminovos.',
    shortDescription: 'Icônica grelha metálica das Ferraris manuais que oferece uma experiência de troca tátil e sonora única.',
    longDescription: `## A Sinfonia do Metal com Metal
    
Ter uma Ferrari com *Gated Shifter* (como na **F355, 360 Modena ou F430**) é possuir uma parte da história de Maranello que não retornará. Com a extinção dos câmbios manuais em favor das transmissões de dupla embreagem, os modelos com a "grelha" tornaram-se raridades. O som do engate da marcha contra o metal é considerado por colecionadores como a trilha sonora perfeita para o motor V8 ou V12.`,
    faq: [
      { question: 'Ainda existem Ferraris novas com esse câmbio?', answer: 'Não. A última Ferrari disponível com câmbio manual foi a California (raríssima) e a 599 GTB. Hoje, a marca produz apenas transmissões automáticas de alta performance.' }
    ],
    seo: { title: 'Ferrari Gated Shifter: O Charme do Câmbio Manual | Manual Attra', metaDescription: 'Entenda por que as Ferraris com câmbio manual em grelha estão valorizando tanto.' }
  },

  // 68. Rosso Corsa vs. Rosso Scuderia
  {
    id: 'rosso-corsa-vs-scuderia',
    slug: 'rosso-corsa-vs-scuderia',
    title: 'Rosso Corsa vs. Rosso Scuderia (As Cores da Ferrari)',
    category: 'estetica-detailing',
    displayOrder: 7,
    matchKeywords: ['rosso corsa', 'rosso scuderia', 'vermelho ferrari', 'diferença vermelhos ferrari'],
    relatedVehicleIds: [],
    answerSnippet: 'O Rosso Corsa é o vermelho histórico da Ferrari, mais profundo e escuro, representando a tradição das corridas italianas. Já o Rosso Scuderia é um tom mais aberto, vibrante e levemente alaranjado, desenvolvido para brilhar nas câmeras de TV durante as transmissões de Fórmula 1 na era Michael Schumacher.',
    shortDescription: 'As duas tonalidades de vermelho mais famosas da Ferrari: uma focada na tradição e outra na visibilidade das pistas modernas.',
    longDescription: `## Qual Vermelho Escolher?
    
A escolha entre as cores pode definir a personalidade do carro:
- **Rosso Corsa:** É a "cor padrão". Se você imagina uma Ferrari, você provavelmente imagina o Rosso Corsa. É elegante e atemporal.
- **Rosso Scuderia:** É mais chamativo e esportivo. Sob a luz do sol, ele parece "aceso". 
Na Attra, identificamos a tonalidade exata através do código de tinta original fixado no capô traseiro ou dianteiro, garantindo que o cliente saiba exatamente a linhagem cromática do seu ativo.`,
    faq: [
      { question: 'Qual valoriza mais?', answer: 'O Rosso Corsa tem maior liquidez por ser o clássico, mas o Rosso Scuderia é muito procurado em modelos focados em pista, como a 430 Scuderia ou 458 Speciale.' }
    ],
    seo: { title: 'Rosso Corsa ou Rosso Scuderia: Qual a diferença? | Manual Attra', metaDescription: 'Descubra a história por trás das tonalidades de vermelho da Ferrari.' }
  },

  // 69. Guards Red (Porsche)
  {
    id: 'guards-red-porsche',
    slug: 'guards-red-porsche',
    title: 'Guards Red (Indischrot)',
    category: 'estetica-detailing',
    displayOrder: 8,
    matchKeywords: ['guards red', 'indischrot', 'vermelho porsche', 'porsche vermelho'],
    relatedVehicleIds: [],
    answerSnippet: 'O Guards Red (conhecido na Alemanha como Indischrot) é, possivelmente, a cor mais icônica da Porsche. Introduzida nos anos 70, é um vermelho sólido, vibrante e puro, que se tornou sinônimo de performance para o 911 Turbo (930) e continua sendo uma das cores mais requisitadas até hoje.',
    shortDescription: 'O vermelho clássico e vibrante da Porsche, símbolo de gerações do 911.',
    longDescription: `## O Legado do Vermelho Índia
    
O Guards Red é uma cor que atravessa décadas sem perder o vigor. Em um Porsche clássico dos anos 80, ele exala nostalgia; em um GT3 moderno, exala agressividade. Por ser uma cor sólida (sem metálico), ela oferece um brilho muito "plano" e profundo que, quando bem vitrificado, transforma o carro em um espelho escarlate.`,
    faq: [
      { question: 'É a mesma cor do vermelho da Ferrari?', answer: 'Não. O Guards Red tende a ser um pouco mais amarelado e vibrante que o Rosso Corsa da Ferrari, especialmente sob luz natural direta.' }
    ],
    seo: { title: 'Guards Red Porsche: A História da Cor Indischrot | Manual Attra', metaDescription: 'Saiba por que o Guards Red é a cor definitiva para um Porsche 911.' }
  },

  // 70. Lamborghini E-Gear vs. ISR
  {
    id: 'lamborghini-egear-isr',
    slug: 'lamborghini-egear-isr',
    title: 'E-Gear e ISR (Transmissões Lamborghini)',
    category: 'performance',
    displayOrder: 34,
    matchKeywords: ['e-gear', 'isr transmission', 'cambio lamborghini', 'aventador isr'],
    relatedVehicleIds: [],
    answerSnippet: 'O E-Gear é o câmbio automatizado de embreagem única usado no Gallardo e Murciélago, conhecido por trocas viscerais. Já o ISR (Independent Shifting Rods), exclusivo do Aventador, é uma evolução que permite trocas em 50ms usando hastes independentes, oferecendo a brutalidade de um carro de corrida com menos peso que um sistema de dupla embreagem.',
    shortDescription: 'As tecnologias de transmissão que definiram a experiência emocional de dirigir um touro de Sant\'Agata.',
    longDescription: `## A Emoção do "Soco" nas Trocas
    
Enquanto os câmbios modernos buscam suavidade, o ISR da Lamborghini foi projetado para ser dramático. Em modo *Corsa*, a troca de marcha de um Aventador é sentida fisicamente como um impacto, algo que os entusiastas da marca valorizam como parte da experiência bruta de um motor V12. O E-Gear, por sua vez, exige técnica do motorista (como aliviar o pé na troca) para garantir longevidade e suavidade no trânsito urbano.`,
    faq: [
      { question: 'O câmbio ISR é de dupla embreagem?', answer: 'Não. Ele é de embreagem única, mas com um sistema de hastes que permite que uma marcha saia enquanto a outra entra simultaneamente, sendo muito mais leve que um câmbio de dupla embreagem (DCT).' }
    ],
    seo: { title: 'E-Gear vs ISR: Os Câmbios da Lamborghini | Manual Attra', metaDescription: 'Entenda a tecnologia e a sensação de pilotagem das transmissões Lamborghini.' }
  },

  // 71. Giallo Modena (Ferrari)
  {
    id: 'giallo-modena',
    slug: 'giallo-modena',
    title: 'Giallo Modena (O Amarelo Oficial)',
    category: 'estetica-detailing',
    displayOrder: 9,
    matchKeywords: ['giallo modena', 'amarelo ferrari', 'ferrari amarela'],
    relatedVehicleIds: [],
    answerSnippet: 'O Giallo Modena é a cor oficial da cidade de Modena e a cor de fundo do logotipo do Cavallino Rampante. Embora o vermelho seja mais popular, o amarelo é tecnicamente a cor "original" da marca Ferrari, sendo uma escolha de altíssimo impacto visual e excelente valor de revenda por sua raridade.',
    shortDescription: 'O vibrante amarelo oficial de Modena, cor que compõe o escudo da Ferrari.',
    longDescription: `## A Cor do Escudo
    
Uma Ferrari em Giallo Modena destaca as linhas e entradas de ar de modelos como a **488 Pista** ou a **F8 Tributo** de forma única. É uma cor que comunica extroversão e confiança. No mercado de seminovos premium, Ferraris amarelas costumam vender muito rápido, pois atraem o comprador que quer fugir do óbvio "vermelho sobre bege".`,
    faq: [
      { question: 'O amarelo desbota fácil?', answer: 'Como qualquer cor pigmentada, exige proteção contra UV. Recomendamos sempre PPF ou Vitrificação para manter a saturação do Giallo Modena por décadas.' }
    ],
    seo: { title: 'Giallo Modena: A História do Amarelo Ferrari | Manual Attra', metaDescription: 'Descubra por que o Giallo Modena é a cor oficial da alma da Ferrari.' }
  },

  // 72. Porsche Sport Chrono Package
  {
    id: 'porsche-sport-chrono',
    slug: 'porsche-sport-chrono',
    title: 'Sport Chrono Package',
    category: 'performance',
    displayOrder: 35,
    matchKeywords: ['sport chrono', 'cronometro porsche', 'launch control porsche', 'seletor de modo porsche'],
    relatedVehicleIds: [],
    answerSnippet: 'O Sport Chrono Package é o opcional mais importante da Porsche. Inclui o cronômetro no painel, o seletor de modos de condução no volante, a função Launch Control e coxins de motor dinâmicos. Ele altera o mapa do motor e do câmbio PDK para entregar performance máxima, sendo essencial para a valorização do veículo.',
    shortDescription: 'Pacote de performance que adiciona cronômetro, modos de condução agressivos e Launch Control.',
    longDescription: `## O "Must-Have" de qualquer Porsche
    
Sem o Sport Chrono, um Porsche é um excelente carro de luxo. Com ele, ele se torna uma máquina de precisão. O botão "Sport Response" no centro do seletor entrega 20 segundos de performance máxima (Overboost), ideal para ultrapassagens rápidas. Na Attra, um Porsche com Sport Chrono é sempre mais valorizado e procurado do que uma unidade "Standard".`,
    faq: [
      { question: 'Posso instalar depois?', answer: 'É possível instalar o software e o botão, mas os coxins dinâmicos de motor e o cronômetro físico no painel são itens de fábrica dificilmente replicados com perfeição no pós-venda.' }
    ],
    seo: { title: 'Porsche Sport Chrono: Por que é Indispensável? | Manual Attra', metaDescription: 'Saiba o que compõe o pacote Sport Chrono e como ele muda a condução do seu Porsche.' }
  },
  // 73. Porsche Weissach Package
  {
    id: 'weissach-package',
    slug: 'weissach-package',
    title: 'Weissach Package (Porsche GT Models)',
    category: 'performance',
    displayOrder: 36,
    matchKeywords: ['weissach package', 'pacote weissach', 'weissach gt3rs', 'weissach gt2rs'],
    relatedVehicleIds: [],
    answerSnippet: 'O Weissach Package é o pacote de alívio de peso extremo da Porsche, nomeado em homenagem ao seu centro de R&D. Ele substitui componentes por fibra de carbono e titânio (como a gaiola de proteção e barras estabilizadoras) e inclui rodas de magnésio, reduzindo o peso não suspenso e aumentando o valor de colecionabilidade.',
    shortDescription: 'Pacote de redução de peso e performance extrema que utiliza materiais nobres como titânio e magnésio.',
    longDescription: `## O Ápice da Performance Porsche
    
Disponível para modelos como o **918 Spyder, GT3 RS e GT2 RS**, o pacote Weissach não é apenas estético. Ele foca na redução de massa em locais críticos. A tampa do porta-malas, o teto e os braços da suspensão em carbono aparente são marcas registradas. Um Porsche com esse pacote é considerado a "versão definitiva" para investidores, mantendo um ágio considerável no mercado secundário.`,
    faq: [{ question: 'Como identificar?', answer: 'Pelo logotipo Weissach bordado nos encostos de cabeça e o uso ostensivo de fibra de carbono aparente no exterior.' }],
    seo: { title: 'Weissach Package: O que é e valorização | Manual Attra', metaDescription: 'Entenda o pacote de alívio de peso mais cobiçado da Porsche.' }
  },

  // 74. Ferrari Scuderia Shields (Brasões no Paralama)
  {
    id: 'scuderia-shields',
    slug: 'scuderia-shields',
    title: 'Scuderia Ferrari Shields ("Scudetti")',
    category: 'personalizacao-fabrica',
    displayOrder: 15,
    matchKeywords: ['scuderia shields', 'escudo ferrari paralama', 'brasao ferrari', 'scudetti'],
    relatedVehicleIds: [],
    answerSnippet: 'Os "Scudetti" são os brasões esmaltados da Scuderia Ferrari aplicados nos paralamas dianteiros. Originalmente reservados apenas para carros de corrida, tornaram-se um dos opcionais mais pedidos nos carros de rua. Sua ausência em modelos modernos é rara e pode impactar a liquidez do veículo.',
    shortDescription: 'Brasões laterais esmaltados que remetem à linhagem de competição da Ferrari.',
    longDescription: `## Tradição e Estética
    
Embora pareça um detalhe simples, o escudo esmaltado é um símbolo de status. Ferraris "naked" (sem os escudos) são extremamente raras e, embora alguns puristas as prefiram por um visual mais limpo, a esmagadora maioria dos compradores brasileiros considera o item indispensável.`,
    faq: [{ question: 'Pode ser colocado depois?', answer: 'Existem emblemas adesivos, mas os originais de fábrica são encastrados na lataria, exigindo um recorte específico no paralama.' }],
    seo: { title: 'Escudos Scuderia Ferrari: História e Valor | Manual Attra', metaDescription: 'Por que os brasões no paralama são tão importantes em uma Ferrari?' }
  },

  // 75. Lamborghini Forged Composites®
  {
    id: 'lamborghini-forged-composites',
    slug: 'lamborghini-forged-composites',
    title: 'Forged Composites® (Carbono Forjado)',
    category: 'estetica-detailing',
    displayOrder: 10,
    matchKeywords: ['carbono forjado', 'forged composites', 'lamborghini forged carbon'],
    relatedVehicleIds: [],
    answerSnippet: 'O Forged Composites® é um material patenteado pela Lamborghini, desenvolvido em parceria com a Callaway Golf. Ao contrário da fibra de carbono trançada, ele utiliza fibras picadas prensadas, resultando em uma peça mais resistente a impactos e com um padrão visual marmorizado exclusivo.',
    shortDescription: 'Tecnologia de fibra de carbono prensada com estética única e maior resistência estrutural.',
    longDescription: `## Inovação de Sant'Agata
    
Estreado no **Sesto Elemento** e popularizado no **Huracán Performante**, esse material permite criar formas complexas que a fibra de carbono tradicional não alcança. É o material do futuro, unindo leveza extrema com uma assinatura visual que nenhum outro fabricante possui igual.`,
    faq: [{ question: 'É mais leve que o carbono comum?', answer: 'A densidade é similar, mas sua resistência permite usar menos material para a mesma rigidez, reduzindo o peso final.' }],
    seo: { title: 'Forged Composites Lamborghini: O Futuro do Carbono | Manual Attra', metaDescription: 'Conheça o exclusivo carbono forjado da Lamborghini.' }
  },

  // 76. Porsche PDK Sport Mode (O "Botão do Pânico")
  {
    id: 'pdk-sport-response',
    slug: 'pdk-sport-response',
    title: 'Sport Response Button',
    category: 'performance',
    displayOrder: 37,
    matchKeywords: ['sport response', 'botao porsche volante', 'push to pass porsche'],
    relatedVehicleIds: [],
    answerSnippet: 'Localizado no centro do seletor de modos no volante, o botão Sport Response prepara o motor e o câmbio PDK para máxima resposta por 20 segundos. O câmbio reduz para a marcha mais baixa possível e o turbo mantém a pressão ideal, funcionando como um assistente de ultrapassagem extrema.',
    shortDescription: 'Botão que entrega 20 segundos de performance máxima instantânea da Porsche.',
    longDescription: `## Adrenalina sob Demanda
    
Inspirado no "Push-to-Pass" das corridas, este recurso é parte do pacote Sport Chrono. É ideal para situações onde você precisa de 100% da potência do carro imediatamente, sem precisar mudar permanentemente o modo de condução para Sport Plus.`,
    faq: [{ question: 'Pode ser usado várias vezes?', answer: 'Sim, não há limite de uso, desde que o motor esteja na temperatura ideal de operação.' }],
    seo: { title: 'Sport Response Porsche: O que é e como funciona | Manual Attra', metaDescription: 'Entenda o botão de performance instantânea da Porsche.' }
  },

  // 77. Ferrari Carbon-Ceramic Brakes (CCM)
  {
    id: 'ferrari-ccm-brakes',
    slug: 'ferrari-ccm-brakes',
    title: 'Freios Carbono-Cerâmica Ferrari (CCM)',
    category: 'performance',
    displayOrder: 38,
    matchKeywords: ['ferrari ccm', 'freio de ceramica ferrari', 'carbon ceramic ferrari'],
    relatedVehicleIds: [],
    answerSnippet: 'Os freios CCM utilizam discos compostos de cerâmica e fibra de carbono. Eles pesam cerca de 50% menos que os de ferro, reduzem a massa não suspensa e eliminam o "fading" (perda de eficiência por calor). São padrão em todas as Ferraris desde 2008, garantindo frenagens de pista em uso contínuo.',
    shortDescription: 'Sistema de freios ultra-resistente ao calor e mais leve, padrão na linha Ferrari moderna.',
    longDescription: `## Poder de Parada Eterno
    
Uma das maiores vantagens dos discos CCM é a durabilidade. Sob uso normal, eles podem durar a vida útil do veículo (até 100.000km ou mais). Além disso, não geram o pó preto que suja as rodas, mantendo a estética da Ferrari sempre impecável.`,
    faq: [{ question: 'Fazem barulho?', answer: 'Em baixas temperaturas e velocidades urbanas, podem emitir um leve assobio, o que é característica normal do material.' }],
    seo: { title: 'Freios CCM Ferrari: Performance e Durabilidade | Manual Attra', metaDescription: 'Saiba tudo sobre os freios de carbono-cerâmica da Ferrari.' }
  },

  // 78. Lamborghini Lift System
  {
    id: 'lamborghini-lift-system',
    slug: 'lamborghini-lift-system',
    title: 'Lift System (Sistema de Elevação de Eixo)',
    category: 'performance',
    displayOrder: 39,
    matchKeywords: ['lift system', 'levantar frente carro', 'nose lift lamborghini'],
    relatedVehicleIds: [],
    answerSnippet: 'O Lift System é um mecanismo hidráulico que eleva a frente do carro em cerca de 40mm a 50mm ao toque de um botão. É um item vital para supercarros baixos, permitindo transpor lombadas, rampas de garagem e irregularidades urbanas sem danificar o spoiler dianteiro.',
    shortDescription: 'Sistema hidráulico que levanta a frente do veículo para evitar raspagens em obstáculos.',
    longDescription: `## Versatilidade Urbana
    
Em um **Huracán ou Aventador**, o Lift System não é luxo, é necessidade. O sistema desativa automaticamente acima de uma certa velocidade (geralmente 40km/h) para garantir que o carro retorne à sua geometria de performance assim que a via estiver livre. Na Attra, um supercarro sem Lift System é mais difícil de comercializar devido às condições das vias brasileiras.`,
    faq: [{ question: 'É um opcional caro?', answer: 'Sim, mas o custo de reparo de um para-choque de fibra de carbono ou um difusor quebrado é muito superior.' }],
    seo: { title: 'Lift System Lamborghini: Proteção e Praticidade | Manual Attra', metaDescription: 'Por que o sistema de elevação frontal é indispensável em um supercarro.' }
  },

  // 79. Ferrari 7-Year Maintenance
  {
    id: 'ferrari-7-year-maintenance',
    slug: 'ferrari-7-year-maintenance',
    title: 'Ferrari Genuine Maintenance (7 Anos)',
    category: 'procedencia-documentacao',
    displayOrder: 8,
    matchKeywords: ['revisao gratis ferrari', 'ferrari 7 year maintenance', 'manutenção genuina ferrari'],
    relatedVehicleIds: [],
    answerSnippet: 'A Ferrari oferece um programa de manutenção gratuita por 7 anos para todos os veículos novos. Isso cobre as revisões anuais obrigatórias, incluindo mão de obra e peças originais. A presença deste plano ativo é um grande diferencial na revenda, garantindo que o carro foi mantido rigorosamente conforme os padrões de fábrica.',
    shortDescription: 'Programa de revisões inclusas por 7 anos, garantindo a saúde mecânica e valor de revenda.',
    longDescription: `## Tranquilidade de Maranello
    
Este programa é vinculado ao chassi, não ao dono. Portanto, ao comprar uma Ferrari seminova na Attra que ainda esteja dentro desse período, você tem a garantia de que as próximas revisões não terão custo de peças e mão de obra nas concessionárias oficiais. É o maior atestado de procedência que um carro pode ter.`,
    faq: [{ question: 'O que não está incluso?', answer: 'Itens de desgaste natural como pneus e pastilhas de freio não fazem parte do programa gratuito.' }],
    seo: { title: 'Manutenção Ferrari de 7 Anos: Como funciona | Manual Attra', metaDescription: 'Entenda o plano de revisões gratuitas da Ferrari.' }
  },

  // 80. Porsche PCCB (Porsche Ceramic Composite Brake)
  {
    id: 'porsche-pccb',
    slug: 'porsche-pccb',
    title: 'PCCB (Porsche Ceramic Composite Brake)',
    category: 'performance',
    displayOrder: 40,
    matchKeywords: ['pccb', 'freio de ceramica porsche', 'pinça amarela porsche'],
    relatedVehicleIds: [],
    answerSnippet: 'O PCCB é o sistema de freios de cerâmica de alta performance da Porsche, facilmente identificado pelas pinças amarelas. Oferece uma redução de 50% no peso em relação aos discos de ferro e uma resposta de frenagem superior em situações de calor extremo, além de uma vida útil muito mais longa.',
    shortDescription: 'Sistema de frenagem de elite da Porsche, reconhecido mundialmente pela eficiência e leveza.',
    longDescription: `## O Padrão Ouro das Pistas
    
Ter um Porsche com PCCB significa ter o melhor poder de frenagem do mundo automotivo. A redução do peso não suspenso melhora não só a frenagem, mas também a agilidade da direção e o conforto da suspensão, já que as rodas reagem mais rápido aos impactos.`,
    faq: [{ question: 'Qual a diferença para os freios vermelhos?', answer: 'Os vermelhos são de aço/ferro (S-Brakes). São excelentes, mas o PCCB é um nível acima em termos de resistência ao calor e peso.' }],
    seo: { title: 'Freios PCCB Porsche: Tecnologia de Cerâmica | Manual Attra', metaDescription: 'Tudo o que você precisa saber sobre os freios amarelos da Porsche.' }
  },

  // 81. Ferrari F1-DCT (Dual Clutch Transmission)
  {
    id: 'ferrari-f1-dct',
    slug: 'ferrari-f1-dct',
    title: 'F1-DCT (Câmbio de Dupla Embreagem Ferrari)',
    category: 'performance',
    displayOrder: 41,
    matchKeywords: ['f1-dct', 'cambio ferrari dupla embreagem', 'cambio f1 ferrari'],
    relatedVehicleIds: [],
    answerSnippet: 'O F1-DCT é o sistema de transmissão de dupla embreagem da Ferrari que substituiu o antigo câmbio automatizado F1 (embreagem única). Ele permite trocas de marcha instantâneas (zero interrupção de torque), sendo incrivelmente suave no modo automático e brutalmente rápido no modo manual.',
    shortDescription: 'Transmissão ultra-rápida de dupla embreagem que equipa as Ferraris modernas.',
    longDescription: `## Da F1 para as Ruas
    
Estreado na **Ferrari California** e na **458 Italia**, o F1-DCT resolveu o problema de trancos e desgaste prematuro de embreagem dos sistemas antigos. É uma das transmissões mais confiáveis e satisfatórias de operar, oferecendo um controle absoluto sobre a potência do motor V8 ou V12.`,
    faq: [{ question: 'Precisa trocar a embreagem?', answer: 'Ao contrário do câmbio F1 antigo, o DCT é projetado para durar a vida útil do carro sob uso normal.' }],
    seo: { title: 'Câmbio F1-DCT Ferrari: Tecnologia e Rapidez | Manual Attra', metaDescription: 'Saiba por que o câmbio de dupla embreagem mudou a Ferrari.' }
  },

  // 82. Lamborghini Anima (Seletor de Modos)
  {
    id: 'lamborghini-anima',
    slug: 'lamborghini-anima',
    title: 'ANIMA (Adaptive Network Intelligent Management)',
    category: 'performance',
    displayOrder: 42,
    matchKeywords: ['anima lamborghini', 'modos de condução lamborghini', 'strada sport corsa'],
    relatedVehicleIds: [],
    answerSnippet: 'ANIMA é o seletor de modos de condução da Lamborghini (Strada, Sport e Corsa). O nome, que significa "alma" em italiano, reflete como o sistema altera a personalidade do carro, ajustando motor, câmbio, tração integral e suspensão para diferentes cenários, de passeios urbanos a recordes em pista.',
    shortDescription: 'O seletor que muda o temperamento do touro: de confortável a agressivo.',
    longDescription: `## Três Personalidades em Um Carro
    
- **Strada:** Focado em conforto e suavidade.
- **Sport:** Aumenta o ronco do motor e permite mais deslize das rodas traseiras.
- **Corsa:** Performance máxima, trocas de marcha brutas e foco total em tempo de volta. 
Nos modelos mais novos, existe também o modo **EGO**, que permite personalizar cada parâmetro individualmente.`,
    faq: [{ question: 'O modo Corsa é seguro na chuva?', answer: 'Não é recomendado, pois reduz a intervenção dos controles de estabilidade. Para chuva, o modo Strada é o ideal.' }],
    seo: { title: 'Modos de Condução ANIMA Lamborghini | Manual Attra', metaDescription: 'Entenda como os modos Strada, Sport e Corsa mudam sua Lamborghini.' }
  },

  // 83. Porsche PTM (Porsche Traction Management)
  {
    id: 'porsche-ptm',
    slug: 'porsche-ptm',
    title: 'PTM (Porsche Traction Management)',
    category: 'performance',
    displayOrder: 43,
    matchKeywords: ['ptm porsche', 'tracao integral porsche', 'porsche traction management'],
    relatedVehicleIds: [],
    answerSnippet: 'O PTM é o sistema de tração integral ativa da Porsche. Ele utiliza uma embreagem multi-disco eletrônica para distribuir o torque entre os eixos dianteiro e traseiro de forma variável e ultrarrápida, garantindo estabilidade máxima em qualquer condição climática ou tipo de asfalto.',
    shortDescription: 'Sistema inteligente de tração nas quatro rodas que otimiza a aderência em milissegundos.',
    longDescription: `## Tração Sob Medida
    
Diferente de sistemas 4x4 mecânicos, o PTM é proativo. Ele lê sensores de ângulo de esterço e aceleração para prever a perda de tração. Se as rodas traseiras começam a patinar, o torque é enviado instantaneamente para a frente, mantendo o carro na trajetória desejada sem sustos para o motorista.`,
    faq: [{ question: 'O PTM torna o carro mais pesado?', answer: 'O sistema é muito leve e compacto, adicionando pouquíssimo peso em troca de um ganho imenso em segurança.' }],
    seo: { title: 'Porsche PTM: Tração Integral Inteligente | Manual Attra', metaDescription: 'Como o Porsche Traction Management garante sua segurança.' }
  },

  // 84. Ferrari SF (Scuderia Ferrari) Race History
  {
    id: 'ferrari-sf-history',
    slug: 'ferrari-sf-history',
    title: 'Linhagem SF (Scuderia Ferrari)',
    category: 'procedencia-documentacao',
    displayOrder: 9,
    matchKeywords: ['scuderia ferrari', 'historia ferrari', 'significado sf ferrari'],
    relatedVehicleIds: [],
    answerSnippet: 'A sigla SF (Scuderia Ferrari) identifica a divisão de corridas da marca. Nos carros de rua, ela aparece em modelos como a SF90 Stradale, celebrando os 90 anos da equipe de corrida. Entender essa linhagem é compreender que cada Ferrari de rua é um subproduto direto da experiência nas pistas de F1.',
    shortDescription: 'A conexão direta entre a equipe de Fórmula 1 e os carros de rua da Ferrari.',
    longDescription: `## Das Pistas para sua Garagem
    
A Ferrari é a única montadora que esteve em todas as temporadas da Fórmula 1. Esse DNA se traduz em tecnologias como o volante com LEDs de rotação, o uso de fibra de carbono estrutural e o desenvolvimento de motores híbridos de altíssima performance. Comprar uma Ferrari é comprar uma parte dessa história vitoriosa.`,
    faq: [{ question: 'O que significa SF90?', answer: 'Scuderia Ferrari 90 Anos, o modelo que marcou o início da era híbrida de produção em série da marca.' }],
    seo: { title: 'História da Scuderia Ferrari: DNA de Corrida | Manual Attra', metaDescription: 'A ligação entre os carros de F1 e os modelos de rua da Ferrari.' }
  },

  // 85. Lamborghini Carbon Skin®
  {
    id: 'lamborghini-carbon-skin',
    slug: 'lamborghini-carbon-skin',
    title: 'Carbon Skin® (Tecido de Carbono)',
    category: 'personalizacao-fabrica',
    displayOrder: 16,
    matchKeywords: ['carbon skin', 'tecido de carbono lamborghini', 'interior lamborghini'],
    relatedVehicleIds: [],
    answerSnippet: 'O Carbon Skin® é um material patenteado pela Lamborghini que consiste em um tecido de fibra de carbono extremamente flexível e macio ao toque. É utilizado no revestimento interno (teto, painéis e bancos), oferecendo uma estética técnica incomparável e sendo ainda mais leve que a Alcantara.',
    shortDescription: 'Revestimento interno exclusivo feito de fibra de carbono flexível e ultra-leve.',
    longDescription: `## Interior High-Tech
    
Introduzido no **Aventador J**, o Carbon Skin® é um exemplo do pioneirismo da Lamborghini em materiais compostos. Ele não é apenas visual; ele reduz o peso interno do veículo e oferece uma durabilidade superior a tecidos convencionais, mantendo o aspecto de "novo" por muito mais tempo.`,
    faq: [{ question: 'É confortável?', answer: 'Surpreendentemente sim. Apesar de ser fibra de carbono, o tratamento dado ao tecido o torna agradável ao toque, similar a um couro tecnológico.' }],
    seo: { title: 'Carbon Skin Lamborghini: Revestimento de Elite | Manual Attra', metaDescription: 'Saiba o que é o exclusivo tecido de carbono da Lamborghini.' }
  },

  // 86. Porsche PASM (Active Suspension Management)
  {
    id: 'porsche-pasm',
    slug: 'porsche-pasm',
    title: 'PASM (Porsche Active Suspension Management)',
    category: 'performance',
    displayOrder: 44,
    matchKeywords: ['pasm porsche', 'suspensao ativa porsche', 'amortecedor adaptativo porsche'],
    relatedVehicleIds: [],
    answerSnippet: 'O PASM é o sistema de controle eletrônico dos amortecedores da Porsche. Ele ajusta a força de amortecimento de cada roda individualmente em tempo real, baseando-se no estilo de condução e nas condições da estrada, alternando entre conforto de rodovia e rigidez de pista com um botão.',
    shortDescription: 'Gerenciamento eletrônico da suspensão que adapta o conforto e a estabilidade continuamente.',
    longDescription: `## Adaptabilidade Total
    
O sistema PASM abaixa a carroceria em 10mm (ou 20mm em versões Sport) para reduzir o centro de gravidade. Ele "lê" a forma como o motorista acelera e freia para endurecer a suspensão preventivamente, garantindo que o carro permaneça sempre plano e sob controle.`,
    faq: [{ question: 'Qual a diferença do PASM Sport?', answer: 'O PASM Sport tem molas mais rígidas e barras estabilizadoras mais grossas, focado 100% em performance dinâmica.' }],
    seo: { title: 'PASM Porsche: Suspensão Ativa e Inteligente | Manual Attra', metaDescription: 'Entenda como o Porsche Active Suspension Management melhora seu dirigir.' }
  },

  // 87. Ferrari Virtual Short Wheelbase (Eixo Traseiro Esterçante)
  {
    id: 'ferrari-virtual-short-wheelbase',
    slug: 'ferrari-virtual-short-wheelbase',
    title: 'Virtual Short Wheelbase (Eixo Esterçante)',
    category: 'performance',
    displayOrder: 45,
    matchKeywords: ['eixo estercante ferrari', 'virtual short wheelbase', 'rodas traseiras viram ferrari'],
    relatedVehicleIds: [],
    answerSnippet: 'O Virtual Short Wheelbase é o sistema de eixo traseiro esterçante da Ferrari. Ao virar as rodas traseiras no mesmo sentido ou no oposto das dianteiras, o carro simula uma distância entre eixos mais curta (para agilidade em curvas) ou mais longa (para estabilidade em alta velocidade).',
    shortDescription: 'Tecnologia que torna a Ferrari mais ágil em manobras e mais estável em retas.',
    longDescription: `## Agilidade de Kart, Estabilidade de GT
    
Estreado na **F12tdf**, esse sistema permite que carros grandes e potentes façam curvas fechadas com a facilidade de um modelo muito menor. Ele compensa o peso e o tamanho do veículo, tornando a direção extremamente direta e responsiva aos comandos do motorista.`,
    faq: [{ question: 'Dá pra sentir as rodas virando?', answer: 'O motorista não sente o movimento das rodas, mas sente o carro muito mais "na mão" e fácil de apontar nas curvas.' }],
    seo: { title: 'Virtual Short Wheelbase Ferrari: Eixo Esterçante | Manual Attra', metaDescription: 'Saiba como a Ferrari usa o eixo traseiro para melhorar a condução.' }
  },

  // 88. Lamborghini Dinamica Veicolo Integrata (LDVI)
  {
    id: 'lamborghini-ldvi',
    slug: 'lamborghini-ldvi',
    title: 'LDVI (Lamborghini Dinamica Veicolo Integrata)',
    category: 'performance',
    displayOrder: 46,
    matchKeywords: ['ldvi lamborghini', 'cerebro lamborghini', 'sistema integrado lamborghini'],
    relatedVehicleIds: [],
    answerSnippet: 'O LDVI é o "cérebro" eletrônico central da Lamborghini (presente no Huracán EVO). Ele coordena todos os sistemas dinâmicos (tração, suspensão, esterço) e, mais do que reagir, ele "prevê" o próximo movimento do motorista, ajustando o carro antecipadamente para a manobra perfeita.',
    shortDescription: 'O sistema central que antecipa as intenções do motorista e coordena o comportamento do carro.',
    longDescription: `## Inteligência Preditiva
    
O LDVI processa dados de aceleração, frenagem e ângulo de volante para entender se o motorista quer fazer um drift controlado ou uma volta rápida limpa. Ele então ajusta cada milímetro do carro para que aquela intenção se torne realidade da forma mais segura e eficiente possível.`,
    faq: [{ question: 'Substitui o motorista?', answer: 'Não, ele amplia a habilidade do motorista, fazendo-o parecer um piloto profissional ao volante.' }],
    seo: { title: 'LDVI Lamborghini: O Cérebro do Touro | Manual Attra', metaDescription: 'Entenda o sistema de dinâmica integrada da Lamborghini.' }
  },

  // 89. Porsche Dynamic Light System (PDLS)
  {
    id: 'porsche-pdls',
    slug: 'porsche-pdls',
    title: 'PDLS (Porsche Dynamic Light System)',
    category: 'seguranca-blindagem',
    displayOrder: 8,
    matchKeywords: ['pdls porsche', 'farol adaptativo porsche', 'iluminacao dinamica porsche'],
    relatedVehicleIds: [],
    answerSnippet: 'O PDLS é o sistema de iluminação dinâmica da Porsche que ajusta o feixe de luz conforme a velocidade e o ângulo de esterço. Os faróis literalmente "curvam" para iluminar o interior das curvas, além de ajustar o alcance para não ofuscar motoristas no sentido contrário.',
    shortDescription: 'Faróis inteligentes que acompanham a curva e otimizam a visibilidade noturna.',
    longDescription: `## Visão Noturna de Pista
    
O PDLS Plus (versão avançada) inclui assistente de farol alto automático e ajuste contínuo de alcance. É um dos opcionais de segurança mais recomendados, transformando a condução em estradas sinuosas à noite em uma experiência muito mais tranquila e segura.`,
    faq: [{ question: 'Como saber se tem?', answer: 'Os faróis PDLS geralmente têm o design de 4 pontos de LED diurnos, marca registrada da Porsche moderna.' }],
    seo: { title: 'Faróis PDLS Porsche: Segurança Noturna | Manual Attra', metaDescription: 'Tudo sobre a iluminação dinâmica da Porsche.' }
  },

  // 90. Ferrari HELE (High Emotion Low Emissions)
  {
    id: 'ferrari-hele',
    slug: 'ferrari-hele',
    title: 'HELE (High Emotion Low Emissions)',
    category: 'performance',
    displayOrder: 47,
    matchKeywords: ['hele ferrari', 'ferrari start stop', 'eficiencia ferrari'],
    relatedVehicleIds: [],
    answerSnippet: 'O sistema HELE é o pacote de eficiência da Ferrari que inclui tecnologias como Start-Stop, bombas de combustível de vazão variável e gestão inteligente do ar-condicionado. O objetivo é reduzir as emissões em uso urbano sem sacrificar a emoção e a potência em uso esportivo.',
    shortDescription: 'Pacote de tecnologias sustentáveis para reduzir emissões sem perder o DNA Ferrari.',
    longDescription: `## Sustentabilidade em Maranello
    
Com o HELE, a Ferrari provou que é possível ter um motor V12 ou V8 potente que respeite as normas ambientais. O sistema reduz o consumo em até 10% no trânsito, mantendo o carro pronto para entregar performance total assim que o modo Race é acionado.`,
    faq: [{ question: 'Pode desativar o Start-Stop?', answer: 'Sim, o motorista pode desativar o desligamento automático através do painel de controle.' }],
    seo: { title: 'Ferrari HELE: Performance e Meio Ambiente | Manual Attra', metaDescription: 'Saiba como a Ferrari reduz emissões com o sistema HELE.' }
  },

  // 91. Lamborghini Ad Personam Studio
  {
    id: 'lamborghini-ad-personam-studio',
    slug: 'lamborghini-ad-personam-studio',
    title: 'Ad Personam Studio (Customização)',
    category: 'personalizacao-fabrica',
    displayOrder: 17,
    matchKeywords: ['ad personam studio', 'customizacao lamborghini', 'lamborghini sob medida'],
    relatedVehicleIds: [],
    answerSnippet: 'O Ad Personam Studio é o departamento físico em Sant\'Agata Bolognese onde os clientes podem criar sua Lamborghini sob medida. Milhares de amostras de couro, cores de linha e materiais exóticos estão disponíveis para garantir que nenhuma unidade seja igual à outra no mundo.',
    shortDescription: 'O centro de criação onde o cliente personaliza cada detalhe da sua Lamborghini.',
    longDescription: `## O Limite é sua Imaginação
    
Neste estúdio, especialistas ajudam o cliente a escolher desde a cor das pinças de freio até bordados personalizados nos bancos. Ter uma Lamborghini com o selo "Ad Personam" no interior é garantia de exclusividade absoluta e maior valorização em leilões futuros.`,
    faq: [{ question: 'Precisa ir à Itália?', answer: 'Muitas escolhas podem ser feitas via concessionária, mas a experiência completa no Studio é um ritual para os maiores clientes da marca.' }],
    seo: { title: 'Ad Personam Studio: Lamborghini Sob Medida | Manual Attra', metaDescription: 'Descubra o mundo da personalização exclusiva da Lamborghini.' }
  },

  // 92. Porsche Sport Exhaust (PSE)
  {
    id: 'porsche-pse',
    slug: 'porsche-pse',
    title: 'PSE (Porsche Sport Exhaust System)',
    category: 'performance',
    displayOrder: 48,
    matchKeywords: ['pse porsche', 'escapamento esportivo porsche', 'botao barulho porsche'],
    relatedVehicleIds: [],
    answerSnippet: 'O PSE é o sistema de escapamento esportivo original da Porsche. Ele utiliza válvulas nos abafadores que, ao serem abertas por um botão no console, alteram o fluxo dos gases para produzir um ronco muito mais profundo e emocional, sem comprometer o conforto em viagens longas.',
    shortDescription: 'O botão que libera o ronco autêntico e esportivo do motor Porsche.',
    longDescription: `## Duas Almas Sonoras
    
O PSE é um dos opcionais mais desejados. Ele permite que o Porsche seja silencioso para sair da garagem e extremamente vocal em uma serra ou pista. Visualmente, o PSE é identificado por ponteiras exclusivas (geralmente duas centrais ou duas duplas em acabamento brilhante ou preto).`,
    faq: [{ question: 'Aumenta a potência?', answer: 'O ganho de cavalaria é marginal, o foco principal é na experiência sonora e redução de contrapressão.' }],
    seo: { title: 'Porsche Sport Exhaust PSE: Ronco e Emoção | Manual Attra', metaDescription: 'Tudo sobre o escapamento esportivo original da Porsche.' }
  },

  // 93. Ferrari Side Slip Control (SSC)
  {
    id: 'ferrari-ssc',
    slug: 'ferrari-ssc',
    title: 'SSC (Side Slip Control)',
    category: 'performance',
    displayOrder: 49,
    matchKeywords: ['ssc ferrari', 'side slip control', 'controle de drift ferrari'],
    relatedVehicleIds: [],
    answerSnippet: 'O SSC é o sistema da Ferrari que analisa o ângulo de deriva (derrapagem lateral) em tempo real. Ele coordena o diferencial E-Diff e o controle de tração F1-Trac para permitir que o motorista faça curvas com o carro levemente de lado de forma controlada e segura.',
    shortDescription: 'Tecnologia que ajuda o motorista a controlar derrapagens de forma profissional.',
    longDescription: `## O Mestre do Drift
    
Com o SSC, você não precisa ser um piloto de testes para sentir o carro "escorregar" com controle. O sistema entende o limite de aderência e ajusta a potência para que a traseira saia de forma previsível, garantindo a diversão sem o risco de rodar na pista.`,
    faq: [{ question: 'Tem em todas?', answer: 'Foi introduzido na 458 Speciale e agora está em suas versões mais avançadas em todos os modelos novos (como a F8 e 296 GTB).' }],
    seo: { title: 'Ferrari Side Slip Control SSC: Tecnologia de Deriva | Manual Attra', metaDescription: 'Saiba como a Ferrari controla a derrapagem lateral.' }
  },

  // 94. Lamborghini ALA 2.0 (Aerodinâmica Evoluída)
  {
    id: 'lamborghini-ala-2',
    slug: 'lamborghini-ala-2',
    title: 'ALA 2.0 (Aerodinamica Lamborghini Attiva)',
    category: 'performance',
    displayOrder: 50,
    matchKeywords: ['ala 2.0', 'aerodinamica ativa aventador', 'ala lamborghini aventador svj'],
    relatedVehicleIds: [],
    answerSnippet: 'O ALA 2.0 é a evolução do sistema de aerodinâmica ativa, otimizado para o Aventador SVJ. Ele utiliza novos canais de ar e flaps recalibrados para lidar com a maior potência do V12, garantindo que o carro tenha 40% mais downforce do que a versão anterior.',
    shortDescription: 'A versão mais potente e eficiente da aerodinâmica ativa da Lamborghini.',
    longDescription: `## Recordista de Nürburgring
    
Graças ao ALA 2.0, o Aventador SVJ tornou-se um dos carros de produção mais rápidos do mundo em pista. O sistema é tão inteligente que ele pode compensar o vácuo de ar em curvas de altíssima velocidade, mantendo o carro "plantado" no asfalto como se houvesse uma mão invisível o empurrando para baixo.`,
    faq: [{ question: 'Como vejo funcionando?', answer: 'É quase imperceptível visualmente, mas o resultado é sentido na estabilidade absurda acima de 200km/h.' }],
    seo: { title: 'ALA 2.0 Lamborghini: Aerodinâmica de Recorde | Manual Attra', metaDescription: 'Conheça a evolução da aerodinâmica ativa da Lamborghini.' }
  },

  // 95. Porsche Chrono Clock Customization
  {
    id: 'porsche-chrono-customization',
    slug: 'porsche-chrono-customization',
    title: 'Customização do Relógio Sport Chrono',
    category: 'personalizacao-fabrica',
    displayOrder: 18,
    matchKeywords: ['relogio porsche colorido', 'porsche design clock', 'cronometro colorido porsche'],
    relatedVehicleIds: [],
    answerSnippet: 'A Porsche permite customizar o mostrador do relógio Sport Chrono em diversas cores (como Amarelo Racing, Vermelho Guards ou Branco). Esse detalhe estético no centro do painel é um dos toques finais de personalização que elevam o charme do interior e mostram o cuidado do dono na configuração.',
    shortDescription: 'A opção de mudar a cor do icônico cronômetro central do painel Porsche.',
    longDescription: `## O Coração do Painel
    
Para muitos, o relógio colorido é o detalhe que "fecha" o interior do carro, combinando com os cintos de segurança ou com a costura dos bancos. É um item pequeno, mas que no mercado de seminovos demonstra uma unidade configurada com atenção total aos detalhes.`,
    faq: [{ question: 'Dá pra trocar a cor depois?', answer: 'É uma operação complexa que exige a troca do componente físico; por isso, vir de fábrica com a cor desejada é um bônus de valorização.' }],
    seo: { title: 'Relógio Sport Chrono Colorido: Estética Porsche | Manual Attra', metaDescription: 'Personalização do icônico cronômetro central da Porsche.' }
  },

  // 96. Ferrari Manettino "Wet" Mode
  {
    id: 'ferrari-manettino-wet',
    slug: 'ferrari-manettino-wet',
    title: 'Modo Wet (Manettino)',
    category: 'seguranca-blindagem',
    displayOrder: 9,
    matchKeywords: ['modo wet ferrari', 'ferrari na chuva', 'manettino wet'],
    relatedVehicleIds: [],
    answerSnippet: 'O modo "Wet" no Manettino é a configuração de segurança máxima para superfícies de baixa aderência. Ele suaviza a entrega de torque, antecipa as trocas de marcha e coloca os controles de estabilidade em alerta máximo, tornando uma Ferrari de 700cv dócil e segura sob chuva forte.',
    shortDescription: 'Configuração do volante que garante segurança total em pisos escorregadios.',
    longDescription: `## Potência Sob Controle
    
Muitos motoristas têm receio de dirigir supercarros na chuva. O modo Wet foi desenvolvido para anular esse medo. Ele garante que, mesmo que você acelere bruscamente, o computador filtre a força enviada às rodas para evitar qualquer perda de controle.`,
    faq: [{ question: 'Posso usar na cidade?', answer: 'Sim, é um modo excelente para dirigir com máxima suavidade e economia no trânsito parado.' }],
    seo: { title: 'Modo Wet Ferrari: Segurança na Chuva | Manual Attra', metaDescription: 'Saiba como a Ferrari se comporta em pisos molhados.' }
  },

  // 97. Lamborghini Rear View Camera & Park Assist
  {
    id: 'lamborghini-park-assist',
    slug: 'lamborghini-park-assist',
    title: 'Park Assist e Câmeras (Supercarros)',
    category: 'personalizacao-fabrica',
    displayOrder: 19,
    matchKeywords: ['camera de re lamborghini', 'sensores de estacionamento supercarro', 'estacionar lamborghini'],
    relatedVehicleIds: [],
    answerSnippet: 'Devido à visibilidade traseira limitada por motores centrais, as câmeras de ré e sensores de estacionamento são opcionais críticos. Em modelos como o Aventador, são indispensáveis para manobras seguras, protegendo a carroceria larga e baixa de obstáculos invisíveis pelo retrovisor.',
    shortDescription: 'Sistemas de auxílio de manobra vitais para a proteção de supercarros com visibilidade reduzida.',
    longDescription: `## Olhos na Traseira
    
Estacionar uma Lamborghini pode ser um desafio pelo tamanho e visibilidade. Ter o pacote completo de sensores e câmeras de alta definição é um seguro contra pequenos incidentes que custariam caro para reparar. Na Attra, auditamos o funcionamento desses sensores em cada unidade.`,
    faq: [{ question: 'Vem de série?', answer: 'Surpreendentemente, em muitos modelos focados em pista (como o Huracán STO), é um opcional para salvar peso.' }],
    seo: { title: 'Câmeras e Sensores Lamborghini: Manobra Segura | Manual Attra', metaDescription: 'A importância do auxílio de estacionamento em carros com motor central.' }
  },

  // 98. Porsche Power Steering Plus
  {
    id: 'porsche-power-steering-plus',
    slug: 'porsche-power-steering-plus',
    title: 'Power Steering Plus',
    category: 'performance',
    displayOrder: 51,
    matchKeywords: ['power steering plus', 'direcao leve porsche', 'direcao assistida porsche'],
    relatedVehicleIds: [],
    answerSnippet: 'O Power Steering Plus é um sistema de assistência de direção variável. Em baixas velocidades (manobras), ele torna o volante extremamente leve e fácil de girar. Em altas velocidades, a assistência diminui, oferecendo um peso maior e feedback preciso para uma condução esportiva e segura.',
    shortDescription: 'Assistência de direção inteligente que facilita manobras urbanas e enrijece na rodovia.',
    longDescription: `## O Melhor de Dois Mundos
    
Muitos clientes de **911 e Cayenne** apreciam este opcional pois ele torna o uso diário muito menos cansativo. É uma solução de software que ajusta o motor elétrico da direção para que o carro pareça leve como um citadino na hora de estacionar e firme como um carro de corrida na pista.`,
    faq: [{ question: 'Dá pra sentir a diferença?', answer: 'Sim, especialmente em balizas e manobras de garagem, a leveza é nítida.' }],
    seo: { title: 'Power Steering Plus Porsche: Direção Leve e Precisa | Manual Attra', metaDescription: 'Saiba como funciona a direção assistida variável da Porsche.' }
  },

  // 99. Ferrari Tailor Made (Exclusividade Máxima)
  {
    id: 'ferrari-tailor-made',
    slug: 'ferrari-tailor-made',
    title: 'Tailor Made (Personalização Extrema)',
    category: 'personalizacao-fabrica',
    displayOrder: 20,
    matchKeywords: ['ferrari tailor made', 'customizacao extrema ferrari', 'ferrari exclusiva'],
    relatedVehicleIds: [],
    answerSnippet: 'O Tailor Made é o programa de personalização de elite da Ferrari, onde o cliente tem acesso a materiais fora do catálogo comum, como jeans, tecidos técnicos e madeiras raras. Uma Ferrari Tailor Made é uma obra de arte única, frequentemente valorizada com ágios altíssimos por colecionadores globais.',
    shortDescription: 'O programa de alta-costura da Ferrari para criar exemplares únicos no mundo.',
    longDescription: `## Luxo sem Limites
    
Inspirado na tradição dos alfaiates italianos, o Tailor Made permite que você crie uma Ferrari que conte uma história. Se o carro no estoque da Attra possui o selo Tailor Made, você está diante de um investimento raro que foi configurado pessoalmente em Maranello com materiais de altíssimo padrão.`,
    faq: [{ question: 'Como reconhecer?', answer: 'Pela placa de prata dedicada no interior indicando "Tailor Made" e a escolha de materiais e cores exclusivas não disponíveis no catálogo padrão.' }],
    seo: { title: 'Ferrari Tailor Made: Personalização de Elite | Manual Attra', metaDescription: 'Conheça o programa de customização máxima da Ferrari.' }
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