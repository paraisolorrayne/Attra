Segue uma lista objetiva de tarefas para passar ao dev, organizada por área.

***

## 1. Estrutura de menus do CRM

1. Renomear o item “Clientes” para “Contatos” no menu CRM.  
2. Em “Contatos”, permitir listar todos os registros (leads, clientes, ex‑clientes) com filtro por status/tipo de contato.  
3. Manter “Cobranças”, mas prever relacionamento com vendas/oportunidades (campo para vincular cobrança a cliente e lead/oportunidade).  
4. Ajustar “Insights” para ser a área de relatórios de funil, canais, vendedores e vendas (ver itens da seção 4).

***

## 2. Tela de Leads – listagem e filtros

5. Implementar tabela de leads com as seguintes colunas principais:
   - Nome  
   - Telefone/WhatsApp  
   - Email  
   - Veículo de interesse (modelo/versão)  
   - Origem (formulário X, WhatsApp, Instagram, anúncio, etc.)  
   - Vendedor responsável  
   - Etapa do funil (enum)  
   - Probabilidade de fechamento (%)  
   - Data de criação  
   - Data do último contato  

6. Fazer o campo de busca pesquisar por: nome, telefone, email e veículo/placa.  
7. Implementar filtros avançados na listagem:
   - Filtro por etapa do funil  
   - Filtro por origem  
   - Filtro por vendedor responsável  
   - Filtro por data de criação (intervalo)  
   - Filtro por data de último contato (intervalo)  
   - Filtro por veículo/modelo  

8. Adicionar ações rápidas em cada linha da tabela:
   - Alterar etapa do funil  
   - Agendar/registrar follow‑up (data/hora + tipo: ligação, WhatsApp, visita, etc.)  
   - Adicionar nota/observação  
   - Botão para iniciar conversa via WhatsApp (link com número do lead)  
   - Botão para “Converter em cliente” quando etapa for “Fechado ganho”  

***

## 3. Modelo de funil e status

9. Implementar campo “etapa_do_funil” (enum) no lead com os valores sugeridos:
   - Novo lead  
   - Primeiro contato feito  
   - Visita agendada  
   - Visita realizada  
   - Proposta enviada  
   - Negociação  
   - Fechado ganho  
   - Fechado perdido  

10. Para “Fechado perdido”, incluir campo “motivo_perda” (enum ou texto) com opções como:
    - Preço  
    - Crédito recusado  
    - Comprou em outro lugar  
    - Desistiu da compra  
    - Outro (com campo texto)  

11. Exibir a etapa do funil como badge/select na listagem e no detalhe do lead.  
12. Garantir que a etapa seja usada:
    - Nos filtros da listagem  
    - Nos relatórios de “Insights” (funil, conversão, etc.)  

***

## 4. Tela de Insights – visão de vendas

13. Implementar painel de funil de vendas:
    - Cards com quantidade de leads por etapa  
    - Soma do valor potencial por etapa (se houver campo “valor_potencial” no lead/oportunidade)  
    - Taxas de conversão entre etapas (ex.: Novo → Contato, Contato → Visita, etc.)  

14. Implementar relatório por origem de lead:
    - Leads por canal (formulário site, WhatsApp, Instagram, anúncios, etc.)  
    - Quantidade de vendas (Fechado ganho) por canal  
    - Taxa de conversão por canal  
    - Ticket médio por canal  

15. Implementar relatório por vendedor:
    - Leads recebidos por vendedor  
    - Contatos feitos  
    - Visitas agendadas/realizadas  
    - Propostas enviadas  
    - Vendas (Fechado ganho)  
    - Taxa de conversão e valor total vendido por vendedor  

16. Implementar gráficos de vendas por período:
    - Vendas por dia/semana/mês  
    - Ticket médio por período  
    - Tempo médio de fechamento (data criação lead → data fechamento)  

***

## 5. Integração Leads → Clientes (Contatos) e Cobranças

17. Ao marcar um lead como “Fechado ganho”, criar fluxo para:
    - Converter o lead em registro de “Contato” (cliente)  
    - Manter vínculo entre lead original e contato criado  
    - Opcional: criar automaticamente uma “oportunidade/venda” associada ao cliente, veículo e vendedor  

18. Na ficha do contato (em “Contatos”), exibir visão 360º:
    - Dados do contato  
    - Histórico de leads/oportunidades relacionados  
    - Histórico de notas e interações (follow‑ups)  
    - Veículos de interesse e veículos comprados  
    - Cobranças e pagamentos associados  

19. Em “Cobranças”, garantir que cada cobrança possa ser ligada a:
    - Um contato (cliente)  
    - Uma venda/oportunidade  
    - Um veículo específico (quando fizer sentido)  

***

## 6. Modelo de dados (alto nível, para orientar dev)

20. Ajustar/criar entidades/tabelas (nomes livres, mas com esses campos mínimos):

- Leads:
  - id  
  - nome  
  - telefone  
  - email  
  - origem  
  - vendedor_responsavel_id  
  - etapa_do_funil (enum)  
  - motivo_perda (opcional)  
  - valor_potencial (opcional)  
  - veiculo_interesse_id (ou texto)  
  - data_criacao  
  - data_ultimo_contato  

- Interações/Atividades:
  - id  
  - lead_id ou contato_id  
  - tipo (ligação, WhatsApp, visita, email, etc.)  
  - data_hora  
  - responsável_id  
  - observacao  

- Contatos (clientes):
  - id  
  - nome  
  - telefone  
  - email  
  - tipo (lead, cliente, ex‑cliente)  
  - data_criacao  
  - demais campos de cadastro  

- Vendas/Oportunidades:
  - id  
  - lead_id  
  - contato_id  
  - veiculo_id  
  - valor_negociado  
  - data_fechamento  
  - vendedor_responsavel_id  

- Cobranças:
  - id  
  - contato_id  
  - venda_id (opcional)  
  - veiculo_id (opcional)  
  - valor  
  - status (em aberto, pago, vencido, etc.)  
  - data_vencimento  
  - data_pagamento (opcional)

Supabase
attraveiculosudi@gmail.com
P1WdkaHGo5dGrkz!