# frozen_string_literal: true

module Api
  module V1
    module Billing
      class UsageController < BaseController
        def show
          render_data({
            organization_id: current_organization.id,
            missions_count: Missions::Mission.where(organization_id: current_organization.id).count,
            period: Time.current.strftime("%Y-%m")
          })
        end
      end
    end
  end
end
