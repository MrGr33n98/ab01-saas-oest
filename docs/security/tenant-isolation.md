# Tenant isolation

## Rules

1. Every private table has `organization_id` (except pure platform tables).
2. Controllers resolve `current_organization` from `X-Organization-Id`.
3. Never `Model.find(params[:id])` — always `TenantScope.find!` or policy scope.
4. Membership must be `active` for the user in that organization (unless platform admin).
5. Cross-tenant access returns 403 or 404 per policy (prefer 404 when existence leakage matters).

## Test suite (P0 gate)

For each private endpoint:

| Actor | Resource org | Expected |
|-------|--------------|----------|
| Member of A | Resource A | 2xx |
| Member of B | Resource A | 403/404 |
| No org header | — | 400 |
| Unauthenticated | — | 401 |

## Audit

Role changes, quote accept/reject, billing, payouts, compliance verification, sensitive downloads, and admin impersonation must write to `audit_logs`.
