import type { DualBlogPost, BlogPostType } from '@/types'
import { importedBlogPosts } from './imported-blog-posts'

// Mock data for development - replace with Supabase queries in production
const mockBlogPosts: DualBlogPost[] = [
  // Educativo Posts
  {
    id: '1',
    post_type: 'educativo',
    title: 'O Guia Definitivo de Curadoria de Veículos Premium',
    slug: 'guia-curadoria-veiculos-premium',
    excerpt: 'Descubra como especialistas selecionam os melhores veículos do mercado e o que diferencia uma curadoria de excelência.',
    content: `
      <h2>O que é Curadoria de Veículos?</h2>
      <p>Curadoria de veículos é muito mais do que simplesmente selecionar carros para venda. É um processo meticuloso que envolve análise técnica, verificação de procedência, inspeção de qualidade e avaliação de valor de mercado.</p>
      
      <h3>Os Pilares da Curadoria Premium</h3>
      <p>Na Attra, seguimos um rigoroso protocolo de 200 pontos de inspeção que garante que cada veículo em nosso estoque atende aos mais altos padrões de qualidade.</p>
      
      <h3>Por que a Curadoria é Importante?</h3>
      <p>Ao adquirir um veículo de uma concessionária com curadoria especializada, você tem a garantia de:</p>
      <ul>
        <li>Procedência verificada e documentação completa</li>
        <li>Histórico de manutenções transparente</li>
        <li>Ausência de sinistros ou adulterações</li>
        <li>Preço justo e alinhado ao mercado</li>
      </ul>
      
      <h3>Conclusão</h3>
      <p>Investir em um veículo curado é investir em tranquilidade e segurança. A expertise de profissionais qualificados faz toda a diferença na hora de escolher seu próximo carro.</p>
    `,
    featured_image: '/images/blog/curadoria-cover.jpg',
    featured_image_alt: 'Showroom de veículos premium com especialista realizando inspeção',
    author: {
      name: 'Equipe Attra',
      bio: 'Especialistas em veículos premium há mais de 14 anos',
      avatar: '/images/team/attra-avatar.jpg'
    },
    published_date: '2025-12-15',
    reading_time: '8 min',
    is_published: true,
    educativo: {
      category: 'Curadoria',
      topic: 'Processo de Seleção',
      seo_keyword: 'curadoria de veículos premium'
    },
    seo: {
      meta_title: 'Guia Definitivo de Curadoria de Veículos Premium | Attra Blog',
      meta_description: 'Aprenda como funciona a curadoria de veículos premium e por que ela é essencial na hora de comprar seu próximo carro de luxo.',
      keywords: ['curadoria', 'veículos premium', 'carros de luxo', 'comprar carro']
    }
  },
  {
    id: '2',
    post_type: 'educativo',
    title: 'Mercado de Superesportivos em 2025: Tendências e Oportunidades',
    slug: 'mercado-superesportivos-2025-tendencias',
    excerpt: 'Análise completa do cenário atual do mercado de superesportivos no Brasil e as principais oportunidades para investidores e entusiastas.',
    content: `
      <h2>O Cenário Atual</h2>
      <p>O mercado de superesportivos no Brasil segue em crescimento mesmo diante dos desafios econômicos. A demanda por veículos exclusivos e de alto desempenho continua aquecida.</p>
      
      <h3>Principais Tendências</h3>
      <p>Eletrificação, sustentabilidade e exclusividade são as palavras-chave que definem o futuro dos superesportivos.</p>
      
      <h3>Oportunidades de Investimento</h3>
      <p>Modelos clássicos e edições limitadas têm se mostrado excelentes opções para quem busca preservação de valor.</p>
    `,
    featured_image: '/images/blog/mercado-2025.jpg',
    featured_image_alt: 'Superesportivos em showroom moderno',
    author: {
      name: 'Thiago Martins',
      bio: 'CEO da Attra Veículos e especialista em mercado automotivo',
      avatar: '/images/team/thiago.jpg'
    },
    published_date: '2025-12-20',
    reading_time: '6 min',
    is_published: true,
    educativo: {
      category: 'Mercado',
      topic: 'Tendências e Análises',
      seo_keyword: 'mercado superesportivos brasil'
    },
    seo: {
      meta_title: 'Mercado de Superesportivos 2025: Tendências | Attra Blog',
      meta_description: 'Análise completa do mercado de superesportivos no Brasil em 2025. Tendências, oportunidades e insights para compradores.',
      keywords: ['superesportivos', 'mercado automotivo', 'tendências 2025', 'investimento carros']
    }
  },
  // Car Review Posts
  {
    id: '3',
    post_type: 'car_review',
    title: 'Ferrari 812 GTS: A Perfeição do V12 Conversível',
    slug: 'ferrari-812-gts-review',
    excerpt: 'Análise completa do último conversível V12 naturalmente aspirado da Ferrari. Performance, design e exclusividade em uma só máquina.',
    content: `
      <h2>Introdução</h2>
      <p>A Ferrari 812 GTS representa o ápice da engenharia italiana em conversíveis de alta performance. Com seu icônico motor V12, este é um carro que define uma era.</p>
      
      <h3>Design e Estilo</h3>
      <p>Linhas fluidas que equilibram agressividade e elegância. O teto retrátil de alumínio opera em apenas 14 segundos.</p>
      
      <h3>Performance em Números</h3>
      <p>Com 800cv e um rugido inconfundível, a 812 GTS acelera de 0 a 100 km/h em apenas 2,9 segundos.</p>
      
      <h3>Experiência de Condução</h3>
      <p>Dirigir uma 812 GTS é uma experiência sensorial completa. O som do V12, a resposta do acelerador e a precisão da direção criam uma conexão única entre piloto e máquina.</p>
      
      <h3>Avaliação da Attra</h3>
      <p>Um dos últimos representantes de uma espécie em extinção: os V12 naturalmente aspirados. Um investimento não apenas em performance, mas em história automotiva.</p>
    `,
    featured_image: '/images/blog/ferrari-812-gts-cover.jpg',
    featured_image_alt: 'Ferrari 812 GTS vermelha em estrada panorâmica',
    author: {
      name: 'Carlos Eduardo',
      bio: 'Consultor sênior de veículos exóticos',
      avatar: '/images/team/carlos.jpg'
    },
    published_date: '2025-12-28',
    reading_time: '10 min',
    is_published: true,
    car_review: {
      brand: 'Ferrari',
      model: '812 GTS',
      year: 2024,
      specs: {
        engine: '6.5L V12 Naturalmente Aspirado',
        power: '800 cv @ 8.500 rpm',
        torque: '718 Nm @ 7.000 rpm',
        acceleration: '2,9s (0-100 km/h)',
        top_speed: '340 km/h',
        transmission: 'Automática 7 marchas DCT'
      },
      gallery_images: [
        '/images/vehicles/ferrari-812-gts-1.jpg',
        '/images/vehicles/ferrari-812-gts-2.jpg',
        '/images/vehicles/ferrari-812-gts-3.jpg'
      ],
      availability: {
        in_stock: true,
        price: 'R$ 4.890.000',
        stock_url: '/estoque?marca=ferrari&modelo=812'
      }
    },
    seo: {
      meta_title: 'Ferrari 812 GTS Review: O Último V12 Conversível | Attra',
      meta_description: 'Review completo da Ferrari 812 GTS. Specs, performance, design e disponibilidade. Descubra por que este V12 é uma lenda.',
      keywords: ['Ferrari 812 GTS', 'review Ferrari', 'V12 conversível', 'superesportivo']
    }
  },
  {
    id: '4',
    post_type: 'car_review',
    title: 'Porsche 911 GT3 RS: O Limite da Engenharia de Rua',
    slug: 'porsche-911-gt3-rs-review',
    excerpt: 'Exploramos o 911 GT3 RS, a versão mais extrema do icônico esportivo alemão. Um carro de corrida homologado para as ruas.',
    content: `
      <h2>O DNA de Corrida</h2>
      <p>O 911 GT3 RS é a prova de que a Porsche leva a sério a transferência de tecnologia das pistas para as ruas.</p>

      <h3>Aerodinâmica Ativa</h3>
      <p>O imenso spoiler traseiro e os elementos aerodinâmicos ativos geram mais de 400kg de downforce a 200 km/h.</p>

      <h3>Motor Atmosférico</h3>
      <p>O 4.0 boxer de seis cilindros entrega 525cv e gira até 9.000 rpm - um motor que emociona a cada rotação.</p>
    `,
    featured_image: '/images/blog/porsche-gt3-rs-cover.jpg',
    featured_image_alt: 'Porsche 911 GT3 RS branco em pista de corrida',
    author: {
      name: 'Carlos Eduardo',
      bio: 'Consultor sênior de veículos exóticos',
      avatar: '/images/team/carlos.jpg'
    },
    published_date: '2025-12-22',
    reading_time: '9 min',
    is_published: true,
    car_review: {
      brand: 'Porsche',
      model: '911 GT3 RS',
      year: 2024,
      specs: {
        engine: '4.0L Boxer 6 Cilindros',
        power: '525 cv @ 8.500 rpm',
        torque: '465 Nm @ 6.300 rpm',
        acceleration: '3,2s (0-100 km/h)',
        top_speed: '296 km/h',
        transmission: 'PDK 7 marchas'
      },
      gallery_images: [
        '/images/vehicles/porsche-gt3-rs-1.jpg',
        '/images/vehicles/porsche-gt3-rs-2.jpg'
      ],
      availability: {
        in_stock: true,
        price: 'R$ 2.890.000',
        stock_url: '/estoque?marca=porsche&modelo=911'
      }
    },
    seo: {
      meta_title: 'Porsche 911 GT3 RS Review | Attra Veículos',
      meta_description: 'Review detalhado do Porsche 911 GT3 RS. Performance, specs e disponibilidade no Brasil.',
      keywords: ['Porsche 911 GT3 RS', 'review Porsche', 'esportivo alemão']
    }
  },
  {
    id: '5',
    post_type: 'educativo',
    title: '5 Dicas Essenciais para Comprar seu Primeiro Superesportivo',
    slug: 'dicas-comprar-primeiro-superesportivo',
    excerpt: 'Um guia prático para quem está prestes a realizar o sonho de ter um superesportivo. Evite erros comuns e faça a escolha certa.',
    content: `
      <h2>A Jornada do Primeiro Superesportivo</h2>
      <p>Comprar seu primeiro superesportivo é uma experiência única. Aqui estão 5 dicas essenciais para fazer a escolha certa.</p>

      <h3>1. Defina seu Orçamento Total</h3>
      <p>Lembre-se que além do valor de compra, existem custos de manutenção, seguro e armazenamento adequado.</p>

      <h3>2. Pesquise o Histórico</h3>
      <p>Veículos premium exigem histórico impecável. Fuja de ofertas muito abaixo do mercado.</p>

      <h3>3. Teste Antes de Comprar</h3>
      <p>Agende um test drive. A experiência de condução é fundamental para sua decisão.</p>

      <h3>4. Escolha uma Concessionária de Confiança</h3>
      <p>Opte por dealers especializados com reputação sólida e pós-venda estruturado.</p>

      <h3>5. Considere a Revenda</h3>
      <p>Alguns modelos preservam melhor o valor. Pesquise antes de decidir.</p>
    `,
    featured_image: '/images/blog/dicas-compra.jpg',
    featured_image_alt: 'Cliente analisando superesportivo em showroom',
    author: {
      name: 'Equipe Attra',
      bio: 'Especialistas em veículos premium há mais de 14 anos'
    },
    published_date: '2025-12-10',
    reading_time: '5 min',
    is_published: true,
    educativo: {
      category: 'Dicas',
      topic: 'Guia de Compra',
      seo_keyword: 'comprar superesportivo'
    },
    seo: {
      meta_title: '5 Dicas para Comprar seu Primeiro Superesportivo | Attra',
      meta_description: 'Guia prático com 5 dicas essenciais para quem vai comprar o primeiro superesportivo. Evite erros e faça a escolha certa.',
      keywords: ['comprar superesportivo', 'dicas carros luxo', 'primeiro superesportivo']
    }
  }
]

