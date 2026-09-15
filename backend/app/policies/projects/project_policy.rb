# frozen_string_literal: true

module Projects
  class ProjectPolicy < ApplicationPolicy
    def index?
      member? || platform_admin?
    end

    def show?
      platform_admin? || same_organization?
    end

    def create?
      role_in?(:owner, :admin, :manager, :procurement) || platform_admin?
    end

    def update?
      (same_organization? && role_in?(:owner, :admin, :manager, :procurement)) || platform_admin?
    end

    def archive?
      update?
    end

    class Scope < ApplicationPolicy::Scope
      def resolve
        return scope.all if user&.platform_admin?
        return scope.none unless organization

        scope.where(organization_id: organization.id)
      end
    end
  end
end
