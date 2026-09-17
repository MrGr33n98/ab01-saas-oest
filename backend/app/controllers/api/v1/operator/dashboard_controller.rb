# frozen_string_literal: true

module Api
  module V1
    module Operator
      class DashboardController < BaseController
        # GET /api/v1/operator/dashboard
        def show
          profile = operator_profile
          onboarding = profile.operator_onboarding_profile || Operators::OnboardingProfile.new(operator_profile: profile)
          orders = Orders::Order.where(operator_organization_id: current_organization.id)
          invites = profile.mission_invites

          render_data(
            organization: organization_payload,
            profile_completion: profile_completion(onboarding),
            onboarding_stages: onboarding_stages(onboarding),
            invites_overview: {
              active: invites.where(status: "pending").where("expires_at IS NULL OR expires_at > ?", Time.current).count,
              accepted: invites.where(status: "accepted").count
            },
            orders_overview: {
              active: orders.where(status: %w[paid in_progress]).count,
              completed: orders.where(status: "completed").count,
              pending_payment: orders.where(status: "pending_payment").count
            },
            missions_overview: {
              active: Missions::Mission.where(operator_organization_id: current_organization.id, status: %w[scheduled in_progress processing review]).count,
              completed: Missions::Mission.where(operator_organization_id: current_organization.id, status: "completed").count
            },
            recent_invites: invites.includes(:mission).inbox.limit(3).map { |invite| invite_payload(invite) },
            recent_notifications: recent_notifications
          )
        end

        private

        def operator_profile
          current_organization.operator_profile || raise(ActiveRecord::RecordNotFound)
        end

        def organization_payload
          {
            id: current_organization.id,
            name: current_organization.name,
            tenant_type: current_organization.tenant_type,
            verification_status: operator_profile.verification_status,
            accepting_jobs: operator_profile.accepting_jobs
          }
        end

        def profile_completion(onboarding)
          {
            percentage: onboarding.completion_percentage,
            complete: onboarding.ready_to_submit?,
            completed_sections: onboarding.completed_sections
          }
        end

        def onboarding_stages(onboarding)
          Operators::OnboardingProfile::SECTIONS.map do |section|
            {
              id: section,
              label: section_label(section),
              complete: onboarding.section_complete?(section),
              href: "/operator/onboarding?section=#{section}"
            }
          end
        end

        def section_label(section)
          {
            "address" => "Address & location",
            "equipment" => "Equipment & hardware",
            "business" => "Business & company",
            "experience" => "Experience & skills",
            "documents" => "Documents",
            "pricing" => "Pricing"
          }.fetch(section)
        end

        def invite_payload(invite)
          mission = invite.mission
          {
            id: invite.id,
            status: invite.expired? && invite.status == "pending" ? "expired" : invite.status,
            mission: {
              id: mission.id,
              title: mission.title,
              mission_type: mission.mission_type,
              city: mission.city,
              state_code: mission.state_code,
              deadline_at: mission.deadline_at,
              estimated_budget_min: mission.estimated_budget_min&.to_f,
              estimated_budget_max: mission.estimated_budget_max&.to_f,
              currency: mission.currency
            },
            expires_at: invite.expires_at,
            created_at: invite.created_at
          }
        end

        def recent_notifications
          Notification.where(user_id: current_user.id)
                      .where("organization_id IS NULL OR organization_id = ?", current_organization.id)
                      .recent
                      .limit(5)
                      .map do |notification|
            {
              id: notification.id,
              title: notification.title,
              body: notification.body,
              action_url: notification.action_url,
              read: notification.read?,
              created_at: notification.created_at
            }
          end
        end
      end
    end
  end
end
