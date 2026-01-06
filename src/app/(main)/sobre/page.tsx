import { Metadata } from 'next'
import Link from 'next/link'
import { Award, MapPin, Users, Shield, Building2, Globe, Car, ArrowRight, Star, CheckCircle, Handshake, Target, Heart, MessageCircle } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { getWhatsAppUrl } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Sobre a Attra Veículos | Loja de Veículos Premium em Uberlândia',
  description: 'Conheça a Attra Veículos, referência em veículos nacionais, importados, seminovos premium e supercarros em Uberlândia/MG. Atendimento nacional para colecionadores de todo o Brasil.',
  keywords: ['Attra Veículos Uberlândia', 'loja de veículos premium', 'supercarros Minas Gerais', 'loja de carros de luxo', 'referência em veículos premium'],
}

// Schema markup para SEO
function SobreSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: 'Attra Veículos',
    description: 'Loja de veículos premium em Uberlândia, referência em supercarros, importados e seminovos de alto padrão com atendimento nacional.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Rondon Pacheco',
      addressLocality: 'Uberlândia',
      addressRegion: 'MG',
      postalCode: '38400-000',
      addressCountry: 'BR',
    },
    telephone: '+55-34-3256-3100',
    url: 'https://attraveiculos.com.br',
    foundingDate: '2010',
    areaServed: { '@type': 'Country', name: 'Brasil' },
    priceRange: '$$$$$',
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

const timeline = [
  {
    year: 2010,
    title: 'Fundação em Uberlândia',
    description: 'A Attra Veículos nasce em Uberlândia com a missão de oferecer veículos premium com atendimento diferenciado. Desde o início, o foco foi a curadoria rigorosa e o relacionamento duradouro com cada cliente.',
  },
  {
    year: 2015,
    title: 'Primeiro Ferrari Comercializado',
    description: 'Marco histórico com a venda do primeiro superesportivo italiano. Este momento consolidou a Attra como referência para colecionadores de supercarros no Brasil.',
  },
  {
    year: 2018,
    title: 'Inauguração do Showroom de 5.000m²',
    description: 'Expansão significativa com a inauguração do novo showroom climatizado. Estrutura projetada para exibir cada veículo como uma obra de arte, com iluminação profissional e ambiente exclusivo.',
  },
  {
    year: 2023,
    title: 'Marco de 500+ Supercarros Vendidos',
    description: 'Celebração de mais de 500 supercarros comercializados para colecionadores de todo o Brasil. Reconhecimento da confiança depositada por clientes de todos os estados.',
  },
  {
    year: 2024,
    title: 'Maior Dealer do Triângulo Mineiro',
    description: 'Consolidação como o maior dealer de veículos premium do Triângulo Mineiro, com atendimento nacional e presença digital fortalecida para atender colecionadores de qualquer cidade do Brasil.',
  },
]

const commitments = [
  {
    icon: Shield,
    title: 'Transparência Total',
    description: 'Cada veículo possui histórico completo, documentação verificada e laudo técnico detalhado. Não há surpresas - você sabe exatamente o que está comprando.',
  },
  {
    icon: Target,
    title: 'Curadoria Rigorosa',
    description: 'Apenas veículos que atendem aos nossos rígidos padrões de qualidade entram no showroom. Inspeção de 200 itens, verificação de procedência e análise de histórico.',
  },
  {
    icon: Shield,
    title: 'Segurança Garantida',
    description: 'Transações seguras, documentação completa e logística com seguro premium. Seu investimento está protegido do início ao fim da negociação.',
  },
  {
    icon: Handshake,
    title: 'Relacionamento Duradouro',
    description: 'Não vendemos apenas veículos, construímos relacionamentos. Muitos dos nossos clientes retornam para novas aquisições e nos indicam para amigos e parceiros.',
  },
]

const differentials = [
  { icon: Award, title: 'Referência em MG', description: 'Reconhecidos como a maior loja de veículos premium de Minas Gerais, com atendimento que se estende para todo o Brasil.' },
  { icon: Globe, title: 'Atendimento Nacional', description: 'Enviamos para todo o Brasil com logística especializada, seguro premium e rastreamento em tempo real.' },
  { icon: Shield, title: 'Procedência Verificada', description: 'Todos os veículos passam por rigorosa inspeção de 200 itens e verificação completa de histórico.' },
  { icon: Users, title: 'Equipe Especializada', description: 'Consultores especialistas em cada marca para atendimento consultivo e personalizado.' },
  { icon: Car, title: '+500 Veículos/Ano', description: 'Mais de 500 veículos comercializados anualmente para colecionadores de todo o Brasil.' },
  { icon: Building2, title: '5.000m² de Estrutura', description: 'Showroom climatizado com iluminação profissional e ambiente exclusivo para apreciação.' },
]

