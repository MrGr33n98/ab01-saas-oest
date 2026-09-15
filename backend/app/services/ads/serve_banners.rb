# frozen_string_literal: true

module Ads
  class ServeBanners
    def self.call(placement_key:, category_slug: nil, audience: "anonymous", limit: 1)
      new(
        placement_key: placement_key,
        category_slug: category_slug,
        audience: audience,
        limit: limit
      ).call
    end

    def initialize(placement_key:, category_slug:, audience:, limit:)
      @placement_key = placement_key
      @category_slug = category_slug
      @audience = audience
      @limit = limit.to_i.clamp(1, 5)
    end

    def call
      placement = Ads::BannerPlacement.find_by(key: placement_key, active: true)
      return [] unless placement

      candidates = Ads::Banner
        .joins(:banner_placement_assignments)
        .where(banner_placement_assignments: { banner_placement_id: placement.id, active: true })
        .live
        .order(priority: :desc, weight: :desc)

      matched = candidates.select { |b| b.matches_context?(category_slug: category_slug, audience: audience) }
      matched.first(limit).map { |b| serialize(b, placement) }
    end

    private

    attr_reader :placement_key, :category_slug, :audience, :limit

    def serialize(banner, placement)
      {
        id: banner.id,
        placement_key: placement.key,
        name: banner.name,
        title: banner.title,
        subtitle: banner.subtitle,
        cta_label: banner.cta_label.presence || "Saiba mais",
        cta_url: banner.cta_url,
        image_url: banner.image_url,
        background_color: banner.background_color,
        text_color: banner.text_color,
        width_hint: placement.width_hint,
        height_hint: placement.height_hint
      }
    end
  end
end
