# frozen_string_literal: true

module Api
  module V1
    module Operator
      class MaterialsController < BaseController
        before_action :require_materials_feature!, only: %i[create update destroy]
        before_action :load_profile

        def index
          mats = @profile.operator_materials.order(:position)
          render json: { data: mats.map { |m| serialize(m) } }
        end

        def create
          mat = @profile.operator_materials.create!(
            material_params.merge(organization_id: current_organization.id)
          )
          render json: { data: serialize(mat) }, status: :created
        end

        def update
          mat = @profile.operator_materials.find(params[:id])
          mat.update!(material_params)
          render json: { data: serialize(mat) }
        end

        def destroy
          mat = @profile.operator_materials.find(params[:id])
          mat.destroy!
          head :no_content
        end

        private

        def load_profile
          @profile = Operators::OperatorProfile.find_by!(organization_id: current_organization.id)
        end

        def require_materials_feature!
          return if Entitlements::Resolver.enabled?(current_organization, "profile.materials")

          render json: {
            title: "Upgrade required",
            detail: "Materiais baixáveis exigem plano Pro+",
            status: 402,
            code: "FEATURE_REQUIRED",
            feature: "profile.materials"
          }, status: 402
        end

        def material_params
          params.require(:material).permit(:title, :description, :file_url, :file_name, :content_type, :byte_size, :position, :published)
        end

        def serialize(m)
          {
            id: m.id,
            title: m.title,
            description: m.description,
            file_url: m.file_url,
            file_name: m.file_name,
            published: m.published,
            position: m.position
          }
        end
      end
    end
  end
end
