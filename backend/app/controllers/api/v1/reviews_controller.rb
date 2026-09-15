# frozen_string_literal: true

module Api
  module V1
    class ReviewsController < BaseController
      def create
        mission = TenantScope.find!(Missions::Mission, params[:mission_id], organization: current_organization)
        result = Reviews::Create.call(
          mission: mission,
          user: current_user,
          organization: current_organization,
          overall_rating: params.require(:overall_rating),
          body: params[:body],
          title: params[:title]
        )
        if result.success?
          render_data({
            id: result.review.id,
            overall_rating: result.review.overall_rating,
            mission_id: mission.id
          }, status: :created)
        else
          render_error(status: 422, code: "REVIEW_INVALID", title: "Cannot review", detail: result.errors.join(", "))
        end
      end
    end
  end
end
