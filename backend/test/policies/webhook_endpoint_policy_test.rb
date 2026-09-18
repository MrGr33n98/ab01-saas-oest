# frozen_string_literal: true

require "test_helper"

class WebhookEndpointPolicyTest < ActiveSupport::TestCase
  setup do
    @org_a = create_test_org(name: "Org Alpha #{SecureRandom.hex(4)}")
    @org_b = create_test_org(name: "Org Beta #{SecureRandom.hex(4)}")

    @endpoint_a = @org_a.webhook_endpoints.create!(
      url: "https://example.com/webhook-a",
      events: ["order.created"]
    )
  end

  test "same organization policy authorization check" do
    policy_a = WebhookEndpointPolicy.new(
      Struct.new(:user, :organization, :membership).new(nil, @org_a, Struct.new(:owner_or_admin?, :status, :role).new(true, "active", "admin")),
      @endpoint_a
    )
    assert policy_a.show?
    assert policy_a.update?
    assert policy_a.destroy?

    # Tenant diferente é bloqueado
    policy_b = WebhookEndpointPolicy.new(
      Struct.new(:user, :organization, :membership).new(nil, @org_b, Struct.new(:owner_or_admin?, :status, :role).new(true, "active", "admin")),
      @endpoint_a
    )
    assert_not policy_b.show?
    assert_not policy_b.update?
    assert_not policy_b.destroy?
  end

  test "policy scope resolves only current tenant endpoints" do
    @org_b.webhook_endpoints.create!(
      url: "https://example.com/webhook-b",
      events: ["order.created"]
    )

    scope_a = WebhookEndpointPolicy::Scope.new(
      Struct.new(:user, :organization, :membership).new(nil, @org_a, nil),
      WebhookEndpoint.all
    ).resolve

    assert_equal 1, scope_a.count
    assert_equal @endpoint_a.id, scope_a.first.id
  end
end
