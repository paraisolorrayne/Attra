export interface GuiaOperacional {
	slug: string
	title: string
	metaTitle: string
	metaDescription: string
	keywords: string[]
	sections: { heading: string; content: string }[]
	modelosCompativeis: { nome: string; href: string }[]
	ctaPrimario: string
	ctaSecundario: string
}

export const GUIAS_OPERACIONAIS: GuiaOperacional[] = [
	{
		slug: 'blindagem-carro-de-luxo',
		title: 'Blindagem de Carro de Luxo',
		metaTitle: 'Blindagem de Carro de Luxo | Quando Vale a Pena | Attra Veículos',
		metaDescription: 'Guia completo sobre blindagem de carros de luxo. Quando blindar, impacto no valor e quais modelos fazem sentido. Attra Veículos.',
		keywords: ['blindagem carro de luxo', 'blindar carro premium', 'blindagem suv luxo', 'blindagem e valorização'],
		sections: [
			{ heading: 'Quando blindar e quando NÃO blindar', content: 'A blindagem faz sentido para SUVs e sedans de grande porte usados em contextos de risco real: autoridades, empresários com exposição pública e profissionais que transitam em áreas sensíveis. Não faz sentido para esportivos de uso recreativo, carros de coleção ou veículos que priorizam performance. A blindagem adiciona entre 150 kg e 300 kg ao veículo, impactando diretamente a dinâmica de condução.' },
			{ heading: 'Impacto na dirigibilidade e performance', content: 'O peso adicional da blindagem afeta aceleração, frenagem e consumo. Em SUVs robustos como Range Rover e X5, o impacto é absorvido melhor pela estrutura. Em sedans esportivos, a perda de dinâmica é perceptível e pode comprometer a experiência de condução que justificou a compra.' },
			{ heading: 'Impacto na valorização ou desvalorização', content: 'Veículos blindados têm mercado de revenda mais restrito. SUVs blindados para uso executivo mantêm liquidez razoável. Esportivos blindados perdem valor significativo pela descaracterização. A blindagem nunca agrega valor de mercado, apenas reduz o público comprador.' },
			{ heading: 'Quais modelos fazem sentido blindar', content: 'SUVs de grande porte: Range Rover, BMW X5, Mercedes GLE, Audi Q7. Sedans executivos: Mercedes Classe S, BMW Série 7. Esses modelos absorvem o peso extra e mantêm funcionalidade adequada.' },
			{ heading: 'Erro comum: blindar carro esportivo', content: 'Blindar um Porsche 911, BMW M3 ou qualquer esportivo de performance é contraproducente. O peso extra elimina os diferenciais de condução que justificam esses veículos. Se segurança é prioridade, a escolha correta é um SUV robusto, não um esportivo blindado.' },
			{ heading: 'Comparação: SUV vs esportivo para blindagem', content: 'SUVs são projetados para suportar peso adicional sem comprometer a estrutura. Possuem suspensão mais robusta, maior espaço para acomodar o material blindado e centro de gravidade que tolera a carga extra. Esportivos são projetados para otimização de peso, e qualquer adição compromete sua razão de existir.' },
		],
		modelosCompativeis: [
			{ nome: 'Range Rover Sport', href: '/comprar/modelo/range-rover-sport' },
			{ nome: 'BMW X5', href: '/comprar/modelo/bmw-x5' },
			{ nome: 'Mercedes GLE', href: '/comprar/modelo/mercedes-gle' },
			{ nome: 'Audi Q7', href: '/comprar/modelo/audi-q7' },
		],
		ctaPrimario: 'Falar com especialista',
		ctaSecundario: 'Avaliar veículo disponível',
	},
	{
		slug: 'placa-preta-carro-antigo',
		title: 'Placa Preta para Carro Antigo',
		metaTitle: 'Placa Preta Carro Antigo | Critérios e Processo | Attra Veículos',
		metaDescription: 'Tudo sobre placa preta para carros antigos. Critérios de originalidade, processo de certificação e impacto no valor. Attra Veículos.',
		keywords: ['placa preta carro antigo', 'placa preta veículo', 'certificação carro antigo', 'carro antigo originalidade'],
		sections: [
			{ heading: 'Critérios reais para placa preta', content: 'O veículo precisa ter no mínimo 30 anos de fabricação, estar em condições de originalidade preservada e passar por avaliação de um clube de automóveis antigos credenciado. Não basta ser velho: precisa ser original.' },
			{ heading: 'Nível de originalidade exigido', content: 'Motor, câmbio, carroceria e interior devem ser originais ou restaurados com peças originais da marca. Modificações de performance ou estéticas que descaracterizem o veículo original podem impedir a certificação. A documentação do processo de restauração é fundamental.' },
			{ heading: 'Quais modelos têm potencial', content: 'Porsche 911 das séries antigas (930, 964), Mercedes-Benz SL (W107, R129), BMW 2002, BMW E30 M3, Land Rover Defender clássico. Modelos com produção limitada e relevância histórica têm maior potencial de certificação e valorização.' },
			{ heading: 'Impacto no valor de mercado', content: 'A placa preta pode valorizar o veículo em 20% a 50% dependendo do modelo e condição. Além do valor monetário, confere status de veículo histórico e benefícios como isenção de rodízio em algumas cidades.' },
			{ heading: 'Riscos de "falsa originalidade"', content: 'Veículos apresentados como originais mas com componentes substituídos ou números de chassi remarcados. A avaliação criteriosa por especialistas é essencial para evitar fraudes que comprometem o investimento.' },
			{ heading: 'Processo de certificação', content: 'O processo envolve: filiação a um clube credenciado, inspeção veicular detalhada, análise de documentação, avaliação por comissão técnica e emissão do certificado. O prazo médio é de 2 a 6 meses dependendo da complexidade.' },
		],
		modelosCompativeis: [
			{ nome: 'Porsche 911', href: '/comprar/modelo/porsche-911' },
			{ nome: 'Land Rover Defender', href: '/comprar/modelo/land-rover-defender' },
		],
		ctaPrimario: 'Falar com especialista',
		ctaSecundario: 'Avaliar veículo disponível',
	},
	{
		slug: 'preservacao-de-veiculos-de-luxo',
		title: 'Preservação de Veículos de Luxo',
		metaTitle: 'Preservação de Veículos de Luxo | Como Manter Valor | Attra Veículos',
		metaDescription: 'Como preservar veículos de luxo e manter originalidade. Armazenamento, manutenção e erros que destroem valor. Attra Veículos.',
		keywords: ['preservação veículo luxo', 'manter valor carro luxo', 'armazenamento carro coleção', 'conservação carro premium'],
		sections: [
			{ heading: 'Como manter originalidade', content: 'Originalidade é o fator que mais impacta o valor de um veículo premium no longo prazo. Manter peças originais, pintura de fábrica e interior intacto é fundamental. Qualquer modificação deve ser reversível e documentada.' },
			{ heading: 'Armazenamento correto', content: 'Ambiente coberto, ventilado e com controle de umidade é ideal. Para veículos de coleção, considere desumidificadores e protetores de bateria com carga lenta. Evite exposição prolongada ao sol direto e garagens com infiltração.' },
			{ heading: 'Quilometragem vs valorização', content: 'Baixa quilometragem valoriza, mas veículos que não rodam também sofrem. Borrachas, fluidos e componentes se degradam pela inatividade. O ideal é uso moderado e regular, com manutenção preventiva constante.' },
			{ heading: 'Manutenção preventiva vs invasiva', content: 'Manutenção preventiva (trocas de fluidos, filtros, correias) preserva valor. Manutenção invasiva desnecessária (abrir motor sem necessidade, repintar sem razão) pode reduzir o valor. Siga o cronograma da fábrica e registre tudo.' },
			{ heading: 'Impacto de modificações', content: 'Modificações de performance ou estéticas reduzem o valor de veículos premium na revenda. O mercado paga mais por carros originais. Se for modificar, guarde as peças originais para reversão futura.' },
			{ heading: 'Erros que destroem valor', content: 'Repintura total sem necessidade, troca de interior original por personalizado, instalação de som aftermarket, rebaixamento permanente, uso de peças não originais em manutenção. Cada modificação irreversível reduz o valor de mercado.' },
		],
		modelosCompativeis: [
			{ nome: 'Porsche 911', href: '/comprar/modelo/porsche-911' },
			{ nome: 'Land Rover Defender', href: '/comprar/modelo/land-rover-defender' },
			{ nome: 'Mercedes C63 AMG', href: '/comprar/modelo/mercedes-c63-amg' },
		],
		ctaPrimario: 'Falar com especialista',
		ctaSecundario: 'Avaliar veículo disponível',
	},
	{
		slug: 'seguro-carros-de-alto-valor',
		title: 'Seguro para Carros de Alto Valor',
		metaTitle: 'Seguro Carros de Alto Valor | O Que Saber | Attra Veículos',
		metaDescription: 'Guia sobre seguro para carros de alto valor. Cobertura ideal, critérios das seguradoras e erros comuns. Attra Veículos.',
		keywords: ['seguro carro alto valor', 'seguro supercarro', 'seguro carro luxo brasil', 'seguro carro premium'],
		sections: [
			{ heading: 'Diferença entre seguro comum e alto valor', content: 'Seguros de alto valor trabalham com avaliação individualizada do veículo, não tabela FIPE. A cobertura considera valor de mercado real, incluindo opcionais e condição específica. Algumas seguradoras especializadas oferecem cobertura agreed value (valor acordado).' },
			{ heading: 'Cobertura ideal para supercarros', content: 'Cobertura agreed value que garante o valor real do veículo. Cobertura para peças originais de reposição. Guincho especializado (plataforma, não gancho). Carro reserva de categoria compatível. Cobertura para eventos e track days (quando disponível).' },
			{ heading: 'Critérios das seguradoras', content: 'As seguradoras avaliam: perfil do motorista (idade, histórico), local de guarda (garagem fechada obrigatória para supercarros), quilometragem anual estimada, uso do veículo (diário, lazer, coleção) e existência de sistema de rastreamento.' },
			{ heading: 'Impacto de uso (daily vs coleção)', content: 'Veículos de uso diário têm prêmio mais alto pelo risco maior de sinistro. Veículos de coleção com uso limitado podem ter desconto de até 40% no seguro. Declarar uso incorreto pode invalidar a apólice.' },
			{ heading: 'Erros comuns na contratação', content: 'Subestimar o valor do veículo na apólice. Não declarar opcionais que impactam o valor. Ignorar exclusões de cobertura para uso em pista. Não verificar rede de oficinas credenciadas para reparos. Contratar seguro com tabela FIPE em vez de valor de mercado.' },
		],
		modelosCompativeis: [
			{ nome: 'Porsche 911', href: '/comprar/modelo/porsche-911' },
			{ nome: 'BMW M3', href: '/comprar/modelo/bmw-m3' },
			{ nome: 'Mercedes C63 AMG', href: '/comprar/modelo/mercedes-c63-amg' },
		],
		ctaPrimario: 'Falar com especialista',
		ctaSecundario: 'Avaliar veículo disponível',
	},
	{
		slug: 'avaliacao-e-originalidade-veiculos',
		title: 'Avaliação e Originalidade de Veículos',
		metaTitle: 'Avaliação e Originalidade de Veículos | Como Validar | Attra Veículos',
		metaDescription: 'Como validar procedência e originalidade de veículos premium. Matching numbers, documentação e sinais de alerta. Attra Veículos.',
		keywords: ['avaliação veículo premium', 'originalidade carro luxo', 'matching numbers', 'procedência veículo'],
		sections: [
			{ heading: 'Como validar procedência real', content: 'Procedência se valida com documentação completa: nota fiscal de compra original, transferências registradas, comprovantes de revisões na rede autorizada e laudo cautelar independente. Para veículos importados, verifique a documentação de nacionalização e homologação do INMETRO.' },
			{ heading: 'Histórico e documentação', content: 'O histórico ideal inclui: todas as notas de revisão na rede oficial, registro de recalls realizados, comprovante de procedência (primeiro proprietário), e consulta limpa no Detran (sem multas, sinistros, alienação). Lacunas no histórico são sinais de alerta.' },
			{ heading: 'Matching numbers (quando aplicável)', content: 'Em veículos de coleção e supercarros, matching numbers significa que motor, câmbio e chassi possuem numeração correspondente de fábrica. Isso confirma que os componentes são originais e nunca foram substituídos, valorizando significativamente o veículo.' },
			{ heading: 'Sinais de modificação indevida', content: 'Parafusos com marcas de ferramentas inadequadas, adesivos cobrindo números de série, pintura com diferença de tom entre painéis, interior com materiais não originais, quilometragem inconsistente com o desgaste visível. Qualquer um desses sinais exige investigação aprofundada.' },
			{ heading: 'Impacto direto no preço', content: 'Um veículo com procedência impecável e originalidade preservada pode valer 20% a 40% mais que um similar com histórico duvidoso. Para supercarros e modelos de coleção, a diferença pode ser ainda maior.' },
			{ heading: 'Erro crítico: comprar sem validação', content: 'O erro mais caro do mercado de veículos premium é comprar sem validação profissional. Economia no processo de avaliação pode resultar em prejuízo de dezenas ou centenas de milhares de reais. A Attra realiza validação completa em cada veículo do estoque.' },
		],
		modelosCompativeis: [
			{ nome: 'Porsche 911', href: '/comprar/modelo/porsche-911' },
			{ nome: 'Land Rover Defender', href: '/comprar/modelo/land-rover-defender' },
			{ nome: 'BMW M3', href: '/comprar/modelo/bmw-m3' },
		],
		ctaPrimario: 'Falar com especialista',
		ctaSecundario: 'Avaliar veículo disponível',
	},
]

// ---------------------------------------------------------------------------
