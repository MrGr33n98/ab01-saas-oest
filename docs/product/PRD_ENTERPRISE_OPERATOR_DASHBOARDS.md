# PRD + Spec Kit — Workspaces Operator e Enterprise

**Status:** vertical slices Enterprise e Operator implementados; validação Rails/E2E pendente de runtime local · **Owner:** Produto + Plataforma
**Referência visual:** Enterprise em `docs/bechmarch-globhe/01.png` a `12.PNG`; Operator em `docs/bechmarch-globhe/operator/01.PNG` a `32.PNG` e telas auxiliares.

## 1. Decisão de produto

DroneHub possui dois workspaces mutuamente exclusivos para a sessão ativa:

| Classificação | Quem usa | Organização ativa | Console |
|---|---|---|---|
| `operator` | piloto, gestor de frota, empresa operadora | `organization_type = drone_operator` | `/operator` |
| `enterprise` | cliente corporativo, procurement, dono do dado | qualquer organização não-operadora; novas contas usam `enterprise` | `/app` |

`users.user_type` é a classificação explícita do usuário. Ela não substitui:

- `users.platform_role`, reservado à operação interna da plataforma;
- `organization_memberships.role`, que define permissões dentro da organização;
- `organizations.organization_type`, que mantém a taxonomia comercial e de catálogo.

Uma rota de tenant exige o par coerente **usuário + organização ativa**. Por exemplo, um usuário `operator` não pode alcançar `/api/v1/enterprise/*` apenas enviando outro `X-Organization-Id`.

## 2. Evidências de UX extraídas das referências

| Referências | Padrão preservado no console |
|---|---|
| 01, 12 | dashboard com hero verde-lima, métrica de pedidos, progresso de perfil e cards de status |
| 02, 03 | cartão de perfil com faixa verde, grupos dados pessoais/empresa/localização/faturamento e zona de cautela |
| 04, 06 | sidebar fixa, agrupada por seção, com pedidos expansíveis e estado ativo escuro |
| 05 | menu de avatar no topo com perfil, biblioteca/integrações e sair |
| 07 | tabela horizontal de API keys e CTA de solicitação |
| 08 | tabela de faturas com filtros em pills e paginação visual |
| 09, 10 | estado de ativação de empresa convertido em conclusão guiada do perfil, pois o signup DroneHub já cria a organização |
| 11 | notificações e mensagens permanecem ações compactas no cabeçalho; o painel completo é uma iteração posterior |

Tokens aplicados: canvas `#F5F6F9`, superfícies brancas com borda neutra, ação primária verde-lima, sidebar de 252 px e tipografia compacta. A implementação é responsiva: sidebar a partir de `lg`, navegação inferior abaixo disso e tabelas com scroll horizontal.

## 3. Objetivos e não-objetivos

### Objetivos

1. Tornar inequívoca a classificação de quem entra na plataforma e o workspace que recebe.
2. Entregar uma experiência enterprise para solicitar, acompanhar e pagar missões.
3. Controlar API keys por organização, aprovação administrativa e segredo único.
4. Manter a barreira de tenant no Rails; o front não é mecanismo de autorização.
5. Tornar a operação auditável no ActiveAdmin.

### Não-objetivos desta entrega

- Permitir que um mesmo usuário alterne automaticamente entre tipos `operator` e `enterprise`.
- Implementar SSO/SAML, centros de custo, aprovação multinível de procurement ou emissão fiscal.
- Autenticar toda a API pública por API key nesta etapa. As chaves são gerenciadas com segurança e o contrato de autenticação por chave é uma entrega de integração posterior.
- Alterar ou remover os caminhos existentes do console de operador.

## 4. Fluxos e requisitos funcionais

### Cadastro e login

1. Cadastro envia `user_type: enterprise|operator`.
2. API cria `organization_type: enterprise|drone_operator` correspondente e uma membership `owner`.
3. Login e `GET /me` devolvem `user.user_type` e `organizations[].tenant_type`.
4. Cliente salva o `tenantType` retornado pela API e redireciona por ele, não pelo toggle visual selecionado.

### Enterprise

1. Dashboard mostra total de pedidos, etapas de pedidos/missões, progresso do perfil e notificações recentes.
2. Apenas membership `owner` ou `admin` pode editar perfil, solicitar, ativar, cancelar ou revogar chave.
3. Perfil combina identidade do owner, dados da organização e `enterprise_profiles` de cobrança.
4. A tela de faturas lista pagamentos associados a pedidos da organização. Ela é um extrato de pagamentos, não uma nota fiscal.

### API keys