export default function SobrePage() {
  return (
    <>
      <SobreSchema />

      {/* Hero - Sobre a Attra Veículos */}
      <section className="relative pt-28 pb-20 lg:pt-32 lg:pb-28 bg-gradient-to-br from-background via-background-soft to-background overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>
        <Container className="relative z-10 mb-8">
          <Breadcrumb items={[{ label: 'Sobre a Attra', href: '/sobre' }]} afterHero />
        </Container>
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Referência em Veículos Premium</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Sobre a <span className="text-metallic text-metallic-animate">Attra Veículos</span>
            </h1>
            <p className="text-lg lg:text-xl text-foreground-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
              Somos uma loja de veículos premium em Uberlândia, referência em <strong className="text-foreground">veículos nacionais, importados, seminovos premium e supercarros</strong>.
              Com atendimento nacional, levamos os melhores veículos para colecionadores de todo o Brasil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/estoque">
                  <Car className="w-5 h-5 mr-2" />Conhecer Nosso Estoque
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href={getWhatsAppUrl('Olá! Gostaria de falar com um especialista da Attra.')} target="_blank">
                  <MessageCircle className="w-5 h-5 mr-2" />Falar com Especialista
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="text-4xl lg:text-5xl font-bold">15+</p>
              <p className="text-white/80">Anos de Mercado</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold">500+</p>
              <p className="text-white/80">Veículos/Ano</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold">5.000m²</p>
              <p className="text-white/80">de Showroom</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold">27</p>
              <p className="text-white/80">Estados Atendidos</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Quem Somos */}
      <section className="py-16 lg:py-24 bg-background">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Quem Somos</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Quem é a Attra Veículos
              </h2>
              <div className="space-y-4 text-lg text-foreground-secondary leading-relaxed">
                <p>
                  A <strong className="text-foreground">Attra Veículos</strong> é uma loja de veículos premium em Uberlândia,
                  especializada em supercarros, importados e seminovos de alto padrão. Nossa missão é oferecer
                  uma experiência de compra diferenciada para colecionadores e entusiastas automotivos.
                </p>
                <p>
                  Com foco em <strong className="text-foreground">atendimento consultivo</strong>, entendemos que cada cliente
                  possui necessidades únicas. Por isso, oferecemos curadoria personalizada, buscando exatamente
                  o veículo que atende suas expectativas - seja um Porsche para uso diário ou um Ferrari para sua coleção.
                </p>
                <p>
                  Nosso <strong className="text-foreground">atendimento nacional</strong> permite que colecionadores de qualquer
                  cidade do Brasil tenham acesso aos melhores veículos premium, com toda a comodidade e segurança
                  da logística especializada.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Veículos Nacionais', icon: Car },
                { label: 'Importados', icon: Globe },
                { label: 'Seminovos Premium', icon: Award },
                { label: 'Supercarros', icon: Star },
              ].map((item) => (
                <div key={item.label} className="bg-background-card border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-all">
                  <item.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                  <p className="font-semibold text-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Nossa Trajetória */}
      <section className="py-16 lg:py-24 bg-background-soft">
        <Container>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">História</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Nossa Trajetória</h2>
            <p className="text-foreground-secondary max-w-2xl mx-auto">
              Uma história de crescimento, excelência e compromisso com colecionadores de todo o Brasil.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />
              {timeline.map((item, index) => (
                <div key={item.year} className={`relative flex items-start gap-4 mb-10 ${index % 2 === 0 ? 'md:flex-row-reverse md:text-right' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                    {item.year.toString().slice(-2)}
                  </div>
                  <div className={`flex-1 bg-background border border-border rounded-xl p-6 ml-4 md:ml-0 ${index % 2 === 0 ? 'md:mr-16' : 'md:ml-16'}`}>
                    <span className="text-primary font-bold text-lg">{item.year}</span>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-foreground-secondary leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Nossa Estrutura */}
      <section className="py-16 lg:py-24 bg-background">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-background-card border border-border rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">Destaques da Estrutura</h3>
                <ul className="space-y-4">
                  {[
                    'Showroom climatizado de 5.000m² em Uberlândia',
                    'Iluminação profissional para apreciação de cada detalhe',
                    'Ambiente exclusivo para negociação com privacidade',
                    'Localização estratégica com fácil acesso',
                    'Estacionamento privativo para clientes',
                    'Equipe especializada em cada marca premium',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-foreground-secondary">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Infraestrutura</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Nossa Estrutura
              </h2>
              <div className="space-y-4 text-lg text-foreground-secondary leading-relaxed">
                <p>
                  A Attra Veículos conta com um <strong className="text-foreground">showroom de 5.000m² em Uberlândia</strong>,
                  projetado para exibir cada veículo como uma obra de arte. Nossa estrutura foi pensada para proporcionar
                  a melhor experiência em compra de veículos premium.
                </p>
                <p>
                  Localizada em posição estratégica em Minas Gerais, oferecemos <strong className="text-foreground">atendimento nacional</strong> com
                  logística especializada para entrega em qualquer cidade do Brasil. Colecionadores de São Paulo, Rio de Janeiro,
                  Brasília e todas as capitais confiam na Attra para suas aquisições.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Nosso Compromisso */}
      <section className="py-16 lg:py-24 bg-background-soft">
        <Container>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Valores</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Nosso Compromisso</h2>
            <p className="text-foreground-secondary max-w-2xl mx-auto">
              Os valores que guiam nosso atendimento e relacionamento com cada colecionador.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {commitments.map((item) => (
              <div key={item.title} className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-foreground-secondary leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Diferenciais */}
      <section className="py-16 lg:py-24 bg-background">
        <Container>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Diferenciais</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Por que Escolher a Attra</h2>
            <p className="text-foreground-secondary max-w-2xl mx-auto">
              Os motivos que fazem da Attra Veículos a escolha de colecionadores em todo o Brasil.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentials.map((item) => (
              <div key={item.title} className="bg-background-card border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-all">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-foreground-secondary leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/90">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <MapPin className="w-12 h-12 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Visite Nosso Showroom
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Conheça de perto nossa estrutura de 5.000m² em Uberlândia e encontre o veículo dos seus sonhos.
              Atendemos colecionadores de todo o Brasil com a mesma excelência.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 font-semibold">
                <Link href={getWhatsAppUrl('Olá! Gostaria de agendar uma visita ao showroom da Attra.')} target="_blank">
                  <MessageCircle className="w-5 h-5 mr-2" />Agendar Visita
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                <Link href="/estoque">
                  Ver Estoque Completo <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

