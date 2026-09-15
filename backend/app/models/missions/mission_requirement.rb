# frozen_string_literal: true

module Missions
  class MissionRequirement < ApplicationRecord
    self.table_name = "mission_requirements"

    belongs_to :organization
    belongs_to :mission, class_name: "Missions::Mission"
  end
end
