# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # ActiveAdmin / Devise HTML stack
  protect_from_forgery with: :exception

  def current_admin_user
    return @current_admin_user if defined?(@current_admin_user)

    @current_admin_user = begin
      if respond_to?(:current_user) && current_user
        current_user
      elsif session[:admin_user_id]
        User.find_by(id: session[:admin_user_id])
      else
        # Devise scope :admin_user maps to User
        warden.user(:admin_user) if defined?(warden)
      end
    end
  end
  helper_method :current_admin_user

  def authenticate_admin_user!
    return if current_admin_user&.platform_admin? ||
              current_admin_user&.platform_role.to_s.in?(%w[admin super_admin support ops finance compliance])

    if request.format.html?
      session[:admin_return_to] = request.fullpath
      redirect_to "/admin/login", alert: "Faça login como administrador"
    else
      head :unauthorized
    end
  end

  def destroy_admin_user_session_path
    "/admin/logout"
  end
  helper_method :destroy_admin_user_session_path
end
