# frozen_string_literal: true

module Telemetry
  class Collector
    def self.track(event_name, organization: nil, actor: nil, entity: nil, properties: {}, occurred_at: nil, request_id: nil, source: "web", async: true)
      new.track(
        event_name: event_name,
        organization: organization,
        actor: actor,
        entity: entity,
        properties: properties,
        occurred_at: occurred_at,
        request_id: request_id,
        source: source,
        async: async
      )
    end

    def track(event_name:, organization: nil, actor: nil, entity: nil, properties: {}, occurred_at: nil, request_id: nil, source: "web", async: true)
      sanitized_properties = EventSchema.sanitize(event_name, properties)
      occurred_time = occurred_at || Time.current

      payload = {
        organization_id: organization&.id || (organization.is_a?(String) ? organization : nil),
        actor_type: actor&.class&.name,
        actor_id: actor&.id,
        event_name: event_name.to_s,
        entity_type: entity&.class&.name,
        entity_id: entity&.id,
        properties: sanitized_properties,
        occurred_at: occurred_time.iso8601,
        request_id: request_id,
        source: source.to_s,
        schema_version: 1
      }

      if async
        IngestEventJob.perform_later(payload)
      else
        IngestEventJob.new.perform(payload)
      end
    rescue StandardError => e
      Rails.logger.error("[Telemetry::Collector] Failed to track event #{event_name}: #{e.message}")
      nil
    end
  end
end
