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
            name: profile.organization.name,
            headline: profile.headline,
            about: profile.about,
            verification_status: profile.verification_status,
            accepting_jobs: profile.accepting_jobs,
            searchable: profile.searchable,
            rating_average: profile.rating_average,
            rating_count: profile.rating_count,
            missions_completed: profile.missions_completed,
            profile_kind: profile.profile_kind,
            company_name: profile.company_name,
            company_cnpj: profile.company_cnpj,
            hero_banner_url: profile.hero_banner_url,
            avatar_url: profile.avatar_url,
            banner_headline: profile.banner_headline,
            banner_subtitle: profile.banner_subtitle,
            banner_badges: profile.banner_badges,
            website_url: profile.website_url,
            linkedin_url: profile.linkedin_url,
            instagram_url: profile.instagram_url,
            anac_sisant_status: profile.anac_sisant_status,
            reta_insurance_status: profile.reta_insurance_status,
            mop_status: profile.mop_status,
            canac_pilots_count: profile.canac_pilots_count,
            city: profile.organization.city,
            state_code: profile.organization.state_code
          })
        end

        def update
          profile = current_organization.operator_profile
          return render_error(status: 404, code: "NOT_FOUND", title: "Operator profile not found") unless profile

          authorize authorize_context, profile, :update?
          attributes = params.permit(
            :headline, :about, :accepting_jobs, :searchable, :minimum_job_value,
            :profile_kind, :company_name, :company_cnpj, :hero_banner_url, :avatar_url,
            :banner_headline, :banner_subtitle, :website_url, :linkedin_url, :instagram_url,
            :anac_sisant_status, :reta_insurance_status, :mop_status, :canac_pilots_count,
            banner_badges: []
          )
          organization_attributes = params.permit(:name, :city, :state_code)

          ApplicationRecord.transaction do
            profile.organization.update!(organization_attributes) if organization_attributes.present?
            profile.update!(attributes)
          end
          if profile.persisted?
            render_data({
              id: profile.id,
              slug: profile.slug,
              headline: profile.headline,
              name: profile.organization.name,
              city: profile.organization.city,
              state_code: profile.organization.state_code
            })
          else
            render_error(status: 422, code: "VALIDATION", title: "Invalid", detail: profile.errors.full_messages.join(", "))
          end
        rescue ActiveRecord::RecordInvalid => e
          render_error(status: 422, code: "VALIDATION", title: "Invalid", detail: e.record.errors.full_messages.join(", "))
        end
      end
    end
  end
end
