'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, MessageCircle, ShieldCheck, Loader2 } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SectionKicker, SectionHeading } from '@/components/ui/brand'
import { getWhatsAppUrl } from '@/lib/constants'
import { useAnalytics } from '@/hooks/use-analytics'
import { useVisitorTracking } from '@/components/providers/visitor-tracking-provider'

const schema = z.object({
  name: z.string().min(3, 'Informe seu nome'),
  phone: z.string().min(10, 'WhatsApp inválido'),
  vehicle: z.string().min(2, 'Conte o que você procura'),
  budget: z.string().min(1, 'Selecione uma faixa'),
})

type FormData = z.infer<typeof schema>

const budgetOptions = [
  { value: 'ate-300k',   label: 'Até R$ 300 mil' },
  { value: '300-500k',   label: 'R$ 300 a 500 mil' },
  { value: '500k-1m',    label: 'R$ 500 mil a 1 milhão' },
  { value: '1m-2m',      label: 'R$ 1 a 2 milhões' },
  { value: 'acima-2m',   label: 'Acima de R$ 2 milhões' },
  { value: 'indefinida', label: 'Prefiro conversar' },
]

const whatsappMessage =
  'Olá, Attra. Tenho interesse em um atendimento consultivo para um veículo premium.'

export function LeadCaptureSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { trackFormSubmission } = useAnalytics()
  const { getVisitorContext, identifyVisitor } = useVisitorTracking()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const visitorContext = getVisitorContext()
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          model: data.vehicle,
          budgetMax: data.budget,
          subject: 'Captação Home — Consultoria Attra',
          formType: 'lead_capture_home',
          sourcePage: '/',
          traffic: visitorContext.traffic,
        }),
      })

      trackFormSubmission(
        {
          formName: 'lead_capture_home',
          formLocation: '/',
          vehicleName: data.vehicle,
        },
        visitorContext,
      )

      identifyVisitor({ phone: data.phone, name: data.name })

      setIsSuccess(true)
      reset()
    } catch (error) {
      console.error('[LeadCapture] submit error', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="captacao"
      className="py-16 md:py-20 bg-gradient-to-br from-background-soft via-background to-background-soft"
    >
      <Container size="xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          {/* Narrative */}
          <div>
            <SectionKicker className="mb-4">Consultoria Attra</SectionKicker>
            <SectionHeading as="h2" size="lg" className="mb-5">
              Nos conte o que você procura. Nós encontramos.
            </SectionHeading>
            <p className="text-foreground-secondary text-base md:text-lg leading-relaxed mb-6 max-w-lg">
              Busca discreta em rede nacional de procedência. Sem pressão e sem
              vitrine — só o carro certo, no momento certo.
            </p>

            <ul className="space-y-2.5 text-sm text-foreground-secondary max-w-md">
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Atendimento confidencial conduzido por um consultor dedicado.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Rede nacional de procedência — fora do estoque visível.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Retorno rápido, sem compromisso de compra.</span>
              </li>
            </ul>
          </div>

          {/* Form card */}
          <div className="relative rounded-2xl border border-border bg-background-card shadow-xl shadow-black/5 p-6 md:p-8">
            {isSuccess ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Recebido. Um consultor entrará em contato.
                </h3>
                <p className="text-foreground-secondary text-sm mb-6">
                  Você também pode seguir a conversa agora pelo WhatsApp.
                </p>
                <a
                  href={getWhatsAppUrl(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Continuar no WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="block mx-auto mt-5 text-primary text-sm hover:underline"
                >
                  Enviar nova solicitação
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1.5">
                    Nome
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="Como devemos te chamar?"
                    error={errors.name?.message}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1.5">
                    WhatsApp
                  </label>
                  <Input
                    {...register('phone')}
                    placeholder="(00) 00000-0000"
                    error={errors.phone?.message}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1.5">
                    Veículo desejado
                  </label>
                  <Input
                    {...register('vehicle')}
                    placeholder="Ex.: Porsche 911, Range Rover Autobiography..."
                    error={errors.vehicle?.message}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1.5">
                    Faixa de valor
                  </label>
                  <Select
                    {...register('budget')}
                    options={budgetOptions}
                    placeholder="Selecione uma faixa"
                  />
                  {errors.budget && (
                    <p className="mt-1 text-sm text-primary">{errors.budget.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-base py-4 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      Quero um atendimento consultivo
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-xs text-foreground-secondary uppercase tracking-wider">
                    ou
                  </span>
                  <div className="flex-1 h-px bg-border/60" />
                </div>

                <a
                  href={getWhatsAppUrl(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 border border-border hover:border-foreground/30 text-foreground font-medium text-sm py-3 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Fale agora pelo WhatsApp
                </a>

                <p className="text-[11px] text-center text-foreground-secondary pt-1">
                  Confidencial · Rede nacional · Sem compromisso
                </p>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
