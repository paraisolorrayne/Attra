# Guia de Customização da Homepage - Para Designer

## 1. Cores e Estilos

### Variáveis CSS Base
Localizadas em `src/app/globals.css` ou arquivo de tema do Tailwind.

```css
/* Cores Primárias */
--primary: #9a1c1c        /* Vermelho Attra */
--primary-hover: #7a1414
--primary-light: #c43d3d

/* Text Colors */
--foreground: #0a0a0a
--foreground-secondary: #666666

/* Backgrounds */
--background: #ffffff
--background-soft: #f8f8f8
--background-card: #fafafa

/* Borders */
--border: #e0e0e0
```

### Customizar Cores por Seção

Cada novo componente usa Tailwind, então customize assim:

**Exemplo - ProofOfSolidity:**
- Icons: `text-primary` → Altere para outra cor
- Cards bg: `bg-background-card` → Altere o CSS original
- Hover: `hover:border-primary/40` → Ajuste transparência

---

## 2. Tipografia

### Tamanhos Usados

- **Heroes (H1)**: `text-4xl lg:text-5xl font-bold`
- **Section Titles (H2)**: `text-3xl lg:text-4xl font-bold`
- **Card Titles (H3)**: `text-lg lg:text-xl font-bold`
- **Body**: `text-base lg:text-lg text-foreground-secondary`
- **Small text**: `text-sm lg:text-base`

### Quickfit: Aumentar tama,nho geral

Nos componentes, altere:
```tsx
// Antes (mobile first)
className="text-3xl lg:text-4xl"

// Depois (maior)
className="text-4xl lg:text-5xl"
```

---

## 3. Espaçamento e Paddings

### Padrão Usado

```tsx
// Seção completa
className="py-24 lg:py-32"  // padding vertical

// Container interno
className="px-4 sm:px-6 lg:px-8"  // padding horizontal

// Cards
className="p-6 lg:p-8"  // padding interno dos cards
```

### Aumentar Whitespace

```tsx
// Seção mais aérea
py-28 lg:py-40  // ao invés de py-24 lg:py-32

// Card mais espaçado
p-8 lg:p-10  // ao invés de p-6 lg:p-8
```

---

## 4. Customizar Cada Componente

### ProofOfSolidity (`src/components/home/proof-of-solidity.tsx`)

**Trocar cores de pilares:**
```tsx
// Linha 37 - alterar gradiente
className="py-24 lg:py-32 bg-gradient-to-br from-background via-background to-primary/5"

// Para um degradê diferente
className="py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50"
```

**Aumentar tamanho de ícones:**
```tsx
// Linha 89
<pillar.icon className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />

// Para
<pillar.icon className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
```

**Mudar ordem dos cards:**
```tsx
// Altere a array `pillars` no topo do arquivo
const pillars = [
  {
    icon: Building2,
    title: 'Tradição',
    // ... reordene aqui
  },
]
```

### FeaturedEditorial (`src/components/home/featured-editorial.tsx`)

**Trocar imagens destacadas:**
```tsx
// Linha ~40
image: '/images/blog-featured-1.jpg',

// Para sua imagem
image: '/public/novo-artigo.jpg',
```

**Mude número de artigos exibidos:**
```tsx
// Altere a grid
<div className="grid md:grid-cols-3 gap-6">
  // Para (2 articles)
<div className="grid md:grid-cols-2 gap-6">
```

### JourneyPreview (`src/components/home/journey-preview.tsx`)

**Trocar ícones dos passos:**
```tsx
// Linha ~25 - array journeySteps
{
  number: '1',
  icon: Search,  // ← Troque o ícone
  title: 'Seleção Personalizada',
}
```

**Alterar número de passos (de 4 para 5 ou 3):**
- Delete ou adicione itens no array `journeySteps`
- Ajuste grid: `lg:grid-cols-4` → `lg:grid-cols-5`

### FloatingCTABar (`src/components/home/floating-cta-bar.tsx`)

**Trocar posição (bottom-right para bottom-left):**
```tsx
// Linha 43
<div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">

// Para bottom-left
<div className="fixed bottom-6 left-6 flex flex-col gap-3 z-40">
```

