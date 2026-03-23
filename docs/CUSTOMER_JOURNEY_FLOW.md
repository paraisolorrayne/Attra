# Fluxo da Jornada do Cliente: Do ChatGPT ao Consultor
**Versão:** 1.0  
**Data:** Março 2026  
**Público:** Equipe Comercial, Marketing, TI  

---

## 📊 Visão Geral da Jornada

Este documento mapeia **como o cliente passa por 4 estágios distintos** desde o momento em que pergunta a uma IA até fechar negócio com um consultor da Attra.

```
[DISCOVERY]  →  [ENGAGEMENT]  →  [HANDOFF]  →  [CONVERSION]
     (IA)      (Concierge Web)   (CRM)        (Consultor)
   Minutes      Hours            Minutes       Days/Weeks
```

---

## 1️⃣ FASE 1: DISCOVERY (Minutos 0-2)

### O Cenário
Um potencial cliente está no **ChatGPT, Claude, Gemini ou Google Shopping** e faz uma pergunta específica:

**Usuário:** *"Preciso de um SUV familiar 2023, com tecnologia atualizante, seguro mas que dirija bem. Qual é a melhor opção em estoque premium no Brasil agora?"*

### Como a IA Encontra Attra

```
┌─────────────────────────────────────────┐
│  Plataforma IA (ChatGPT/Google/Gemini)  │
│  └─ Sistema de Busca Aberto             │
│     └─ Acessa 100+ Merchant Feeds (RSS) │
│        ├─ Carplace.com.br                │
│        ├─ Webmotors.com.br               │
│        └─► ATTRA VEÍCULOS ◄─ (NOSSO!)    │
└─────────────────────────────────────────┘
         │ (Procura por: "SUV 2023 Brasil")
         │
         ▼
┌──────────────────────────────────────────┐
│ Feed XML da Attra                        │
│ (/api/feed/estoque.xml)                  │
│ ├─ BMW X5 M50i 2024 (580k BRL)          │
│ ├─ Cayenne Coupe Turbo 2023 (650k BRL)  │
│ ├─ Range Rover Sport 2023 (550k BRL)    │
│ └─ GLE 63 AMG 2024 (720k BRL)            │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ Resposta da IA (Contextualizada)                │
│ ─────────────────────────────────────────────── │
│ "Vi que você quer um SUV familiar com          │
│  performance. A Attra Veículos tem:            │
│                                                 │
│  1. BMW X5 M50i 2024 (R$ 580k) ✓              │
│     - Motor V8, 523 HP                        │
│     - Teto panorâmico, som Bose               │
│     - Disponível para entrega HOJE            │
│                                                 │
│  Clique aqui para detalhes → [link]          │
└──────────────────────────────────────────────────┘
```

### Dados que Alimentam Essa Resposta

Retirados do feed XML:

```xml
<item>
  <g:id>ATTRA-BMW-X5-M50I-2024-001</g:id>
  <g:title>BMW X5 M50i 2024 - Cor Branca Alpina</g:title>
  <g:description>SUV familiar de luxo com motor V8 bi-turbo, 523 HP, teto panorâmico, som Bose premium, interior em couro Merino. Apenas 3.200 km. Certificado Attra.</g:description>
  <g:link>https://attraveiculos.com.br/estoque/bmw-x5-m50i-2024</g:link>
  <g:image_link>https://cdn.attra.com/bmw-x5-m50i-2024-hero.jpg</g:image_link>
  <g:price>580000.00 BRL</g:price>
  <g:condition>used</g:condition>
  <g:custom_label_1>Pronta Entrega</g:custom_label_1>
  <g:custom_label_3>Baixa Quilometragem</g:custom_label_3>
</item>
```

### Métricas esperadas nesta fase
- **Impressões no feed:** ~1.000-2.000/semana (por cada modelo popular)
- **CTR (Click-Through Rate):** 5-8% (vários cliques por impressão)
- **Tempo até próxima ação:** 2-5 minutos

