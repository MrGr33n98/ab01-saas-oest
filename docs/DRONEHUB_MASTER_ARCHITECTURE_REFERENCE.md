# DRONEHUB — MASTER ARCHITECTURE REFERENCE
## Arquitetura Canônica de Backend, Banco, ActiveAdmin, API, RBAC e Operações
### Rails API + PostgreSQL + ActiveAdmin — Enterprise SaaS / Marketplace

**Status:** Documento mestre de referência  
**Objetivo:** substituir decisões fragmentadas por uma arquitetura canônica, auditável e replicável.  
**Uso:** DroneHub e futuros SaaS derivados do mesmo foundation.

---

# 0. COMO LER ESTE DOCUMENTO

Este documento separa explicitamente três camadas:

1. **AS-IS observado** — aquilo que aparece no SQL e nas telas de referência.
2. **Problemas estruturais** — inconsistências, ambiguidades e riscos que não devem ser carregados adiante.
3. **TO-BE canônico** — arquitetura que o DroneHub deve adotar.

A referência visual antiga é útil para descobrir a amplitude funcional do backoffice, mas **não deve ser copiada literalmente**. O alvo é um backend/admin moderno, multi-tenant, com RBAC, contratos de API, state machines, auditoria e integridade no PostgreSQL.

---

# 1. RESUMO EXECUTIVO

O DroneHub deve ser tratado como uma plataforma composta por quatro produtos acoplados por contratos estáveis:

```text
DRONEHUB PLATFORM
│
├── Marketplace
│   ├── Operators / Providers
│   ├── Pilots
│   ├── Drones
│   ├── Services
│   ├── Categories
│   └── Reviews / Reputation
│
├── Operations
│   ├── Projects
│   ├── Missions
│   ├── Assignments
│   ├── Flights
│   ├── Deliverables
│   └── Compliance
│
├── Commerce
│   ├── Requests
│   ├── Quotes
│   ├── Orders
│   ├── Contracts
│   ├── Payments
│   ├── Payouts
│   └── Disputes
│
└── SaaS Platform
    ├── Identity
    ├── Organizations / Tenancy
    ├── RBAC
    ├── Plans / Billing
    ├── Entitlements
    ├── Growth
    ├── Content
    ├── Community
    ├── Admin
    └── Audit / Security / Observability
```

Regra principal:

```text
DATABASE
→ MODEL
→ DOMAIN SERVICE
→ POLICY
→ CONTROLLER / ADMIN ACTION
→ SERIALIZER
→ API CONTRACT
→ TEST
→ AUDIT EVENT
```

Nenhuma feature crítica é considerada pronta se um elo dessa cadeia estiver ausente.

---

# 2. AS-IS — LEITURA DO SQL FORNECIDO

O arquivo SQL contém uma mistura de estruturas de aplicação com estruturas de infraestrutura/autenticação/storage. Isso indica que o dump foi gerado de um ambiente com componentes de plataforma no mesmo catálogo.

## 2.1 Entidades de negócio claramente identificáveis

| Tabela | Papel inferido |
|---|---|
| `categories` | taxonomia básica |
| `category_products` | relação categoria ↔ produto |
| `products` | produtos/perfis |
| `impressions` | métricas/agregados de impressões |
| `leads` | métricas/agregados de leads |
| `reviews` | métricas/agregados de reviews |

### Estruturas observadas

```text
categories
- id
- name

products
- id
- name

impressions
- id
- impression_type
- type_id
- date
- value

leads
- id
- lead_type
- type_id
- date
- value

reviews
- id
- review_type
- type_id
- date
- value
```

## 2.2 Estruturas de plataforma encontradas

O dump também contém elementos típicos de autenticação, SSO, MFA, storage, realtime e vault:

```text
users
sessions
refresh_tokens
identities
mfa_factors
mfa_challenges
mfa_amr_claims
sso_providers
sso_domains
saml_providers
objects
buckets
s3_multipart_uploads
secrets
audit_log_entries
messages
subscription
...
```

Esses componentes devem ser classificados como **infraestrutura de plataforma**, não como domínio de negócio do DroneHub.

## 2.3 Alerta de qualidade do dump

Há sinais de extração imperfeita ou flattening de schemas, por exemplo:

```text
category_products
- product_id
- product_id
- product_id
- category_id
- category_id
- category_id
```

e outras duplicações de colunas no arquivo.

Portanto:

> este SQL é válido como fonte de descoberta, mas não deve ser tratado como DDL canônico para gerar migrations sem verificação.

A migração para a arquitetura alvo deve partir de migrations Rails novas, explícitas e testadas.

---

# 3. PRINCÍPIOS NÃO NEGOCIÁVEIS

## 3.1 Multi-tenancy explícito

Toda entidade privada deve pertencer direta ou indiretamente a uma `organization`.

```text
organization_id
```

deve ser propagado de forma consistente nos bounded contexts em que isolamento for necessário.

Nunca:

```ruby
Order.find(params[:id])
```

Preferir:

```ruby
current_organization.orders.find(params[:id])
```

ou um `TenantScope` canônico.

---

## 3.2 Integridade no PostgreSQL

Rails validation não substitui banco.

Toda regra estrutural importante deve considerar:

```text
NOT NULL
FOREIGN KEY
UNIQUE
CHECK
INDEX
EXCLUSION / LOCKING
```

---