```text
owner/admin solicita -> requested
admin de plataforma aprova -> approved
owner/admin ativa uma vez -> active + secret retornado uma vez
owner/admin ou admin de plataforma revoga -> revoked
```

O segredo não é persistido. Apenas um HMAC SHA-256 é armazenado em `enterprise_api_keys.token_digest`; listagens jamais incluem `secret`.

### Operator — fluxo E2E

As referências Operator foram separadas em seis etapas de cadastro e seis superfícies recorrentes. A implementação preserva a jornada sem converter screenshots em campos não auditáveis.

```text
signup operator
  -> operator_profile
  -> onboarding address/equipment/business/experience/documents/pricing (salvável por etapa)
  -> ready
  -> revisão no ActiveAdmin (approved | rejected)
  -> elegível para invites
  -> aceita/recusa invite uma única vez
  -> proposta/pedido/missão existentes
  -> extrato de payout + suporte
```

| Referências Operator | Decisão de UX e produto |
|---|---|
| 01–20 | wizard em seis aggregates: endereço/local, equipamento, empresa, experiência, documentos e preço; cada etapa é idempotente e retomável |
| 21–25, `operator-seller.PNG` | dashboard violeta: elegibilidade, métricas, progresso de perfil, convites e notificações |
| 26–27 | inbox de invites com transição explícita `pending -> accepted|declined`; invite expirado não é acionável |
| 28–29 | ledger de faturas/payout e formulário de dados bancários; número integral de conta nunca é persistido |
| 30 | rede de operadores associados, cadastro manual e import de CSV parseado no navegador (máximo 500 linhas) |
| 31–32 | contratos somente leitura e ticket de suporte de organização |
| `operator.PNG` | perfil público/premium existente continua em `/operator/settings`; a API agora persiste seus campos visuais, compliance e localização |

#### DDD: bounded contexts e invariantes

| Contexto | Aggregate root | Invariantes |
|---|---|---|
| Identidade de tenant | `User` + `Organization` | usuário `operator` e organização `drone_operator` são exigidos por `Api::V1::Operator::BaseController` |
| Cadastro operacional | `Operators::OnboardingProfile` | seis seções; progresso é derivado no servidor e não aceito do cliente |
| Payout | `Operators::PayoutProfile` | dados de billing são separados; conta bancária completa é transitória, só `last4`/token de provedor são guardados |
| Matching direcionado | `Operators::MissionInvite` | um par missão/perfil é único; somente `pending` e não expirado pode receber resposta |
| Rede local | `Operators::AssociatedOperator` | ownership sempre é o `OperatorProfile` da organização ativa; import é transacional e limitado |
| Operação assistida | `Operators::OperatorContract`, `Operators::SupportRequest` | contratos são fornecidos pela plataforma; ticket pertence à organização e ao solicitante |

#### TDD e aceite de domínio

1. Escrever request/model/service specs para tenant, seção de onboarding, mascaramento de payout e resposta de invite antes das classes de produção.
2. Implementar migration, aggregate, serviço de aplicação e controlador na mesma ordem.
3. Validar a rota pela API e depois o estado de loading/erro/vazio no frontend.
4. Testes automatizados mínimos: `operator_vertical_spec.rb`, `onboarding_profile_spec.rb` e `upsert_onboarding_section_spec.rb`.

## 5. Modelo de dados e migração

Migração: `backend/db/migrate/20260917000001_add_tenant_types_and_enterprise_infrastructure.rb`.

| Tabela | Alteração | Regra |
|---|---|---|
| `users` | `user_type` obrigatório + check constraint | legado com membership de `drone_operator` vira `operator`; demais viram `enterprise` |
| `enterprise_profiles` | perfil 1:1 de organização | cobrança, moeda, telefone, setor e preferência de e-mail |
| `enterprise_api_keys` | credenciais por organização | requestor, aprovador, scopes, estados e timestamps; segredo nunca em claro |
| `operator_onboarding_profiles` | aggregate 1:1 do perfil Operator | seis documentos de seção, status de revisão e progresso calculado |
| `operator_payout_profiles` | payout 1:1 da organização Operator | billing e metadados mascarados; sem número integral de conta |
| `operator_mission_invites` | inbox direcionado | único por missão/perfil, estados e timestamps de resposta |
| `operator_associated_operators` | rede executora | manual ou CSV, sempre sob o perfil Operator ativo |
| `operator_contracts` / `operator_support_requests` | suporte operacional | documentos entregues pela plataforma e tickets rastreáveis |

Índices: `users.user_type`, `enterprise_profiles.organization_id` único, `enterprise_api_keys (organization_id, status)` e `prefix` único quando presente.

