# Auditoria de fontes

## Estado observado

- Não há uso de `next/font`.
- `tailwind.config.ts` referencia `--font-geist-sans` e `--font-geist-mono`, mas as variáveis não são definidas pelo layout atual.
- O browser cai em famílias de sistema. Isso reduz transferência hoje, mas não entrega a identidade tipográfica controlada descrita para a OEST.

## Implementação alvo

1. Escolher uma família sans licenciada ou uma fonte local WOFF2 para UI/display. Evitar usar uma família remota via CSS sem controle de preload.
2. Registrar com `next/font/local` (ou `next/font` quando apropriado), declarar as variáveis no `app/layout.tsx` e fazer Tailwind apontar para elas.
3. Carregar no caminho crítico somente pesos realmente usados acima da dobra: normalmente `400`, `500` e `700`; idealmente dois pesos para o primeiro release.
4. Usar subset latino, `font-display: swap` e métrica/fallback ajustados para reduzir layout shift.
5. Não pré-carregar fonte monospace, itálica ou pesos de editor que não apareçam no primeiro viewport.

## Critério de aceite

- Máximo inicial: duas famílias e três arquivos críticos WOFF2.
- Sem request bloqueante a provedor externo de fontes no caminho LCP.
- Sem variável Tailwind sem definição em runtime.
- Validar CLS e renderização em 375, 768, 1440 e 1920 px.