**Mudar cores dos botões:**
```tsx
// Linha 92 - WhatsApp
className="... bg-green-500 hover:bg-green-600 ..."

// Para outra cor
className="... bg-emerald-500 hover:bg-emerald-600 ..."

// Linha 108 - Solicitar Veículo (já usa cor primária)
className="... bg-primary hover:bg-primary-hover ..."
```

**Aumentar tamanho dos botões:**
```tsx
// Altere w-14 h-14 (56px)
className="flex items-center justify-center w-14 h-14 ..."

// Para maior
className="flex items-center justify-center w-16 h-16 ..."
```

---

## 5. Animações

### Transições Padrão
```tsx
transition-all duration-300      // smooth fade/move
hover:scale-110                  // enlarge on hover
hover:shadow-lg                  // add shadow on hover
transform hover:scale-110 active:scale-95  // button feedback
```

### Desabilitar Animações
```tsx
// Remove transition (para performance ou design fixo)
className="hover:border-primary/40"  // sem transition

// Para
className="hover:border-primary/40 transition-none"
```

**Aumentar duração de animação:**
```tsx
transition-all duration-300  // normal
transition-all duration-500  // mais lenta
transition-all duration-700  // bem lenta
```

---

## 6. Ícones Usados

Todos de [lucide-react](https://lucide.dev)

**ProofOfSolidity:**
- `Building2` (Tradição)
- `MapPin` (Cobertura)
- `CheckCircle` (Curadoria)
- `TrendingUp` (Evolução)

**JourneyPreview:**
- `Search` (Seleção)
- `FileCheck` (Inspeção)
- `Truck` (Logística)
- `CheckCircle` (Entrega)

**FloatingCTABar:**
- `MessageCircle` (WhatsApp)
- `FileText` (Solicitar)

### Trocar Ícone

```tsx
import { NewIcon } from 'lucide-react'

// E use em: icon: NewIcon
```

---

## 7. Responsividade

### Testar Breakpoints Tailwind
```
sm:  640px   (tablets pequenas)
md:  768px   (tablets)
lg: 1024px   (desktop small)
xl: 1280px   (desktop)
2xl: 1536px  (desktop grande)
```

### Ajustar visibilidade por tela

```tsx
// Mostrar só em mobile
<div className="lg:hidden">
  Mobile content
</div>

// Mostrar só em desktop
<div className="hidden lg:block">
  Desktop content
</div>
```

---

## 8. Arquivo de Referência Rápida

| Arquivo | O que Muda |
|---------|-----------|
|`proof-of-solidity.tsx`| Pilares, ícones, cores, spacing|
|`featured-editorial.tsx`| Artigos, imagens, número de cards|
|`journey-preview.tsx`| Steps, ícones, descrições|
|`floating-cta-bar.tsx`| Posição, tamanho, cores, visibilidade|
|`container.tsx`| Max-width do layout (1600px)|

---

## 9. Exemplo Completo: Customizar ProofOfSolidity

**ANTES:**
```tsx
const pillars = [
  {
    icon: Building2,
    title: 'Tradição',
    subtitle: '18+ Anos',
    description: 'Negócio familiar à prova...',
  },
  // ... more items
]
```

**DEPOIS (Personalizado):**
```tsx
const pillars = [
  {
    icon: Store,  // ← Ícone novo
    title: 'Premium Experience',  // ← Título novo
    subtitle: '20 Years',  // ← Subtítulo
    description: 'Family-owned premium car dealership from...',  // ← Descrição nova
  },
  // ... more items
]
```

---

## 10. Checklist de Design

- [ ] Cores alinhadas com brand guidelines
- [ ] Tipografia revisada (tamanhos e pesos)
- [ ] Espaçamento adequado (whitespace)
- [ ] Ícones padronizados
- [ ] Hover states definidos
- [ ] Responsividade testada (mobile + desktop)
- [ ] Animações suave (sem lag)
- [ ] Acessibilidade verificada (contraste, labels)
- [ ] Imagens otimizadas (comprimidas)

---

**Desenvolvido em**: Março 12, 2026  
**Framework**: Next.js 14 + Tailwind CSS  
**Component Library**: Lucide React Icons
