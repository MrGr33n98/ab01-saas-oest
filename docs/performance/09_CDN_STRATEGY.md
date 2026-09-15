# Estratégia CDN

## Estado atual

O repositório contém Docker/Compose de produção, mas não uma configuração verificável de CDN ou reverse proxy cacheando respostas do Next. Não é possível afirmar cache hit, `Age` ou TTFB de produção sem cabeçalhos e telemetria.

## Arquitetura recomendada

```text
Internet -> CDN/WAF -> Next standalone -> Rails privado -> Postgres
                    -> assets versionados / otimizados
```

- Se a hospedagem for Vercel, preferir a CDN/ISR nativos e configurar o Rails somente para endpoints públicos seguros quando necessário.
- Em self-hosting, usar CDN/WAF na frente do Next e manter Rails sem exposição pública direta. O cache do contêiner não é substituto para CDN compartilhado.
- Backends públicos podem enviar `CDN-Cache-Control`/`Vercel-CDN-Cache-Control` com `s-maxage` e `stale-while-revalidate`; o browser pode receber um `Cache-Control` mais conservador.

## Cabeçalhos por classe

| Classe | Header de borda sugerido | Regra |
| --- | --- | --- |
| HTML público ISR | `public, s-maxage=300, stale-while-revalidate=3600` | TTL vem da matriz, apenas sem cookie/auth |
| Artigo público | `public, s-maxage=3600, stale-while-revalidate=86400` | invalidar por tag na publicação |
| Asset com hash | `public, max-age=31536000, immutable` | nome/URL deve mudar a cada versão |
| Fonte WOFF2 versionada | `public, max-age=31536000, immutable` | subset e filename/versionamento |
| JSON público de facetas | `public, s-maxage=3600, stale-while-revalidate=86400` | só se resposta não variar por usuário |
| Auth, dashboard, billing, admin | `private, no-store` | sem CDN público |
| Entrega privada/URL assinada | `private, no-store` | expiração curta e controle de acesso |

## Proteções

- Allow-list de query params cacheáveis; ignorar parâmetros analíticos na canonicalização, não no controle de acesso.
- `Vary` mínimo e explícito. Não variar página pública por Cookie; separar o slot personalizado em ilha dinâmica.
- Não cachear respostas com `Set-Cookie`, `Authorization` ou dados tenant-scoped como públicas.
- Ter chave/purge por tag/URL e observar cache poisoning com URLs anormais, locale e headers.

## Verificação de release

Para cada rota pública, registrar `Cache-Control`, `CDN-Cache-Control`, `Age`, `x-cache` equivalente, TTFB e tamanho de resposta em hit/miss. Uma CDN sem essa observabilidade não é uma estratégia operável.
