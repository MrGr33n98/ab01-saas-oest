# Matriz de rendering por rota

Legenda: **Atual** combina a saída de `next build` com a implementação. `STATIC + CLIENT` significa que o HTML é pré-renderizado, porém o arquivo da página declara `use client`; isso **não** é autenticação SSR. **Alvo** é a classificação a perseguir. `PPR` só entra após upgrade para Next 16 e validação de Cache Components. Nenhuma rota privada deve entrar em cache público.

## Públicas e indexáveis

| Rota | Atual | Alvo | Auth | Volatilidade | SEO | Cache / revalidação |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | STATIC | ISR | Não | Baixa | Sim | `homepage`, 10 min; revalidar por conteúdo aprovado |
| `/en` | STATIC | STATIC/ISR | Não | Baixa | Sim | Separar cache por locale; 24 h se estático |
| `/pricing` | STATIC + ilha ad | ISR | Não | Média | Sim | `pricing`, 10 min; webhook de pricing |
| `/services` | STATIC + ilha ad | ISR | Não | Média | Sim | `service:*`, 30 min |
| `/coverage` | STATIC | ISR | Não | Média | Sim | Cobertura agregada, 30 min |
| `/customers` | STATIC | ISR | Não | Média | Sim | Cases aprovados, 1 h |
| `/data-products` | STATIC + ilha ad | ISR | Não | Média | Sim | Produto público, 30 min |
| `/enterprise` | STATIC | STATIC/ISR | Não | Baixa | Sim | 24 h ou CMS |
| `/faq` | STATIC | STATIC/ISR | Não | Baixa | Sim | 24 h ou CMS |
| `/glossary` | STATIC | ISR | Não | Média | Sim | 24 h |
| `/how-it-works` | STATIC | STATIC/ISR | Não | Baixa | Sim | 24 h |
| `/contact` | STATIC | STATIC | Não | Baixa | Sim | 24 h; formulário é ilha cliente |
| `/compare/dronehub-vs-contratar-avulso` | STATIC | STATIC/ISR | Não | Baixa | Sim | 24 h |
| `/legal/privacy` | STATIC | STATIC | Não | Baixa | Sim | 24 h+; versionar conteúdo |
| `/legal/terms` | STATIC | STATIC | Não | Baixa | Sim | 24 h+; versionar conteúdo |
| `/operators` | DYNAMIC (query string) | PPR / DYNAMIC com dados cacheados | Não | Média | Sim | diretório 5 min; filtros na URL; não pré-buildar combinações |
| `/operators/[slug]` | ISR | ISR + PPR | Não* | Média | Sim | `operator:{slug}`, 5 min; top 100 no build, cauda longa sob demanda |
| `/blog` | ISR após P0 | ISR | Não | Média | Sim | `article-index:{locale}`, 1 h |
| `/blog/[slug]` | ISR após P0 | ISR + PPR | Não | Média | Sim | `article:{slug}`, 1 h; top 100 no build, restante sob demanda |

\*Estado de favorito, permissão de contato, orçamento ativo e disponibilidade atual devem ser ilhas dinâmicas autenticadas. O perfil e o SEO permanecem públicos/cacheáveis.

## Autenticação

| Rota | Atual | Alvo | Auth | Volatilidade | SEO | Cache / revalidação |
| --- | --- | --- | --- | --- | --- | --- |
| `/forgot-password` | STATIC + CLIENT | DYNAMIC SSR shell + form island | Não | Alta | Não | `no-store` para fluxo/token |
| `/reset-password` | STATIC + CLIENT | DYNAMIC SSR shell + form island | Token | Alta | Não | `no-store` |
| `/sign-in` | STATIC + CLIENT | DYNAMIC SSR shell + form island | Não | Alta | Não | `no-store` |
| `/sign-up` | STATIC + CLIENT | DYNAMIC SSR shell + form island | Não | Alta | Não | `no-store` |
| `/verify-email` | STATIC + CLIENT | DYNAMIC SSR shell + form island | Token | Alta | Não | `no-store` |

## Aplicação do cliente (privada)

| Rota | Atual | Alvo | Auth | Volatilidade | SEO | Cache / revalidação |
| --- | --- | --- | --- | --- | --- | --- |
| `/app` | STATIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | página `no-store`; lookups por tenant com cache privado |
| `/app/billing` | STATIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | `no-store`; nunca CDN |
| `/app/data-library` | STATIC + CLIENT | DYNAMIC + ilhas | Sim | Alta | Não | `no-store`; paginação/cursor |
| `/app/integrations` | STATIC + CLIENT | DYNAMIC | Sim | Média | Não | config do tenant com chave privada |
| `/app/missions` | STATIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | `no-store`; filtros na URL |
| `/app/missions/new` | STATIC + CLIENT | DYNAMIC + form island | Sim | Alta | Não | `no-store` |
| `/app/missions/[id]` | DYNAMIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | `no-store` |
| `/app/missions/[id]/deliverables` | DYNAMIC + CLIENT | DYNAMIC + ilhas | Sim | Alta | Não | URLs assinadas e dados privados sem CDN |
| `/app/missions/[id]/quotes` | DYNAMIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | `no-store` |
| `/app/orders` | STATIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | `no-store` |
| `/app/projects` | STATIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | `no-store` |
| `/app/settings` | STATIC + CLIENT | DYNAMIC + form island | Sim | Média | Não | `no-store` |
| `/app/support` | STATIC + CLIENT | DYNAMIC + form island | Sim | Alta | Não | `no-store` |
| `/app/team` | STATIC + CLIENT | DYNAMIC + streaming | Sim | Média | Não | chave privada por tenant |

