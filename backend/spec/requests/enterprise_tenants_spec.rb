# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Enterprise tenant workspace", type: :request do
  def access_token_for(user)
    secret = ENV.fetch("JWT_SECRET", "dronehub-mvp-dev-secret-change-me")
    payload = { sub: user.id, jti: user.jti, type: "access", exp: 1.hour.from_now.to_i }
    body = Base64.urlsafe_encode64(payload.to_json)
    signature = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", secret, body))
    "#{body}.#{signature}"
  end

  def headers_for(user, organization)
    {
      "Authorization" => "Bearer #{access_token_for(user)}",
      "X-Organization-Id" => organization.id,
      "X-Request-Id" => SecureRandom.uuid,
      "Content-Type" => "application/json"
    }
  end

  def create_context!(user_type:, organization_type:)
    user = User.create!(
      email: "#{user_type}-#{SecureRandom.hex(6)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!",
      jti: SecureRandom.uuid,
      user_type: user_type,
      platform_role: "user",
      status: "active"
    )
    organization = Organization.create!(
      name: "#{user_type} org",
      slug: "#{user_type}-#{SecureRandom.hex(6)}",
      organization_type: organization_type,
      country_code: "BR",
      status: "active"
    )
    OrganizationMembership.create!(
      organization: organization,
      user: user,
      role: "owner",
      status: "active",
      joined_at: Time.current
    )
    [user, organization]
  end

  it "persists enterprise as the explicit user and organization tenant type" do
    post "/api/v1/auth/sign_up", params: {
      email: "enterprise-signup-#{SecureRandom.hex(4)}@example.com",
      password: "secure-pass-123",
      first_name: "Ana",
      organization_name: "Empresa Teste",
      user_type: "enterprise",
      accepted_terms: true
    }.to_json, headers: { "Content-Type" => "application/json" }

    expect(response).to have_http_status(:created)
    expect(JSON.parse(response.body).dig("data", "user", "user_type")).to eq("enterprise")
    expect(JSON.parse(response.body).dig("data", "organization", "tenant_type")).to eq("enterprise")
    expect(JSON.parse(response.body).dig("data", "organization", "organization_type")).to eq("enterprise")
  end

  it "rejects an operator user from the enterprise API even with a valid membership" do
    user, organization = create_context!(user_type: "operator", organization_type: "drone_operator")

    get "/api/v1/enterprise/dashboard", headers: headers_for(user, organization)

    expect(response).to have_http_status(:forbidden)
    expect(JSON.parse(response.body).fetch("code")).to eq("TENANT_TYPE_FORBIDDEN")
  end

  it "creates an auditable API-key request but never returns a secret before approval" do
    user, organization = create_context!(user_type: "enterprise", organization_type: "enterprise")

    post "/api/v1/enterprise/api_keys", params: {
      name: "Data warehouse",
      scopes: %w[missions:read orders:read]
    }.to_json, headers: headers_for(user, organization)

    expect(response).to have_http_status(:accepted)
    body = JSON.parse(response.body)
    expect(body.dig("data", "status")).to eq("requested")
    expect(body.dig("data", "secret")).to be_nil
    expect(Enterprises::ApiKey.last.token_digest).to be_nil
  end

  it "releases a generated secret once after platform approval" do
    user, organization = create_context!(user_type: "enterprise", organization_type: "enterprise")
    key = Enterprises::ApiKey.create!(
      organization: organization,
      requested_by: user,
      name: "Approved integration",
      scopes: ["missions:read"],
      requested_at: Time.current,
      status: "requested"
    )
    admin = User.create!(
      email: "admin-#{SecureRandom.hex(5)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!",
      jti: SecureRandom.uuid,
      user_type: "enterprise",
      platform_role: "admin",
      status: "active"
    )
    key.approve!(admin)

    post "/api/v1/enterprise/api_keys/#{key.id}/activate", headers: headers_for(user, organization)

    expect(response).to have_http_status(:created)
    expect(JSON.parse(response.body).dig("data", "secret")).to start_with("dh_live_")
    expect(key.reload).to be_active
    expect(key.token_digest).to be_present
  end
end
