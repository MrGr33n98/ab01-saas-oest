# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Operator Follows API", type: :request do
  let(:secret) { ENV.fetch("JWT_SECRET", "dronehub-mvp-dev-secret-change-me") }

  def make_jwt(user)
    payload = { sub: user.id, jti: user.jti, type: "access", exp: 1.hour.from_now.to_i }
    body = Base64.urlsafe_encode64(payload.to_json)
    sig = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", secret, body))
    "#{body}.#{sig}"
  end

  let!(:client_user) do
    User.create!(
      email: "follow.client@dronehub.com.br",
      encrypted_password: "sha256:#{Digest::SHA256.hexdigest('pass')}",
      jti: SecureRandom.uuid, platform_role: "user", status: "active"
    )
  end

  let!(:client_org) do
    Organization.create!(
      name: "Agro Cerrado", slug: "agro-cerrado", organization_type: "customer", country_code: "BR", status: "active"
    )
  end

  let!(:client_membership) do
    OrganizationMembership.create!(organization: client_org, user: client_user, role: "owner", status: "active", joined_at: Time.current)
  end

  let!(:op_user) do
    User.create!(
      email: "follow.operator@dronehub.com.br",
      encrypted_password: "sha256:#{Digest::SHA256.hexdigest('pass')}",
      jti: SecureRandom.uuid, platform_role: "user", status: "active"
    )
  end

  let!(:op_org) do
    Organization.create!(
      name: "AeroVoo MT", slug: "aerovoo-mt", organization_type: "drone_operator", country_code: "BR", status: "active"
    )
  end

  let!(:op_membership) do
    OrganizationMembership.create!(organization: op_org, user: op_user, role: "owner", status: "active", joined_at: Time.current)
  end

  let!(:operator_profile) do
    Operators::OperatorProfile.create!(
      organization: op_org, slug: "aerovoo-mt", verification_status: "verified",
      accepting_jobs: true, searchable: true, headline: "Especialista em Mapeamento"
    )
  end

  describe "POST /api/v1/operators/:slug/follow" do
    it "follows an operator profile successfully" do
      post "/api/v1/operators/aerovoo-mt/follow",
           headers: {
             "Authorization" => "Bearer #{make_jwt(client_user)}",
             "X-Organization-Id" => client_org.id
           }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["following"]).to eq(true)
      expect(json["data"]["operator_slug"]).to eq("aerovoo-mt")
      expect(client_org.following?(operator_profile)).to be(true)
    end

    it "prevents an operator organization from following its own profile" do
      post "/api/v1/operators/aerovoo-mt/follow",
           headers: {
             "Authorization" => "Bearer #{make_jwt(op_user)}",
             "X-Organization-Id" => op_org.id
           }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "DELETE /api/v1/operators/:slug/unfollow" do
    before do
      OrganizationFollow.create!(
        follower_organization: client_org,
        followed_operator_profile: operator_profile
      )
    end

    it "unfollows the operator successfully" do
      delete "/api/v1/operators/aerovoo-mt/unfollow",
             headers: {
               "Authorization" => "Bearer #{make_jwt(client_user)}",
               "X-Organization-Id" => client_org.id
             }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["following"]).to eq(false)
      expect(client_org.following?(operator_profile)).to be(false)
    end
  end

  describe "GET /api/v1/app/favorites/operators" do
    before do
      OrganizationFollow.create!(
        follower_organization: client_org,
        followed_operator_profile: operator_profile
      )
    end

    it "lists favorite operators for the organization" do
      get "/api/v1/app/favorites/operators",
          headers: {
            "Authorization" => "Bearer #{make_jwt(client_user)}",
            "X-Organization-Id" => client_org.id
          }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"].length).to eq(1)
      expect(json["data"].first["operator"]["slug"]).to eq("aerovoo-mt")
    end
  end
end
