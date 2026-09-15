# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :user, :record, :organization, :membership

  def initialize(context, record)
    @user = context.user
    @organization = context.organization
    @membership = context.membership
    @record = record
  end

  def index?
    false
  end

  def show?
    false
  end

  def create?
    false
  end

  def update?
    false
  end

  def destroy?
    false
  end

  class Scope
    attr_reader :user, :scope, :organization, :membership

    def initialize(context, scope)
      @user = context.user
      @organization = context.organization
      @membership = context.membership
      @scope = scope
    end

    def resolve
      raise NotImplementedError
    end
  end

  protected

  def platform_admin?
    user&.platform_admin?
  end

  def member?
    membership.present? && membership.status == "active"
  end

  def role_in?(*roles)
    member? && membership.role.in?(roles.map(&:to_s))
  end

  def owner_or_admin?
    role_in?(:owner, :admin)
  end

  def same_organization?(resource = record)
    return false if organization.nil? || resource.nil?
    return true if resource.respond_to?(:organization_id) && resource.organization_id == organization.id

    false
  end
end
