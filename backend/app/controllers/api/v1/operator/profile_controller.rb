# frozen_string_literal: true

module Api
  module V1
    module Operator
      class ProfileController < BaseController
        def show
          profile = current_organization.operator_profile
          return render_error(status: 404, code: "NOT_FOUND", title: "Operator profile not found") unless profile

          render_data({
            id: profile.id,
            slug: profile.slug,
            headline: profile.headline,
            about: profile.about,
            verification_status: profile.verification_status,
            accepting_jobs: profile.accepting_jobs,
            searchable: profile.searchable,
            rating_average: profile.rating_average,
            missions_completed: profile.missions_completed
          })
        end

        def update
          profile = current_organization.operator_profile
          return render_error(status: 404, code: "NOT_FOUND", title: "Operator profile not found") unless profile

          authorize authorize_context, profile, :update?
          if profile.update(params.permit(:headline, :about, :accepting_jobs, :searchable, :minimum_job_value))
            render_data({ id: profile.id, slug: profile.slug, headline: profile.headline })
          else
            render_error(status: 422, code: "VALIDATION", title: "Invalid", detail: profile.errors.full_messages.join(", "))
          end
        end
      end
    end
  end
end
