# frozen_string_literal: true

require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "sprockets/railtie"

Bundler.require(*Rails.groups)

module Dronehub
  class Application < Rails::Application
    config.load_defaults 7.2
    config.api_only = true
    config.time_zone = "America/Cuiaba"
    config.active_record.schema_format = :ruby
    config.active_job.queue_adapter = :sidekiq
    config.generators.system_tests = nil

    # Enable Session & Cookie middleware for ActiveAdmin in API mode
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore, key: "_dronehub_session"
    config.middleware.use ActionDispatch::Flash
    config.middleware.use Rack::MethodOverride

    config.middleware.use Rack::Attack

    # Autoload domain modules
    config.autoload_paths += %W[
      #{config.root}/app/services
      #{config.root}/app/queries
      #{config.root}/app/events
      #{config.root}/app/subscribers
      #{config.root}/app/integrations
      #{config.root}/lib
    ]
  end
end

