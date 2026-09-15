# frozen_string_literal: true

module Quotes
  class Quote < ApplicationRecord
    self.table_name = "quotes"

    STATUSES = %w[draft submitted viewed negotiating accepted rejected expired withdrawn].freeze

    belongs_to :mission, class_name: "Missions::Mission"
    belongs_to :customer_organization, class_name: "Organization"
    belongs_to :operator_organization, class_name: "Organization"
    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"
    belongs_to :submitted_by, class_name: "User"
    has_many :quote_items, class_name: "Quotes::QuoteItem", dependent: :destroy
    has_one :order, class_name: "Orders::Order", dependent: :restrict_with_exception

    validates :status, inclusion: { in: STATUSES }
    validates :currency, length: { is: 3 }

    scope :open, -> { where(status: %w[submitted viewed negotiating]) }
    scope :for_mission, ->(mission_id) { where(mission_id: mission_id) }

    def acceptible?
      status.in?(%w[submitted viewed negotiating])
    end

    def financial_immutable?
      status == "accepted"
    end
  end
end
