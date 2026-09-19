# frozen_string_literal: true

if defined?(Alba)
  Alba.backend = :oj if defined?(Oj)
  Alba.inflector = :active_support
end
