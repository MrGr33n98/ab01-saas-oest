# frozen_string_literal: true

module Api
  module V1
    class MissionActionsController < BaseController
      def finish_capture
        mission = TenantScope.find!(Missions::Mission, params[:mission_id], organization: current_organization)
        authorize authorize_context, mission, :update?
        from = mission.status
        mission.update!(status: "processing") if mission.status == "in_progress"
        Missions::MissionStatusEvent.create!(
          mission: mission,
          actor_id: current_user.id,
          from_status: from,
          to_status: mission.status,
          reason_code: "finish_capture",
          created_at: Time.current
        ) rescue nil
        render_data({ id: mission.id, status: mission.status })
      end

      def start
        mission = TenantScope.find!(Missions::Mission, params[:mission_id], organization: current_organization)
        authorize authorize_context, mission, :update?

        order = mission.order
        if order.nil? || order.payment_status != "paid"
          return render_error(
            status: 422,
            code: "NOT_PAID",
            title: "Order must be paid",
            detail: "payment_status must be paid"
          )
        end

        from = mission.status
        mission.update!(status: "in_progress")
        Missions::MissionStatusEvent.create!(
          mission: mission,
          actor_id: current_user.id,
          from_status: from,
          to_status: "in_progress",
          reason_code: "started",
          created_at: Time.current
        )

        begin
          OrganizationMembership.where(
            organization_id: mission.organization_id,
            status: "active",
            role: %w[owner admin]
          ).find_each do |mem|
            Mail::Deliver.call(:mission_started, user: mem.user, mission: mission) if mem.user
          end
        rescue StandardError => e
          Rails.logger.warn({ event: "mission_started_mail_failed", error: e.message }.to_json)
        end

        render_data({ id: mission.id, status: mission.status })
      end
    end
  end
end
