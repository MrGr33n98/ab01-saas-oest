# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Mission Geometry API", type: :request do
  let(:secret) { ENV.fetch("JWT_SECRET", "dronehub-mvp-dev-secret-change-me") }

  def make_jwt(user)
    payload = { sub: user.id, jti: user.jti, type: "access", exp: 1.hour.from_now.to_i }
    body = Base64.urlsafe_encode64(payload.to_json)
    sig = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", secret, body))
    "#{body}.#{sig}"
  end

  let!(:user) do
    User.create!(
      email: "geom.client@dronehub.com.br",
      password: "Password123!",
      user_type: "enterprise",
      jti: SecureRandom.uuid,
      platform_role: "user",
      status: "active"
    )
  end

  let!(:org) do
    Organization.create!(
      name: "Agro Geo Tech",
      slug: "agro-geo-tech",
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
      organization: org, created_by: user, name: "Projeto Mapeamento 2026", status: "active"
    )
  end

  let!(:mission) do
    Missions::Mission.create!(
      organization: org, project: project, created_by: user,
      title: "Mapeamento Lavoura Soja", mission_type: "mapping", status: "draft", currency: "BRL"
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

  describe "POST /api/v1/missions/:mission_id/geometry" do
    let(:valid_polygon_geojson) do
      {
        type: "Polygon",
        coordinates: [
          [
            [-47.8827, -15.7938],
            [-47.8800, -15.7938],
            [-47.8800, -15.7900],
            [-47.8827, -15.7900],
            [-47.8827, -15.7938]
          ]
        ]
      }
    end

    let(:valid_multipolygon_geojson) do
      {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [-47.8827, -15.7938],
              [-47.8800, -15.7938],
              [-47.8800, -15.7900],
              [-47.8827, -15.7900],
              [-47.8827, -15.7938]
            ]
          ]
        ]
      }
    end

    it "sets mission geometry successfully with valid GeoJSON Polygon" do
      post "/api/v1/missions/#{mission.id}/geometry",
           params: { geometry: valid_polygon_geojson }.to_json,
           headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig("data", "id")).to eq(mission.id)
      expect(body.dig("data", "area_hectares")).to be_present
      expect(body.dig("data", "area_hectares").to_f).to be > 0
    end

    it "sets mission geometry successfully with valid GeoJSON MultiPolygon" do
      post "/api/v1/missions/#{mission.id}/geometry",
           params: { geometry: valid_multipolygon_geojson }.to_json,
           headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig("data", "id")).to eq(mission.id)
    end

    it "rejects coordinates containing invalid non-numeric string" do
      invalid_geojson = {
        type: "Polygon",
        coordinates: [
          [
            [-47.8827, -15.7938],
            ["malicious_string", -15.7938],
            [-47.8800, -15.7900],
            [-47.8827, -15.7938]
          ]
        ]
      }

      post "/api/v1/missions/#{mission.id}/geometry",
           params: { geometry: invalid_geojson }.to_json,
           headers: headers

      expect(response).to have_http_status(:bad_request)
    end

    it "rejects coordinates containing nil" do
      invalid_geojson = {
        type: "Polygon",
        coordinates: [
          [
            [-47.8827, -15.7938],
            [nil, -15.7938],
            [-47.8800, -15.7900],
            [-47.8827, -15.7938]
          ]
        ]
      }

      post "/api/v1/missions/#{mission.id}/geometry",
           params: { geometry: invalid_geojson }.to_json,
           headers: headers

      expect(response).to have_http_status(:bad_request)
    end

    it "rejects coordinates containing NaN or Infinity string representations" do
      invalid_geojson = {
        type: "Polygon",
        coordinates: [
          [
            [-47.8827, -15.7938],
            ["NaN", -15.7938],
            [-47.8800, -15.7900],
            [-47.8827, -15.7938]
          ]
        ]
      }

      post "/api/v1/missions/#{mission.id}/geometry",
           params: { geometry: invalid_geojson }.to_json,
           headers: headers

      expect(response).to have_http_status(:bad_request)
    end

    it "rejects latitude out of bounds (> 90)" do
      invalid_geojson = {
        type: "Polygon",
        coordinates: [
          [
            [-47.8827, 95.0],
            [-47.8800, 95.0],
            [-47.8800, 90.0],
            [-47.8827, 95.0]
          ]
        ]
      }

      post "/api/v1/missions/#{mission.id}/geometry",
           params: { geometry: invalid_geojson }.to_json,
           headers: headers

      expect(response).to have_http_status(:bad_request)
    end

    it "rejects longitude out of bounds (< -180)" do
      invalid_geojson = {
        type: "Polygon",
        coordinates: [
          [
            [-185.0, -15.7938],
            [-180.0, -15.7938],
            [-180.0, -15.7900],
            [-185.0, -15.7938]
          ]
        ]
      }

      post "/api/v1/missions/#{mission.id}/geometry",
           params: { geometry: invalid_geojson }.to_json,
           headers: headers

      expect(response).to have_http_status(:bad_request)
    end

    it "rejects open LinearRing (first position != last position)" do
      open_ring_geojson = {
        type: "Polygon",
        coordinates: [
          [
            [-47.8827, -15.7938],
            [-47.8800, -15.7938],
            [-47.8800, -15.7900],
            [-47.8827, -15.7800] # different from start
          ]
        ]
      }

      post "/api/v1/missions/#{mission.id}/geometry",
           params: { geometry: open_ring_geojson }.to_json,
           headers: headers

      expect(response).to have_http_status(:bad_request)
    end

    it "rejects short LinearRing with fewer than 4 positions" do
      short_ring_geojson = {
        type: "Polygon",
        coordinates: [
          [
            [-47.8827, -15.7938],
            [-47.8800, -15.7900],
            [-47.8827, -15.7938]
          ]
        ]
      }

      post "/api/v1/missions/#{mission.id}/geometry",
           params: { geometry: short_ring_geojson }.to_json,
           headers: headers

      expect(response).to have_http_status(:bad_request)
    end

    it "rejects missing geometry parameter" do
      post "/api/v1/missions/#{mission.id}/geometry",
           params: { invalid: "data" }.to_json,
           headers: headers

      expect(response).to have_http_status(:bad_request)
    end

    it "forbids access from user in different tenant organization" do
      other_org = Organization.create!(
        name: "Outra Empresa",
        slug: "outra-empresa",
        organization_type: "customer",
        country_code: "BR",
        status: "active"
      )
      other_user = User.create!(
        email: "other.user@dronehub.com.br",
        password: "Password123!",
        user_type: "enterprise",
        jti: SecureRandom.uuid,
        platform_role: "user",
        status: "active"
      )
      OrganizationMembership.create!(
        organization: other_org, user: other_user, role: "owner", status: "active", joined_at: Time.current
      )

      other_headers = {
        "Authorization" => "Bearer #{make_jwt(other_user)}",
        "X-Organization-Id" => other_org.id,
        "Content-Type" => "application/json",
        "Accept" => "application/json"
      }

      post "/api/v1/missions/#{mission.id}/geometry",
           params: { geometry: valid_polygon_geojson }.to_json,
           headers: other_headers

      expect(response).to have_http_status(:not_found).or have_http_status(:forbidden)
    end

    it "forbids access from member with viewer role" do
      viewer_user = User.create!(
        email: "viewer.user@dronehub.com.br",
        password: "Password123!",
        user_type: "enterprise",
        jti: SecureRandom.uuid,
        platform_role: "user",
        status: "active"
      )
      OrganizationMembership.create!(
        organization: org, user: viewer_user, role: "viewer", status: "active", joined_at: Time.current
      )

      viewer_headers = {
        "Authorization" => "Bearer #{make_jwt(viewer_user)}",
        "X-Organization-Id" => org.id,
        "Content-Type" => "application/json",
        "Accept" => "application/json"
      }

      post "/api/v1/missions/#{mission.id}/geometry",
           params: { geometry: valid_polygon_geojson }.to_json,
           headers: viewer_headers

      expect(response).to have_http_status(:forbidden)
    end
  end
end
