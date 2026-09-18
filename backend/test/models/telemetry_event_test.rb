# frozen_string_literal: true

require "test_helper"

class TelemetryEventTest < ActiveSupport::TestCase
  def setup
    @organization = Organization.create!(
      name: "Acme Telemetry Test",
      slug: "acme-telemetry-test-#{SecureRandom.hex(4)}",
      organization_type: "customer",
      country_code: "BR",
      status: "active"
    )
  end

  test "creates valid telemetry event" do
    event = TelemetryEvent.create!(
      organization: @organization,
      event_name: "mission.created",
      source: "web",
      occurred_at: Time.current,
      received_at: Time.current,
      properties: { "test_key" => "test_val" }
    )

    assert event.persisted?
    assert_equal @organization.id, event.organization_id
    assert_equal "mission.created", event.event_name
  end

  test "enforces required validations" do
    event = TelemetryEvent.new(source: nil)
    assert_not event.valid?
    assert_includes event.errors[:event_name], "can't be blank"
    assert_includes event.errors[:occurred_at], "can't be blank"
    assert_includes event.errors[:received_at], "can't be blank"
    assert_includes event.errors[:source], "can't be blank"
  end

  test "recognizes taxonomic events" do
    assert TelemetryEvent.valid_event?("mission.created")
    assert TelemetryEvent.valid_event?("order.completed")
    assert_not TelemetryEvent.valid_event?("nonexistent.fake_metric")
  end
end
