# frozen_string_literal: true

module Api
  module V1
    module Operator
      class BaseController < Api::V1::BaseController
        before_action -> { require_tenant_context!("operator") }
      end
    end
  end
end
