# frozen_string_literal: true

class PlanFeature < ApplicationRecord
  self.table_name = "plan_features"

  belongs_to :plan, class_name: "Billing::Plan"
  belongs_to :feature_definition

  validates :feature_definition_id, uniqueness: { scope: :plan_id }
end
