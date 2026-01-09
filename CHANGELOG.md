# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.4.0] - 2026-01-09

### Adicionado
- **Seção de experiência redesenhada**: Cards com estilo monocromático premium e visual sofisticado
- **Componente Listen to Content**: Recurso de leitura em voz alta para artigos do blog
- **Calculadora de financiamento**: Componente interativo para simulação de financiamento
- **Inscrição de newsletter**: Formulário de inscrição para newsletter
- **Alerta de veículos**: Sistema de notificação para novos veículos
- **Seção FAQ na home**: Perguntas frequentes com schema SEO
- **Página glossário automotivo**: Conteúdo educativo sobre termos automotivos
- **Página guia supercarros**: Lead magnet com guia gratuito
- **Componentes de urgência**: CountdownTimer, UrgencyBanner, InventoryStatusBar
- **Schemas SEO**: FAQSchema, LocalBusinessSchema, VehicleSchema
- **CTAs aprimoradas**: Novo componente vehicle-card-ctas para cards de veículos

### Corrigido
- **Erro de chave duplicada no breadcrumb**: Corrigido uso de `index` como chave para evitar duplicação
- **Filtro "Mais novos" removido**: Removida opção de ordenação "Mais novos" na página de estoque

### Melhorado
- **Componentes de blog**: Templates educativo e car-review atualizados
- **Galeria de veículos**: Melhorias visuais na galeria cinematográfica
- **Botão WhatsApp**: Comportamento refinado baseado na página
- **Seções da home**: CTA, Location e Featured Supercars atualizados

## [1.3.0] - 2026-01-01

### Corrigido
- **Filtros da página de estoque não atualizavam**: Corrigido bug onde filtros como carroceria, combustível e ano não disparavam atualização da lista de veículos. Agora todos os tipos de filtro são processados corretamente no lado do cliente.
- **Busca não reconhecia categorias de veículos**: Busca por termos como "porsche conversível" agora inclui `body_type` e `category` no texto de comparação, permitindo encontrar veículos por tipo de carroceria.
- **Geração de descrição IA não funcionava**: Removidas referências a campos inexistentes (`city`, `state`) na função `vehicleToAIInput` do serviço Gemini. Adicionado mapeamento do campo `origin`.

## [1.2.0] - 2026-01-01

### Adicionado
- **Endpoint `/ads-home` para veículos em destaque**: Nova função `fetchAdsHome()` que consome o endpoint de veículos promocionais/destacados.
  - Extrai veículos da propriedade `destaques` da resposta
  - Ordena por campo `ordem` (crescente) respeitando configuração do CRM
  - Mapeia `veiculo_id` para `id` quando presente
  - Interface `AdsHomeVehicle` com campos adicionais

### Corrigido
- **Qualidade de imagem no banner hero**: 
  - Aumentado `quality` para 100 no componente Image
  - Adicionado `unoptimized` para imagens externas (autoconf/cdn)
  - Removido `scale-105` que afetava nitidez
  - Priority para os 2 primeiros slides

- **Deduplicação de veículos**: 
  - Implementada função `deduplicateVehicles` baseada em marca+modelo+ano
  - Busca 3x mais veículos para ter margem após deduplicação
  - Resolve problema de veículos duplicados no hero banner

- **Fallback do `getHomeVehicles`**: 
  - Se `/veiculos-home` retornar vazio, busca 4 veículos mais caros
  - Ordenação por preço desc em vez de publicação
  - Garante banner sempre com veículos de alto valor

## [1.1.0] - 2026-01-01

### Adicionado
- **Banner Hero dinâmico com API `/veiculos-home`**:
  - Nova função `fetchHomeVehicles()` para consumir endpoint
  - Nova função `getHomeVehicles()` com fallback para dados locais
  - Layout vehicle-focused com nome do veículo em destaque
  - Stats horizontais: Ano, KM e Valor
  - Layout mobile compacto com ícones
  - Botão "Saiba Mais" redirecionando para `/veiculo/[slug]`
  - Widget de busca sempre visível acima da dobra

- **Sistema de Blog Dual**:
  - Template `EducativoTemplate`: artigos educativos com categoria, autor, insights
  - Template `CarReviewTemplate`: reviews de veículos com specs, galeria, disponibilidade
  - Componente `BlogTabs`: navegação por abas (Todos/Artigos/Reviews)
  - Tipos TypeScript para `DualBlogPost` com campos específicos
  - API de blog (`src/lib/blog-api.ts`) com dados mock
  - Página `/blog` atualizada com listagem filtrada por tipo
  - Página `/blog/[slug]` com renderização condicional de templates

### Corrigido
- **Sobreposição do header mobile**:
  - Removido `mt-20` do breadcrumb que causava sobreposição
  - Adicionado `pt-28` consistente em todas as páginas internas
  - Páginas corrigidas: sobre, servicos, financiamento, solicitar-veiculo, compramos-seu-carro, universe, experiencia, contato

## [1.0.0] - 2026-01-01

### Adicionado
- **Catálogo completo de veículos** com filtros avançados
- **Integração com API AutoConf** para dados de veículos em tempo real
- **Descrições automáticas com IA** usando Google Gemini
- **Integração com webhooks N8N** para automação de leads
- **Botões de contato WhatsApp** com feedback por toast
- **Otimização SEO** com marcação Schema.org
- **Design responsivo** com Tailwind CSS
- **Sistema de blog** para conteúdo automotivo
- **Formulários de financiamento e troca** (trade-in)
- **Suporte a tema claro/escuro**
- **Página de detalhes do veículo** com galeria cinematográfica
- **Filtros avançados de busca**: marca, modelo, ano, preço, carroceria, combustível
- **Componentes de UI modernos**: cards, skeletons, breadcrumbs
- **Integração com Supabase** para persistência de dados

### Infraestrutura
- Next.js 15 com App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Lucide React para ícones

---

## Versões Anteriores (Legado)

### [0.2.0] - 2025-03-17
- Atualização de versão do projeto

### [0.1.1] - 2025-03-10
- Reorganização de estrutura de arquivos

### [0.1.0] - 2025-03-10
- **Adicionado**: Consulta FIPE
- **Adicionado**: API inicial do projeto

### [0.0.1] - 2025-03-10
- Commit inicial do projeto

