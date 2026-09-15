# frozen_string_literal: true

module Api
  module V1
    class MissionProductsController < BaseController
      def create
        mission = TenantScope.find!(Missions::Mission, params[:mission_id], organization: current_organization)
        authorize authorize_context, mission, :update?

        product = Marketplace::DataProduct.find(params.require(:data_product_id))
        mp = Missions::MissionProduct.find_or_initialize_by(mission_id: mission.id, data_product_id: product.id)
        mp.organization_id = current_organization.id
        mp.quantity = params[:quantity] || 1
        mp.save!

        render_data({
          mission_id: mission.id,
          data_product_id: product.id,
          quantity: mp.quantity
        }, status: :created)
      end

      def destroy
        mission = TenantScope.find!(Missions::Mission, params[:mission_id], organization: current_organization)
        authorize authorize_context, mission, :update?
        Missions::MissionProduct.where(mission_id: mission.id, data_product_id: params[:id]).delete_all
        head :no_content
      end
    end
  end
end
