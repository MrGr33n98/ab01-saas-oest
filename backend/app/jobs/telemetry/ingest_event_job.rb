# frozen_string_literal: true

module Telemetry
  class IngestEventJob < ApplicationJob
    queue_as :telemetry

    def perform(event_payload)
      payload = event_payload.deep_symbolize_keys

      TelemetryEvent.create!(
        organization_id: payload[:organization_id],
        actor_type: payload[:actor_type],
        actor_id: payload[:actor_id],
        session_id: payload[:session_id],
        event_name: payload[:event_name],
        entity_type: payload[:entity_type],
        entity_id: payload[:entity_id],
        properties: payload[:properties] || {},
        occurred_at: payload[:occurred_at] ? Time.zone.parse(payload[:occurred_at].to_s) : Time.current,
        received_at: Time.current,
        request_id: payload[:request_id],
        source: payload[:source] || "web",
        schema_version: payload[:schema_version] || 1
      )
    rescue ActiveRecord::RecordNotUnique
      Rails.logger.warn("[Telemetry] Duplicate event ignored for request_id=#{payload[:request_id]} event=#{payload[:event_name]}")
    rescue StandardError => e
      Rails.logger.error("[Telemetry] IngestEventJob failed: #{e.message}")
      raise e
    end
  end
end
