# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Deliverables API", type: :request do
  let(:secret) { ENV.fetch("JWT_SECRET", "dronehub-mvp-dev-secret-change-me") }

  def make_jwt(user)
    payload = { sub: user.id, jti: user.jti, type: "access", exp: 1.hour.from_now.to_i }
    body = Base64.urlsafe_encode64(payload.to_json)
    sig = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", secret, body))
    "#{body}.#{sig}"
  end

  let!(:user) do
    User.create!(
      email: "deliv.client@dronehub.com.br",
      encrypted_password: "sha256:#{Digest::SHA256.hexdigest('pass')}",
      jti: SecureRandom.uuid, platform_role: "user", status: "active"
    )
  end

  let!(:org) do
    Organization.create!(
      name: "Agro Deliv", slug: "agro-deliv", organization_type: "customer", country_code: "BR", status: "active"
    )
  end

  let!(:membership) do
    OrganizationMembership.create!(organization: org, user: user, role: "owner", status: "active", joined_at: Time.current)
  end

  let!(:project) do
    Projects::Project.create!(organization: org, created_by: user, name: "P1", status: "active")
  end

  let!(:mission) do
    Missions::Mission.create!(
      organization: org, project: project, created_by: user,
      title: "M1", mission_type: "mapping", status: "review", currency: "BRL"
    )
  end

  let!(:deliverable) do
    Deliverables::Deliverable.create!(
      mission_id: mission.id,
      title: "Ortomosaico RGB Final",
      status: "uploaded",
      version: 1,
      storage_key: "missions/#{mission.id}/ortho.tif",
      file_size_bytes: 104857600
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

  describe "GET /api/v1/missions/:mission_id/deliverables" do
    it "lists deliverables of the mission" do
      get "/api/v1/missions/#{mission.id}/deliverables", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["data"]).to be_an(Array)
      expect(body["data"].first["id"]).to eq(deliverable.id)
    end
  end

  describe "POST /api/v1/deliverables/:id/approve" do
    it "approves the deliverable" do
      post "/api/v1/deliverables/#{deliverable.id}/approve", headers: headers

      expect(response).to have_http_status(:ok)
      expect(deliverable.reload.status).to eq("approved")
    end
  end

  describe "POST /api/v1/deliverables/:id/reject" do
    it "rejects deliverable with reason" do
      params = { reason: "GSD fora da especificação contratada" }
      post "/api/v1/deliverables/#{deliverable.id}/reject", params: params.to_json, headers: headers

      expect(response).to have_http_status(:ok)
      expect(deliverable.reload.status).to eq("rejected")
    end
  end
end
