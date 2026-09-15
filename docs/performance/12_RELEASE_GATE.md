# Release gate de performance

## Gates imediatos (bloqueantes)

| Gate | Critério |
| --- | --- |
| Type safety | `npm run typecheck` sem erro |
| Build | `npm run build` reproduzível no ambiente de CI |
| Segurança de cache | teste confirma que rotas auth/admin/app/operator/billing emitem `private, no-store` e não entram em CDN pública |
| Segurança de revalidação | webhook rejeita assinatura/timestamp/evento inválidos e replay |
| Imagem LCP | uma única imagem prioritária por página e dimensões reservadas |
| Dependências | nenhuma credencial no repositório/log/artefato; `npm audit` avaliado conforme política |

## Gates progressivos

| Fase | Métrica | Regra |
| --- | --- | --- |
| Baseline | Lighthouse mobile nas 5 rotas | coletar duas execuções comparáveis, sem falhar merge |
| Alerta | LCP/INP/CLS e peso JS | avisar regressão > 15% ou CLS > 0,1 |
| Bloqueante | depois do baseline estável | LCP < 2,5 s, INP < 200 ms, CLS < 0,1; sem regressão > 15% sem aprovação |
| Operação | CDN/API/cache | alertar queda de hit rate e p95 de origem acima do SLO |

## Workflow CI alvo

```text
install lockfile -> typecheck -> lint não interativo -> test -> build
  -> bundle report como artefato
  -> deployment preview com fixtures
  -> Lighthouse CI mobile
  -> testes de headers/cache/revalidation
```

O script atual `npm run lint` executa `next lint`, que solicita configuração interativa neste projeto. Corrigir esse ponto antes de declarar CI verde; um gate que pode pausar aguardando input não protege release.

## Checklist de aprovação

- [ ] Rota possui classificação na matriz e owner de cache.
- [ ] Dados privados não variam HTML/cache público.
- [ ] Tag e evento de revalidação foram testados para toda entidade pública mutável.
- [ ] Imagens têm `sizes`, dimensões, `alt` e prioridade correta.
- [ ] Fonte crítica e scripts de terceiros não degradam LCP.
- [ ] Route segment tem loading/error/not-found quando streaming/falha for relevante.
- [ ] Dashboard não possui waterfall de dados independente.
- [ ] RUM e logs não incluem cookie, JWT ou PII sensível.
- [ ] Rollback da release e da configuração de cache foi exercitado.
