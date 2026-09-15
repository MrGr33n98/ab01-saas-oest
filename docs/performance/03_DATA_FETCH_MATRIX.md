# Matriz de dados e fetching

## Implementado no P0

| Fetcher | Consumidores | Execução | Política | Deduplicação / erro |
| --- | --- | --- | --- | --- |
| `getPosts(locale)` | `/blog`, static params | Server-only | 1 h, `article-index:{locale}` | `React.cache`; retorna lista vazia se API pública indisponível |
| `getPost(slug)` | metadata e página do artigo | Server-only | 1 h, `article:{slug}` | `React.cache`; evita busca duplicada de metadata/página |
| `fetchOperators(params)` | `/operators`, static params | Server-only | 5 min, `operators` + tag por filtros | `React.cache`; retorna lista vazia em falha |
| `fetchOperatorBySlug(slug)` | metadata e perfil | Server-only | 5 min, `operator:{slug}` | `React.cache`; retorna `null` em falha |

`OEST_API_URL` é preferido no server. `NEXT_PUBLIC_API_URL` fica restrito a chamadas de browser existentes até a migração de sessão/BFF.

## Direção obrigatória

| Domínio | Fetch inicial | Cache | Invalidação | Observação |
| --- | --- | --- | --- | --- |
| Perfil/serviço/categoria público | Server Component | Fetch Data Cache + CDN | tag por entidade | metadata e page usam o mesmo fetcher cacheado |
| Busca marketplace | Server a partir de `searchParams` | resultado público curto; facetas longas | por catálogo | filtros, sort e página na URL; cursor quando necessário |
| Favorito/orçamento/CTA personalizado | ilha cliente ou slot dinâmico | privado / seletivo | mutação do usuário | não contaminar página pública |
| Dashboard | Server Component + `Suspense` | somente lookup/config privada por tenant | por tenant | `Promise.all` para blocos independentes |
| Notificações/status de missão | ilha cliente | SWR/TanStack Query seletivo | polling/backoff ou evento | sem `useEffect` para conteúdo SEO inicial |
| Admin e billing | Server Component autenticado | `no-store` por padrão | mutação própria | agregados caros podem ter Redis privado |

## Padrões de implementação

1. Componentes não chamam `fetch` diretamente para domínio de negócio; importam fetcher documentado em `lib/data/` ou `lib/api/`.
2. Buscar em paralelo com `Promise.all` quando não houver dependência; não serializar perfil → reviews → relacionados.
3. Cada fetcher deve definir contrato, tags, revalidate, timeout e fallback. Não ocultar erros de autorização como lista vazia em domínios privados.
4. O estado inicial SEO vem do servidor. SWR/TanStack Query é reservado a refinamentos e dados vivos após interação.
5. Após auth em cookie, usar `cache()` para deduplicação por request; não fazer cache global de respostas autenticadas.
