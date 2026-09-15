# frozen_string_literal: true

module Categories
  class Archive
    def self.call(category:, actor: nil)
      new(category: category, actor: actor).call
    end

    def initialize(category:, actor: nil)
      @category = category
      @actor = actor
    end

    def call
      @category.with_lock do
        @category.status = "archived"
        @category.archived_at = Time.current
        @category.active = false
        @category.updated_by_id = @actor&.id
        @category.save!
      end
      true
    end
  end
end
