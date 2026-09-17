# frozen_string_literal: true

class EnableExtensions < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")
    enable_extension "citext" unless extension_enabled?("citext")
    begin
      enable_extension "postgis" unless extension_enabled?("postgis")
    rescue StandardError => e
      warn "PostGIS extension not available on this PostgreSQL instance (#{e.message}). Falling back to JSON geometry."
    end
    enable_extension "pg_trgm" unless extension_enabled?("pg_trgm")
  end
end
