# frozen_string_literal: true

module Api
  module V1
    module Operator
      # GET /api/v1/operator/proposals
      # Returns quotes submitted by this operator, across all missions.
      class ProposalsController < BaseController
        def index
          skip_authorization
          profile = Operators::OperatorProfile.find_by(organization_id: current_organization.id)
          unless profile
            return render_data([], meta: { message: "No operator profile" })
          end

          quotes = Quotes::Quote
            .where(operator_organization_id: current_organization.id)
            .order(created_at: :desc)
            .limit(params.fetch(:limit, 50).to_i.clamp(1, 100))

          render_data(quotes.map { |q| serialize(q) })
        end

        private

        def serialize(q)
          {
            id: q.id,
            mission_id: q.mission_id,
            status: q.status,
            total: q.total&.to_f,
            currency: q.currency,
            proposal_text: q.proposal_text,
            submitted_at: q.submitted_at,
            estimated_delivery_at: q.estimated_delivery_at,
            lock_version: q.try(:lock_version)
          }
        end
      end
    end
  end
end
