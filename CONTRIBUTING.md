# Diretrizes de Contribuição — DroneHub / OEST SaaS

Obrigado pelo interesse em contribuir para o ecossistema **DroneHub / ab01-saas-oest**! Para garantir a estabilidade e a qualidade A+++ de nossa arquitetura de missão crítica, solicitamos que siga os padrões abaixo.

---

## 1. Padrão de Branches

Trabalhamos com o fluxo baseado em Trunk-Based Development com Feature Branches curtas:

- `main` / `master`: Branch de produção / staging estável.
- `feat/<escopo>-<descricao-curta>`: Novas funcionalidades.
- `fix/<escopo>-<descricao-curta>`: Correções de bugs.
- `refactor/<escopo>-<descricao-curta>`: Refatorações sem alteração de comportamento externo.
- `docs/<escopo>-<descricao-curta>`: Atualizações de documentação.
- `chore/<escopo>-<descricao-curta>`: Tarefas de manutenção e infraestrutura.

Exemplo: `feat/mission-geospatial-matching` ou `fix/stripe-webhook-idempotency`.

---

## 2. Padrão de Commits (Conventional Commits)

Utilizamos a convenção [Conventional Commits v1.0.0](https://www.conventionalcommits.org/):

```text
<tipo>(<escopo>): <descrição no imperativo e em minúsculas>

[corpo opcional explicando o motivo e impacto técnico]

[rodapé opcional com referências a issues, ex: Closes #12]
```

### Tipos Permitidos:
- `feat`: Nova funcionalidade para o usuário ou API
- `fix`: Correção de bug
- `refactor`: Mudança de código que não altera funcionalidade nem corrige bug
- `test`: Adição ou correção de testes automatizados
- `docs`: Modificações apenas na documentação
- `style`: Formatação, ponto e vírgula, sem alteração de lógica
- `perf`: Melhoria de performance de queries ou renderização
- `chore`: Atualização de dependências, scripts de build, CI

---

## 3. Qualidade de Código & Gates Obrigatórios

Antes de abrir um Pull Request, certifique-se de que todos os gates locais passem com 100% de sucesso:

### Backend (Rails 8.0.5)
```bash
cd backend
bundle exec rubocop          # Linter e padrões de estilo Ruby
bundle exec brakeman -q      # Análise estática de segurança
bundle exec bundle-audit     # Auditoria de vulnerabilidades em gems
bundle exec rspec            # Suite de testes automatizados
```

### Frontend (Next.js 15)
```bash
cd frontend
npm run lint                 # ESLint 9
npm run typecheck            # Verificação de tipos TypeScript estrita
npm run test                 # Suite de testes Vitest
npm run build                # Validação de build de produção
```

---

## 4. Processo de Pull Request

1. Crie sua branch a partir da versão mais recente da `main`.
2. Escreva testes automatizados para todas as novas regras de negócio e endpoints.
3. Preencha o template de Pull Request por completo, incluindo evidências de teste e checklist.
4. Aguarde a aprovação do time e a passagem de todos os checks no GitHub Actions.
