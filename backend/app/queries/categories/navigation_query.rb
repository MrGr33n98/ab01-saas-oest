# frozen_string_literal: true

module Categories
  class NavigationQuery
    def self.call
      new.call
    end

    def call
      categories = Marketplace::ServiceCategory
        .where(active: true)
        .order(:position, :name)

      categories.map do |cat|
        {
          id: cat.id,
          slug: cat.slug,
          name: cat.name,
          short_name: cat.short_name,
          icon_key: cat.icon_key,
          position: cat.position,
          featured: cat.featured,
          operator_count: cat.operators_count,
          service_count: cat.services_count
        }
      end
    end
  end
end
