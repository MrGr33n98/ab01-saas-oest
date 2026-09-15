# frozen_string_literal: true

module Api
  module V1
    class MissionAssignmentsController < BaseController
      def create
        mission = TenantScope.find!(Missions::Mission, params[:mission_id], organization: current_organization)
        authorize authorize_context, mission, :update?
        render_error(
          status: 501,
          code: "NOT_IMPLEMENTED",
          title: "Assignments API pending",
          detail: "Use quote accept flow for operator selection in MVP"
        )
      end
    end
  end
end
