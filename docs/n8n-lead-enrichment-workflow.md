# N8N Lead Enrichment Workflow - Attra Veículos

## Visão Geral

Este workflow recebe dados de visitantes identificados e enriquece com informações de APIs externas.

```
[Webhook Trigger] → [Set Variables] → [Switch: Has Email?]
                                            ↓
                    [Clearbit Lookup] ← [Yes]  [No] → [BigDataCorp Phone]
                            ↓                              ↓
                    [Merge Results] ←←←←←←←←←←←←←←←←←←←←←←←
                            ↓
                    [Send to Attra API]
```

## Configuração do Webhook Secret

### Gerando o Secret
```bash
openssl rand -hex 32
```

### Configurar em ambos os lados:
- **Next.js (.env.local)**: `N8N_WEBHOOK_SECRET=seu_secret_gerado`
- **N8N (Credentials)**: Header Auth com o mesmo secret

---

## NODE 1: Webhook Trigger

**Tipo**: Webhook  
**Método**: POST  
**Path**: `/enrichment`  
**Authentication**: Header Auth

**Header Auth Configuration**:
- Name: `Authorization`
- Value: `Bearer seu_secret_gerado`

**Payload Recebido**:
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

## NODE 2: Set Variables

**Tipo**: Set  
**Configuração**:
```json
{
  "values": {
    "profile_id": "={{ $json.profile_id }}",
    "fingerprint_id": "={{ $json.fingerprint_id }}",
    "email": "={{ $json.email }}",
    "phone": "={{ $json.phone }}",
    "name": "={{ $json.name }}",
    "has_email": "={{ !!$json.email }}",
    "has_phone": "={{ !!$json.phone }}"
  }
}
```

---

## NODE 3: Switch (Route by Data)

**Tipo**: Switch  
**Condições**:
- **Output 0 (Has Email)**: `{{ $json.has_email }}` equals `true`
- **Output 1 (Phone Only)**: `{{ $json.has_phone }}` equals `true`
- **Fallback**: Continue sem enriquecimento

---

## NODE 4A: Clearbit Enrichment (Email)

**Tipo**: HTTP Request  
**Método**: GET  
**URL**: `https://person.clearbit.com/v2/combined/find`

**Query Parameters**:
```
email={{ $json.email }}
```

**Headers**:
```
Authorization: Bearer sk_clearbit_api_key
```

**Response Example**:
```json
{
  "person": {
    "name": { "fullName": "João Silva", "givenName": "João", "familyName": "Silva" },
    "employment": { "title": "CEO", "company": "Empresa X" },
    "linkedin": { "handle": "joaosilva" }
  },
  "company": {
    "name": "Empresa X",
    "domain": "empresax.com.br",
    "category": { "industry": "Automotive" },
    "metrics": { "employeesRange": "51-200" }
  }
}
```

---

## NODE 4B: BigDataCorp (Phone - Brazil)

**Tipo**: HTTP Request  
**Método**: POST  
**URL**: `https://api.bigdatacorp.com.br/v2/pessoas`

**Headers**:
```
Authorization: Bearer bigdata_api_key
Content-Type: application/json
```

**Body**:
```json
{
  "Datasets": ["basic_data", "phones"],
  "q": "doc{{{ $json.phone }}}"
}
```

---

## NODE 5: Merge Results

**Tipo**: Set
**Configuração** (normaliza dados de diferentes fontes):

```json
{
  "values": {
    "source": "={{ $node['Switch'].json.has_email ? 'clearbit' : 'bigdata' }}",
    "success": true,
    "data": {
      "company": {
        "name": "={{ $json.company?.name || $json.razao_social || null }}",
        "domain": "={{ $json.company?.domain || null }}",
        "industry": "={{ $json.company?.category?.industry || $json.atividade_principal || null }}",
        "employeesRange": "={{ $json.company?.metrics?.employeesRange || null }}"
      },
      "person": {
        "name": {
          "fullName": "={{ $json.person?.name?.fullName || $json.nome || $node['Set Variables'].json.name }}",
          "givenName": "={{ $json.person?.name?.givenName || null }}",
          "familyName": "={{ $json.person?.name?.familyName || null }}"
        },
        "employment": {
          "title": "={{ $json.person?.employment?.title || null }}"
        },
        "linkedin": {
          "handle": "={{ $json.person?.linkedin?.handle || null }}"
        }
      }
    }
  }
}
```

---

## NODE 6: Send to Attra API

**Tipo**: HTTP Request
**Método**: POST
**URL**: `https://attraveiculos.com.br/api/webhooks/enrichment`

**Headers**:
```
Authorization: Bearer seu_secret_gerado
Content-Type: application/json
```

