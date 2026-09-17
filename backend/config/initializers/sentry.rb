# frozen_string_literal: true

if ENV["SENTRY_DSN"].present?
  Sentry.init do |config|
    config.dsn = ENV["SENTRY_DSN"]
    config.breadcrumbs_logger = %i[active_support_logger http_logger]
    config.environment = ENV.fetch("RAILS_ENV", "development")

    # Sample rate for transactions / APM
    config.traces_sample_rate = ENV.fetch("SENTRY_TRACES_SAMPLE_RATE", "0.2").to_f

    # Sanitize sensitive headers & parameters
    config.send_default_pii = false
    config.excluded_exceptions += [
      "ActiveRecord::RecordNotFound",
      "ActionController::RoutingError",
      "Pundit::NotAuthorizedError"
    ]

    # Context enrichment without sensitive credentials
    config.before_send = lambda do |event, hint|
      # Filter tokens, passwords, and bearer headers
      if event.request
        event.request.headers&.delete("Authorization")
        event.request.headers&.delete("Cookie")
      end

      # Add request and tenant identifiers
      event.tags[:request_id] = Current.request_id if defined?(Current) && Current.respond_to?(:request_id)
      event.tags[:organization_id] = Current.organization_id if defined?(Current) && Current.respond_to?(:organization_id)

      event
    end
  end
end