### KPIs para Monitorar
```
Dashboard Analytics:
├─ Feed impressions por modelo
├─ Feed clicks por modelo (via UTM: utm_source=ai_shopping)
├─ Bounce rate depois do clique (target: < 20%)
└─ Tempo médio na página produto (target: > 2 min)
```

---

## 2️⃣ FASE 2: ENGAGEMENT (Minutos 2-60)

### O Cenário
O cliente clicou e chegou na **página do veículo específico** da Attra.

```
┌─────────────────────────────────────────────────┐
│ Página do Produto: BMW X5 M50i 2024             │
│ URL: /estoque/bmw-x5-m50i-2024                  │
│                                                  │
│ [HERO] Galeria de Imagens (6 fotos de alta res.) │
│        ▼ Vídeo 360° do interior                 │
│        ▼ Vídeo de teste de som (Bose)           │
│                                                  │
│ [ATTRA CONCIERGE] ← Entra em cena aqui!        │
│ ┌──────────────────────────────────────────┐   │
│ │ "Olá! Seja bem-vindo à Attra.            │   │
│ │  Vi que você chegou buscando um SUV      │   │
│ │  com performance. Este BMW é um dos      │   │
│ │  meus favoritos.                         │   │
│ │                                          │   │
│ │  Gosto de saber: você está pensando à │   │
│ │  entrega? Se tiver perguntas sobre      │   │
│ │  câmbio, seguro ou part da Attra,      │   │
│ │  só chamar. 👋                          │   │
│ │                                          │   │
│ │  [Botão] Quero detalhes                │   │
│ │  [Botão] Fale com consultor            │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ [INFO SPECS]                                    │
│  Motorização: BMW TwinTurbo V8, 523 HP         │
│  Consumo: 7.8 km/l (cidade)                    │
│  Câmbio: Automático 8v                         │
│  Tração: Integral IntellliDrive                │
│  Ano/Modelo: 2024                              │
│  Quilometragem: 3.200 km                       │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

### Componentes Críticos desta Fase

#### 2.1 Attra Concierge (Chatbot Conversacional)

**O que é:**
Um assistente IA no site que:
- Sabe de onde o cliente veio (feed → navegador → página)
- Conversa naturalmente sobre o veículo
- Entende intenção (curiosidade, urgência, dúvida)
- Oferece as próximas ações inteligentemente

**Como funciona:**

```
Cliente entra na página
         │
         ▼
Concierge faz trigger automático (com delay 3-4s):
"Vi que você chegou buscando um SUV. Este BMW é incrível."
         │
         ├─ Cliente: "Qual é a consumo?"
         │  └─ Concierge: "7.8 km/l na cidade. Se precisar para
         │              viagens, rodas de alta eficiência trazem
         │              até 9.2. Quer ver os custos?"
         │
         ├─ Cliente: "Qual o valor?"
         │  └─ Concierge: "R$ 580k. Temos financiamento com
         │              parceiros Bradesco/Caixa. Quer simular?"
         │
         ├─ Cliente: "Há quanto está no estoque?"
         │  └─ Concierge: "Chegou há 2 semanas. Pronta para
         │              entrega em 24h. Quer agendar uma vista?"
         │              ⚠️ [INTENÇÃO DETECTADA] ◄─ TRIGGER HANDOFF
         │
         └─ SE Cliente responde com urgência/específico:
            └─ Concierge: "Perfeito! Vou conectar você com um
                         consultor especializado agora mesmo.
                         Qual seu melhor horário?"
                         ⚠️ [WEBHOOK] ◄─ ENVIA LEAD PARA CRM
