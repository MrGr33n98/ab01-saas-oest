# frozen_string_literal: true

if defined?(Pagy)
  # Standardize API pagination defaults
  Pagy::DEFAULT[:page] = 1
  Pagy::DEFAULT[:limit] = 20
  Pagy::DEFAULT[:max_limit] = 100
  Pagy::DEFAULT[:overflow] = :empty_page

  # Require Pagy extras if needed
  require "pagy/extras/overflow" if defined?(Pagy::DEFAULT)
  require "pagy/extras/metadata" if defined?(Pagy::DEFAULT)
end
