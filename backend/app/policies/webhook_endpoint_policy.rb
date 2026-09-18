# frozen_string_literal: true

class WebhookEndpointPolicy < ApplicationPolicy
  def index?
    platform_admin? || member?
  end

  def show?
    platform_admin? || (member? && same_organization?)
  end

  def create?
    platform_admin? || owner_or_admin?
  end

  def update?
    platform_admin? || (owner_or_admin? && same_organization?)
  end

  def destroy?
    platform_admin? || (owner_or_admin? && same_organization?)
  end

  def ping?
    show?
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