```

#### 2.2 Sinais de Intenção (Engagement Triggers)

O Concierge detecta quando o cliente está pronto para falar com humano:

| Sinal | Exemplo | Ação |
|-------|---------|------|
| **Urgência** | "Preciso logo" / "Entrega rápida?" | Conectar com consultor |
| **Especificidade** | Pergunta sobre financiamento/trade-in | Agendar conversa |
| **Múltiplas interações** | > 3 mensagens | Oferecer atendimento |
| **Tempo na página** | > 5 minutos com engagement | Perguntar se quer falar |
| **Comparação** | "Como compara com X5?" | Agendar comparação |

#### 2.3 Coleta de Dados (Opt-in)

Quando o cliente está ready, o Concierge coleta informações:

```
Concierge: "Ótimo, vou conectar você com nosso especialista.
            Para agilizar, preciso de alguns dados:
            
            Seu nome? ________________________
            Seu email? ______________________
            Telefone? ________________________
            
            Qual é sua maior dúvida agora?
            [ ] Financiamento
            [ ] Avaliação da minha troca
            [ ] Prazos de entrega
            [ ] Garantia e serviços
```

**Resultado:** Lead com contexto (`origem=ai_shopping_bmw_x5`)

---

## 3️⃣ FASE 3: HANDOFF (Minutos 60+)

### O Cenário
O cliente expressa intenção clara de conversar. O Concierge fecha a conversa e dispara um webhook para o **CRM/Compufarma/N8N**.

```
┌────────────────────────────────────────┐
│ WEBHOOK: Nova Lead                     │
├────────────────────────────────────────┤
│ {                                      │
│   "id": "lead_1710087000",             │
│   "nome": "João Silva",                │
│   "email": "joao.silva@email.com",    │
│   "telefone": "+55 11 98765-4321",    │
│   "origem": "ai_shopping",             │
│   "veiculo_id": "bmw_x5_m50i_2024",   │
│   "veiculo_nome": "BMW X5 M50i 2024", │
│   "preco_veiculo": 580000,             │
│   "urgencia": "alta",                  │
│   "duvida_principal": "financiamento", │
│   "timestamp": "2026-03-22T14:15:00Z", │
│   "url_origem": "ai_shopping",         │
│   "qualidade_lead": "hot" ← HIGH CONVERSION SCORE
│ }                                      │
└────────────────────────────────────────┘
         │
         ▼ (Enviado via HTTP POST)
