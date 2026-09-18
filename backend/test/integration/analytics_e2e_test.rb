# frozen_string_literal: true

require "test_helper"

class AnalyticsE2eTest < ActionDispatch::IntegrationTest
  setup do
    @org_alpha = create_test_org(name: "Alpha Solar Inspections #{SecureRandom.hex(4)}")
    @org_beta = create_test_org(name: "Beta Thermal Drones #{SecureRandom.hex(4)}")

    @user_alpha = User.create!(
      email: "alpha-admin-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      user_type: "enterprise",
      status: "active"
    )

    @user_beta = User.create!(
      email: "beta-admin-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      user_type: "enterprise",
      status: "active"
    )

    @user_unauthorized = User.create!(
      email: "outsider-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      user_type: "enterprise",
      status: "active"
    )

    OrganizationMembership.create!(
      organization: @org_alpha,
      user: @user_alpha,
      role: "owner",
      status: "active"
    )

    OrganizationMembership.create!(
      organization: @org_beta,
      user: @user_beta,
      role: "owner",
      status: "active"
    )

    @token_alpha = generate_token_for(@user_alpha)
    @token_beta = generate_token_for(@user_beta)
    @token_unauthorized = generate_token_for(@user_unauthorized)

    # 1. Gerar eventos reais no backend para Org Alpha
    10.times do
      Telemetry::Collector.track(
        "mission.created",
        organization: @org_alpha,
        actor: @user_alpha,
        properties: { "type" => "solar_farm", "budget" => 5000 },
        async: false
      )
    end

    7.times do
      Telemetry::Collector.track(
        "mission.published",
        organization: @org_alpha,
        actor: @user_alpha,
        properties: { "type" => "solar_farm" },
        async: false
      )
    end

    5.times do
      Telemetry::Collector.track(
        "quote.accepted",
        organization: @org_alpha,
        actor: @user_alpha,
        properties: { "total" => 4500 },
        async: false
      )
      Telemetry::Collector.track(
        "order.created",
        organization: @org_alpha,
        actor: @user_alpha,
        properties: { "total" => 4500 },
        async: false
      )
    end

    20.times do
      Telemetry::Collector.track(
        "webhook.delivery_succeeded",
        organization: @org_alpha,
        properties: { "status_code" => 200, "latency_ms" => 85 },
        async: false
      )
    end

    2.times do
      Telemetry::Collector.track(
        "webhook.delivery_failed",
        organization: @org_alpha,
        properties: { "status_code" => 504, "attempt" => 1 },
        async: false
      )
    end

    # 2. Gerar eventos reais no backend para Org Beta
    3.times do
      Telemetry::Collector.track(
        "mission.created",
        organization: @org_beta,
        actor: @user_beta,
        async: false
      )
    end

    # 3. Executar agregação diária
    Telemetry::AggregatorService.aggregate_date(Date.current)
  end

  test "GET /api/v1/analytics/overview returns real tenant metrics for Org Alpha" do
    get "/api/v1/analytics/overview",
        headers: {
          "Authorization" => "Bearer #{@token_alpha}",
          "X-Organization-Id" => @org_alpha.id,
          "Accept" => "application/json"
        }

    assert_response :success
    json = JSON.parse(response.body)
    data = json["data"]

    assert_equal @org_alpha.id, data["organization_id"]
    assert_equal 10, data["summary"]["missions_created"]
    assert_equal 7, data["summary"]["missions_published"]
    assert_equal 5, data["summary"]["quotes_accepted"]
    assert_equal 5, data["summary"]["orders_created"]
    assert_equal 20, data["summary"]["webhooks_succeeded"]
    assert_equal 2, data["summary"]["webhooks_failed"]
  end

  test "GET /api/v1/analytics/funnel returns valid mathematical conversion steps" do
    get "/api/v1/analytics/funnel",
        headers: {
          "Authorization" => "Bearer #{@token_alpha}",
          "X-Organization-Id" => @org_alpha.id,
          "Accept" => "application/json"
        }

    assert_response :success
    json = JSON.parse(response.body)
    steps = json["data"]["steps"]

    assert_equal 4, steps.size
    assert_equal "mission_created", steps[0]["step"]
    assert_equal 10, steps[0]["count"]
    assert_equal 100.0, steps[0]["conversion_rate"]

    assert_equal "mission_published", steps[1]["step"]
    assert_equal 7, steps[1]["count"]
    assert_equal 70.0, steps[1]["conversion_rate"]

    assert_equal "quote_accepted", steps[2]["step"]
    assert_equal 5, steps[2]["count"]
    assert_equal 71.43, steps[2]["conversion_rate"]

    assert_equal "order_created", steps[3]["step"]
    assert_equal 5, steps[3]["count"]
    assert_equal 100.0, steps[3]["conversion_rate"]
  end

  test "GET /api/v1/analytics/webhooks returns delivery reliability metrics" do
    get "/api/v1/analytics/webhooks",
        headers: {
          "Authorization" => "Bearer #{@token_alpha}",
          "X-Organization-Id" => @org_alpha.id,
          "Accept" => "application/json"
        }

    assert_response :success
    json = JSON.parse(response.body)
    data = json["data"]

    assert_equal 22, data["total_deliveries"]
    assert_equal 20, data["succeeded"]
    assert_equal 2, data["failed"]
    assert_equal 90.91, data["success_rate_percentage"]
  end

  test "Strict tenant isolation: Org Beta cannot see Org Alpha analytics" do
    get "/api/v1/analytics/overview",
        headers: {
          "Authorization" => "Bearer #{@token_beta}",
          "X-Organization-Id" => @org_beta.id,
          "Accept" => "application/json"
        }

    assert_response :success
    json = JSON.parse(response.body)
    data = json["data"]

    assert_equal @org_beta.id, data["organization_id"]
    assert_equal 3, data["summary"]["missions_created"]
    assert_equal 0, data["summary"]["missions_published"]
    assert_equal 0, data["summary"]["quotes_accepted"]
    assert_equal 0, data["summary"]["orders_created"]
    assert_equal 0, data["summary"]["webhooks_succeeded"]
  end

  test "Unauthenticated or unauthorized user receives 401/403" do
    # Without token
    get "/api/v1/analytics/overview",
        headers: { "X-Organization-Id" => @org_alpha.id, "Accept" => "application/json" }
    assert_response :unauthorized

    # Outsider user trying to access Org Alpha
    get "/api/v1/analytics/overview",
        headers: {
          "Authorization" => "Bearer #{@token_unauthorized}",
          "X-Organization-Id" => @org_alpha.id,
          "Accept" => "application/json"
        }
    assert_response :forbidden
  end

  private

  def generate_token_for(user)
    body = Base64.urlsafe_encode64({
      sub: user.id,
      jti: user.jti,
      type: "access",
      exp: 24.hours.from_now.to_i
    }.to_json)
    sig = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", ENV["JWT_SECRET"] || "dronehub-mvp-dev-secret-change-me", body))
    "#{body}.#{sig}"
  end
end
