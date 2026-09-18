# DRONEHUB MCP V1 — TOOL CATALOG

---

### Catálogo Oficial de Ferramentas Implementadas (R0 e R1)

| Tool Name | Domínio | Risk | Idempotente | Canonical Endpoint Rails | Descrição |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `analytics.get_overview` | Analytics | **R0** | Sim | `GET /api/v1/analytics/overview` | Consulta resumo consolidado de métricas e telemetria do tenant |
| `analytics.get_funnel` | Analytics | **R0** | Sim | `GET /api/v1/analytics/funnel` | Consulta taxas de conversão do funil da organização |
| `analytics.get_webhooks_health` | Analytics | **R0** | Sim | `GET /api/v1/analytics/webhooks` | Consulta métricas de entrega e taxas de erro de webhooks |
| `missions.search` | Missions | **R0** | Sim | `GET /api/v1/missions` | Lista e filtra missões da organização autenticada com paginação limitada (max 100) |
| `missions.get` | Missions | **R0** | Sim | `GET /api/v1/missions/:id` | Retorna o workspace completo de uma missão com entregáveis e status |
| `operators.search` | Marketplace | **R0** | Sim | `GET /api/v1/marketplace/operators` | Busca operadores homologados por serviço, estado (UF) ou avaliação mínima real |
| `matching.find_candidates` | Matching | **R1** | Sim | `GET /api/v1/missions/:id/candidates` | Executa o matching espacial canônico do Rails via PostGIS e regras de qualificação |
| `matching.explain_candidate` | Matching | **R1** | Sim | `GET /api/v1/missions/:id/candidates` | Transforma evidências reais em explicação estruturada sem fabricar dados |
| `quotes.get_comparison` | Commercial | **R0** | Sim | `GET /api/v1/missions/:id/quote-comparison` | Retorna comparação de propostas comerciais de uma missão em modo somente leitura |

---

### Detalhes das Ferramentas e Schemas

#### 1. `analytics.get_overview`
* **Input:** `{ start_date?: "YYYY-MM-DD", end_date?: "YYYY-MM-DD" }`
* **Output:** Métricas consolidadas (missões criadas, publicadas, cotações recebidas/aceitas, entregas finalizadas).

#### 2. `analytics.get_funnel`
* **Input:** `{ start_date?: "YYYY-MM-DD", end_date?: "YYYY-MM-DD" }`
* **Output:** Passos do funil com contagens e taxas percentuais de conversão.

#### 3. `analytics.get_webhooks_health`
* **Input:** `{ start_date?: "YYYY-MM-DD", end_date?: "YYYY-MM-DD" }`
* **Output:** Taxa de sucesso de webhooks e lista de falhas recentes reais.

#### 4. `missions.search`
* **Input:** `{ status?: enum, limit?: integer (1-100, default 25), offset?: integer (>= 0) }`
* **Output:** Array de missões do tenant autenticado com metadados de paginação.

#### 5. `missions.get`
* **Input:** `{ id: UUID }`
* **Output:** Objeto detalhado da missão, entregáveis, status da ordem e operador vinculado.

#### 6. `operators.search`
* **Input:** `{ service?: string, state?: string (UF 2 letras), min_rating?: float (0-5), limit?: integer (1-100) }`
* **Output:** Array de cards de operadores homologados reais.

#### 7. `matching.find_candidates`
* **Input:** `{ mission_id: UUID }`
* **Output:** Lista de operadores qualificados por cobertura PostGIS, verificação e serviços ativos.

#### 8. `matching.explain_candidate`
* **Input:** `{ mission_id: UUID, operator_id: UUID }`
* **Output:** Justificativa estruturada (`eligible`, `evidence`, `unknown`).

#### 9. `quotes.get_comparison`
* **Input:** `{ mission_id: UUID }`
* **Output:** Lista de cotações submetidas para a missão com faixa de valores e prazos.
