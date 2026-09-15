# frozen_string_literal: true

module Operators
  class Payload < ApplicationRecord
    self.table_name = "payloads"

    belongs_to :organization
    has_many :drone_payloads, class_name: "Operators::DronePayload", dependent: :destroy

    validates :name, :payload_type, presence: true
  end
end