┌────────────────────────────────────────┐
│ CRM da Attra (Compufarma / N8N)       │
│                                        │
│ ✅ Lead Criado em [HH:MM]             │
│ 👤 Atribuído ao: Consultor "Rafael"  │
│ 🚗 Carro: BMW X5 M50i 2024           │
│ ⭐ Score: 95/100 (Muito Quente!)     │
│ 📍 Ação Recomendada:                 │
│    [1] Ligar em < 1 hora             │
│    [2] Confirmar interesse            │
│    [3] Agendar test drive            │
└────────────────────────────────────────┘
```

### Sequência no CRM

1. **Notificação Real-Time ao Consultor**
   ```
   📱 WhatsApp / SMS / Push Notification:
   "NOVO LEAD QUENTE! João Silva - X5 M50i
    Veio do ChatGPT/Google Shopping
    Ligação urgente. Clique: [Link CRM]"
   ```

2. **Histórico Contextualizado**
   O consultor abre a conta e vê:
   ```
   CONTATO: João Silva
   ├─ EMAIL: joao.silva@email.com
   ├─ TELEFONE: +55 11 98765-4321
   ├─ DATA CONTATO: 22/03/2026 14:15
   │
   ORIGEM DO LEAD:
   ├─ Canal: AI Shopping (ChatGPT/Google)
   ├─ Veículo Alvo: BMW X5 M50i 2024 (R$ 580k)
   ├─ Tempo na Página Web: 7 min 23 seg
   ├─ Interações: 4 mensagens com Concierge
   │
   INTENÇÃO MAPEADA:
   ├─ Dúvida Principal: Financiamento
   ├─ Urgência: Alta ("Preciso logo")
   ├─ Comparações Feitas: Nenhuma (decisão quase tomada)
   │
   RECOMENDAÇÃO SISTEMA:
   └─ "Caminho ideal: Confirmar interessado → 
          Simular financiamento → Agendar test drive"
   ```

3. **Script de Atendimento Inteligente**
   
   O consultor tem um guia pré-carregado:
   
   ```
   ABORDAGEM:
   "Olá João, tudo bem? Meu nome é Rafael, sou consultor
    da Attra Veículos. Vi que você estava interessado no
    BMW X5 M50i que temos aqui.
    
    Primeira coisa: aquele chat com o Concierge resolveu
    suas dúvidas sobre financiamento? Se não, eu simulo
    rapidinho para você agora.
    
    E segunda: o carro está pronto. Você gostaria de vir
    dirigir hoje ou amanhã? Temos slots às 10h e 14h."
   ```

### Métricas desta Fase

| Métrica | Target | Impacto |
|---------|--------|--------|
| **Tempo até primeira contatação** | < 1 hora | 60% mais conversão |
| **Taxa de resposta/atendimento** | > 80% | Perda de lead se não contata |
| **Conversão lead hotso → agendamento** | > 40% | Negócio gerado |
| **NPS do atendimento (Concierge + Consultor)** | > 8/10 | Referência positiva |

---

## 4️⃣ FASE 4: CONVERSION (Dias/Semanas)

### O Cenário
Agora é **vendedor vs. comprador**. O ciclo de negócios começa.

```
DIA 1: Primeira Conversa
├─ Consultor confirma urgência
├─ Simula financiamento (Bradesco/Caixa)
├─ Oferece test drive

DIA 1-2: Test Drive
├─ Cliente vem conhecer o veículo pessoalmente
├─ Consultor demonstra diferenciais
├─ Cliente leva para mecânico (inspeção)

DIA 3-7: Negociação
├─ Avaliação de carro de troca (se houver)
├─ Ajuste de preço (se necessário)
├─ Escolha de desembolso/financiamento

DIA 7-14: Fechamento
├─ Documentação (CNPJ/CPF, faturamento)
├─ Seguro e transferência
├─ Agendamento de entrega

DIA 14+: Pós-venda
├─ Entrega e orientação
├─ Follow-up 30 dias (satisfação)
├─ Convite para clube de proprietários
```

### O Diferencial da Jornada Attra

**Sem a IA Shopping:**
```
Cliente acha carro no Webmotors → 
Leads competem com 50 outros → 
Consultor genérico "tira dúvidas" → 
30% conversão
```

**Com a IA Shopping (Attra):**
```
Cliente descobre Attra via IA recomendada → 
Lead já "pré-qualificado" (escolheu por contexto) → 
Consultor atende com contexto da jornada → 
60%+ conversão
```

---

## 🔄 Mapa Visual da Jornada Completa

```
                              ATTRA VEÍCULOS
                          ┌─────────────────┐
                          │  Merchant Feed  │
                          │  (XML/RSS)      │
                          │ 1200+ veículos  │
                          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
              ChatGPT        Google Shopping   Gemini
                │                 │              │
                └─────────┬───────┴─────┬────────┘
                          │             │
                          ▼             ▼
                   [DISCOVERY]   (Minutos)
                   ┌─────────────────────┐
                   │ IA busca feed Attra │
                   │ Recomenda X5 M50i   │
                   │ "Clique para + info" │
                   └────────┬────────────┘
                            │
                            ▼
                   [ENGAGEMENT]   (Horas)
                   ┌────────────────────────┐
                   │ Página do Produto      │
                   │ X5 M50i 2024           │
                   │                        │
                   │ Attra Concierge entra: │
                   │ "Olá! Vi que você..."  │
                   │                        │
                   │ 🔄 Chat interativo     │
                   │ 📸 Galeriam/vídeos     │
                   │ 💬 FAQ instantâneo     │
                   │                        │
                   │ [INTENÇÃO DETECTADA]   │
                   └────────┬───────────────┘
                            │
                            ▼
                   [HANDOFF]   (Minutos)
                   ┌────────────────────────┐
                   │ Webhook → CRM          │
                   │ Lead Quente (95/100)   │
                   │ Consultor "Rafael"     │
                   │ notificação em tempo   │
                   │ real                   │
                   │                        │
                   │ [Lead Criado no CRM]   │
                   └─────────┬──────────────┘
                             │
                             ▼
                   [CONVERSION]   (Semanas)
                   ┌────────────────────────┐
                   │ Consultor liga < 1h    │
                   │ Simula financiamento   │
                   │ Agenda test drive      │
                   │ Coleta documentos      │
                   │ Entrega veículo        │
                   │ Referência + clube     │
                   └────────────────────────┘
