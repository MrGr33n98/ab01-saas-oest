# frozen_string_literal: true

module Api
  module V1
    module Billing
      class PortalController < BaseController
        def create
          unless Integrations::Stripe::Config.enabled?
            return render_data({ provider: "manual", message: "Stripe portal unavailable" })
          end
          render_data({
            provider: "stripe",
            message: "Create Stripe Customer Portal session when customer_id is stored on organization",
            url: nil
          })
        end
      end
    end
  end
end
