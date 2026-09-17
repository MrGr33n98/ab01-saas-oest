# DroneHub / OEST — Backend Architecture & Runtime Reference

Este documento formaliza a arquitetura, versões de runtime e dependências reais do backend DroneHub/OEST.

---

## 1. Backend Runtime & Environment

| Componente | Especificação DroneHub | Fonte de Detecção |
| :--- | :--- | :--- |
| **Ruby Version** | `>= 3.2.0` (Runtime: `3.2.2-x64` local / Docker `3.2-slim`) | `backend/Gemfile`, `.ruby-version` |
| **Rails Version** | **Rails 7.2 Target** (`config.load_defaults 7.2`) | `backend/config/application.rb`, `backend/db/migrate/` |
| **Rails Mode** | **API-only** (`config.api_only = true`) + ActiveAdmin Middleware | `backend/config/application.rb` |
| **Database** | **PostgreSQL 16** com extensões: `postgis`, `pgcrypto`, `citext`, `pg_trgm` | `backend/db/migrate/20260914000001_enable_extensions.rb` |
| **Database Adapter** | `pg` (`1.6.3`) / `activerecord-postgis-adapter` | `backend/Gemfile`, `backend/config/database.yml` |
| **Schema Format** | `:sql` (`structure.sql`) | `backend/config/application.rb` |
| **Timezone** | `America/Cuiaba` (`-04:00`) | `backend/config/application.rb` |

---

## 2. Core Dependencies & Gem Matrix

| Categoria | Gem / Biblioteca | Versão Fixada | Função no DroneHub / OEST |
| :--- | :--- | :--- | :--- |
| **Web Server** | `puma` | `6.6.1` | Servidor HTTP multi-thread concorrente |
| **Autenticação** | `devise` | `4.9.4` | Autenticação de Usuários e Operadores (`User`) |
| **Token API** | `devise-jwt` | ~ | Tokens JWT para endpoints `/api/v1/*` |
| **Autorização** | `pundit` | `2.5.2` | Policies granulares por Role/Tenant (`app/policies/`) |
| **Background Jobs** | `sidekiq` | `7.3.10` | Execução assíncrona de jobs (`config.active_job.queue_adapter = :sidekiq`) |
| **Key-Value / Cache** | `redis` | `5.4.1` | Cache store, filas do Sidekiq e pub/sub |
| **Admin Console** | `activeadmin` | `3.2.1` | Painel operacional `/admin` com `sassc-rails` e `csv` |
| **Security / Throttle** | `rack-attack` | `6.7.0` | Throttling contra brute-force e rate limit em `/api/v1/*` |
| **CORS** | `rack-cors` | `2.0.2` | Liberação de CORS para o frontend Next.js |
| **State Machine** | `aasm` | `5.5.2` | Máquinas de estado para Missões, Quotes e Ordens |
| **Moeda / Valores** | `money-rails` | `1.15.0` | Precificação em BRL (Centavos) e conversões seguras |
| **Gateways** | `stripe` | `13.5.1` | Stripe Connect, Checkout e Webhooks |
| **Observabilidade** | `lograge` | `0.14.0` | Logs JSON estruturados para produção |
| **Testes & Specs** | `rspec-rails` | `6.1.5` | RSpec, FactoryBot, Faker, Shoulda-Matchers, DatabaseCleaner |

---

## 3. Padrões Arquiteturais Implementados

### 3.1. Autenticação & Sessões
- **API `/api/v1`**: Autenticação Stateless via **JWT** (`Authorization: Bearer <token>`).
- **ActiveAdmin `/admin`**: Sessão baseada em Cookie seguro ativada via middleware no `application.rb`:
  ```ruby
  config.middleware.use ActionDispatch::Cookies
  config.middleware.use ActionDispatch::Session::CookieStore, key: "_dronehub_session"
  config.middleware.use ActionDispatch::Flash
  ```

### 3.2. Jobs Assíncronos & Outbox Pattern
- **Adapter**: `Sidekiq` (NÃO utilizar Solid Queue).
- **Outbox Pattern**: Transações críticas gravam em `domain_outbox_events` e o job `OutboxPublisherJob` consome as mensagens assincronamente com garantia at-least-once.

### 3.3. Geospatial & Heavy Assets (Drones / Imagens)
- **Extensões**: PostGIS habilitado para cálculos de área (ha), distâncias e polígonos AOI (GeoJSON).
- **Uploads Pesados** (GeoTIFF, COG, LAS/LAZ, Nuvem de Pontos, Ortomosaicos):
  - Upload direto via S3 / MinIO com **Pre-signed URLs**.
  - **Proibido** carregar payloads pesados de imagens na memória síncrona do processo Rails.

### 3.4. Migrations & Versionamento
- Todas as migrations devem utilizar a sintaxe compatível com **Rails 7.2**:
  ```ruby
  class NomeDaMigration < ActiveRecord::Migration[7.2]
    def change
      # ...
    end
  end
  ```
- **Proibido** gerar `ActiveRecord::Migration[8.0]` ou `ActiveRecord::Migration[8.1]`.
