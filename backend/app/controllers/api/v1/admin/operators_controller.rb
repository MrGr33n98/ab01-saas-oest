# frozen_string_literal: true

module Api
  module V1
    module Admin
      class OperatorsController < BaseController
        include AdminAuthorization
        before_action :require_platform_admin!

        def index
          profiles = Operators::OperatorProfile.order(created_at: :desc).limit(100)
          render_data(profiles.map { |p|
            {
              id: p.id,
              slug: p.slug,
              headline: p.headline,
              verification_status: p.verification_status,
              accepting_jobs: p.accepting_jobs,
              organization_id: p.organization_id
            }
          })
        end

        def show
          profile = Operators::OperatorProfile.find(params[:id])
          org = profile.organization
          drones = org ? Operators::Drone.where(organization_id: org.id) : []
          pilots = org ? Operators::Pilot.where(organization_id: org.id) : []

          render_data({
            id: profile.id,
            slug: profile.slug,
            headline: profile.headline,
            about: profile.about,
            verification_status: profile.verification_status,
            accepting_jobs: profile.accepting_jobs,
            rating_average: profile.rating_average&.to_f,
            missions_completed: profile.missions_completed,
            created_at: profile.created_at,
            organization: org ? {
              id: org.id,
              name: org.name,
              legal_name: org.legal_name,
              tax_id: org.tax_id,
              email: org.email,
              city: org.city,
              state_code: org.state_code,
              verified: org.verified
            } : nil,
            drones: drones.map { |d| { id: d.id, manufacturer: d.manufacturer, model: d.model, status: d.status } },
            pilots: pilots.map { |p| { id: p.id, name: p.name, anac_license: p.try(:anac_license), status: p.status } }
          })
        end

        def verify
          profile = Operators::OperatorProfile.find(params[:id])
          profile.update!(verification_status: "verified")
          AuditLog.create!(
            actor_id: current_user.id,
            action: "operator.verified",
            auditable_type: "OperatorProfile",
            auditable_id: profile.id,
            created_at: Time.current
          )
          begin
            OrganizationMembership.where(organization_id: profile.organization_id, status: "active", role: %w[owner admin]).find_each do |m|
              Mail::Deliver.call(:operator_verified, user: m.user, operator_profile: profile) if m.user
            end
          rescue StandardError => e
            Rails.logger.warn({ event: "operator_verified_mail_failed", error: e.message }.to_json)
          end
          admin_audit!(action: "operator.verified", auditable: profile, after: { verification_status: "verified" }) if respond_to?(:admin_audit!, true)
          render_data({ id: profile.id, verification_status: profile.verification_status })
        end

        def reject
          profile = Operators::OperatorProfile.find(params[:id])
          reason = params[:reason].presence || "Rejeitado pela administração"
          profile.update!(verification_status: "rejected", accepting_jobs: false)
          AuditLog.create!(
            actor_id: current_user.id,
            action: "operator.rejected",
            auditable_type: "OperatorProfile",
            auditable_id: profile.id,
            after_data: { reason: reason },
            created_at: Time.current
          )
          admin_audit!(action: "operator.rejected", auditable: profile, after: { verification_status: "rejected", reason: reason }) if respond_to?(:admin_audit!, true)
          render_data({ id: profile.id, verification_status: profile.verification_status, reason: reason })
        end

        private
        # require_platform_admin! from AdminAuthorization
      end
    end
  end
end
