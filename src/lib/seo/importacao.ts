export interface ImportacaoMain {
	metaTitle: string
	metaDescription: string
	keywords: string[]
	intro: string
	etapas: { titulo: string; descricao: string }[]
	paraQuemFazSentido: string[]
	vantagensVsBrasil: string[]
	riscos: { risco: string; solucao: string }[]
	exemplosVeiculos: string[]
	ctaText: string
}

export const IMPORTACAO_MAIN: ImportacaoMain = {
	metaTitle: 'Importação de Veículos de Luxo no Brasil | Attra Veículos',
	metaDescription: 'Importação de veículos de luxo no Brasil. Processo completo, etapas, custos e como a Attra simplifica a importação do seu carro dos sonhos.',
	keywords: ['importação veículo luxo brasil', 'importar carro luxo', 'importação carro premium', 'importar porsche ferrari lamborghini'],
	intro: 'A Attra oferece serviço completo de importação de veículos de luxo. Do sourcing internacional à entrega na sua porta, cuidamos de cada etapa para que você tenha acesso a modelos exclusivos que não estão disponíveis no mercado brasileiro.',
	etapas: [
		{ titulo: 'Escolha do veículo', descricao: 'Definição do modelo, versão, especificações e orçamento junto ao cliente. Alinhamento de expectativas sobre prazo, custos e disponibilidade no mercado internacional.' },
		{ titulo: 'Sourcing internacional', descricao: 'Busca do veículo nas melhores fontes internacionais. Verificação de procedência, histórico e condição real antes de qualquer compromisso. Negociação de preço e condições de compra.' },
		{ titulo: 'Documentação', descricao: 'Tratamento de toda a documentação necessária: fatura comercial, certificados de origem, documentação alfandegária e requisitos do INMETRO para homologação brasileira.' },
		// REVISAR ANUALMENTE — alíquotas e tributos de importação mudam por legislação
		{ titulo: 'Nacionalização', descricao: 'Processo de importação junto à Receita Federal, pagamento de impostos (II, IPI, PIS, COFINS, ICMS) e desembaraço aduaneiro. Acompanhamento em cada etapa até a liberação do veículo.' },
		{ titulo: 'Entrega', descricao: 'Após nacionalização e emplacamento, o veículo é entregue na sua porta com toda a documentação brasileira regularizada e pronto para uso.' },
	],
	paraQuemFazSentido: [
		'Quem busca modelos não comercializados oficialmente no Brasil',
		'Quem deseja versões específicas ou configurações exclusivas',
		'Quem encontrou oportunidade de preço vantajosa no exterior',
		'Colecionadores que buscam modelos raros ou edições limitadas',
	],
	vantagensVsBrasil: [
		'Acesso a modelos e versões indisponíveis no mercado nacional',
		'Possibilidade de configuração personalizada direto da fábrica',
		'Acesso a preços internacionais (antes de impostos) mais competitivos',
		'Modelos de coleção e edições limitadas com disponibilidade global',
	],
	riscos: [
		{ risco: 'Carga tributária elevada no Brasil', solucao: 'A Attra calcula antecipadamente todos os custos de importação para que não haja surpresas no valor final.' },
		{ risco: 'Prazo de entrega longo (3 a 6 meses)', solucao: 'Comunicação constante com atualizações de cada etapa. Prazo realista definido antes do compromisso.' },
		{ risco: 'Problemas de homologação', solucao: 'A Attra trabalha apenas com veículos que podem ser homologados no Brasil, verificando compatibilidade antes de iniciar o processo.' },
		{ risco: 'Garantia limitada para importados', solucao: 'Orientamos sobre cobertura de garantia disponível e opções de extensão para veículos importados diretamente.' },
	],
	exemplosVeiculos: [
		'Porsche 911 GT3 RS com configuração especial',
		'Ferrari 296 GTB com especificações exclusivas',
		'Lamborghini Huracán Tecnica',
		'Porsche Cayenne Turbo GT em cores de catálogo exclusivo',
		'Mercedes-AMG GT Black Series',
	],
	ctaText: 'Solicitar veículo sob demanda',
}

export interface ImportacaoMarca {
	slug: string
	brand: string
	metaTitle: string
	metaDescription: string
	keywords: string[]
	intro: string
	modelosImportaveis: string[]
	vantagens: string[]
	prazoMedio: string
	custoEstimado: string
	ctaText: string
}

