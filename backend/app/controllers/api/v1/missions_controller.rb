# frozen_string_literal: true

module Api
  module V1
    class MissionsController < BaseController
      def index
        authorize authorize_context, Missions::Mission
        scope = policy_scope(authorize_context, Missions::Mission)
        missions = scope.order(updated_at: :desc).limit(params.fetch(:limit, 25).to_i.clamp(1, 100))
        render_data(missions.map { |m| serialize_summary(m) })
      end

      def show
        mission = find_mission
        authorize authorize_context, mission
        payload = Missions::WorkspaceQuery.call(mission: mission, organization: current_organization)
        render_data(payload)
      end

      def create
        authorize authorize_context, Missions::Mission
        project = TenantScope.find!(Projects::Project, params.require(:project_id), organization: current_organization)

        result = Missions::Create.call(
          organization: current_organization,
          user: current_user,
          project: project,
          attributes: mission_params
        )

        if result.success?
          render_data(serialize_summary(result.mission), status: :created)
        else
          render_error(
            status: 422,
            code: "MISSION_INVALID",
            title: "Validation error",
            errors: result.errors.map { |e| { message: e } }
          )
        end
      end

      def publish
        mission = find_mission
        authorize authorize_context, mission, :publish?

        result = Missions::Publish.call(
          mission: mission,
          user: current_user,
          idempotency_key: request.headers["Idempotency-Key"]
        )

        if result.success?
          render_data({
            id: result.mission.id,
            status: result.mission.status,
            published_at: result.mission.published_at,
            matching_job_status: "queued"
          })
        else
          render_error(
            status: 422,
            code: "MISSION_INVALID",
            title: "Cannot publish mission",
            detail: result.errors.join(", ")
          )
        end
      end

      private

      def find_mission
        TenantScope.find_mission!(params[:id], organization: current_organization)
      end

      def mission_params
        params.permit(
          :title, :description, :mission_type, :priority,
          :preferred_start_at, :deadline_at,
          budget: %i[min max currency]
        ).to_h.deep_symbolize_keys
      end

      def serialize_summary(mission)
        {
          id: mission.id,
          title: mission.title,
          status: mission.status,
          mission_type: mission.mission_type,
          area_hectares: mission.area_hectares,
          deadline_at: mission.deadline_at,
          published_at: mission.published_at,
          version: mission.lock_version
        }
      end

      def serialize_workspace(mission)
        serialize_summary(mission).merge(
          description: mission.description,
          project_id: mission.project_id,
          geometry: mission.geometry,
          products: mission.mission_products.map { |p|
            { data_product_id: p.data_product_id, quantity: p.quantity }
          }
        )
      end
    end
  end
end
