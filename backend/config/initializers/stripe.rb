# frozen_string_literal: true

# Stripe boots only when keys exist. Toggle with STRIPE_ENABLED=true.
begin
  Integrations::Stripe::Config.configure!
rescue LoadError
  Rails.logger.warn("[stripe] gem not loaded — bundle install stripe")
rescue StandardError => e
  Rails.logger.warn("[stripe] configure skipped: #{e.message}")
end
