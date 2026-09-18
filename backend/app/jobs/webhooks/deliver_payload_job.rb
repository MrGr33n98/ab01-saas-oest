# frozen_string_literal: true

require "net/http"
require "uri"

module Webhooks
  class DeliverPayloadJob < ApplicationJob
    queue_as :webhooks

    MAX_ATTEMPTS = 5
    TIMEOUT_SECONDS = 10

    def perform(delivery_id)
      delivery = WebhookDelivery.find_by(id: delivery_id)
      return unless delivery

      endpoint = delivery.webhook_endpoint
      return unless endpoint&.active?

      delivery.mark_delivering!
      attempt_number = delivery.attempts_count + 1
      delivery.update!(attempts_count: attempt_number)

      # 1. Prevenção estrita de SSRF
      ssrf_check = Webhooks::SsrfValidatorService.validate(endpoint.url)
      unless ssrf_check[:valid]
        record_attempt(
          delivery: delivery,
          attempt_number: attempt_number,
          status: "failed",
          error_class: "Security::SsrfBlockedError",
          error_message: ssrf_check[:reason],
          duration_ms: 0
        )
        delivery.mark_failed!(retry_at: nil)
        return
      end

      # 2. Computação de Assinatura HMAC-SHA256
      timestamp = Time.current.to_i
      signature_header = Webhooks::HmacSignerService.compute_header(
        payload: delivery.payload,
        secret_key: endpoint.secret_key,
        timestamp: timestamp
      )

      # 3. Disparo HTTP POST
      uri = URI.parse(endpoint.url)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = (uri.scheme == "https")
      http.open_timeout = TIMEOUT_SECONDS
      http.read_timeout = TIMEOUT_SECONDS

      request = Net::HTTP::Post.new(uri.request_uri)
      request["Content-Type"] = "application/json"
      request["User-Agent"] = "DroneHub-Webhook/1.0"
      request[Webhooks::HmacSignerService::HEADER_NAME] = signature_header
      request["X-DroneHub-Delivery-Id"] = delivery.id
      request["X-DroneHub-Event"] = delivery.event_type
      request.body = delivery.payload.to_json

      start_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      response = http.request(request)
      duration_ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start_time) * 1000).round(2)

      success = response.is_a?(Net::HTTPSuccess) # 2xx status codes

      record_attempt(
        delivery: delivery,
        attempt_number: attempt_number,
        status: success ? "succeeded" : "failed",
        status_code: response.code.to_i,
        response_body: response.body.to_s.truncate(2000),
        response_headers: response.each_header.to_h,
        duration_ms: duration_ms
      )

      if success
        delivery.mark_succeeded!
        Telemetry::Collector.track(
          "webhook.delivery_succeeded",
          organization: delivery.organization,
          entity: delivery,
          properties: { status_code: response.code.to_i, duration_ms: duration_ms },
          source: "webhook_worker"
        )
      else
        Telemetry::Collector.track(
          "webhook.delivery_failed",
          organization: delivery.organization,
          entity: delivery,
          properties: { status_code: response.code.to_i, attempt: attempt_number },
          source: "webhook_worker"
        )
        handle_retry_or_fail(delivery, attempt_number, "HTTP #{response.code}")
      end
    rescue StandardError => e
      duration_ms = 0
      Telemetry::Collector.track(
        "webhook.delivery_failed",
        organization: delivery&.organization,
        entity: delivery,
        properties: { error_class: e.class.name, error_message: e.message.truncate(200), attempt: attempt_number },
        source: "webhook_worker"
      )
      record_attempt(
        delivery: delivery,
        attempt_number: attempt_number,
        status: "failed",
        error_class: e.class.name,
        error_message: e.message.truncate(500),
        duration_ms: duration_ms
      )
      handle_retry_or_fail(delivery, attempt_number, e.message)
    end

    private

    def record_attempt(delivery:, attempt_number:, status:, status_code: nil, response_body: nil, response_headers: {}, duration_ms: 0, error_class: nil, error_message: nil)
      WebhookAttempt.create!(
        webhook_delivery: delivery,
        attempt_number: attempt_number,
        status: status,
        response_status_code: status_code,
        response_body: response_body,
        response_headers: response_headers,
        duration_ms: duration_ms,
        error_class: error_class,
        error_message: error_message,
        attempted_at: Time.current
      )
    end

    def handle_retry_or_fail(delivery, attempt_number, _reason)
      if attempt_number < MAX_ATTEMPTS
        # Backoff exponencial: 15s, 31s, 96s, 271s
        delay_seconds = (attempt_number**4) + 15
        next_retry = delay_seconds.seconds.from_now
        delivery.mark_failed!(retry_at: next_retry)
        self.class.set(wait_until: next_retry).perform_later(delivery.id)
      else
        delivery.mark_failed!(retry_at: nil)
      end
    end
  end
end
