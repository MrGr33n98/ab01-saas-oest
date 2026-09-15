# frozen_string_literal: true

module Missions
  class MissionStatusEvent < ApplicationRecord
    self.table_name = "mission_status_events"

    belongs_to :mission, class_name: "Missions::Mission"
    belongs_to :actor, class_name: "User", optional: true

    validates :to_status, presence: true
  end
end