## 3.3 Identidade ≠ Organização ≠ Membership ≠ Entitlement

Manter separados:

```text
User
Organization
OrganizationMembership
ProductEntitlement
ProviderProfile
```

Um usuário pode pertencer a várias organizações, possuir papéis diferentes e ter acesso apenas a determinados produtos/recursos.

---

## 3.4 Status não é parâmetro livre

Nunca permitir:

```text
PATCH /orders/:id
{ "status": "paid" }
```

para estados críticos.

Preferir comandos:

```text
POST /quotes/:id/accept
POST /orders/:id/cancel
POST /payments/:id/refund
POST /missions/:id/complete
POST /reviews/:id/approve
```

---

## 3.5 ActiveAdmin não é bypass de domínio

Proibido como padrão:

```ruby
resource.update!(status: :approved)
```

Fluxo canônico:

```text
ActiveAdmin action
→ Pundit
→ Application Service / Command
→ Transaction
→ Domain
→ AuditLog
```

---

# 4. BOUNDED CONTEXTS CANÔNICOS

## 4.1 Identity

```text
User
UserProfile
Session
IdentityProvider
Invitation
ApiClient
ApiCredential
```

## 4.2 Tenancy

```text
Organization
OrganizationMembership
OrganizationRole
OrganizationSetting
OrganizationDomain
Team
Department
```

## 4.3 RBAC

```text
Role
Permission
RolePermission
MembershipRole
AdminRoleAssignment
```

## 4.4 Marketplace

```text
Provider
ProviderProfile
Pilot
Drone
DroneModel
Service
ServiceCategory
CoverageArea
PortfolioItem
Certification
Badge
BadgeAward
```

## 4.5 Projects & Missions

```text
Project
Mission
MissionAssignment
MissionAction
MissionStatusHistory
Flight
FlightLog
Deliverable
GeoAsset
MissionDocument
```

## 4.6 Commerce

```text
ServiceRequest
Quote
QuoteItem
Order
OrderItem
Contract
Invoice
Payment
Refund
Payout
Dispute
```

## 4.7 Reviews & Reputation

```text
Review
ReviewModeration
ReviewResponse
ReviewCampaign
ReviewInvitation
RatingAggregate
```

## 4.8 SaaS Billing

```text
Plan
PlanPrice
FeatureGroup
Feature
PlanFeature
Subscription
SubscriptionItem
Entitlement
UsageRecord
BillingEvent
```

## 4.9 Growth

```text
Lead
LeadEvent
Campaign
Advertisement
AdEvent
Sponsorship
Attribution
```

## 4.10 Content

```text
Article
ContentPage
MediaAsset
SeoMetadata
Tag
```

## 4.11 Community

```text
Question
Answer
Discussion
ModerationFlag
AbuseReport
```

## 4.12 Platform

```text
AuditLog
SecurityEvent
WebhookEndpoint
WebhookDelivery
Integration
ImportJob
ExportJob
Notification
FeatureFlag
SystemEvent
```

---

# 5. SCHEMA MASTER — CORE

## 5.1 users

```text
users
- id bigint PK
- public_id uuid/ulid UNIQUE NOT NULL
- email citext UNIQUE NOT NULL
- encrypted_password
- name
- phone
- status NOT NULL
- locale
- timezone
- email_confirmed_at
- last_sign_in_at
- sign_in_count
- mfa_enabled boolean NOT NULL default false
- metadata jsonb NOT NULL default {}
- created_at NOT NULL
- updated_at NOT NULL
- deleted_at
```

### Índices

```text
UNIQUE(email) WHERE deleted_at IS NULL
UNIQUE(public_id)
INDEX(status)
INDEX(deleted_at)
```

---

## 5.2 organizations

```text
organizations
- id
- public_id
- name
- legal_name
- slug
- organization_type
- tax_id
- status
- country_code
- timezone
- locale
- website
- email
- phone
- metadata jsonb
- created_at
- updated_at
- deleted_at
```

### organization_type

```text
customer
provider
operator
partner
internal
```

---

## 5.3 organization_memberships

```text
organization_memberships
- id
- organization_id FK
- user_id FK
- status
- invited_by_id FK users
- approved_by_id FK users
- invited_at
- accepted_at
- suspended_at
- revoked_at
- metadata jsonb
- created_at
- updated_at
```

### Estados

```text
invited
pending
active
suspended
revoked
rejected
```

### Constraint

```text
UNIQUE(organization_id, user_id)
```

---

# 6. RBAC MASTER

## 6.1 roles

```text
roles
- id
- key
- name
- scope_type
- system
```

## 6.2 permissions

```text
permissions
- id
- key
- domain
- action
- description
```

Exemplos:

```text
missions.read
missions.create
missions.assign
missions.cancel
quotes.read
quotes.create
quotes.accept
billing.read
billing.refund
reviews.moderate
users.manage
platform.impersonate
```

## 6.3 role_permissions

```text
role_permissions
- role_id
- permission_id
UNIQUE(role_id, permission_id)
```

## 6.4 membership_roles

```text
membership_roles
- organization_membership_id
- role_id
UNIQUE(organization_membership_id, role_id)
```

## 6.5 Roles administrativos padrão

```text
super_admin
operations_admin
billing_admin
support_admin
content_admin
moderation_admin
compliance_admin
growth_admin
security_admin
analytics_viewer
```

---

# 7. MARKETPLACE MASTER

## 7.1 providers

