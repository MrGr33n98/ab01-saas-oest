# frozen_string_literal: true

module Api
  module V1
    class QuotesController < BaseController
      def index
        skip_authorization
        mission = TenantScope.find!(Missions::Mission, params[:mission_id], organization: current_organization)
        quotes = Quotes::Quote.for_mission(mission.id).order(created_at: :desc)
        render_data(quotes.map { |q| serialize(q) })
      end

      def show
        quote = TenantScope.find_quote!(params[:id], organization: current_organization)
        authorize authorize_context, quote
        render_data(serialize(quote))
      end

      def create
        mission = find_mission_for_quote!(params[:mission_id])
        authorize authorize_context, Quotes::Quote.new(
          customer_organization_id: mission.organization_id,
          operator_organization_id: current_organization.id
        ), :create?

        quote = Quotes::Quote.create!(
          mission: mission,
          customer_organization_id: mission.organization_id,
          operator_organization_id: current_organization.id,
          operator_profile: current_organization.operator_profile,
          submitted_by: current_user,
          status: "draft",
          proposal_text: params[:proposal_text],
          currency: params[:currency] || "BRL"
        )
        render_data(serialize(quote), status: :created)
      end

      def accept
        quote = TenantScope.find_quote!(params[:id], organization: current_organization)
        authorize authorize_context, quote, :accept?

        result = Quotes::Accept.call(
          quote: quote,
          user: current_user,
          expected_lock_version: params[:lock_version]&.to_i,
          idempotency_key: request.headers["Idempotency-Key"]
        )

        if result.success?
          render_data({ quote_id: result.quote.id, order_id: result.order.id, status: "accepted" })
        else
          render_error(status: 422, code: "ACCEPT_FAILED", title: "Cannot accept", detail: result.errors.join(", "))
        end
      end

      def comparison
        skip_authorization
        mission = TenantScope.find!(Missions::Mission, params[:mission_id], organization: current_organization)
        data = Quotes::ComparisonQuery.call(mission: mission, organization: current_organization)
        render_data(data)
      end

      private

      def find_mission_for_quote!(id)
        m = Missions::Mission.find(id)
        return m if m.organization_id == current_organization.id
        if m.status.to_s.in?(%w[published quoting]) &&
           current_organization.organization_type.to_s.in?(%w[drone_operator operator])
          return m
        end
        raise ActiveRecord::RecordNotFound
      end

      def serialize(q)
        {
          id: q.id,
          mission_id: q.mission_id,
          status: q.status,
          total: q.total,
          currency: q.currency,
          operator_organization_id: q.operator_organization_id,
          customer_organization_id: q.customer_organization_id,
          proposal_text: q.proposal_text,
          lock_version: q.try(:lock_version)
        }
      end
    end
  end
end
