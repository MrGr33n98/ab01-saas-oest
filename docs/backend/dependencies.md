# DroneHub / OEST — Backend Dependencies & Gem Matrix Specification

Este documento detalha o propósito, justificativa arquitetural, variáveis de ambiente críticas e notas operacionais de cada dependência do backend.

---

## 1. Visão Geral da Stack

- **Linguagem / Runtime:** Ruby `>= 3.2.0` (Dev: `3.2.2-x64`, Docker: `3.3-slim`, CI: `3.2`)
- **Framework:** Rails `8.0.5`
- **Banco de Dados:** PostgreSQL 16 + PostGIS 3.4
- **Cache & Filas:** Redis 7 + Sidekiq 7.3.10
- **Storage:** S3-compatible (MinIO em dev/docker, AWS S3 / Cloudflare R2 em produção)
- **Autenticação:** Devise 4.9.4 + JWT Stateless para `/api/v1/*` + Session Cookie para ActiveAdmin
- **Autorização:** Pundit 2.5.2

---

## 2. Tabela de Dependências por Onda

| Gem | Onda | Propósito / Função | Variáveis de Ambiente Críticas | Notas Operacionais |
| :--- | :--- | :--- | :--- | :--- |
| `rails` (`8.0.5`) | Core | Framework web e camada MVC/API | `RAILS_ENV`, `SECRET_KEY_BASE` | Configurado em modo API com middleware para ActiveAdmin |
| `pg` (`1.6.3`) | Core | Driver PostgreSQL | `DATABASE_URL`, `POSTGRES_HOST`, `POSTGRES_PORT` | Pool gerenciado via `RAILS_MAX_THREADS` |
| `puma` (`6.6.1`) | Core | Servidor HTTP concorrente multi-threaded | `PORT`, `WEB_CONCURRENCY` | Execução em single mode em dev, clustered em prod |
| `sidekiq` (`7.3.10`) | Core | Processamento assíncrono de background jobs | `REDIS_URL` | ApplicationJob com retry polinomial |
| `redis` (`5.4.1`) | Core | Cache e broker de mensagens | `REDIS_URL` | Usado por Sidekiq, Cache Store e Rack::Attack |
| `devise` / `devise-jwt` | Core | Autenticação de usuários e emissão de JWTs | `JWT_SECRET` | Headers `Authorization: Bearer <token>` |
| `pundit` (`2.5.2`) | Core | Políticas de autorização RBAC e Tenant isolation | N/A | Policies em `app/policies/` |
| `activeadmin` (`3.2.1`) | Core | Painel de administração operacional em `/admin` | N/A | Sessão habilitada via CookieStore no `application.rb` |
| `rack-attack` (`6.7.0`) | Security | Rate-limiting e prevenção de brute-force | N/A | Limites por IP e e-mail em rotas de auth e quote requests |
| `stripe` (`13.5.1`) | Billing | Processamento de pagamentos e Stripe Connect | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Webhook handler assíncrono |
| `sentry-ruby` / `sentry-rails` | Wave 1 | Monitoramento de exceptions e APM | `SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE` | Sanitização ativa de PII, JWT e Cookies |
| `strong_migrations` | Wave 1 | Prevenção de locks de banco e zero-downtime DDL | N/A | Valida migrations contra PostgreSQL 16 |
| `brakeman` / `bundler-audit` | Wave 1 | Análise estática de vulnerabilidades e CVEs | N/A | Executado no pipeline de CI como gate de qualidade |
| `rgeo` / `rgeo-geojson` | Wave 2 | Cálculos espaciais e parsing de GeoJSON AOI | N/A | Suporte a cálculos de hectares e polígonos de voo |
| `aws-sdk-s3` | Wave 2 | Uploads diretos pré-assinados (Presigned URLs) | `STORAGE_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Evita carregar arquivos pesados (GeoTIFF/LAS) na memória do Rails |
| `paper_trail` | Wave 3 | Trilha de auditoria imutável | N/A | Ativado seletivamente em Missões, Contratos e API Keys |
| `faraday` / `faraday-retry` | Wave 3 | Cliente HTTP com timeouts e retries seguros | N/A | Usado para integrações externas e webhooks |
| `pagy` | Wave 4 | Paginação rápida para endpoints da API REST | N/A | Metadados padronizados (`page`, `limit`, `count`, `pages`) |
| `flipper` / `flipper-active_record` | Wave 4 | Rollout controlado de feature flags | N/A | Fallback seguro para Memory quando tabela não existir |

---

## 3. Diretrizes de Segurança & Boas Práticas

1. **Uploads Pesados de Drones (GeoTIFF, COG, LAS, Nuvens de Pontos):**
   - **Fluxo Obrigatório:** Cliente $\rightarrow$ Solicita Presigned URL $\rightarrow$ Upload direto no S3/MinIO $\rightarrow$ Backend notificado para processar metadados assincronamente via Sidekiq.
   - **Proibição:** Nunca realizar upload síncrono com `multipart/form-data` de arquivos gigabytes através dos controllers do Rails.

2. **Isolamento Multi-Tenant:**
   - Todo acesso aos recursos de uma organização deriva estritamente do `current_user` autenticado e da organização ativa no contexto (`X-Organization-Id` validado pelo Pundit).
   - O `tenant_id` nunca é aceito cegamente a partir do payload de requisição do usuário.