```

---

## 📊 Indicadores de Sucesso por Fase

### Fase 1: Discovery
```
Feed Metrics:
├─ Feed indexed no Google: ✅ (sem erro)
├─ Feed impressions: > 1.000/semana
├─ Feed clicks: CTR > 5%
├─ Bounce rate < 20%
└─ Avg time on page > 2min
```

### Fase 2: Engagement
```
Web Metrics:
├─ Concierge interaction rate: > 30%
├─ Avg chat messages per user: > 2
├─ Lead capture rate: > 15%
├─ Pages per session: > 2
└─ Conversion to leads: > 8%
```

### Fase 3: Handoff
```
CRM Metrics:
├─ Webhook success rate: > 99%
├─ Lead attribution accuracy: 100%
├─ Time to first contact: avg < 30min
├─ Contact attempt rate: > 85%
└─ Lead acceptance rate: > 90%
```

### Fase 4: Conversion
```
Sales Metrics:
├─ Hot lead conversion rate: > 50%
├─ Avg time to close: 7-14 dias
├─ Deal size: premium (acima de média)
├─ Customer satisfaction: NPS > 8
└─ Referral rate: > 20%
```

---

## 🎯 Próximas Ações por Equipe

### TI/DevOps
- [ ] Implementar `GET /api/feed/estoque.xml`
- [ ] Configurar cache ISR (3 horas)
- [ ] Submeter feed no Google Merchant Center
- [ ] Monitorar erros de parsing (3 primeiros dias)

### Produto / Frontend
- [ ] Integrar Attra Concierge (chatbot no site)
- [ ] Implementar trigger de intenção (detectar "urgência")
- [ ] Criar webhook de lead capture
- [ ] Analytics de interação do chat

### Comercial
- [ ] Treinar consultores no novo fluxo CRM
- [ ] Criar scripts de resposta para leads quentes
- [ ] Definir SLA (< 1h para primeiro contato)
- [ ] Preparar simuladores de financiamento

### Marketing
- [ ] Criar assets de "pronta entrega" para AI Shopping
- [ ] Monitorar performance do feed (Google Console)
- [ ] Otimizar descrições de veículos (SEO no feed)
- [ ] Campaña de "leads AI" (case studies)

---

## 📞 Contato e Dúvidas

**Quem responde cada aspecto:**
- Feed XML: `devops@attra.com.br`
- Concierge Chatbot: `produto@attra.com.br`
- CRM e atendimento: `comercial@attra.com.br`
- Google Merchant: `marketing@attra.com.br`

---

## Conclusion

Esta jornada transforma a Attra de uma **opção entre muitas** em uma **recomendação direta da IA**.

A diferença? Um lead que chegar via AI Shopping já passou por:
✅ Contexto (sabia o que procurava)
✅ Validação IA (confiou na recomendação)
✅ Engajamento (falou com Concierge)

Isso resulta em uma taxa de conversão **3-4x superior** vs. leads tradicionais.
