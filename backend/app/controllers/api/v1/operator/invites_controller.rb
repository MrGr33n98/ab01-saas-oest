# frozen_string_literal: true

module Api
  module V1
    module Operator
      class InvitesController < BaseController
        # GET /api/v1/operator/invites
        def index
          invites = operator_profile.mission_invites.includes(:mission).inbox
          invites = invites.where(status: params[:status]) if params[:status].in?(Operators::MissionInvite::STATUSES)

          render_data(invites.limit(params.fetch(:limit, 50).to_i.clamp(1, 100)).map { |invite| invite_payload(invite) })
        end

        # POST /api/v1/operator/invites/:id/accept
        def accept
          respond_with("accepted")
        end

        # POST /api/v1/operator/invites/:id/decline
        def decline
          respond_with("declined")
        end

        private

        def operator_profile
          @operator_profile ||= current_organization.operator_profile || raise(ActiveRecord::RecordNotFound)
        end

        def invite
          @invite ||= operator_profile.mission_invites.find(params[:id])
        end

        def respond_with(response)
          result = Operators::Invites::Respond.new(invite: invite, actor: current_user, response: response).call
          unless result.success?
            return render_error(status: 422, code: "INVALID_INVITE_TRANSITION", title: "Invite cannot be updated", detail: result.errors.join(", "))
          end

          render_data(invite_payload(result.invite))
        end

        def invite_payload(invite)
          mission = invite.mission
          {
            id: invite.id,
            status: invite.expired? && invite.status == "pending" ? "expired" : invite.status,
            message: invite.message,
            expires_at: invite.expires_at,
            created_at: invite.created_at,
            responded_at: invite.responded_at,
            mission: {
              id: mission.id,
              title: mission.title,
              mission_type: mission.mission_type,
              country_code: mission.country_code,
              state_code: mission.state_code,
              city: mission.city,
              area_hectares: mission.area_hectares,
              deadline_at: mission.deadline_at,
              estimated_budget_min: mission.estimated_budget_min&.to_f,
              estimated_budget_max: mission.estimated_budget_max&.to_f,
              currency: mission.currency
            }
          }
        end
      end
    end
  end
end
