# frozen_string_literal: true

module Billing
  class Plan < ApplicationRecord
    self.table_name = "plans"

    has_many :subscriptions, class_name: "Billing::Subscription", dependent: :restrict_with_exception
    has_many :plan_features, dependent: :destroy
    has_many :feature_definitions, through: :plan_features

    validates :slug, uniqueness: { case_sensitive: false }, allow_nil: true
    scope :active, -> { where(active: true) }
    scope :for_operators, -> { where(audience: %w[operator both]) }
  end
end
