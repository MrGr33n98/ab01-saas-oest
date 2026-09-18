# DRONEHUB MCP ADAPTER V1 — ARCHITECTURE SPECIFICATION

---

### 1. Visão Geral e Princípios Fundamentais

O **DroneHub MCP Adapter V1** é a camada de interoperabilidade com modelos de inteligência artificial (AI Agents), desenhada segundo os mais rigorosos padrões de segurança multi-tenant, performance e canonicidade.

```
AI CLIENT (Claude / Antigravity / Agent)
   ↓ (JSON-RPC stdio / SSE)
MCP PLATFORM (@dronehub/mcp-adapter)
   ↓ (Tool Policy Guard: R0/R1 only)
Authentication & TenantContext (JWT derivation)
   ↓ (HTTP REST / API V1)
Canonical Rails API (Puma / Pundit / TenantScope)
   ↓
Domain Services & Query Objects (BuildCandidateSet, AnalyticsQueryService, ComparisonQuery)
   ↓
PostgreSQL / PostGIS (Source of Truth)
```

---

### 2. Regras Absolutas de Arquitetura

1. **Zero SQL Direto:** O MCP Adapter nunca se conecta diretamente ao PostgreSQL/PostGIS. Ele opera 100% através dos endpoints canônicos protegidos da API REST do Rails (`/api/v1/*`).
2. **Nenhuma Replicação de Regra de Negócio:** O cálculo de matching, filtragem espacial PostGIS, autorização de acesso e agregação de telemetria pertencem exclusivamente ao domínio Rails.
3. **Escopo Restrito de Risco (R0 e R1 apenas):**
   * **R0 — READ:** Consulta idempotente e segura (`missions.search`, `missions.get`, `operators.search`, `quotes.get_comparison`, `analytics.get_overview`, `analytics.get_funnel`, `analytics.get_webhooks_health`).
   * **R1 — ANALYZE:** Análise e matching determinístico sem efeitos colaterais (`matching.find_candidates`, `matching.explain_candidate`).
   * Todas as operações de escrita (R3 a R7) estão bloqueadas e rejeitadas na camada do Policy Gatekeeper.
4. **Isolamento Multi-Tenant Rigoroso:** O `organization_id` (tenant) é sempre derivado das credenciais criptografadas (`TenantContext`) e nunca aceito como parâmetro de entrada fornecido pelo LLM.

---

### 3. Componentes do Pacote (`packages/dronehub-mcp-adapter`)

* **`src/client/rails_client.ts`:** Cliente HTTP resiliente com injeção automática de `X-Request-Id`, `X-Correlation-Id`, `Authorization`, timeouts de 8s e política de retries apenas para erros transitórios (rejeitando retry em 401, 403, 404, 422).
* **`src/client/errors.ts`:** Normalização padronizada de erros HTTP Rails para envelopes `{ error: { code, message, request_id } }`.
* **`src/security/auth_context.ts`:** Parsing seguro de JWT e estabelecimento do `TenantContext`.
* **`src/security/tool_policy.ts`:** Validador que barra qualquer chamada fora dos níveis R0 e R1.
* **`src/observability/telemetry.ts`:** Logs estruturados em formato JSON com redação de credenciais e alta sinalização de observabilidade.
* **`src/registry.ts`:** Catálogo centralizado de tools com schemas Zod estritos.
* **`src/server.ts`:** Implementação do servidor MCP compatível com `@modelcontextprotocol/sdk`.
