# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Planned
- Matching geoespacial avançado com cálculo de rotas e janelas meteorológicas em tempo real.
- Suporte a multi-sensores hiperespectrais e processamento de nuvem de pontos via WebAssembly.

---

## [0.1.0] - 2026-09-15

### Added
- **Arquitetura Base Multi-Tenant**: Configuração do `TenantScope` em Rails 7.2 com isolamento estrito por `organization_id`.
- **Autenticação & Autorização**: JWT com access token de 15 minutos e refresh token de 7 dias com blacklist JTI, e Pundit em todos os recursos protegidos.
- **Módulos do Sistema de Missão**:
  - Cadastro e workspace de Missões (`/app/missions/[id]`) com timeline de status.
  - Comparador de Cotações lado a lado com verificação geoespacial PostGIS.
  - Hub de Entregáveis (`/app/missions/[id]/deliverables`) com upload em 3 etapas e aprovação/rejeição com parecer técnico.
- **Gestão de Operadores & Compliance**:
  - CRUD de frotas de drones e sensores (RGB, Multiespectral, Térmico, LiDAR).
  - Gestão de tripulação de pilotos com registro CANAC da ANAC e logbook.
  - Mapeamento de áreas de atendimento e catálogo de serviços.
- **Pagamentos & Billing**: Integração com Stripe Connect e processamento de webhooks idempotentes.
- **Painel Administrativo**: Fila de homologação de operadoras com auditoria imutável via `AuditLog` e CMS de artigos técnicos.
- **Infraestrutura & DevOps**: Docker Compose para desenvolvimento local (PostGIS 16, Redis 7, MinIO, Mailpit) e pipelines de CI/CD rigorosas no GitHub Actions.
