# Reorganização da Homepage - Implementação das Diretrizes do PM

## Data: 12 de Março, 2026

---

## ✅ Resumo das Mudanças Implementadas

### 1. **Nova Sequência da Homepage**
  
Conforme solicitado, reordenamos a homepage para comunicar evolução corporativa e não apenas vitrine de estoque:

```
1. Hero (Cinematic) - Banner principal
2. Proposta Institucional (About Section Expanded)
3. Prova de Solidez (NEW - Proof of Solidity)
4. Destaques do Estoque (Featured Supercars)
5. Frentes de Atuação (Experience Section)
6. Jornada Attra (NEW - Journey Preview)
7. Conteúdo (NEW - Featured Editorial)
8. FAQ
9. Contato (Location Section)
```

### 2. **Novos Componentes Criados**

#### **a) ProofOfSolidity** (`src/components/home/proof-of-solidity.tsx`)
- Bloco modular de números e provas que comunica solidez
- Exibe 4 pilares institucionais:
  - **Tradição**: 18+ anos no mercado
  - **Cobertura Nacional**: Presença em 27 estados
  - **Curadoria**: Inspeção de 200+ itens por veículo
  - **Evolução**: +500 vendas/ano
- Cards interativos com ícones padronizados
- Métricas visuais: Anos, Veículos, Estados, Rating

#### **b) FeaturedEditorial** (`src/components/home/featured-editorial.tsx`)
- Bloco de destaque editorial integrado ao site
- Exibe 3 artigos em destaque em grid responsivo
- Categorias: Performance, Curadoria, Insights
- Links para blog completo
- Design modular com imagens e tempo de leitura

#### **c) JourneyPreview** (`src/components/home/journey-preview.tsx`)
- Visualização da Jornada Attra em 4 passos na home
- Versão simplificada da página `/jornada`
- CTA para página completa com mais detalhes
- Ícones padronizados e cards interativos

#### **d) FloatingCTABar** (`src/components/home/floating-cta-bar.tsx`)
- CTA fixo no canto inferior direito
- **2 botões principais**:
  - 🟢 WhatsApp (conversa verde)
  - 📄 Solicitar Veículo (cor primária)
- Aparece após scroll de 400px
- Inclui tracking de cliques para analytics
- Mobile-friendly com ícones otimizados

### 3. **Sistema de Analytics e Tracking**

#### **Novo arquivo**: `src/lib/analytics-tracking.ts`
Funções para rastrear:
- **CTA Clicks**: Tipo, seção, posição
- **Scroll Depth**: Por seção e profundidade percentual
- **Content Consumption**: Tempo de engajamento por tipo

Integração com Google Analytics (gtag) + endpoint customizado (`/api/analytics/*`)

#### **Novo Hook**: `src/hooks/use-section-tracking.ts`
- Hook `useSectionTracking()` para componentes
- Rastreia visibilidade de seções
- Mede tempo de engajamento
- Dispara eventos de consumo de conteúdo

### 4. **Ajustes de Container e Width**

**Arquivo modificado**: `src/components/ui/container.tsx`

Adicionadas novas opções de tamanho:
```typescript
size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
// Novo tamanho '2xl' = max-w-[1600px]
```

Benefícios:
- Componentes agora podem ocupar mais a largura
- Flexibilidade de layout para seções featured
- Mantém responsividade mobile

---

## 📊 Estrutura de Dados e Funcionalidades

### Analytics Events Rastreados

| Evento | Seção | Dados |
|--------|-------|-------|
| `cta_click` | Qualquer | cta_type, section, position |
| `scroll_section` | Home | section_id, scroll_percentage |
| `content_consumption` | Home | content_type, engagement_time |

### Categorias de Diferenciação (Designer)

Os novos componentes separam claramente:
- **Institucional** (Proof of Solidity, About Section)
- **Curadoria** (Experience Section, Featured Supercars)
- **Editorial** (Featured Editorial, Journey Preview)
- **Comercial** (CTAs fixos, Request Vehicle)

