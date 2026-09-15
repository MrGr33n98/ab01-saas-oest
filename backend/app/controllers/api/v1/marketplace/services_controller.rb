# frozen_string_literal: true

module Api
  module V1
    module Marketplace
      class ServicesController < BaseController
        skip_before_action :resolve_organization!, only: %i[index show]
        skip_before_action :authenticate_user!, only: %i[index show]

        def index
          categories = ::Marketplace::ServiceCategory.active.ordered
          render_data(categories.map { |c| serialize_category(c) })
        end

        def show
          category = ::Marketplace::ServiceCategory.find_by!(slug: params[:id])
          render_data(serialize_category(category))
        end

        private

        def serialize_category(c)
          {
            id: c.id,
            slug: c.slug,
            name: c.name,
            description: c.description,
            icon_key: c.icon_key,
            parent_id: c.parent_id,
            position: c.position
          }
        end
      end
    end
  end
end
