# 01 — Backend Inventory

## Stack (Gemfile)

- Rails ~> 7.2, PostgreSQL, PostGIS adapter  
- Sidekiq, Redis  
- Devise + devise-jwt (listed; **runtime auth is custom JWT in controllers**)  
- Pundit  
- Stripe gem  
- Alba listed (serializers largely **manual `render json`**)  
- money-rails, aasm (adoption uneven)  
- OpenTelemetry, lograge, rack-attack, rack-cors, secure_headers  

## Counts (approx.)

| Layer | Count |
|-------|-------|
| Controllers | 41 |
| Models | 44 |
| Policies | 11 |
| Services | 20 |
| Jobs | 5 |
| Specs | 3 |
| Migrations | 7 |

## Controllers map

### Public / weak auth
- `AuthController` — sign_up, sign_in, refresh, password  
- `Webhooks::StripeController` — signature required  
- `Content::PostsController` — public CMS  
- `Marketplace::*` — public catalog + profiles + quote_requests  
- `Ads::BannersController` — serve/track  
- `Billing::StripeConfigController` — publishable key  
- `HealthController`  

### Tenant API (`BaseController`)
- Projects, Missions, Quotes, Orders, Payments, Deliverables, Reviews  
- Operator::* (profile, drones, coverage, jobs, activation, entitlements, materials, connect, premium)  
- Billing checkout  

### Platform admin (`Api::V1::Admin::*`)
- operators, categories, banners, posts, plans, entitlements, badges  

**No `app/admin` ActiveAdmin resources.**

## Models by domain

| Domain | Models |
|--------|--------|
| Identity | User, Organization, OrganizationMembership, AuditLog |
| Operators | OperatorProfile, CoverageArea, Drone, Payload, Pilot, OperatorBadge, OperatorMaterial, OperatorDataProduct |
| Marketplace | ServiceCategory, ServiceOffering, DataProduct |
| Missions | Mission, MissionProduct, MissionAssignment, MissionRequirement, MissionStatusEvent |
| Quotes | Quote, QuoteItem, QuoteRequest |
| Orders/Billing | Order, Payment, Plan, Subscription, Settlement |
| Deliverables | Deliverable, Asset |
| Reviews | Review |
| Ads | Banner, Placement, Assignment, Event |
| CMS | Post |
| Entitlements | FeatureDefinition, PlanFeature, OrganizationEntitlement, VerificationBadge |
| Infra | DomainOutboxEvent |

## Policies present

ApplicationPolicy, MembershipPolicy, OrganizationPolicy,  
Missions::MissionPolicy, Projects::ProjectPolicy, Quotes::QuotePolicy,  
Orders::OrderPolicy, Operators::OperatorProfilePolicy,  
Deliverables::DeliverablePolicy, Marketplace::ServiceCategoryPolicy, Admin::AdminPolicy  

**Missing explicit policies (examples):** Payment, Review, Cms::Post, Banner, QuoteRequest, Subscription, Material.

## Services

Missions::Create/Publish/SetGeometry/CalculateGeometry  
Quotes::Accept  
Payments::ConfirmManual, CreateStripeCheckout, ApplyStripeEvent  
Matching::BuildCandidateSet  
Deliverables::Approve/Reject  
Uploads::CreateSession/FinalizeDeliverable  
Entitlements::Catalog/Resolver  
Mail::Deliver  
Notifications::Notify  
Ads::ServeBanners  
Pricing::MarketplaceFeeCalculator  
Reviews::Create  

## Jobs

Matching::EnqueueJob, Matching::RunForMissionJob  
Mail::SendTransactionalJob  
OutboxPublisherJob  

## Specs (critical gap)

Only a handful under `spec/` (requests/models/policies stubs). **No full tenant isolation suite green in CI evidence.**

## Routes

~175 lines in `config/routes.rb` under `api/v1` — surface area large relative to test coverage.
