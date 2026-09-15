# OEST Frontend Performance — Resumo executivo

Data da auditoria: 15 de setembro de 2026. Escopo: `frontend/`, sem acesso a métricas RUM, CDN de produção, Rails ou Redis de produção.

## Diagnóstico

O frontend usa App Router e já possui páginas públicas renderizadas no servidor, mas ainda não entrega a arquitetura de cache/SSR proposta neste plano. A versão efetivamente instalada é **Next.js 15.5.25** (`package.json` permite `^15.0.0`), não Next.js 16. Assim, Cache Components e PPR não foram ativados: isto evita depender de APIs e mudanças de comportamento ainda não migradas e testadas.

Principais evidências:

- 71 rotas de página: 19 públicas, 5 de autenticação, 17 administrativas, 14 do cliente e 16 do operador.
- 31 páginas são Client Components completas. Isso transfere renderização, busca inicial e parte do estado de rotas privadas ao navegador.
- A autenticação atual usa token em `localStorage` e `NEXT_PUBLIC_API_URL`. Ela não é segura nem acessível por Server Components para uma autorização SSR confiável.
- Não existem Route Handlers/BFF, endpoint de revalidação, CDN configurado no repositório, RUM ou medições Lighthouse versionadas.
- Há 0 imports dinâmicos, 1 uso de `next/image`, 4 imagens HTML cruas, 0 `next/font` e 0 `next/script`.
- O build de produção e `npm run typecheck` passam. O relatório do Next fornece um baseline de *First Load JS* (homepage 114 KB; blog/perfil público 107 KB), mas não mede transferência gzip/Brotli, Lighthouse ou dados de campo. `npm run lint` chama o `next lint` legado e pede configuração interativa, portanto não é um gate de CI válido ainda.

## Decisões aplicadas (P0)

- Criados `lib/cache/policies.ts` e `lib/cache/cacheTags.ts`: TTLs e tags públicas passam a ter uma única fonte de verdade.
- Criados fetchers server-only em `lib/data/`, com deduplicação por `React.cache`, tratamento de indisponibilidade e `next.revalidate`/`next.tags`.
- Refatoradas listagem e perfil público de operadores para os fetchers centralizados. Os 100 perfis mais acessados podem ser pré-gerados; os demais usam ISR sob demanda.
- Refatorado blog para fetchers centralizados, sem leitura de cookie no índice público; os 100 primeiros artigos são candidatos a pré-geração, com cauda longa sob demanda.
- A API interna do contêiner de produção é preferida por Server Components via `OEST_API_URL`, evitando volta desnecessária pelo domínio público.

## Arquitetura alvo

```text
Visitante
  -> CDN
  -> Static / ISR (público) -> Next Data Cache -> Rails API -> Postgres
  -> PPR (após migração Next 16) + ilhas dinâmicas pequenas

Usuário autenticado
  -> Next Server Components / SSR -> sessão httpOnly -> Rails API
  -> streaming de painéis independentes

Dados compartilhados e caros
  -> Redis somente quando o Data Cache/CDN não resolver o caso
```

## Riscos que bloqueiam a arquitetura completa

1. Migrar auth para cookie `httpOnly`, `Secure`, `SameSite` e uma fronteira BFF/sessão antes de converter dashboards em SSR autenticado.
2. Restaurar e estabilizar a API Rails (o repositório não contém todos os artefatos de runtime necessários para a imagem de produção) para validar contratos e webhooks de invalidação.
3. Atualizar de Next 15 para 16 em uma PR isolada, rodar o codemod oficial e testar `proxy.ts`/Cache Components antes de ativá-los.
4. Escolher e configurar CDN/cache persistente no ambiente self-hosted. O cache em disco de um contêiner standalone não sobrevive necessariamente a recriações de release.

## Scores de evidência (0–10)

São scores arquiteturais provisórios — não substituem RUM ou Lighthouse.

| Área | Score | Evidência |
| --- | ---: | --- |
| Renderização | 3 | App Router presente; 31 páginas completas no cliente e nenhuma fronteira privada SSR. |
| Cache | 4 | Fetch cache/ISR pontual; políticas e tags centralizadas adicionadas; sem invalidação remota. |
| CDN | 1 | Sem configuração/regras verificáveis no repositório. |
| JavaScript | 4 | Public pages reportam 107–114 KB First Load JS, mas há 31 client pages e nenhum code split explícito. |
| Imagens | 2 | Apenas um `next/image`; quatro `<img>` e um PNG grande sem referência. |
| Fontes | 1 | Sem `next/font`; tokens apontam para variáveis de fonte não definidas. |
| Core Web Vitals | 1 | Sem RUM/CI Lighthouse; padrões atuais elevam risco de LCP/INP. |
| Busca marketplace | 4 | URL-driven na listagem de operadores; cache e paginação/cursor ainda não comprovados. |
| Observabilidade | 0 | Sem coleta versionada de CWV, cache hit, TTFB ou latência de API. |

## Prioridade

- **P0:** concluir auth server-first, imagens/fontes, eliminar Client Components de página que não precisam ser interativos, paralelizar dados e estabelecer baseline.
- **P1:** Next 16, Cache Components/PPR, webhook HMAC de revalidação, CDN e streaming segmentado.
- **P2:** Redis para agregados caros, busca popular, rate limit e idempotência — nunca como cópia indiscriminada do cache do Next.

Os detalhes operacionais estão nos documentos desta pasta.
