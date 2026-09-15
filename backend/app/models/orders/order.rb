# frozen_string_literal: true

module Orders
  class Order < ApplicationRecord
    self.table_name = "orders"

    STATUSES = %w[pending_payment paid in_progress completed cancelled disputed].freeze
    # payment_status: unpaid|paid|failed (column on orders)

    belongs_to :mission, class_name: "Missions::Mission"
    belongs_to :quote, class_name: "Quotes::Quote"
    belongs_to :customer_organization, class_name: "Organization"
    belongs_to :operator_organization, class_name: "Organization"
    has_many :payments, class_name: "Billing::Payment", dependent: :restrict_with_exception
    has_one :settlement, class_name: "Billing::Settlement", dependent: :restrict_with_exception
    has_many :mission_assignments, class_name: "Missions::MissionAssignment", dependent: :restrict_with_exception

    validates :status, inclusion: { in: STATUSES }
    validates :subtotal, :marketplace_fee, :operator_amount, :total, presence: true
  end
end
