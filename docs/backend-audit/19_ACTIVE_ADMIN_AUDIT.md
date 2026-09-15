# 19 — ActiveAdmin Audit

## Finding

**There is no ActiveAdmin gem UI (`app/admin` empty / absent).**

Administration is implemented as **domain Admin API**:

- `Api::V1::Admin::OperatorsController`
- `CategoriesController`, `BannersController`, `PostsController`
- `PlansController`, `EntitlementsController`, `BadgesController`

## Security matrix (Admin API)

| Resource | View | Create | Edit | Delete | Export | Tenant safe | Audit |
|----------|------|--------|------|--------|--------|-------------|-------|
| Operators verify | Y | — | verify/reject | — | N | Platform-global | Partial AuditLog |
| Categories | Y | Y | Y | ? | N | Global catalog | Weak |
| Banners | Y | Y | Y | ? | N | Global | Weak |
| CMS Posts | Y | Y | Y | publish | N | Global | Weak |
| Plans | Y | — | Y | — | N | Global | Weak |
| Entitlements grant | — | Y | — | — | N | Targets org | Weak |
| Badges grant | Y | grant | revoke | — | N | Targets profile | Weak |

## Risks

1. Single flag `platform_admin?` / `super_admin` — no least privilege.  
2. `Model.find` + `update!` bypass domain services.  
3. No CSV export yet — lower exfil risk for now.  
4. Frontend `/admin/*` pages call same API — must not be internet-exposed without SSO/VPN.

## TO-BE

- Keep **domain admin** (decision was explicit vs ActiveAdmin gem).  
- Add AdminPolicy per resource + role enum.  
- Force AuditLog + reason on verify/reject/grant.  
- Rate limit and IP allowlist at edge.
