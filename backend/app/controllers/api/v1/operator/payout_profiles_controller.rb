# frozen_string_literal: true

module Api
  module V1
    module Operator
      class PayoutProfilesController < BaseController
        before_action :require_operator_manager!, only: :update

        def show
          render_data(payout_payload(current_organization.operator_payout_profile))
        end

        def update
          result = Operators::Payouts::Upsert.new(
            organization: current_organization,
            user: current_user,
            attributes: payout_attributes
          ).call

          unless result.success?
            return render_error(status: 422, code: "VALIDATION", title: "Invalid payout profile", detail: result.errors.join(", "))
          end

          render_data(payout_payload(result.record))
        end

        private

        def require_operator_manager!
          return if current_user.platform_admin? || current_membership&.role.in?(%w[owner admin manager billing])

          render_error(status: 403, code: "FORBIDDEN", title: "Billing permission required")
        end

        def payout_attributes
          params.permit(
            :account_kind, :payout_provider, :payout_provider_reference, :paypal_email,
            billing: [
              :legal_name, :billing_email, :tax_id,
              { address: %i[street complement city state_code country_code postal_code] }
            ],
            bank_account: %i[account_holder_name account_number bank_name swift_bic]
          ).to_h
        end

        def payout_payload(profile)
          return {
            configured: false,
            account_kind: "business",
            verification_status: "unverified",
            billing: {}
          } unless profile

          {
            configured: profile.bank_account_last4.present? || profile.paypal_email.present? || profile.payout_provider_reference.present?,
            account_kind: profile.account_kind,
            billing: profile.billing_data || {},
            payout_provider: profile.payout_provider,
            payout_provider_reference: profile.payout_provider_reference,
            account_holder_name: profile.account_holder_name,
            bank_name: profile.bank_name,
            bank_account_last4: profile.bank_account_last4,
            swift_bic: profile.swift_bic,
            paypal_email: profile.paypal_email,
            verification_status: profile.verification_status,
            updated_at: profile.updated_at
          }
        end
      end
    end
  end
end
