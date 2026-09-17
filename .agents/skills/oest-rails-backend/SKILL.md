---
name: oest-rails-backend

description: >
  Regras obrigatórias de engenharia para o backend Rails do DroneHub/OEST.
  O projeto atualmente executa Rails 8.0.5, PostgreSQL/PostGIS, Devise/JWT,
  Sidekiq, Redis, Pundit e ActiveAdmin. O rails-ai-context MCP é a fonte
  primária de ground truth e deve ser consultado antes de assumir schema,
  models, associações, controllers, routes, services, jobs, gems, policies,
  callbacks ou padrões de testes.
---

# OEST Rails Backend Engineering Skill

Esta skill governa desenvolvimento, manutenção, auditoria e revisão do backend
Rails do DroneHub / OEST.

A regra principal é:

DISCOVER
→ VERIFY
→ PLAN
→ IMPLEMENT
→ RE-VERIFY
→ TEST
→ REVIEW

Nunca inverter essa ordem.

---

# 1. GROUND TRUTH OBRIGATÓRIO — rails-ai-context

O `rails-ai-context` MCP é a fonte primária de verdade sobre o backend Rails.

Antes de criar, modificar, remover ou explicar código existente, o agente DEVE
consultar o estado real da aplicação.

Nunca assumir com base apenas em convenções genéricas do Rails.

## 1.1 Schema / banco

Antes de mencionar ou alterar:

- tabela
- coluna
- índice
- foreign key
- tipo
- migration
- constraint

consultar:

- get_schema
- migration_advisor quando aplicável

Nunca criar uma migration para algo que já existe.

---

## 1.2 Models

Antes de assumir:

- association
- validation
- enum
- scope
- callback
- concern
- STI
- delegated method

consultar:

- get_model_details
- get_callbacks
- get_concern quando necessário

---

## 1.3 Controllers / API

Antes de alterar controller ou endpoint:

consultar:

- get_controllers
- get_routes
- get_api quando aplicável

Verificar obrigatoriamente:

- inheritance
- before_action
- authentication
- authorization
- strong params
- serializers
- render pattern
- error handling

---

## 1.4 Services

Antes de criar service novo:

consultar:

- get_service_pattern
- search_code
- analyze_feature

Verificar se já existe implementação equivalente.

---

## 1.5 Jobs

Antes de criar ou modificar jobs:

consultar:

- get_job_pattern
- get_gems
- implementação existente de ApplicationJob

Nunca assumir Solid Queue.

Usar a infraestrutura real detectada no projeto.

Atualmente:

Sidekiq + Redis + ActiveJob.

---

## 1.6 Gems

Antes de adicionar qualquer dependência:

consultar:

- get_gems

Nunca adicionar gem que já exista.

Nunca atualizar versões globais automaticamente.

Nunca executar:

bundle update

sem autorização explícita.

---

## 1.7 Testes

Antes de gerar testes:

consultar:

- get_test_info
- testes da feature existente

O projeto utiliza RSpec.

Preservar:

- factories existentes
- helpers
- shared contexts
- request specs
- service specs
- model specs
- patterns reais já adotados

---

## 1.8 Segurança

Para alterações sensíveis:

consultar:

- security_scan
- Brakeman
- policies
- TenantScope
- autenticação
- authorization

Nunca considerar warning do Brakeman automaticamente como vulnerabilidade
confirmada.

Classificar como:

- CONFIRMED
- LIKELY
- MITIGATED
- FALSE POSITIVE
- NEEDS MORE EVIDENCE

Não silenciar warnings apenas para deixar o scan verde.

---

# 2. STACK REAL DO OEST

O agente deve verificar a stack via rails-ai-context antes de cada mudança
relevante.

Estado atualmente confirmado:

- Ruby: 3.2.2
- Rails: 8.0.5
- PostgreSQL
- PostGIS
- Devise 4.9.4
- devise-jwt
- Pundit
- Sidekiq 7.3.10
- Redis
- ActiveAdmin 3.2.1
- RSpec
- FactoryBot
- Rack Attack
- Stripe
- AASM
- ActiveStorage / storage externo quando aplicável

IMPORTANTE:

Esses valores representam o estado atual conhecido.

Se rails-ai-context ou Gemfile/Gemfile.lock divergirem desta seção,
a aplicação real prevalece.

---

# 3. PROIBIDO ASSUMIR RAILS 7

Esta skill NÃO deve impor Rails 7.2.

O projeto atualmente usa Rails 8.0.5.

Portanto:

NÃO criar:

ActiveRecord::Migration[7.2]

por regra fixa.

A versão da migration deve corresponder à aplicação real.

Atualmente, quando uma nova migration for realmente necessária:

```ruby
class ExampleMigration < ActiveRecord::Migration[8.0]
end