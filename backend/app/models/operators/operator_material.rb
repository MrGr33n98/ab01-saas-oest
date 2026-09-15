# frozen_string_literal: true

module Operators
  class OperatorMaterial < ApplicationRecord
    self.table_name = "operator_materials"

    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"
    belongs_to :organization

    validates :title, :file_url, presence: true
    scope :published, -> { where(published: true).order(:position) }
  end
end
