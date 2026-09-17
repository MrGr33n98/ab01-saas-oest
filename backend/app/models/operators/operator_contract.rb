# frozen_string_literal: true

module Operators
  class OperatorContract < ApplicationRecord
    self.table_name = "operator_contracts"

    STATUSES = %w[pending active expired revoked].freeze

    belongs_to :organization
    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"

    validates :title, presence: true
    validates :status, inclusion: { in: STATUSES }
  end
end
