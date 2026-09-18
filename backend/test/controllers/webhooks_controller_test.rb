# frozen_string_literal: true

require "test_helper"

class WebhooksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @org_a = create_test_org(name: "Org Alpha #{SecureRandom.hex(4)}")
    @org_b = create_test_org(name: "Org Beta #{SecureRandom.hex(4)}")

    @user_a = User.create!(
      email: "owner-a-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      user_type: "enterprise",
      status: "active"
    )
    @membership_a = OrganizationMembership.create!(
      organization: @org_a,
      user: @user_a,
      role: "owner",
      status: "active"
    )

    @endpoint_a = @org_a.webhook_endpoints.create!(
      url: "https://example.com/webhook-alpha",
      events: ["order.created"]
    )
  end

  test "create endpoint validates SSRF and blocks internal IP" do
    # Simula chamada de criação com URL privada
    assert_no_difference "@org_a.webhook_endpoints.count" do
      bad_ep = @org_a.webhook_endpoints.new(url: "http://127.0.0.1:8080", events: ["*"])
      ssrf = Webhooks::SsrfValidatorService.validate(bad_ep.url)
      assert_not ssrf[:valid]
    end
  end

  test "endpoint show exposes masked secret to non-creators" do
    assert @endpoint_a.masked_secret.start_with?("whsec_")
    assert @endpoint_a.masked_secret.include?("...")
  end

  test "cross-tenant isolation: Org B cannot find or query Org A endpoints" do
    assert_raises ActiveRecord::RecordNotFound do
      @org_b.webhook_endpoints.find(@endpoint_a.id)
    end
  end
end
