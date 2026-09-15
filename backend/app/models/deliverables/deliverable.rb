# frozen_string_literal: true

module Deliverables
  class Deliverable < ApplicationRecord
    self.table_name = "deliverables"

    STATUSES = %w[uploading processing available in_review approved rejected archived].freeze

    belongs_to :organization
    belongs_to :mission, class_name: "Missions::Mission"
    belongs_to :data_product, class_name: "Marketplace::DataProduct"
    belongs_to :uploaded_by, class_name: "User"

    validates :title, presence: true
    validates :status, inclusion: { in: STATUSES }
    validates :version, numericality: { greater_than: 0 }

    scope :latest_per_product, lambda {
      select("DISTINCT ON (mission_id, data_product_id) *")
        .order("mission_id, data_product_id, version DESC")
    }
  end
end
