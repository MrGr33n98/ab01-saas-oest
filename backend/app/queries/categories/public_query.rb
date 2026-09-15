# frozen_string_literal: true

module Categories
  class PublicQuery
    def self.call(slug:)
      new(slug: slug).call
    end

    def initialize(slug:)
      @slug = slug.to_s
    end

    def call
      category = Marketplace::ServiceCategory
        .includes(:faqs, :use_cases, :related_categories)
        .find_by(slug: @slug)

      # If not found, check redirects
      unless category
        redirect_entry = Marketplace::CategoryRedirect.find_by(old_slug: @slug)
        if redirect_entry
          category = Marketplace::ServiceCategory
            .includes(:faqs, :use_cases, :related_categories)
            .find_by(slug: redirect_entry.new_slug)
        end
      end

      category
    end
  end
end
