# frozen_string_literal: true

require "test_helper"

class WebhooksServicesTest < ActiveSupport::TestCase
  setup do
    @org = create_test_org
    @other_org = create_test_org(name: "Other Org #{SecureRandom.hex(4)}")
    @endpoint = @org.webhook_endpoints.create!(
      url: "https://example.com/webhooks",
      events: ["order.created"]
    )
  end

  test "SSRF validator blocks private, loopback, and cloud metadata IPs" do
    assert_not Webhooks::SsrfValidatorService.validate("http://127.0.0.1:3000")[:valid]
    assert_not Webhooks::SsrfValidatorService.validate("http://169.254.169.254/latest")[:valid]
    assert_not Webhooks::SsrfValidatorService.validate("http://10.0.0.1/webhook")[:valid]
    assert_not Webhooks::SsrfValidatorService.validate("http://192.168.1.1/webhook")[:valid]
    assert_not Webhooks::SsrfValidatorService.validate("ftp://example.com")[:valid]

    assert Webhooks::SsrfValidatorService.validate("https://example.com/webhook")[:valid]
  end

  test "HMAC signer computes valid signature and detects tampering" do
    payload = { event: "order.created", data: { id: "ord_100", amount: 2500 } }
    secret = @endpoint.secret_key

    header = Webhooks::HmacSignerService.compute_header(payload: payload, secret_key: secret)
    assert header.start_with?("t=")
    assert_includes header, "v1="

    # Validação positiva
    assert Webhooks::HmacSignerService.verify(payload: payload, secret_key: secret, header: header)

    # Detecção de adulteração de payload
    tampered_payload = { event: "order.created", data: { id: "ord_100", amount: 0 } }
    assert_not Webhooks::HmacSignerService.verify(payload: tampered_payload, secret_key: secret, header: header)

    # Detecção de chave incorreta
    assert_not Webhooks::HmacSignerService.verify(payload: payload, secret_key: "wrong_secret", header: header)

    # Anti-replay / timestamp expiration
    old_timestamp = Time.current.to_i - 600 # 10 minutos atrás
    old_header = Webhooks::HmacSignerService.compute_header(payload: payload, secret_key: secret, timestamp: old_timestamp)
    assert_not Webhooks::HmacSignerService.verify(payload: payload, secret_key: secret, header: old_header, tolerance_seconds: 300)
  end

  test "DispatchService publishes only to subscribed endpoints and enforces tenancy isolation" do
    other_endpoint = @other_org.webhook_endpoints.create!(
      url: "https://example.com/other-webhook",
      events: ["order.created"]
    )

    deliveries = Webhooks::DispatchService.publish(
      event_name: "order.created",
      organization: @org,
      payload: { id: "ord_123" }
    )

    assert_equal 1, deliveries.size
    assert_equal @endpoint.id, deliveries.first.webhook_endpoint_id
    assert_equal @org.id, deliveries.first.organization_id

    # Não dispara para outros tenants
    assert_nil WebhookDelivery.find_by(webhook_endpoint: other_endpoint)
  end

  test "Server-side Idempotency: duplicate publish of same event_id reuses delivery" do
    event_id = "evt_idempotent_test_#{SecureRandom.hex(6)}"
    payload = { id: "ord_456" }

    deliveries_first = Webhooks::DispatchService.publish(
      event_name: "order.created",
      organization: @org,
      payload: payload,
      event_id: event_id
    )
    assert_equal 1, deliveries_first.size

    # Segunda publicação com o mesmo event_id
    deliveries_second = Webhooks::DispatchService.publish(
      event_name: "order.created",
      organization: @org,
      payload: payload,
      event_id: event_id
    )

    assert_equal 1, deliveries_second.size
    assert_equal deliveries_first.first.id, deliveries_second.first.id
    assert_equal 1, WebhookDelivery.where(webhook_endpoint: @endpoint, event_id: event_id).count
  end
end
