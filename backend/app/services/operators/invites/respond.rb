# frozen_string_literal: true

module Operators
  module Invites
    class Respond
      Result = Struct.new(:invite, :errors, keyword_init: true) do
        def success?
          errors.blank?
        end

        def failure?
          !success?
        end
      end

      def initialize(invite:, actor:, response:)
        @invite = invite
        @actor = actor
        @response = response.to_s
      end

      def call
        return Result.new(invite: @invite, errors: ["Unsupported invite response"]) unless %w[accepted declined].include?(@response)

        @invite.with_lock do
          if @invite.expired?
            @invite.update!(status: "expired") if @invite.status == "pending"
            return Result.new(invite: @invite, errors: ["Invite has expired"])
          end
          return Result.new(invite: @invite, errors: ["Invite is no longer actionable"]) unless @invite.status == "pending"

          @invite.update!(status: @response, responded_by: @actor, responded_at: Time.current)
        end

        Result.new(invite: @invite, errors: [])
      end
    end
  end
end
