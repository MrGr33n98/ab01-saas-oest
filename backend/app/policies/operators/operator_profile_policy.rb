# frozen_string_literal: true

module Operators
  class OperatorProfilePolicy < ApplicationPolicy
    def show?
      true # public marketplace profiles
    end

    def update?
      (same_organization? && role_in?(:owner, :admin, :operator_manager)) || platform_admin?
    end

    def manage_fleet?
      update?
    end

    class Scope < ApplicationPolicy::Scope
      def resolve
        scope.searchable
      end
    end
  end
end
