# frozen_string_literal: true

module Entitlements
  # Resolves whether an organization may use a paid feature.
  # Order: org override → active subscription plan matrix → default deny (except free-tier keys).
  class Resolver
    FREE_DEFAULTS = %w[].freeze # nothing premium is free by default

    def self.enabled?(organization, feature_key)
      new(organization).enabled?(feature_key)
    end

    def self.snapshot(organization)
      new(organization).snapshot
    end

    def initialize(organization)
      @organization = organization
    end

    def enabled?(feature_key)
      key = feature_key.to_s
      override = OrganizationEntitlement.find_by(organization_id: organization.id, feature_key: key)
      if override
        return false if override.expires_at.present? && override.expires_at < Time.current
        return override.enabled
      end

      plan = current_plan
      return FREE_DEFAULTS.include?(key) unless plan

      pf = PlanFeature.joins(:feature_definition)
                      .where(plan_id: plan.id, enabled: true)
                      .where(feature_definitions: { key: key, active: true })
                      .exists?
      return true if pf

      # Fallback: plan.features_json hash
      if plan.respond_to?(:features_json) && plan.features_json.is_a?(Hash)
        return plan.features_json[key] == true || plan.features_json[key] == "true"
      end

      false
    rescue StandardError => e
      Rails.logger.warn({ event: "entitlement_resolve_error", error: e.message, key: key }.to_json)
      false
    end

    def snapshot
      Catalog.keys.index_with { |k| enabled?(k) }.merge(
        "plan" => current_plan&.slug,
        "plan_name" => current_plan&.name
      )
    end

    def current_plan
      sub = Billing::Subscription
            .where(organization_id: organization.id, status: %w[active trialing])
            .order(created_at: :desc)
            .first
      sub&.plan || Billing::Plan.find_by(slug: "free", active: true)
    end

    private

    attr_reader :organization
  end
end
