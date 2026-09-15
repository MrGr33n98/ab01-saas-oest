# frozen_string_literal: true

module Admin
  class SessionsController < Devise::SessionsController
    layout false

    def create
      email = params.dig(:admin_user, :email).presence || params[:email]
      password = params.dig(:admin_user, :password).presence || params[:password]

      user = User.find_by(email: email.to_s.downcase.strip)
      if user && valid_password?(user, password) && admin_role?(user)
        session[:admin_user_id] = user.id
        warden.set_user(user, scope: :admin_user) if defined?(warden)
        redirect_to admin_root_path, notice: "Bem-vindo ao DroneHub Admin"
      else
        flash.now[:alert] = "Credenciais inválidas ou sem permissão de admin"
        render :new, status: :unauthorized
      end
    end

    def destroy
      session.delete(:admin_user_id)
      warden.logout(:admin_user) if defined?(warden)
      redirect_to new_admin_user_session_path, notice: "Sessão encerrada"
    end

    def new
      # login form
    end

    private

    def admin_role?(user)
      user.platform_admin? || user.platform_role.to_s.in?(%w[admin super_admin support ops finance compliance])
    end

    def valid_password?(user, password)
      return false if password.blank?
      # MVP hash used in seeds/auth
      expected = "sha256:#{Digest::SHA256.hexdigest(password)}"
      return true if user.encrypted_password == expected
      return true if user.respond_to?(:valid_password?) && user.valid_password?(password)

      false
    end
  end
end
