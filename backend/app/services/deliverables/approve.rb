# frozen_string_literal: true

module Deliverables
  class Approve
    Result = Struct.new(:success?, :deliverable, :mission, :errors, keyword_init: true)

    def self.call(deliverable:, user:)
      new(deliverable: deliverable, user: user).call
    end

    def initialize(deliverable:, user:)
      @deliverable = deliverable
      @user = user
    end

    def call
      return fail!("not in review") unless deliverable.status.in?(%w[in_review available])

      mission = deliverable.mission
      ActiveRecord::Base.transaction do
        deliverable.update!(status: "approved")
        from = mission.status
        mission.update!(status: "completed", completed_at: Time.current)
        Missions::MissionStatusEvent.create!(
          mission: mission,
          actor_id: user.id,
          from_status: from,
          to_status: "completed",
          reason_code: "deliverable_approved",
          created_at: Time.current
        )
        if mission.order
          mission.order.update!(status: "completed", completed_at: Time.current)
        end
        DomainOutboxEvent.create!(
          aggregate_type: "mission",
          aggregate_id: mission.id,
          event_type: "mission.completed",
          payload: { mission_id: mission.id, deliverable_id: deliverable.id },
          occurred_at: Time.current
        )
      end
      Result.new(success?: true, deliverable: deliverable.reload, mission: mission.reload, errors: [])
    end

    private

    attr_reader :deliverable, :user

    def fail!(msg)
      Result.new(success?: false, deliverable: deliverable, mission: deliverable.mission, errors: [msg])
    end
  end
end
