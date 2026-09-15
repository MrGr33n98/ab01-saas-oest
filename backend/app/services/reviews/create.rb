# frozen_string_literal: true

module Reviews
  class Create
    Result = Struct.new(:success?, :review, :errors, keyword_init: true)

    def self.call(mission:, user:, organization:, overall_rating:, body: nil, title: nil)
      new(mission: mission, user: user, organization: organization, overall_rating: overall_rating, body: body, title: title).call
    end

    def initialize(mission:, user:, organization:, overall_rating:, body:, title:)
      @mission = mission
      @user = user
      @organization = organization
      @overall_rating = overall_rating.to_i
      @body = body
      @title = title
    end

    def call
      return fail!("mission must be completed") unless mission.status == "completed"
      return fail!("rating 1..5") unless (1..5).cover?(overall_rating)
      return fail!("already reviewed") if Reviews::Review.exists?(mission_id: mission.id)

      order = mission.order
      return fail!("order required") unless order

      profile = Operators::OperatorProfile.find_by(organization_id: order.operator_organization_id)
      return fail!("operator profile missing") unless profile

      review = Reviews::Review.create!(
        mission_id: mission.id,
        customer_organization_id: organization.id,
        operator_profile_id: profile.id,
        reviewer_id: user.id,
        overall_rating: overall_rating,
        title: title,
        body: body,
        verified: true,
        moderation_status: "published",
        published_at: Time.current
      )

      # Update aggregates simply
      stats = Reviews::Review.where(operator_profile_id: profile.id)
      profile.update!(
        rating_count: stats.count,
        rating_average: stats.average(:overall_rating)&.round(2),
        missions_completed: profile.missions_completed + 1
      )

      Result.new(success?: true, review: review, errors: [])
    rescue ActiveRecord::RecordInvalid => e
      fail!(e.record.errors.full_messages.join(", "))
    end

    private

    attr_reader :mission, :user, :organization, :overall_rating, :body, :title

    def fail!(msg)
      Result.new(success?: false, review: nil, errors: [msg])
    end
  end
end
