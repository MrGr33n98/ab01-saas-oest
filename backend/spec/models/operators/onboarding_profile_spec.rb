# frozen_string_literal: true

require "rails_helper"

RSpec.describe Operators::OnboardingProfile, type: :model do
  it "only marks a section complete after its minimum contract is fulfilled" do
    record = described_class.new(
      contact_data: { "full_name" => "Ana Silva", "country_code" => "BR" }
    )

    expect(record.section_complete?("address")).to be(false)

    record.contact_data = record.contact_data.merge(
      "company_address" => "Av. Brasil, 100",
      "city" => "Cuiabá",
      "phone_e164" => "+5565999990101",
      "max_travel_distance_km" => 200
    )

    expect(record.section_complete?("address")).to be(true)
  end

  it "derives progress from the six workflow sections instead of trusting client input" do
    record = described_class.new(
      contact_data: described_class::SECTION_DEFAULTS.fetch("address"),
      equipment_data: described_class::SECTION_DEFAULTS.fetch("equipment"),
      business_data: described_class::SECTION_DEFAULTS.fetch("business"),
      experience_data: described_class::SECTION_DEFAULTS.fetch("experience"),
      documents_data: described_class::SECTION_DEFAULTS.fetch("documents"),
      pricing_data: described_class::SECTION_DEFAULTS.fetch("pricing")
    )

    expect(record.completion_percentage).to eq(0)
    expect(record.completed_sections).to eq([])
  end
end
