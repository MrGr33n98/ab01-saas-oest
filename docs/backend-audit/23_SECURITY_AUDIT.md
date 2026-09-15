# 23 — Security Audit (summary)

| Control | Status |
|---------|--------|
| Authn | Custom JWT — weak vs industry default |
| Authz | Pundit partial |
| Tenant | Header + membership; IDOR via find |
| Secrets | Default JWT in code path |
| Webhooks | Stripe signature path present |
| Mass assignment | Admin/operator params need continuous review |
| Uploads | Presign placeholder — MIME/size policy incomplete |
| SSRF | Low surface |
| SQL injection | AR used; raw SQL in matching coverage — review bind params |
| Rate limit | rack-attack gem; rules not fully specified in repo |
| CORS | Present — ensure allowlist not `*` in prod |
| Headers | secure_headers gem |

## Brakeman / bundle-audit

Not executed in sandbox. **CI must run both** before production.
