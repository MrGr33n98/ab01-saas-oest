# frozen_string_literal: true

module Ads
  class Banner < ApplicationRecord
    self.table_name = "banners"

    STATUSES = %w[draft scheduled active paused ended rejected].freeze
    FORMAT_TYPES = %w[hero_carousel leaderboard sidebar in_feed footer ticker standard].freeze
    TARGET_AUDIENCES = %w[all customer operator anonymous].freeze

    has_many :banner_placement_assignments, class_name: "Ads::BannerPlacementAssignment", dependent: :destroy
    has_many :placements, through: :banner_placement_assignments, source: :banner_placement
    has_many :banner_events, class_name: "Ads::BannerEvent", dependent: :delete_all

    validates :name, presence: true
    validates :cta_url, presence: true
    validates :status, inclusion: { in: STATUSES }
    validates :format_type, inclusion: { in: FORMAT_TYPES }
    validates :target_audience, inclusion: { in: TARGET_AUDIENCES }, allow_blank: true
    validates :weight, numericality: { greater_than: 0 }
    validates :priority, numericality: true

    scope :live, lambda {
      now = Time.current
      where(status: "active")
        .where("starts_at IS NULL OR starts_at <= ?", now)
        .where("ends_at IS NULL OR ends_at >= ?", now)
    }

    scope :hero_carousels, -> { where(format_type: "hero_carousel") }
    scope :ordered_by_delivery, -> { order(priority: :desc, weight: :desc, updated_at: :desc) }

    def live?
      status == "active" &&
        (starts_at.nil? || starts_at <= Time.current) &&
        (ends_at.nil? || ends_at >= Time.current)
    end

    def matches_context?(category_slug: nil, audience: "anonymous")
      return false unless live?

      ta = target_audience.presence || "all"
      return false if ta != "all" && ta != audience

      cats = Array(targeting["category_slugs"]).compact.reject(&:blank?)
      return true if cats.blank?
      return false if category_slug.blank?

      cats.include?(category_slug)
    end

    def ctr
      return 0.0 unless impression_count.to_i.positive?

      (click_count.to_f / impression_count * 100).round(2)
    end

    def ctr_percentage
      "#{ctr}%"
    end

    def category_slugs
      Array(targeting["category_slugs"]).compact
    end

    def states
      Array(targeting["states"]).compact
    end
  end
end
