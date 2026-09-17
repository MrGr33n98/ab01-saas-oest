# frozen_string_literal: true

# Payment credentials are transient input to the Operator payout endpoint.
# Filtering prevents them from leaking to Rails logs, exception reports or the
# ActiveAdmin request trail even though the application does not persist them.
Rails.application.config.filter_parameters += %i[
  password password_confirmation token access_token refresh_token authorization
  account_number iban routing_number bank_account payout_provider_reference
]
