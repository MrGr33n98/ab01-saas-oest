# Matriz de invalidação e revalidação

## Tags canônicas

As tags públicas ficam em `lib/cache/cacheTags.ts`.

| Evento Rails/CMS | Tags | Rotas afetadas | Ação |
| --- | --- | --- | --- |
| operador publicado/editado/pausado | `operator:{slug}`, `operators` | `/operators`, `/operators/[slug]` | revalidar tag específica e diretório |
| serviço/categoria alterado | `service:{slug}`, `category:{slug}`, `operators` | serviço/categoria/diretório | revalidar apenas entidades relacionadas |
| review aprovada/removida | `operator:{slug}` | perfil do operador | revalidar perfil/agregado |
| artigo publicado/editado/despublicado | `article:{slug}`, `article-index:{locale}` | blog e artigo | revalidar artigo e índices afetados |
| preços alterados | `pricing`, `homepage` se exibidos | `/pricing`, `/` | revalidar tags |
| case/banner público alterado | tag de conteúdo + `homepage` quando aplicável | páginas de marketing | revalidar tags precisas |

## Webhook seguro: desenho alvo

```text
Rails outbox assinado
  -> POST /api/revalidate (Next)
  -> validar HMAC SHA-256 sobre corpo bruto
  -> validar timestamp (janela de 5 min)
  -> allow-list de event type e tags calculadas no servidor
  -> Redis SET NX eventId (TTL 10 min)
  -> revalidateTag(tag, 'max') / revalidatePath quando necessário
  -> log estruturado sem payload sensível
```

Não aceitar `tag`, `path` ou TTL arbitrários no corpo do cliente. O payload contém `eventId`, `eventType`, `occurredAt`, `entityId`/`slug` e assinatura; o endpoint gera as tags pela allow-list.

## Compatibilidade Next

O endpoint não foi criado neste P0 porque o app está em Next 15.5 e ainda não há segredo, contrato Rails nem Redis de produção validados. Após o upgrade para Next 16, usar o perfil recomendado `revalidateTag(tag, 'max')` para SWR. Para necessidade realmente imediata, avaliar perfil apropriado/`updateTag` apenas dentro de Server Action autenticada.

## Testes obrigatórios

1. Assinatura válida revalida somente tags permitidas.
2. Assinatura ausente/inválida, timestamp expirado e evento desconhecido recebem 401/400 sem efeito.
3. Repetição do mesmo `eventId` é idempotente.
4. Atualizar um operador não invalida artigo, pricing ou dados privados.
5. Erro transitório é reenfileirado via outbox; não perder evento por timeout.
