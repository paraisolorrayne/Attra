/**
 * Iconic Cars — Attra History Cache
 *
 * Curated record of the most notable vehicles that have passed through
 * Attra Veículos. This serves as a permanent portfolio/history page,
 * independent of the live inventory (which removes sold vehicles).
 *
 * Rules:
 *  - No prices shown (historical record only — prices change over time).
 *  - Data is provisioned from past inventory snapshots.
 *  - Photos reference the Attra S3 bucket (permanent URLs).
 *  - Each entry includes a short editorial note about why it's iconic.
 */

export interface IconicCar {
	id: string
	brand: string
	model: string
	version?: string
	year: number
	color: string
	mileage: string
	engine: string
	power: string
	photo: string
	category: 'supercar' | 'luxury' | 'sports' | 'muscle' | 'suv-premium'
	editorial: string
	highlights: string[]
	soldYear: number
}

export const ICONIC_CARS: IconicCar[] = [
	{
		id: 'iconic-sf90-stradale',
		brand: 'Ferrari',
		model: 'SF90 Stradale',
		version: 'Assetto Fiorano',
		year: 2024,
		color: 'Rosso Corsa',
		mileage: '0 km',
		engine: 'V8 biturbo + 3 motores elétricos',
		power: '1.000 cv',
		photo: 'https://autoconf-production.s3.amazonaws.com/uploads/photo/file/17698281/Copia_de_20241119_ATTRA_FERRARI_SF90_KIT_FIORANO_ROSSO_CORSA_8C_low_quality__1_.webp',
		category: 'supercar',
		editorial: 'O Ferrari mais potente já recebido pela Attra. Com kit Assetto Fiorano e apenas 0 km, este SF90 Stradale representou o ápice da tecnologia híbrida de Maranello em nosso showroom.',
		highlights: ['Primeiro Ferrari híbrido na Attra', 'Kit Assetto Fiorano de fábrica', 'Motor V8 + 3 elétricos = 1.000 cv'],
		soldYear: 2025,
	},
	{
		id: 'iconic-huracan-evo',
		brand: 'Lamborghini',
		model: 'Huracán EVO',
		version: 'LP 640-2',
		year: 2022,
		color: 'Verde Mantis',
		mileage: '3.200 km',
		engine: 'V10 5.2L aspirado',
		power: '640 cv',
		photo: 'https://autoconf-production.s3.amazonaws.com/uploads/photo/file/16746027/Copia_de_20240508_ATTRA_HURACAN_EVO_VERDE_MANTIS__M7Y7488_low_quality.webp',
		category: 'supercar',
		editorial: 'Um dos últimos V10 aspirados da história da Lamborghini. Na icônica cor Verde Mantis, este Huracán EVO com tração traseira pura representava a essência do supercarro analógico.',
		highlights: ['V10 aspirado — motor em extinção', 'Tração traseira pura (RWD)', 'Cor Verde Mantis exclusiva'],
		soldYear: 2024,
	},
	{
		id: 'iconic-corvette-z06',
		brand: 'Chevrolet',
		model: 'Corvette Z06',
		version: 'C8 Z07 Package',
		year: 2023,
		color: 'Rapid Blue',
		mileage: '2.800 km',
		engine: 'V8 LT6 5.5L flat-plane crank',
		power: '670 cv',
		photo: 'https://autoconf-production.s3.amazonaws.com/uploads/photo/file/15831024/img_0.webp',
		category: 'sports',
		editorial: 'O Corvette Z06 com motor flat-plane crank que gira a 8.600 rpm — um supercarro americano com alma de carro de corrida. A versão com Z07 Performance Package é a mais radical já oferecida pela GM.',
		highlights: ['Motor V8 flat-plane de 670 cv', 'Pacote Z07 com aero em fibra de carbono', 'Freios carbono-cerâmicos Brembo'],
		soldYear: 2024,
	},
	{
		id: 'iconic-porsche-gt3-rs',
		brand: 'Porsche',
		model: '911 GT3 RS',
		version: '992',
		year: 2024,
		color: 'Branco',
		mileage: '1.100 km',
		engine: 'Boxer 6 4.0L aspirado',
		power: '525 cv',
		photo: 'https://autoconf-production.s3.amazonaws.com/uploads/photo/file/17568025/Copia_de_20241023_ATTRA_GT3RS_BRANCO__M7Y3965_low_quality.webp',
		category: 'supercar',
		editorial: 'O GT3 RS 992 é considerado o Porsche de rua mais focado em pista já produzido. Com asa DRS ativa, aerodinâmica de carro de corrida e motor aspirado que gira até 9.000 rpm, é uma máquina de precisão alemã.',
		highlights: ['Asa DRS ativa derivada de Le Mans', 'Motor aspirado 4.0L até 9.000 rpm', 'Suspensão pushrod duplo wishbone'],
		soldYear: 2025,
	},
	{
		id: 'iconic-mclaren-artura',
		brand: 'McLaren',
		model: 'Artura',
		year: 2024,
		color: 'Silica White',
		mileage: '0 km',
		engine: 'V6 3.0L biturbo + motor elétrico',
		power: '680 cv',
		photo: 'https://autoconf-production.s3.amazonaws.com/uploads/photo/file/17795613/Copia_de_20250110_ATTRA_MCLAREN_ARTURA_SPIDER_SILICA_WHITE__M7Y8233_low_quality.webp',
		category: 'supercar',
		editorial: 'O primeiro McLaren híbrido plug-in, com chassi em fibra de carbono e um novo motor V6 desenvolvido do zero. Combina eficiência com performance brutal em um pacote de apenas 1.395 kg.',
		highlights: ['Primeiro McLaren híbrido plug-in', 'Chassi MCLA em fibra de carbono', 'Modo E-Mode para condução elétrica'],
		soldYear: 2025,
	},
	{
		id: 'iconic-challenger-hellcat',
		brand: 'Dodge',
		model: 'Challenger SRT Hellcat',
		version: 'Redeye Widebody',
		year: 2023,
		color: 'Destroyer Grey',
		mileage: '5.400 km',
		engine: 'V8 HEMI 6.2L supercharged',
		power: '807 cv',
		photo: 'https://autoconf-production.s3.amazonaws.com/uploads/photo/file/16345698/Copia_de_ATTRA_22_03_2024_HELLCAT__M7Y2363_low_quality.webp',
		category: 'muscle',
		editorial: 'O último muscle car verdadeiro — com o encerramento da produção do Challenger, o Hellcat Redeye Widebody se tornou um instant classic. 807 cv de brutalidade americana pura, com supercharger e tração traseira.',
		highlights: ['807 cv — último Hellcat produzido', 'Supercharger de 2.7L', 'Widebody de fábrica — ícone instantâneo'],
		soldYear: 2024,
	},
	{
		id: 'iconic-range-rover-autobiography',
		brand: 'Land Rover',
		model: 'Range Rover',
		version: 'Autobiography LWB',
		year: 2024,
		color: 'Charente Grey',
		mileage: '0 km',
		engine: 'V8 4.4L biturbo',
		power: '530 cv',
		photo: 'https://autoconf-production.s3.amazonaws.com/uploads/photo/file/17082825/Copia_de_20240627_RANGE_ROVER_AUTOBIOGRAPHY___M7Y5082_low_quality.webp',
		category: 'suv-premium',
		editorial: 'O Range Rover Autobiography LWB é o SUV de luxo definitivo. Com banco executivo traseiro individual, massagem, refrigeração e teto panorâmico estendido, é uma sala de estar sobre rodas.',
		highlights: ['Banco executivo traseiro individual', 'Entre-eixos longo (LWB)', 'Motor V8 BMW com 530 cv'],
		soldYear: 2025,
	},
	{
		id: 'iconic-bentley-continental-gtc',
		brand: 'Bentley',
		model: 'Continental GT',
		version: 'Speed Convertible',
		year: 2023,
		color: 'Cambrian Grey',
		mileage: '4.800 km',
		engine: 'W12 6.0L biturbo',
		power: '659 cv',
		photo: 'https://autoconf-production.s3.amazonaws.com/uploads/photo/file/16201457/Copia_de_20240112_ATTRA_BENTLEY_CONTINENTAL_GTC___M7Y9899_low_quality.webp',
		category: 'luxury',
		editorial: 'O grand tourer definitivo em versão conversível. O Continental GT Speed com motor W12 combina luxo artesanal inglês com desempenho esportivo. O último modelo com o icônico motor de 12 cilindros da Bentley.',
		highlights: ['Motor W12 — último da linhagem', 'Interior artesanal com 10 bilhões de combinações', 'Grand tourer conversível de 335 km/h'],
		soldYear: 2024,
	},
	{
		id: 'iconic-ford-mustang-dark-horse',
		brand: 'Ford',
		model: 'Mustang',
		version: 'Dark Horse',
		year: 2024,
		color: 'Blue Ember',
		mileage: '0 km',
		engine: 'V8 Coyote 5.0L aspirado',
		power: '500 cv',
		photo: 'https://autoconf-production.s3.amazonaws.com/uploads/photo/file/16986513/Copia_de_20240705_ATTRA_MUSTANG_DARK_HORSE___M7Y6037_low_quality.webp',
		category: 'muscle',
		editorial: 'A versão mais radical do novo Mustang S650. O Dark Horse eleva o Coyote 5.0 V8 ao limite com componentes de alta performance: virabrequim forjado, bielas forjadas e maior pressão de óleo.',
		highlights: ['Motor V8 Coyote com internos forjados', 'Versão track-ready de fábrica', 'Design exclusivo Dark Horse'],
		soldYear: 2025,
	},
	{
		id: 'iconic-porsche-cayenne-turbo-gt',
		brand: 'Porsche',
		model: 'Cayenne Turbo GT',
		version: 'Coupé',
		year: 2023,
		color: 'Arctic Grey',
		mileage: '6.200 km',
		engine: 'V8 4.0L biturbo',
		power: '640 cv',
		photo: 'https://autoconf-production.s3.amazonaws.com/uploads/photo/file/15766085/Copia_de_20230814_ATTRA_CAYENNE_TURBO_GT___M7Y6765_low_quality.webp',
		category: 'suv-premium',
		editorial: 'O SUV mais rápido de Nürburgring. O Cayenne Turbo GT é um caso raro de veículo que entrega conforto de limousine na cidade e performance de supercarro na pista, tudo em um pacote de 5 lugares.',
		highlights: ['Recorde de Nürburgring para SUVs', '640 cv com torque vetorial traseiro', 'Suspensão PASM calibrada em Nürburgring'],
		soldYear: 2024,
	},
	{
		id: 'iconic-lamborghini-urus-performante',
		brand: 'Lamborghini',
		model: 'Urus',
		version: 'Performante',
		year: 2024,
		color: 'Nero Noctis',
		mileage: '1.500 km',
		engine: 'V8 4.0L biturbo',
		power: '666 cv',
		photo: 'https://autoconf-production.s3.amazonaws.com/uploads/photo/file/17303893/Copia_de_20240906_ATTRA_URUS_PERFORMANTE_PRETO___M7Y1050_low_quality.webp',
		category: 'suv-premium',
		editorial: 'A versão mais agressiva do Super SUV da Lamborghini. O Urus Performante é 47 kg mais leve que o S e vem com suspensão recalibrada, molas de aço e uma personalidade muito mais esportiva.',
		highlights: ['47 kg mais leve que o Urus S', 'Modos ANIMA com Rally inédito', 'Design com elementos em fibra de carbono'],
		soldYear: 2025,
	},
	{
		id: 'iconic-rolls-royce-ghost',
		brand: 'Rolls-Royce',
		model: 'Ghost',
		version: 'Extended',
		year: 2023,
		color: 'Black Diamond',
		mileage: '3.800 km',
		engine: 'V12 6.75L biturbo',
		power: '571 cv',
		photo: 'https://autoconf-production.s3.amazonaws.com/uploads/photo/file/16101145/Copia_de_20240228_ATTRA_GHOST___M7Y1285_low_quality.webp',
		category: 'luxury',
		editorial: 'O Ghost Extended Wheelbase é a definição de luxo silencioso. Com o motor V12 mais refinado do mundo e isolamento acústico de 100 kg, oferece uma experiência de condução que nenhum outro sedã consegue replicar.',
		highlights: ['Motor V12 biturbo — suavidade inigualável', 'Isolamento acústico de 100 kg', 'Starlight Headliner no teto'],
		soldYear: 2024,
	},
]

const CATEGORY_LABELS: Record<IconicCar['category'], string> = {
	supercar: 'Supercarro',
	luxury: 'Luxo',
	sports: 'Esportivo',
	muscle: 'Muscle Car',
	'suv-premium': 'SUV Premium',
}

export function getCategoryLabel(category: IconicCar['category']): string {
	return CATEGORY_LABELS[category] || category
}
