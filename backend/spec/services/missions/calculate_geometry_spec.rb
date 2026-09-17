# frozen_string_literal: true

require "rails_helper"

RSpec.describe Missions::CalculateGeometry, type: :service do
  let(:valid_polygon_geojson) do
    {
      "type" => "Polygon",
      "coordinates" => [
        [
          [-47.8827, -15.7938],
          [-47.8800, -15.7938],
          [-47.8800, -15.7900],
          [-47.8827, -15.7900],
          [-47.8827, -15.7938]
        ]
      ]
    }
  end

  let(:valid_multipolygon_geojson) do
    {
      "type" => "MultiPolygon",
      "coordinates" => [
        [
          [
            [-47.8827, -15.7938],
            [-47.8800, -15.7938],
            [-47.8800, -15.7900],
            [-47.8827, -15.7900],
            [-47.8827, -15.7938]
          ]
        ]
      ]
    }
  end

  describe ".call" do
    it "successfully computes area and centroid for valid Polygon in test env" do
      result = described_class.call(geojson: valid_polygon_geojson)

      expect(result.success?).to be true
      expect(result.area_hectares).to be_present
      expect(result.area_hectares).to be > 0
      expect(result.geometry_wkt).to start_with("MULTIPOLYGON(((-47.8827 -15.7938")
      expect(result.centroid_wkt).to be_present
      expect(result.errors).to be_empty
    end

    it "successfully computes area for valid MultiPolygon in test env" do
      result = described_class.call(geojson: valid_multipolygon_geojson)

      expect(result.success?).to be true
      expect(result.area_hectares).to be_present
      expect(result.area_hectares).to be > 0
    end

    it "fails when geometry is missing" do
      result = described_class.call(geojson: nil)

      expect(result.success?).to be false
      expect(result.errors).to include("geometry is required")
    end

    it "fails when GeoJSON type is unsupported" do
      result = described_class.call(geojson: { "type" => "Point", "coordinates" => [-47.88, -15.79] })

      expect(result.success?).to be false
      expect(result.errors).to include("GeoJSON type must be Polygon or MultiPolygon")
    end

    it "fails with domain error in production when PostGIS is unavailable (no bounding-box fallback)" do
      allow(Rails.env).to receive(:test?).and_return(false)
      allow(Rails.env).to receive(:development?).and_return(false)
      allow_any_instance_of(described_class).to receive(:postgis_available?).and_return(false)

      result = described_class.call(geojson: valid_polygon_geojson)

      expect(result.success?).to be false
      expect(result.errors).to include("could not compute area")
    end

    it "logs error and returns nil when PostGIS availability check raises exception" do
      allow(ActiveRecord::Base.connection).to receive(:select_value).and_raise(StandardError.new("Connection timeout"))

      expect(Rails.logger).to receive(:error).with(/PostGIS availability check failed/)

      instance = described_class.new(geojson: valid_polygon_geojson)
      expect(instance.send(:postgis_available?)).to be false
    end

    it "fails with domain error and logs when area calculation query raises exception in production" do
      allow(Rails.env).to receive(:test?).and_return(false)
      allow(Rails.env).to receive(:development?).and_return(false)
      allow_any_instance_of(described_class).to receive(:postgis_available?).and_return(true)
      allow(ActiveRecord::Base.connection).to receive(:exec_query).and_raise(ActiveRecord::StatementInvalid.new("DB error"))

      expect(Rails.logger).to receive(:error).with(/Error calculating area via PostGIS/)

      result = described_class.call(geojson: valid_polygon_geojson)
      expect(result.success?).to be false
      expect(result.errors).to include("could not compute area")
    end

    it "returns nil centroid in production when PostGIS is unavailable (fail-closed)" do
      allow(Rails.env).to receive(:test?).and_return(false)
      allow(Rails.env).to receive(:development?).and_return(false)
      allow_any_instance_of(described_class).to receive(:postgis_available?).and_return(false)

      instance = described_class.new(geojson: valid_polygon_geojson)
      expect(instance.send(:compute_centroid_wkt, "MULTIPOLYGON(((0 0, 1 0, 1 1, 0 0)))")).to be_nil
    end
  end
end
