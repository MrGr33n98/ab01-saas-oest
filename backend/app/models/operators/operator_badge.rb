# frozen_string_literal: true

module Operators
  class OperatorBadge < ApplicationRecord
    self.table_name = "operator_badges"

    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"
    belongs_to :verification_badge

    validates :verification_badge_id, uniqueness: { scope: :operator_profile_id }
    scope :active, -> { where(status: "active") }
  end
end
