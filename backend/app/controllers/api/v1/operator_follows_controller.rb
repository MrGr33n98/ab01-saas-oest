# frozen_string_literal: true

module Api
  module V1
    class OperatorFollowsController < BaseController
      before_action :set_operator_profile, only: %i[follow unfollow status]

      # POST /api/v1/operators/:slug/follow
      def follow
        if @operator_profile.organization_id == current_organization.id
          return render_error(status: 422, code: "CANNOT_FOLLOW_SELF", title: "Cannot follow your own operator profile")
        end

        follow = OrganizationFollow.find_or_initialize_by(
          follower_organization: current_organization,
          followed_operator_profile: @operator_profile
        )

        if follow.save
          render json: {
            data: {
              following: true,
              followed_at: follow.created_at,
              operator_slug: @operator_profile.slug,
              operator_name: @operator_profile.display_name
            }
          }, status: :created
        else
          render_error(status: 422, code: "UNPROCESSABLE", title: follow.errors.full_messages.join(", "))
        end
      end

      # DELETE /api/v1/operators/:slug/unfollow
      def unfollow
        follow = OrganizationFollow.find_by(
          follower_organization: current_organization,
          followed_operator_profile: @operator_profile
        )

        if follow
          follow.destroy
          render json: { data: { following: false, operator_slug: @operator_profile.slug } }
        else
          render json: { data: { following: false, operator_slug: @operator_profile.slug } }
        end
      end

      # GET /api/v1/operators/:slug/follow_status
      def status
        following = current_organization.following?(@operator_profile)
        render json: {
          data: {
            following: following,
            operator_slug: @operator_profile.slug,
            followers_count: @operator_profile.organization_follows.count
          }
        }
      end

      # GET /api/v1/app/favorites/operators
      def index
        follows = current_organization.organization_follows.includes(followed_operator_profile: %i[organization drones])
        serialized = follows.map do |f|
          profile = f.followed_operator_profile
          {
            follow_id: f.id,
            followed_at: f.created_at,
            operator: {
              id: profile.id,
              slug: profile.slug,
              name: profile.display_name,
              headline: profile.headline,
              city: profile.organization&.city,
              state_code: profile.organization&.state_code,
              rating_average: profile.rating_average,
              rating_count: profile.rating_count,
              missions_completed: profile.missions_completed,
              verification_status: profile.verification_status,
              drones_count: profile.drones.count
            }
          }
        end

        render json: { data: serialized }
      end

      private

      def set_operator_profile
        @operator_profile = Operators::OperatorProfile.find_by!(slug: params[:slug])
      end
    end
  end
end
