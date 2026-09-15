# frozen_string_literal: true

# Base for ActiveAdmin — only platform staff
class AdminController < ApplicationController
  before_action :authenticate_admin_user!

  private

  def authenticate_admin_user!
    user = current_admin_user
    unless user&.platform_admin? || user&.platform_role.to_s.in?(%w[admin super_admin support ops finance compliance])
      redirect_to new_admin_user_session_path, alert: "Acesso restrito à equipe DroneHub"
    end
  end
end
