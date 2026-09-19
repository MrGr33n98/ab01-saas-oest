# frozen_string_literal: true

require "rails_helper"

RSpec.describe Telemetry::EventSchema do
  describe ".sanitize" do
    it "drops top-level PII while preserving allowed operational properties" do
      properties = described_class.sanitize(
        "mission.created",
        project_id: "project-123",
        mission_type: "solar_inspection",
        email: "pilot@example.com"
      )

      expect(properties).to eq("project_id" => "project-123", "mission_type" => "solar_inspection")
    end

    it "drops nested PII instead of retaining nested property bags" do
      properties = described_class.sanitize(
        "mission.created",
        project_id: { email: "pilot@example.com", id: "project-123" }
      )

      expect(properties).to eq({})
    end

    it "drops arrays, including arrays with nested PII" do
      properties = described_class.sanitize(
        "mission.created",
        mission_type: [{ phone: "+55 11 99999-9999" }]
      )

      expect(properties).to eq({})
    end

    it "drops tokens even when a producer attempts to pass them" do
      properties = described_class.sanitize(
        "mission.created",
        project_id: "project-123",
        authorization: "Bearer secret-token"
      )

      expect(properties).to eq("project_id" => "project-123")
    end

    it "drops fields that are not part of the event contract" do
      properties = described_class.sanitize(
        "mission.created",
        project_id: "project-123",
        unknown_dimension: "discarded"
      )

      expect(properties).to eq("project_id" => "project-123")
    end
  end
end
