export interface FaixaPrecoPage {
	slug: string
	title: string
	metaTitle: string
	metaDescription: string
	keywords: string[]
	oQueDaPraComprar: string
	categorias: { nome: string; descricao: string; modelos: { nome: string; href: string }[] }[]
	perfilComprador: string
	ctaPrimario: string
	ctaSecundario: string
}

export const FAIXAS_PRECO: FaixaPrecoPage[] = [
	{
		slug: '400-a-600-mil',
		title: 'Carros de Luxo de R$ 400 mil a R$ 600 mil',
		metaTitle: 'Carros de Luxo de R$ 400 a R$ 600 mil | Estoque e Opções | Attra Veículos',
		metaDescription: 'Carros de luxo de R$ 400 mil a R$ 600 mil. SUVs premium, sedans esportivos e modelos seminovos com procedência. Attra Veículos.',
		keywords: ['carro de luxo 400 mil', 'carro premium 500 mil', 'carro luxo 600 mil', 'suv premium 400 a 600 mil'],
		oQueDaPraComprar: 'Na faixa de R$ 400 mil a R$ 600 mil, o comprador acessa SUVs premium completos, sedans esportivos de gerações recentes e modelos Porsche de entrada. É a faixa mais competitiva do mercado premium, com ampla oferta de veículos de alta qualidade.',
		categorias: [
			{
				nome: 'SUV Luxo',
				descricao: 'SUVs completos com tecnologia e conforto de referência.',
				modelos: [
					{ nome: 'BMW X5 xDrive40i', href: '/comprar/modelo/bmw-x5' },
					{ nome: 'Porsche Cayenne (seminovo)', href: '/comprar/modelo/porsche-cayenne' },
					{ nome: 'Audi Q7 55 TFSI', href: '/comprar/modelo/audi-q7' },
				],
			},
			{
				nome: 'Esportivo',
				descricao: 'Sedans e cupês esportivos com performance real.',
				modelos: [
					{ nome: 'BMW M3 (geração anterior)', href: '/comprar/modelo/bmw-m3' },
					{ nome: 'Mercedes C63 AMG V8 (seminovo)', href: '/comprar/modelo/mercedes-c63-amg' },
				],
			},
			{
				nome: 'Sedan Premium',
				descricao: 'Sedans de luxo com conforto e tecnologia de topo.',
				modelos: [
					{ nome: 'Mercedes GLE 300d', href: '/comprar/modelo/mercedes-gle' },
					{ nome: 'Porsche Macan GTS', href: '/comprar/modelo/porsche-macan' },
				],
			},
		],
		perfilComprador: 'Profissionais de alto padrão, executivos e empresários que buscam o primeiro veículo premium ou upgrade significativo. Priorizam custo-benefício com qualidade certificada.',
		ctaPrimario: 'Falar com especialista',
		ctaSecundario: 'Receber opções disponíveis',
	},
	{
		slug: '600-a-1-milhao',
		title: 'Carros de Luxo de R$ 600 mil a R$ 1 Milhão',
		metaTitle: 'Carros de Luxo de R$ 600 mil a R$ 1 Milhão | Estoque | Attra Veículos',
		metaDescription: 'Carros de luxo de R$ 600 mil a R$ 1 milhão. SUVs de topo, esportivos premium e modelos exclusivos. Attra Veículos.',
		keywords: ['carro de luxo 600 mil', 'carro premium 800 mil', 'carro luxo 1 milhão', 'suv premium 600 mil a 1 milhão'],
		oQueDaPraComprar: 'Entre R$ 600 mil e R$ 1 milhão, o comprador acessa versões de topo de SUVs premium, sedans esportivos da geração atual e supercarros de entrada. É a faixa onde performance e luxo se encontram com amplitude de escolha.',
		categorias: [
			{
				nome: 'SUV Luxo',
				descricao: 'SUVs de topo com motorização e acabamento superiores.',
				modelos: [
					{ nome: 'Porsche Cayenne S/GTS', href: '/comprar/modelo/porsche-cayenne' },
					{ nome: 'BMW X5 M50i', href: '/comprar/modelo/bmw-x5' },
					{ nome: 'Range Rover Sport P530', href: '/comprar/modelo/range-rover-sport' },
					{ nome: 'Audi RS Q8 (seminovo)', href: '/comprar/modelo/audi-q8' },
				],
			},
			{
				nome: 'Esportivo',
				descricao: 'Esportivos de referência com performance de pista.',
				modelos: [
					{ nome: 'BMW M3 Competition', href: '/comprar/modelo/bmw-m3' },
					{ nome: 'Audi RS6 Avant (seminovo)', href: '/comprar/modelo/audi-rs6' },
					{ nome: 'Porsche 911 Carrera (seminovo)', href: '/comprar/modelo/porsche-911' },
				],
			},
			{
				nome: 'Sedan Premium',
				descricao: 'Sedans com o melhor em conforto e tecnologia.',
				modelos: [
					{ nome: 'Mercedes GLE 53 AMG', href: '/comprar/modelo/mercedes-gle' },
					{ nome: 'Audi Q8 55 TFSI', href: '/comprar/modelo/audi-q8' },
				],
			},
		],
		perfilComprador: 'Empresários, investidores e profissionais de alta renda que buscam o melhor do segmento premium sem entrar no território dos supercarros. Valorizam exclusividade com funcionalidade.',
		ctaPrimario: 'Falar com especialista',
		ctaSecundario: 'Receber opções disponíveis',
	},
	{
		slug: 'acima-de-1-milhao',
		title: 'Carros de Luxo Acima de R$ 1 Milhão',
		metaTitle: 'Carros de Luxo Acima de R$ 1 Milhão | Supercarros e Exclusivos | Attra Veículos',
		metaDescription: 'Carros de luxo acima de R$ 1 milhão. Supercarros, versões especiais e veículos exclusivos com procedência. Attra Veículos.',
		keywords: ['carro acima de 1 milhão', 'supercarro à venda', 'carro de luxo exclusivo', 'veículo premium acima 1 milhão'],
		oQueDaPraComprar: 'Acima de R$ 1 milhão, o comprador entra no território dos superesportivos, versões especiais de produção limitada e SUVs de performance extrema. São veículos que combinam exclusividade, engenharia de ponta e potencial de valorização.',
		categorias: [
			{
				nome: 'SUV Luxo',
				descricao: 'SUVs de performance extrema e versões de topo absoluto.',
				modelos: [
					{ nome: 'Porsche Cayenne Turbo GT', href: '/comprar/modelo/porsche-cayenne' },
					{ nome: 'Range Rover Sport SVR', href: '/comprar/modelo/range-rover-sport' },
					{ nome: 'Audi RS Q8', href: '/comprar/modelo/audi-q8' },
				],
			},
			{
				nome: 'Esportivo',
				descricao: 'Superesportivos e versões de coleção.',
				modelos: [
					{ nome: 'Porsche 911 Turbo S', href: '/comprar/modelo/porsche-911' },
					{ nome: 'Porsche 911 GT3', href: '/comprar/modelo/porsche-911' },
					{ nome: 'Audi RS6 Avant Performance', href: '/comprar/modelo/audi-rs6' },
				],
			},
			{
				nome: 'Importação Especial',
				descricao: 'Veículos sob demanda via importação direta.',
				modelos: [
					{ nome: 'Importar Porsche', href: '/importacao/porsche' },
					{ nome: 'Importar Ferrari', href: '/importacao/ferrari' },
					{ nome: 'Importar Lamborghini', href: '/importacao/lamborghini' },
				],
			},
		],
		perfilComprador: 'Colecionadores, investidores e entusiastas com alto patrimônio. Buscam exclusividade, potencial de valorização e experiência de propriedade diferenciada. A compra é tanto emocional quanto racional.',
		ctaPrimario: 'Falar com especialista',
		ctaSecundario: 'Receber opções disponíveis',
	},
]

// ---------------------------------------------------------------------------
