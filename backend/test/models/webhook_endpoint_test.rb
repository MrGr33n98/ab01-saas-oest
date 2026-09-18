# frozen_string_literal: true

require "test_helper"

class WebhookEndpointTest < ActiveSupport::TestCase
  setup do
    @org = create_test_org
    @endpoint = @org.webhook_endpoints.create!(
      url: "https://example.com/webhooks",
      events: ["order.created", "mission.completed"]
    )
  end

  test "validates required attributes and formats" do
    assert @endpoint.valid?
    assert @endpoint.secret_key.start_with?("whsec_")
    assert @endpoint.active?
  end

  test "validates URL scheme" do
    bad_endpoint = @org.webhook_endpoints.new(url: "ftp://example.com", events: ["*"])
    assert_not bad_endpoint.valid?
    assert_includes bad_endpoint.errors[:url], "must be a valid HTTP/HTTPS URL"
  end

  test "validates supported events and wildcard" do
    bad_endpoint = @org.webhook_endpoints.new(url: "https://example.com", events: ["invalid.event"])
    assert_not bad_endpoint.valid?

    wildcard_endpoint = @org.webhook_endpoints.new(url: "https://example.com", events: ["*"])
    assert wildcard_endpoint.valid?
  end

  test "masks secret key and redacts from inspect" do
    masked = @endpoint.masked_secret
    assert masked.start_with?("whsec_")
    assert masked.include?("...")
    assert_not_equal @endpoint.secret_key, masked

    inspected = @endpoint.inspect
    assert_includes inspected, "[FILTERED]"
    assert_not_includes inspected, @endpoint.secret_key
  end

  test "delivery and attempts cascade deletion" do
    delivery = @org.webhook_deliveries.create!(
      webhook_endpoint: @endpoint,
      event_type: "order.created",
      event_id: SecureRandom.uuid,
      payload: { id: 1 }
    )
    attempt = delivery.webhook_attempts.create!(
      attempt_number: 1,
      status: "failed",
      attempted_at: Time.current
    )

    assert_difference "WebhookEndpoint.count", -1 do
      assert_difference "WebhookDelivery.count", -1 do
        assert_difference "WebhookAttempt.count", -1 do
          @endpoint.destroy!
        end
      end
    end
  end
end
