# 40 — Backend Domain Matrix

| Domain | Models | Controllers | Services | Policies | Jobs | Admin API |
|--------|--------|-------------|----------|----------|------|-----------|
| Identity | User, Org, Membership | Auth, Base | — | Membership, Org | — | — |
| Operators | Profile, Fleet, Coverage, Materials, Badges | Operator::*, Marketplace::Profiles | Entitlements | OperatorProfile | — | operators, badges |
| Marketplace | Category, Offering, DataProduct | Marketplace::* | Matching | ServiceCategory | Matching jobs | categories |
| Missions | Mission, Product, Events | Missions*, Geometry, Products, Actions | Create, Publish, Geometry | Mission | — | missions (route may stub) |
| Quotes | Quote, Item, QuoteRequest | Quotes, Marketplace::QuoteRequests | Accept | Quote | — | — |
| Orders/Pay | Order, Payment | Orders, Payments, Checkout | Confirm, Stripe* | Order | — | — |
| Deliverables | Deliverable, Asset | Deliverables | Approve, Reject, Upload | Deliverable | — | — |
| Billing/Plans | Plan, Subscription | Billing::* | Entitlements::Resolver | — | — | plans, entitlements |
| Ads | Banner* | Ads, Admin::Banners | ServeBanners | — | — | banners |
| CMS | Post | Content, Admin::Posts | — | — | — | posts |
| Reviews | Review | Reviews | Create | — | — | — |
| Notifications | — | — | Mail::Deliver, Notify | — | Mail job | — |
| Audit | AuditLog, Outbox | — | embedded in services | — | Outbox | — |

## Bounded context notes

- **Payments** and **Missions** correctly use services for critical transitions.  
- **ActiveAdmin parallel path:** Admin controllers often `model.update!` without reusing domain services (e.g. operator verify is OK with mail side-effect; banner CRUD is direct).  
- **Entitlements** are a clean growth context; enforcement is API-side 402, not DB constraints.
