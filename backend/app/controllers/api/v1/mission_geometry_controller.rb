# frozen_string_literal: true

module Api
  module V1
    class MissionGeometryController < BaseController
      def create
        mission = TenantScope.find!(Missions::Mission, params[:mission_id], organization: current_organization)
        authorize mission, :update?

        geojson = geometry_params
        result = Missions::SetGeometry.call(mission: mission, geojson: geojson, user: current_user)

        if result.success?
          render_data({
            id: result.mission.id,
            area_hectares: result.mission.area_hectares,
            status: result.mission.status
          })
        else
          render_error(status: 422, code: "GEOMETRY_INVALID", title: "Invalid AOI", detail: result.errors.join(", "))
        end
      end

      alias update create

      private

      def geometry_params
        geom_param = params.require(:geometry)
        type = geom_param[:type]
        raw_coords = geom_param[:coordinates]

        unless type.is_a?(String) && type.in?(%w[Polygon MultiPolygon]) && raw_coords.is_a?(Array)
          raise ActionController::BadRequest, "Invalid GeoJSON structure"
        end

        validated_coords = validate_geojson_coordinates!(type, raw_coords)

        {
          "type" => type,
          "coordinates" => validated_coords
        }
      end

      def validate_geojson_coordinates!(type, coords)
        raise ActionController::BadRequest, "Coordinates cannot be empty" if coords.blank?

        if type == "Polygon"
          validate_polygon_coords!(coords)
        elsif type == "MultiPolygon"
          coords.map { |poly_coords| validate_polygon_coords!(poly_coords) }
        end
      end

      def validate_polygon_coords!(rings)
        unless rings.is_a?(Array) && rings.present?
          raise ActionController::BadRequest, "Polygon must contain at least one LinearRing"
        end

        rings.map do |ring|
          unless ring.is_a?(Array) && ring.size >= 4
            raise ActionController::BadRequest, "LinearRing must contain at least 4 positions"
          end

          cleaned_ring = ring.map do |pos|
            unless pos.is_a?(Array) && pos.size >= 2
              raise ActionController::BadRequest, "Position must be an array of [lng, lat]"
            end

            lng_raw, lat_raw = pos[0], pos[1]
            unless valid_number?(lng_raw) && valid_number?(lat_raw)
              raise ActionController::BadRequest, "Coordinate values must be valid finite numbers"
            end

            lng = lng_raw.to_f
            lat = lat_raw.to_f

            unless lng.between?(-180.0, 180.0) && lat.between?(-90.0, 90.0)
              raise ActionController::BadRequest, "Coordinates out of bounds: lng [-180, 180], lat [-90, 90]"
            end

            [lng, lat]
          end

          unless cleaned_ring.first == cleaned_ring.last
            raise ActionController::BadRequest, "LinearRing must be closed (first coordinate must match last)"
          end

          cleaned_ring
        end
      end

      def valid_number?(val)
        return false if val.nil? || val.is_a?(TrueClass) || val.is_a?(FalseClass)
        return false if val.is_a?(Float) && (val.nan? || val.infinite?)
        return true if val.is_a?(Numeric)
        val.is_a?(String) && val.match?(/\A-?\d+(\.\d+)?\z/)
      end
    end
  end
end
