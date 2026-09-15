# Estratégia Redis

## Princípio

Redis não é o cache padrão do frontend. Para conteúdo público renderizado pelo Next, a sequência é: CDN → Full Route/Data Cache do Next → Rails. Redis entra quando há dado caro, compartilhado e de curta validade que esses níveis não resolvem bem.

## Casos aprovados

| Caso | Chave / isolamento | TTL inicial | Invalidação | Observação |
| --- | --- | ---: | --- | --- |
| Rate limit | `oest:v1:rate:{scope}:{identity}` | janela 60–3.600 s | expiração | IP/usuário com hash; atomicidade |
| Replay de webhook | `oest:v1:revalidate:event:{id}` | 600 s | expiração | `SET NX`; obrigatório para segurança |
| Agregado de perfil público | `oest:v1:public:operator:{id}:rating` | 60–300 s | evento review/operator | apenas se Rails não fornecer cache eficiente |
| Facetas/counters públicos | `oest:v1:public:facet:{version}:{hash}` | 300 s | catálogo | cache-aside, dados sem usuário |
| Busca popular | `oest:v1:public:search:{hash}` | 30–120 s | expiração/catálogo | normalizar filtros e limitar cardinalidade |
| Snapshot de disponibilidade | `oest:v1:public:availability:{id}` | 30–60 s | evento + TTL | não prometer dado em tempo real se estiver stale |
| Sessão/config privada | `oest:v1:tenant:{tenantId}:session:{id}` | conforme sessão | logout/revogação | somente após auth cookie segura |
| Idempotência de mutação | `oest:v1:tenant:{tenantId}:idem:{key}` | 24 h | expiração | checkout, envio de orçamento, webhook |
| Lock distribuído | `oest:v1:lock:{resource}` | curto | expiração segura | jobs críticos, nunca lock sem timeout |

## Proibido

- Copiar automaticamente cada `fetch` cacheável do Next em Redis.
- Chaves privadas sem `tenantId`/escopo. `provider:123` é insuficiente para dado multi-tenant.
- Cachear token, senha, cookie, JWT, PII sensível ou resposta de billing no Redis sem criptografia/política de retenção aprovada.
- Abrir cliente Redis por request; usar singleton/pool apropriado ao runtime.
- Expor Redis diretamente ao browser.

## Cache-aside seguro

```text
request -> Redis GET -> miss -> Rails/Postgres -> validar/normalizar -> Redis SET EX -> resposta
```

Instrumentar hit ratio, `p95` de GET/SET, erros, evictions, memória e cardinalidade. Só promover um caso após medir que a query de origem é efetivamente cara ou popular.

## Relação com Next 16

Cache Components pode exigir uma estratégia de cache compartilhada em self-hosting. Isso não autoriza usar um Redis genérico como handler sem avaliar compatibilidade, invalidação cross-release e limites de serialização. Escolher o cache handler/plataforma suportado e fazer teste de consistência antes de ativar PPR em produção.
