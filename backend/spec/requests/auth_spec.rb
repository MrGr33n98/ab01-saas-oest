# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Auth API", type: :request do
  describe "POST /api/v1/auth/sign_up" do
    let(:valid_params) do
      {
        email: "novo.operador@dronehub.com.br",
        password: "securePassword123!",
        first_name: "Operador",
        last_name: "Piloto",
        organization_name: "Aero Agro Drones",
        organization_type: "drone_operator",
        profile_kind: "company",
        company_name: "Aero Agro Ltda",
        accepted_terms: true
      }
    end

    it "creates a new user and organization returning JWT tokens" do
      post "/api/v1/auth/sign_up", params: valid_params.to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body.dig("data", "user", "email")).to eq("novo.operador@dronehub.com.br")
      expect(body.dig("data", "tokens", "access_token")).to be_present
      expect(body.dig("data", "organization", "organization_type")).to eq("drone_operator")
    end

    it "rejects sign up if terms are not accepted" do
      post "/api/v1/auth/sign_up", params: valid_params.merge(accepted_terms: false).to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:bad_request)
      body = JSON.parse(response.body)
      expect(body["code"]).to eq("TERMS_REQUIRED")
    end

    it "rejects duplicate email" do
      post "/api/v1/auth/sign_up", params: valid_params.to_json, headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:created)

      post "/api/v1/auth/sign_up", params: valid_params.to_json, headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["code"]).to eq("EMAIL_TAKEN")
    end
  end

  describe "POST /api/v1/auth/sign_in" do
    let(:email) { "login.user@dronehub.com.br" }
    let(:password) { "myPassword123!" }

    before do
      post "/api/v1/auth/sign_up", params: {
        email: email,
        password: password,
        first_name: "Login",
        organization_name: "Login Org",
        accepted_terms: true
      }.to_json, headers: { "Content-Type" => "application/json" }
    end

    it "authenticates with valid credentials" do
      post "/api/v1/auth/sign_in", params: { email: email, password: password }.to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig("data", "tokens", "access_token")).to be_present
    end

    it "returns 401 with invalid password" do
      post "/api/v1/auth/sign_in", params: { email: email, password: "wrong" }.to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:unauthorized)
      body = JSON.parse(response.body)
      expect(body["code"]).to eq("INVALID_CREDENTIALS")
    end
  end

  describe "POST /api/v1/auth/password/forgot and reset" do
    it "accepts forgot password request without leaking email existence" do
      post "/api/v1/auth/password/forgot", params: { email: "nonexistent@dronehub.com.br" }.to_json, headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:accepted)
    end
  end
end
