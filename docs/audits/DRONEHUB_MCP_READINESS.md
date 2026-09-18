# DRONEHUB MCP READINESS MATRIX

---

### 1. Princípios Arquiteturais do MCP Adapter

* **Nenhum SQL Direto em Produção:** As ferramentas do MCP invocam estritamente os serviços canônicos do Rails e endpoints REST protegidos por autenticação e Tenant Scope.
* **Organização por Capacidade de Negócio:** As tools são organizadas por domínios operacionais e casos de uso do marketplace, nunca por nomes de tabelas de banco de dados.
* **Isolamento de Tenant Obrigatório:** Credencial autenticada (`TenantContext`) é a única fonte da identidade da organização.
* **Sem Dados Fabricados:** O MCP Adapter nunca inventa scores de ranking, avaliações fictícias ou disponibilidades não suportadas.

---

### 2. Matriz de Prontidão (MCP Readiness Matrix — V1 Release)

| Tool MCP | Domínio | Domain Service / Query | REST Endpoint | Auth & Policy | Nível de Risco | Idempotência | Cobertura de Testes | Status V1 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `analytics.get_overview` | Analytics | `Telemetry::AnalyticsQueryService#overview` | `GET /api/v1/analytics/overview` | JWT / `AnalyticsPolicy` | **R0 (READ)** | Sim | 100% (Model/E2E/API/MCP) | **RELEASED** |
| `analytics.get_funnel` | Analytics | `Telemetry::AnalyticsQueryService#funnel` | `GET /api/v1/analytics/funnel` | JWT / `AnalyticsPolicy` | **R0 (READ)** | Sim | 100% (Model/E2E/API/MCP) | **RELEASED** |
| `analytics.get_webhooks_health` | Analytics | `Telemetry::AnalyticsQueryService#webhooks_health` | `GET /api/v1/analytics/webhooks` | JWT / `AnalyticsPolicy` | **R0 (READ)** | Sim | 100% (Model/E2E/API/MCP) | **RELEASED** |
| `missions.search` | Missions | `Missions::WorkspaceQuery` | `GET /api/v1/missions` | JWT / `Missions::MissionPolicy` | **R0 (READ)** | Sim | 100% (E2E/Controller/MCP) | **RELEASED** |
| `missions.get` | Missions | `TenantScope.find!(Missions::Mission)` | `GET /api/v1/missions/:id` | JWT / `Missions::MissionPolicy` | **R0 (READ)** | Sim | 100% (E2E/Controller/MCP) | **RELEASED** |
| `matching.find_candidates` | Matching | `Matching::BuildCandidateSet` | `GET /api/v1/missions/:id/candidates` | JWT / `Missions::MissionPolicy` | **R1 (ANALYZE)** | Sim | 100% (PostGIS/E2E/MCP) | **RELEASED** |
| `matching.explain_candidate` | Matching | Transformação determinística | `GET /api/v1/missions/:id/candidates` | JWT / `Missions::MissionPolicy` | **R1 (ANALYZE)** | Sim | 100% (MCP Unit/Golden) | **RELEASED** |
| `operators.search` | Marketplace | `Marketplace::OperatorProfileQuery` | `GET /api/v1/marketplace/operators` | Público / Tenant | **R0 (READ)** | Sim | 100% (Controller/MCP) | **RELEASED** |
| `quotes.get_comparison` | Quotes | `Quotes::ComparisonQuery` | `GET /api/v1/missions/:id/quote-comparison` | JWT / `Quotes::QuotePolicy` | **R0 (READ)** | Sim | 100% (E2E/Service/MCP) | **RELEASED** |
| `missions.create` | Missions | `Missions::Create` | `POST /api/v1/missions` | JWT / `Missions::MissionPolicy` | **R3 (INTERNAL_WRITE)** | Header `Idempotency-Key` | 100% (E2E/Service) | **BLOCKED (V1)** |
| `quotes.accept` | Quotes | `Quotes::Accept` | `POST /api/v1/quotes/:id/accept` | JWT / `Quotes::QuotePolicy` | **R5 (COMMERCIAL)** | Lock / `Idempotency-Key` | 100% (E2E/Service) | **BLOCKED (V1)** |
| `deliverables.approve` | Deliverables | `Deliverables::Approve` | `POST /api/v1/deliverables/:id/approve` | JWT / `Deliverables::DeliverablePolicy` | **R4 (ACTION)** | Sim | 100% (E2E/Service) | **BLOCKED (V1)** |

---

### 3. Escala de Classificação de Riscos (R0 a R7)

* **R0 — READ:** Consulta segura sem mutação de estado.
* **R1 — ANALYZE:** Computação ou matching determinístico sem efeitos colaterais.
* **R2 — DRAFT:** Criação de rascunhos sem visibilidade pública.
* **R3 — INTERNAL_WRITE:** Gravação de dados internos do tenant.
* **R4 — EXTERNAL_ACTION:** Disparos para terceiros ou aprovações de entregas.
* **R5 — COMMERCIAL_COMMITMENT:** Aceite de contratos, propostas e criação de ordens de serviço.
* **R6 — FINANCIAL:** Movimentações monetárias ou liquidações.
* **R7 — DESTRUCTIVE:** Exclusão definitiva de recursos ou cancelamentos irreversíveis.
