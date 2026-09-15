# frozen_string_literal: true

module Api
  module V1
    class OperatorPortfolioController < BaseController
      skip_before_action :authenticate_user!, only: %i[public_index]
      skip_before_action :resolve_organization!, only: %i[public_index]
      before_action :ensure_operator!, only: %i[index create update destroy]
      before_action :set_portfolio_item, only: %i[update destroy]

      # GET /api/v1/operators/:slug/portfolio (Public)
      def public_index
        profile = Operators::OperatorProfile.find_by!(slug: params[:slug])
        items = profile.portfolio_items.ordered
        items = items.by_category(params[:category_id]) if params[:category_id].present?
        items = items.where(item_type: params[:item_type]) if params[:item_type].present?

        render json: { data: PortfolioItemSerializer.new(items).serializable_hash }
      end

      # GET /api/v1/operator/portfolio (Operator Dashboard)
      def index
        items = current_operator_profile.portfolio_items.ordered
        render json: { data: PortfolioItemSerializer.new(items).serializable_hash }
      end

      # POST /api/v1/operator/portfolio
      def create
        item = current_operator_profile.portfolio_items.build(portfolio_params)
        if item.save
          render json: { data: PortfolioItemSerializer.new(item).serializable_hash }, status: :created
        else
          render_error(status: 422, code: "UNPROCESSABLE", title: item.errors.full_messages.join(", "))
        end
      end

      # PATCH /api/v1/operator/portfolio/:id
      def update
        if @portfolio_item.update(portfolio_params)
          render json: { data: PortfolioItemSerializer.new(@portfolio_item).serializable_hash }
        else
          render_error(status: 422, code: "UNPROCESSABLE", title: @portfolio_item.errors.full_messages.join(", "))
        end
      end

      # DELETE /api/v1/operator/portfolio/:id
      def destroy
        @portfolio_item.destroy
        render json: { data: { success: true, id: params[:id] } }
      end

      private

      def ensure_operator!
        unless current_organization.operator? && current_operator_profile
          render_error(status: 403, code: "OPERATOR_PROFILE_REQUIRED", title: "Operator profile required")
        end
      end

      def current_operator_profile
        @current_operator_profile ||= current_organization.operator_profile
      end

      def set_portfolio_item
        @portfolio_item = current_operator_profile.portfolio_items.find(params[:id])
      end

      def portfolio_params
        params.require(:portfolio_item).permit(
          :title, :description, :item_type, :service_category_id,
          :location_city, :location_state, :area_hectares, :position, :featured,
          media_assets: %i[url type caption gsd_cm sensor],
          before_after_assets: %i[before_url after_url before_label after_label]
        )
      end
    end
  end
end
