# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Health endpoints", type: :request do
  it "returns liveness without dependency checks" do
    get "/health"

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)).to include("status" => "ok", "service" => "dronehub-api")
  end

  it "returns readiness when PostgreSQL and the Sidekiq Redis broker are reachable" do
    get "/ready"

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)).to eq(
      "status" => "ready",
      "checks" => {
        "database" => "ok",
        "redis" => "ok",
        "workers" => "not_required"
      }
    )
  end

  it "returns 503 when PostgreSQL is unavailable" do
    with_readiness_dependencies(database_pool: unavailable_database_pool) do
      get "/ready"

      expect(response).to have_http_status(:service_unavailable)
      expect(JSON.parse(response.body)).to include(
        "status" => "not_ready",
        "checks" => include("database" => "unavailable")
      )
    end
  end

  it "returns 503 when the Sidekiq Redis broker is unavailable" do
    with_readiness_dependencies(sidekiq_config: unavailable_sidekiq_config) do
      get "/ready"

      expect(response).to have_http_status(:service_unavailable)
      expect(JSON.parse(response.body)).to include(
        "status" => "not_ready",
        "checks" => include("redis" => "unavailable")
      )
    end
  end

  private

  def unavailable_database_pool
    database_config = ActiveRecord::DatabaseConfigurations::HashConfig.new(
      "test",
      "readiness_unavailable",
      unavailable_database_configuration
    )
    pool_config = ActiveRecord::ConnectionAdapters::PoolConfig.new(
      ReadinessUnavailableDatabase,
      database_config,
      :writing,
      :default
    )
    pool_config.pool
  end

  def unavailable_database_configuration
    ActiveRecord::Base.connection_db_config.configuration_hash
      .except(:url)
      .merge(host: "127.0.0.1", port: 1, connect_timeout: 1)
  end

  def unavailable_sidekiq_config
    Sidekiq::Config.new.tap do |config|
      config.redis = { url: "redis://127.0.0.1:1/0", network_timeout: 0.1, pool_timeout: 0.1 }
    end
  end

  def with_readiness_dependencies(database_pool: ActiveRecord::Base.connection_pool, sidekiq_config: Sidekiq.default_configuration)
    # The route uses the real checks with independently configured, unreachable clients.
    allow(Health::Readiness).to receive(:call).and_wrap_original do |method|
      method.call(database_pool: database_pool, sidekiq_config: sidekiq_config)
    end
    yield
  ensure
    database_pool.disconnect! if database_pool != ActiveRecord::Base.connection_pool
  end
end
