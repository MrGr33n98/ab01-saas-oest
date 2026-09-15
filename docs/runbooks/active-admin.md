# ActiveAdmin 3.2.1 — DroneHub

## Setup

```bash
cd backend
bundle add activeadmin --version=3.2.1   # already in Gemfile
bundle install
# assets already under app/assets/stylesheets/active_admin.scss
bin/rails s
```

Open: `http://localhost:3001/admin/login`  
Seed: `admin@dronehub.local` / `password` (platform_role admin)

## Resources

| Resource | Menu | Scopes / Filters | Ações especiais |
|----------|------|------------------|-----------------|
| Organizations | Identidade | tipo, status | **Import CSV**, template, batch suspend |
| Users | Identidade | role, status | platform_role |
| OperatorProfiles | Marketplace | verified, solo/company | verify / reject |
| ServiceCategories | Marketplace | active | CRUD |
| VerificationBadges | Marketplace | active | CRUD |
| Missions | Operações | status | read-only |
| Plans | Billing | active | CRUD features |
| CmsPosts | Conteúdo | locale, status | editorial SEO |
| AdsBanners | Growth | status | CRUD |

## CSV companies

Headers: `name,slug,organization_type,country_code,status`

Service: `Admin::ImportOrganizationsCsv`

## CSS

`app/assets/stylesheets/active_admin.scss` — tema DroneHub (header verde escuro).

## Segurança

Apenas `platform_role` in admin/super_admin/support/ops/finance/compliance ou `platform_admin?`.
