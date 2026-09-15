# frozen_string_literal: true

module Admin
  class AdminPolicy < ApplicationPolicy
    def access?
      platform_admin?
    end

    def verify_operator?
      platform_admin?
    end

    def moderate_review?
      platform_admin?
    end

    def resolve_dispute?
      platform_admin?
    end

    def manage_categories?
      platform_admin?
    end

    def view_risk?
      platform_admin?
    end
  end
end
