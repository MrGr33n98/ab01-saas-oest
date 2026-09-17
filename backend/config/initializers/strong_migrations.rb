# frozen_string_literal: true

if defined?(StrongMigrations)
  # Mark existing migrations as safe
  StrongMigrations.start_after = 20260917000002

  # Set timeouts for safe DDL executions
  StrongMigrations.lock_timeout = 10.seconds
  StrongMigrations.statement_timeout = 1.hour

  # Target database PostgreSQL version
  StrongMigrations.target_postgresql_version = "16"
end
