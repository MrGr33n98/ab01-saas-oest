# frozen_string_literal: true

module Ads
  class BannerEvent < ApplicationRecord
    self.table_name = "banner_events"

    belongs_to :banner, class_name: "Ads::Banner"
    belongs_to :banner_placement, class_name: "Ads::BannerPlacement", optional: true

    validates :event_type, inclusion: { in: %w[impression click] }
    validates :occurred_at, presence: true
  end
end
