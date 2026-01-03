import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { RacingProgress } from '@/components/ui/racing-progress'
import { OrganizationSchema, WebsiteSchema } from '@/components/seo'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
      <RacingProgress />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 page-enter">{children}</main>
        <Footer />
      </div>
      <WhatsAppButton sourcePage="global" />
    </>
  )
}

