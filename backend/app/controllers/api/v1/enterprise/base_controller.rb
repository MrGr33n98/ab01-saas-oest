# frozen_string_literal: true

module Api
  module V1
    module Enterprise
      class BaseController < Api::V1::BaseController
        before_action -> { require_tenant_context!("enterprise") }

        private

        def require_enterprise_manager!
          return if current_user.platform_admin? || current_membership&.owner_or_admin?

          render_error(
            status: 403,
            code: "ENTERPRISE_MANAGER_REQUIRED",
            title: "An enterprise owner or admin is required"
          )
        end
      end
    end
  end
end
