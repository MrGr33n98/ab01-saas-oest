# frozen_string_literal: true

module Categories
  class ChangeSlug
    def self.call(category:, new_slug:, actor: nil)
      new(category: category, new_slug: new_slug, actor: actor).call
    end

    def initialize(category:, new_slug:, actor: nil)
      @category = category
      @new_slug = new_slug.to_s.parameterize
      @actor = actor
    end

    def call
      return true if @category.slug == @new_slug

      old_slug = @category.slug

      @category.with_lock do
        @category.redirects.create!(
          old_slug: old_slug,
          new_slug: @new_slug,
          redirect_type: 301,
          created_at: Time.current
        )
        @category.slug = @new_slug
        @category.updated_by_id = @actor&.id
        @category.save!
      end
      true
    end
  end
end