```text
providers
- id
- organization_id FK
- public_id
- slug
- display_name
- legal_name
- short_description
- description
- website
- foundation_year
- status
- verified_at
- premium_until
- rating_average
- reviews_count
- metadata jsonb
- created_at
- updated_at
```

Provider é o perfil público/comercial. `Organization` continua sendo o tenant.

---

## 7.2 provider_contacts

```text
provider_contacts
- provider_id
- kind
- value
- label
- primary
- verified_at
```

---

## 7.3 provider_addresses

```text
provider_addresses
- provider_id
- kind
- country_code
- state
- city
- postal_code
- line1
- line2
- latitude
- longitude
```

---

## 7.4 services

```text
services
- id
- organization_id
- provider_id
- public_id
- service_category_id
- name
- slug
- description
- status
- pricing_model
- base_price_cents
- currency
- metadata
- created_at
- updated_at
```

---

## 7.5 service_categories

```text
service_categories
- id
- parent_id
- name
- slug
- description
- position
- status
- metadata
```

---

## 7.6 pilots

```text
pilots
- id
- organization_id
- user_id
- public_id
- status
- license_number
- license_expires_at
- experience_level
- verified_at
- metadata
```

---

## 7.7 drones

```text
drones
- id
- organization_id
- public_id
- drone_model_id
- serial_number
- registration_number
- status
- acquisition_date
- last_maintenance_at
- next_maintenance_at
- metadata
```

---

## 7.8 drone_models

```text
drone_models
- id
- manufacturer
- model
- category
- max_flight_minutes
- max_payload_grams
- metadata
```

---

## 7.9 certifications

```text
certifications
- id
- organization_id
- subject_type
- subject_id
- certification_type
- authority
- number
- issued_at
- expires_at
- status
- document_id
```

Polimorfismo aqui é aceitável se bem limitado e testado.

---

## 7.10 coverage_areas

```text
coverage_areas
- id
- organization_id
- service_id
- country_code
- state_code
- city
- geometry/geography
- radius_km
```

Se PostGIS estiver disponível, preferir `geography` + índice GIST.

---

# 8. PROJECTS & MISSIONS

## 8.1 projects

```text
projects
- id
- organization_id
- public_id
- customer_organization_id
- name
- description
- status
- starts_at
- ends_at
- created_by_id
- metadata
```

## 8.2 missions

```text
missions
- id
- organization_id
- project_id
- public_id
- service_id
- customer_organization_id
- operator_organization_id
- title
- description
- status
- priority
- scheduled_start_at
- scheduled_end_at
- actual_start_at
- actual_end_at
- latitude
- longitude
- geometry/geography
- requirements jsonb
- created_by_id
- approved_by_id
- approved_at
- cancelled_at
- cancellation_reason
- lock_version
- created_at
- updated_at
```

### State machine

```text
draft
→ submitted
→ quoted
→ contracted
→ scheduled
→ assigned
→ in_progress
→ processing
→ quality_review
→ delivered
→ accepted
→ completed

terminal:
cancelled
rejected
```

Transições devem ser validadas em service/command.

---

## 8.3 mission_assignments

```text
mission_assignments
- mission_id
- pilot_id
- drone_id
- assigned_by_id
- status
- starts_at
- ends_at
- accepted_at
- rejected_at
```

Constraint conceitual:

```text
piloto e drone devem pertencer ao tenant/operador autorizado para a missão
```

---

## 8.4 mission_actions

```text
mission_actions
- mission_id
- actor_id
- action
- from_status
- to_status
- notes
- metadata
- created_at
```

Serve como trilha operacional; não substitui o `audit_logs` de plataforma.

---

## 8.5 deliverables

```text
deliverables
- id
- organization_id
- mission_id
- public_id
- kind
- title
- status
- storage_key
- content_type
- byte_size
- checksum
- uploaded_by_id
- approved_by_id
- approved_at
- rejected_at
- metadata
- created_at
- updated_at
```

Estados:

```text
draft
uploaded
processing
ready
under_review
approved
rejected
published
archived
```

---

# 9. COMMERCE MASTER

## 9.1 service_requests

```text
service_requests
- id
- organization_id
- public_id
- requester_organization_id
- service_category_id
- title
- description
- status
- budget_min_cents
- budget_max_cents
- currency
- desired_start_at
- desired_end_at
- location_data jsonb
- requirements jsonb
- created_by_id
```

---

## 9.2 quotes

```text
quotes
- id
- organization_id
- public_id
- service_request_id
- provider_organization_id
- status
- subtotal_cents
- tax_cents
- fees_cents
- total_cents
- currency
- valid_until
- terms
- created_by_id
- accepted_at
- rejected_at
- lock_version
```

### Estados

```text
draft
submitted
viewed
negotiating
accepted
rejected
expired
cancelled
```

---

## 9.3 quote_items

```text
quote_items
- quote_id
- description
- quantity
- unit_price_cents
- total_cents
- metadata
```

`total_cents` deve ser validado/derivado server-side.

---

## 9.4 orders

```text
orders
- id
- organization_id
- public_id
- quote_id
- buyer_organization_id
- seller_organization_id
- status
- subtotal_cents
- fees_cents
- tax_cents
- total_cents
- currency
- placed_at
- completed_at
- cancelled_at
- cancellation_reason
- lock_version
```

### State machine

