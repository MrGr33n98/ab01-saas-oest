# DRONEHUB CORE DOMAIN AUDIT
## Relatório de Auditoria Vertical de Domínio Operacional

---

### 1. Inventário de Entidades de Domínio

| Entidade | Tabela | Model Path | Tenant Key | Policy | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Organization** | `organizations` | `app/models/organization.rb` | `id` | `OrganizationPolicy` | `IMPLEMENTED` |
| **User** | `users` | `app/models/user.rb` | `organization_memberships` | `UserPolicy` | `IMPLEMENTED` |
| **Membership** | `organization_memberships` | `app/models/organization_membership.rb` | `organization_id` | `MembershipPolicy` | `IMPLEMENTED` |
| **Mission** | `missions` | `app/models/missions/mission.rb` | `organization_id` | `Missions::MissionPolicy` | `IMPLEMENTED` |
| **MissionProduct** | `mission_products` | `app/models/missions/mission_product.rb` | `organization_id` | `Missions::MissionPolicy` | `IMPLEMENTED` |
| **MissionStatusEvent** | `mission_status_events`| `app/models/missions/mission_status_event.rb`| via `mission_id` | `Missions::MissionPolicy` | `IMPLEMENTED` |
| **CoverageArea** | `coverage_areas` | `app/models/operators/coverage_area.rb` | via `operator_profile_id`| `Operators::CoverageAreaPolicy` | `IMPLEMENTED` |
| **OperatorProfile** | `operator_profiles` | `app/models/operators/operator_profile.rb`| `organization_id` | `Operators::OperatorProfilePolicy` | `IMPLEMENTED` |
| **Pilot** | `pilots` | `app/models/operators/pilot.rb` | `organization_id` | `Operators::PilotPolicy` | `IMPLEMENTED` |
| **Drone** | `drones` | `app/models/operators/drone.rb` | `organization_id` | `Fleet::DronePolicy` | `IMPLEMENTED` |
| **Payload** | `payloads` | `app/models/operators/payload.rb` | `organization_id` | `Fleet::PayloadPolicy` | `IMPLEMENTED` |
| **Quote** | `quotes` | `app/models/quotes/quote.rb` | `customer_org_id` / `operator_org_id` | `Quotes::QuotePolicy` | `IMPLEMENTED` |
| **QuoteItem** | `quote_items` | `app/models/quotes/quote_item.rb` | via `quote_id` | `Quotes::QuotePolicy` | `IMPLEMENTED` |
| **Order** | `orders` | `app/models/orders/order.rb` | `customer_org_id` / `operator_org_id` | `Orders::OrderPolicy` | `IMPLEMENTED` |
| **Deliverable** | `deliverables` | `app/models/deliverables/deliverable.rb` | `organization_id` | `Deliverables::DeliverablePolicy` | `IMPLEMENTED` |
| **Asset** | `assets` | `app/models/deliverables/asset.rb` | `organization_id` | `Deliverables::AssetPolicy` | `IMPLEMENTED` |

---

### 2. Auditoria do Ciclo de Vida de Missão (Mission Lifecycle)

#### 2.1 Estados Canônicos Existentes
O model `Missions::Mission` define estritamente:
```ruby
STATUSES = %w[
  draft planning published quoting operator_selected
  scheduled in_progress processing review completed
  cancelled disputed
].freeze
```

#### 2.2 Diagrama de Estados Reais
```
 [ draft / planning ]
          |
          | Missions::Publish (valida has_aoi? + has_products? + deadline_at)
          v
    [ published ]  <---> [ quoting ]
          |
          | Quotes::Accept (aceitação atômica da cotação)
          v
 [ operator_selected ]
          |
          v
 [ scheduled / in_progress ]
          |
          v
 [ processing / review ]
          |
          | Deliverables::Approve
          v
    [ completed ]
```

---

### 3. Auditoria Geoespacial & PostGIS

* **Cálculo de Área e Centróide:** Realizado via `Missions::CalculateGeometry` e normalizado em WKT / GeoJSON.
* **Interseção de Cobertura:** Realizado via SQL sanitizado utilizando PostGIS:
  $$\text{ST\_Intersects}(\text{ST\_GeomFromGeoJSON}(\text{coverage\_areas.geometry}), \text{ST\_GeomFromGeoJSON}(\text{missions.geometry}))$$
* **Comportamento Resiliente e Fail-Closed:** Em produção, caso a extensão PostGIS falhe ou esteja indisponível, o matching opera em modo *fail-closed* para não vazar operadores fora da área contratual.

---

### 4. Auditoria do Matching Engine (`Matching::BuildCandidateSet`)

O algoritmo de matching existente no repositório aplica exclusivamente critérios auditáveis e dados reais:
1. **Verificação Cadastral:** `searchable: true`, `accepting_jobs: true`, `verification_status: 'verified'`.
2. **Interseção Espacial:** O polígono de cobertura do operador deve interceptar a geometria AOI da missão.
3. **Compatibilidade de Serviços:** Operador deve possuir serviço ativo correspondente aos produtos requisitados.
4. **Zero Mocks:** O campo `score` retorna `nil` e a banda é classificada como `"eligible"` com justificativa factual, sem ratings inventados.

---

### 5. Auditoria do Fluxo de Proposta e Cotação (`Quotes::Accept`)

* **Atomicidade Concorrente:** A transação trava o registro com `quote.lock!` e verifica `lock_version` para evitar modificações concorrentes.
* **Exclusividade de Vencedor:** Ao aceitar uma proposta, todas as outras cotações abertas para a mesma missão são imediatamente rejeitadas com `status = 'rejected'`.
* **Geração Automática do Pedido:** Cria o registro `Orders::Order` com cálculo do split financeiro (`marketplace_fee` retido pela plataforma e `operator_amount` líquido destinado ao operador).