// ===========================================
// API FUNCTIONS
// ===========================================

// Combine mock posts with imported WordPress posts
const allBlogPosts: DualBlogPost[] = [...mockBlogPosts, ...importedBlogPosts]

interface GetBlogPostsOptions {
  type?: BlogPostType | 'all'
  limit?: number
  category?: string
}

export async function getBlogPosts(options: GetBlogPostsOptions = {}): Promise<DualBlogPost[]> {
  const { type = 'all', limit, category } = options

  // Use combined posts (mock + imported from WordPress)
  let posts = allBlogPosts.filter(p => p.is_published)

  if (type !== 'all') {
    posts = posts.filter(p => p.post_type === type)
  }

  if (category && type === 'educativo') {
    posts = posts.filter(p => p.educativo?.category === category)
  }

  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())

  if (limit) {
    posts = posts.slice(0, limit)
  }

  return posts
}

export async function getBlogPost(slug: string): Promise<DualBlogPost | null> {
  // Use combined posts (mock + imported from WordPress)
  const post = allBlogPosts.find(p => p.slug === slug && p.is_published)
  return post || null
}

export async function getRelatedPosts(currentSlug: string, postType: BlogPostType, limit = 3): Promise<DualBlogPost[]> {
  const posts = await getBlogPosts({ type: postType, limit: limit + 1 })
  return posts.filter(p => p.slug !== currentSlug).slice(0, limit)
}

export function getEducativoCategories(): string[] {
  return ['Curadoria', 'Mercado', 'Dicas', 'Lifestyle']
}

