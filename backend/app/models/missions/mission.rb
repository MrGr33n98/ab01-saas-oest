# frozen_string_literal: true

module Missions
  class Mission < ApplicationRecord
    self.table_name = "missions"

    STATUSES = %w[
      draft planning published quoting operator_selected
      scheduled in_progress processing review completed
      cancelled disputed
    ].freeze

    belongs_to :organization
    belongs_to :project, class_name: "Projects::Project"
    belongs_to :created_by, class_name: "User"
    has_many :mission_products, class_name: "Missions::MissionProduct", dependent: :destroy
    has_one :mission_requirements, class_name: "Missions::MissionRequirement", dependent: :destroy
    has_many :status_events, class_name: "Missions::MissionStatusEvent", dependent: :destroy
    has_many :quotes, class_name: "Quotes::Quote", dependent: :restrict_with_exception
    has_one :order, class_name: "Orders::Order", dependent: :restrict_with_exception
    has_many :deliverables, class_name: "Deliverables::Deliverable", dependent: :restrict_with_exception

    validates :title, presence: true, length: { maximum: 200 }
    validates :mission_type, presence: true
    validates :status, inclusion: { in: STATUSES }
    validates :currency, length: { is: 3 }
    validates :priority, inclusion: { in: %w[low normal high urgent] }

    scope :for_organization, ->(org) { where(organization_id: org.id) }
    scope :published_marketplace, -> { where(status: %w[published quoting], visibility: "marketplace") }

    def draft?
      status == "draft"
    end

    def published?
      status.in?(%w[published quoting operator_selected scheduled in_progress processing review])
    end

    def terminal?
      status.in?(%w[completed cancelled disputed])
    end

    def publishable?
      draft? || status == "planning"
    end

    def has_aoi?
      geometry.present?
    end

    def has_products?
      mission_products.exists?
    end
  end
end
