# 16 — Multi-Tenancy Audit

## Mechanism AS-IS

| Layer | Behavior |
|-------|----------|
| Header | `X-Organization-Id` required on `BaseController` |
| Membership | `OrganizationMembership.active` for user+org |
| Platform admin | Can pass without membership |
| DB | `organization_id` on many tables; **no RLS** |
| Jobs | Matching/mail load by id — **no tenant context object** |

## MULTI_TENANCY_MATRIX (sample)

| Entity | Tenant key | Controller scoped | Policy scoped | Jobs scoped | Admin scoped |
|--------|------------|-------------------|---------------|-------------|--------------|
| Mission | organization_id | **Partial** (find global) | Partial | N/A | Global find |
| Order | customer_organization_id | **Partial** | Partial | N/A | — |
| Quote | customer/operator orgs | **Partial** | Partial | N/A | — |
| Project | organization_id | Unknown/partial | Yes policy | — | — |
| Deliverable | via mission | **Partial** | Yes | — | — |
| OperatorProfile | organization_id | Operator namespace by current org | Partial | — | Global |
| Payment | via order | Partial | Missing | Webhook global by session | — |
| Cms::Post | none (global content) | OK public | Missing | — | Admin global |
| Banner | platform | OK | Missing | — | Admin global |

## Dangerous patterns found

```ruby
Missions::Mission.find(params[:mission_id])
Orders::Order.find(params[:id])
Quotes::Quote.find(params[:id])
Deliverables::Deliverable.find(params[:id])
```

## TO-BE

```ruby
def set_mission
  @mission = policy_scope(Missions::Mission).find(params[:id])
end
```

Optional later: PostgreSQL RLS by `app.current_org_id` session variable set in middleware.
