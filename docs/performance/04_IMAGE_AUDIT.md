# Auditoria de imagens

## Estado observado

| Item | Evidência | Impacto | Ação |
| --- | --- | --- | --- |
| Otimização Next | 1 import de `next/image` no frontend | a maior parte das imagens não recebe resize/formato responsivo automático | migrar imagens com dimensão conhecida para `next/image` |
| HTML cru | 4 ocorrências de `<img>` | risco de CLS, download excessivo e ausência de `sizes` | corrigir após definir domínios permitidos ou proxy de imagem |
| Hero OEST | `public/images/oest-solar-inspection.webp`, 203.688 bytes, referenciado | formato já adequado ao hero, mas precisa checar `sizes` e LCP real | manter como única imagem `priority` se for LCP |
| PNG fonte | `public/images/oest-solar-inspection.png`, 2.471.755 bytes, sem referência | ocupa release/artefato sem benefício | excluir do artefato/repositório após confirmar que o WebP é o derivado aprovado |
| Imagens remotas | origem/domínios não padronizados | impedem política segura de `next/image` | mapear API de media, configurar `remotePatterns` estritos ou image proxy |

## Presets obrigatórios

| Preset | Renderizado | Origem máxima recomendada | `sizes` típico | Prioridade |
| --- | --- | --- | --- | --- |
| `hero` | 100vw/50vw | 2.560 px | `(max-width: 768px) 100vw, 52vw` | somente uma LCP |
| `card` | 280–420 px | 960 px | `(max-width: 768px) 100vw, 33vw` | lazy |
| `thumbnail` | 96–160 px | 480 px | `96px` ou `160px` | lazy |
| `avatar` | 40–96 px | 256 px | `40px`–`96px` | lazy |
| `gallery` | 720–1.200 px | 1.920 px | conforme container | primeira visível apenas |

## Regras

- Toda imagem deve ter dimensões intrínsecas ou `fill` em container com aspect-ratio definido; CLS alvo é < 0,1.
- `priority`/preload somente para a imagem LCP atual. Carrossel, logo wall, footer e conteúdo below-the-fold nunca usam preload.
- Preferir AVIF/WebP; não solicitar um original de 3.000 px para card de 300 px.
- Placeholders blur somente quando a percepção justificar. O `blurDataURL` deve ser minúsculo; nunca base64 grande.
- Fotos operacionais precisam de `alt` que descreva ativo e finalidade. Imagem decorativa recebe `alt=""`.
- Adicionar uma verificação de assets não referenciados ao pipeline antes de apagar binários; o PNG atual é candidato concreto.
