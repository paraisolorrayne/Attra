export interface CondicaoPage {
	slug: string
	title: string
	metaTitle: string
	metaDescription: string
	keywords: string[]
	definicao: string
	vantagensVsZeroKm: string[]
	riscosMercadoAberto: string[]
	comoAttraReduz: { aspecto: string; descricao: string }[]
	categoriasDisponiveis: { nome: string; href: string }[]
	ctaText: string
}

export const CONDICOES: CondicaoPage[] = [
	{
		slug: 'seminovos-premium',
		title: 'Seminovos Premium à Venda',
		metaTitle: 'Seminovos Premium | Veículos de Luxo com Procedência | Attra Veículos',
		metaDescription: 'Seminovos premium com curadoria e procedência verificada. Porsche, BMW, Mercedes e mais. Vantagens sobre zero km e como comprar com segurança. Attra Veículos.',
		keywords: ['seminovos premium', 'carro de luxo seminovo', 'seminovo premium brasil', 'comprar seminovo de luxo'],
		definicao: 'Seminovos premium são veículos de alto padrão com até 5 anos de uso e quilometragem compatível, que passam por curadoria rigorosa de procedência, manutenção e estado de conservação. Na Attra, cada veículo é validado antes de entrar no estoque.',
		vantagensVsZeroKm: [
			'Economia de 20% a 40% em relação ao preço de zero km',
			'Depreciação inicial já absorvida pelo primeiro proprietário',
			'Mesma tecnologia e performance com investimento menor',
			'Possibilidade de acessar versões superiores pelo mesmo orçamento',
			'Veículos já rodados mostram sua condição real, sem surpresas',
		],
		riscosMercadoAberto: [
			'Procedência duvidosa e histórico incompleto',
			'Veículos com sinistro oculto ou adulteração de quilometragem',
			'Ausência de garantia e suporte pós-venda',
			'Documentação irregular ou pendências financeiras',
			'Peças substituídas por não originais sem registro',
		],
		comoAttraReduz: [
			{ aspecto: 'Curadoria', descricao: 'Cada veículo passa por inspeção detalhada antes de ser aceito no estoque. Avaliamos histórico, procedência e condição real.' },
			{ aspecto: 'Histórico', descricao: 'Verificação completa de documentação, Detran, sinistros, quilometragem e manutenções na rede autorizada.' },
			{ aspecto: 'Validação', descricao: 'Laudo cautelar independente, verificação de pintura original e análise técnica por especialistas.' },
		],
		categoriasDisponiveis: [
			{ nome: 'SUVs Premium', href: '/comprar/faixa-preco/600-a-1-milhao' },
			{ nome: 'Sedans Esportivos', href: '/comprar/modelo/bmw-m3' },
			{ nome: 'Porsche', href: '/comprar/modelo/porsche-911' },
			{ nome: 'BMW', href: '/comprar/modelo/bmw-x5' },
			{ nome: 'Mercedes-Benz', href: '/comprar/modelo/mercedes-gle' },
		],
		ctaText: 'Consultar seminovos premium disponíveis',
	},
	{
		slug: 'supercarros-seminovos',
		title: 'Supercarros Seminovos à Venda',
		metaTitle: 'Supercarros Seminovos | Ferrari, Porsche, Lamborghini | Attra Veículos',
		metaDescription: 'Supercarros seminovos com procedência verificada. Ferrari, Porsche GT, Lamborghini e mais. Compre com segurança na Attra Veículos.',
		keywords: ['supercarros seminovos', 'supercarro à venda brasil', 'ferrari seminova', 'porsche gt seminovo', 'lamborghini seminova'],
		definicao: 'Supercarros seminovos são veículos de altíssima performance com histórico verificado e condição preservada. Na Attra, cada superesportivo passa por validação especializada que vai além da inspeção padrão, incluindo análise de originalidade e compatibilidade de componentes.',
		vantagensVsZeroKm: [
			'Economia significativa na compra (supercarros novos podem ter ágio de até 50%)',
			'Acesso a versões especiais já descontinuadas ou com lista de espera fechada',
			'Veículo já com rodagem inicial feita, eliminando o período de amaciamento',
			'Possibilidade de modelos que se valorizaram acima do preço original',
			'Menor impacto financeiro da depreciação no primeiro ciclo de propriedade',
		],
		riscosMercadoAberto: [
			'Histórico de uso em pista não declarado',
			'Recalls não realizados ou manutenções fora da rede oficial',
			'Repinturas ou reparos ocultos que comprometem a originalidade',
			'Adulteração de quilometragem, especialmente comum em modelos de baixa produção',
			'Veículos de importação paralela sem homologação completa',
		],
		comoAttraReduz: [
			{ aspecto: 'Curadoria', descricao: 'Seleção criteriosa de cada superesportivo. Avaliamos procedência, uso, originalidade e compatibilidade de componentes.' },
			{ aspecto: 'Histórico', descricao: 'Verificação completa incluindo registros na rede oficial da marca, histórico de recalls e manutenções específicas.' },
			{ aspecto: 'Validação', descricao: 'Inspeção técnica especializada por profissionais com experiência em superesportivos. Análise de pintura, matching numbers e originalidade de componentes.' },
		],
		categoriasDisponiveis: [
			{ nome: 'Porsche 911', href: '/comprar/modelo/porsche-911' },
			{ nome: 'Acima de R$ 1 milhão', href: '/comprar/faixa-preco/acima-de-1-milhao' },
			{ nome: 'Importação', href: '/importacao-de-veiculos-de-luxo' },
		],
		ctaText: 'Ver supercarros disponíveis',
	},
]

// ---------------------------------------------------------------------------
