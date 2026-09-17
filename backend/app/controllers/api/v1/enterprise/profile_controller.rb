# frozen_string_literal: true

module Api
  module V1
    module Enterprise
      class ProfileController < BaseController
        before_action :require_enterprise_manager!, only: :update

        # GET /api/v1/enterprise/profile
        def show
          render_data(profile_payload(profile))
        end

        # PATCH /api/v1/enterprise/profile
        def update
          ApplicationRecord.transaction do
            current_user.update!(user_attributes) if user_attributes.present?
            current_organization.update!(organization_attributes) if organization_attributes.present?
            profile.assign_attributes(profile_attributes)
            profile.save! if profile.changed?
          end

          render_data(profile_payload(profile))
        rescue ActiveRecord::RecordInvalid => e
          render_error(
            status: 422,
            code: "VALIDATION",
            title: "Invalid enterprise profile",
            detail: e.record.errors.full_messages.join(", ")
          )
        end

        private

        def profile
          @profile ||= Enterprises::Profile.find_or_initialize_by(organization_id: current_organization.id)
        end

        def user_attributes
          permitted.dig(:user)&.slice(:first_name, :last_name, :email) || {}
        end

        def organization_attributes
          permitted.dig(:organization)&.slice(
            :name, :legal_name, :tax_id, :email, :country_code, :state_code, :city
          ) || {}
        end

        def profile_attributes
          permitted.dig(:profile)&.slice(
            :industry, :phone_e164, :billing_email, :payment_currency,
            :email_notifications, :billing_address
          ) || {}
        end

        def permitted
          @permitted ||= params.permit(
            user: %i[first_name last_name email],
            organization: %i[name legal_name tax_id email country_code state_code city],
            profile: [
              :industry, :phone_e164, :billing_email, :payment_currency, :email_notifications,
              { billing_address: %i[street complement postal_code city state_code country_code] }
            ]
          ).to_h.deep_symbolize_keys
        end

        def profile_payload(record)
          {
            user: {
              id: current_user.id,
              first_name: current_user.first_name,
              last_name: current_user.last_name,
              email: current_user.email,
              user_type: current_user.user_type
            },
            organization: {
              id: current_organization.id,
              name: current_organization.name,
              legal_name: current_organization.legal_name,
              tax_id: current_organization.tax_id,
              email: current_organization.email,
              country_code: current_organization.country_code,
              state_code: current_organization.state_code,
              city: current_organization.city,
              organization_type: current_organization.organization_type
            },
            profile: {
              industry: record.industry,
              phone_e164: record.phone_e164,
              billing_email: record.billing_email,
              payment_currency: record.payment_currency || "BRL",
              billing_address: record.billing_address || {},
              email_notifications: record.email_notifications.nil? ? true : record.email_notifications
            }
          }
        end
      end
    end
  end
end
