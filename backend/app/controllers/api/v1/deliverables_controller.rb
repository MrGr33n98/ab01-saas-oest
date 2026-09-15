# frozen_string_literal: true

module Api
  module V1
    class DeliverablesController < BaseController
      def index
        mission = find_mission_flexible
        deliverables = Deliverables::Deliverable.where(mission_id: mission.id).order(version: :desc)
        render_data(deliverables.map { |d| serialize(d) })
      end

      def upload_session
        mission = TenantScope.find_mission!(params[:mission_id], organization: current_organization)
        result = Uploads::CreateSession.call(
          organization: current_organization,
          user: current_user,
          filename: params.require(:filename),
          content_type: params.require(:content_type),
          byte_size: params.require(:byte_size),
          owner_type: "Mission",
          owner_id: mission.id
        )
        if result.success?
          render_data({
            asset_id: result.asset.id,
            upload_url: result.upload_url,
            storage_key: result.storage_key
          }, status: :created)
        else
          render_error(status: 422, code: "UPLOAD_SESSION", title: "Cannot create session", detail: result.errors.join(", "))
        end
      end

      def finalize
        mission_id = params[:mission_id] || params.dig(:deliverable, :mission_id)
        mission = TenantScope.find_mission!(mission_id, organization: current_organization)
        result = Uploads::FinalizeDeliverable.call(
          mission: mission,
          organization: current_organization,
          user: current_user,
          data_product_id: params.require(:data_product_id),
          title: params[:title],
          storage_key: params.require(:storage_key),
          checksum_sha256: params[:checksum_sha256],
          file_size_bytes: params[:file_size_bytes]
        )
        if result.success?
          render_data(serialize(result.deliverable), status: :created)
        else
          render_error(status: 422, code: "FINALIZE_FAILED", title: "Finalize failed", detail: result.errors.join(", "))
        end
      end

      def approve
        deliverable = TenantScope.find_deliverable!(params[:id], organization: current_organization)
        authorize authorize_context, deliverable, :approve?
        result = Deliverables::Approve.call(deliverable: deliverable, user: current_user)
        if result.success?
          render_data(serialize(result.deliverable).merge(mission_status: result.mission.status))
        else
          render_error(status: 422, code: "APPROVE_FAILED", title: "Cannot approve", detail: result.errors.join(", "))
        end
      end

      def reject
        deliverable = TenantScope.find_deliverable!(params[:id], organization: current_organization)
        authorize authorize_context, deliverable, :reject?
        result = Deliverables::Reject.call(deliverable: deliverable, user: current_user, reason: params.require(:reason))
        if result.success?
          render_data(serialize(result.deliverable))
        else
          render_error(status: 422, code: "REJECT_FAILED", title: "Cannot reject", detail: result.errors.join(", "))
        end
      end

      private

      def find_mission_flexible
        if params[:mission_id]
          begin
            TenantScope.find_mission!(params[:mission_id], organization: current_organization)
          rescue ActiveRecord::RecordNotFound
            TenantScope.find_mission!(params[:mission_id], organization: current_organization)
          end
        else
          raise ActionController::ParameterMissing, :mission_id
        end
      end

      def serialize(d)
        {
          id: d.id,
          mission_id: d.mission_id,
          data_product_id: d.data_product_id,
          title: d.title,
          status: d.status,
          version: d.version,
          storage_key: d.storage_key,
          rejection_reason: d.respond_to?(:rejection_reason) ? d.rejection_reason : nil
        }
      end
    end
  end
end
