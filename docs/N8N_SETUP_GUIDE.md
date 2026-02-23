# N8N Lead Enrichment - Guia de Configuração

## Passo 1: Gerar o Webhook Secret

```bash
openssl rand -hex 32
```

Guarde este valor - será usado em ambos os lados.

---

## Passo 2: Configurar Variáveis de Ambiente

### No Next.js (.env.local):
```env
N8N_ENRICHMENT_WEBHOOK_URL=https://seu-n8n.com/webhook/enrichment
N8N_WEBHOOK_SECRET=seu_secret_gerado
```

### No N8N (Environment Variables - opcional):
```env
ATTRA_API_URL=https://attraveiculos.com.br
```

---

## Passo 3: Criar Credenciais no N8N

Vá em **Settings → Credentials** e crie:

### 1. Attra Webhook Auth (para receber dados)
- **Type**: Header Auth
- **Name**: `Attra Webhook Auth`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer seu_secret_gerado`

### 2. Attra API Auth (para enviar dados de volta)
- **Type**: Header Auth
- **Name**: `Attra API Auth`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer seu_secret_gerado`

### 3. Apollo.io API (opcional)
- **Type**: Header Auth
- **Name**: `Apollo.io API`
- **Header Name**: `x-api-key`
- **Header Value**: `sua_chave_apollo`
- **Como obter**: Crie conta gratuita em [app.apollo.io](https://app.apollo.io) → Settings → Integrations → API Keys
- **Free tier**: 100 enrichments/mês

### 4. BigDataCorp API (opcional)
- **Type**: Header Auth
- **Name**: `BigDataCorp API`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer sua_chave_bigdata`

---

## Passo 4: Importar o Workflow

1. No N8N, clique em **Menu (☰) → Import from File**
2. Selecione o arquivo `n8n-workflow-attra-lead-enrichment.json`
3. O workflow será importado com todos os nodes

---

## Passo 5: Conectar Credenciais

Após importar, clique em cada node e associe as credenciais:

| Node | Credencial |
|------|------------|
| Webhook Trigger | Attra Webhook Auth |
| Apollo.io Enrichment | Apollo.io API |
| BigDataCorp Lookup | BigDataCorp API |
| Send to Attra API | Attra API Auth |
| Send Error to Attra | Attra API Auth |

---

## Passo 6: Ativar o Workflow

1. Clique no toggle **Active** no canto superior direito
2. O webhook estará disponível em: `https://seu-n8n.com/webhook/enrichment`

---

## Estrutura do Workflow

```
[Webhook] → [Set Variables] → [Switch]
                                 ├── [Apollo.io] → [Normalize] → [Send to Attra]
                                 ├── [BigData]   → [Normalize] → [Send to Attra]
                                 └── [No Data]   →              → [Send to Attra]
                                       ↓ (erros)
                               [Error Handlers] → [Send Error to Attra]
                                                        ↓
                                               [Respond to Webhook]
```

---

## Payload de Entrada (do Next.js)

```json
{
  "profile_id": "uuid-do-perfil",
  "fingerprint_id": "uuid-do-fingerprint",
  "email": "lead@empresa.com",
  "phone": "34999999999",
  "name": "João Silva",
  "source": "form_submit",
  "timestamp": "2026-01-20T10:30:00Z"
}
```

---

## Payload de Saída (para Next.js)

```json
{
  "profile_id": "uuid-do-perfil",
  "fingerprint_id": "uuid-do-fingerprint",
  "source": "apollo",
  "success": true,
  "data": {
    "company": {
      "name": "Empresa X",
      "domain": "empresax.com.br",
      "industry": "Automotive",
      "employeesRange": "51-200"
    },
    "person": {
      "name": { "fullName": "João Silva", "givenName": "João", "familyName": "Silva" },
      "employment": { "title": "CEO" },
      "linkedin": { "handle": "joaosilva" }
    }
  }
}
```

---

## Testando o Workflow

```bash
curl -X POST https://seu-n8n.com/webhook/enrichment \
  -H "Authorization: Bearer seu_secret_gerado" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "test-123",
    "fingerprint_id": "fp-456",
    "email": "teste@empresa.com",
    "name": "Teste Lead",
    "source": "manual_test",
    "timestamp": "2026-01-20T10:00:00Z"
  }'
```

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| 401 Unauthorized | Verifique se o secret está correto em ambos os lados |
| Apollo.io não retorna dados | Verifique se a API key está ativa em [app.apollo.io](https://app.apollo.io) → Settings → API Keys |
| Dados não aparecem no Supabase | Verifique logs em `/api/webhooks/enrichment` |
| Workflow não executa | Verifique se está **Active** |

