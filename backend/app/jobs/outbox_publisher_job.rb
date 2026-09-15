# frozen_string_literal: true

class OutboxPublisherJob < ApplicationJob
  queue_as :default

  def perform
    DomainOutboxEvent.unpublished.limit(100).find_each do |event|
      process(event)
    end
  end

  private

  def process(event)
    case event.event_type
    when "mission.published"
      Matching::RunForMissionJob.perform_later(event.payload["mission_id"] || event.aggregate_id)
    when "quote.submitted", "quote.accepted", "deliverable.uploaded", "payment.authorized", "mission.completed"
      # MVP: log structured event; wire ActionMailer adapter here
      Rails.logger.info({ event: "outbox.dispatch", type: event.event_type, id: event.id, payload: event.payload }.to_json)
    else
      Rails.logger.info({ event: "outbox.unknown", type: event.event_type, id: event.id }.to_json)
    end
    event.mark_published!
  rescue StandardError => e
    event.update!(attempts: event.attempts + 1, last_error: e.message)
    raise e
  end
end
