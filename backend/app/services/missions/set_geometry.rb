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

      Missions::Mission.transaction do
        mission.area_hectares = calc.area_hectares
        mission.geometry = geojson if mission.respond_to?(:geometry=)

        if calc.centroid_wkt.present? && mission.respond_to?(:centroid=)
          mission.centroid = { "wkt" => calc.centroid_wkt }
        end

        mission.save!
      end

      Result.new(success?: true, mission: mission, errors: [])
    rescue ActiveRecord::RecordInvalid => e
      mission.reload rescue nil
      Result.new(success?: false, mission: mission, errors: e.record.errors.full_messages)
    rescue StandardError => e
      mission.reload rescue nil
      Result.new(success?: false, mission: mission, errors: [e.message])
    end

    private

    attr_reader :mission, :geojson, :user
  end
end
