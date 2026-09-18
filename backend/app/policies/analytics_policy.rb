# frozen_string_literal: true

class AnalyticsPolicy < ApplicationPolicy
  def overview?
    platform_admin? || member?
  end

  def funnel?
    platform_admin? || member?
  end

  def webhooks?
    platform_admin? || member?
  end

  def platform_overview?
    platform_admin?
  end

  class Scope < Scope
    def resolve
      if user&.platform_admin?
        scope.all
      elsif organization.present?
        scope.where(organization_id: organization.id)
      else
        scope.none
      end
    end
  end
end
