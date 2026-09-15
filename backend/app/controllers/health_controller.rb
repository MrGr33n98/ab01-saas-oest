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
end
