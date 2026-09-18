# DRONEHUB SECURITY & MULTI-TENANT AUDIT

---

### 1. Modelo de Isolamento Multi-Tenant

O DroneHub adota isolamento de dados no nível de aplicação através de três camadas simultâneas:
1. **Pundit Policies & Scopes:** Todas as consultas em coleções utilizam `policy_scope(Model)`, que injeta a restrição `where(organization_id: organization.id)`.
2. **TenantScope Resolver:** Localizações pontuais de registros utilizam `TenantScope.find!(Model, id, organization: current_organization)`, garantindo que registros pertencentes a outro tenant levantem imediatamente `ActiveRecord::RecordNotFound`.
3. **Autenticação JWT & Contexto de Organização:** O middleware extrai o `X-Organization-Id` e valida se o usuário autenticado via JWT possui vínculo ativo (`OrganizationMembership`) na organização solicitada.

---

### 2. Prova de Isolamento por Testes Automatizados

A suíte de testes permanente inclui validações E2E comprovando:
* **Missões:** O Tenant B não consegue buscar, alterar ou publicar missões do Tenant A.
* **Cotações & Pedidos:** Propostas e ordens de pagamento pertencentes ao Tenant A são inacessíveis para o Tenant B.
* **Telemetria & Analytics:** Métricas consolidadas em `daily_tenant_metrics` e consultas via `Telemetry::AnalyticsQueryService` isolam rigorosamente cada `organization_id`.
* **Endpoints de Webhooks:** Endpoints cadastrados pelo Tenant A não podem ser consultados nem disparados por outros tenants.

---

### 3. Proteção LGPD & Privacidade de Dados

* **Telemetry Sanitizer:** Executa filtragem automática por lista de bloqueio (`password`, `jwt`, `token`, `secret_key`, `authorization`, `credit_card`, `api_key`), impedindo a persistência acidental de dados pessoais sensíveis em logs ou tabelas analíticas.
* **Truncamento de Payload:** Strings em propriedades abertas são truncadas em no máximo 500 caracteres.

---

### 4. Integridade de Banco de Dados

* **Chaves Primárias UUID:** Todas as tabelas do núcleo utilizam UUIDs nativos gerados via `gen_random_uuid()` para impedir ataques de enumeração sequencial.
* **Índices de Unicidade e Idempotência:**
  * `idx_telemetry_events_idempotency` em `[:request_id, :event_name]`.
  * `idx_daily_tenant_metrics_unique` em `[:organization_id, :date, :metric_name]`.
  * `index_webhook_deliveries_unique_dispatch` em `[:webhook_endpoint_id, :event_id]`.
  * `idx_unique_org_follow` em `[:follower_organization_id, :followed_operator_profile_id]`.
