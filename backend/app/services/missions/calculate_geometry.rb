# frozen_string_literal: true

module Missions
  class CalculateGeometry
    Result = Struct.new(:success?, :geometry_wkt, :area_hectares, :centroid_wkt, :errors, keyword_init: true)

    def self.call(geojson:)
      new(geojson: geojson).call
    end

    def initialize(geojson:)
      @geojson = geojson
    end

    def call
      return failure("geometry is required") if geojson.blank?

      type = geojson["type"] || geojson[:type]
      coords = geojson["coordinates"] || geojson[:coordinates]
      return failure("GeoJSON type must be Polygon or MultiPolygon") unless type.in?(%w[Polygon MultiPolygon])
      return failure("coordinates required") if coords.blank?

      # Normalize to MultiPolygon for storage
      wkt = to_multipolygon_wkt(type, coords)
      return failure("invalid coordinates") if wkt.nil?

      area_m2 = compute_area_m2(wkt)
      return failure("could not compute area") if area_m2.nil?

      area_ha = (area_m2 / 10_000.0).round(4)
      return failure("area must be greater than zero") if area_ha <= 0

      centroid = compute_centroid_wkt(wkt)

      Result.new(
        success?: true,
        geometry_wkt: wkt,
        area_hectares: area_ha,
        centroid_wkt: centroid,
        errors: []
      )
    rescue StandardError => e
      failure(e.message)
    end

    private

    attr_reader :geojson

    def failure(msg)
      Result.new(success?: false, geometry_wkt: nil, area_hectares: nil, centroid_wkt: nil, errors: [msg])
    end

    def to_multipolygon_wkt(type, coordinates)
      if type == "Polygon"
        ring_wkts = coordinates.map { |ring| "(#{ring_to_wkt(ring)})" }.join(", ")
        "MULTIPOLYGON((#{ring_wkts}))"
      else
        polys = coordinates.map do |poly|
          ring_wkts = poly.map { |ring| "(#{ring_to_wkt(ring)})" }.join(", ")
          "(#{ring_wkts})"
        end.join(", ")
        "MULTIPOLYGON(#{polys})"
      end
    end

    def ring_to_wkt(ring)
      ring.map { |pair| "#{pair[0]} #{pair[1]}" }.join(", ")
    end

    def compute_area_m2(wkt)
      if postgis_available?
        sql = ActiveRecord::Base.sanitize_sql_array([
          "SELECT ST_Area(ST_GeogFromText(?)) AS area",
          wkt
        ])
        result = ActiveRecord::Base.connection.exec_query(sql)
        area = result.first&.fetch("area")&.to_f
        return area if area.present? && area > 0
      end

      # Fallback aproximado de bounding box é restrito EXCLUSIVAMENTE a development/test
      if Rails.env.test? || Rails.env.development?
        Rails.logger.warn("Calculating approximate bounding-box area in #{Rails.env} mode")
        fallback_area_m2(wkt)
      else
        Rails.logger.error("Spatial calculation engine (PostGIS) unavailable in production")
        nil
      end
    rescue StandardError => e
      Rails.logger.error("Error calculating area via PostGIS: #{e.message}")
      Sentry.capture_exception(e) if defined?(Sentry) && Sentry.respond_to?(:initialized?) && Sentry.initialized?
      if Rails.env.test? || Rails.env.development?
        fallback_area_m2(wkt)
      else
        nil
      end
    end

    def compute_centroid_wkt(wkt)
      if postgis_available?
        sql = ActiveRecord::Base.sanitize_sql_array([
          "SELECT ST_AsText(ST_Centroid(ST_GeogFromText(?)::geometry)) AS c",
          wkt
        ])
        result = ActiveRecord::Base.connection.exec_query(sql)
        centroid = result.first&.fetch("c")
        return centroid if centroid.present?
      end

      # Em produção: fail-closed se PostGIS estiver indisponível
      if Rails.env.test? || Rails.env.development?
        approximate_centroid_from_wkt(wkt)
      else
        Rails.logger.error("Centroid calculation engine (PostGIS) unavailable in production")
        nil
      end
    rescue StandardError => e
      Rails.logger.error("Error calculating centroid via PostGIS: #{e.message}")
      Sentry.capture_exception(e) if defined?(Sentry) && Sentry.respond_to?(:initialized?) && Sentry.initialized?
      if Rails.env.test? || Rails.env.development?
        approximate_centroid_from_wkt(wkt)
      else
        nil
      end
    end

    def postgis_available?
      @postgis_available ||= begin
        res = ActiveRecord::Base.connection.select_value("SELECT 1 FROM pg_extension WHERE extname = 'postgis'")
        res.present?
      rescue StandardError => e
        Rails.logger.error("PostGIS availability check failed: #{e.message}")
        Sentry.capture_exception(e) if defined?(Sentry) && Sentry.respond_to?(:initialized?) && Sentry.initialized?
        false
      end
    end

    def fallback_area_m2(wkt)
      approximate_area_ha_from_wkt(wkt)&.then { |ha| ha * 10_000.0 }
    end

    def approximate_area_ha_from_wkt(wkt)
      # Very rough bbox estimate strictly for offline/dev without PostGIS
      nums = wkt.scan(/-?\d+\.?\d*/).map(&:to_f)
      return nil if nums.size < 4
      lons = nums.each_slice(2).map(&:first)
      lats = nums.each_slice(2).map(&:last)
      width_km = (lons.max - lons.min).abs * 111.0
      height_km = (lats.max - lats.min).abs * 111.0
      (width_km * height_km * 100.0).round(4) # km² * 100 = ha
    end

    def approximate_centroid_from_wkt(wkt)
      nums = wkt.scan(/-?\d+\.?\d*/).map(&:to_f)
      return nil if nums.size < 4
      lons = nums.each_slice(2).map(&:first)
      lats = nums.each_slice(2).map(&:last)
      avg_lon = (lons.sum / lons.size.to_f).round(6)
      avg_lat = (lats.sum / lats.size.to_f).round(6)
      "POINT(#{avg_lon} #{avg_lat})"
    end
  end
end
