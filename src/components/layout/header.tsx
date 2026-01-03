'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Menu, X } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'
import { EDITORIAL_SECTION } from '@/lib/constants'

// Minimal navigation for premium boutique feel
const navigation = [
  { name: 'Estoque', href: '/estoque' },
  { name: 'Jornada Attra', href: '/jornada' },
  { name: 'Serviços', href: '/servicos' },
  { name: EDITORIAL_SECTION.menuLabel, href: EDITORIAL_SECTION.route },
  { name: 'Contato', href: '/contato' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Determine which logo to show based on theme
  // Always show white logo since header now has dark background
  const showWhiteLogo = true

  // Check if it's light mode for scrolled state styling
  const isLightMode = mounted && resolvedTheme === 'light'

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          // Always apply semi-transparent dark background with blur for maximum legibility
          isScrolled
            ? isLightMode
              ? 'bg-white/95 backdrop-blur-xl border-b border-border shadow-lg'
              : 'bg-[rgba(5,5,5,0.95)] backdrop-blur-xl border-b border-white/10 shadow-lg'
            : 'bg-[rgba(10,10,10,0.65)] backdrop-blur-[12px]'
        )}
        style={{
          // Subtle shadow for separation from content
          boxShadow: isScrolled
            ? undefined
            : '0 4px 30px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Container>
          <nav className="flex items-center justify-between h-20 py-4">
            {/* Logo - always white when not scrolled (dark header), theme-aware when scrolled */}
            <Link href="/" className="flex items-center group relative h-10">
              {/* White logo - visible when not scrolled OR scrolled in dark mode */}
              <Image
                src="/images/logo-white.png"
                alt="Attra Veículos"
                width={140}
                height={40}
                className={cn(
                  'h-10 w-auto object-contain transition-opacity duration-300',
                  (!isScrolled || !isLightMode) ? 'opacity-100' : 'opacity-0'
                )}
                priority
              />
              {/* Black logo - only visible when scrolled AND in light theme */}
              <Image
                src="/images/logo-black.png"
                alt="Attra Veículos"
                width={140}
                height={40}
                className={cn(
                  'absolute left-0 h-10 w-auto object-contain transition-opacity duration-300',
                  isScrolled && isLightMode ? 'opacity-100' : 'opacity-0'
                )}
                priority
              />
            </Link>

            {/* Desktop navigation - improved typography weight and contrast */}
            <div className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative text-sm font-semibold tracking-wide uppercase transition-all duration-300 py-2',
                    // When not scrolled: always white text for dark header
                    // When scrolled: theme-aware colors
                    isScrolled
                      ? isLightMode
                        ? 'text-gray-700 hover:text-primary'
                        : 'text-white/90 hover:text-white'
                      : 'text-white/90 hover:text-white',
                    activeSection === item.href && 'text-primary'
                  )}
                  style={{
                    // Text shadow for extra legibility over images when not scrolled
                    textShadow: !isScrolled
                      ? '0 1px 3px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
                      : 'none'
                  }}
                >
                  {item.name}
                  {/* Underline indicator on hover */}
                  <span className={cn(
                    'absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 origin-left',
                    'scale-x-0 group-hover:scale-x-100',
                    activeSection === item.href ? 'scale-x-100' : 'hover:scale-x-100'
                  )} />
                </Link>
              ))}
            </div>

            {/* Actions - theme toggle with improved visibility */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle
                className={cn(
                  'transition-all duration-300',
                  isScrolled
                    ? isLightMode
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                )}
              />
            </div>

            {/* Mobile menu button - enhanced visibility and touch target */}
            <div className="flex lg:hidden items-center gap-3">
              <ThemeToggle
                className={cn(
                  'transition-all duration-300 w-11 h-11 flex items-center justify-center',
                  isScrolled
                    ? isLightMode
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                      : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                )}
              />
              <button
                type="button"
                className={cn(
                  'w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300',
                  isScrolled
                    ? isLightMode
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 shadow-sm'
                      : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/25 shadow-lg'
                )}
                style={{
                  // Add drop shadow for extra visibility over images
                  filter: !isScrolled ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
                }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {mobileMenuOpen ? (
                  <X className="w-7 h-7" strokeWidth={2.5} />
                ) : (
                  <Menu className="w-7 h-7" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </nav>
        </Container>

        {/* Mobile navigation - full screen overlay with solid background */}
        <div
          className={cn(
            'lg:hidden fixed inset-0 top-20 z-40 transition-all duration-300',
            mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          )}
          style={{
            // Use inline style to guarantee solid background color
            backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <Container className="relative py-8">
            <div className="flex flex-col gap-6">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-2xl font-semibold transition-all duration-300 py-3 border-b',
                    isLightMode
                      ? 'text-gray-900 hover:text-primary border-gray-200'
                      : 'text-white hover:text-primary border-white/10',
                    mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  )}
                  style={{ transitionDelay: `${index * 50}ms` }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </Container>
        </div>
      </header>
    </>
  )
}

