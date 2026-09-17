# frozen_string_literal: true

require "rails_helper"

RSpec.describe Operators::Onboarding::UpsertSection do
  it "rejects a section outside the published onboarding contract" do
    profile = instance_double(Operators::OperatorProfile)

    result = described_class.new(profile: profile, section: "unknown", attributes: {}).call

    expect(result).to be_failure
    expect(result.errors).to include("Unknown onboarding section")
  end
end
