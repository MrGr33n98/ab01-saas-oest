# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Operator Portfolio API", type: :request do
  let(:secret) { ENV.fetch("JWT_SECRET", "dronehub-mvp-dev-secret-change-me") }

  def make_jwt(user)
    payload = { sub: user.id, jti: user.jti, type: "access", exp: 1.hour.from_now.to_i }
    body = Base64.urlsafe_encode64(payload.to_json)
    sig = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", secret, body))
    "#{body}.#{sig}"
  end

  let!(:op_user) do
    User.create!(
      email: "portfolio.op@dronehub.com.br",
      encrypted_password: "sha256:#{Digest::SHA256.hexdigest('pass')}",
      jti: SecureRandom.uuid, platform_role: "user", status: "active"
    )
  end

  let!(:op_org) do
    Organization.create!(
      name: "Topocart MT", slug: "topocart-mt", organization_type: "drone_operator", country_code: "BR", status: "active"
    )
  end

  let!(:op_membership) do
    OrganizationMembership.create!(organization: op_org, user: op_user, role: "owner", status: "active", joined_at: Time.current)
  end

  let!(:operator_profile) do
    Operators::OperatorProfile.create!(
      organization: op_org, slug: "topocart-mt", verification_status: "verified",
      accepting_jobs: true, searchable: true, headline: "Topografia com Drones"
    )
  end

  describe "POST /api/v1/operator/portfolio" do
    it "creates a portfolio item successfully" do
      post "/api/v1/operator/portfolio",
           params: {
             portfolio_item: {
               title: "Levantamento Usina Solar 50MW",
               description: "Mapeamento termográfico e ortomosaico de alta acurácia",
               item_type: "before_after",
               before_after_assets: {
                 before_url: "https://example.com/raw.jpg",
                 after_url: "https://example.com/ortho.jpg",
                 before_label: "Terreno Bruto",
                 after_label: "Ortomosaico Processado"
               },
               location_city: "Cuiabá",
               location_state: "MT",
               area_hectares: 120.5,
               featured: true
             }
           },
           headers: {
             "Authorization" => "Bearer #{make_jwt(op_user)}",
             "X-Organization-Id" => op_org.id
           }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["title"]).to eq("Levantamento Usina Solar 50MW")
      expect(json["data"]["item_type"]).to eq("before_after")
      expect(operator_profile.portfolio_items.count).to eq(1)
    end
  end

  describe "GET /api/v1/operators/:slug/portfolio (Public)" do
    before do
      operator_profile.portfolio_items.create!(
        title: "Levantamento Fazenda Modelo",
        item_type: "gallery",
        media_assets: [{ url: "https://example.com/photo1.jpg", caption: "Voo com Matrice 350" }],
        location_city: "Sorriso",
        location_state: "MT"
      )
    end

    it "lists public portfolio items without authentication" do
      get "/api/v1/operators/topocart-mt/portfolio"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"].length).to eq(1)
      expect(json["data"].first["title"]).to eq("Levantamento Fazenda Modelo")
    end
  end
end
