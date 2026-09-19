# Testing

## Canonical backend test command

The supported local backend test command is:

```bash
docker compose --profile test up --build --abort-on-container-exit --exit-code-from backend-test backend-test
```

It uses Ruby 3.2.2, the committed `backend/Gemfile.lock`, PostgreSQL with
PostGIS, and Redis. The test container creates/prepares `dronehub_test` and
runs `bundle exec rspec`; it does not use a host Ruby, global gems, or a
production database.

For an already provisioned equivalent environment, run from `backend`:

```bash
bundle install
bin/rails db:prepare
bundle exec rails zeitwerk:check
bundle exec rspec
```

The local host must satisfy the same Ruby version and use the lockfile. Do not
work around a missing `rspec` executable with global gem installation.

## Readiness contract

`GET /health` is liveness and does not query dependencies. `GET /ready` checks
PostgreSQL and the Redis broker configured for Sidekiq, each with a bounded
timeout. It returns `503` without internal exceptions when either dependency is
unavailable.

Sidekiq worker capacity is not a readiness gate: API writes can be accepted
when Redis durably accepts jobs, while worker capacity is monitored as an
operational/SLO signal. The readiness payload therefore reports
`workers: "not_required"` explicitly instead of claiming a worker probe.
