# AWS SES — e-mails transacionais DroneHub

## 1. Domínio

1. SES → Verified identities → Create domain (`seudominio.com`)
2. Publicar registros DKIM / SPF / DMARC no DNS
3. Sair de sandbox (production access) para enviar a qualquer destinatário

## 2. Credenciais SMTP (recomendado no MVP)

SES → SMTP settings → Create SMTP credentials

```bash
export MAIL_DELIVERY_METHOD=smtp
export SMTP_ADDRESS=email-smtp.sa-east-1.amazonaws.com   # região da conta
export SMTP_PORT=587
export SMTP_USERNAME=AKIA...
export SMTP_PASSWORD=...
export SMTP_AUTHENTICATION=plain
export SMTP_ENABLE_STARTTLS_AUTO=true
export MAIL_FROM="DroneHub <noreply@seudominio.com>"
export APP_URL=https://app.seudominio.com
export MAIL_DELIVERY=async
```

## 3. Local (Mailpit)

`docker compose up -d mailpit` → SMTP `localhost:1025`, UI `http://localhost:8025`

```bash
export SMTP_ADDRESS=localhost
export SMTP_PORT=1025
export SMTP_ENABLE_STARTTLS_AUTO=false
export MAIL_FROM="DroneHub <noreply@dronehub.local>"
export APP_URL=http://localhost:3000
```

## 4. Catálogo de templates

| Template | Quando |
|----------|--------|
| `welcome` | sign_up |
| `password_reset` | forgot password |
| `email_verification` | opcional pós-signup |
| `mission_published` | publish |
| `job_invite` | matching → operador |
| `quote_received` | quote submit |
| `quote_accepted` | accept (cliente + operador) |
| `payment_confirmed` | confirm_payment |
| `mission_started` | start |
| `deliverable_ready` | finalize upload |
| `deliverable_approved` / `rejected` | review |
| `review_received` | review create |
| `operator_verified` | admin verify |

Dispatch: `Mail::Deliver.call(:quote_received, user: u, mission: m, quote: q)`

## 5. Checklist produção

- [ ] Domínio verificado + DKIM
- [ ] From alinhado ao domínio
- [ ] Bounce/complaint SNS (opcional)
- [ ] Fila Sidekiq `mailers` processando
- [ ] Teste: `TransactionalMailer.welcome(...).deliver_now`
