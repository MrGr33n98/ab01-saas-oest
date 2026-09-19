# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Enterprise orders API", type: :request do
  def access_token_for(user)
    secret = ENV.fetch("JWT_SECRET", "dronehub-mvp-dev-secret-change-me")
    payload = { sub: user.id, jti: user.jti, type: "access", exp: 1.hour.from_now.to_i }
    body = Base64.urlsafe_encode64(payload.to_json)
    signature = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", secret, body))
    "#{body}.#{signature}"
  end

  def headers_for(user, organization, idempotency_key: nil)
    {
      "Authorization" => "Bearer #{access_token_for(user)}",
      "X-Organization-Id" => organization.id,
      "X-Request-Id" => SecureRandom.uuid,
      "Content-Type" => "application/json",
      "Idempotency-Key" => idempotency_key
    }.compact
  end

  def create_context!
    user = User.create!(
      email: "enterprise-order-#{SecureRandom.hex(6)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!",
      jti: SecureRandom.uuid,
      user_type: "enterprise",
      platform_role: "user",
      status: "active"
    )
    organization = Organization.create!(
      name: "Enterprise #{SecureRandom.hex(4)}",
      slug: "enterprise-#{SecureRandom.hex(6)}",
      organization_type: "enterprise",
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
    [user, organization]
  end

  def order_payload(order_name: "Solar mapping")
    {
      order_name: order_name,
      delivery_deadline: 3.days.from_now.iso8601,
      map_types: ["orthomosaic"],
      location_map: {
        type: "Polygon",
        coordinates: [[[-47.92, -15.78], [-47.91, -15.78], [-47.91, -15.79], [-47.92, -15.78]]]
      },
      specifications: { resolution_cm: 5 }
    }
  end

  def create_mission!(organization, user, status:)
    project = Projects::Project.create!(
      organization: organization,
      created_by: user,
      name: "Project #{SecureRandom.hex(4)}",
      status: "active"
    )
    Missions::Mission.create!(
      organization: organization,
      project: project,
      created_by: user,
      title: "Mission #{SecureRandom.hex(4)}",
      mission_type: "mapping",
      status: status,
      currency: "BRL"
    )
  end

  let(:endpoint) { "/api/v1/enterprise/orders" }
  let!(:context) { create_context! }
  let(:user) { context.first }
  let(:organization) { context.last }

  describe "POST /api/v1/enterprise/orders" do
    it "creates an order once and replays the stored response for the same request" do
      key = "order-create-#{SecureRandom.uuid}"
      payload = order_payload

      post endpoint, params: payload.to_json, headers: headers_for(user, organization, idempotency_key: key)
      expect(response).to have_http_status(:created)
      first_id = JSON.parse(response.body).dig("data", "id")

      post endpoint, params: payload.to_json, headers: headers_for(user, organization, idempotency_key: key)
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body).dig("data", "id")).to eq(first_id)
      expect(Missions::Mission.where(organization: organization).count).to eq(1)
      expect(IdempotencyKey.last.key).not_to eq(key)
    end

    it "rejects a reused key with a different payload" do
      key = "order-conflict-#{SecureRandom.uuid}"

      post endpoint, params: order_payload.to_json, headers: headers_for(user, organization, idempotency_key: key)
      expect(response).to have_http_status(:created)

      post endpoint, params: order_payload(order_name: "Different mission").to_json,
           headers: headers_for(user, organization, idempotency_key: key)
      expect(response).to have_http_status(:conflict)
      expect(JSON.parse(response.body).fetch("code")).to eq("IDEMPOTENCY_KEY_CONFLICT")
    end

    it "isolates identical keys between tenants" do
      key = "shared-key-#{SecureRandom.uuid}"
      other_user, other_organization = create_context!

      post endpoint, params: order_payload.to_json, headers: headers_for(user, organization, idempotency_key: key)
      expect(response).to have_http_status(:created)

      post endpoint, params: order_payload.to_json, headers: headers_for(other_user, other_organization, idempotency_key: key)
      expect(response).to have_http_status(:created)
      expect(Missions::Mission.where(organization: organization).count).to eq(1)
      expect(Missions::Mission.where(organization: other_organization).count).to eq(1)
    end

    it "rolls back the mission and idempotency record when creation fails" do
      key = "order-failure-#{SecureRandom.uuid}"
      allow(Missions::MissionStatusEvent).to receive(:create!).and_raise(ActiveRecord::RecordInvalid.new(Missions::MissionStatusEvent.new))

      post endpoint, params: order_payload.to_json, headers: headers_for(user, organization, idempotency_key: key)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(Missions::Mission.where(organization: organization)).to be_empty
      expect(IdempotencyKey.where(organization: organization)).to be_empty
    end

    it "creates one logical order for concurrent retries", :non_transactional do
      key = "order-concurrent-#{SecureRandom.uuid}"
      payload = order_payload
      responses = Queue.new
      ready = Queue.new
      start = Queue.new

      threads = 2.times.map do
        Thread.new do
          ready << true
          start.pop
          session = ActionDispatch::Integration::Session.new(Rails.application)
          session.post(endpoint, params: payload.to_json, headers: headers_for(user, organization, idempotency_key: key))
          responses << [session.response.status, JSON.parse(session.response.body).dig("data", "id")]
        end
      end
      2.times { ready.pop }
      2.times { start << true }
      threads.each(&:join)

      results = 2.times.map { responses.pop }
      expect(results.map(&:first)).to all(eq(201))
      expect(results.map(&:last).uniq).to have_attributes(length: 1)
      expect(Missions::Mission.where(organization: organization).count).to eq(1)
    end
  end

  describe "POST /api/v1/enterprise/orders/:id/cancel" do
    %w[draft planning published].each do |status|
      it "records #{status} as the previous status" do
        mission = create_mission!(organization, user, status: status)

        post "#{endpoint}/#{mission.id}/cancel", headers: headers_for(user, organization)

        expect(response).to have_http_status(:ok)
        expect(mission.reload.status).to eq("cancelled")
        event = Missions::MissionStatusEvent.order(created_at: :desc).first
        expect(event).to have_attributes(mission_id: mission.id, from_status: status, to_status: "cancelled")
      end
    end

    %w[completed cancelled].each do |status|
      it "does not cancel #{status} orders" do
        mission = create_mission!(organization, user, status: status)

        post "#{endpoint}/#{mission.id}/cancel", headers: headers_for(user, organization)

        expect(response).to have_http_status(:unprocessable_entity)
        expect(mission.reload.status).to eq(status)
      end
    end

    it "rolls back the cancellation when status event persistence fails" do
      mission = create_mission!(organization, user, status: "published")
      allow(Missions::MissionStatusEvent).to receive(:create!).and_raise(ActiveRecord::RecordInvalid.new(Missions::MissionStatusEvent.new))

      post "#{endpoint}/#{mission.id}/cancel", headers: headers_for(user, organization)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(mission.reload.status).to eq("published")
    end
  end
end
