# frozen_string_literal: true

module Operators
  class DronePayload < ApplicationRecord
    self.table_name = "drone_payloads"

    belongs_to :organization
    belongs_to :drone, class_name: "Operators::Drone"
    belongs_to :payload, class_name: "Operators::Payload"

    validates :drone_id, uniqueness: { scope: :payload_id }
  end
end
