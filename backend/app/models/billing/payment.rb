# frozen_string_literal: true

module Billing
  class Payment < ApplicationRecord
    self.table_name = "payments"

    belongs_to :order, class_name: "Orders::Order"
    belongs_to :payer_organization, class_name: "Organization"

    validates :provider, :status, :amount, :currency, presence: true
  end
end
