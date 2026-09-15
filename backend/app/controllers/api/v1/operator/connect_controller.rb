# frozen_string_literal: true

module Api
  module V1
    module Operator
      class ConnectController < BaseController
        # GET /api/v1/operator/connect
        def show
          org = current_organization
          account_id = org.try(:stripe_account_id)
          status = Integrations::Stripe::Connect.new.account_status(account_id)
          render json: {
            data: {
              stripe_enabled: Integrations::Stripe::Config.enabled?,
              account_id: account_id,
              status: status,
              platform_fee_bps: Integrations::Stripe::Config.platform_fee_bps
            }
          }
        end

        # POST /api/v1/operator/connect — create Express account + onboarding link
        def create
          org = current_organization
          unless Integrations::Stripe::Config.enabled?
            return render json: {
              data: { provider: "manual", message: "Stripe Connect offline — payouts manuais" }
            }
          end

          account_id = org.try(:stripe_account_id)
          if account_id.blank?
            result = Integrations::Stripe::Connect.create_express_account(
              organization: org,
              email: current_user.email
            )
            return render json: { title: "Connect error", detail: result.errors.join(", "), status: 422 }, status: 422 unless result.success?

            account_id = result.account_id
            org.update_column(:stripe_account_id, account_id) if org.has_attribute?(:stripe_account_id)
          end

          base = ENV.fetch("APP_URL", "http://localhost:3000")
          link = Integrations::Stripe::Connect.account_link(
            account_id: account_id,
            refresh_url: "#{base}/operator/payments?connect=refresh",
            return_url: "#{base}/operator/payments?connect=return"
          )
          unless link.success?
            return render json: { title: "Connect error", detail: link.errors.join(", "), status: 422 }, status: 422
          end

          render json: {
            data: {
              account_id: account_id,
              onboarding_url: link.onboarding_url
            }
          }
        end
      end
    end
  end
end
