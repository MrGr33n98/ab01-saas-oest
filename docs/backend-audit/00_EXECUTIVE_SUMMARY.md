# DroneHub Backend — Executive Summary (Audit AS-IS)

**Date:** 2026-09-15  
**Scope:** `backend/` Rails API (marketplace + Mission OS)  
**Method:** Code inventory + static analysis (no production DB). Rails/RSpec/Brakeman not executed in this sandbox.

---

## Verdict

| Gate | Result |
|------|--------|
| **PRODUCTION READY** | **NO** |
| **CONDITIONALLY READY** | **YES** — for private MVP / pilot with trusted tenants |
| **CRITICAL** | Multi-tenant IDOR risk on several `Model.find` paths; JWT home-grown; admin is domain API not ActiveAdmin gem |

**Overall Backend Health Score: 48/100**

| Área | Score | Status |
|------|-------|--------|
| Database | 55 | Structure core OK; constraints/indexes uneven |
| Models | 52 | Thin models; incomplete validations vs DB |
| API | 50 | Routes rich; contracts inconsistent |
| RBAC | 40 | Membership roles exist; sparse enforcement |
| Tenant Isolation | **28** | Org header present; many global `find`s |
| ActiveAdmin | 35 | **No** `app/admin` (domain `/api/v1/admin`) |
| Security | 42 | JWT HMAC default secret; dev X-User-Id |
| Performance | 45 | Little preload; PostGIS present |
| Tests | **15** | ~3 spec files |
| Observability | 40 | request_id; limited structured audit |

---

## What exists (strengths)

- Domain-shaped folders: missions, quotes, orders, operators, billing, ads, cms, entitlements  
- Service objects for publish, accept quote, payment confirm, Stripe checkout/webhook  
- `BaseController`: JWT + `X-Organization-Id` + membership check  
- Pundit included; several domain policies present  
- PostGIS migrations for AOI/coverage  
- Feature entitlements catalog (paid growth features)  
- Stripe webhook signature path designed  

## Top risks (P0)

1. **IDOR / tenant bypass:** Controllers use `Mission.find` / `Order.find` / `Quote.find` without `current_organization` scope first.  
2. **JWT:** Custom HMAC, default `JWT_SECRET`, not Devise-JWT; refresh/jti partial.  
3. **Dev auth bypass:** `X-User-Id` in development.  
4. **Test gap:** No automated proof of tenant isolation across resources.  
5. **ActiveAdmin gem:** Absent — internal admin is JSON API; permit/scope discipline incomplete.

## Recommended posture

Ship **pilot only** after Wave 0–1 (tenant scoping + authorize on every mutating endpoint + secret management + isolation specs). Do not expose public internet admin API without IP allowlist / separate auth.

Full matrices: `01_BACKEND_INVENTORY.md`, `40_BACKEND_DOMAIN_MATRIX.md`, `41_CRITICAL_FINDINGS.md`, `42_REMEDIATION_PLAN.md`.

---

## Post-remediation (Wave 0 applied in code)

| Item | Done |
|------|------|
| TenantScope extended (order/quote/deliverable) | Yes |
| Critical controllers use scoped find | Yes |
| Dev auth requires ALLOW_DEV_AUTH | Yes |
| JWT_SECRET production initializer | Yes |
| Isolation specs expanded | Yes |
| Payment/Review policies stubs | Yes |

**Re-score estimate after Wave 0:** Tenant isolation ~55/100 (was 28). Still **not** open production without CI green + remaining Wave 1 policies on every action.
