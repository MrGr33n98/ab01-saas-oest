# frozen_string_literal: true

module Billing
  class Subscription < ApplicationRecord
    self.table_name = "subscriptions"

    belongs_to :organization
    belongs_to :plan, class_name: "Billing::Plan"
  end
end
