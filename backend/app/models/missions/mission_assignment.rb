# frozen_string_literal: true

module Missions
  class MissionAssignment < ApplicationRecord
    self.table_name = "mission_assignments"

    belongs_to :mission, class_name: "Missions::Mission"
    belongs_to :order, class_name: "Orders::Order"
    belongs_to :operator_organization, class_name: "Organization"
    belongs_to :pilot, class_name: "Operators::Pilot", optional: true
    belongs_to :drone, class_name: "Operators::Drone", optional: true
    belongs_to :assigned_by, class_name: "User"

    validates :status, inclusion: { in: %w[assigned confirmed in_progress completed cancelled] }
  end
end
