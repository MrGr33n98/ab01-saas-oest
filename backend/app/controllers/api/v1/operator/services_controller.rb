# frozen_string_literal: true

module Api
  module V1
    module Operator
      class ServicesController < BaseController
        def index
          profile = Operators::OperatorProfile.find_by(organization_id: current_organization.id)
          return render json: { data: [] } unless profile

          offerings = Marketplace::ServiceOffering.where(operator_profile_id: profile.id, active: true)
          render json: {
            data: offerings.map { |o|
              {
                id: o.id,
                title: o.title,
                pricing_model: o.pricing_model,
                price_from: o.price_from,
                currency: o.currency,
                active: o.active
              }
            }
          }
        end

        def create
          profile = Operators::OperatorProfile.find_by!(organization_id: current_organization.id)
          offering = Marketplace::ServiceOffering.new(
            service_params.merge(
              operator_profile_id: profile.id,
              active: true,
              currency: service_params[:currency].presence || "BRL"
            )
          )
          if offering.save
            render json: { data: { id: offering.id, title: offering.title } }, status: :created
          else
            render json: { title: "Validation", detail: offering.errors.full_messages.join(", "), status: 422 }, status: 422
          end
        end

        def update
          profile = Operators::OperatorProfile.find_by!(organization_id: current_organization.id)
          offering = Marketplace::ServiceOffering.find_by!(id: params[:id], operator_profile_id: profile.id)
          if offering.update(service_params)
            render json: { data: { id: offering.id, title: offering.title, active: offering.active } }
          else
            render json: { title: "Validation", detail: offering.errors.full_messages.join(", "), status: 422 }, status: 422
          end
        end

        def destroy
          profile = Operators::OperatorProfile.find_by!(organization_id: current_organization.id)
          offering = Marketplace::ServiceOffering.find_by!(id: params[:id], operator_profile_id: profile.id)
          offering.destroy!
          render json: { data: { id: offering.id, message: "Serviço removido" } }
        end

        private

        def service_params
          params.require(:service).permit(:title, :description, :pricing_model, :price_from, :currency, :service_category_id)
        end
      end
    end
  end
end
