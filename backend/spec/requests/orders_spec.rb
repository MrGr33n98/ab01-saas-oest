# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Orders API", type: :request do
  let(:secret) { ENV.fetch("JWT_SECRET", "dronehub-mvp-dev-secret-change-me") }

  def make_jwt(user)
    payload = { sub: user.id, jti: user.jti, type: "access", exp: 1.hour.from_now.to_i }
    body = Base64.urlsafe_encode64(payload.to_json)
    sig = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", secret, body))
    "#{body}.#{sig}"
  end

  let!(:user) do
    User.create!(
      email: "order.client@dronehub.com.br",
      password: "Password123!", password_confirmation: "Password123!",
      jti: SecureRandom.uuid, platform_role: "user", status: "active"
    )
  end

  let!(:org) do
    Organization.create!(
      name: "Agro Teste", slug: "agro-teste", organization_type: "customer", country_code: "BR", status: "active"
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
      title: "M1", mission_type: "mapping", status: "scheduled", currency: "BRL"
    )
  end

  let!(:operator_profile) do
    Operators::OperatorProfile.create!(
      organization: org,
      slug: "order-operator-#{SecureRandom.hex(4)}",
      verification_status: "verified",
      accepting_jobs: true
    )
  end

  let!(:quote) do
    Quotes::Quote.create!(
      mission: mission,
      customer_organization: org,
      operator_organization: org,
      operator_profile: operator_profile,
      submitted_by: user,
      status: "accepted",
      currency: "BRL"
    )
  end

  let!(:order) do
    Orders::Order.create!(
      mission_id: mission.id,
      quote: quote,
      customer_organization_id: org.id,
      operator_organization_id: org.id,
      status: "pending_payment",
      subtotal: 2000,
      marketplace_fee: 200,
      operator_amount: 1800,
      taxes: 0,
      total: 2000,
      currency: "BRL"
    )
  end

  let(:headers) do
    {
      "Authorization" => "Bearer #{make_jwt(user)}",
      "X-Organization-Id" => org.id,
      "Accept" => "application/json"
    }
  end

  describe "GET /api/v1/orders" do
    it "lists tenant orders" do
      get "/api/v1/orders", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["data"]).to be_an(Array)
      expect(body["data"].first["id"]).to eq(order.id)
    end
  end

  describe "GET /api/v1/orders/:id" do
    it "returns specific order details" do
      get "/api/v1/orders/#{order.id}", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig("data", "id")).to eq(order.id)
      expect(body.dig("data", "total")).to eq("2000.0").or eq(2000.0)
    end
  end
end
