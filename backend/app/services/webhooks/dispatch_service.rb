# frozen_string_literal: true

module Webhooks
  class DispatchService
    def self.publish(event_name:, organization:, payload:, event_id: SecureRandom.uuid)
      new(event_name: event_name, organization: organization, payload: payload, event_id: event_id).publish
    end

    def initialize(event_name:, organization:, payload:, event_id: SecureRandom.uuid)
      @event_name = event_name.to_s
      @organization = organization
      @payload = payload
      @event_id = event_id
    end

    def publish
      return [] unless @organization

      # Busca endpoints ativos do tenant inscritos para este evento específico ou '*'
      endpoints = @organization.webhook_endpoints.for_event(@event_name)
      return [] if endpoints.empty?

      formatted_payload = envelope_payload

      deliveries = []
      endpoints.each do |endpoint|
        # Idempotência a nível de servidor: não recria nem reduplica se já existir entrega para o mesmo evento lógico
        delivery = @organization.webhook_deliveries.find_or_initialize_by(
          webhook_endpoint: endpoint,
          event_id: @event_id
        )

        is_new = delivery.new_record?
        if is_new
          delivery.event_type = @event_name
          delivery.payload = formatted_payload
          delivery.status = "pending"
          delivery.save!

          Webhooks::DeliverPayloadJob.perform_later(delivery.id)
        end

        deliveries << delivery
      end

      deliveries
    end

    private

    def envelope_payload
      {
        id: @event_id,
        event: @event_name,
        created_at: Time.current.iso8601,
        organization_id: @organization.id,
        data: @payload
      }
    end
  end
end
