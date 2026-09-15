# Matriz de cache

As políticas são declaradas em `frontend/lib/cache/policies.ts`, e as tags públicas em `frontend/lib/cache/cacheTags.ts`. Não espalhar TTLs nem strings de tag em componentes.

| Recurso | Público | TTL | SWR sugerido no CDN | Tag | Fonte / observação |
| --- | --- | ---: | ---: | --- | --- |
| Homepage | Sim | 600 s | 3.600 s | `homepage` | ISR; métricas públicas agregadas somente |
| Preços | Sim | 600 s | 3.600 s | `pricing` | revalidar em alteração de catálogo/preço |
| Diretório de operadores | Sim | 300 s | 1.800 s | `operators` + hash de filtros | filtros URL-driven; limitar variantes indexáveis |
| Perfil de operador | Sim | 300 s | 3.600 s | `operator:{slug}` | perfil, serviços, certificações e rating agregado |
| Categoria | Sim | 1.800 s | 86.400 s | `category:{slug}` | página pública e facetas estáveis |
| Serviço | Sim | 1.800 s | 86.400 s | `service:{slug}` | conteúdo/SEO e ofertas agregadas |
| Índice de artigos | Sim | 3.600 s | 86.400 s | `article-index:{locale}` | locale deve fazer parte da chave |
| Artigo | Sim | 3.600 s | 86.400 s | `article:{slug}` | webhook em publicar/editar/despublicar |
| Legal estático | Sim | 86.400 s | 604.800 s | versão de conteúdo | revalidar por publicação |
| Facetas (UF/cidade/tipo) | Sim | 3.600–86.400 s | 86.400 s | por coleção | somente dados não personalizados |
| Sessão, billing, missão, proposta | **Não** | — | — | — | `Cache-Control: private, no-store` |
| URLs de entrega/arquivos privados | **Não** | — | — | — | URL assinada curta; não passar por CDN público |

## Regras de segurança

- Uma resposta que varie por `Cookie`, `Authorization`, usuário ou tenant jamais recebe `public`, `s-maxage` ou tag pública.
- Query string só deve entrar na chave de cache após normalização e allow-list. Não refletir headers arbitrários em HTML/cache key.
- Locale é parte explícita de tags, caminho e canonical quando i18n estiver ativo.
- O cache do Next reduz chamadas de origem, mas em Docker standalone o cache local pode desaparecer num novo contêiner. Para cache compartilhado entre réplicas/releases usar plataforma gerenciada ou cache handler compatível, após teste de consistência.
