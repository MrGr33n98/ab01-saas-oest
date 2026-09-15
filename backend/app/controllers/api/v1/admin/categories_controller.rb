# frozen_string_literal: true

module Api
  module V1
    module Admin
      class CategoriesController < BaseController
        include AdminAuthorization
        before_action :require_platform_admin!

        def index
          categories = ::Marketplace::ServiceCategory.ordered
          render_data(categories.map { |c| serialize(c) })
        end

        def create
          category = ::Marketplace::ServiceCategory.new(category_params)
          if category.save
            render_data(serialize(category), status: :created)
          else
            render_error(status: 422, code: "VALIDATION", title: "Invalid", errors: category.errors.full_messages.map { |m| { message: m } })
          end
        end

        def update
          category = ::Marketplace::ServiceCategory.find(params[:id])
          if category.update(category_params)
            render_data(serialize(category))
          else
            render_error(status: 422, code: "VALIDATION", title: "Invalid", detail: category.errors.full_messages.join(", "))
          end
        end

        def destroy
          category = ::Marketplace::ServiceCategory.find(params[:id])
          category.update!(active: false)
          render_data({ id: category.id, active: false })
        end

        private
        # require_platform_admin! from AdminAuthorization

        def category_params
          params.permit(:name, :slug, :description, :icon_key, :parent_id, :active, :position)
        end

        def serialize(c)
          {
            id: c.id,
            slug: c.slug,
            name: c.name,
            description: c.description,
            icon_key: c.icon_key,
            parent_id: c.parent_id,
            active: c.active,
            position: c.position
          }
        end
      end
    end
  end
end
