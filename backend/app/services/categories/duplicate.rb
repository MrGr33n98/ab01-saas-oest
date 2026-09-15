# frozen_string_literal: true

module Categories
  class Duplicate
    def self.call(category:, actor: nil)
      new(category: category, actor: actor).call
    end

    def initialize(category:, actor: nil)
      @category = category
      @actor = actor
    end

    def call
      new_record = @category.dup
      new_record.name = "#{@category.name} (Cópia)"
      new_record.slug = "#{@category.slug}-copia-#{SecureRandom.hex(2)}"
      new_record.public_id = nil
      new_record.status = "draft"
      new_record.published_at = nil
      new_record.created_by_id = @actor&.id
      new_record.updated_by_id = @actor&.id
      new_record.save!

      # Duplicate FAQs
      @category.faqs.each do |faq|
        new_faq = faq.dup
        new_faq.service_category_id = new_record.id
        new_faq.save!
      end

      # Duplicate Use Cases
      @category.use_cases.each do |uc|
        new_uc = uc.dup
        new_uc.service_category_id = new_record.id
        new_uc.save!
      end

      new_record
    end
  end
end