## Aplicação do operador (privada)

| Rota | Atual | Alvo | Auth | Volatilidade | SEO | Cache / revalidação |
| --- | --- | --- | --- | --- | --- | --- |
| `/operator` | STATIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | `no-store` para KPIs pessoais |
| `/operator/analytics` | STATIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | agregados privados com Redis opcional |
| `/operator/compliance` | STATIC + CLIENT | DYNAMIC | Sim | Média | Não | `no-store` |
| `/operator/coverage` | STATIC + CLIENT | DYNAMIC + map island | Sim | Média | Não | chave privada |
| `/operator/fleet` | STATIC + CLIENT | DYNAMIC | Sim | Média | Não | `no-store` |
| `/operator/fleet/drones` | STATIC + CLIENT | DYNAMIC + form island | Sim | Média | Não | `no-store` |
| `/operator/fleet/payloads` | STATIC + CLIENT | DYNAMIC + form island | Sim | Média | Não | `no-store` |
| `/operator/growth` | STATIC + CLIENT | DYNAMIC | Sim | Média | Não | `no-store` |
| `/operator/jobs` | STATIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | `no-store` |
| `/operator/missions` | STATIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | `no-store` |
| `/operator/missions/[id]` | DYNAMIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | `no-store` |
| `/operator/payments` | STATIC + CLIENT | DYNAMIC | Sim | Alta | Não | `no-store`; billing nunca CDN |
| `/operator/pilots` | STATIC + CLIENT | DYNAMIC | Sim | Média | Não | `no-store` |
| `/operator/proposals` | STATIC + CLIENT | DYNAMIC + streaming | Sim | Alta | Não | `no-store` |
| `/operator/services` | STATIC + CLIENT | DYNAMIC + form island | Sim | Média | Não | `no-store` |
| `/operator/settings` | STATIC + CLIENT | DYNAMIC + form island | Sim | Média | Não | `no-store` |

## Administração (privada)

| Rota | Atual | Alvo | Auth | Volatilidade | SEO | Cache / revalidação |
| --- | --- | --- | --- | --- | --- | --- |
| `/admin` | STATIC + CLIENT | DYNAMIC + streaming | Admin | Alta | Não | `no-store` |
| `/admin/analytics` | STATIC + CLIENT | DYNAMIC + streaming | Admin | Alta | Não | agregados internos; Redis opcional |
| `/admin/badges` | STATIC + CLIENT | DYNAMIC | Admin | Média | Não | `no-store` |
| `/admin/banners` | STATIC + CLIENT | DYNAMIC | Admin | Média | Não | `no-store` |
| `/admin/categories` | STATIC + CLIENT | DYNAMIC | Admin | Média | Não | `no-store` |
| `/admin/disputes` | STATIC + CLIENT | DYNAMIC + streaming | Admin | Alta | Não | `no-store` |
| `/admin/marketplace` | STATIC + CLIENT | DYNAMIC + streaming | Admin | Alta | Não | `no-store` |
| `/admin/missions` | STATIC + CLIENT | DYNAMIC + streaming | Admin | Alta | Não | `no-store` |
| `/admin/operators` | STATIC + CLIENT | DYNAMIC + streaming | Admin | Alta | Não | `no-store` |
| `/admin/operators/[id]` | DYNAMIC + CLIENT | DYNAMIC | Admin | Alta | Não | `no-store` |
| `/admin/orders` | STATIC + CLIENT | DYNAMIC + streaming | Admin | Alta | Não | `no-store` |
| `/admin/plans` | STATIC + CLIENT | DYNAMIC | Admin | Média | Não | `no-store` |
| `/admin/posts` | STATIC + CLIENT | DYNAMIC | Admin | Média | Não | `no-store` |
| `/admin/reviews` | STATIC + CLIENT | DYNAMIC | Admin | Média | Não | `no-store` |
| `/admin/risk` | STATIC + CLIENT | DYNAMIC + streaming | Admin | Alta | Não | `no-store` |
| `/admin/support` | STATIC + CLIENT | DYNAMIC + streaming | Admin | Alta | Não | `no-store` |
| `/admin/verifications` | STATIC + CLIENT | DYNAMIC + streaming | Admin | Alta | Não | `no-store` |

## Lacunas públicas

Há links e dados que sugerem páginas SEO para serviços, produtos de dados, clientes/cases e glossário por slug, mas os arquivos de rota correspondentes não existem hoje. Antes de gerar qualquer combinação cidade × serviço, criar apenas páginas com conteúdo, disponibilidade e canonical reais; evitar doorway pages vazias.
