# frozen_string_literal: true

require "rails_helper"

RSpec.describe WebhookEndpoint, type: :model do
  let(:organization) do
    Organization.create!(
      name: "Test Org",
      slug: "test-org-#{SecureRandom.hex(4)}",
      country_code: "BR",
      organization_type: "customer",
      status: "active"
    )
  end

  subject do
    described_class.new(
      organization: organization,
      url: "https://example.com/webhooks",
      events: ["order.created", "mission.completed"]
    )
  end

  describe "validations" do
    it "is valid with valid attributes" do
      expect(subject).to be_valid
    end

    it "generates a secret key on creation" do
      subject.save!
      expect(subject.secret_key).to start_with("whsec_")
    end

    it "requires a valid URL" do
      subject.url = "invalid-url"
      expect(subject).not_to be_valid
      expect(subject.errors[:url]).to be_present
    end

    it "validates events against supported events" do
      subject.events = ["invalid.event"]
      expect(subject).not_to be_valid
      expect(subject.errors[:events]).to be_present
    end

    it "accepts wildcard event" do
      subject.events = ["*"]
      expect(subject).to be_valid
    end
  end

  describe "associations" do
    it "belongs to organization" do
      expect(subject.organization).to eq(organization)
    end
  end

  describe "lifecycle methods" do
    it "disables and enables the endpoint" do
      subject.save!
      expect(subject.active?).to be true

      subject.disable!
      expect(subject.reload.status).to eq("disabled")
      expect(subject.disabled_at).to be_present

      subject.enable!
      expect(subject.reload.status).to eq("active")
      expect(subject.disabled_at).to be_nil
    end
  end
end
