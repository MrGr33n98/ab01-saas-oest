# frozen_string_literal: true

module Api
  module V1
    class DataLibraryController < BaseController
      def index
        # Approved deliverables for current org missions
        mission_ids = Missions::Mission.where(organization_id: current_organization.id).pluck(:id)
        scope = Deliverables::Deliverable.where(mission_id: mission_ids)
        scope = scope.where(status: "approved") if Deliverables::Deliverable.column_names.include?("status")
        items = scope.order(created_at: :desc).limit(50).map { |d|
          { id: d.id, mission_id: d.mission_id, title: d.try(:title), status: d.try(:status) }
        }
        render_data(items)
      end
    end
  end
end
