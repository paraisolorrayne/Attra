export interface PerfilComprador {
	slug: string
	title: string
	metaTitle: string
	metaDescription: string
	keywords: string[]
	contexto: string
	prioridades: string[]
	criteriosTecnicos: string[]
	errosComuns: string[]
	modelosIdeais: { nome: string; href: string; motivo: string }[]
	quandoNaoEscolher: string
	ctaText: string
}

export const PERFIS_COMPRADOR: PerfilComprador[] = [
	{
		slug: 'carro-executivo-alto-padrao',
		title: 'Carro Executivo de Alto Padrão',
		metaTitle: 'Carro Executivo Alto Padrão | Melhores Opções | Attra Veículos',
		metaDescription: 'Melhores carros executivos de alto padrão no Brasil. Isolamento, conforto e presença para o dia a dia corporativo. Attra Veículos.',
		keywords: ['carro executivo alto padrão', 'carro para executivo', 'suv executivo luxo', 'carro alto padrão brasil'],
		contexto: 'O executivo de alto padrão precisa de um veículo que projete imagem, ofereça conforto em deslocamentos intensos e funcione como extensão do ambiente profissional. Reuniões, cidade e viagens a negócios definem o uso.',
		prioridades: ['Imagem profissional adequada', 'Conforto em trânsito urbano intenso', 'Isolamento acústico para chamadas e concentração', 'Tecnologia embarcada funcional'],
		criteriosTecnicos: ['Isolamento acústico de referência', 'Suspensão com foco em conforto', 'Acabamento interno de primeiro nível', 'Sistema de conectividade integrado'],
		errosComuns: ['Escolher esportivo rígido para uso diário urbano', 'Priorizar potência sobre conforto de rodagem', 'Ignorar custo de manutenção e seguro na decisão'],
		modelosIdeais: [
			{ nome: 'BMW X5', href: '/comprar/modelo/bmw-x5', motivo: 'Equilíbrio entre esportividade e conforto executivo' },
			{ nome: 'Mercedes GLE', href: '/comprar/modelo/mercedes-gle', motivo: 'Interior mais luxuoso da categoria com tecnologia MBUX' },
			{ nome: 'Audi Q8', href: '/comprar/modelo/audi-q8', motivo: 'Design sofisticado com tecnologia de ponta' },
		],
		quandoNaoEscolher: 'Se o uso principal é lazer ou fins de semana. Para esse perfil, um esportivo puro ou SUV mais compacto pode ser mais prazeroso que um executivo focado em conforto.',
		ctaText: 'Falar com especialista sobre veículos executivos',
	},
	{
		slug: 'carro-para-politicos-e-autoridades',
		title: 'Carro para Políticos e Autoridades',
		metaTitle: 'Carro para Políticos e Autoridades | Segurança e Discrição | Attra Veículos',
		metaDescription: 'Melhores carros para políticos e autoridades. Segurança, blindagem compatível e discrição funcional. Attra Veículos.',
		keywords: ['carro para políticos', 'carro para autoridades', 'carro blindado luxo', 'veículo segurança autoridades'],
		contexto: 'Políticos e autoridades precisam de veículos que combinem segurança passiva e ativa, conforto traseiro para trabalho em trânsito, e discrição funcional que não atraia atenção desnecessária.',
		prioridades: ['Segurança pessoal e de ocupantes', 'Discrição funcional (sem ostentação)', 'Conforto traseiro para trabalho', 'Robustez estrutural'],
		criteriosTecnicos: ['Compatibilidade com blindagem nível III-A ou superior', 'Conforto traseiro com espaço para pernas', 'Robustez de chassi e suspensão', 'Vidros e portas reforçáveis'],
		errosComuns: ['Escolher carro chamativo ou esportivo para uso institucional', 'Ignorar compatibilidade de blindagem na escolha do modelo', 'Priorizar design sobre funcionalidade de segurança'],
		modelosIdeais: [
			{ nome: 'Range Rover Sport', href: '/comprar/modelo/range-rover-sport', motivo: 'Robustez, presença discreta e excelente compatibilidade com blindagem' },
			{ nome: 'BMW X5', href: '/comprar/modelo/bmw-x5', motivo: 'Plataforma robusta com versões já preparadas para blindagem de fábrica' },
			{ nome: 'Mercedes GLE', href: '/comprar/modelo/mercedes-gle', motivo: 'Conforto traseiro excepcional e estrutura preparada para proteção' },
		],
		quandoNaoEscolher: 'Se não há necessidade real de segurança reforçada. A blindagem impacta peso, consumo e dirigibilidade. Quando a discrição é o único objetivo, um sedan executivo padrão pode ser suficiente.',
		ctaText: 'Consultar veículos compatíveis com blindagem',
	},
	{
		slug: 'carro-para-track-day',
		title: 'Carro para Track Day',
		metaTitle: 'Carro para Track Day | Performance Real de Pista | Attra Veículos',
		metaDescription: 'Melhores carros para track day no Brasil. Performance, equilíbrio e preparação para pista. Attra Veículos.',
		keywords: ['carro track day', 'carro para pista', 'esportivo track day brasil', 'carro performance pista'],
		contexto: 'Track day exige performance real e mensurável. Não basta potência: o carro precisa de equilíbrio, frenagem, relação peso/potência e capacidade de suportar uso intenso em pista sem falhas.',
		prioridades: ['Performance mensurável em pista', 'Relação peso/potência otimizada', 'Capacidade de frenagem repetitiva', 'Equilíbrio dinâmico e previsibilidade'],
		criteriosTecnicos: ['Relação peso/potência favorável', 'Sistema de freios de alto desempenho (cerâmicos ideais)', 'Equilíbrio de chassi e suspensão ajustável', 'Refrigeração adequada para uso prolongado em pista'],
		errosComuns: ['Comprar carro pesado achando que potência compensa', 'Escolher SUV esportivo para uso real de pista', 'Ignorar custo de consumíveis de pista (pneus, pastilhas, fluidos)'],
		modelosIdeais: [
			{ nome: 'Porsche 911', href: '/comprar/modelo/porsche-911', motivo: 'Referência absoluta em esportivos de pista com uso diário possível' },
			{ nome: 'BMW M3', href: '/comprar/modelo/bmw-m3', motivo: 'Sedan esportivo com equilíbrio excepcional e diferencial ativo' },
		],
		quandoNaoEscolher: 'Se o uso real de pista é esporádico (menos de 4 vezes por ano). Nesse caso, um esportivo de uso misto oferece melhor custo-benefício que um carro focado em track day.',
		ctaText: 'Consultar esportivos disponíveis para track day',
	},
	{
		slug: 'carro-para-golfe-e-lifestyle',
		title: 'Carro para Golfe e Lifestyle',
		metaTitle: 'Carro para Golfe e Lifestyle | Conforto e Praticidade | Attra Veículos',
		metaDescription: 'Melhores carros para golfe e lifestyle premium. Espaço, conforto e imagem para clube e lazer. Attra Veículos.',
		keywords: ['carro para golfe', 'carro lifestyle luxo', 'suv para clube', 'carro lazer premium'],
		contexto: 'O estilo de vida de golfe e clube exige um veículo que combine espaço para equipamentos, conforto de deslocamento e imagem adequada ao ambiente social. Praticidade e elegância são igualmente importantes.',
		prioridades: ['Espaço para equipamentos (tacos, malas)', 'Conforto de deslocamento', 'Imagem adequada ao contexto social', 'Praticidade de acesso e uso'],
		criteriosTecnicos: ['Porta-malas amplo e acessível', 'Conforto de suspensão para estradas variadas', 'Acabamento que transmite sofisticação sem exagero', 'Facilidade de entrada e saída'],
		errosComuns: ['Escolher carro esportivo sem espaço funcional', 'Priorizar performance sobre conforto de passageiros', 'Ignorar a praticidade do porta-malas para o estilo de vida'],
		modelosIdeais: [
			{ nome: 'Porsche Cayenne', href: '/comprar/modelo/porsche-cayenne', motivo: 'Espaço, presença e versatilidade com DNA esportivo Porsche' },
			{ nome: 'Audi Q7', href: '/comprar/modelo/audi-q7', motivo: '7 lugares e espaço generoso para toda a família e equipamentos' },
			{ nome: 'Range Rover Sport', href: '/comprar/modelo/range-rover-sport', motivo: 'Luxo britânico com capacidade off-road para acessos variados' },
		],
		quandoNaoEscolher: 'Se a prioridade é esportividade pura. Para esse perfil de uso, o conforto e a funcionalidade devem prevalecer sobre a performance de pista.',
		ctaText: 'Consultar SUVs premium disponíveis',
	},
	{
		slug: 'carro-de-luxo-para-esposa',
		title: 'Carro de Luxo para Esposa',
		metaTitle: 'Carro de Luxo para Esposa | Conforto e Segurança | Attra Veículos',
		metaDescription: 'Melhores carros de luxo para esposa. Conforto, facilidade de condução e segurança. Attra Veículos.',
		keywords: ['carro de luxo para esposa', 'carro premium feminino', 'suv compacto luxo mulher', 'carro confortável seguro'],
		contexto: 'A escolha prioriza conforto de condução, segurança ativa e passiva, facilidade de manobra e tecnologia que simplifique o dia a dia. O veículo precisa ser acessível em tamanho e sofisticado em experiência.',
		prioridades: ['Facilidade de condução e manobra', 'Segurança ativa e passiva completa', 'Conforto diário sem complicação', 'Tecnologia intuitiva e funcional'],
		criteriosTecnicos: ['Dirigibilidade acessível e responsiva', 'Tecnologia de assistência ao motorista', 'Tamanho adequado para uso urbano', 'Conforto de banco e posição de dirigir'],
		errosComuns: ['Escolher SUV grande e difícil de manobrar', 'Priorizar potência desnecessária para o perfil de uso', 'Ignorar ergonomia e facilidade de uso da tecnologia'],
		modelosIdeais: [
			{ nome: 'Porsche Macan', href: '/comprar/modelo/porsche-macan', motivo: 'SUV compacto com dirigibilidade esportiva e tamanho ideal para cidade' },
			{ nome: 'Audi Q5', href: '/comprar/faixa-preco/400-a-600-mil', motivo: 'Tamanho médio com tecnologia Audi e conforto de referência' },
		],
		quandoNaoEscolher: 'Se a condutora prefere carros maiores e com mais presença. Nesse caso, um Cayenne ou X5 pode ser mais adequado que um SUV compacto.',
		ctaText: 'Consultar SUVs compactos premium disponíveis',
	},
	{
		slug: 'carro-para-viagens-longas',
		title: 'Carro para Viagens Longas',
		metaTitle: 'Carro para Viagens Longas | Conforto e Autonomia | Attra Veículos',
		metaDescription: 'Melhores carros para viagens longas. Conforto contínuo, estabilidade e autonomia. Attra Veículos.',
		keywords: ['carro para viagens longas', 'carro confortável estrada', 'suv viagem longa', 'carro autonomia estrada'],
		contexto: 'Viagens longas de estrada exigem conforto contínuo por horas, estabilidade em alta velocidade, isolamento acústico eficiente e autonomia de tanque. O motorista precisa chegar descansado após centenas de quilômetros.',
		prioridades: ['Conforto contínuo por horas de condução', 'Estabilidade em velocidade de cruzeiro', 'Autonomia de tanque acima da média', 'Isolamento acústico eficiente'],
		criteriosTecnicos: ['Estabilidade direcional em alta velocidade', 'Consumo eficiente para a categoria', 'Conforto de suspensão em pavimento variável', 'Bancos com múltiplos ajustes e ventilação'],
		errosComuns: ['Escolher esportivo rígido para viagens longas', 'Priorizar potência sobre conforto de cruzeiro', 'Ignorar autonomia e consumo na decisão'],
		modelosIdeais: [
			{ nome: 'BMW X5', href: '/comprar/modelo/bmw-x5', motivo: 'Equilíbrio ideal entre conforto de viagem e dirigibilidade' },
			{ nome: 'Audi Q7', href: '/comprar/modelo/audi-q7', motivo: 'Conforto de primeira classe com espaço para toda a família' },
			{ nome: 'Mercedes GLE', href: '/comprar/modelo/mercedes-gle', motivo: 'Isolamento acústico e conforto de referência para longas distâncias' },
		],
		quandoNaoEscolher: 'Se as viagens são majoritariamente urbanas e curtas. Para uso exclusivamente urbano, um SUV compacto como o Macan ou Q5 oferece melhor custo-benefício.',
		ctaText: 'Consultar SUVs de conforto disponíveis',
	},
	{
		slug: 'carro-para-uso-urbano-premium',
		title: 'Carro para Uso Urbano Premium',
		metaTitle: 'Carro para Uso Urbano Premium | Praticidade e Conforto | Attra Veículos',
		metaDescription: 'Melhores carros para uso urbano premium. Praticidade, facilidade de manobra e conforto diário. Attra Veículos.',
		keywords: ['carro urbano premium', 'suv compacto urbano luxo', 'carro para cidade premium', 'carro confortável urbano'],
		contexto: 'O uso urbano premium exige praticidade acima de tudo: facilidade de manobra, tamanho adequado para estacionamentos, conforto no trânsito e tecnologia que simplifique o dia a dia na cidade.',
		prioridades: ['Praticidade em espaços urbanos', 'Conforto no trânsito diário', 'Tamanho adequado para estacionamentos', 'Facilidade de manobra'],
		criteriosTecnicos: ['Dimensões compactas para a categoria', 'Sistema de câmeras e assistência de estacionamento', 'Raio de giro reduzido', 'Modos de condução urbanos eficientes'],
		errosComuns: ['Comprar SUV grande demais para uso exclusivamente urbano', 'Ignorar custo de manutenção e consumo urbano', 'Priorizar status sobre funcionalidade diária'],
		modelosIdeais: [
			{ nome: 'Porsche Macan', href: '/comprar/modelo/porsche-macan', motivo: 'O SUV compacto premium com a melhor dirigibilidade da categoria' },
			{ nome: 'Audi Q5', href: '/comprar/faixa-preco/400-a-600-mil', motivo: 'Tamanho ideal para cidade com tecnologia Quattro e conforto Audi' },
		],
		quandoNaoEscolher: 'Se há necessidade frequente de transportar mais de 4 pessoas ou equipamentos volumosos. Nesse caso, um SUV de porte médio como X5 ou Q7 é mais indicado.',
		ctaText: 'Consultar SUVs compactos disponíveis',
	},
]

// ---------------------------------------------------------------------------
