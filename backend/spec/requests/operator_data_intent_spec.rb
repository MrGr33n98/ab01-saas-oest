# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Operator Data Intent API", type: :request do
  let!(:op_org) do
    Organization.create!(
      name: "GeoAgro Sinop", slug: "geoagro-sinop", organization_type: "drone_operator", country_code: "BR", status: "active"
    )
  end

  let!(:operator_profile) do
    Operators::OperatorProfile.create!(
      organization: op_org, slug: "geoagro-sinop", verification_status: "verified",
      accepting_jobs: true, searchable: true, headline: "Agrimensura & Mapeamento"
    )
  end

  let!(:config) do
    operator_profile.create_data_intent_config!(
      min_base_price: 1200.00,
      price_per_hectare_rgb: 20.00,
      price_per_hectare_multispectral: 40.00,
      typical_delivery_days: 4
    )
  end

  describe "POST /api/v1/operators/:slug/calculate_intent" do
    it "calculates instant price range correctly for area" do
      post "/api/v1/operators/geoagro-sinop/calculate_intent",
           params: {
             service_type: "multispectral",
             area_hectares: 100
           }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      # Base: 1200 + (100 * 40) = 5200 min, 5200 * 1.20 = 6240 max
      expect(json["data"]["estimated_min_price"].to_f).to eq(5200.00)
      expect(json["data"]["estimated_max_price"].to_f).to eq(6240.00)
      expect(json["data"]["estimated_days"]).to eq(4)
    end
  end

  describe "POST /api/v1/operators/:slug/inquiries" do
    it "captures lead inquiry successfully" do
      post "/api/v1/operators/geoagro-sinop/inquiries",
           params: {
             contact_name: "Fazenda Progresso",
             contact_email: "contato@fazendaprogresso.com.br",
             contact_phone: "(66) 99999-8888",
             service_type: "rgb",
             city: "Sinop",
             state_code: "MT",
             estimated_area_ha: 250,
             notes: "Precisamos de ortomosaico antes do plantio."
           }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["status"]).to eq("pending_response")
      expect(operator_profile.lead_inquiries.count).to eq(1)
    end
  end
end
