# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Operator vertical", type: :request do
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

  def operator_context!
    user = User.create!(
      email: "operator-#{SecureRandom.hex(6)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!",
      jti: SecureRandom.uuid,
      user_type: "operator",
      platform_role: "user",
      status: "active"
    )
    organization = Organization.create!(
      name: "Geo Operator",
      slug: "geo-operator-#{SecureRandom.hex(6)}",
      organization_type: "drone_operator",
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
    profile = Operators::OperatorProfile.create!(
      organization: organization,
      slug: "geo-profile-#{SecureRandom.hex(6)}",
      verification_status: "pending",
      accepting_jobs: true,
      searchable: true
    )

    [user, organization, profile]
  end

  it "keeps the operator onboarding in independent, resumable sections" do
    user, organization, profile = operator_context!

    patch "/api/v1/operator/onboarding/address", params: {
      full_name: "Ana Silva",
      company_address: "Av. Brasil, 100",
      country_code: "BR",
      state_code: "MT",
      city: "Cuiabá",
      available_countries: ["BR"],
      phone_e164: "+5565999990101",
      postal_code: "78000-000",
      max_travel_distance_km: 250
    }.to_json, headers: headers_for(user, organization)

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body.dig("data", "sections", "address", "complete")).to be(true)
    expect(profile.reload.operator_onboarding_profile.contact_data).to include("city" => "Cuiabá")

    get "/api/v1/operator/onboarding", headers: headers_for(user, organization)

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body).dig("data", "completed_sections")).to include("address")
  end

  it "redacts bank account input while retaining only payout display metadata" do
    user, organization, = operator_context!

    patch "/api/v1/operator/payout_profile", params: {
      account_kind: "business",
      billing: {
        legal_name: "Geo Operator Ltda",
        billing_email: "financeiro@geo.example",
        address: { country_code: "BR", city: "Cuiabá", postal_code: "78000-000" }
      },
      bank_account: {
        account_holder_name: "Geo Operator Ltda",
        account_number: "1234567890",
        bank_name: "Banco Teste",
        swift_bic: "TESTBRSP"
      }
    }.to_json, headers: headers_for(user, organization)

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body.dig("data", "bank_account_last4")).to eq("7890")
    expect(body.to_s).not_to include("1234567890")
    expect(Operators::PayoutProfile.last.bank_account_last4).to eq("7890")
  end

  it "lets an operator accept an invite once and exposes it in the operator feed" do
    user, organization, profile = operator_context!
    customer = Organization.create!(
      name: "Cliente Rural",
      slug: "cliente-rural-#{SecureRandom.hex(6)}",
      organization_type: "enterprise",
      country_code: "BR",
      status: "active"
    )
    project = Projects::Project.create!(
      organization: customer,
      created_by: user,
      name: "Safra 2026",
      status: "active"
    )
    mission = Missions::Mission.create!(
      organization: customer,
      project: project,
      created_by: user,
      title: "Mapeamento de lavoura",
      mission_type: "mapping",
      status: "published",
      currency: "BRL"
    )
    invite = Operators::MissionInvite.create!(
      mission: mission,
      operator_profile: profile,
      invited_by: user,
      status: "pending",
      expires_at: 7.days.from_now
    )

    get "/api/v1/operator/invites", headers: headers_for(user, organization)

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body).dig("data", 0, "id")).to eq(invite.id)

    post "/api/v1/operator/invites/#{invite.id}/accept", headers: headers_for(user, organization)

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body).dig("data", "status")).to eq("accepted")
    expect(invite.reload.status).to eq("accepted")
  end

  it "rejects an enterprise context from every operator-only endpoint" do
    user = User.create!(
      email: "enterprise-#{SecureRandom.hex(6)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!",
      jti: SecureRandom.uuid,
      user_type: "enterprise",
      platform_role: "user",
      status: "active"
    )
    organization = Organization.create!(
      name: "Empresa",
      slug: "empresa-#{SecureRandom.hex(6)}",
      organization_type: "enterprise",
      country_code: "BR",
      status: "active"
    )
    OrganizationMembership.create!(organization: organization, user: user, role: "owner", status: "active", joined_at: Time.current)

    get "/api/v1/operator/dashboard", headers: headers_for(user, organization)

    expect(response).to have_http_status(:forbidden)
    expect(JSON.parse(response.body).fetch("code")).to eq("TENANT_TYPE_FORBIDDEN")
  end
end
