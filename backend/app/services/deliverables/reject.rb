# frozen_string_literal: true

module Deliverables
  class Reject
    Result = Struct.new(:success?, :deliverable, :errors, keyword_init: true)

    def self.call(deliverable:, user:, reason:)
      new(deliverable: deliverable, user: user, reason: reason).call
    end

    def initialize(deliverable:, user:, reason:)
      @deliverable = deliverable
      @user = user
      @reason = reason
    end

    def call
      return fail!("reason required") if reason.blank?
      return fail!("not in review") unless deliverable.status.in?(%w[in_review available])

      deliverable.update!(status: "rejected", rejection_reason: reason)
      DomainOutboxEvent.create!(
        aggregate_type: "deliverable",
        aggregate_id: deliverable.id,
        event_type: "deliverable.rejected",
        payload: { deliverable_id: deliverable.id, reason: reason },
        occurred_at: Time.current
      )
      Result.new(success?: true, deliverable: deliverable, errors: [])
    end

    private

    attr_reader :deliverable, :user, :reason

    def fail!(msg)
      Result.new(success?: false, deliverable: deliverable, errors: [msg])
    end
  end
end
