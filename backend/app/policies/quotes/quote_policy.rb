# frozen_string_literal: true

module Quotes
  class QuotePolicy < ApplicationPolicy
    def index?
      member? || platform_admin?
    end

    def show?
      platform_admin? || customer_side? || operator_side?
    end

    def create?
      (role_in?(:owner, :admin, :operator_manager) && operator_side_context?) || platform_admin?
    end

    def submit?
      create? && record.status == "draft"
    end

    def accept?
      (customer_side? && role_in?(:owner, :admin, :procurement, :manager)) || platform_admin?
    end

    def reject?
      accept?
    end

    def withdraw?
      (operator_side? && role_in?(:owner, :admin, :operator_manager)) || platform_admin?
    end

    private

    def customer_side?
      organization && record.customer_organization_id == organization.id
    end

    def operator_side?
      organization && record.operator_organization_id == organization.id
    end

    def operator_side_context?
      organization&.operator? || organization&.operator_profile.present?
    end

    class Scope < ApplicationPolicy::Scope
      def resolve
        return scope.all if user&.platform_admin?
        return scope.none unless organization
        scope.where(
          "customer_organization_id = :oid OR operator_organization_id = :oid",
          oid: organization.id
        )
      end
    end
  end
end
