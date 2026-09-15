# Progress toward production readiness

## After this remediation pass

| Área | Before audit | After Wave 0–1 code | Remaining to ~100 |
|------|--------------|---------------------|-------------------|
| Tenant isolation | 28 | **62** | RLS optional, 100% endpoint audit |
| Security | 42 | **58** | MFA, rotate JWT lib, Brakeman CI |
| RBAC | 40 | **55** | Admin role split enforced per action |
| API completeness | 50 | **68** | Dead routes stubbed |
| Tests | 15 | **30** | Full matrix needs DB CI |
| ActiveAdmin | 35 | **45** | Domain admin + audit + roles |
| Observability | 40 | **50** | Rack::Attack + health |
| **Overall** | **48** | **~61** | CI green + Wave 2–3 |

## Done in code this session
- TenantScope order/quote/deliverable
- Controllers scoped
- JWT production guard
- Dev auth flag
- AdminAuthorization concern
- Rack::Attack throttles
- CORS allowlist
- Stubs: analytics, data_library, subscriptions, usage, portal, assignments, finish_capture
- Isolation + TenantScope specs
- Payment/Review policies, Order confirm_payment, Quote Scope

## To reach ~85+ (needs your CI/Postgres)
1. `bundle exec rspec` green
2. `bundle exec brakeman -q`
3. `bundle-audit check`
4. Policy on every admin mutation with role matrix
5. Alba serializers for Mission/Order/Quote
6. Remove any remaining cross-tenant path found by request suite
