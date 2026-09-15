# frozen_string_literal: true

module Marketplace
  class ServiceCategoryPolicy < ApplicationPolicy
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
  end
end
