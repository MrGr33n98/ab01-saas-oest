# frozen_string_literal: true

module Cms
  class Post < ApplicationRecord
    self.table_name = "cms_posts"

    STATUSES = %w[draft published archived].freeze
    LOCALES = %w[pt-BR en].freeze

    validates :slug, :title, :locale, :status, presence: true
    validates :slug, uniqueness: { scope: :locale }
    validates :status, inclusion: { in: STATUSES }
    validates :locale, inclusion: { in: LOCALES }
    validates :meta_title, length: { maximum: 70 }, allow_blank: true
    validates :meta_description, length: { maximum: 180 }, allow_blank: true

    scope :published, lambda {
      where(status: "published").where("published_at IS NOT NULL AND published_at <= ?", Time.current)
    }
    scope :for_locale, ->(locale) { where(locale: locale) }

    def publish!
      update!(status: "published", published_at: published_at || Time.current)
    end

    def unpublish!
      update!(status: "draft")
    end

    def public_path
      locale == "en" ? "/en/blog/#{slug}" : "/blog/#{slug}"
    end

    def seo_title
      meta_title.presence || title
    end

    def seo_description
      meta_description.presence || excerpt.presence || title
    end

    def heading
      h1.presence || title
    end
  end
end
