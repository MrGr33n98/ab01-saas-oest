# Architecture overview

## Containers

Users to Next.js Web/PWA to Rails API to PostgreSQL+PostGIS.
Rails also uses Redis/Sidekiq, object storage, email, payments, and webhooks.

## Bounded contexts

Identity, Organizations, Marketplace, Operators, Fleet, ServicesCatalog,
Geography, Projects, Missions, Matching, RFQ, Quotes, Orders, Execution,
Deliverables, Reviews, Messaging, Billing, Subscriptions, Compliance,
Notifications, Analytics, Integrations, Admin.

## Critical domain flow

Mission Draft -> Published -> Matching -> Quotes -> Accepted -> Order
-> Scheduled -> In Progress -> Processing -> Deliverables -> Review
-> Approved -> Completed -> Settlement

## Non-negotiables

- Multi-tenant by organization_id
- Pundit + TenantScope
- Service objects for writes; query objects for reads
- Transactional outbox for critical events
- Idempotency on financial mutations
- API-first versioned contracts