```text
pending
→ confirmed
→ in_fulfillment
→ delivered
→ completed

branches:
cancelled
disputed
refunded
```

---

## 9.5 contracts

```text
contracts
- id
- organization_id
- order_id
- public_id
- status
- version
- terms_snapshot jsonb
- signed_by_buyer_at
- signed_by_seller_at
- effective_at
- terminated_at
```

---

## 9.6 payments

```text
payments
- id
- organization_id
- order_id
- public_id
- provider
- provider_payment_id
- status
- amount_cents
- currency
- authorized_at
- captured_at
- failed_at
- refunded_at
- failure_code
- metadata
- idempotency_key
- created_at
- updated_at
```

### Estados

```text
created
pending
authorized
captured
failed
cancelled
partially_refunded
refunded
```

Nunca aceitar `amount`, `captured`, `paid` ou `status` como autoridade vinda do frontend.

---

## 9.7 refunds

```text
refunds
- id
- payment_id
- amount_cents
- status
- reason
- provider_refund_id
- requested_by_id
- approved_by_id
- processed_at
```

---

## 9.8 payouts

```text
payouts
- id
- organization_id
- order_id
- payee_organization_id
- amount_cents
- currency
- status
- provider_payout_id
- scheduled_at
- paid_at
- failed_at
```

---

## 9.9 disputes

```text
disputes
- id
- organization_id
- order_id
- opened_by_id
- reason
- description
- status
- resolution
- resolved_by_id
- resolved_at
```

---

# 10. REVIEWS & REPUTATION

## 10.1 reviews

```text
reviews
- id
- organization_id
- public_id
- order_id
- product_id / provider_id
- author_user_id
- rating
- title
- body
- status
- verified
- approved_by_id
- approved_at
- rejected_at
- cancelled_at
- created_at
- updated_at
```

### State machine

```text
draft
→ submitted
→ pending_moderation
→ approved

branches:
changes_requested
rejected
cancelled
flagged
```

---

## 10.2 review_moderations

```text
review_moderations
- review_id
- moderator_id
- action
- reason
- notes
- metadata
- created_at
```

---

## 10.3 review_campaigns

```text
review_campaigns
- organization_id
- product_id/provider_id
- name
- status
- channel
- audience_definition jsonb
- starts_at
- ends_at
- sent_count
- opened_count
- completed_count
- created_by_id
```

---

# 11. CONTENT / COMMUNITY

## 11.1 articles

```text
articles
- id
- organization_id nullable for global content
- author_id
- category_id
- title
- slug
- excerpt
- body
- status
- published_at
- seo_title
- seo_description
- canonical_url
- featured_media_id
```

## 11.2 questions

```text
questions
- id
- organization_id nullable
- user_id
- provider_id/product_id
- title
- body
- status
- views_count
- answers_count
- created_at
```

## 11.3 answers

```text
answers
- id
- question_id
- user_id
- body
- status
- approved_by_id
- approved_at
- rejected_at
```

Todo conteúdo gerado por usuário deve passar por sanitização, anti-spam e moderação.

---

# 12. SAAS BILLING / PLANS / ENTITLEMENTS

## 12.1 plans

```text
plans
- id
- code
- name
- status
- audience
- metadata
```

## 12.2 plan_prices

```text
plan_prices
- plan_id
- currency
- amount_cents
- billing_interval
- country_code nullable
- active
```

## 12.3 feature_groups

```text
feature_groups
- id
- name
- slug
- position
```

## 12.4 features

```text
features
- id
- feature_group_id
- key
- name
- description
- value_type
```

## 12.5 plan_features

```text
plan_features
- plan_id
- feature_id
- enabled
- limit_value
- config jsonb
```

## 12.6 subscriptions

```text
subscriptions
- id
- organization_id
- plan_id
- status
- provider
- provider_subscription_id
- starts_at
- trial_ends_at
- current_period_start
- current_period_end
- cancelled_at
```

## 12.7 entitlements

```text
entitlements
- id
- organization_id
- user_id nullable
- feature_id
- source_type
- source_id
- status
- limit_value
- starts_at
- expires_at
```

Membership determina vínculo com organização.  
Entitlement determina acesso/capacidade.

---

# 13. GROWTH / ADS / LEADS

## 13.1 leads

```text
leads
- id
- organization_id
- public_id
- source
- source_resource_type
- source_resource_id
- campaign_id
- provider_id
- service_id
- name
- email
- phone
- status
- score
- metadata
- assigned_to_id
- created_at
```

Estados:

```text
new
qualified
contacted
opportunity
converted
lost
spam
```

---

## 13.2 advertisements

```text
advertisements
- organization_id
- product_id/provider_id
- plan_id
- name
- placement
- destination_url
- status
- starts_at
- ends_at
- impressions_count
- clicks_count
```

## 13.3 ad_events

```text
ad_events
- advertisement_id
- event_type
- user_id nullable
- session_id
- ip_hash
- referrer
- user_agent_hash
- occurred_at
```

Eventos:

```text
impression
click
conversion
```

---

# 14. PLATFORM / AUDIT / SECURITY

## 14.1 audit_logs

```text
audit_logs
- id
- actor_type
- actor_id
- organization_id
- action
- resource_type
- resource_id
- before_data jsonb
- after_data jsonb
- reason
- ip_address
- user_agent_hash
- request_id
- created_at
```

Ações obrigatoriamente auditadas:

```text
grant_role
revoke_role
impersonate
approve
reject
cancel
refund
delete
restore
change_plan
grant_entitlement
suspend_user
suspend_organization
payment_override
```

---

## 14.2 security_events

```text
security_events
- id
- user_id
- organization_id
- event_type
- severity
- ip_address
- metadata
- occurred_at
```

---

## 14.3 impersonation_sessions

```text
impersonation_sessions
- id
- admin_user_id
- target_user_id
- organization_id
- reason
- started_at
- expires_at
- ended_at
```

---

## 14.4 webhook_endpoints

```text
webhook_endpoints
- organization_id
- url
- secret_digest
- status
- subscribed_events
```

## 14.5 webhook_deliveries

```text
webhook_deliveries
- webhook_endpoint_id
- event_id
- status
- attempts
- last_http_status
- last_error
- next_retry_at
```

---

# 15. ACTIVEADMIN — INFORMATION ARCHITECTURE

A navegação não deve repetir a navbar horizontal da referência com dezenas de itens.

## Menu alvo

```text
Dashboard

Identity
├── Users
├── Memberships
├── Roles
├── Permissions
└── Impersonation

Organizations
├── Organizations
├── Teams
├── Providers
└── Entitlements

Marketplace
├── Providers
├── Pilots
├── Drones
├── Services
├── Categories
├── Coverage Areas
├── Certifications
├── Badges
└── Portfolios

Drone Operations
├── Projects
├── Missions
├── Assignments
├── Flights
├── Deliverables
├── Geo Assets
└── Mission Documents

Commerce
├── Requests
├── Quotes
├── Orders
├── Contracts
├── Disputes
└── Payouts

Reviews
├── Reviews
├── Moderation Queue
├── Review Campaigns
└── Abuse Reports

Growth
├── Leads
├── Campaigns
├── Ads
├── Sponsorships
└── Attribution

Billing
├── Plans
├── Prices
├── Subscriptions
├── Invoices
├── Payments
├── Refunds
├── Billing Events
└── Usage

Content
├── Articles
├── Pages
├── Media
├── Questions
└── Answers

Compliance
├── Certifications
├── Verification Queue
├── Documents
└── Compliance Events

Platform
├── Audit Logs
├── Security Events
├── Jobs
├── Webhooks
├── Integrations
├── API Clients
├── Imports
├── Exports
├── Feature Flags
└── System Health
```

---

# 16. ACTIVEADMIN RESOURCE CONTRACT

Cada resource administrativo deve declarar:

```text
RESOURCE
MENU
POLICY
SCOPED_COLLECTION
FILTERS
INDEX COLUMNS
SHOW
FORM
PERMIT_PARAMS
MEMBER_ACTIONS
COLLECTION_ACTIONS
BATCH_ACTIONS
EXPORTS
AUDIT
PII CLASSIFICATION
TESTS
```

Exemplo de regra:

```ruby
controller do
  def scoped_collection
    policy_scope(super)
  end
end
```

`permit_params` nunca deve liberar indiscriminadamente:

```text
organization_id
tenant_id
role
admin
payment_status
verified
approved_at
approved_by_id
balance
commission
```

---

# 17. POLICIES / PUNDIT

## ApplicationPolicy

Deve negar por padrão.

```text
default = DENY
```

## Policy scopes

Toda lista privada deve passar por `policy_scope`.

## Custom actions

Policies devem refletir ações reais:

```text
approve?
reject?
assign?
cancel?
accept?
refund?
publish?
export?
impersonate?
grant_role?
grant_entitlement?
```

---

# 18. API MASTER CONTRACT

## Convenção

```text
/api/v1/...
```

## Response

```json
{
  "data": {},
  "meta": {},
  "errors": []
}
```

## Erro

```json
{
  "errors": [
    {
      "code": "MISSION_INVALID_TRANSITION",
      "message": "Mission cannot move from completed to in_progress",
      "field": null
    }
  ]
}
```

## Listagens

```text
page
per_page
sort
filter
```

ou cursor pagination onde o volume justificar.

`per_page` deve ter limite máximo.

---

# 19. ROTAS DE DOMÍNIO

## Missions

```text
GET    /api/v1/missions
POST   /api/v1/missions
GET    /api/v1/missions/:id
PATCH  /api/v1/missions/:id

POST   /api/v1/missions/:id/submit
POST   /api/v1/missions/:id/approve
POST   /api/v1/missions/:id/assign
POST   /api/v1/missions/:id/start
POST   /api/v1/missions/:id/complete
POST   /api/v1/missions/:id/cancel
```

## Quotes

```text
POST /api/v1/quotes/:id/submit
POST /api/v1/quotes/:id/accept
POST /api/v1/quotes/:id/reject
POST /api/v1/quotes/:id/cancel
```

## Orders

```text
POST /api/v1/orders/:id/confirm
POST /api/v1/orders/:id/cancel
POST /api/v1/orders/:id/complete
POST /api/v1/orders/:id/open_dispute
```

## Reviews

```text
POST /api/v1/reviews/:id/submit
POST /api/v1/reviews/:id/approve
POST /api/v1/reviews/:id/reject
POST /api/v1/reviews/:id/request_changes
```

---

# 20. SERIALIZERS

Escolher um único padrão.

Se Alba já estiver adotado:

```text
Alba como serializer oficial
```

Evitar mistura permanente entre:

```text
render json: model
as_json
serializable_hash
Jbuilder
Alba
```