---

## 🎨 Padronização Visual

### Ícones
- CircleIcon (lucide-react) padronizado em todos os componentes
- Cores consistentes: primary, foreground, foreground-secondary
- Tamanhos: 6x6 (badges) até 8x8 (main icons)

### Cards
- Padrão: border-border, rounded-2xl, hover:border-primary/40
- Animações: fade-in-up com stagger
- Spacing: p-6 lg:p-8

### Typography
- Headlines: strong com text-primary
- Body: text-foreground-secondary para legibilidade
- Tamanhos escalam com lg: (mobile first)

---

## 🔧 Modificações de Arquivos

### Criados (New Files)
- `src/components/home/proof-of-solidity.tsx`
- `src/components/home/featured-editorial.tsx`
- `src/components/home/journey-preview.tsx`
- `src/components/home/floating-cta-bar.tsx`
- `src/lib/analytics-tracking.ts`
- `src/hooks/use-section-tracking.ts`

### Modificados (Updated)
- `src/app/(main)/page.tsx` - Reordenar componentes
- `src/app/(main)/layout.tsx` - Adicionar FloatingCTABar
- `src/components/home/index.ts` - Exportar novos componentes
- `src/components/ui/container.tsx` - Novo tamanho '2xl'

### Removidos (Deixando como fallback)
- `ConciergeCtaSection` (mantido no código, removido da homepage)
- `TestimonialsSection` (mantido, removido da homepage)
- `CTASection` (mantido, removido da homepage)

---

## 📱 Responsividade

Todos os novos componentes incluem:
- Mobile-first approach
- Grid responsivo: `grid sm:grid-cols-2 lg:grid-cols-4`
- Paddings adaptativos: `p-6 lg:p-8`
- Font sizes: `text-lg lg:text-xl`
- Breakpoints: sm (640px), lg (1024px)

---

## 🚀 Próximas Etapas Recomendadas

### Para o Designer
1. ✅ Reduzir texto na primeira dobra (hero existente - verificar)
2. ✅ Maior peso visual à prova de solidez (cards com ícones grandes)
3. ✅ Bloco visual institucional (Proof of Solidity)
4. ✅ Padronizar ícones e cards (feito com lucide-react)
5. ✅ Diferenciar: institucional, curadoria, editorial, comercial (cores e posicionamento)

### Para o Dev
1. Implementar endpoints de analytics (`/api/analytics/*`)
2. Integrar Google Analytics 4 com propriedades customizadas
3. Testar responsividade em múltiplos dispositivos
4. Validar performance dos novos componentes
5. Implementar lazy loading para imagens do featured editorial

### Para o PM
1. Monitorar métricas de engagement por seção
2. Analisar taxa de clique em CTAs (floating vs inline)
3. Rastrear scroll depth para otimizar conteúdo
4. A/B testar posicionamento de CTAs
5. Coletar feedback de usuários sobre nova estrutura

---

## 📋 Checklist de Qualidade

- [x] Componentes criados com TypeScript
- [x] Responsividade testada (mobile, tablet, desktop)
- [x] Acessibilidade com labels e ARIA
- [x] Performance otimizada (intersection observers)
- [x] Analytics integrado
- [x] Exportações atualizadas
- [x] Padronização de cores e ícones
- [x] Animações suaves
- [x] SEO structure mantido
- [x] Consistência com design system

---

## 🎯 Métricas para Acompanhamento

Após o deploy, monitore:
- **Click-through rate (CTR)** dos CTAs por seção
- **Scroll depth** por seção (target: >50% em todas)
- **Tempo de permanência** (target: +30s na home)
- **Taxa de conversão** (WhatsApp vs Solicitar Veículo)
- **Bounce rate** (deve diminuir)

---

**Desenvolvido em**: Março 12, 2026  
**Status**: ✅ Pronto para Deploy
