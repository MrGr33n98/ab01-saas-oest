# Régua de features pagas — operadores solo & empresas

## Planos
| Plano | Preço (seed) | Features |
|-------|--------------|----------|
| free | R$ 0 | Perfil básico, placeholder hero |
| starter | R$ 99 | + Solicitar orçamento |
| pro | R$ 299 | + Hero custom, materiais, destaque categoria, ads |
| enterprise | sob consulta | + seats extras |

## Feature keys
- `profile.quote_request`
- `profile.hero_custom`
- `profile.materials`
- `marketplace.category_featured`
- `marketplace.ads_eligible`
- `analytics.advanced`
- `team.seats_extra`

## Resolução
`Entitlements::Resolver`: override org → plan_features / features_json → deny

HTTP **402 FEATURE_REQUIRED** quando self-serve tenta recurso bloqueado.

## Admin
- `/admin/plans` — matriz
- `/admin/badges` — selos
- `POST /admin/organizations/:id/entitlements` — trial/grant

## Operator dashboard
- `/operator/growth` — self-serve hero, materials, quote toggle

## Público
- `/operators/:slug` e `/companies/:slug`
- Hero placeholder se sem Pro
- Quote button só se feature + flag no perfil
