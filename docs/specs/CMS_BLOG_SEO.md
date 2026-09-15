# Spec — CMS Blog + SEO / AEO / GEO

## Objetivo
Motor de conteúdo bilíngue (pt-BR, en) para aquisição inbound de compradores de missões/dados e educação de operadores.

## Fora de escopo
- ActiveAdmin gem
- Multi-autor workflow complexo (aprovação em cadeia)
- Tradução automática IA (v1: posts por locale manuais)

## Agregados (DDD)

### Cms::Post
- Identity: uuid
- Invariants: published ⇒ published_at present; slug immutable after publish (recomendado)
- Methods: `publish!`, `unpublish!`

### Cms::Tag (opcional v1.1)
- slug, name, locale

## API pública
- `GET /api/v1/content/posts?locale=en&page=`
- `GET /api/v1/content/posts/:slug?locale=en`

## API admin
- `CRUD /api/v1/admin/posts` (platform_admin)

## SEO checklist por página de artigo
1. title ≤ 60 chars (meta_title)
2. description 120–160 chars
3. canonical absoluto
4. og:title, og:description, og:image
5. h1 único
6. JSON-LD Article
7. FAQPage se faq_blocks.any?
8. hreflang pt-BR ↔ en quando existir par traduzido (`translation_key`)

## GEO
- `geo_states`: %w[MT MS GO]
- Conteúdo deve mencionar região de forma natural (não keyword stuffing)

## AEO
- faq_blocks: `[{ "q": "...", "a": "..." }]`
- Resposta direta nas primeiras 2 frases do H2

## TDD
- model: publish! sets published_at
- request: unpublished not in public index
- request: admin only for write
