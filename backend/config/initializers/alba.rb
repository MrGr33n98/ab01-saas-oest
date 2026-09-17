# frozen_string_literal: true

if defined?(Alba)
  Alba.backend = :oj if defined?(Oj)
  Alba.enable_inference!(with: :active_support)

  # Default key transformation: camelCase for Next.js frontend consumer
  Alba.transform_keys :lower_camel
end