Estrutura sugerida:

```text
app/serializers/
├── identity/
├── organizations/
├── marketplace/
├── missions/
├── commerce/
├── reviews/
└── billing/
```

Serializers não devem vazar:

```text
password digests
tokens
internal permissions
PII não autorizado
provider secrets
payment metadata sensível
```

---

# 21. DTO / REQUEST CONTRACTS

Payloads complexos devem possuir objeto explícito:

```text
CreateMissionRequest
AssignMissionRequest
CreateQuoteRequest
AcceptQuoteRequest
CreateOrderRequest
CreatePaymentIntentRequest
UploadDeliverableRequest
GrantMembershipRequest
```

Objetivo:

```text
HTTP params
→ Contract
→ normalized input
→ Service
```

---

# 22. SERVICE LAYER

Estrutura:

```text
app/services/
├── missions/
│   ├── create.rb
│   ├── approve.rb
│   ├── assign.rb
│   └── complete.rb
├── quotes/
│   ├── create.rb
│   └── accept.rb
├── orders/
├── billing/
├── reviews/
└── admin/
```

Cada service deve documentar:

```text
INPUT
OUTPUT
AUTHORIZATION ASSUMPTIONS
TRANSACTION
LOCKING
SIDE EFFECTS
DOMAIN EVENTS
ERRORS
IDEMPOTENCY
```

---

# 23. TRANSAÇÕES E CONCORRÊNCIA

Obrigatório analisar transação em:

```text
quote acceptance
order creation
mission assignment
payment capture
refund
payout
review approval
membership activation
subscription changes
```

Usar locking quando houver disputa de recurso:

```ruby
with_lock
lock!
SELECT ... FOR UPDATE
```

ou constraint de banco apropriada.

`lock_version` recomendado em aggregates com edição concorrente.

---

# 24. IDEMPOTÊNCIA

Obrigatória para:

```text
order creation
quote acceptance
payment intents
captures
refunds
webhooks
mission creation via integration
imports
```

Schema possível:

```text
idempotency_keys
- key
- organization_id
- request_fingerprint
- response_status
- response_body
- expires_at
```

---

# 25. EVENTS / JOBS

Eventos:

```text
MissionCreated
MissionAssigned
MissionCompleted
QuoteSubmitted
QuoteAccepted
OrderCreated
PaymentCaptured
PaymentFailed
DeliverablePublished
ReviewApproved
SubscriptionActivated
```

Jobs recebem IDs, nunca objetos ActiveRecord inteiros.

```ruby
MissionNotificationJob.perform_later(mission.id)
```

Todo job deve restabelecer contexto de tenant e revalidar acesso.

---

# 26. FILES / MEDIA / DELIVERABLES

DroneHub manipula arquivos potencialmente grandes.

Requisitos:

```text
signed upload URLs
private buckets por padrão
MIME validation
size limits
checksum
virus/malware scanning quando aplicável
tenant path isolation
retention policy
versioning
download authorization
audit trail
```

Nunca confiar apenas na extensão do arquivo.

---

# 27. GEO / POSTGIS

Quando geodados forem relevantes:

```text
PostGIS
geography(Point, 4326)
geography(Polygon, 4326)
GIST indexes
```

Casos:

```text
mission location
coverage areas
flight paths
inspection geometry
geo assets
```

---

# 28. SECURITY BASELINE

Obrigatório:

```text
Pundit default deny
tenant-scoped queries
Brakeman
bundle-audit
Rack::Attack
CORS allow-list
JWT secret validation
MFA para admins
CSRF no ActiveAdmin
secure cookies
content sanitization
signed URLs
webhook signature validation
request IDs
parameter filtering
```

Pesquisar continuamente:

```text
unscoped
permit!
send(params
constantize
eval
system(
exec(
rescue Exception
skip_before_action
skip_after_action
Model.find(params[:id])
```

---

# 29. LGPD / DATA CLASSIFICATION

Categorias:

```text
PUBLIC
INTERNAL
CONFIDENTIAL
RESTRICTED
```

PII típica:

```text
name
email
phone
tax_id
address
precise geolocation
financial data
documents
identity verification
```

Todo campo deve possuir:

```text
purpose
legal basis
retention
access policy
export behavior
deletion/anonymization behavior
```

---

# 30. OBSERVABILITY

Toda request deve correlacionar:

```text
request_id
user_id
organization_id
controller
action
status
duration
```

Nunca logar:

```text
JWT
password
API secret
full payment token
raw sensitive document
```

Métricas:

```text
HTTP latency
5xx
4xx anomaly rate
DB latency
slow queries
queue depth
job failures
payment failures
webhook failures
mission SLA
quote conversion
```

---

# 31. DASHBOARD ADMIN OPERACIONAL

O dashboard não deve ser uma página vazia.

## Executive

```text
active users
active organizations
active providers
active subscriptions
MRR / ARR
GMV
take rate
new leads
conversion
```

## Operations

```text
missions today
missions delayed
unassigned missions
deliverables pending review
failed jobs
```

## Commerce

```text
open requests
quotes awaiting action
orders in progress
payment failures
refunds
disputes
```

## Trust & Safety

```text
reviews pending moderation
abuse reports
compliance expirations
security events
```

---

# 32. TESTING PYRAMID

## Model

```text
constraints mirrored
associations
state validations
```

## Policy

```text
role
tenant
resource ownership
custom actions
```

