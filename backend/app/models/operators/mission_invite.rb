# frozen_string_literal: true

module Operators
  class MissionInvite < ApplicationRecord
    self.table_name = "operator_mission_invites"

    STATUSES = %w[pending accepted declined expired cancelled].freeze

    belongs_to :mission, class_name: "Missions::Mission"
    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"
    belongs_to :invited_by, class_name: "User"
    belongs_to :responded_by, class_name: "User", optional: true

    validates :status, inclusion: { in: STATUSES }
    validates :operator_profile_id, uniqueness: { scope: :mission_id }

    scope :inbox, -> { order(created_at: :desc) }
    scope :pending, -> { where(status: "pending") }

    def expired?
      expires_at.present? && expires_at <= Time.current
    end

    def actionable?
      status == "pending" && !expired?
    end
  end
end
