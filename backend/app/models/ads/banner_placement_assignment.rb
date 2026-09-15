# frozen_string_literal: true

module Ads
  class BannerPlacementAssignment < ApplicationRecord
    self.table_name = "banner_placement_assignments"

    belongs_to :banner, class_name: "Ads::Banner"
    belongs_to :banner_placement, class_name: "Ads::BannerPlacement"

    validates :banner_id, uniqueness: { scope: :banner_placement_id }
  end
end
