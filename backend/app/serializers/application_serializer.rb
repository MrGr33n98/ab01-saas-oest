# frozen_string_literal: true

class ApplicationSerializer
  include Alba::Resource

  transform_keys :lower_camel
end
