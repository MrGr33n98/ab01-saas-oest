# frozen_string_literal: true

module Api
  module V1
    module Operator
      class EntitlementsController < BaseController
        # GET /api/v1/operator/entitlements
        def show
          snap = Entitlements::Resolver.snapshot(current_organization)
          render json: {
            data: {
              features: snap.except("plan", "plan_name"),
              plan: snap["plan"],
              plan_name: snap["plan_name"]
            }
          }
        end
      end
    end
  end
end
