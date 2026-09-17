# frozen_string_literal: true

module Operators
  class SupportRequest < ApplicationRecord
    self.table_name = "operator_support_requests"

    STATUSES = %w[open in_progress resolved closed].freeze
    PRIORITIES = %w[low normal high urgent].freeze
    CATEGORIES = %w[general onboarding payments mission technical].freeze

    belongs_to :organization
    belongs_to :requested_by, class_name: "User"

    validates :subject, presence: true, length: { maximum: 240 }
    validates :message, presence: true
    validates :status, inclusion: { in: STATUSES }
    validates :priority, inclusion: { in: PRIORITIES }
    validates :category, inclusion: { in: CATEGORIES }
  end
end
