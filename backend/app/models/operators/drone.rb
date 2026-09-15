# frozen_string_literal: true

module Operators
  class Drone < ApplicationRecord
    self.table_name = "drones"

    belongs_to :organization
    has_many :drone_payloads, class_name: "Operators::DronePayload", dependent: :destroy
    has_many :payloads, through: :drone_payloads, class_name: "Operators::Payload"

    validates :manufacturer, :model, presence: true
    validates :status, inclusion: { in: %w[active maintenance retired] }

    scope :active, -> { where(status: "active") }
  end
end