## Service

```text
happy path
invalid transition
transaction rollback
idempotency
concurrency
```

## Request

```text
401
403/404 cross-tenant
422 invalid payload
200/201 happy path
```

## Admin

```text
resource visibility
filtering
custom action authorization
dangerous params blocked
```

## Mandatory tenant tests

Para cada entidade privada:

```text
same tenant → allowed
different tenant → denied
anonymous → 401
platform admin → explicit policy behavior
```

---

# 33. DATABASE INDEX STRATEGY

Todo FK deve ser avaliado para índice.

Padrões prioritários:

```text
(organization_id, status)
(organization_id, created_at)
(organization_id, user_id)
(organization_id, public_id)
(mission_id, status)
(order_id, status)
(provider_id, status)
(payment_id, status)
```

Soft delete:

```text
UNIQUE (...) WHERE deleted_at IS NULL
```

PostGIS:

```text
GIST(geography_column)
```

---

# 34. MIGRATION STANDARD

Migrations devem ser:

```text
reversible
small
deployment-safe
independent of runtime model behavior
```

Separar:

```text
schema migration
data backfill
constraint validation
cleanup
```

Para bases grandes:

```text
concurrent indexes
nullable → backfill → NOT NULL
expand/contract deployment
```

---

# 35. NOMENCLATURA

Escolher e manter:

```text
organization
provider
user
membership
entitlement
service_request
quote
order
mission
deliverable
```

Evitar sinônimos paralelos:

```text
company / tenant / account / org
```

sem distinção semântica clara.

Recomendação:

```text
Organization = tenant/account
Provider = perfil comercial no marketplace
```

---

# 36. ARQUITETURA DE PASTAS RAILS

```text
app/
├── admin/
├── controllers/
│   └── api/
│       └── v1/
├── models/
├── policies/
├── serializers/
├── contracts/
├── services/
├── queries/
├── commands/
├── events/
├── listeners/
├── jobs/
├── validators/
└── concerns/

lib/
├── tenant_scope.rb
├── errors/
└── security/

spec/
├── models/
├── policies/
├── services/
├── requests/
├── jobs/
├── admin/
├── factories/
└── support/
```

---

# 37. RELEASE GATE

Nenhum domínio é production-ready sem:

```text
[ ] tables/migrations
[ ] PK/FK
[ ] NOT NULL
[ ] unique/check constraints
[ ] indexes
[ ] model
[ ] tenant scope
[ ] policy
[ ] policy scope
[ ] contract/DTO
[ ] service
[ ] serializer
[ ] API controller/routes
[ ] ActiveAdmin resource
[ ] audit trail
[ ] request specs
[ ] policy specs
[ ] service specs
[ ] tenant isolation specs
[ ] no critical Brakeman findings
[ ] no known high-risk dependency issue
[ ] observability
```

---

# 38. IMPLEMENTATION WAVES

## Wave 0 — Security Emergency

```text
IDOR
dev auth
JWT
tenant scope
critical payment authorization
```

## Wave 1 — Integrity & Authorization

```text
RBAC
policies
policy scopes
strong params
DB constraints
ActiveAdmin authorization
audit logs
```

## Wave 2 — Contract Layer

```text
serializers
request contracts
API error standard
state transition endpoints
```

## Wave 3 — Domain Hardening

```text
transactions
locking
idempotency
domain events
jobs
```

## Wave 4 — Platform

```text
billing
entitlements
webhooks
imports
exports
feature flags
security events
```

## Wave 5 — Performance & Scale

```text
indexes
N+1
query objects
caching
PostGIS optimization
observability
```

---

# 39. TEMPLATE REPLICÁVEL PARA QUALQUER NOVO RESOURCE

Para qualquer entidade nova, responder antes de implementar:

```text
1. Qual bounded context?
2. Quem é o owner?
3. É tenant-scoped?
4. Qual public_id?
5. Quais invariants?
6. Quais estados?
7. Quais transições?
8. Quem pode ler?
9. Quem pode alterar?
10. Quais campos são sensíveis?
11. Qual service executa a regra?
12. Qual policy protege?
13. Qual serializer expõe?
14. Qual endpoint representa a ação?
15. Qual audit event será criado?
16. Qual transaction/lock é necessário?
17. Qual idempotency protection?
18. Quais índices sustentam queries?
19. Qual teste prova cross-tenant isolation?
20. Qual release gate valida produção?
```

---

# 40. MATRIZ MASTER DE ABAS

