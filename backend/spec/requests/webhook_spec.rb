# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Stripe Webhook API", type: :request do
  describe "POST /api/v1/webhooks/stripe" do
    let(:payload) { { id: "evt_test", type: "payment_intent.succeeded" }.to_json }

    it "rejects requests when webhook secret is missing or stripe disabled" do
      post "/api/v1/webhooks/stripe", params: payload, headers: {
        "HTTP_STRIPE_SIGNATURE" => "invalid_sig",
        "Content-Type" => "application/json"
      }

      expect(response).to have_http_status(:service_unavailable)
    end

    context "when Stripe is configured" do
      before do
        allow(Integrations::Stripe::Config).to receive(:enabled?).and_return(true)
        allow(Integrations::Stripe::Config).to receive(:webhook_secret).and_return("whsec_test_secret")
        allow(Integrations::Stripe::Config).to receive(:configure!).and_return(true)
      end

      it "returns bad_request on invalid signature" do
        post "/api/v1/webhooks/stripe", params: payload, headers: {
          "HTTP_STRIPE_SIGNATURE" => "bad_signature",
          "Content-Type" => "application/json"
        }

        expect(response).to have_http_status(:bad_request)
        body = JSON.parse(response.body)
        expect(body["error"]).to eq("invalid_signature")
      end

      it "processes payment_intent.succeeded when signature is valid" do
        require "stripe"
        fake_event = double("Stripe::Event", type: "payment_intent.succeeded")
        allow(::Stripe::Webhook).to receive(:construct_event).and_return(fake_event)
        allow(Payments::ApplyStripeEvent).to receive(:call).with(fake_event).and_return({ applied: true, event_type: "payment_intent.succeeded" })

        post "/api/v1/webhooks/stripe", params: payload, headers: {
          "HTTP_STRIPE_SIGNATURE" => "valid_sig",
          "Content-Type" => "application/json"
        }

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["received"]).to eq(true)
      end
    end
  end
end
