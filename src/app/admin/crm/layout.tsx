'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  UserCheck,
  TrendingUp,
  Receipt,
  Menu,
  X,
  LogOut,
  Volume2,
  ChevronRight,
  Home,
  Settings,
  Megaphone
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: string
}

const navItems: NavItem[] = [
  { name: 'Leads', href: '/admin/crm/leads', icon: Users },
  { name: 'Clientes', href: '/admin/crm/clientes', icon: UserCheck },
  { name: 'Cobranças', href: '/admin/crm/cobrancas', icon: Receipt },
  { name: 'Insights', href: '/admin/crm/insights', icon: TrendingUp },
]

const otherAdminItems: NavItem[] = [
  { name: 'Sons de Motor', href: '/admin/engine-sounds', icon: Volume2 },
  { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
]

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-background-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/admin/crm/leads" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Attra</span>
                <span className="text-primary ml-1 text-sm">CRM</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-foreground-secondary hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-3">
              CRM
            </p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-foreground-secondary hover:bg-background-soft hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={cn(
                  'w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity',
                  isActive(item.href) && 'opacity-100'
                )} />
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-border">
              <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-3">
                Outros
              </p>
              {otherAdminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-foreground-secondary hover:bg-background-soft hover:text-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground-secondary hover:bg-background-soft hover:text-foreground transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Ver Site</span>
            </Link>
            <div className="flex items-center justify-between px-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-3 py-2 text-foreground-secondary hover:text-primary transition-colors disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-foreground-secondary hover:text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-foreground">CRM</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

