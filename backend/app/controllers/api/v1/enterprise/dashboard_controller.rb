# frozen_string_literal: true

module Api
  module V1
    module Enterprise
      class DashboardController < BaseController
        # GET /api/v1/enterprise/dashboard
        def show
          orders = Orders::Order.where(customer_organization_id: current_organization.id)
          missions = Missions::Mission.where(organization_id: current_organization.id)
          profile = Enterprises::Profile.find_by(organization_id: current_organization.id)

          render_data({
            organization: organization_payload,
            profile_completion: profile_completion(profile),
            total_orders: orders.count,
            orders_overview: {
              unconfirmed: orders.where(status: "pending_payment").count,
              confirmed: orders.where(status: "paid").count,
              active: orders.where(status: "in_progress").count,
              completed: orders.where(status: "completed").count
            },
            missions_overview: {
              unconfirmed: missions.where(status: %w[draft planning]).count,
              confirmed: missions.where(status: %w[published quoting operator_selected scheduled]).count,
              active: missions.where(status: %w[in_progress processing review]).count,
              completed: missions.where(status: "completed").count
            },
            recent_notifications: recent_notifications
          })
        end

        private

        def organization_payload
          {
            id: current_organization.id,
            name: current_organization.name,
            organization_type: current_organization.organization_type,
            tenant_type: current_organization.tenant_type
          }
        end

        def profile_completion(profile)
          fields = {
            personal_details: current_user.first_name.present? && current_user.email.present?,
            contact_location: current_organization.country_code.present? && current_organization.city.present?,
            billing: profile&.billing_email.present? && current_organization.tax_id.present?
          }
          complete = fields.count { |_key, value| value }

          {
            percentage: (complete.fdiv(fields.size) * 100).round,
            complete: complete == fields.size,
            fields: fields
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
