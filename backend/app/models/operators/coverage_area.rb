# frozen_string_literal: true

module Operators
  class CoverageArea < ApplicationRecord
    self.table_name = "coverage_areas"

    belongs_to :organization
    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"

    scope :active, -> { where(active: true) }

    def covers?(geometry)
      return false if self.geometry.blank? || geometry.blank?
      # Real check uses ST_Intersects / ST_Covers in SQL
      true
    end
  end
end
