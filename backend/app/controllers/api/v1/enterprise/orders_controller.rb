# frozen_string_literal: true

module Api
  module V1
    module Enterprise
      class OrdersController < BaseController
        before_action -> { require_api_scope!("orders:read") }, only: %i[index show delivery]
        before_action -> { require_api_scope!("missions:write") }, only: %i[create update cancel]
        before_action :set_order, only: %i[show update cancel delivery]

        # GET /api/v1/enterprise/orders
        def index
          scope = ::Missions::Mission.where(organization_id: current_organization.id).order(created_at: :desc)
          scope = scope.where(status: params[:status]) if params[:status].present?

          orders = scope.limit(params[:limit] || 30).offset(params[:offset] || 0)

          render_data(
            orders.map { |o| serialize_order_summary(o) },
            meta: {
              total_count: scope.count,
              limit: (params[:limit] || 30).to_i,
              offset: (params[:offset] || 0).to_i
            }
          )
        end

        # GET /api/v1/enterprise/orders/:id
        def show
          render_data(serialize_order_detail(@order))
        end

        # POST /api/v1/enterprise/orders
        def create
          request_payload = order_params.to_h
          idempotency_key = request.headers["Idempotency-Key"].to_s
          return render_error(status: 400, code: "IDEMPOTENCY_KEY_REQUIRED", title: "Idempotency-Key is required") if idempotency_key.blank?

          result = Idempotency::Request.new(
            organization: current_organization,
            identity: idempotency_identity,
            endpoint: "POST:/api/v1/enterprise/orders",
            key: idempotency_key,
            payload: request_payload
          ).call do
            mission = create_order!(order_params)
            [201, serialize_order_detail(mission)]
          end

          render_data(result.body, status: result.status)
        rescue Idempotency::Request::Conflict => e
          render_error(status: 409, code: "IDEMPOTENCY_KEY_CONFLICT", title: e.message)
        rescue Idempotency::Request::InProgress => e
          render_error(status: 409, code: "IDEMPOTENCY_REQUEST_IN_PROGRESS", title: e.message)
        rescue OrderValidationError => e
          render_error(status: 422, code: e.code, title: e.message)
        rescue ActiveRecord::RecordInvalid => e
          render_error(status: 422, code: "UNPROCESSABLE_ENTITY", title: "Failed to create order", detail: e.message)
        end

        # PATCH /api/v1/enterprise/orders/:id
        def update
          unless @order.status.in?(%w[draft planning published])
            return render_error(
              status: 422,
              code: "ORDER_LOCKED",
              title: "Order cannot be modified once capture or pilot assignment has begun"
            )
          end

          updates = {}
          updates[:description] = params[:description] if params[:description].present?

          if params[:delivery_deadline].present? || params[:deliveryDeadline].present?
            deadline_str = params[:delivery_deadline] || params[:deliveryDeadline]
            parsed = Time.zone.parse(deadline_str.to_s) rescue nil
            updates[:deadline_at] = parsed if parsed && parsed > Time.current
          end

          @order.update!(updates) if updates.any?

          render_data(serialize_order_detail(@order))
        end

        # POST /api/v1/enterprise/orders/:id/cancel
        def cancel
          if @order.status.in?(%w[completed cancelled])
            return render_error(
              status: 422,
              code: "CANNOT_CANCEL",
              title: "Order is already #{@order.status}"
            )
          end

          previous_status = @order.status
          ActiveRecord::Base.transaction do
            @order.update!(status: "cancelled")
            ::Missions::MissionStatusEvent.create!(
              mission_id: @order.id,
              actor_id: current_user.id,
              from_status: previous_status,
              to_status: "cancelled",
              note: params[:reason].presence || "Cancelled via Developer API"
            )
          end

          render_data(serialize_order_detail(@order))
        rescue ActiveRecord::RecordInvalid => e
          render_error(status: 422, code: "ORDER_CANCELLATION_FAILED", title: "Order cancellation failed", detail: e.message)
        end

        # GET /api/v1/enterprise/orders/:id/delivery
        def delivery
          deliverables = @order.deliverables.where(status: %w[approved published completed ready])
          
          items = if deliverables.exists?
                    deliverables.map do |d|
                      {
                        id: d.id,
                        name: d.title || d.file_name,
                        file_type: d.file_type || "raster_geotiff",
                        file_size_bytes: d.file_size_bytes,
                        checksum_sha256: d.checksum_sha256,
                        status: d.status,
                        download_url: d.download_url.presence || "https://storage.dronehub.local/deliverables/#{d.id}/download",
                        expires_at: 24.hours.from_now.iso8601
                      }
                    end
                  else
                    []
                  end

          render_data({
            order_id: @order.id,
            order_name: @order.title,
            status: @order.status,
            delivery_ready: @order.status == "completed",
            items: items,
            delivery_deadline: @order.deadline_at&.iso8601
          })
        end

        private

        class OrderValidationError < StandardError
          attr_reader :code

          def initialize(code:, message:)
            @code = code
            super(message)
          end
        end

        def create_order!(order_params)
          name = order_params[:order_name].presence || order_params[:orderName].presence
          deadline_raw = order_params[:delivery_deadline].presence || order_params[:deliveryDeadline].presence
          map_types = order_params[:map_types].presence || order_params[:mapTypes].presence || []
          location = order_params[:location_map].presence || order_params[:locationMap].presence
          description = order_params[:description].presence || ""
          specifications = order_params[:specifications].presence || {}

          raise OrderValidationError.new(code: "ORDER_NAME_REQUIRED", message: "orderName is required") if name.blank?
          raise OrderValidationError.new(code: "DEADLINE_REQUIRED", message: "deliveryDeadline is required") if deadline_raw.blank?
          raise OrderValidationError.new(code: "MAP_TYPES_REQUIRED", message: "At least one mapType is required") if map_types.empty?
          raise OrderValidationError.new(code: "LOCATION_MAP_REQUIRED", message: "locationMap coordinates polygon is required") if location.blank?

          deadline = Time.zone.parse(deadline_raw.to_s) rescue nil
          if deadline.nil? || deadline < Time.current
            raise OrderValidationError.new(code: "INVALID_DEADLINE", message: "deliveryDeadline must be a valid future ISO8601 timestamp")
          end

          geojson_geometry = normalize_geometry(location)
          estimated_area = calculate_polygon_area_ha(geojson_geometry)
          project = ::Projects::Project.find_or_create_by!(
            organization_id: current_organization.id,
            name: "API Data Orders"
          ) do |project_record|
            project_record.created_by = current_user
            project_record.description = "Pedidos e coletas automatizadas via Developer API"
            project_record.status = "active"
          end
          mission = ::Missions::Mission.create!(
            organization_id: current_organization.id,
            project_id: project.id,
            created_by: current_user,
            title: name.first(200),
            description: description,
            deadline_at: deadline,
            area_hectares: estimated_area,
            mission_type: "mapping",
            status: "published",
            visibility: "marketplace",
            priority: "normal",
            currency: "BRL",
            geometry: geojson_geometry,
            metadata: {
              api_order: true,
              order_name: name,
              map_types: map_types,
              specifications: specifications,
              estimated_area_hectares: estimated_area,
              created_via_api_key: current_api_key&.prefix
            }
          )

          map_types.each do |map_type|
            data_product = ::Marketplace::DataProduct.find_by(slug: normalize_product_slug(map_type))
            next unless data_product

            ::Missions::MissionProduct.find_or_create_by!(
              organization_id: current_organization.id,
              mission_id: mission.id,
              data_product_id: data_product.id
            ) do |mission_product|
              mission_product.quantity = [estimated_area.ceil, 1].max
              mission_product.specifications = specifications
            end
          end

          ::Missions::MissionStatusEvent.create!(
            mission_id: mission.id,
            actor_id: current_user.id,
            from_status: "draft",
            to_status: "published",
            note: "Order created via Developer API"
          )

          mission
        end

        def order_params
          params.permit(
            :order_name, :orderName,
            :delivery_deadline, :deliveryDeadline,
            :description,
            map_types: [],
            mapTypes: [],
            specifications: {},
            location_map: {},
            locationMap: {}
          )
        end

        def idempotency_identity
          return "api_key:#{current_api_key.id}" if current_api_key

          "user:#{current_user.id}"
        end

        def set_order
          @order = ::Missions::Mission.find_by(id: params[:id], organization_id: current_organization.id)
          return render_error(status: 404, code: "ORDER_NOT_FOUND", title: "Order not found") unless @order
        end

        def normalize_geometry(location)
          location = location.to_unsafe_h if location.respond_to?(:to_unsafe_h)

          if location.is_a?(Hash) && location["type"] == "Polygon"
            location
          elsif location.is_a?(Hash) && location["coordinates"].is_a?(Array)
            { "type" => "Polygon", "coordinates" => location["coordinates"] }
          elsif location.is_a?(Array)
            coords = location.map do |pt|
              if pt.is_a?(Array)
                [pt[1].to_f, pt[0].to_f] # [lng, lat]
              elsif pt.is_a?(Hash)
                lng = (pt["lng"] || pt[:lng] || pt["longitude"] || pt[:longitude]).to_f
                lat = (pt["lat"] || pt[:lat] || pt["latitude"] || pt[:latitude]).to_f
                [lng, lat]
              else
                [0.0, 0.0]
              end
            end
            coords << coords.first unless coords.first == coords.last
            { "type" => "Polygon", "coordinates" => [coords] }
          else
            { "type" => "Polygon", "coordinates" => [] }
          end
        end

        def calculate_polygon_area_ha(geom)
          coords = geom.dig("coordinates", 0) rescue nil
          return 10.0 if coords.blank? || coords.length < 3

          area = 0.0
          n = coords.length
          (0...(n - 1)).each do |i|
            area += (coords[i][0] * coords[i + 1][1]) - (coords[i + 1][0] * coords[i][1])
          end
          ha = (area.abs * 111_319.0 * 111_319.0 / 2.0 / 10_000.0).round(2)
          [ha, 1.0].max
        rescue StandardError
          10.0
        end

        def normalize_product_slug(map_type)
          case map_type.to_s.downcase.tr("_-", "")
          when "2dmap", "orthomosaic", "orthophoto", "2dorthomosaic" then "orthomosaic"
          when "3dmap", "pointcloud", "3dpointcloud" then "point-cloud"
          when "elevationmap", "dem" then "dsm"
          when "digitalterrainmodel", "dtm" then "dtm"
          when "digitalsurfacemodel", "dsm" then "dsm"
          when "topographicmap", "topography", "survey" then "dsm"
          when "thermalmap", "thermal" then "thermal"
          when "ndvi", "multispectral", "agriculture" then "ndvi"
          when "lidar" then "lidar"
          else "report"
          end
        end

        def serialize_order_summary(m)
          {
            id: m.id,
            order_name: m.title,
            status: m.status,
            delivery_deadline: m.deadline_at&.iso8601,
            map_types: m.metadata["map_types"] || [],
            estimated_area_hectares: (m.area_hectares || m.metadata["estimated_area_hectares"] || 10.0)&.to_f,
            created_at: m.created_at.iso8601,
            updated_at: m.updated_at.iso8601
          }
        end

        def serialize_order_detail(m)
          {
            id: m.id,
            order_name: m.title,
            status: m.status,
            delivery_deadline: m.deadline_at&.iso8601,
            description: m.description,
            map_types: m.metadata["map_types"] || [],
            location_map: m.geometry,
            specifications: m.metadata["specifications"] || {},
            estimated_area_hectares: (m.area_hectares || m.metadata["estimated_area_hectares"] || 10.0)&.to_f,
            quotes_count: m.quotes.count,
            created_at: m.created_at.iso8601,
            updated_at: m.updated_at.iso8601,
            deliverables_count: m.deliverables.count
          }
        end
      end
    end
  end
end
