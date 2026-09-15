# frozen_string_literal: true

class MembershipPolicy < ApplicationPolicy
  def index?
    platform_admin? || owner_or_admin? || role_in?(:manager)
  end

  def update?
    platform_admin? || owner_or_admin?
  end

  def destroy?
    platform_admin? || owner_or_admin?
  end

  def invite?
    platform_admin? || owner_or_admin? || role_in?(:manager)
  end
end
