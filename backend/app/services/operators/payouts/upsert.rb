# frozen_string_literal: true

module Operators
  module Payouts
    class Upsert
      Result = Struct.new(:record, :errors, keyword_init: true) do
        def success?
          errors.blank?
        end

        def failure?
          !success?
        end
      end

      def initialize(organization:, user:, attributes:)
        @organization = organization
        @user = user
        @attributes = attributes.to_h.deep_stringify_keys
      end

      def call
        profile = @organization.operator_payout_profile || @organization.build_operator_payout_profile
        bank_account = @attributes.fetch("bank_account", {}).to_h.deep_stringify_keys
        raw_account_number = bank_account["account_number"].to_s.gsub(/\s+/, "")

        if raw_account_number.present? && raw_account_number.length < 4
          return Result.new(record: profile, errors: ["Bank account number must contain at least four digits"])
        end

        profile.assign_attributes(
          account_kind: @attributes["account_kind"].presence || profile.account_kind || "business",
          billing_data: @attributes.fetch("billing", profile.billing_data || {}).to_h.deep_stringify_keys,
          payout_provider: @attributes["payout_provider"].presence || profile.payout_provider || "manual_review",
          payout_provider_reference: @attributes["payout_provider_reference"].presence || profile.payout_provider_reference,
          account_holder_name: bank_account["account_holder_name"].presence || profile.account_holder_name,
          bank_name: bank_account["bank_name"].presence || profile.bank_name,
          bank_account_last4: raw_account_number.last(4).presence || profile.bank_account_last4,
          swift_bic: bank_account["swift_bic"].presence || profile.swift_bic,
          paypal_email: @attributes["paypal_email"].presence || profile.paypal_email,
          updated_by: @user,
          verification_status: profile.verification_status.presence || "unverified"
        )
        profile.save!

        Result.new(record: profile, errors: [])
      rescue ActiveRecord::RecordInvalid => e
        Result.new(record: profile, errors: e.record.errors.full_messages)
      end
    end
  end
end
