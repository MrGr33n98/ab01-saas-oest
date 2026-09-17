# frozen_string_literal: true

module Ads
  class BannerPlacementPolicy < ApplicationPolicy
    def index?
      true
    end

    def show?
      true
    end

    def create?
      platform_admin?
    end

    def update?
      platform_admin?
    end

    def destroy?
      platform_admin?
    end

    class Scope < Scope
      def resolve
        scope.all
      end
    end
  end
end
