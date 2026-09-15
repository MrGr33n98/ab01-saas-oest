# frozen_string_literal: true

# Delivery:
#   development: letter_opener / Mailpit SMTP (docker compose port 1025)
#   production:  AWS SES via SMTP or aws-sdk-rails
#
# Env (SES SMTP):
#   MAIL_DELIVERY_METHOD=smtp
#   SMTP_ADDRESS=email-smtp.us-east-1.amazonaws.com
#   SMTP_PORT=587
#   SMTP_USERNAME=...   # SES SMTP credentials
#   SMTP_PASSWORD=...
#   SMTP_AUTHENTICATION=plain
#   SMTP_ENABLE_STARTTLS_AUTO=true
#   MAIL_FROM=DroneHub <noreply@seudominio.com>
#   APP_URL=https://app.seudominio.com

Rails.application.configure do
  method = ENV.fetch("MAIL_DELIVERY_METHOD", Rails.env.production? ? "smtp" : "smtp").to_sym

  config.action_mailer.delivery_method = method
  config.action_mailer.perform_deliveries = ENV.fetch("MAIL_PERFORM_DELIVERIES", "true") == "true"
  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.default_url_options = {
    host: URI.parse(ENV.fetch("APP_URL", "http://localhost:3000")).host,
    protocol: URI.parse(ENV.fetch("APP_URL", "http://localhost:3000")).scheme
  }

  if method == :smtp
    config.action_mailer.smtp_settings = {
      address: ENV.fetch("SMTP_ADDRESS", "localhost"),
      port: ENV.fetch("SMTP_PORT", "1025").to_i,
      user_name: ENV["SMTP_USERNAME"].presence,
      password: ENV["SMTP_PASSWORD"].presence,
      authentication: ENV["SMTP_AUTHENTICATION"].presence&.to_sym,
      enable_starttls_auto: ENV.fetch("SMTP_ENABLE_STARTTLS_AUTO", "false") == "true",
      domain: ENV.fetch("SMTP_DOMAIN", "dronehub.local")
    }.compact
  end
end