**Body**:
```json
{
  "profile_id": "={{ $node['Set Variables'].json.profile_id }}",
  "fingerprint_id": "={{ $node['Set Variables'].json.fingerprint_id }}",
  "source": "={{ $json.source }}",
  "success": "={{ $json.success }}",
  "data": "={{ $json.data }}"
}
```

---

## NODE 7: Error Handler

**Tipo**: Error Trigger
**Conectado a**: Todos os nodes HTTP

**Ação em caso de erro**: HTTP Request para Attra com `success: false`

```json
{
  "profile_id": "={{ $node['Set Variables'].json.profile_id }}",
  "fingerprint_id": "={{ $node['Set Variables'].json.fingerprint_id }}",
  "source": "n8n",
  "success": false,
  "data": {
    "error": "={{ $json.message || 'Enrichment failed' }}"
  }
}
```

---

## Importar Workflow Completo

Cole este JSON no N8N (Menu → Import from JSON):

```json
{
  "name": "Attra Lead Enrichment",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "enrichment",
        "httpMethod": "POST",
        "authentication": "headerAuth",
        "responseMode": "responseNode"
      },
      "credentials": {
        "httpHeaderAuth": { "name": "Attra Webhook Auth" }
      }
    },
    {
      "name": "Set Variables",
      "type": "n8n-nodes-base.set",
      "position": [450, 300],
      "parameters": {
        "values": {
          "string": [
            { "name": "profile_id", "value": "={{ $json.profile_id }}" },
            { "name": "fingerprint_id", "value": "={{ $json.fingerprint_id }}" },
            { "name": "email", "value": "={{ $json.email }}" },
            { "name": "phone", "value": "={{ $json.phone }}" },
            { "name": "name", "value": "={{ $json.name }}" }
          ],
          "boolean": [
            { "name": "has_email", "value": "={{ !!$json.email }}" },
            { "name": "has_phone", "value": "={{ !!$json.phone }}" }
          ]
        }
      }
    },
    {
      "name": "Switch",
      "type": "n8n-nodes-base.switch",
      "position": [650, 300],
      "parameters": {
        "rules": {
          "rules": [
            { "value1": "={{ $json.has_email }}", "value2": true },
            { "value1": "={{ $json.has_phone }}", "value2": true }
          ]
        }
      }
    },
    {
      "name": "Send to Attra",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1050, 300],
      "parameters": {
        "method": "POST",
        "url": "https://attraveiculos.com.br/api/webhooks/enrichment",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "profile_id", "value": "={{ $node['Set Variables'].json.profile_id }}" },
            { "name": "source", "value": "clearbit" },
            { "name": "success", "value": true },
            { "name": "data", "value": "={{ $json }}" }
          ]
        }
      }
    }
  ],
  "connections": {
    "Webhook": { "main": [[{ "node": "Set Variables", "type": "main", "index": 0 }]] },
    "Set Variables": { "main": [[{ "node": "Switch", "type": "main", "index": 0 }]] }
  }
}
```

---

## Configurar Credenciais no N8N

### 1. Header Auth (para webhook receber)
- **Name**: `Attra Webhook Auth`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer seu_secret_gerado`

### 2. Header Auth (para enviar de volta)
- **Name**: `Attra API Auth`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer seu_secret_gerado`

### 3. Clearbit API
- **Name**: `Clearbit`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer sk_your_clearbit_key`

### 4. BigDataCorp API (opcional)
- **Name**: `BigDataCorp`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer your_bigdata_key`

---

## Testando o Workflow

### 1. Teste Manual via cURL:
```bash
curl -X POST https://webhook.dexidigital.com.br/webhook/enrichment \
  -H "Authorization: Bearer seu_secret_gerado" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "test-uuid-123",
    "fingerprint_id": "test-fp-456",
    "email": "teste@empresa.com",
    "phone": null,
    "name": "Teste Lead",
    "source": "manual_test",
    "timestamp": "2026-01-20T10:00:00Z"
  }'
```

### 2. Verificar no Supabase:
```sql
SELECT * FROM visitor_profiles WHERE id = 'test-uuid-123';
SELECT * FROM identity_events WHERE profile_id = 'test-uuid-123';
```

---

## Boas Práticas de Segurança

1. **Nunca commite o secret** - Use `.env.local` (já está no `.gitignore`)
2. **Rotacione secrets periodicamente** - A cada 90 dias
3. **Use HTTPS sempre** - Nunca HTTP para webhooks
4. **Monitore logs** - Verifique tentativas de acesso não autorizadas
5. **Rate limiting** - Configure no N8N para evitar abuse

