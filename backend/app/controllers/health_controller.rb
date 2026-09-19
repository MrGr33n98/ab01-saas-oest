# frozen_string_literal: true

class HealthController < ActionController::API
  def show
    render json: {
      status: "ok",
      service: "dronehub-api",
      time: Time.current.iso8601,
      version: ENV.fetch("APP_VERSION", "dev")
    }
  end

  def ready
    readiness = Health::Readiness.call

    render json: {
      status: readiness.ready? ? "ready" : "not_ready",
      checks: readiness.checks
    }, status: readiness.ready? ? :ok : :service_unavailable
  end
end
