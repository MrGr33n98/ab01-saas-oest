# frozen_string_literal: true

module Api
  module V1
    module Content
      class PostsController < ActionController::API
        # GET /api/v1/content/posts?locale=pt-BR&category=mapping&state=MT
        def index
          locale = params[:locale].presence || "pt-BR"
          scope = Cms::Post.published.for_locale(locale).order(published_at: :desc)
          scope = scope.where("? = ANY(category_slugs)", params[:category]) if params[:category].present?
          scope = scope.where("? = ANY(geo_states)", params[:state]) if params[:state].present?

          posts = scope.limit(params.fetch(:limit, 20).to_i.clamp(1, 50))
          render json: {
            data: posts.map { |p| card(p) },
            meta: { locale: locale, request_id: request.headers["X-Request-Id"] }
          }
        end

        # GET /api/v1/content/posts/:slug?locale=en
        def show
          locale = params[:locale].presence || "pt-BR"
          post = Cms::Post.published.for_locale(locale).find_by!(slug: params[:slug])
          render json: { data: detail(post), meta: { locale: locale } }
        rescue ActiveRecord::RecordNotFound
          render json: {
            title: "Not found", status: 404, code: "NOT_FOUND"
          }, status: :not_found
        end

        private

        def card(p)
          {
            slug: p.slug,
            locale: p.locale,
            title: p.title,
            excerpt: p.excerpt,
            published_at: p.published_at,
            category_slugs: p.category_slugs,
            geo_states: p.geo_states,
            path: p.public_path
          }
        end

        def detail(p)
          card(p).merge(
            h1: p.heading,
            body_md: p.body_md,
            meta_title: p.seo_title,
            meta_description: p.seo_description,
            canonical_url: p.canonical_url,
            og_image_url: p.og_image_url,
            faq_blocks: p.faq_blocks,
            tags: p.tags,
            translation_key: p.translation_key
          )
        end
      end
    end
  end
end
