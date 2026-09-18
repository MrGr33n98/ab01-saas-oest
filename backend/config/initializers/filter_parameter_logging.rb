# frozen_string_literal: true

# Payment credentials and webhook signing secrets are sensitive.
# Filtering prevents them from leaking to Rails logs, exception reports or the
# ActiveAdmin request trail even though the application persists or handles them.
Rails.application.config.filter_parameters += %i[
  password password_confirmation token access_token refresh_token authorization
  account_number iban routing_number bank_account payout_provider_reference
  secret_key secret webhook_secret signature
]
