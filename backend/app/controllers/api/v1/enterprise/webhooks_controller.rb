# frozen_string_literal: true

module Api
  module V1
    module Enterprise
      class WebhooksController < BaseController
        before_action :require_enterprise_manager!, only: %i[create update destroy ping]
        before_action :set_webhook_endpoint, only: %i[show update destroy ping deliveries]

        # GET /api/v1/enterprise/webhooks
        def index
          endpoints = policy_scope(WebhookEndpoint).order(created_at: :desc)
          render json: {
            webhook_endpoints: endpoints.as_json(
              only: %i[id url description events status disabled_at last_successful_delivery_at last_failed_delivery_at created_at]
            )
          }
        end

        # GET /api/v1/enterprise/webhooks/:id
        def show
          authorize @webhook_endpoint
          render json: {
            webhook_endpoint: @webhook_endpoint.as_json(
              only: %i[id url description events status secret_key disabled_at last_successful_delivery_at last_failed_delivery_at created_at]
            )
          }
        end

        # POST /api/v1/enterprise/webhooks
        def create
          endpoint = current_organization.webhook_endpoints.new(webhook_params)
          endpoint.created_by = current_user
          authorize endpoint

          # Validação prévia de SSRF antes de salvar
          ssrf_check = Webhooks::SsrfValidatorService.validate(endpoint.url)
          unless ssrf_check[:valid]
            return render_error(
              status: 422,
              code: "INVALID_WEBHOOK_URL",
              title: ssrf_check[:reason]
            )
          end

          if endpoint.save
            render json: {
              webhook_endpoint: endpoint.as_json(
                only: %i[id url description events status secret_key created_at]
              )
            }, status: :created
          else
            render_validation_errors(endpoint)
          end
        end

        # PATCH/PUT /api/v1/enterprise/webhooks/:id
        def update
          authorize @webhook_endpoint
          if webhook_params[:url].present?
            ssrf_check = Webhooks::SsrfValidatorService.validate(webhook_params[:url])
            unless ssrf_check[:valid]
              return render_error(status: 422, code: "INVALID_WEBHOOK_URL", title: ssrf_check[:reason])
            end
          end

          if @webhook_endpoint.update(webhook_params)
            render json: {
              webhook_endpoint: @webhook_endpoint.as_json(
                only: %i[id url description events status last_successful_delivery_at last_failed_delivery_at updated_at]
              )
            }
          else
            render_validation_errors(@webhook_endpoint)
          end
        end

        # DELETE /api/v1/enterprise/webhooks/:id
        def destroy
          authorize @webhook_endpoint
          @webhook_endpoint.destroy!
          head :no_content
        end

        # POST /api/v1/enterprise/webhooks/:id/ping
        def ping
          authorize @webhook_endpoint, :ping?
          deliveries = Webhooks::DispatchService.publish(
            event_name: "ping",
            organization: current_organization,
            payload: { message: "Webhook ping test from DroneHub", pinged_at: Time.current.iso8601 }
          )

          render json: {
            success: true,
            deliveries: deliveries.map { |d| { id: d.id, status: d.status } }
          }
        end

        # GET /api/v1/enterprise/webhooks/:id/deliveries
        def deliveries
          authorize @webhook_endpoint, :show?
          deliveries = @webhook_endpoint.webhook_deliveries.recent.limit(50)
          render json: {
            deliveries: deliveries.as_json(
              only: %i[id event_type event_id status attempts_count created_at completed_at next_retry_at],
              include: {
                webhook_attempts: {
                  only: %i[attempt_number status response_status_code duration_ms error_class error_message attempted_at]
                }
              }
            )
          }
        end

        private

        def set_webhook_endpoint
          @webhook_endpoint = current_organization.webhook_endpoints.find(params[:id])
        end

        def webhook_params
          params.require(:webhook_endpoint).permit(:url, :description, :status, events: [])
        end
      end
    end
  end
end
