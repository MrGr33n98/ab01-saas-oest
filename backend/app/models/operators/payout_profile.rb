# frozen_string_literal: true

module Operators
  # Stores KYC and display-safe payout metadata only. The external payout
  # provider is the system of record for banking credentials.
  class PayoutProfile < ApplicationRecord
    self.table_name = "operator_payout_profiles"

    ACCOUNT_KINDS = %w[business personal].freeze
    VERIFICATION_STATUSES = %w[unverified pending verified rejected].freeze

    belongs_to :organization
    belongs_to :updated_by, class_name: "User", optional: true

    validates :account_kind, inclusion: { in: ACCOUNT_KINDS }
    validates :verification_status, inclusion: { in: VERIFICATION_STATUSES }
    validates :bank_account_last4, format: { with: /\A\d{4}\z/ }, allow_blank: true
    validate :billing_data_is_an_object

    private

    def billing_data_is_an_object
      errors.add(:billing_data, "must be an object") unless billing_data.is_a?(Hash)
    end
  end
end
