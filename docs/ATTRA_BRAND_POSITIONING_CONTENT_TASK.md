# Task: Reorganizar o posicionamento de marca da Attra no site sem virar "textao"

## Objetivo
Fortalecer o bloco e a pagina de "Sobre" como prova de maturidade da marca, nao como texto institucional generico.

A narrativa precisa comunicar:
- de onde a Attra veio
- o que construiu ate aqui
- como opera hoje
- por que e confiavel
- para onde esta evoluindo

O resultado esperado e um site mais escaneavel, com mais densidade de mensagem e menos blocos longos de texto.

## Diagnostico do site atual

### O que esta bom
- A home ja tem espaco institucional antes e depois do estoque.
- Ja existem componentes reutilizaveis para contar historia sem refazer a arquitetura.
- A pagina `/sobre` ja tem profundidade e SEO, entao nao precisa ser reconstruida do zero.

### O que hoje pesa ou fragmenta a mensagem
- A home divide a narrativa em muitos blocos que falam de coisas parecidas: `AboutSectionExpanded`, `ProofOfSolidity` e `ExperienceSection`.
- A pagina `/sobre` esta longa, com excesso de secoes genericas ("Quem Somos", "Nossa Estrutura", "Nosso Compromisso", "Diferenciais"), o que dilui o posicionamento.
- A copy atual fala mais como vitrine institucional do que como documento de posicionamento.
- Ha repeticao de promessas parecidas em secoes diferentes, sem uma progressao clara.

### Inconsistencias factuais para corrigir antes de publicar
Hoje o site mistura datas e numeros diferentes:
- `2008` em blocos da home e da jornada
- `2009` no briefing atual
- `2010` no schema e na timeline da pagina `/sobre`
- `15+` anos em algumas paginas
- `18+` anos em outras

Antes do deploy, unificar tudo em uma versao so. Para esta task, considerar `2009` como base provisoria do novo texto, porque e o ano citado no briefing atual. Confirmar com a Attra antes de publicar.

## Diretriz editorial

### O "Sobre" nao deve soar como
- historia simpatica demais
- texto emocional demais
- folder institucional generico
- bloco grande de texto corrido

### O "Sobre" deve soar como
- marca madura
- operacao criteriosa
- confianca conquistada
- empresa em evolucao
- relacao de longo prazo

### Regras de leitura
- Cada secao deve ter 1 titulo forte + 1 paragrafo curto.
- O bloco principal de cada secao nao deve passar de 70 a 90 palavras.
- Toda secao precisa de um apoio visual: numero, card, bullet, marco ou quote.
- Evitar 2 paragrafos longos seguidos sem quebra visual.
- Evitar repetir "premium", "excelencia" e "exclusividade" em excesso.

## Arquitetura recomendada

### Home
Usar a home como teaser institucional, nao como pagina completa de historia.

#### 1. Bloco institucional principal
Componente atual: `src/components/home/about-section-expanded.tsx`

Funcao:
- apresentar a tese da marca
- responder "de onde a Attra veio" em versao curta
- abrir o raciocinio de que a Attra nasceu para elevar a experiencia, nao apenas vender carros

Estrutura recomendada:
- kicker: `Posicionamento`
- titulo: `Mais do que carros. Uma visao.`
- 1 paragrafo curto
- 3 bullets de leitura rapida
- CTA para `/sobre`

#### 2. Bloco de prova de reputacao
Componente atual: `src/components/home/proof-of-solidity.tsx`

Funcao:
- responder "o que construiu ate aqui"
- transformar historia em prova
- mostrar que a reputacao veio de confianca acumulada

Estrutura recomendada:
- titulo: `Construindo reputacao, carro a carro`
- subtitulo curto
- manter metricas
- revisar cards para mostrar confianca, recorrencia, alcance e criterio

#### 3. Bloco de operacao atual
Componente atual: `src/components/home/experience-section.tsx`

Funcao:
- responder "como opera hoje"
- mostrar que a Attra evoluiu sem perder proximidade

Estrutura recomendada:
- titulo: `Um novo jeito de operar`
- 1 paragrafo curto
- 4 cards:
  - Curadoria rigorosa
  - Experiencia personalizada
  - Tecnologia aplicada ao relacionamento
  - Acompanhamento continuo

#### 4. Futuro da marca
Nao precisa virar um bloco gigante na home.

Opcao recomendada:
- inserir apenas um teaser curto no fim da pagina `/sobre`
- na home, deixar essa camada sugerida em uma frase de fechamento ou no CTA do bloco institucional

### Pagina `/sobre`
Usar `/sobre` como pagina de posicionamento completa.

Trocar a estrutura atual de muitos blocos por 5 capitulos curtos:
1. Origem
2. Reputacao
3. Operacao
4. Confianca
5. Futuro

## Copy proposta

### Hero da pagina `/sobre`
- kicker: `Sobre a Attra`
- titulo: `Uma operacao construida para que grandes carros venham acompanhados de grandes experiencias.`
- apoio:

`A Attra nasceu da percepcao de que, no mercado de veiculos de alto padrao, era possivel encontrar grandes carros, mas raramente a mesma qualidade em curadoria, transparencia e relacionamento. Desde entao, a empresa vem construindo uma forma mais criteriosa, consultiva e confiavel de atuar.`

### Capitulo 1. Origem
- titulo: `Mais do que carros. Uma visao.`
- texto:

`A historia da Attra comeca com uma inquietacao simples: por que a compra de um carro extraordinario tantas vezes vinha acompanhada de uma experiencia comum? A empresa nasceu para corrigir esse desalinhamento, tratando cada veiculo como patrimonio e cada cliente com o nivel de atencao que esse tipo de decisao exige.`

