# frozen_string_literal: true

ActiveAdmin.setup do |config|
  config.site_title = "DroneHub Admin"
  config.site_title_link = "/"

  config.authentication_method = :authenticate_admin_user!
  config.current_user_method = :current_admin_user
  config.logout_link_path = :destroy_admin_user_session_path
  config.logout_link_method = :delete

  config.batch_actions = true
  config.comments = false
  config.filter_attributes = %i[encrypted_password password password_confirmation jti remember_created_at]
  config.localize_format = :long
  config.default_per_page = 30
  config.max_per_page = 200
  config.download_links = %i[csv xml json]

  config.namespace :admin do |admin|
    admin.build_menu :default do |menu|
      menu.add label: "Identidade", priority: 1
      menu.add label: "Marketplace", priority: 2
      menu.add label: "Operações", priority: 3
      menu.add label: "Billing", priority: 4
      menu.add label: "Growth", priority: 5
      menu.add label: "Conteúdo", priority: 6
      menu.add label: "Sistema", priority: 7
    end
  end
end
