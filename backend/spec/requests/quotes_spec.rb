# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Quotes API", type: :request do
  let(:secret) { ENV.fetch("JWT_SECRET", "dronehub-mvp-dev-secret-change-me") }

  def make_jwt(user)
    payload = { sub: user.id, jti: user.jti, type: "access", exp: 1.hour.from_now.to_i }
    body = Base64.urlsafe_encode64(payload.to_json)
    sig = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", secret, body))
    "#{body}.#{sig}"
  end

  let!(:client_user) do
    User.create!(
      email: "quote.client@dronehub.com.br",
      encrypted_password: "sha256:#{Digest::SHA256.hexdigest('pass')}",
      jti: SecureRandom.uuid, platform_role: "user", status: "active"
    )
  end

  let!(:client_org) do
    Organization.create!(
      name: "Agro Sol", slug: "agro-sol", organization_type: "customer", country_code: "BR", status: "active"
    )
  end

  let!(:client_membership) do
    OrganizationMembership.create!(organization: client_org, user: client_user, role: "owner", status: "active", joined_at: Time.current)
  end

  let!(:project) do
    Projects::Project.create!(organization: client_org, created_by: client_user, name: "P1", status: "active")
  end

  let!(:mission) do
    Missions::Mission.create!(
      organization: client_org, project: project, created_by: client_user,
      title: "Mapeamento 500ha", mission_type: "mapping", status: "quoting", currency: "BRL"
    )
  end

  let!(:operator_user) do
    User.create!(
      email: "quote.operator@dronehub.com.br",
      encrypted_password: "sha256:#{Digest::SHA256.hexdigest('pass')}",
      jti: SecureRandom.uuid, platform_role: "user", status: "active"
    )
  end

  let!(:operator_org) do
    Organization.create!(
      name: "Drones Brasil", slug: "drones-brasil", organization_type: "drone_operator", country_code: "BR", status: "active"
    )
  end

  let!(:operator_membership) do
    OrganizationMembership.create!(organization: operator_org, user: operator_user, role: "owner", status: "active", joined_at: Time.current)
  end

  let!(:operator_profile) do
    Operators::OperatorProfile.create!(
      organization: operator_org, slug: "drones-brasil", verification_status: "verified", accepting_jobs: true
    )
  end

  describe "POST /api/v1/missions/:mission_id/quotes" do
    let(:op_headers) do
      {
        "Authorization" => "Bearer #{make_jwt(operator_user)}",
        "X-Organization-Id" => operator_org.id,
        "Content-Type" => "application/json",
        "Accept" => "application/json"
      }
    end

    it "creates a quote for the mission" do
      params = {
        proposal_text: "Executamos em 2 dias úteis com sensor RTK e GSD 2.5cm",
        currency: "BRL"
      }

      post "/api/v1/missions/#{mission.id}/quotes", params: params.to_json, headers: op_headers

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body.dig("data", "mission_id")).to eq(mission.id)
      expect(body.dig("data", "status")).to eq("draft")
    end
  end

  describe "GET /api/v1/missions/:mission_id/quote-comparison" do
    let(:client_headers) do
      {
        "Authorization" => "Bearer #{make_jwt(client_user)}",
        "X-Organization-Id" => client_org.id,
        "Accept" => "application/json"
      }
    end

    before do
      Quotes::Quote.create!(
        mission: mission,
        customer_organization_id: client_org.id,
        operator_organization_id: operator_org.id,
        operator_profile: operator_profile,
        submitted_by: operator_user,
        status: "submitted",
        subtotal: 5000,
        platform_fee: 500,
        taxes: 0,
        total: 5500,
        currency: "BRL"
      )
    end

    it "returns side-by-side comparison payload for the client" do
      get "/api/v1/missions/#{mission.id}/quote-comparison", headers: client_headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig("data", "quotes")).to be_an(Array)
      expect(body.dig("data", "quotes", 0, "total")).to eq(5500.0)
    end
  end
end
