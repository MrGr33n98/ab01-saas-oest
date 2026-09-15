# frozen_string_literal: true

class EnableExtensions < ActiveRecord::Migration[7.2]
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")
    enable_extension "citext" unless extension_enabled?("citext")
    enable_extension "postgis" unless extension_enabled?("postgis")
    enable_extension "pg_trgm" unless extension_enabled?("pg_trgm")
  end
end
