# SaaS Backlog

## Deferred from the P1/P2 operational hardening wave

### MFA/TOTP

- Add TOTP enrollment, recovery codes, challenge verification, and admin-focused enforcement.
- Preserve the existing authentication, tenancy, audit, and token-rotation contracts.
- The existing audit notes MFA as a security gap; this item is not implemented in the current wave.

### White-label

- Define organization-scoped branding, domain ownership verification, theme delivery, and asset isolation.
- Establish authorization, cache-key isolation, and migration/rollback plans before implementation.
- This item is intentionally deferred so it does not expand the current P1/P2 reliability scope.
