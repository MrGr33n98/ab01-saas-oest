# frozen_string_literal: true

module Api
  module V1
    module Admin
      class PostsController < BaseController
        include AdminAuthorization
        before_action :require_platform_admin!

        def index
          scope = Cms::Post.order(updated_at: :desc)
          scope = scope.where(status: params[:status]) if params[:status].present?
          scope = scope.where(locale: params[:locale]) if params[:locale].present?
          render json: { data: scope.limit(100).map { |p| serialize(p) } }
        end

        def show
          render json: { data: serialize(Cms::Post.find(params[:id]), detailed: true) }
        end

        def create
          post = Cms::Post.new(post_params)
          post.author_id = current_user.id
          if post.save
            render json: { data: serialize(post, detailed: true) }, status: :created
          else
            render json: { title: "Validation", detail: post.errors.full_messages.join(", "), status: 422 }, status: 422
          end
        end

        def update
          post = Cms::Post.find(params[:id])
          if post.update(post_params)
            render json: { data: serialize(post, detailed: true) }
          else
            render json: { title: "Validation", detail: post.errors.full_messages.join(", "), status: 422 }, status: 422
          end
        end

        def publish
          post = Cms::Post.find(params[:id])
          post.publish!
          render json: { data: serialize(post, detailed: true) }
        end

        private
        # require_platform_admin! from AdminAuthorization

        def post_params
          params.require(:post).permit(
            :slug, :locale, :translation_key, :status, :title, :h1, :excerpt, :body_md,
            :meta_title, :meta_description, :canonical_url, :og_image_url, :published_at,
            geo_states: [], geo_cities: [], category_slugs: [], tags: [],
            faq_blocks: [:q, :a]
          )
        end

        def serialize(p, detailed: false)
          h = {
            id: p.id,
            slug: p.slug,
            locale: p.locale,
            status: p.status,
            title: p.title,
            published_at: p.published_at,
            category_slugs: p.category_slugs,
            geo_states: p.geo_states,
            updated_at: p.updated_at
          }
          if detailed
            h.merge!(
              h1: p.h1,
              excerpt: p.excerpt,
              body_md: p.body_md,
              meta_title: p.meta_title,
              meta_description: p.meta_description,
              canonical_url: p.canonical_url,
              og_image_url: p.og_image_url,
              faq_blocks: p.faq_blocks,
              tags: p.tags,
              translation_key: p.translation_key,
              path: p.public_path
            )
          end
          h
        end
      end
    end
  end
end
