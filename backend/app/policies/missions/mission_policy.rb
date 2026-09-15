# frozen_string_literal: true

module Missions
  class MissionPolicy < ApplicationPolicy
    def index?
      member? || platform_admin?
    end

    def show?
      platform_admin? || same_organization? || public_marketplace_visible?
    end

    def create?
      role_in?(:owner, :admin, :manager, :procurement) || platform_admin?
    end

    def update?
      return true if platform_admin?
      return false unless same_organization?

      role_in?(:owner, :admin, :manager, :procurement) && record.status.in?(%w[draft planning])
    end

    def publish?
      return true if platform_admin?
      return false unless same_organization?

      role_in?(:owner, :admin, :manager, :procurement) && record.publishable?
    end

    def cancel?
      return true if platform_admin?
      return false unless same_organization?

      role_in?(:owner, :admin, :manager, :procurement) && !record.terminal?
    end

    def approve_deliverable?
      return true if platform_admin?
      return false unless same_organization?

      role_in?(:owner, :admin, :manager, :procurement)
    end

    class Scope < ApplicationPolicy::Scope
      def resolve
        if user&.platform_admin?
          scope.all
        elsif organization
          scope.where(organization_id: organization.id)
        else
          scope.none
        end
      end
    end

    private

    def public_marketplace_visible?
      record.status.in?(%w[published quoting]) && record.visibility == "marketplace"
    end
  end
end
