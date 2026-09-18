# frozen_string_literal: true

require "test_helper"

class TelemetryCollectorTest < ActiveJob::TestCase
  def setup
    @organization = Organization.create!(
      name: "Collector Test Org",
      slug: "collector-test-#{SecureRandom.hex(4)}",
      organization_type: "customer",
      country_code: "BR",
      status: "active"
    )
  end

  test "tracks synchronous telemetry event directly" do
    assert_difference -> { TelemetryEvent.count }, 1 do
      Telemetry::Collector.track(
        "mission.created",
        organization: @organization,
        properties: { "source_page" => "dashboard", "password" => "hidden" },
        async: false
      )
    end

    event = TelemetryEvent.last
    assert_equal "mission.created", event.event_name
    assert_equal @organization.id, event.organization_id
    assert_equal "dashboard", event.properties["source_page"]
    assert_nil event.properties["password"]
  end

  test "enqueues async job when async is true" do
    original_adapter = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    begin
      assert_enqueued_with(job: Telemetry::IngestEventJob) do
        Telemetry::Collector.track(
          "mission.published",
          organization: @organization,
          properties: { "mission_type" => "solar_inspection" },
          async: true
        )
      end
    ensure
      ActiveJob::Base.queue_adapter = original_adapter
    end
  end

  test "prevents duplicate ingestion when request_id is reused" do
    req_id = "req_unique_#{SecureRandom.hex(6)}"

    Telemetry::Collector.track(
      "mission.created",
      organization: @organization,
      request_id: req_id,
      async: false
    )

    # Second dispatch with identical request_id should not fail and should not create duplicate
    assert_no_difference -> { TelemetryEvent.count } do
      Telemetry::Collector.track(
        "mission.created",
        organization: @organization,
        request_id: req_id,
        async: false
      )
    end
  end
end
