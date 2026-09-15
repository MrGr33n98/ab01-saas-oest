# MVP P0 — Backlog executado no código

## Itens → artefatos

| ID | Item | Artefatos principais |
|----|------|----------------------|
| P0-01 | Auth JWT + org + roles | `auth_controller.rb`, User jti, memberships |
| P0-02 | Tenant isolation | `TenantScope`, policies, `tenant_isolation_spec.rb` |
| P0-03 | Catálogo 6+8 | `seeds.rb`, ServiceCategory, DataProduct |
| P0-04 | Operador + cobertura + verified | OperatorProfile, CoverageArea, Admin verify |
| P0-05 | Projeto + missão draft | Projects::Project, Missions::Create |
| P0-06 | AOI GeoJSON + hectares server-side | CalculateGeometry, SetGeometry, MissionGeometryController, AoiEditor |
| P0-07 | Products + publish | MissionProductsController, Missions::Publish |
| P0-08 | Matching V1 hard filters | BuildCandidateSet, RunForMissionJob |
| P0-09 | Quote submit | Quotes model + controller |
| P0-10 | Accept idempotent → Order | Quotes::Accept |
| P0-11 | Pagamento manual/Pix concierge | Payments::ConfirmManual, PaymentsController |
| P0-12 | Start mission if paid | MissionActionsController#start |
| P0-13 | Upload S3 session + finalize + approve/reject | Uploads::*, Deliverables::* |
| P0-14 | Review pós-completed | Reviews::Create |
| P0-15 | Admin + outbox job + health | Admin controllers, OutboxPublisherJob, HealthController |

## Golden path

```
sign_up → project → mission draft → AOI → products → publish
→ matching job → quote submit → accept (Idempotency-Key) → order
→ payment confirm → start → upload session → finalize → approve → review
```

## Como rodar

```bash
docker compose up -d
cd backend && bundle install && bin/rails db:prepare db:seed && bin/rails s -p 3001
cd frontend && npm i && npm run dev
```

Admin seed: `admin@dronehub.local` / `password`
