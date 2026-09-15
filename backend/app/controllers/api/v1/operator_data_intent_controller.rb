# frozen_string_literal: true

module Api
  module V1
    class OperatorDataIntentController < BaseController
      skip_before_action :authenticate_user!, only: %i[public_config calculate submit_inquiry]
      skip_before_action :resolve_organization!, only: %i[public_config calculate submit_inquiry]
      before_action :ensure_operator!, only: %i[show_config update_config list_inquiries update_inquiry]

      # GET /api/v1/operators/:slug/data_intent_config (Public)
      def public_config
        profile = Operators::OperatorProfile.find_by!(slug: params[:slug])
        config = profile.data_intent_config || profile.create_data_intent_config!
        render json: {
          data: {
            wizard_enabled: config.wizard_enabled,
            headline: config.headline,
            min_base_price: config.min_base_price,
            price_per_hectare_rgb: config.price_per_hectare_rgb,
            price_per_hectare_multispectral: config.price_per_hectare_multispectral,
            price_per_hectare_lidar: config.price_per_hectare_lidar,
            thermal_asset_base_price: config.thermal_asset_base_price,
            typical_delivery_days: config.typical_delivery_days,
            operator: {
              slug: profile.slug,
              name: profile.display_name,
              city: profile.organization&.city,
              state_code: profile.organization&.state_code
            }
          }
        }
      end

      # POST /api/v1/operators/:slug/calculate_intent (Public)
      def calculate
        profile = Operators::OperatorProfile.find_by!(slug: params[:slug])
        config = profile.data_intent_config || profile.create_data_intent_config!

        service_type = params[:service_type].to_s
        area_ha = params[:area_hectares].to_f

        estimate = config.calculate_estimate(service_type: service_type, area_ha: area_ha)
        render json: {
          data: {
            service_type: service_type,
            area_hectares: area_ha,
            estimated_min_price: estimate[:min_price],
            estimated_max_price: estimate[:max_price],
            estimated_days: estimate[:estimated_days],
            currency: "BRL"
          }
        }
      end

      # POST /api/v1/operators/:slug/inquiries (Public)
      def submit_inquiry
        profile = Operators::OperatorProfile.find_by!(slug: params[:slug])
        config = profile.data_intent_config || profile.create_data_intent_config!

        estimate = config.calculate_estimate(
          service_type: params[:service_type],
          area_ha: params[:estimated_area_ha]
        )

        inquiry = profile.lead_inquiries.build(
          contact_name: params[:contact_name],
          contact_email: params[:contact_email],
          contact_phone: params[:contact_phone],
          service_type: params[:service_type],
          city: params[:city],
          state_code: params[:state_code],
          estimated_area_ha: params[:estimated_area_ha],
          calculated_min_price: estimate[:min_price],
          calculated_max_price: estimate[:max_price],
          notes: params[:notes],
          status: "pending_response"
        )

        if inquiry.save
          render json: {
            data: {
              inquiry_id: inquiry.id,
              status: inquiry.status,
              estimated_min_price: inquiry.calculated_min_price,
              estimated_max_price: inquiry.calculated_max_price
            }
          }, status: :created
        else
          render_error(status: 422, code: "UNPROCESSABLE", title: inquiry.errors.full_messages.join(", "))
        end
      end

      # GET /api/v1/operator/data_intent_config (Operator Dashboard)
      def show_config
        config = current_operator_profile.data_intent_config || current_operator_profile.create_data_intent_config!
        render json: { data: config }
      end

      # PUT /api/v1/operator/data_intent_config (Operator Dashboard)
      def update_config
        config = current_operator_profile.data_intent_config || current_operator_profile.create_data_intent_config!
        if config.update(config_params)
          render json: { data: config }
        else
          render_error(status: 422, code: "UNPROCESSABLE", title: config.errors.full_messages.join(", "))
        end
      end

      # GET /api/v1/operator/lead_inquiries (Operator Dashboard)
      def list_inquiries
        inquiries = current_operator_profile.lead_inquiries.recent
        render json: { data: inquiries }
      end

      # PATCH /api/v1/operator/lead_inquiries/:id (Operator Dashboard)
      def update_inquiry
        inquiry = current_operator_profile.lead_inquiries.find(params[:id])
        if inquiry.update(params.require(:lead_inquiry).permit(:status, :notes))
          render json: { data: inquiry }
        else
          render_error(status: 422, code: "UNPROCESSABLE", title: inquiry.errors.full_messages.join(", "))
        end
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

      def config_params
        params.require(:data_intent_config).permit(
          :wizard_enabled, :headline, :min_base_price, :price_per_hectare_rgb,
          :price_per_hectare_multispectral, :price_per_hectare_lidar,
          :thermal_asset_base_price, :typical_delivery_days
        )
      end
    end
  end
end
