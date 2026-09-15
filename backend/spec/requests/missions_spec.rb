# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Missions API", type: :request do
  let(:secret) { ENV.fetch("JWT_SECRET", "dronehub-mvp-dev-secret-change-me") }

  def make_jwt(user)
    payload = { sub: user.id, jti: user.jti, type: "access", exp: 1.hour.from_now.to_i }
    body = Base64.urlsafe_encode64(payload.to_json)
    sig = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", secret, body))
    "#{body}.#{sig}"
  end

  let!(:user) do
    User.create!(
      email: "mission.client@dronehub.com.br",
      encrypted_password: "sha256:#{Digest::SHA256.hexdigest('pass')}",
      jti: SecureRandom.uuid,
      platform_role: "user",
      status: "active"
    )
  end

  let!(:org) do
    Organization.create!(
      name: "Fazenda Santa Maria",
      slug: "fazenda-santa-maria",
      organization_type: "customer",
      country_code: "BR",
      status: "active"
    )
  end

  let!(:membership) do
    OrganizationMembership.create!(
      organization: org, user: user, role: "owner", status: "active", joined_at: Time.current
    )
  end

  let!(:project) do
    Projects::Project.create!(
      organization: org, created_by: user, name: "Safra 2026", status: "active"
    )
  end

  let(:headers) do
    {
      "Authorization" => "Bearer #{make_jwt(user)}",
      "X-Organization-Id" => org.id,
      "Content-Type" => "application/json",
      "Accept" => "application/json"
    }
  end

  describe "POST /api/v1/missions" do
    it "creates a new draft mission" do
      params = {
        project_id: project.id,
        title: "Levantamento Topográfico Talhão 4",
        mission_type: "mapping",
        priority: "normal",
        deadline_at: 10.days.from_now.iso8601
      }

      post "/api/v1/missions", params: params.to_json, headers: headers

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body.dig("data", "title")).to eq("Levantamento Topográfico Talhão 4")
      expect(body.dig("data", "status")).to eq("draft")
    end
  end

  describe "GET /api/v1/missions" do
    before do
      Missions::Mission.create!(
        organization: org, project: project, created_by: user,
        title: "Missão Existente", mission_type: "mapping", status: "draft", currency: "BRL"
      )
    end

    it "lists organization missions" do
      get "/api/v1/missions", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["data"]).to be_an(Array)
      expect(body["data"].length).to be >= 1
    end
  end
end
