# Telemetry Privacy Contract

Telemetry properties are governed by an allowlist in `Telemetry::EventSchema`.
The allowlist is a data-minimization boundary: a producer may send a property,
but it is persisted only when its event contract permits that property.

## Operational identifiers

`organization_id`, `project_id`, `mission_id`, and `deliverable_id` are
operational identifiers. They are permitted where the event schema lists them,
or stored in the event's first-class columns by `Telemetry::Collector`. They
must not be replaced with customer names, addresses, or other personal data.

## Allowed properties

| Event | Allowed properties |
| --- | --- |
| `mission.created` | `project_id`, `mission_type` |
| `mission.published` | `mission_type` |
| `mission.completed` | `deliverable_id` |
| `quote.accepted` | `mission_id`, `total` |
| `order.created` | `mission_id`, `total`, `currency` |
| `webhook.delivery_succeeded` | `status_code`, `duration_ms` |
| `webhook.delivery_failed` | `status_code`, `attempt`, `error_class` |

Events without an entry retain no free-form properties. Nested hashes and
arrays are not valid telemetry property values and are dropped.

## Prohibited data

Do not emit email addresses, names, phone numbers, CPF/CNPJ, addresses, IP
addresses, cookies, session identifiers, credentials, authorization headers,
tokens, API keys, or payment card data. `Telemetry::Sanitizer` is a second
defense that removes prohibited keys recursively; it is not a replacement for
the event allowlist.

## Retention and responsibility

This repository does not define an automated telemetry retention job. Until a
retention policy is implemented and approved, producers must emit only the
allowlisted operational data above. Every producer is responsible for adding a
new property to `Telemetry::EventSchema`, its specs, and this document before
emitting it.
