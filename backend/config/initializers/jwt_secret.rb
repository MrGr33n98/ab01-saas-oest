# frozen_string_literal: true

Rails.application.config.after_initialize do
  if Rails.env.production?
    secret = ENV["JWT_SECRET"].to_s
    if secret.blank? || secret.include?("change-me") || secret.length < 32
      raise "FATAL: JWT_SECRET must be set to a strong value in production (min 32 chars, no change-me)"
    end
  end
end
