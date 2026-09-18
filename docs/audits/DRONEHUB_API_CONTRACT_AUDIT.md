# DRONEHUB API & FRONTEND CONTRACT AUDIT

---

### 1. Tabela de Contratos de API REST

| Método | Endpoint | Controller | Auth | Tenant Scoped | Policy | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/missions` | `Api::V1::MissionsController#index` | JWT / API Key | Sim | `Missions::MissionPolicy` | 200, 401, 403 |
| `POST` | `/api/v1/missions` | `Api::V1::MissionsController#create` | JWT / API Key | Sim | `Missions::MissionPolicy` | 201, 401, 403, 422 |
| `GET` | `/api/v1/missions/:id` | `Api::V1::MissionsController#show` | JWT / API Key | Sim | `Missions::MissionPolicy` | 200, 401, 403, 404 |
| `POST` | `/api/v1/missions/:id/publish` | `Api::V1::MissionsController#publish` | JWT / API Key | Sim | `Missions::MissionPolicy` | 200, 401, 403, 422 |
| `POST` | `/api/v1/quotes/:id/accept` | `Api::V1::QuotesController#accept` | JWT / API Key | Sim | `Quotes::QuotePolicy` | 200, 401, 403, 422 |
| `GET` | `/api/v1/analytics/overview` | `Api::V1::AnalyticsController#overview` | JWT / API Key | Sim | `AnalyticsPolicy` | 200, 401, 403 |
| `GET` | `/api/v1/analytics/funnel` | `Api::V1::AnalyticsController#funnel` | JWT / API Key | Sim | `AnalyticsPolicy` | 200, 401, 403 |
| `GET` | `/api/v1/analytics/webhooks` | `Api::V1::AnalyticsController#webhooks` | JWT / API Key | Sim | `AnalyticsPolicy` | 200, 401, 403 |
| `GET` | `/api/v1/webhooks` | `Api::V1::WebhooksController#index` | JWT / API Key | Sim | `WebhookEndpointPolicy` | 200, 401, 403 |
| `POST` | `/api/v1/webhooks` | `Api::V1::WebhooksController#create` | JWT / API Key | Sim | `WebhookEndpointPolicy` | 201, 401, 403, 422 |

---

### 2. Tabela de Auditoria do Frontend

| Rota Frontend | Componente / Página | API Client | Real API? | Mock? | Loading State? | Error State? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/analytics` | `AnalyticsDashboardPage` | `lib/api/analytics.ts` | **Sim** | **Não** | Skeletons | 401/403/Retry |
| `/app/analytics` | `AppAnalyticsPage` | `lib/api/analytics.ts` | **Sim** | **Não** | Skeletons | 401/403/Retry |
| `/app/missions` | `MissionsPage` | `lib/api/enterprise.ts` | **Sim** | **Não** | Spinners | Error banner |
| `/app/missions/new` | `NewMissionPage` | `lib/api/enterprise.ts` | **Sim** | **Não** | Submitting state | Validation |
| `/app/orders` | `OrdersPage` | `lib/api/enterprise.ts` | **Sim** | **Não** | Loading | Error state |
| `/operator/fleet` | `OperatorFleetPage` | `lib/api/operator.ts` | **Sim** | **Não** | Skeletons | Error state |
| `/operator/proposals` | `OperatorProposalsPage` | `lib/api/operator.ts` | **Sim** | **Não** | Skeletons | Error state |
