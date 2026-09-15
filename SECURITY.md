# Política de Segurança — DroneHub / OEST

A segurança e a integridade de dados operacionais e geoespaciais em nossa plataforma SaaS são prioridades máximas.

## 1. Versões Suportadas

Apenas a versão mais recente em execução no branch `main` recebe atualizações ativas de segurança.

| Versão | Suporte de Segurança |
| :--- | :--- |
| `main` / `v0.1.x` | :white_check_mark: Ativo |
| `< 0.1.0` | :x: Descontinuado |

## 2. Reportando Vulnerabilidades

Se você identificar uma vulnerabilidade potencial de segurança neste repositório:

1. **NÃO crie uma Issue pública.**
2. Envie um relatório detalhado diretamente para o mantenedor responsável através do perfil GitHub [@MrGr33n98](https://github.com/MrGr33n98).
3. Inclua passos reproduzíveis, endpoints afetados e payload de prova de conceito (PoC).

## 3. Diretrizes de Segurança da Arquitetura

- **Isolamento Multi-Tenant**: Toda consulta de banco deve passar pelo `TenantScope` e validar a `organization_id`.
- **Autenticação**: Tokens JWT assinados com expiração curta e blacklist via JTI.
- **Armazenamento**: Entregáveis pesados utilizam URLs pré-assinadas com expiração temporária e validação de permissões.
- **Proteção de Rede**: Rate limiting configurado com `Rack::Attack` em todas as rotas públicas de autenticação.
