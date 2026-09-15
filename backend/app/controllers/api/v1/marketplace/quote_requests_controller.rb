# frozen_string_literal: true

module Api
  module V1
    module Marketplace
      class QuoteRequestsController < ActionController::API
        # POST /api/v1/marketplace/profiles/:slug/quote_requests
        def create
          profile = Operators::OperatorProfile.find_by!(slug: params[:slug])
          org = profile.organization

          unless profile.quote_request_enabled && Entitlements::Resolver.enabled?(org, "profile.quote_request")
            return render json: {
              title: "Unavailable",
              detail: "Solicitar orçamento não está ativo neste perfil",
              status: 403,
              code: "FEATURE_DISABLED"
            }, status: 403
          end

          qr = QuoteRequest.create!(
            operator_profile: profile,
            contact_name: params[:contact_name],
            contact_email: params.require(:contact_email),
            contact_phone: params[:contact_phone],
            message: params[:message],
            category_slug: params[:category_slug],
            status: "new"
          )

          # Notify operator owners
          begin
            OrganizationMembership.where(organization_id: org.id, status: "active", role: %w[owner admin]).find_each do |m|
              # reuse quote_received-style log; dedicated mail optional
              Rails.logger.info({ event: "quote_request.created", id: qr.id, operator: profile.slug }.to_json)
            end
          rescue StandardError
          end

          render json: { data: { id: qr.id, status: qr.status } }, status: :created
        rescue ActiveRecord::RecordInvalid => e
          render json: { title: "Validation", detail: e.record.errors.full_messages.join(", "), status: 422 }, status: 422
        end
      end
    end
  end
end
