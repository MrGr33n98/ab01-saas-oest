# frozen_string_literal: true

module Api
  module V1
    module Marketplace
      class DataProductsController < BaseController
        skip_before_action :resolve_organization!, only: %i[index show]
        skip_before_action :authenticate_user!, only: %i[index show]

        def index
          products = ::Marketplace::DataProduct.active.order(:name)
          render_data(products.map { |p| serialize(p) })
        end

        def show
          product = ::Marketplace::DataProduct.find_by!(slug: params[:id])
          render_data(serialize(product))
        end

        private

        def serialize(p)
          {
            id: p.id,
            slug: p.slug,
            name: p.name,
            description: p.description,
            product_type: p.product_type,
            default_unit: p.default_unit,
            processing_required: p.processing_required,
            preview_supported: p.preview_supported
          }
        end
      end
    end
  end
end
