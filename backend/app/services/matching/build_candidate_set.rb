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
      quoted = profile_ids.map { |id| ActiveRecord::Base.connection.quote(id) }.join(",")
      sql = <<~SQL.squish
        SELECT DISTINCT coverage_areas.operator_profile_id
        FROM coverage_areas
        INNER JOIN missions ON missions.id = #{ActiveRecord::Base.connection.quote(mission.id)}
        WHERE coverage_areas.active = true
          AND coverage_areas.operator_profile_id IN (#{quoted})
          AND coverage_areas.geometry IS NOT NULL
          AND missions.geometry IS NOT NULL
          AND ST_Intersects(coverage_areas.geometry, missions.geometry)
      SQL
      ActiveRecord::Base.connection.exec_query(sql).map { |r| r["operator_profile_id"] }
    rescue StandardError
      profile_ids
    end
  end
end
