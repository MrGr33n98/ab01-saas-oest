# frozen_string_literal: true

module Categories
  class Publish
    def self.call(category:, actor: nil)
      new(category: category, actor: actor).call
    end

    def initialize(category:, actor: nil)
      @category = category
      @actor = actor
    end

    def call
      @category.with_lock do
        @category.status = "published"
        @category.published_at = Time.current
        @category.active = true
        @category.updated_by_id = @actor&.id
        @category.save!

        # Create content snapshot version
        snapshot = @category.as_json(
          include: {
            faqs: { only: %i[id question short_answer answer position published] },
            use_cases: { only: %i[id title short_description body icon_key position published] }
          }
        )
        current_version = (@category.content_versions.maximum(:version) || 0) + 1
        @category.content_versions.create!(
          version: current_version,
          snapshot: snapshot,
          created_by_id: @actor&.id,
          created_at: Time.current
        )
      end

      # Invalidate Next.js cache asynchronously if revalidation service/job exists
      true
    end
  end
end
