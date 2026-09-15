# frozen_string_literal: true

module Billing
  class PaymentPolicy < ApplicationPolicy
    def index?
      role_in?(%w[owner admin billing]) || platform_admin?
    end

    def confirm_payment?
      role_in?(%w[owner admin billing]) || platform_admin?
    end

    class Scope < ApplicationPolicy::Scope
      def resolve
        org_id = user.organization&.id
        return scope.none unless org_id

        scope.where(payer_organization_id: org_id)
      end
    end

    private

    def role_in?(roles)
      user.membership&.role.to_s.in?(roles)
    end

    def platform_admin?
      u = user.respond_to?(:user) ? user.user : user
      u.respond_to?(:platform_admin?) && u.platform_admin?
    end
  end
end
