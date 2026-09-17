# frozen_string_literal: true

module Ads
  class BannerEventPolicy < ApplicationPolicy
    def index?
      platform_admin?
    end

    def show?
      platform_admin?
    end

    def create?
      true # Tracking can be submitted anonymously / by customers
    end

    def update?
      false
    end

    def destroy?
      platform_admin?
    end

    class Scope < Scope
      def resolve
        if user&.platform_admin?
          scope.all
        else
          scope.none
        end
      end
    end
  end
end
