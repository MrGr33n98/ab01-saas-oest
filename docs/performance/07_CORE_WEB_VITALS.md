# Core Web Vitals

## Meta

| Métrica | Meta de produto | Meta interna |
| --- | ---: | ---: |
| LCP | < 2,5 s | < 2,0 s |
| INP | < 200 ms | < 150 ms |
| CLS | < 0,1 | < 0,05 |

## Estado da medição

Não há evidência de RUM, CrUX, Vercel Analytics/Speed Insights ou Lighthouse CI versionado. Portanto, não existe score de CWV verificável. Os scores no resumo são risco arquitetural, não resultados de campo.

## Riscos por métrica

| Métrica | Risco observado | Mitigação |
| --- | --- | --- |
| LCP | hero e outras imagens fora de `next/image`; anúncios/client fetch em páginas públicas; CDN não comprovado | uma única imagem LCP prioritária, `sizes`, ISR/CDN, atrasar ads/terceiros |
| INP | 31 páginas-clientes, editor sem split e polling no header | Server Components first, ilhas pequenas, dynamic import e reduzir listeners/polling |
| CLS | `<img>` sem reserva de área; fonte não declarada/controlada | width/height/aspect ratio, `next/font`, skeletons estruturais |
| TTFB | backend externo/cache compartilhado não confirmado | fetch cache, tags, CDN, chamada interna `OEST_API_URL`, evitar SSR público |

## Instrumentação obrigatória

- RUM: reportar `web-vitals` com rota, build SHA, device class, país/região e conexão, sem PII.
- Servidor: duração de RSC/route, latência Rails, cache hit/miss, revalidações e erros por endpoint.
- CDN: hit ratio, `Age`, origin response time e bytes transferidos por rota pública.
- Redis: hit/miss, latência p50/p95, evictions, conexões e erros — somente depois de seu uso.
- Alertar regressão de p75 por rota, não somente média global.

## Cenários Lighthouse CI

Executar contra deployment preview autenticado quando houver API de teste determinística:

1. `/`
2. `/operators`
3. um `/operators/[slug]` estável
4. `/services`
5. `/pricing`

Usar mobile como gate primário. O primeiro ciclo coleta baseline; no segundo, thresholds progressivos entram como aviso; só então tornam-se bloqueantes.
