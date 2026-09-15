# ADR 001 — Multi-tenancy strategy

## Status

Accepted

## Context

DroneHub is multi-organization: customers, operators, and enterprise tenants share the same platform. Data isolation is a P0 security requirement.

## Decision

- Tenant boundary is `organization_id` on every private domain table.
- Users belong to organizations via `organization_memberships` with explicit roles.
- Active organization is resolved from `X-Organization-Id` header (or session context).
- All private reads/writes go through `TenantScope` or Pundit policy scopes.
- `super_admin` is a platform role and does not replace membership.

## Consequences

- No `Model.find(params[:id])` in tenant controllers.
- Tenant isolation test suite is a release gate.
- Cross-tenant access returns 404/403 according to policy (no leakage of existence when required).
