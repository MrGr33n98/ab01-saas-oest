# Backlog de performance

## P0 — fundação e redução de risco

| Item | Resultado esperado | Dependência |
| --- | --- | --- |
| Migrar tokens de `localStorage` para sessão httpOnly | Server Components podem autorizar sem flash; reduz exposição XSS | decisão de auth/Rails |
| Criar BFF/Route Handlers somente para auth/shape/cache necessários | não transformar Next em proxy cego | contrato Rails |
| Converter shells privados para RSC | menos JS e busca inicial no browser | sessão server-side |
| Separar `BannerSlot`, `NotificationBell` e formulários em ilhas | não hidratar layout público inteiro | design/ads |
| Aplicar `next/image` e presets | LCP/CLS/bytes melhores | política de mídia/remotos |
| Registrar fontes com `next/font` | fonte previsível sem layout shift | licença/fonte aprovada |
| Corrigir `lint` não interativo | CI executável | configuração ESLint |
| Medir bundle/Lighthouse/RUM | baseline real antes de gates | preview determinístico |

## P1 — cache e renderização híbrida

| Item | Resultado esperado | Dependência |
| --- | --- | --- |
| Upgrade isolado Next 15.5 → 16 | base para Cache Components/PPR | codemod/testes completos |
| Migrar `middleware.ts` para `proxy.ts` conforme upgrade | compatibilidade Next 16 | teste locale/routing |
| Habilitar Cache Components em preview | shell estático + slots dinâmicos | cache persistente compatível |
| Implementar webhook HMAC/outbox | invalidação por entidade confiável | Rails + Redis |
| Configurar CDN/WAF e headers | hit rate/TTFB controláveis | infra/DNS |
| `loading.tsx`, `error.tsx`, `not-found.tsx` segmentados | streaming e fallback úteis | conversão de rotas |
| Dynamic import para editor/mapa/modal | menos JS inicial | medição de bundle |

## P2 — escala marketplace

| Item | Resultado esperado | Dependência |
| --- | --- | --- |
| Redis cache-aside para agregados e facetas caras | menos carga Rails/Postgres | métricas comprovando custo |
| Busca com cursor e facetas cacheadas | latência previsível sob volume | contrato de busca |
| FTS PostgreSQL antes de engine externa | menor custo operacional | benchmark de consultas |
| Meilisearch/Typesense somente se FTS falhar | busca dedicada quando justificada | volume/recall observados |
| SWR/TanStack para status vivo seletivo | atualizações sem re-render global | sessão/BFF |

## P3 — otimização avançada

- Prefetch por intenção (hover/focus) em destino pesado, com limite de concorrência.
- Warming de top profiles/cities baseado em tráfego real, nunca no build de toda a cauda longa.
- Edge somente em lógica leve, compatível e comprovadamente sensível a latência global.
- Virtualização em tabelas privadas extensas; não para grids públicos pequenos.

## Ordem de migração Next 16

1. Atualizar `next`, React e tipos em branch própria; rodar codemod e testes de produção.
2. Resolver APIs assíncronas e a renomeação `middleware` → `proxy` quando indicada pelo upgrade.
3. Ativar `cacheComponents: true` primeiro em preview.
4. Aplicar `use cache`, `cacheLife` e `cacheTag` só a fetchers públicos sem cookie/auth.
5. Introduzir PPR numa página de perfil controlada; medir TTFB, LCP, hit ratio e invalidação.
6. Expandir apenas após rollback testado.
