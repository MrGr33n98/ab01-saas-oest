# frozen_string_literal: true

module Enterprises
  class Profile < ApplicationRecord
    self.table_name = "enterprise_profiles"

    belongs_to :organization

    validates :industry, length: { maximum: 120 }, allow_blank: true
    validates :phone_e164, length: { maximum: 32 }, allow_blank: true
    validates :billing_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
    validates :payment_currency, format: { with: /\A[A-Z]{3}\z/ }
    validate :billing_address_is_an_object

    private

    def billing_address_is_an_object
      errors.add(:billing_address, "must be an object") unless billing_address.is_a?(Hash)
    end
  end
end
