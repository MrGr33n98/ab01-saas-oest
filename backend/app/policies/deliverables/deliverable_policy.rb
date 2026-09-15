# frozen_string_literal: true

module Deliverables
  class DeliverablePolicy < ApplicationPolicy
    def index?
      member? || platform_admin?
    end

    def show?
      platform_admin? || same_organization? || operator_on_mission?
    end

    def create?
      (role_in?(:owner, :admin, :operator_manager, :analyst, :pilot) && operator_on_mission?) || platform_admin?
    end

    def approve?
      (same_organization? && role_in?(:owner, :admin, :manager, :procurement)) || platform_admin?
    end

    def reject?
      approve?
    end

    private

    def operator_on_mission?
      return false unless organization && record.respond_to?(:mission)
      record.mission&.order&.operator_organization_id == organization.id
    end
  end
end