A migração `20260917000002_create_operator_vertical_infrastructure.rb` também materializa os campos já usados pelo perfil Operator (banner, avatar, social, compliance e valor mínimo), eliminando o descompasso entre a tela de settings e o schema.

## 6. Contratos de API

O contrato executável está em [docs/api/openapi.yaml](../api/openapi.yaml). Todos os endpoints autenticados requerem `Authorization: Bearer` e `X-Organization-Id`.

| Método | Endpoint | Autorização | Resultado |
|---|---|---|---|
| `POST` | `/auth/sign_up` | público | cria usuário e org com classificação explícita |
| `POST` | `/auth/sign_in` | público | devolve user type e memberships classificadas |
| `GET` | `/me` | sessão | devolve identidade/memberships classificadas |
| `GET` | `/enterprise/dashboard` | enterprise + org enterprise | agregados do dashboard |
| `GET/PATCH` | `/enterprise/profile` | enterprise; PATCH owner/admin | perfil composto |
| `GET/POST` | `/enterprise/api_keys` | enterprise owner/admin | lista e solicita chave |
| `POST` | `/enterprise/api_keys/:id/activate` | enterprise owner/admin | retorna segredo único para request aprovado |
| `POST` | `/enterprise/api_keys/:id/cancel` | enterprise owner/admin | cancela request pendente |
| `POST` | `/enterprise/api_keys/:id/revoke` | enterprise owner/admin | revoga credencial |
| `GET` | `/enterprise/invoices` | enterprise + org enterprise | registros de pagamento |
| `GET` | `/operator/dashboard` | operator + org operator | métricas, progresso, invites e notificações |
| `GET` | `/operator/onboarding` | operator + org operator | aggregate de cadastro retomável |
| `PATCH` | `/operator/onboarding/:section` | owner/admin/manager/operator_manager | salva uma das seis etapas e recalcula progresso |
| `GET/PATCH` | `/operator/payout_profile` | operator; PATCH owner/admin/manager/billing | dados de payout mascarados |
| `GET` | `/operator/invites` | operator + org operator | inbox de convites |
| `POST` | `/operator/invites/:id/accept` ou `/decline` | operator + org operator | resposta atômica única |
| `GET/POST` | `/operator/associated_operators` | operator; POST gestor | rede executora manual |
| `POST` | `/operator/associated_operators/import` | gestor | import de até 500 linhas já parseadas pelo client |
| `GET` | `/operator/contracts`, `/operator/invoices` | operator + org operator | contratos e ledger |
| `POST` | `/operator/support_requests` | operator + org operator | abre ticket |

Erros seguem `Problem` e incluem `request_id`. Tentativa de cruzar workspaces retorna `403 TENANT_TYPE_FORBIDDEN`; membership insuficiente retorna `403 ENTERPRISE_MANAGER_REQUIRED`.

## 7. Arquivos entregues

### Backend

- modelos `User`, `Organization`, `Enterprises::Profile` e `Enterprises::ApiKey`;
- `Api::V1::Operator::BaseController` e `Api::V1::Enterprise::BaseController` para enforcement de tenant;
- controladores Enterprise para dashboard, perfil, API keys e pagamentos;
- recursos ActiveAdmin `EnterpriseProfile` e `EnterpriseApiKey`, mais coluna/filtros/scopes de tipo em `User`;
- request specs em `backend/spec/requests/enterprise_tenants_spec.rb`.
- aggregates e serviços Operator de onboarding, payout, invite, associados, contratos e suporte;
- recursos ActiveAdmin de revisão de onboarding/payout, criação de invite, contratos, rede associada e tickets;
- request/model/service specs de Operator em `backend/spec/{requests,models,services}/`.

### Frontend

- shell `frontend/app/app/layout.tsx` e navegação `components/enterprise/*`;
- dashboard `/app`, perfil `/app/enterprise`, API keys `/app/api-keys` e faturas `/app/invoices`;
- cliente tipado `frontend/lib/api/enterprise.ts`;
- sessão com `tenantType` e mocks de desenvolvimento Enterprise.
- dashboard Operator, wizard de seis passos, inbox de invites, invoices, bank information, associados, contratos e suporte;
- cliente tipado `frontend/lib/api/operator.ts` e contratos de mock compatíveis com a API.

## 8. Backlog de execução e aceite

