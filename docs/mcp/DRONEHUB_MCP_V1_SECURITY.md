# DRONEHUB MCP V1 — SECURITY SPECIFICATION

---

### 1. Modelo de Segurança Multi-Tenant

* **Derivação de Identidade Criptográfica:** O MCP Adapter obtém a identidade da organização (`organization_id`) e do usuário (`user_id`) exclusivamente a partir de credenciais autenticadas (JWT assinado ou API Key de tenant).
* **Parâmetros de Tenant Não-Confiáveis do LLM Proibidos:** É expressamente proibido aceitar `tenant_id` ou `organization_id` como argumento do schema de entrada de qualquer ferramenta. O tenant é injetado diretamente nos cabeçalhos (`Authorization`, `X-Organization-Id`) para validação pelo Rails `TenantScope`.
* **Fail-Closed Default:** Qualquer requisição onde o token esteja ausente, expirado ou inválido é abortada imediatamente sem envio de requests ao backend.

---

### 2. Proteção Cross-Tenant

| Cenário de Acesso | Ação da Camada MCP | Resposta Rails | Status Final MCP |
| :--- | :--- | :--- | :--- |
| **Tenant A $\rightarrow$ Missão Própria** | Encaminha com headers do Tenant A | `200 OK` (Pundit autorizado) | `McpSuccessResponse` |
| **Tenant A $\rightarrow$ Missão do Tenant B** | Encaminha com headers do Tenant A | `404 Not Found` (TenantScope) | `McpErrorResponse (NOT_FOUND)` |
| **Tenant A $\rightarrow$ Candidatos do Tenant B** | Encaminha com headers do Tenant A | `404 Not Found` (TenantScope) | `McpErrorResponse (NOT_FOUND)` |
| **Tenant A $\rightarrow$ Cotações do Tenant B** | Encaminha com headers do Tenant A | `404 Not Found` (TenantScope) | `McpErrorResponse (NOT_FOUND)` |

---

### 3. Validação Estrita de Schemas (Zod)

* Todos os schemas de parâmetros utilizam `.strict()`, rejeitando imediatamente qualquer campo extra não mapeado (prevenindo *parameter pollution* e injeções).
* Validação de UUIDs canônicos (RFC 4122) em todos os identificadores de entidades.
* Limites máximos rígidos para paginação (`limit <= 100`) para evitar degradação de performance por sobrecarga de memória.

---

### 4. Política de Redação de Logs e Observabilidade

* O logger de telemetria MCP nunca registra o cabeçalho `Authorization`, tokens JWT, senhas ou dados sensíveis de pagamento.
* Registra apenas metadados de execução (`tool`, `risk_level`, `organization_id`, `request_id`, `duration_ms`, `status`, `error_code`).
