# frozen_string_literal: true

module Api
  module V1
    class MissionGeometryController < BaseController
      def create
        mission = TenantScope.find!(Missions::Mission, params[:mission_id], organization: current_organization)
        authorize authorize_context, mission, :update?

        geojson = params.require(:geometry).permit!.to_h
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
    end
  end
end
