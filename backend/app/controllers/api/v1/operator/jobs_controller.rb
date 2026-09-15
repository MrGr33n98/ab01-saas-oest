# frozen_string_literal: true

module Api
  module V1
    module Operator
      class JobsController < BaseController
        # GET /api/v1/operator/jobs
        # Open published missions eligible for this operator org (matching + open to quotes).
        def index
          profile = Operators::OperatorProfile.find_by(organization_id: current_organization.id)
          unless profile
            return render json: {
              data: [],
              meta: { message: "Complete operator profile to see jobs", request_id: request_id }
            }
          end

          unless profile.verification_status == "verified" && profile.accepting_jobs
            return render json: {
              data: [],
              meta: {
                message: "Profile must be verified and accepting jobs",
                verification_status: profile.verification_status,
                accepting_jobs: profile.accepting_jobs,
                request_id: request_id
              }
            }
          end

          missions = Missions::Mission
            .where(status: %w[published quoting])
            .order(published_at: :desc)
            .limit(50)

          # Prefer missions where matching listed this operator
          data = missions.filter_map do |m|
            candidates = Array(m.metadata.is_a?(Hash) ? m.metadata.dig("matching", "candidates") : nil)
            invited = candidates.any? { |c| c["operator_id"] == profile.id || c[:operator_id] == profile.id }
            # Also show if no matching run yet but mission is open (discoverability MVP)
            next unless invited || candidates.empty?

            {
              mission_id: m.id,
              title: m.title,
              status: m.status,
              mission_type: m.mission_type,
              area_hectares: m.area_hectares,
              deadline_at: m.deadline_at,
              published_at: m.published_at,
              currency: m.currency,
              estimated_budget_min: m.estimated_budget_min,
              estimated_budget_max: m.estimated_budget_max,
              invited: invited,
              href: "/operator/jobs"
            }
          end

          render json: {
            data: data,
            meta: {
              profile_id: profile.id,
              count: data.size,
              request_id: request_id
            }
          }
        end

        private

        def request_id
          request.headers["X-Request-Id"].presence || SecureRandom.uuid
        end
      end
    end
  end
end
