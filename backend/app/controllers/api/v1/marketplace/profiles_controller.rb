# frozen_string_literal: true

module Api
  module V1
    module Marketplace
      # Public operator/company profile for SEO pages.
      class ProfilesController < ActionController::API
        def show
          profile = Operators::OperatorProfile.find_by!(slug: params[:slug])
          org = profile.organization
          entitlements = Entitlements::Resolver.snapshot(org)

          hero = if entitlements["profile.hero_custom"] && profile.hero_image_url.present?
                   {
                     image_url: profile.hero_image_url,
                     title: profile.hero_title,
                     subtitle: profile.hero_subtitle,
                     custom: true
                   }
                 else
                   {
                     image_url: nil,
                     title: nil,
                     subtitle: nil,
                     custom: false,
                     placeholder: true
                   }
                 end

          materials = if entitlements["profile.materials"]
                        profile.operator_materials.published.map { |m|
                          { id: m.id, title: m.title, description: m.description, file_url: m.file_url, file_name: m.file_name }
                        }
                      else
                        []
                      end

          badges = profile.operator_badges.active.includes(:verification_badge).map { |ob|
            b = ob.verification_badge
            { key: b.key, name: b.name, name_en: b.name_en, icon: b.icon }
          }

          quote_enabled = profile.quote_request_enabled && entitlements["profile.quote_request"]

          render json: {
            data: {
              id: profile.id,
              slug: profile.slug,
              profile_kind: profile.profile_kind,
              display_name: profile.display_name,
              company_name: profile.company_name,
              headline: profile.headline,
              about: profile.about,
              logo_url: entitlements["profile.hero_custom"] ? profile.logo_url : nil,
              verification_status: profile.verification_status,
              accepting_jobs: profile.accepting_jobs,
              category_featured: profile.category_featured && entitlements["marketplace.category_featured"],
              hero: hero,
              badges: badges,
              materials: materials,
              quote_request_enabled: quote_enabled,
              path: profile.public_path
            }
          }
        rescue ActiveRecord::RecordNotFound
          render json: { title: "Not found", status: 404, code: "NOT_FOUND" }, status: 404
        end
      end
    end
  end
end
