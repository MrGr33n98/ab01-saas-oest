# DroneHub — Product Requirements (summary)

See the master specification for full detail.

## Vision

Reference platform to hire, operate, and consume drone services and geospatial data with enterprise standards.

## Jobs-to-be-done

- **Customer:** Hire a suitable provider quickly and receive verifiable results without WhatsApp/spreadsheets.
- **Operator:** Receive opportunities that match coverage, equipment, compliance, and specialization.
- **Enterprise:** Control suppliers, missions, spend, compliance, data, and permissions in one place.

## North star metrics

- Monthly GMV
- Missions completed with approved delivery
- Time `mission.published → first_qualified_quote`
- Conversion `mission.published → order.created`
- On-time completion rate
- First-submission deliverable approval rate
- 90-day repurchase
- Customer & operator NPS
- Active territorial coverage
- Marketplace liquidity (≥3 eligible operators per mission)

## MVP scope (include)

Public marketplace, operator profile, services/data products, PostGIS coverage, projects, mission wizard, matching V1, quotes/comparison, order creation, mission workspace, assignments, deliverables, reviews, basic notifications, plans/gating, admin verification.

## Tenant workspaces

The platform has explicit `operator` and `enterprise` user workspaces, enforced against the active organization in the API. The Enterprise console and the full Operator vertical — resumable onboarding, matching invites, redacted payout profile, associated network, contracts and support — are specified in [PRD_ENTERPRISE_OPERATOR_DASHBOARDS.md](PRD_ENTERPRISE_OPERATOR_DASHBOARDS.md).

## Defer

Heavy internal geospatial processing, full 3D browser viewer if it delays launch, AI automation, complex procurement chains, custom SSO per client, dynamic auto-pricing, OpenSearch.
