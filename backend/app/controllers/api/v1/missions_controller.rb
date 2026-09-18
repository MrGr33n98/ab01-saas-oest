# frozen_string_literal: true

module Api
  module V1
    class MissionsController < BaseController
      def index
        authorize Missions::Mission
        scope = policy_scope(Missions::Mission)
        missions = scope.order(updated_at: :desc).limit(params.fetch(:limit, 25).to_i.clamp(1, 100))
        render_data(missions.map { |m| serialize_summary(m) })
      end

      def show
        mission = find_mission
        authorize mission
        render_data(serialize_workspace(mission))
      end

      def create
        authorize Missions::Mission
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
        authorize mission, :publish?

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

      def candidates
        mission = find_mission
        authorize mission, :show?
        candidates = Matching::BuildCandidateSet.call(mission: mission)
        render_data(candidates)
      end
      alias_method :matches, :candidates

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
          area_hectares: mission.area_hectares&.to_f,
          deadline_at: mission.deadline_at,
          published_at: mission.published_at,
          version: mission.lock_version || 0
        }
      end

      def serialize_workspace(mission)
        order = mission.order
        operator = order&.operator_profile
        serialize_summary(mission).merge(
          description: mission.description,
          priority: mission.priority,
          preferred_start_at: mission.preferred_start_at,
          completed_at: mission.completed_at,
          currency: mission.currency,
          estimated_budget_min: mission.estimated_budget_min&.to_f,
          estimated_budget_max: mission.estimated_budget_max&.to_f,
          project_id: mission.project_id,
          geometry: mission.geometry,
          products: mission.mission_products.map { |p|
            {
              data_product_id: p.data_product_id,
              quantity: p.quantity&.to_f || 1.0,
              name: p.data_product&.name || "Product",
              slug: p.data_product&.slug || "product"
            }
          },
          quotes_summary: {
            open_count: mission.quotes.where(status: %w[submitted updated]).count
          },
          order: order && {
            id: order.id,
            status: order.status,
            payment_status: order.payment_status,
            total: order.total&.to_f || 0.0,
            currency: order.currency
          },
          operator: operator && {
            slug: operator.slug,
            name: operator.company_name,
            verified: operator.verified?,
            headline: operator.headline
          },
          deliverables: mission.deliverables.map { |d|
            {
              id: d.id,
              title: d.title,
              status: d.status,
              version: d.version || 0,
              data_product_id: d.data_product_id,
              file_format: d.file_format,
              download_ready: d.respond_to?(:download_ready?) ? d.download_ready? : true
            }
          }
        )
      end
    end
  end
end
