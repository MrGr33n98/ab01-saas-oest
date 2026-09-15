# DroneHub — Backlog liderança de mercado

**Idiomas:** pt-BR (default), en  
**Moeda MVP:** BRL · Geografia: BR (MT/MS/GO)  
**Práticas:** DDD (bounded contexts), TDD nos gates, SEO/AEO/GEO no conteúdo público  
**Admin:** domínio próprio (`/admin/*`) — **não** ActiveAdmin gem (decisão MVP); equivalente editorial em `/admin/posts`

---

## Bounded contexts (DDD)

| Context | Responsabilidade |
|---------|------------------|
| Identity | Auth, membership, i18n preferência de locale |
| Marketplace | Categorias, operadores, matching |
| Missions | Ciclo de missão / quotes / deliverables |
| Billing | Stripe, pagamentos, invoices |
| Content (CMS) | Posts, tags, SEO fields, FAQ blocks |
| Growth | Ads slots, analytics de aquisição |
| Notifications | E-mail transacional SES |

---

## Épico A — i18n (pt-BR + en)

### US-A01 — Visitante escolhe idioma
**Como** visitante estrangeiro, **quero** ver a plataforma em inglês, **para** avaliar compra de missões/dados.

**Critérios de aceite**
- [ ] Locale `pt-BR` | `en` via URL (`/en/...`) ou cookie `NEXT_LOCALE`
- [ ] Landing, pricing, operators, categories, sign-in/up traduzidos
- [ ] `html lang` reflete locale
- [ ] Preferência persistida pós-login (`users.locale`)
- [ ] Teste: dicionário cobre chaves críticas (TDD snapshot keys)

### US-A02 — API errors localizáveis
**Como** cliente API, **quero** mensagens de erro em en/pt, **para** integrar sem atrito.

**AC:** header `Accept-Language` ou `X-Locale`; códigos estáveis (`EMAIL_TAKEN`); `title`/`detail` traduzidos.

---

## Épico B — Catálogo alinhado

### US-B01 — Categorias seed = frontend
**AC**
- [ ] Seed inclui as 6 oficiais + `media` + `survey` (ou UI remove as 2 extras)
- [ ] Spec: `ServiceCategory.active.pluck(:slug)` ⊇ slugs da UI
- [ ] Data products 8 estáveis com slug imutável

---

## Épico C — Loop comercial (P0)

### US-C01 — E-mails golden path
**AC:** publish, job_invite, quote_received, quote_accepted, payment_confirmed, deliverable_ready/rejected → `Mail::Deliver` + job; spec request ou service.

### US-C02 — Pagar com Stripe no UI
**AC:** botão no workspace se `payment_status != paid`; `POST /orders/:id/checkout`; redirect; webhook marca paid; fallback manual.

### US-C03 — Jobs do operador (API)
**AC:** `GET /operator/jobs` lista missões elegíveis; dashboard sem mock permanente; empty state honesto.

---

## Épico D — CMS Blog + SEO/AEO/GEO

### US-D01 — Modelo Post (DDD Content)
**Campos:** slug, title, body_md, status, published_at, locale (`pt-BR`|`en`), meta_title, meta_description, canonical_url, og_image_url, h1, geo_states[], geo_cities[], category_slugs[], faq_blocks jsonb, author_id

**AC**
- [ ] Migration + model `Cms::Post`
- [ ] Unicidade `(locale, slug)`
- [ ] Só `published` no público
- [ ] Factory + model specs (TDD)

### US-D02 — Admin editorial `/admin/posts`
**AC:** CRUD, draft/publish, preview SEO, edição FAQ, targeting GEO, sem ActiveAdmin gem.

### US-D03 — Site público `/blog`
**AC**
- [ ] Index + `/blog/[slug]` por locale
- [ ] H1 único = `post.h1` ou title
- [ ] Meta title/description/OG/canonical
- [ ] JSON-LD `Article` + `FAQPage` se faq_blocks
- [ ] Internal links para `/categories/[slug]` e `/operators`
- [ ] Sitemap inclui posts published

### US-D04 — GEO
**AC:** filtro `?state=MT`; posts com `geo_states`; landing copy regional opcional.

### US-D05 — AEO
**AC:** blocos pergunta/resposta; schema FAQPage; H2 interrogativos no body.

---

## Épico E — SEO técnico sitewide

### US-E01
**AC:** `app/sitemap.ts`, `app/robots.ts`, Organization JSON-LD no layout, OG defaults, canonical por página.

---

## Épico F — Ativação

### US-F01 — Checklist 1ª missão (cliente)
### US-F02 — Checklist operador (cobertura, frota, serviço, verified)

---

## Ordem de implementação (time)

1. i18n foundation + switcher  
2. Unificar categorias  
3. SEO técnico (sitemap/robots/JSON-LD)  
4. CMS model + admin + blog público  
5. Loop comercial C01–C03  
6. Checklists ativação  

---

## Definition of Done (qualquer US)

- [ ] Spec/teste automatizado no path crítico  
- [ ] Sem métricas inventadas na UI  
- [ ] pt-BR + en nas strings de UI tocadas  
- [ ] SEO: title + description nas rotas públicas novas  
- [ ] Review de tenant isolation se tocar API autenticada  
