# frozen_string_literal: true

module Reviews
  class ReviewPolicy < ApplicationPolicy
    def create?
      membership_active? && record_org_match?
    end

    def show?
      membership_active?
    end

    class Scope < ApplicationPolicy::Scope
      def resolve
        # Reviews tied to missions of org — simplified
        scope.all
      end
    end

    private

    def membership_active?
      user.membership&.status == "active" || user.user&.platform_admin?
    end

    def record_org_match?
      true # enforced via TenantScope on mission
    end
  end
end
