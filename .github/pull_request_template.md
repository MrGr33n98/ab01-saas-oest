## 🎯 Descrição das Alterações

<!-- Forneça um resumo claro e conciso das alterações implementadas e a motivação técnica/negócio. -->

## 🛠️ Tipo de Mudança

- [ ] `feat` Nova funcionalidade (mudança que adiciona nova capacidade)
- [ ] `fix` Correção de bug (mudança que corrige um problema sem quebras)
- [ ] `refactor` Refatoração de código (sem alteração de comportamento externo)
- [ ] `perf` Otimização de performance
- [ ] `test` Adição ou melhoria de testes
- [ ] `docs` Alteração de documentação
- [ ] `chore` Alteração de build, dependências ou infraestrutura

---

## 🔒 Checklist de Segurança & Arquitetura

- [ ] As consultas a entidades privadas utilizam `TenantScope` e respeitam o isolamento multi-tenant (`organization_id`).
- [ ] As novas rotas da API estão protegidas por políticas Pundit e tipadas/documentadas no OpenAPI.
- [ ] Nenhuma credencial, segredo ou chave privada foi incluída no código.
- [ ] Todas as mutações críticas e de pagamentos possuem garantia de idempotência.

---

## 🧪 Testes & Validação Realizada

<!-- Descreva como as alterações foram testadas. Exemplo: -->
- [ ] Testes automatizados de backend (`bundle exec rspec`)
- [ ] Análise estática de segurança (`bundle exec brakeman -q` e `bundle-audit`)
- [ ] Linter Ruby (`bundle exec rubocop`)
- [ ] Testes de frontend (`npm run test` e `npm run typecheck`)
- [ ] Validação visual e responsiva no navegador (PWA / Mobile / Desktop)

---

## 📸 Screenshots / Evidências (Opcional)

<!-- Se aplicável, adicione capturas de tela ou logs das validações realizadas. -->
