# frozen_string_literal: true

module Integrations
  module Stripe
    # Stripe Connect Express — operator payouts with platform fee.
    class Connect
      Result = Struct.new(:success?, :account_id, :onboarding_url, :errors, keyword_init: true)

      def self.create_express_account(organization:, email:)
        new.create_express_account(organization: organization, email: email)
      end

      def self.account_link(account_id:, refresh_url:, return_url:)
        new.account_link(account_id: account_id, refresh_url: refresh_url, return_url: return_url)
      end

      def create_express_account(organization:, email:)
        return fail!("Stripe disabled") unless Config.enabled?

        Config.configure!
        require "stripe"

        account = ::Stripe::Account.create(
          type: "express",
          country: "BR",
          email: email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true }
          },
          business_type: "company",
          metadata: {
            organization_id: organization.id,
            organization_name: organization.name
          }
        )

        organization.update_columns(stripe_account_id: account.id) if organization.respond_to?(:stripe_account_id)

        Result.new(success?: true, account_id: account.id, onboarding_url: nil, errors: [])
      rescue ::Stripe::StripeError => e
        fail!(e.message)
      end

      def account_link(account_id:, refresh_url:, return_url:)
        return fail!("Stripe disabled") unless Config.enabled?

        Config.configure!
        require "stripe"

        link = ::Stripe::AccountLink.create(
          account: account_id,
          refresh_url: refresh_url,
          return_url: return_url,
          type: "account_onboarding"
        )
        Result.new(success?: true, account_id: account_id, onboarding_url: link.url, errors: [])
      rescue ::Stripe::StripeError => e
        fail!(e.message)
      end

      def account_status(account_id)
        return { enabled: false } unless Config.enabled? && account_id.present?

        Config.configure!
        require "stripe"
        acc = ::Stripe::Account.retrieve(account_id)
        {
          id: acc.id,
          charges_enabled: acc.charges_enabled,
          payouts_enabled: acc.payouts_enabled,
          details_submitted: acc.details_submitted
        }
      rescue ::Stripe::StripeError => e
        { error: e.message }
      end

      private

      def fail!(msg)
        Result.new(success?: false, account_id: nil, onboarding_url: nil, errors: [msg])
      end
    end
  end
end
