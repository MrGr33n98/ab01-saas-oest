# frozen_string_literal: true

module Notifications
  class Notify
    def self.call(user:, type:, title:, body: nil, organization: nil, action_url: nil, payload: {})
      new(
        user: user,
        type: type,
        title: title,
        body: body,
        organization: organization,
        action_url: action_url,
        payload: payload
      ).call
    end

    def initialize(user:, type:, title:, body:, organization:, action_url:, payload:)
      @user = user
      @type = type
      @title = title
      @body = body
      @organization = organization
      @action_url = action_url
      @payload = payload
    end

    def call
      Notification.create!(
        user: @user,
        organization: @organization,
        notification_type: @type.to_s,
        title: @title,
        body: @body,
        action_url: @action_url,
        payload: @payload
      )
    rescue StandardError => e
      Rails.logger.error({ event: "notification_failed", user_id: @user&.id, error: e.message }.to_json)
      nil
    end
  end
end
