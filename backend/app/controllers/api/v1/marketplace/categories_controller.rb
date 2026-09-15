# frozen_string_literal: true

module Api
  module V1
    module Marketplace
      class CategoriesController < BaseController
        skip_before_action :resolve_organization!, only: %i[index show operators services faqs]
        skip_before_action :authenticate_user!, only: %i[index show operators services faqs]

        # GET /api/v1/marketplace/categories
        def index
          categories = ::Categories::NavigationQuery.call
          render_data(categories)
        end

        # GET /api/v1/marketplace/categories/:slug
        def show
          category = ::Categories::PublicQuery.call(slug: params[:slug] || params[:id])
          return render_error(status: 404, code: "NOT_FOUND", title: "Categoria não encontrada") unless category

          render_data(serialize_category(category))
        end

        # GET /api/v1/marketplace/categories/:slug/operators
        def operators
          category = ::Categories::PublicQuery.call(slug: params[:slug] || params[:id])
          return render_error(status: 404, code: "NOT_FOUND", title: "Categoria não encontrada") unless category

          result = ::Categories::OperatorQuery.call(
            category_id: category.id,
            filters: params.permit(:state, :min_rating, :sort).to_h,
            page: params[:page] || 1,
            per_page: params[:per_page] || 24
          )

          render json: {
            data: result[:operators].map { |op| serialize_operator_card(op) },
            pagination: result[:pagination],
            meta: { request_id: request.headers["X-Request-Id"].presence || SecureRandom.uuid }
          }
        end

        # GET /api/v1/marketplace/categories/:slug/services
        def services
          category = ::Categories::PublicQuery.call(slug: params[:slug] || params[:id])
          return render_error(status: 404, code: "NOT_FOUND", title: "Categoria não encontrada") unless category

          offerings = category.service_offerings.where(active: true).limit(20)
          render_data(offerings.map { |s| serialize_service(s) })
        end

        # GET /api/v1/marketplace/categories/:slug/faqs
        def faqs
          category = ::Categories::PublicQuery.call(slug: params[:slug] || params[:id])
          return render_error(status: 404, code: "NOT_FOUND", title: "Categoria não encontrada") unless category

          render_data(category.faqs.published.ordered.as_json(only: %i[id question short_answer answer position]))
        end

        private

        def serialize_category(cat)
          {
            id: cat.id,
            public_id: cat.public_id,
            slug: cat.slug,
            name: cat.name,
            short_name: cat.short_name,
            icon_key: cat.icon_key,
            eyebrow: cat.eyebrow,
            headline: cat.display_headline,
            subheadline: cat.display_subheadline,
            short_description: cat.short_description,
            long_description: cat.long_description,
            ai_summary: cat.ai_summary,
            hero: {
              image_url: cat.hero_image_url,
              mobile_image_url: cat.hero_image_mobile_url,
              alt: cat.hero_image_alt || cat.name,
              caption: cat.hero_image_caption,
              focal_x: cat.hero_focal_x,
              focal_y: cat.hero_focal_y
            },
            seo: {
              title: cat.display_seo_title,
              description: cat.display_seo_description,
              keywords: cat.seo_keywords,
              canonical_url: cat.canonical_url_override.presence || "https://oest.com.br/categories/#{cat.slug}",
              robots_index: cat.robots_index?,
              robots_follow: cat.robots_follow?,
              schema_type: cat.schema_type.presence || "CollectionPage"
            },
            social: {
              og_title: cat.og_title.presence || cat.display_seo_title,
              og_description: cat.og_description.presence || cat.display_seo_description,
              og_image_url: cat.og_image_url.presence || cat.hero_image_url,
              twitter_title: cat.twitter_title.presence || cat.display_seo_title,
              twitter_description: cat.twitter_description.presence || cat.display_seo_description,
              twitter_image_url: cat.twitter_image_url.presence || cat.og_image_url.presence || cat.hero_image_url
            },
            geo_aeo: {
              answer_summary: cat.answer_summary,
              entity_description: cat.entity_description
            },
            editorial: {
              overview_title: cat.overview_title,
              overview_body: cat.overview_body,
              services_title: cat.services_title,
              services_description: cat.services_description,
              use_cases_title: cat.use_cases_title,
              use_cases_description: cat.use_cases_description,
              operators_title: cat.operators_title,
              operators_description: cat.operators_description,
              faq_title: cat.faq_title,
              faq_description: cat.faq_description,
              related_categories_title: cat.related_categories_title
            },
            cta: {
              title: cat.bottom_cta_title.presence || "Precisa de uma operação em #{cat.name}?",
              description: cat.bottom_cta_description.presence || "Solicite uma missão na plataforma e receba propostas de operadores certificados e homologados.",
              primary_label: cat.bottom_cta_primary_label.presence || "Solicitar Missão Agora",
              primary_url: cat.bottom_cta_primary_url.presence || "/app/missions/new?category=#{cat.slug}",
              secondary_label: cat.bottom_cta_secondary_label.presence || "Falar com Especialista",
              secondary_url: cat.bottom_cta_secondary_url.presence || "/contact"
            },
            counts: {
              operators: cat.operators_count,
              services: cat.services_count
            },
            use_cases: cat.use_cases.published.ordered.map { |u| { id: u.id, title: u.title, short_description: u.short_description, body: u.body, icon_key: u.icon_key } },
            faqs: cat.faqs.published.ordered.map { |f| { id: f.id, question: f.question, short_answer: f.short_answer, answer: f.answer } },
            related_categories: cat.related_categories.active.ordered.map { |r| { id: r.id, slug: r.slug, name: r.name, icon_key: r.icon_key, operators_count: r.operators_count } }
          }
        end

        def serialize_operator_card(profile)
          org = profile.organization
          logo = logo_url_for(org)
          {
            id: profile.id,
            slug: profile.slug,
            name: org&.name || profile.slug,
            headline: profile.headline,
            verification_status: profile.verification_status,
            verified: profile.verification_status == "verified",
            rating_average: profile.rating_count.to_i.positive? ? profile.rating_average&.to_f : 5.0,
            rating_count: profile.rating_count.to_i.positive? ? profile.rating_count.to_i : 0,
            missions_completed: profile.missions_completed.to_i,
            response_time_minutes: profile.response_time_minutes,
            accepting_jobs: profile.accepting_jobs,
            organization_name: org&.name,
            city: org&.city,
            state_code: org&.state_code,
            logo_url: logo,
            avatar_url: logo,
            banner_image_url: banner_image_url_for(profile)
          }
        end

        def serialize_service(s)
          {
            id: s.id,
            title: s.title,
            description: s.description,
            pricing_model: s.pricing_model,
            price_from: s.price_from,
            currency: s.currency
          }
        end

        def logo_url_for(org)
          return nil unless org&.logo_asset_id
          asset = Deliverables::Asset.find_by(id: org.logo_asset_id)
          return nil unless asset
          Integrations::Storage::S3Presigner.new.public_object_url(asset.storage_key)
        rescue StandardError
          nil
        end

        def banner_image_url_for(_profile)
          "/images/operator-hero-banner.jpg"
        end

        def render_data(data, status: :ok, meta: {})
          render json: {
            data: data,
            meta: meta.merge(request_id: request.headers["X-Request-Id"].presence || SecureRandom.uuid)
          }, status: status
        end

        def render_error(status:, code:, title:, detail: nil, errors: nil)
          body = {
            type: "https://api.dronehub.example/problems/#{code.downcase.tr('_', '-')}",
            title: title,
            status: status,
            code: code,
            detail: detail,
            request_id: request.headers["X-Request-Id"].presence || SecureRandom.uuid
          }
          body[:errors] = errors if errors
          render json: body, status: status
        end
      end
    end
  end
end
