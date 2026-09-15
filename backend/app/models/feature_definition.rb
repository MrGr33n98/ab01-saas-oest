# frozen_string_literal: true

class FeatureDefinition < ApplicationRecord
  self.table_name = "feature_definitions"

  has_many :plan_features, dependent: :destroy

  validates :key, :name, :min_plan, presence: true
  validates :key, uniqueness: true
end
