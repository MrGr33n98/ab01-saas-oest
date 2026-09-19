# frozen_string_literal: true

require "timeout"

module Health
  class Readiness
    CHECK_TIMEOUT_SECONDS = 1.0
    WORKERS_STATUS = "not_required"

    Result = Struct.new(:ready?, :checks, keyword_init: true)

    def self.call(**dependencies)
      new(**dependencies).call
    end

    def initialize(database_pool: ActiveRecord::Base.connection_pool, sidekiq_config: Sidekiq.default_configuration)
      @database_pool = database_pool
      @sidekiq_config = sidekiq_config
    end

    def call
      checks = {
        database: run_check { database_ready? },
        redis: run_check { redis_ready? },
        workers: WORKERS_STATUS
      }

      Result.new(
        ready?: checks.slice(:database, :redis).values.all? { |value| value == "ok" },
        checks: checks
      )
    end

    private

    attr_reader :database_pool, :sidekiq_config

    def database_ready?
      within_timeout do
        database_pool.with_connection do |connection|
          connection.select_value("SELECT 1")
        end
      end
    end

    def redis_ready?
      within_timeout do
        sidekiq_config.redis { |connection| connection.ping }
      end
    end

    def run_check
      yield
      "ok"
    rescue StandardError
      "unavailable"
    end

    def within_timeout
      Timeout.timeout(CHECK_TIMEOUT_SECONDS) { yield }
    end
  end
end