| ID | Área | Tarefa | Estado | Critério de aceite |
|---|---|---|---|---|
| TEN-01 | Dados | adicionar/backfill de `users.user_type` e constraint | concluído | nenhum usuário fica nulo; apenas dois valores válidos |
| TEN-02 | Auth | propagar classificação em signup/signin/me e sessão front | concluído | API determina redirect; toggle de login não consegue elevar acesso |
| TEN-03 | Segurança | validar usuário + org no namespace operator/enterprise | concluído | cross-tenant devolve `TENANT_TYPE_FORBIDDEN` |
| ENT-01 | Dados | criar profile enterprise 1:1 | concluído | owner/admin atualiza e dados de cobrança sobrevivem reload |
| ENT-02 | API | dashboard agregado e faturas | concluído | consultas só incluem `customer_organization_id` ativo |
| ENT-03 | API/Admin | request/approve/activate/revoke de API key | concluído | segredo só aparece no `activate` e não na listagem/DB |
| ENT-04 | UI | shell/sidebar/header e dashboard responsivo | concluído | desktop e mobile preservam as ações primárias |
| ENT-05 | UI | perfil, API keys, faturas e estados vazios | concluído | cada tela consome contrato real e tem loading/erro/vazio |
| OPR-01 | Domínio | aggregate de onboarding com seis etapas derivadas | concluído | cliente não consegue marcar etapa completa sem os dados mínimos |
| OPR-02 | API | payout redigido, invites e rede de associados | concluído | número integral não aparece na resposta/DB; resposta de invite é única; import limitado |
| OPR-03 | Admin | revisão de onboarding/payout e gestão de invites | concluído | operações dispõem de scopes e ações de approve/reject auditadas |
| OPR-04 | UI | dashboard e superfícies Operator da referência | concluído | telas têm loading/erro/vazio e consomem o contrato tipado |
| OPR-05 | E2E | Playwright: cadastro, save/resume, invite, payout, CSV, suporte | pendente | percurso real passa pelos estados esperados e não persiste dados bancários sensíveis |
| QA-01 | Backend | executar migration + request specs em runtime Rails | pendente de ambiente Ruby/Rails local | specs novas e suite existente passam em banco de teste |
| QA-02 | E2E | Playwright: signup enterprise, login, dashboard, key request, aprovação, activation | pendente | segredo aparece uma vez e rota de operador é bloqueada |
| SEC-01 | Integrações | autenticação de chamadas de parceiros por API key + middleware de escopos | próximo P1 | `X-API-Key` só aceita hash ativo, org e escopo autorizado |
| PROD-01 | Operação | métricas/auditoria de requests, aprovações, ativações e revogações | próximo P1 | dashboard de operações e alertas de anomalia |
| PROD-02 | Produto | seletor seguro de organização para usuário multi-membership | próximo P1 | só organizações compatíveis com `user_type` ficam selecionáveis |

## 9. Plano de rollout

1. Fazer backup e executar `bin/rails db:migrate` em staging.
2. Rodar a verificação de distribuição: `SELECT user_type, count(*) FROM users GROUP BY 1`.
3. Confirmar contas de operador com memberships ativos e corrigir exceções antes de produção.
4. Deploy API antes do frontend; campos adicionais de auth são backward-compatible.
5. Habilitar console Enterprise para uma organização piloto, testar request/approve/activate/revoke e depois liberar gradualmente.
6. Monitorar códigos `TENANT_TYPE_FORBIDDEN`, `ENTERPRISE_MANAGER_REQUIRED` e `API_KEY_NOT_APPROVED` por 7 dias.
7. Liberar Operator para uma coorte piloto; acompanhar conclusão do onboarding, expiração/aceite de invite e falhas de import por 7 dias.

## 10. Checklist de release

- [ ] migration aplicada e backfill revisado
- [ ] `bundle exec rspec spec/requests/enterprise_tenants_spec.rb` verde
- [ ] `npm run typecheck` verde
- [ ] `npm run build` verde
- [ ] OpenAPI validado em CI
- [ ] admin de teste aprova uma request sem que o segredo apareça no ActiveAdmin
- [ ] owner ativa a chave, salva o segredo e confirma que um reload não o mostra
- [ ] tentativa de operador em endpoint enterprise retorna 403 sem vazamento de dados
- [ ] `bundle exec rspec spec/requests/operator_vertical_spec.rb spec/models/operators/onboarding_profile_spec.rb spec/services/operators/upsert_onboarding_section_spec.rb` verde
- [ ] ActiveAdmin cria um invite, aprova onboarding/payout e registra AuditLog
- [ ] E2E Operator salva e retoma as seis etapas; payout só exibe `last4`
- [ ] CSV de associados inválido é recusado de forma atômica; ticket de suporte aparece no ActiveAdmin
