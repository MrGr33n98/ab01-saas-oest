# Auditoria de JavaScript e hidratação

## Evidência atual

| Indicador | Resultado | Leitura |
| --- | ---: | --- |
| Rotas `page.tsx` | 71 | superfície de aplicação relevante |
| Páginas com `use client` | 31 | alto risco de hidratar shells inteiros privados |
| Componentes cliente | 17 | necessário separar ilhas de páginas completas |
| `dynamic()` | 0 | mapas, editor e modais não são carregados sob demanda |
| `next/image` | 1 | não é métrica de JS, mas revela maturidade baixa do critical path |
| Dependências pesadas candidatas | Tiptap, TanStack Query, Lucide | importar somente no segmento/ilha que precisa |
| Produção — *First Load JS* do Next | `/` 114 KB; blog/perfil público 107 KB; diretório 109 KB | baseline de compilação, não peso gzip/Brotli transferido |

## Causas prioritárias

- As páginas de `/app`, `/operator` e `/admin` executam fetch/autenticação no browser porque o token mora em `localStorage`.
- `ToastProvider` é uma fronteira cliente global em `app/layout.tsx`; confirmar que contém apenas UX de toast e não importa bibliotecas pesadas.
- `BannerSlot` faz busca e impressão no cliente e é usado em páginas públicas. Anúncio não pode atrasar conteúdo comercial/SEO; renderizar server-side quando público ou atrasar a ilha.
- `NotificationBell` faz polling no header. Não o enviar em layouts públicos que não precisam de estado autenticado.
- Não há split explícito para editor Tiptap, mapas/áreas interativas ou modais complexos.

## Plano técnico

1. Após migração de sessão, converter o shell de cada dashboard para Server Component; manter form, drag/drop, mapa e live refresh como ilhas cliente.
2. Carregar editor Tiptap apenas na rota de edição. Mapas e gráficos entram por `dynamic(() => import(...), { ssr: false })` dentro do componente específico e com placeholder estático.
3. Importar ícones individualmente de `lucide-react`; proibir barrels que reexportem a biblioteca inteira.
4. Introduzir análise de bundle no CI e registrar artefatos por rota antes de adotar um gate bloqueante.

## Budget progressivo

| Página | Meta ideal gzip | Gate inicial |
| --- | ---: | --- |
| Landing pública | < 120 KB | não crescer > 15% do baseline aprovado |
| Homepage | < 150 KB | não crescer > 15% |
| Perfil marketplace | < 180 KB | não crescer > 15% |
| Dashboard inicial | medir primeiro | nenhum chunk inicial inesperado > 15% |

Os valores só se tornam bloqueantes depois de duas execuções estáveis no mesmo runner, rota e condição de rede. O relatório atual do Next não declara compressão; medir bytes transferidos em Lighthouse/Chrome antes de comparar diretamente os budgets gzip.

## Build trace

`next build` detectou um lockfile fora de `frontend/` e inferiu uma raiz de workspace ampla. `next.config.ts` agora declara `outputFileTracingRoot: __dirname`, mantendo o trace da imagem standalone no app que de fato é implantado. O Dockerfile deve continuar copiando `public` e `.next/static` para o standalone, porque o próprio Next não os inclui automaticamente.
