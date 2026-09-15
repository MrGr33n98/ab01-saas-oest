# frozen_string_literal: true

module Orders
  class OrderPolicy < ApplicationPolicy
    def index?
      member? || platform_admin?
    end

    def show?
      platform_admin? || customer_side? || operator_side?
    end

    def cancel?
      (customer_side? && role_in?(:owner, :admin, :procurement)) || platform_admin?
    end

    def confirm_payment?
      platform_admin? || (customer_side? && role_in?(:owner, :admin, :billing, :procurement))
    end

    def complete?
      platform_admin? || (operator_side? && role_in?(:owner, :admin, :operator_manager))
    end

    private

    def customer_side?
      organization && record.customer_organization_id == organization.id
    end

    def operator_side?
      organization && record.operator_organization_id == organization.id
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
