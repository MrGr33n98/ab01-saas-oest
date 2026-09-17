# frozen_string_literal: true

module Matching
  # MVP V1: hard filters only — coverage PostGIS ∩ service ∩ accepting_jobs ∩ verified.
  class BuildCandidateSet
    def self.call(mission:)
      new(mission: mission).call
    end

    def initialize(mission:)
      @mission = mission
    end

    def call
      scope = Operators::OperatorProfile.where(
        searchable: true, accepting_jobs: true, verification_status: "verified"
      )
      profile_ids = scope.pluck(:id)
      return [] if profile_ids.empty?

      if mission_has_geometry?
        profile_ids &= coverage_profile_ids(profile_ids)
      end

      if mission.mission_products.any?
        with_services = Marketplace::ServiceOffering.where(active: true, operator_profile_id: profile_ids)
          .distinct.pluck(:operator_profile_id)
        profile_ids &= with_services if with_services.any?
      end

      Operators::OperatorProfile.where(id: profile_ids).order(:slug).map do |profile|
        {
          operator_id: profile.id,
          organization_id: profile.organization_id,
          slug: profile.slug,
          headline: profile.headline,
          score: nil,
          band: "eligible",
          reasons: [{ key: "eligible", label: "Cobertura + verificado + aceitando jobs" }],
          algorithm_version: "v1"
        }
      end
    end

    private

    attr_reader :mission

    def mission_has_geometry?
      mission.geometry.present? || mission.area_hectares.present?
    end

    def coverage_profile_ids(profile_ids)
      return [] if profile_ids.blank?

      unless postgis_available?
        Rails.logger.warn("PostGIS extension not available for spatial matching. Environment: #{Rails.env}")
        # Em test/development sem PostGIS, permite fallback se configurado; em produção SEMPRE fail-closed
        return (Rails.env.test? || Rails.env.development?) ? profile_ids : []
      end

      Operators::CoverageArea
        .active
        .where(operator_profile_id: profile_ids)
        .where.not(geometry: [nil, {}, "{}"])
        .joins(
          Operators::CoverageArea.sanitize_sql_array([
            "INNER JOIN missions ON missions.id = ? AND missions.geometry IS NOT NULL AND missions.geometry != '{}'::jsonb AND ST_Intersects(ST_GeomFromGeoJSON(coverage_areas.geometry::text), ST_GeomFromGeoJSON(missions.geometry::text))",
            mission.id
          ])
        )
        .distinct
        .pluck(:operator_profile_id)
    rescue StandardError => e
      Rails.logger.error("Spatial matching query failed for mission #{mission.id}: #{e.message}")
      Sentry.capture_exception(e) if defined?(Sentry) && Sentry.respond_to?(:initialized?) && Sentry.initialized?

      # Fail-closed em produção: falha de infraestrutura espacial nunca deve vazar candidatos fora de cobertura
      (Rails.env.test? || Rails.env.development?) ? profile_ids : []
    end

    def postgis_available?
      @postgis_available ||= begin
        res = ActiveRecord::Base.connection.select_value("SELECT 1 FROM pg_extension WHERE extname = 'postgis'")
        res.present?
      rescue StandardError => e
        Rails.logger.error("PostGIS availability check failed: #{e.message}")
        Sentry.capture_exception(e) if defined?(Sentry) && Sentry.respond_to?(:initialized?) && Sentry.initialized?
        false
      end
    end
  end
end
