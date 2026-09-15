# frozen_string_literal: true

module Missions
  class Publish
    Result = Struct.new(:success?, :mission, :errors, keyword_init: true)

    def self.call(**args)
      new(**args).call
    end

    def initialize(mission:, user:, idempotency_key: nil)
      @mission = mission
      @user = user
      @idempotency_key = idempotency_key
    end

    def call
      return Result.new(success?: false, mission: mission, errors: ["Mission is not publishable"]) unless mission.publishable?
      return Result.new(success?: false, mission: mission, errors: ["AOI is required"]) unless mission.has_aoi?
      return Result.new(success?: false, mission: mission, errors: ["At least one product is required"]) unless mission.has_products?
      return Result.new(success?: false, mission: mission, errors: ["Deadline is required"]) if mission.deadline_at.blank?

      ActiveRecord::Base.transaction do
        mission.lock!
        raise ConcurrentModification if mission.status != mission.status_was && !mission.publishable?

        from = mission.status
        mission.update!(
          status: "published",
          published_at: Time.current
        )

        Missions::MissionStatusEvent.create!(
          mission: mission,
          actor: user,
          from_status: from,
          to_status: "published",
          reason_code: "published"
        )

        DomainOutboxEvent.create!(
          aggregate_type: "mission",
          aggregate_id: mission.id,
          event_type: "mission.published",
          payload: {
            mission_id: mission.id,
            organization_id: mission.organization_id,
            published_at: mission.published_at.iso8601
          },
          occurred_at: Time.current
        )
      end

      Matching::EnqueueJob.perform_later(mission.id)

      begin
        Mail::Deliver.call(:mission_published, user: user, mission: mission.reload)
      rescue StandardError => e
        Rails.logger.warn({ event: "mission_published_mail_failed", error: e.message }.to_json)
      end

      Result.new(success?: true, mission: mission.reload, errors: [])
    rescue ConcurrentModification
      Result.new(success?: false, mission: mission, errors: ["Concurrent modification"])
    rescue ActiveRecord::RecordInvalid => e
      Result.new(success?: false, mission: mission, errors: e.record.errors.full_messages)
    end

    private

    attr_reader :mission, :user, :idempotency_key

    class ConcurrentModification < StandardError; end
  end
end
