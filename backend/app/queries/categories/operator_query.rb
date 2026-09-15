# frozen_string_literal: true

module Categories
  class OperatorQuery
    def self.call(category_id:, filters: {}, page: 1, per_page: 24)
      new(category_id: category_id, filters: filters, page: page, per_page: per_page).call
    end

    def initialize(category_id:, filters: {}, page: 1, per_page: 24)
      @category_id = category_id
      @filters = filters || {}
      @page = [page.to_i, 1].max
      @per_page = [[per_page.to_i, 1].max, 50].min
    end

    def call
      offering_ids = Marketplace::ServiceOffering
        .where(service_category_id: @category_id, active: true)
        .select(:operator_profile_id)

      scope = Operators::OperatorProfile
        .where(id: offering_ids)
        .where(verification_status: "verified", accepting_jobs: true, searchable: true)
        .includes(:organization)

      # Filter by state / location
      if @filters[:state].present?
        scope = scope.joins(:coverage_areas).where(coverage_areas: { state_code: @filters[:state], active: true })
      end

      # Filter by min rating
      if @filters[:min_rating].present?
        scope = scope.where("rating_count > 0 AND rating_average >= ?", @filters[:min_rating].to_f)
      end

      # Sort
      scope = case @filters[:sort]
              when "rating"
                scope.order(rating_average: :desc, rating_count: :desc)
              when "missions"
                scope.order(missions_completed: :desc)
              else
                scope.order(Arel.sql("CASE WHEN rating_count > 0 THEN 0 ELSE 1 END"), rating_average: :desc, slug: :asc)
              end

      total_count = scope.count
      records = scope.offset((@page - 1) * @per_page).limit(@per_page)

      {
        operators: records,
        pagination: {
          current_page: @page,
          per_page: @per_page,
          total_count: total_count,
          total_pages: (total_count.to_f / @per_page).ceil
        }
      }
    end
  end
end
