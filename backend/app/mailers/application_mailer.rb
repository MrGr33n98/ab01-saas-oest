# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: -> { ENV.fetch("MAIL_FROM", "DroneHub <noreply@dronehub.local>") }
  layout "mailer"
  helper_method :app_url

  private

  def app_url(path = "/")
    base = ENV.fetch("APP_URL", "http://localhost:3000")
    "#{base.chomp('/')}#{path}"
  end
end
