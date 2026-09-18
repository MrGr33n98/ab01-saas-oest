# frozen_string_literal: true

require "test_helper"

class DeliverPayloadJobTest < ActiveJob::TestCase
  setup do
    @org = create_test_org
    @endpoint = @org.webhook_endpoints.create!(
      url: "http://127.0.0.1:9999/blocked",
      events: ["order.created"]
    )
    @delivery = @org.webhook_deliveries.create!(
      webhook_endpoint: @endpoint,
      event_type: "order.created",
      event_id: SecureRandom.uuid,
      payload: { id: 1 }
    )
  end

  test "blocks delivery and logs failed attempt when SSRF check fails" do
    Webhooks::DeliverPayloadJob.perform_now(@delivery.id)
    @delivery.reload

    assert_equal "failed", @delivery.status
    assert_equal 1, @delivery.webhook_attempts.count

    attempt = @delivery.webhook_attempts.first
    assert_equal "failed", attempt.status
    assert_equal "Security::SsrfBlockedError", attempt.error_class
    assert_includes attempt.error_message, "SSRF Protection"
  end

  test "job skips delivery if endpoint is disabled" do
    @endpoint.disable!
    @delivery.update!(status: "pending")

    Webhooks::DeliverPayloadJob.perform_now(@delivery.id)
    @delivery.reload

    assert_equal "pending", @delivery.status
    assert_equal 0, @delivery.webhook_attempts.count
  end
end
