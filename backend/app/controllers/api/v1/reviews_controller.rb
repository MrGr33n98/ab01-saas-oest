# frozen_string_literal: true

module Api
  module V1
    class ReviewsController < BaseController
      skip_before_action :authenticate_user!, only: %i[public_index]
      skip_before_action :resolve_organization!, only: %i[public_index]

      # GET /api/v1/operators/:slug/reviews (Public)
      def public_index
        profile = Operators::OperatorProfile.find_by!(slug: params[:slug])
        reviews = profile.reviews.where(moderation_status: "published").order(created_at: :desc)

        serialized = reviews.map do |r|
          {
            id: r.id,
            overall_rating: r.overall_rating,
            technical_accuracy_rating: r.technical_accuracy_rating,
            timeliness_rating: r.timeliness_rating,
            communication_rating: r.communication_rating,
            safety_compliance_rating: r.safety_compliance_rating,
            delivered_gsd_cm: r.delivered_gsd_cm,
            title: r.title || r.headline,
            headline: r.headline || r.title,
            body: r.body,
            verified: r.verified,
            published_at: r.published_at,
            customer_organization_name: r.customer_organization&.name
          }
        end

        avg_technical = reviews.average(:technical_accuracy_rating)&.to_f&.round(2)
        avg_timeliness = reviews.average(:timeliness_rating)&.to_f&.round(2)
        avg_communication = reviews.average(:communication_rating)&.to_f&.round(2)
        avg_safety = reviews.average(:safety_compliance_rating)&.to_f&.round(2)

        render json: {
          data: {
            reviews: serialized,
            metrics: {
              total_count: reviews.count,
              overall_average: profile.rating_average,
              technical_accuracy_average: avg_technical,
              timeliness_average: avg_timeliness,
              communication_average: avg_communication,
              safety_compliance_average: avg_safety
            }
          }
        }
      end

      # POST /api/v1/missions/:mission_id/reviews
      def create
        mission = TenantScope.find!(Missions::Mission, params[:mission_id], organization: current_organization)
        result = Reviews::Create.call(
          mission: mission,
          user: current_user,
          organization: current_organization,
          overall_rating: params.require(:overall_rating),
          body: params[:body],
          title: params[:title],
          headline: params[:headline],
          technical_accuracy_rating: params[:technical_accuracy_rating],
          timeliness_rating: params[:timeliness_rating],
          communication_rating: params[:communication_rating],
          safety_compliance_rating: params[:safety_compliance_rating],
          delivered_gsd_cm: params[:delivered_gsd_cm]
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
