# frozen_string_literal: true

class CategoryPolicy < ApplicationPolicy
  def index?
    admin? || content_manager?
  end

  def show?
    admin? || content_manager?
  end

  def create?
    admin? || content_manager?
  end

  def update?
    admin? || content_manager?
  end

  def destroy?
    admin?
  end

  def publish?
    admin? || content_manager?
  end

  def archive?
    admin?
  end

  def restore?
    admin?
  end

  def manage_seo?
    admin? || content_manager?
  end

  def manage_media?
    admin? || content_manager?
  end

  class Scope < Scope
    def resolve
      if user&.admin?
        scope.all
      else
        scope.where(active: true, status: "published")
      end
    end
  end

  private

  def content_manager?
    user&.role.to_s.in?(%w[admin content_admin seo_admin super_admin])
  end

  def admin?
    user&.admin? || user&.role.to_s.in?(%w[admin super_admin])
  end
end
