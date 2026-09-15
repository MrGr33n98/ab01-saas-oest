# 42 — Remediation Plan

## Wave 0 — Emergency (before any public traffic)

1. **Tenant find helper**  
   `current_organization.missions.find` / `policy_scope` on Mission, Order, Quote, Deliverable, Project.  
2. **Disable dev auth** outside development.  
3. **Require JWT_SECRET** at boot in production.  
4. **Isolation request specs** for Mission/Order/Quote cross-org.

## Wave 1 — Security & integrity

1. `verify_authorized` + skip only health, webhooks, public marketplace GETs.  
2. Policies for Payment, Review, Material, Cms::Post, Banner.  
3. Admin roles: `support`, `ops`, `finance`, `super_admin` — least privilege.  
4. AuditLog on admin verify, entitlement grant, badge grant, payment confirm.

## Wave 2 — API correctness

1. Serializer layer (Alba) for Mission, Quote, Order, OperatorProfile public.  
2. OpenAPI for golden path only.  
3. Standard error body already partial — unify all controllers.  
4. Implement or remove dead routes (analytics, portal, finish_capture).

## Wave 3 — Performance

1. Bullet in test/dev.  
2. Compound indexes `(organization_id, status)`, `(operator_profile_id, status)`.  
3. `includes` on quote comparison / jobs list.

## Wave 4 — Architecture

1. Align Devise-JWT or document custom JWT as intentional.  
2. Admin mutations call domain services (verify operator, publish post).  
3. Outbox consumers for all notification side-effects.

## Wave 5 — Operational maturity

1. Brakeman + bundle-audit in CI.  
2. Sentry/OTel dashboards: 5xx, job failures, webhook failures.  
3. Rack::Attack rules for auth and quote_request.

## Quick wins (< 30 min – 2 h)

| Fix | Effort |
|-----|--------|
| Guard `X-User-Id` | S |
| ENV fetch JWT_SECRET with raise in prod | S |
| Scope `OrdersController#show` | S |
| Scope `MissionActionsController#start` | S |
| 404 on cross-tenant find | S |

## Release gate (checklist)

- [ ] No tenant resource loaded by global primary key alone  
- [ ] authorize on all mutating tenant endpoints  
- [ ] Isolation specs green  
- [ ] Secrets not default  
- [ ] Webhook signature enforced  
- [ ] Payment status only via service/webhook  
- [ ] Admin mutations audited  

## Implementation status (2026-09-15)

| Item | Status |
|------|--------|
| TenantScope.find! / find_order! / find_quote! / find_deliverable! | Done |
| Orders/Quotes/Payments/MissionActions/Deliverables scoped | Done |
| X-User-Id only with ALLOW_DEV_AUTH + non-production | Done |
| JWT_SECRET production boot check | Done (initializer) |
| Isolation request specs expanded | Done |
| PaymentPolicy / ReviewPolicy stubs | Done |
| verify_authorized global | Deferred (breaks public actions; use explicit authorize) |
| Full role matrix specs | Pending CI with DB |
| ActiveAdmin gem | N/A — domain admin API |
