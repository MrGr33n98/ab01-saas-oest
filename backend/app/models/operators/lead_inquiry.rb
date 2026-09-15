# frozen_string_literal: true

module Operators
  class LeadInquiry < ApplicationRecord
    self.table_name = "operator_lead_inquiries"

    STATUSES = %w[pending_response contacted converted_to_mission archived].freeze

    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"
    belongs_to :organization, optional: true

    validates :contact_name, :contact_email, :service_type, presence: true
    validates :status, inclusion: { in: STATUSES }

    scope :pending, -> { where(status: "pending_response") }
    scope :recent, -> { order(created_at: :desc) }
  end
end
