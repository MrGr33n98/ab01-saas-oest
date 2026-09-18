# DRONEHUB MCP V1 — API CONTRACT SPECIFICATION

---

### 1. Formato Padrão de Resposta MCP

Todas as ferramentas do catálogo MCP retornam respostas uniformes seguindo os envelopes abaixo:

#### Sucesso (`McpSuccessResponse<T>`):
```json
{
  "data": { ... },
  "meta": {
    "request_id": "84826b52-78d1-443b-8518-ff352bb05917",
    "duration_ms": 45,
    "pagination": {
      "page": 1,
      "per_page": 25
    }
  }
}
```

#### Erro (`McpErrorResponse`):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Mission not found in tenant scope.",
    "request_id": "84826b52-78d1-443b-8518-ff352bb05917",
    "details": null
  }
}
```

---

### 2. Mapeamento de Códigos de Status HTTP

| Status HTTP Rails | Código MCP | Significado Canônico | Retry Permitido? |
| :--- | :--- | :--- | :--- |
| `200 OK` / `201 Created` | N/A | Sucesso na operação | N/A |
| `400 Bad Request` | `BAD_REQUEST` | Parâmetros malformados ou inválidos | **NÃO** |
| `401 Unauthorized` | `UNAUTHORIZED` | Token ausente, inválido ou expirado | **NÃO** |
| `403 Forbidden` | `FORBIDDEN` | Ação bloqueada pela policy Pundit | **NÃO** |
| `404 Not Found` | `NOT_FOUND` | Recurso não existe no tenant | **NÃO** |
| `422 Unprocessable Entity` | `VALIDATION_ERROR` | Falha de validação de regras de negócio | **NÃO** |
| `429 Too Many Requests` | `RATE_LIMITED` | Limite de requisições atingido | **SIM** (com `Retry-After`) |
| `500 Internal Server Error`| `INTERNAL_ERROR` | Erro não tratado no servidor | **NÃO** |
| `502 / 503 / 504` | `GATEWAY_ERROR` | Falha transitória de infraestrutura | **SIM** (backoff exponencial) |
| Timeout / Abort | `TIMEOUT` | Excedido limite de 8000ms | **SIM** (máx 2 tentativas) |

---

### 3. Contrato de Matching Candidate (`matching.find_candidates`)

```json
{
  "data": [
    {
      "operator_id": "11111111-2222-3333-4444-555555555555",
      "organization_id": "66666666-7777-8888-9999-000000000000",
      "slug": "aerovision-topografia",
      "headline": "Topografia de Precisão e Batimetria",
      "score": null,
      "band": "eligible",
      "reasons": [
        {
          "key": "eligible",
          "label": "Cobertura + verificado + aceitando jobs"
        }
      ],
      "algorithm_version": "v1"
    }
  ],
  "meta": {
    "request_id": "...",
    "duration_ms": 32
  }
}
```
*Nota:* `score` permanece `null` no V1, pois não há modelo de machine learning de ranking em produção nesta fase. Nenhuma pontuação arbitrária é inventada pelo MCP.
