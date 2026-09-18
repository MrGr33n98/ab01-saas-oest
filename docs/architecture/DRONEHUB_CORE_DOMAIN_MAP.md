# DRONEHUB CORE DOMAIN ARCHITECTURE MAP
## Missions → Geometry → Matching → Operators → Quotes → Execution

---

### 1. Visão Geral do Domínio Canônico

O DroneHub é uma plataforma SaaS B2B Multi-Tenant para orquestração de missões com drones, contratação de operadores verificados, processamento geoespacial e entrega de dados técnicos (ortomosaicos, inspeções termográficas, topografia e agronegócio).

```
                      +-----------------------------------+
                      |      CUSTOMER / ENTERPRISE        |
                      +-----------------------------------+
                                        |
                          1. Missions::Create (draft)
                          2. Missions::SetGeometry (AOI)
                          3. Add MissionProducts
                          4. Missions::Publish (published)
                                        |
                                        v
                      +-----------------------------------+
                      |      MATCHING ENGINE (PostGIS)    |
                      |  Matching::BuildCandidateSet      |
                      +-----------------------------------+
                                        |
                        Descoberta de operadores aptos
                        (cobertura espacial + verificação)
                                        |
                                        v
                      +-----------------------------------+
                      |       OPERATOR / PROPOSALS        |
                      +-----------------------------------+
                                        |
                          5. Quotes::Quote (submitted)
                          6. Quotes::QuoteItem (pricing)
                                        |
                                        v
                      +-----------------------------------+
                      |      ACCEPTANCE & ORDERS          |
                      |        Quotes::Accept             |
                      +-----------------------------------+
                                        |
                         - Quote: accepted
                         - Mission: operator_selected
                         - Order: pending_payment / created
                         - Marketplace Fee computada
                                        |
                                        v
                      +-----------------------------------+
                      |      EXECUTION & CAPTURE          |
                      +-----------------------------------+
                                        |
                          7. Uploads::CreateSession
                          8. Deliverables::Deliverable
                                        |
                                        v
                      +-----------------------------------+
                      |     APPROVAL & COMPLETION         |
                      |      Deliverables::Approve        |
                      +-----------------------------------+
                                        |
                         - Deliverable: approved
                         - Mission: completed
                         - Order: completed
                         - Telemetria: mission.completed
```

---

### 2. Inventário Estrutural do Repositório

#### 2.1 Backend (Rails 8.0.5 / Ruby >= 3.2.0)
* **Stack:** Rails API, PostgreSQL + PostGIS (geometria e polígonos), Devise JWT, Pundit RBAC, Sidekiq 7.3 (Redis), ActiveAdmin 3.2.
* **Diretórios de Domínio:**
  * `backend/app/models/missions/`: `Mission`, `MissionProduct`, `MissionRequirement`, `MissionAssignment`, `MissionStatusEvent`.
  * `backend/app/models/operators/`: `OperatorProfile`, `CoverageArea`, `Pilot`, `Drone`, `Payload`, `OperatorContract`, `PayoutProfile`.
  * `backend/app/models/quotes/`: `Quote`, `QuoteItem`.
  * `backend/app/models/orders/`: `Order`.
  * `backend/app/models/deliverables/`: `Deliverable`, `Asset`.
  * `backend/app/models/marketplace/`: `ServiceCategory`, `DataProduct`, `ServiceOffering`.
  * `backend/app/services/matching/`: `Matching::BuildCandidateSet`.
  * `backend/app/services/missions/`: `Create`, `Publish`, `SetGeometry`, `CalculateGeometry`.
  * `backend/app/services/quotes/`: `Accept`.
  * `backend/app/services/deliverables/`: `Approve`, `Reject`.
  * `backend/app/services/telemetry/`: `Collector`, `Sanitizer`, `AggregatorService`, `AnalyticsQueryService`.

#### 2.2 Frontend (Next.js 15 / React 19)
* **Stack:** Next.js App Router, TailwindCSS, Lucide React, TypeScript 5.6, Vitest.
* **Diretórios de Frontend:**
  * `frontend/app/dashboard/analytics/`: Página de analytics de telemetria.
  * `frontend/app/app/analytics/`: Página integrada de analytics.
  * `frontend/app/app/missions/`: Gestão e criação de missões.
  * `frontend/app/app/orders/`: Gestão de pedidos.
  * `frontend/app/operator/`: Portal de operadores (fleet, pilots, proposals, portfolio, payments).
  * `frontend/components/analytics/`: OverviewCards, FunnelChart, WebhooksHealthPanel, DateRangeFilter, Empty/Error states.
  * `frontend/lib/api/`: Clientes REST autenticados (`client.ts`, `analytics.ts`, `enterprise.ts`, `operator.ts`).
