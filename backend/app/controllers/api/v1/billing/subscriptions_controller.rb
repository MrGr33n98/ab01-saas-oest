# frozen_string_literal: true

module Api
  module V1
    module Billing
      class SubscriptionsController < BaseController
        def show
          sub = ::Billing::Subscription.where(organization_id: current_organization.id, status: %w[active trialing])
                                       .order(created_at: :desc).first
          plan = sub&.plan || ::Billing::Plan.find_by(slug: "free")
          render_data({
            subscription_id: sub&.id,
            status: sub&.status || "none",
            plan: plan && { id: plan.id, slug: plan.slug, name: plan.name },
            features: Entitlements::Resolver.snapshot(current_organization)
          })
        end
      end
    end
  end
end
