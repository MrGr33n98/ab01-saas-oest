# frozen_string_literal: true

module Operators
  class Pilot < ApplicationRecord
    self.table_name = "pilots"

    belongs_to :organization
    belongs_to :user, optional: true

    validates :full_name, presence: true, length: { maximum: 180 }
    validates :verification_status, inclusion: { in: %w[pending submitted verified rejected] }

    scope :available, -> { where(available: true) }
  end
end
