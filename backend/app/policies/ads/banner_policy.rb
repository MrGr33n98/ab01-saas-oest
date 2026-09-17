# frozen_string_literal: true

module Ads
  class BannerPolicy < ApplicationPolicy
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
        if user&.platform_admin?
          scope.all
        else
          scope.live
        end
      end
    end
  end
end
