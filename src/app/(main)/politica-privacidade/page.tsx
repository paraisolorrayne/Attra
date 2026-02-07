import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Shield, Lock, Eye, FileText, UserCheck, Bell, Trash2, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade da Attra Veículos. Saiba como coletamos, usamos e protegemos seus dados pessoais em conformidade com a LGPD.',
}

const sections = [
  {
    icon: FileText,
    title: '1. Introdução',
    content: `A Attra Veículos, inscrita no CNPJ sob nº XX.XXX.XXX/0001-XX, com sede em Uberlândia - MG, está comprometida com a proteção da privacidade e dos dados pessoais de seus clientes, visitantes e usuários de seu site.

Esta Política de Privacidade foi elaborada em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e tem como objetivo informar de forma clara e transparente como tratamos suas informações pessoais.`
  },
  {
    icon: Eye,
    title: '2. Dados Coletados',
    content: `Podemos coletar os seguintes tipos de dados pessoais:

• **Dados de identificação**: Nome completo, CPF, RG, data de nascimento
• **Dados de contato**: E-mail, telefone, endereço
• **Dados de navegação**: Endereço IP, cookies, páginas visitadas, tempo de permanência
• **Dados financeiros**: Informações necessárias para análise de crédito (quando aplicável)
• **Dados do veículo**: Informações sobre veículos de interesse ou à venda

A coleta ocorre quando você preenche formulários em nosso site, entra em contato conosco via WhatsApp, telefone ou e-mail, ou visita nosso showroom.`
  },
  {
    icon: Lock,
    title: '3. Finalidade do Tratamento',
    content: `Utilizamos seus dados pessoais para as seguintes finalidades:

• Atendimento de solicitações e dúvidas sobre veículos
• Envio de propostas comerciais e simulações de financiamento
• Comunicação sobre ofertas, promoções e novidades (com seu consentimento)
• Análise de crédito junto a instituições financeiras parceiras
• Processamento de consignação e venda de veículos
• Cumprimento de obrigações legais e regulatórias
• Melhoria contínua de nossos serviços e experiência do usuário`
  },
  {
    icon: Shield,
    title: '4. Compartilhamento de Dados',
    content: `Seus dados podem ser compartilhados com:

• **Instituições financeiras**: Para análise e aprovação de crédito
• **Despachantes e órgãos de trânsito**: Para transferência de veículos
• **Seguradoras**: Quando solicitado pelo cliente
• **Prestadores de serviços**: Empresas de tecnologia que nos auxiliam (hospedagem, e-mail marketing, analytics)

Não vendemos ou comercializamos seus dados pessoais para terceiros.`
  },
  {
    icon: UserCheck,
    title: '5. Seus Direitos (LGPD)',
    content: `De acordo com a LGPD, você tem os seguintes direitos:

• **Confirmação e acesso**: Saber se tratamos seus dados e acessá-los
• **Correção**: Solicitar a correção de dados incompletos ou desatualizados
• **Anonimização ou bloqueio**: Solicitar a anonimização de dados desnecessários
• **Portabilidade**: Receber seus dados em formato estruturado
• **Eliminação**: Solicitar a exclusão de dados tratados com seu consentimento
• **Revogação**: Revogar consentimentos previamente fornecidos
• **Oposição**: Opor-se ao tratamento quando em desacordo com a lei`
  },
  {
    icon: Bell,
    title: '6. Cookies e Tecnologias',
    content: `Utilizamos cookies e tecnologias similares para:

• Melhorar a experiência de navegação
• Lembrar suas preferências
• Analisar como você usa nosso site (Google Analytics)
• Personalizar conteúdo e anúncios

Você pode gerenciar ou desativar cookies nas configurações do seu navegador. Isso pode afetar algumas funcionalidades do site.`
  },
  {
    icon: Trash2,
    title: '7. Retenção de Dados',
    content: `Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política, respeitando os prazos legais aplicáveis.

Dados de clientes que realizaram transações são mantidos pelo período exigido pela legislação fiscal e consumerista. Dados de marketing são mantidos enquanto você não solicitar a exclusão.`
  },
  {
    icon: Mail,
    title: '8. Contato e DPO',
    content: `Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:

• **E-mail**: privacidade@attraveiculos.com.br
• **Telefone**: (34) 3236-4747
• **Endereço**: Av. Rondon Pacheco, Uberlândia - MG

Esta política pode ser atualizada periodicamente. Recomendamos sua leitura regular.

**Última atualização**: Fevereiro de 2026`
  },
]

export default function PoliticaPrivacidadePage() {
  return (
    <>
      <section className="pt-28 pb-12 bg-gradient-to-b from-background-soft to-background">
        <Container>
          <Breadcrumb items={[{ label: 'Política de Privacidade', href: '/politica-privacidade' }]} afterHero />
          <div className="max-w-3xl mx-auto text-center mt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">LGPD Compliant</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">Política de Privacidade</h1>
            <p className="text-lg text-foreground-secondary">
              Saiba como a Attra Veículos coleta, usa e protege seus dados pessoais.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 bg-background">
        <Container>
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="bg-background-card border border-border rounded-2xl p-6 lg:p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">{section.title}</h2>
                    <div className="text-foreground-secondary leading-relaxed whitespace-pre-line prose prose-sm max-w-none">
                      {section.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}

