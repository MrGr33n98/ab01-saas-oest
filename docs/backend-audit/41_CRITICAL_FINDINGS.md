# 41 — Critical Findings

---

### BE-P0-001 — Global `find` on tenant resources (IDOR)

**SEVERITY:** P0 CRITICAL  
**DOMAIN:** Multi-tenancy / Authorization  
**COMPONENT:** Controllers (Missions, Orders, Quotes, Deliverables, Payments, MissionActions, …)

**PROBLEM:** Widespread `Missions::Mission.find(params[:id])`, `Orders::Order.find`, `Quotes::Quote.find` without scoping to `current_organization`.

**CURRENT:** Any authenticated member who can guess UUID may load/mutate another tenant’s resource if policy is missing or uses record only.

**EXPECTED:**  
`current_organization.missions.find(params[:id])` or `policy_scope(Mission).find(...)`.

**SECURITY IMPACT:** Cross-tenant data access / mutation.  
**BUSINESS IMPACT:** Enterprise deal-breaker; LGPD incident.  
**FIX:** TenantScope helper + replace all finds; request specs isolation.  
**EFFORT:** L  

---

### BE-P0-002 — JWT implementation not production-grade

**SEVERITY:** P0 / P1  
**DOMAIN:** Authentication  
**FILE:** `auth_controller.rb`, `base_controller.rb`

**PROBLEM:** Custom Base64+HMAC tokens; default secret `dronehub-mvp-dev-secret-change-me`; Devise-JWT in Gemfile unused for issue path.

**EXPECTED:** Battle-tested library, rotated secrets, short access TTL, refresh rotation, denylist on logout.

**FIX:** Migrate to devise-jwt or authentic solid JWT; force `JWT_SECRET` in production boot.  
**EFFORT:** M  

---

### BE-P0-003 — Development identity header

**SEVERITY:** P1 (P0 if enabled in prod)  
**FILE:** `base_controller.rb`

**PROBLEM:** `X-User-Id` authenticates in `Rails.env.development?`.

**EXPECTED:** Never available outside local; guard with explicit ENV flag.

**FIX:** Remove or `ENV["ALLOW_DEV_AUTH"] == "true" && !Rails.env.production?`.  
**EFFORT:** S  

---

### BE-P1-004 — Incomplete Pundit coverage

**SEVERITY:** P1  
**DOMAIN:** Authorization  

**PROBLEM:** Not all controllers call `authorize` / `policy_scope`. Platform admin checks are ad-hoc `platform_admin?`.

**EXPECTED:** `verify_authorized` (with skip list for health/webhooks) + policy per resource.

**EFFORT:** L  

---

### BE-P1-005 — Payment confirmation authorization surface

**SEVERITY:** P1  
**DOMAIN:** Payments  
**FILE:** `payments_controller.rb`

**PROBLEM:** Confirm payment via API for billing roles + admin — must never accept client-set `payment_status` on order update paths; Stripe webhook path is preferred.

**EXPECTED:** Only service objects change payment_status; webhook + admin dual-control.

**EFFORT:** M  

---

### BE-P1-006 — Test suite insufficient

**SEVERITY:** P1  
**DOMAIN:** Quality  

**PROBLEM:** ~3 spec files vs 40+ controllers. No matrix role × endpoint.

**EXPECTED:** Request specs for isolation, accept quote idempotency, webhook signature failure.

**EFFORT:** XL  

---

### BE-P1-007 — ActiveAdmin gem absent; Admin API is powerful

**SEVERITY:** P1  
**DOMAIN:** Admin  

**PROBLEM:** Domain admin under `/api/v1/admin` can verify operators, grant entitlements, publish CMS — protected mainly by `platform_admin?`, not fine-grained admin roles (support vs finance vs compliance).

**EXPECTED:** Admin RBAC split + audit log on every mutation + network restriction.

**EFFORT:** L  

---

### BE-P2-008 — Serializers inconsistent / PII risk

**SEVERITY:** P2  
**DOMAIN:** API  

**PROBLEM:** Manual JSON hashes; risk of leaking internal fields on profile/admin payloads (CNPJ, emails on quote requests).

**EXPECTED:** Explicit serializers/blueprints per role.

**EFFORT:** M  

---

### BE-P2-009 — N+1 and missing compound indexes

**SEVERITY:** P2  
**DOMAIN:** Performance  

**PROBLEM:** List endpoints without systematic `includes`; index coverage on `(organization_id, status)` partial.

**EFFORT:** M  

---

### BE-P2-010 — Idempotency incomplete

**SEVERITY:** P2  
**DOMAIN:** Concurrency  

**PROBLEM:** Accept quote / checkout mention idempotency keys in places; not universal on payments and quote_requests.

**EFFORT:** M  

---

### BE-P2-011 — Migrations without concurrent indexes

**SEVERITY:** P2  
**DOMAIN:** Database  

**PROBLEM:** MVP migrations add indexes inline — OK for empty DB; risky on large prod without `algorithm: :concurrently`.

**EFFORT:** S (process)  

---

### BE-P3-012 — Naming / dead routes

**SEVERITY:** P3  

Routes reference controllers not fully implemented (analytics, data_library, portal, usage, mission_assignments, finish_capture). Dead or 500 risk.

**EFFORT:** M  

---

## Missing capabilities (should exist)

| Capability | Status |
|------------|--------|
| Tenant DB constraint / RLS | Missing (app-level only) |
| verify_authorized globally | Missing |
| Structured audit on all admin actions | Partial |
| Request specs isolation matrix | Missing |
| Brakeman/CI gate | Not evidenced |
| Rate limit tuned per endpoint | rack-attack present; config thin |
| MFA | Missing |
| Admin impersonation controls | N/A / missing |
