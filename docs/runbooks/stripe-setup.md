# Stripe — pagamentos (missões) e assinaturas (SaaS)

## O que já está no código

| Fluxo | Endpoint / service |
|-------|-------------------|
| Checkout de **pedido de missão** | `POST /api/v1/orders/:id/checkout` → `Payments::CreateStripeCheckout` |
| Confirmação automática | Webhook `POST /api/v1/webhooks/stripe` → `Payments::ApplyStripeEvent` |
| Confirmação manual (fallback MVP) | `POST /api/v1/orders/:id/confirm_payment` |
| Checkout de **plano SaaS** | `POST /api/v1/billing/checkout` `{ price_id }` |
| Config pública (publishable key) | `GET /api/v1/billing/stripe_config` |

## 1. Conta Stripe

1. [dashboard.stripe.com](https://dashboard.stripe.com) — modo **Test**
2. Developers → API keys → copiar `pk_test_…` e `sk_test_…`
3. (BR) Ativar **Pix** em Payment methods se quiser Pix via Stripe
4. Products → criar preços mensais Starter/Pro (para `price_id` de assinatura)

## 2. Variáveis de ambiente

```bash
export STRIPE_ENABLED=true
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_PUBLISHABLE_KEY=pk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...   # após criar o endpoint
export STRIPE_CURRENCY=brl
export STRIPE_ENABLE_PIX=true
export STRIPE_PLATFORM_FEE_BPS=1000      # 10% — Connect futuro
export APP_URL=http://localhost:3000
```

Desligado (default): `STRIPE_ENABLED=false` → checkout devolve provider `manual` e o fluxo concierge continua válido.

## 3. Webhook local

```bash
stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe
# copiar whsec_... para STRIPE_WEBHOOK_SECRET
```

Eventos mínimos:

- `checkout.session.completed`
- `payment_intent.succeeded` (opcional)
- `checkout.session.expired`
- `charge.refunded` (log)

Produção: Developers → Webhooks → `https://api.seudominio.com/api/v1/webhooks/stripe`

## 4. Fluxo missão (pagamento)

```text
accept quote → order (pending_payment)
→ POST /orders/:id/checkout → checkout_url
→ cliente paga no Stripe (card/Pix)
→ webhook checkout.session.completed
→ order.payment_status = paid + e-mail payment_confirmed
→ operador pode start mission
```

## 5. Recebimento do operador (Connect — próximo passo)

Código já prevê `STRIPE_PLATFORM_FEE_BPS`. Para split automático:

1. Stripe Connect (Express) para operadores
2. Destination charge ou `transfer_data` no PaymentIntent
3. Onboarding: `Account Links` no painel do operador

**MVP GTM:** plataforma recebe 100% no Stripe da conta DroneHub e paga o operador via Pix/TED manual (ou lote semanal) até Connect estar live.

## 6. Segurança

- Nunca expor `sk_` no frontend
- Webhook **sempre** com assinatura (`Stripe-Signature`)
- Idempotency: checkout usa `checkout-order-{order_id}`; apply event re-checa `payment_status`

## 7. Test cards

- Sucesso: `4242 4242 4242 4242`
- 3DS: `4000 0025 0000 3155`
- Pix: seguir fluxo de teste do Dashboard (BR)
