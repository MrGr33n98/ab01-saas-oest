# frozen_string_literal: true

module Quotes
  # Side-by-side comparison for the customer — real numbers only.
  class ComparisonQuery
    def self.call(mission:, organization:)
      new(mission: mission, organization: organization).call
    end

    def initialize(mission:, organization:)
      @mission = mission
      @organization = organization
    end

    def call
      raise ActiveRecord::RecordNotFound if mission.organization_id != organization.id

      quotes = Quotes::Quote
        .where(mission_id: mission.id)
        .where(status: %w[submitted viewed negotiating accepted])
        .includes(:operator_profile, :quote_items)
        .order(:total, :created_at)

      {
        mission: {
          id: mission.id,
          title: mission.title,
          status: mission.status,
          area_hectares: mission.area_hectares,
          deadline_at: mission.deadline_at,
          currency: mission.currency
        },
        quotes: quotes.map { |q| serialize_quote(q) }
      }
    end

    private

    attr_reader :mission, :organization

    def serialize_quote(q)
      profile = q.operator_profile
      org = profile&.organization
      coverage = coverage_fit(profile)

      {
        id: q.id,
        status: q.status,
        subtotal: q.subtotal&.to_f,
        platform_fee: q.platform_fee&.to_f,
        taxes: q.taxes&.to_f,
        total: q.total&.to_f,
        currency: q.currency,
        estimated_start_at: q.estimated_start_at,
        estimated_delivery_at: q.estimated_delivery_at,
        proposal_text: q.proposal_text,
        lock_version: q.lock_version,
        submitted_at: q.submitted_at,
        acceptible: q.respond_to?(:acceptible?) ? q.acceptible? : q.status.in?(%w[submitted viewed negotiating]),
        items: q.quote_items.map { |i|
          {
            description: i.description,
            quantity: i.quantity&.to_f,
            unit: i.unit,
            unit_price: i.unit_price&.to_f,
            total_price: i.total_price&.to_f
          }
        },
        operator: {
          profile_id: profile&.id,
          slug: profile&.slug,
          headline: profile&.headline,
          verified: profile&.verification_status == "verified",
          rating_average: profile&.rating_count.to_i.positive? ? profile.rating_average&.to_f : nil,
          rating_count: profile&.rating_count.to_i,
          missions_completed: profile&.missions_completed.to_i,
          organization_name: org&.name,
          logo_url: logo_url(org)
        },
        coverage_fit: coverage,
        equipment_summary: equipment_summary(org)
      }
    end

    def coverage_fit(profile)
      return { label: "Sem dados de cobertura", level: "unknown" } unless profile && mission.geometry.present?

      intersects = Operators::CoverageArea
        .where(operator_profile_id: profile.id, active: true)
        .where("geometry IS NOT NULL")
        .where(
          "ST_Intersects(geometry, (SELECT geometry FROM missions WHERE id = ?))",
          mission.id
        )
        .exists?

      if intersects
        { label: "Atende a AOI da missão", level: "full" }
      else
        { label: "Cobertura não confirmada para esta AOI", level: "none" }
      end
    rescue StandardError
      { label: "Cobertura não avaliada", level: "unknown" }
    end

    def equipment_summary(org)
      return [] unless org

      Operators::Drone.where(organization_id: org.id, status: "active").limit(5).map { |d|
        "#{d.manufacturer} #{d.model}".strip
      }
    end

    def logo_url(org)
      return nil unless org&.logo_asset_id

      asset = Deliverables::Asset.find_by(id: org.logo_asset_id)
      return nil unless asset

      Integrations::Storage::S3Presigner.new.public_object_url(asset.storage_key)
    rescue StandardError
      nil
    end
  end
end