| Grupo | Resource | Core/Optional | DroneHub |
|---|---|---|---|
| Dashboard | Operations Dashboard | Core | Sim |
| Identity | Users | Core | Sim |
| Identity | Memberships | Core | Sim |
| Identity | Roles | Core | Sim |
| Identity | Permissions | Core | Sim |
| Organizations | Organizations | Core | Sim |
| Organizations | Providers | Marketplace | Sim |
| Marketplace | Pilots | Vertical | Sim |
| Marketplace | Drones | Vertical | Sim |
| Marketplace | Services | Vertical | Sim |
| Marketplace | Categories | Core marketplace | Sim |
| Marketplace | Coverage Areas | Vertical | Sim |
| Marketplace | Certifications | Vertical | Sim |
| Marketplace | Badges | Optional | Sim |
| Operations | Projects | Vertical | Sim |
| Operations | Missions | Vertical | Sim |
| Operations | Assignments | Vertical | Sim |
| Operations | Flights | Vertical | Sim |
| Operations | Deliverables | Vertical | Sim |
| Commerce | Requests | Marketplace | Sim |
| Commerce | Quotes | Marketplace | Sim |
| Commerce | Orders | Marketplace | Sim |
| Commerce | Contracts | Marketplace | Sim |
| Commerce | Payments | Core commerce | Sim |
| Commerce | Payouts | Marketplace | Sim |
| Commerce | Disputes | Marketplace | Sim |
| Reviews | Reviews | Marketplace | Sim |
| Reviews | Moderation Queue | Core trust | Sim |
| Reviews | Review Campaigns | Growth | Sim |
| Growth | Leads | Core growth | Sim |
| Growth | Ads | Optional monetization | Sim |
| Growth | Sponsorships | Optional monetization | Sim |
| Billing | Plans | SaaS | Sim |
| Billing | Prices | SaaS | Sim |
| Billing | Subscriptions | SaaS | Sim |
| Billing | Entitlements | SaaS | Sim |
| Billing | Invoices | SaaS | Sim |
| Billing | Refunds | Commerce | Sim |
| Content | Articles | Optional CMS | Sim |
| Content | Media | Core support | Sim |
| Community | Questions | Optional | Sim |
| Community | Answers | Optional | Sim |
| Compliance | Documents | Vertical | Sim |
| Compliance | Verification Queue | Vertical | Sim |
| Platform | Audit Logs | Core | Sim |
| Platform | Security Events | Core | Sim |
| Platform | Webhooks | Core integrations | Sim |
| Platform | Jobs | Core operations | Sim |
| Platform | Integrations | Core integrations | Sim |
| Platform | API Clients | Enterprise | Sim |
| Platform | Imports | Enterprise | Sim |
| Platform | Exports | Enterprise | Sim |
| Platform | Feature Flags | Core platform | Sim |
| Platform | System Health | Core operations | Sim |

---

# 41. DEFINIÇÃO FINAL DE ARQUITETURA

O DroneHub deve convergir para:

```text
CLIENT / ACTIVEADMIN
        │
        ▼
Authentication
        │
        ▼
Tenant Context
        │
        ▼
Authorization / Pundit
        │
        ▼
Request Contract
        │
        ▼
Application Service / Command
        │
        ▼
Domain Invariants
        │
        ▼
Transaction + Locking
        │
        ▼
ActiveRecord / PostgreSQL
        │
        ├────────► AuditLog
        │
        ├────────► Domain Event
        │
        └────────► Job / Integration
```

Leitura:

```text
Query Object
→ policy_scope
→ eager loading
→ Serializer
→ API/Admin
```

Esse é o desenho de referência. Toda exceção deve ser documentada.

---

# 42. REGRA DE OURO DO DRONEHUB

O sistema deve continuar seguro mesmo quando:

```text
o frontend envia campos maliciosos
um usuário troca IDs manualmente
dois requests chegam simultaneamente
um webhook é repetido
um job executa duas vezes
um admin tenta ação fora do papel
um serializer recebe associação inesperada
uma operação falha no meio da transação
o volume cresce 100x
```

Por isso a arquitetura não depende de uma única barreira.

```text
AUTH
+ TENANT SCOPE
+ POLICY
+ CONTRACT
+ DOMAIN INVARIANT
+ DB CONSTRAINT
+ TRANSACTION
+ AUDIT
+ TEST
```

são camadas complementares.

---

# 43. DEFINITION OF DONE

Um resource só está concluído quando:

```text
TABLE
✓

MIGRATION
✓

MODEL
✓

ASSOCIATIONS
✓

VALIDATIONS
✓

DB CONSTRAINTS
✓

INDEXES
✓

TENANT SCOPE
✓

POLICY
✓

POLICY SCOPE
✓

SERVICE
✓

CONTRACT / DTO
✓

SERIALIZER
✓

API
✓

ACTIVEADMIN
✓

AUDIT LOG
✓

TESTS
✓

OBSERVABILITY
✓
```

**Esse documento passa a ser a referência arquitetural canônica do DroneHub.**


# APÊNDICE A — INVENTÁRIO DE TABELAS OBSERVADAS NO SQL

O dump fornecido contém **38 tabelas `CREATE TABLE`** detectadas. A lista abaixo é de descoberta, não de aprovação arquitetural.

```text
audit_log_entries
buckets
categories
category_products
decrypted_key
decrypted_secrets
flow_state
identities
impressions
instances
key
leads
mask_columns
masking_rule
messages
mfa_amr_claims
mfa_challenges
mfa_factors
migrations
objects
one_time_tokens
pg_stat_statements
pg_stat_statements_info
products
refresh_tokens
reviews
s3_multipart_uploads
s3_multipart_uploads_parts
saml_providers
saml_relay_states
schema_migrations
secrets
sessions
sso_domains
sso_providers
subscription
users
valid_key
```

## Entidades de negócio mínimas observadas

### `categories`

```text
- id
- name
```

### `category_products`

```text
- product_id
- product_id
- product_id
- category_id
- category_id
- category_id
```

### `impressions`

```text
- id
- impression_type
- type_id
- date
- value
```

### `leads`

```text
- id
- lead_type
- type_id
- date
- value
```

### `products`

```text
- id
- name
```

### `reviews`

```text
- id
- review_type
- type_id
- date
- value
```

