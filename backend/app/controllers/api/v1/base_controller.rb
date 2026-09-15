# frozen_string_literal: true

module Api
  module V1
    class BaseController < ActionController::API
      include Pundit::Authorization

      before_action :authenticate_user!
      before_action :set_request_id
      before_action :resolve_organization!

      rescue_from Pundit::NotAuthorizedError, with: :forbidden
      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActionController::ParameterMissing, with: :bad_request

      attr_reader :current_organization, :current_membership

      private

      def authenticate_user!
        auth = request.headers["Authorization"].to_s
        token = auth.split(" ").last
        @current_user = decode_access_user(token) if token.present?

        if @current_user.nil? &&
           !Rails.env.production? &&
           ENV["ALLOW_DEV_AUTH"] == "true" &&
           request.headers["X-User-Id"].present?
          @current_user = User.find_by(id: request.headers["X-User-Id"])
        end

        render_error(status: 401, code: "UNAUTHENTICATED", title: "Unauthenticated") unless @current_user
      end

      def jwt_secret
        secret = ENV["JWT_SECRET"].presence
        if Rails.env.production?
          raise "JWT_SECRET must be set in production" if secret.blank? || secret.include?("change-me")
        end
        secret || "dronehub-mvp-dev-secret-change-me"
      end

      def decode_access_user(token)
        body, sig = token.to_s.split(".", 2)
        return nil unless body && sig
        expected = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", jwt_secret, body))
        return nil unless ActiveSupport::SecurityUtils.secure_compare(expected, sig)
        payload = JSON.parse(Base64.urlsafe_decode64(body))
        return nil if payload["exp"] && payload["exp"] < Time.current.to_i
        return nil unless payload["type"] == "access"
        User.find_by(id: payload["sub"], jti: payload["jti"])
      rescue StandardError
        nil
      end

      def current_user
        @current_user
      end

      def resolve_organization!
        org_id = request.headers["X-Organization-Id"]
        return render_error(status: 400, code: "ORG_REQUIRED", title: "Organization required") if org_id.blank?

        @current_organization = Organization.find_by(id: org_id)
        return render_error(status: 404, code: "ORG_NOT_FOUND", title: "Organization not found") unless @current_organization

        @current_membership = OrganizationMembership.active.find_by(
          organization_id: @current_organization.id,
          user_id: current_user.id
        )

        unless @current_membership || current_user.platform_admin?
          render_error(status: 403, code: "NOT_A_MEMBER", title: "Not a member of this organization")
        end
      end

      def authorize_context
        OpenStruct.new(
          user: current_user,
          organization: current_organization,
          membership: current_membership
        )
      end

      def pundit_user
        authorize_context
      end

      def set_request_id
        @request_id = request.headers["X-Request-Id"].presence || SecureRandom.uuid
        response.set_header("X-Request-Id", @request_id)
      end

      def render_data(data, status: :ok, meta: {})
        render json: { data: data, meta: meta.merge(request_id: @request_id) }, status: status
      end

      def render_error(status:, code:, title:, detail: nil, errors: nil)
        body = {
          type: "https://api.dronehub.example/problems/#{code.downcase.tr('_', '-')}",
          title: title,
          status: status,
          code: code,
          detail: detail,
          request_id: @request_id
        }
        body[:errors] = errors if errors
        render json: body, status: status
      end

      def forbidden
        render_error(status: 403, code: "FORBIDDEN", title: "Forbidden")
      end

      def not_found
        render_error(status: 404, code: "NOT_FOUND", title: "Not found")
      end

      def bad_request(exception)
        render_error(status: 400, code: "BAD_REQUEST", title: "Bad request", detail: exception.message)
      end
    end
  end
end
