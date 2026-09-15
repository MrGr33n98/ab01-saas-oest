# Stripe Connect (operadores)

## Fluxo
1. Operador: `POST /api/v1/operator/connect` → onboarding Express
2. Stripe Account Link → KYC
3. `organizations.stripe_account_id` salvo
4. Checkout missão: se account presente → `payment_intent_data.application_fee_amount` + `transfer_data.destination`

## Env
Mesmas keys do `stripe-setup.md` + conta platform com Connect habilitado.

## UI
`/operator/payments`