export const IMPORTACAO_MARCAS: ImportacaoMarca[] = [
	{
		slug: 'porsche',
		brand: 'Porsche',
		metaTitle: 'Importação Porsche | Modelos Exclusivos | Attra Veículos',
		metaDescription: 'Importação de Porsche para o Brasil. Modelos disponíveis, vantagens, prazo e custo estimado. Attra Veículos.',
		keywords: ['importar porsche brasil', 'importação porsche', 'porsche importado', 'comprar porsche importado'],
		intro: 'A Porsche oferece configurações e versões que nem sempre chegam ao mercado brasileiro. Com a importação direta, você acessa modelos exclusivos como GT3 RS, GT4 RS, Turbo S com pacotes especiais e cores de catálogo que não são disponibilizadas pela representante oficial no Brasil.',
		modelosImportaveis: ['911 GT3 RS', '911 GT3', '718 Cayman GT4 RS', '911 Turbo S (configurações especiais)', 'Cayenne Turbo GT (cores exclusivas)', 'Taycan Turbo GT'],
		vantagens: ['Acesso a cores Paint to Sample e pacotes exclusivos', 'Versões de alta performance não comercializadas no Brasil', 'Configuração personalizada direto da fábrica Stuttgart', 'Preço potencialmente competitivo em versões de alta demanda com ágio local'],
		prazoMedio: '3 a 5 meses do pedido à entrega final no Brasil, dependendo da disponibilidade do modelo e processo de nacionalização.',
		// REVISAR ANUALMENTE — percentuais de impostos de importação mudam por legislação
		custoEstimado: 'O custo total inclui o preço do veículo no exterior + impostos de importação (60% a 80% sobre o valor CIF, dependendo da categoria) + frete internacional + despesas de nacionalização e homologação. A Attra fornece orçamento detalhado antes do compromisso.',
		ctaText: 'Solicitar importação de Porsche',
	},
	{
		slug: 'ferrari',
		brand: 'Ferrari',
		metaTitle: 'Importação Ferrari | Modelos Exclusivos | Attra Veículos',
		metaDescription: 'Importação de Ferrari para o Brasil. Modelos disponíveis, vantagens, prazo e custo estimado. Attra Veículos.',
		keywords: ['importar ferrari brasil', 'importação ferrari', 'ferrari importada', 'comprar ferrari importada'],
		intro: 'A Ferrari no Brasil possui lista de espera e alocação limitada. A importação direta permite acesso a modelos específicos, cores de catálogo personalizado e versões que podem ter fila de anos no mercado oficial.',
		modelosImportaveis: ['296 GTB / GTS', 'SF90 Stradale / Spider', 'Roma / Roma Spider', 'F8 Tributo (mercado secundário)', '812 Superfast (mercado secundário)', 'Purosangue'],
		vantagens: ['Acesso a modelos com lista de espera de anos no Brasil', 'Cores Tailor Made e configurações exclusivas', 'Possibilidade de adquirir modelos descontinuados no exterior', 'Preços internacionais podem ser competitivos versus ágio brasileiro'],
		prazoMedio: '4 a 6 meses do pedido à entrega, podendo variar conforme disponibilidade no mercado internacional e processo de nacionalização.',
		custoEstimado: 'Ferraris importadas têm custo total significativo com impostos brasileiros. O preço final pode ser 60% a 100% acima do valor no exterior. A Attra calcula o valor total antes de qualquer compromisso para decisão informada.',
		ctaText: 'Solicitar importação de Ferrari',
	},
	{
		slug: 'lamborghini',
		brand: 'Lamborghini',
		metaTitle: 'Importação Lamborghini | Modelos Exclusivos | Attra Veículos',
		metaDescription: 'Importação de Lamborghini para o Brasil. Modelos disponíveis, vantagens, prazo e custo estimado. Attra Veículos.',
		keywords: ['importar lamborghini brasil', 'importação lamborghini', 'lamborghini importada', 'comprar lamborghini importada'],
		intro: 'A Lamborghini oferece modelos com produção limitada e versões especiais que raramente chegam ao Brasil pela representante oficial. A importação direta permite acessar configurações Ad Personam e modelos exclusivos.',
		modelosImportaveis: ['Huracán Tecnica', 'Huracán STO', 'Revuelto', 'Urus Performante', 'Edições limitadas e versões especiais'],
		vantagens: ['Acesso a versões Ad Personam com personalização total', 'Modelos de produção limitada com alocação restrita', 'Possibilidade de cores e acabamentos exclusivos', 'Acesso ao mercado secundário internacional de modelos raros'],
		prazoMedio: '4 a 6 meses do pedido à entrega, dependendo da disponibilidade do modelo e complexidade da importação.',
		custoEstimado: 'Similar à Ferrari, com impostos brasileiros que podem dobrar o valor do veículo. A Attra apresenta orçamento completo e transparente antes de qualquer compromisso.',
		ctaText: 'Solicitar importação de Lamborghini',
	},
]

