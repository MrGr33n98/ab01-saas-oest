# frozen_string_literal: true

module Billing
  class Settlement < ApplicationRecord
    self.table_name = "settlements"

    belongs_to :order, class_name: "Orders::Order"
    belongs_to :operator_organization, class_name: "Organization"
  end
end
