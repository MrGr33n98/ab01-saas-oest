# Source Adaptation Matrix: rails_ai_agents (Rails 8.1) → DroneHub / OEST (Rails 7.x)

Este documento mapeia todas as adaptações conceituais e técnicas entre o repositório de referência (`rails_ai_agents`, focado em Rails 8.1) e o **DroneHub/OEST**, que utiliza **Rails 7.x / 7.2 API-only + ActiveAdmin**.

---

## Metadados de Compatibilidade

- **SOURCE**: `https://github.com/ThibautBaissac/rails_ai_agents`
- **SOURCE TARGET**: Rails 8.1 (Solid Stack, Built-in Auth, Propshaft)
- **OEST TARGET**: Rails 7.x / 7.2 API-only (Sidekiq, Redis, Devise/JWT, Pundit, PostGIS)

---

## Matriz de Adaptação Detalhada

| Conceito / Funcionalidade | SOURCE (Rails 8.1) | TARGET (DroneHub Rails 7.x) | Compatibilidade | Ação / Regra de Engenharia |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication Flow** | Rails 8 built-in `has_secure_password` + Session records | **Devise 4.9** + **devise-jwt** + `User` Model | Rails 8-specific | **REPLACED**: Não importar auth nativo do Rails 8. Usar controllers de autenticação JWT existentes em `/api/v1/auth/*` e Devise Session para ActiveAdmin. |
| **Background Jobs** | Solid Queue (`solid_queue` gem) | **Sidekiq 7.3** + **Redis** | Incompatible Infrastructure | **REPLACED**: Todos os jobs herdam de `ApplicationJob < ActiveJob::Base` com adapter `:sidekiq`. Não instalar ou referenciar `solid_queue`. |
| **Cache Store** | Solid Cache (`solid_cache` gem) | **Redis Cache Store** (`config.cache_store = :redis_cache_store`) | Incompatible Infrastructure | **REPLACED**: Usar Redis para cache de chave-valor e rate limiting. Não referenciar `solid_cache`. |
| **WebSockets / Realtime** | Solid Cable (`solid_cable` gem) | **Action Cable + Redis** | Incompatible Infrastructure | **REPLACED**: Usar Redis adapter para Action Cable caso canais em tempo real sejam instanciados. |
| **Asset Pipeline / Views** | Propshaft + Import Maps + ERB / ViewComponents | **API-only** + **Sprockets** (exclusivo para ActiveAdmin) | Incompatible Architecture | **REPLACED**: O DroneHub é API-first com frontend Next.js 15. Não gerar views ERB, Turbo Streams ou Stimulus controllers para a aplicação de usuários/operadores. |
| **Database Migrations** | `ActiveRecord::Migration[8.0]` / `[8.1]` | `ActiveRecord::Migration[7.2]` | Version Mismatch | **ADAPTED**: Todas as novas migrations devem obrigatoriamente declarar `ActiveRecord::Migration[7.2]`. |
| **Active Record APIs** | Rails 8 defaults (ex: `normalizes`, queries assíncronas 8.x) | Rails 7.2 Active Record APIs | Syntax/API checks | **ADAPTED**: Usar enums, scopes e validações compatíveis com Rails 7.2. Evitar sintaxes exclusivas do Rails 8. |
| **Geospatial & Storage** | Active Storage síncrono genérico | **PostGIS** + **Direct S3 / MinIO Presigned URLs** | Domain Specific | **ADAPTED**: Para ortomosaicos, GeoTIFF, COG e nuvens de pontos (LAS/LAZ), uploads e downloads utilizam URLs pré-assinadas para evitar buffer de memória síncrono no Ruby. |
| **Layered Architecture** | Layered Services, Policies, Serializers | Layered Services, Policies, Serializers (`app/services`, `app/policies`, `app/queries`) | Concept Compatible | **KEPT + ADAPTED**: Manter separação de responsabilidade em Services, Pundit Policies, Queries e Serializers. |
| **Security & Throttling** | Rails 8 rack middleware defaults | `rack-attack 6.7` + `rack-cors` | Compatible | **KEPT + ADAPTED**: Manter regras granulares no `config/initializers/rack_attack.rb` (limitação por IP e por e-mail em sign-in, quote requests e rotas sensíveis). |
| **Observability** | Rails 8 telemetry | `lograge 0.14` | Compatible | **KEPT**: Formatação de log JSON estruturado compatível com produção. |

---

## Regra de Ouro: Proibição de Upgrade Forçado

> [!CAUTION]
> É estritamente proibido forçar atualização de dependências de infraestrutura no Gemfile para introduzir ecossistemas do Rails 8 (como Solid Queue, Solid Cache ou Rails 8 Auth). A prioridade máxima é a compatibilidade estável com o runtime **Rails 7.2 / Sidekiq / Redis / Devise** do DroneHub.
