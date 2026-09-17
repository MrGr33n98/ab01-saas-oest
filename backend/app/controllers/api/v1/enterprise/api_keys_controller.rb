# frozen_string_literal: true

module Api
  module V1
    module Enterprise
      class ApiKeysController < BaseController
        before_action :require_enterprise_manager!
        before_action :set_api_key, only: %i[activate revoke cancel]

        # GET /api/v1/enterprise/api_keys
        def index
          render_data(current_organization.enterprise_api_keys.recent_first.map { |key| serialize(key) })
        end

        # POST /api/v1/enterprise/api_keys
        # This intentionally creates a request rather than an immediately usable
        # credential. A platform admin must approve it before activation.
        def create
          key = current_organization.enterprise_api_keys.create!(
            name: params.require(:name),
            scopes: Array(params[:scopes]).map(&:to_s),
            expires_at: params[:expires_at],
            requested_by: current_user,
            requested_at: Time.current,
            status: "requested"
          )
          audit!("enterprise_api_key.requested", key)
          render_data(serialize(key), status: :accepted)
        rescue ActiveRecord::RecordInvalid => e
          render_error(status: 422, code: "VALIDATION", title: "Invalid API key request", detail: e.record.errors.full_messages.join(", "))
        end

        # POST /api/v1/enterprise/api_keys/:id/activate
        # Returns `secret` exactly once. It is never serialised by index/show.
        def activate
          unless @api_key.approved?
            return render_error(status: 409, code: "API_KEY_NOT_APPROVED", title: "The API key request is not approved")
          end

          secret = @api_key.activate!
          audit!("enterprise_api_key.activated", @api_key)
          render_data(serialize(@api_key).merge(secret: secret), status: :created)
        end

        # POST /api/v1/enterprise/api_keys/:id/revoke
        def revoke
          @api_key.revoke! unless @api_key.status.in?(%w[revoked cancelled])
          audit!("enterprise_api_key.revoked", @api_key)
          render_data(serialize(@api_key))
        end

        # POST /api/v1/enterprise/api_keys/:id/cancel
        def cancel
          unless @api_key.status == "requested"
            return render_error(status: 409, code: "API_KEY_CANNOT_CANCEL", title: "Only requested API keys can be cancelled")
          end

          @api_key.cancel!
          audit!("enterprise_api_key.cancelled", @api_key)
          render_data(serialize(@api_key))
        end

        private

        def set_api_key
          @api_key = current_organization.enterprise_api_keys.find(params[:id])
        end

        def serialize(key)
          {
            id: key.id,
            name: key.name,
            prefix: key.prefix,
            scopes: key.scopes,
            status: key.status,
            requested_at: key.requested_at,
            approved_at: key.approved_at,
            activated_at: key.activated_at,
            last_used_at: key.last_used_at,
            expires_at: key.expires_at
          }
        end

        def audit!(action, key)
          AuditLog.create!(
            organization_id: current_organization.id,
            actor_id: current_user.id,
            action: action,
            auditable_type: key.class.name,
            auditable_id: key.id,
            after_data: { status: key.status, scopes: key.scopes }
          )
        end
      end
    end
  end
end
