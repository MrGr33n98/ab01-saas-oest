# frozen_string_literal: true

module Missions
  class SetGeometry
    Result = Struct.new(:success?, :mission, :errors, keyword_init: true)

    def self.call(mission:, geojson:, user:)
      new(mission: mission, geojson: geojson, user: user).call
    end

    def initialize(mission:, geojson:, user:)
      @mission = mission
      @geojson = geojson
      @user = user
    end

    def call
      unless mission.status.in?(%w[draft planning])
        return Result.new(success?: false, mission: mission, errors: ["AOI can only be set on draft/planning missions"])
      end

      calc = Missions::CalculateGeometry.call(geojson: geojson)
      unless calc.success?
        return Result.new(success?: false, mission: mission, errors: calc.errors)
      end

      mission.area_hectares = calc.area_hectares
      # Store via PostGIS cast when column is geography
      if mission.respond_to?(:geometry=)
        mission[:geometry] = calc.geometry_wkt if mission.has_attribute?(:geometry)
      end
      mission.save!

      # Prefer raw SQL update for geography when AR adapter available
      begin
        ActiveRecord::Base.connection.execute(<<~SQL.squish)
          UPDATE missions
          SET geometry = ST_GeogFromText(#{ActiveRecord::Base.connection.quote(calc.geometry_wkt)}),
              area_hectares = #{calc.area_hectares},
              updated_at = NOW()
          WHERE id = #{ActiveRecord::Base.connection.quote(mission.id)}
        SQL
        mission.reload
      rescue StandardError
        # keep AR attributes
      end

      Result.new(success?: true, mission: mission, errors: [])
    rescue ActiveRecord::RecordInvalid => e
      Result.new(success?: false, mission: mission, errors: e.record.errors.full_messages)
    end

    private

    attr_reader :mission, :geojson, :user
  end
end
