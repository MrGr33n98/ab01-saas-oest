# frozen_string_literal: true

module Api
  module V1
    module Operator
      # Self-serve premium profile: hero, materials, quote toggle (gated).
      class ProfilePremiumController < BaseController
        before_action :load_profile

        # PATCH /api/v1/operator/profile/premium
        def update
          attrs = {}
          if params.key?(:quote_request_enabled)
            require_feature!("profile.quote_request")
            attrs[:quote_request_enabled] = ActiveModel::Type::Boolean.new.cast(params[:quote_request_enabled])
          end
          if params[:hero_image_url].present? || params[:hero_title].present? || params[:hero_subtitle].present?
            require_feature!("profile.hero_custom")
            attrs[:hero_image_url] = params[:hero_image_url] if params.key?(:hero_image_url)
            attrs[:hero_title] = params[:hero_title] if params.key?(:hero_title)
            attrs[:hero_subtitle] = params[:hero_subtitle] if params.key?(:hero_subtitle)
          end
          if params.key?(:logo_url)
            require_feature!("profile.hero_custom")
            attrs[:logo_url] = params[:logo_url]
          end
          if params.key?(:category_featured)
            require_feature!("marketplace.category_featured")
            attrs[:category_featured] = ActiveModel::Type::Boolean.new.cast(params[:category_featured])
          end
          if params[:profile_kind].present?
            attrs[:profile_kind] = params[:profile_kind]
            attrs[:company_name] = params[:company_name] if params.key?(:company_name)
            attrs[:company_cnpj] = params[:company_cnpj] if params.key?(:company_cnpj)
          end

          @profile.update!(attrs) if attrs.any?
          render json: { data: public_payload(@profile) }
        rescue FeatureRequired => e
          render json: {
            title: "Upgrade required",
            detail: e.message,
            status: 402,
            code: "FEATURE_REQUIRED",
            feature: e.feature_key
          }, status: 402
        end

        private

        def load_profile
          @profile = Operators::OperatorProfile.find_by!(organization_id: current_organization.id)
        end

        def require_feature!(key)
          return if Entitlements::Resolver.enabled?(current_organization, key)

          raise FeatureRequired.new(key)
        end

        def public_payload(p)
          {
            id: p.id,
            slug: p.slug,
            profile_kind: p.profile_kind,
            company_name: p.company_name,
            hero_image_url: p.hero_image_url,
            hero_title: p.hero_title,
            hero_subtitle: p.hero_subtitle,
            logo_url: p.logo_url,
            quote_request_enabled: p.quote_request_enabled,
            category_featured: p.category_featured
          }
        end

        class FeatureRequired < StandardError
          attr_reader :feature_key
          def initialize(key)
            @feature_key = key
            super("Feature #{key} requires a paid plan")
          end
        end
      end
    end
  end
end