- apoio sugerido:
  - Curadoria antes de catalogo
  - Relacao antes de transacao
  - Procedencia antes de pressa

### Capitulo 2. Reputacao
- titulo: `Construindo reputacao, carro a carro`
- texto:

`Desde 2009, a Attra cresceu de forma organica, baseada em algo que nao pode ser comprado nem acelerado: a confianca. Cada negociacao bem conduzida, cada indicacao espontanea e cada parceria consolidada ajudaram a formar uma rede solida de clientes, parceiros e instituicoes financeiras.`

- apoio sugerido:
  - faixa de metricas
  - linha do tempo curta com 3 ou 4 marcos, nao uma timeline longa

### Capitulo 3. Operacao atual
- titulo: `Um novo jeito de operar`
- texto:

`Com o tempo, a Attra evoluiu. O que comecou como uma visao clara sobre curadoria passou a incorporar tecnologia, inteligencia de dados e novos modelos de relacionamento. Hoje, a empresa combina sensibilidade automotiva com eficiencia operacional para ampliar atendimento sem perder proximidade, confianca e atencao aos detalhes.`

- pilares:
  - `Curadoria rigorosa`: cada veiculo passa por selecao e analise criteriosa.
  - `Experiencia personalizada`: o atendimento considera o carro desejado e o momento do cliente.
  - `Tecnologia aplicada ao relacionamento`: IA e sistemas proprios tornam o atendimento mais agil, eficiente e conectado.
  - `Acompanhamento continuo`: a relacao continua depois da entrega.

### Capitulo 4. Confianca
- titulo: `Confianca como ativo principal`
- texto:

`No universo de veiculos premium, o carro e apenas parte da equacao. O que sustenta a negociacao e a confianca. Por isso, a Attra sempre operou com um principio simples: transparencia absoluta em cada etapa do processo, com procedencia clara, documentacao organizada, comunicacao direta e responsabilidade em cada detalhe.`

- apoio sugerido:
  - 4 cards curtos:
    - Procedencia clara
    - Documentacao organizada
    - Comunicacao direta
    - Responsabilidade em cada etapa

### Capitulo 5. Futuro
- titulo: `O futuro da Attra`
- texto:

`A Attra nasceu olhando para frente e continua evoluindo com esse mesmo espirito. Hoje, amplia sua atuacao em tres frentes: acesso a veiculos exclusivos no mercado internacional, desenvolvimento de tecnologia propria para relacionamento com clientes e fortalecimento de uma experiencia cada vez mais personalizada.`

- fechamento destacado:

`Grandes carros impressionam. Grandes experiencias permanecem.`

## Como distribuir o texto sem pesar

### Recomendacao de formato
- usar 1 paragrafo principal por capitulo
- quebrar densidade com 3 a 4 cards curtos
- manter uma faixa de metricas enxuta
- trocar timeline longa por marcos resumidos
- usar o fechamento como quote isolada, nao como mais um paragrafo

### O que evitar
- blocos com 3 paragrafos seguidos
- secoes com titulo e subtitulo genericos demais
- duplicar a mesma ideia na home e na pagina `/sobre`
- usar todo o texto bruto do briefing em uma unica secao

## Escopo tecnico para o dev

### 1. Reescrever a narrativa institucional da home
Arquivos:
- `src/components/home/about-section-expanded.tsx`
- `src/components/home/proof-of-solidity.tsx`
- `src/components/home/experience-section.tsx`

Fazer:
- reposicionar os titulos e paragrafos para a nova narrativa
- reduzir repeticao entre os 3 blocos
- manter estrutura visual atual sempre que possivel
- evitar criar novos componentes se o layout atual suportar a nova hierarquia

### 2. Enxugar e reposicionar a pagina `/sobre`
Arquivo:
- `src/app/(main)/sobre/page.tsx`

Fazer:
- substituir os blocos genericos atuais pelos 5 capitulos acima
- manter hero, metricas e CTA final
- reduzir a timeline atual para no maximo 4 marcos, ou transformar em faixa horizontal de marcos
- transformar "estrutura", "compromisso" e "diferenciais" em apoios dentro dos 5 capitulos, nao como paginas dentro da pagina

### 3. Fazer uma varredura de consistencia de dados
Arquivos com sinais de inconsistencias hoje:
- `src/components/home/about-summary.tsx`
- `src/components/home/about-section-expanded.tsx`
- `src/components/home/proof-of-solidity.tsx`
- `src/components/home/cta-section.tsx`
- `src/app/(main)/sobre/page.tsx`
- `src/app/(main)/jornada/page.tsx`
- `src/app/(main)/servicos/page.tsx`

Fazer:
- buscar por `2008`, `2009`, `2010`, `15+` e `18+`
- padronizar com a mesma base aprovada
- alinhar schema, metadata, estatisticas e copy visivel

## Criterios de aceite
- A home precisa comunicar a tese da marca em leitura de no maximo 20 a 30 segundos.
- A pagina `/sobre` precisa ter progressao logica clara: origem -> reputacao -> operacao -> confianca -> futuro.
- Nenhuma secao institucional deve depender de "textao" para ser entendida.
- Cada secao deve ter pelo menos 1 elemento de prova visual.
- A nova copy nao pode parecer institucional generica nem emocional demais.
- Datas e metricas precisam estar consistentes em todo o site.

## Observacao de posicionamento
O objetivo aqui nao e deixar a Attra mais "poetica". E deixa-la mais madura, clara e confiavel.

A referencia de linguagem e:
- menos texto de apresentacao
- mais prova de criterio
- mais sensacao de estrutura
- mais clareza de operacao

Sem citar concorrentes no site, a percepcao desejada e aproximar a Attra de marcas com postura mais consolidada e menos promocional.
