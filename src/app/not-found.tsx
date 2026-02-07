import Link from 'next/link'
import { Home, Car, Phone, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Number with car theme */}
        <div className="relative mb-8">
          <span className="text-[150px] sm:text-[200px] font-bold text-foreground/5 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/10 p-6 rounded-full">
              <Car className="w-16 h-16 sm:w-24 sm:h-24 text-primary" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Página não encontrada
        </h1>
        <p className="text-lg text-foreground-secondary mb-8 max-w-md mx-auto">
          Parece que você pegou uma rota errada. A página que você está procurando não existe ou foi movida.
        </p>

        {/* Suggested Pages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
          <Link
            href="/"
            className="flex items-center gap-3 p-4 bg-background-card border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Página Inicial</p>
              <p className="text-xs text-foreground-secondary">Voltar ao início</p>
            </div>
          </Link>

          <Link
            href="/estoque"
            className="flex items-center gap-3 p-4 bg-background-card border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Estoque</p>
              <p className="text-xs text-foreground-secondary">Ver veículos</p>
            </div>
          </Link>

          <Link
            href="/contato"
            className="flex items-center gap-3 p-4 bg-background-card border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Contato</p>
              <p className="text-xs text-foreground-secondary">Fale conosco</p>
            </div>
          </Link>

          <Link
            href="/blog"
            className="flex items-center gap-3 p-4 bg-background-card border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Blog</p>
              <p className="text-xs text-foreground-secondary">Artigos e reviews</p>
            </div>
          </Link>
        </div>

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>

        {/* Footer text */}
        <p className="mt-8 text-sm text-foreground-secondary">
          Se você acredita que isso é um erro, entre em{' '}
          <Link href="/contato" className="text-primary hover:underline">
            contato conosco
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

