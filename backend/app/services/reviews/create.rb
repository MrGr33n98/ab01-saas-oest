# frozen_string_literal: true

module Reviews
  class Create
    Result = Struct.new(:success?, :review, :errors, keyword_init: true)

    def self.call(mission:, user:, organization:, overall_rating:, **kwargs)
      new(mission: mission, user: user, organization: organization, overall_rating: overall_rating, **kwargs).call
    end

    def initialize(mission:, user:, organization:, overall_rating:, body: nil, title: nil, headline: nil,
                   technical_accuracy_rating: nil, timeliness_rating: nil, communication_rating: nil,
                   safety_compliance_rating: nil, delivered_gsd_cm: nil)
      @mission = mission
      @user = user
      @organization = organization
      @overall_rating = overall_rating.to_i
      @body = body
      @title = title || headline
      @headline = headline || title
      @technical_accuracy_rating = (technical_accuracy_rating || overall_rating).to_i
      @timeliness_rating = (timeliness_rating || overall_rating).to_i
      @communication_rating = (communication_rating || overall_rating).to_i
      @safety_compliance_rating = (safety_compliance_rating || overall_rating).to_i
      @delivered_gsd_cm = delivered_gsd_cm
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
        technical_accuracy_rating: technical_accuracy_rating,
        timeliness_rating: timeliness_rating,
        communication_rating: communication_rating,
        safety_compliance_rating: safety_compliance_rating,
        delivered_gsd_cm: delivered_gsd_cm,
        headline: headline,
        title: title,
        body: body,
        verified: true,
        moderation_status: "published",
        published_at: Time.current
      )

      # Trigger profile metrics
      profile.recalculate_rating_metrics!

      Result.new(success?: true, review: review, errors: [])
    rescue ActiveRecord::RecordInvalid => e
      fail!(e.record.errors.full_messages.join(", "))
    end

    private

    attr_reader :mission, :user, :organization, :overall_rating, :body, :title, :headline,
                :technical_accuracy_rating, :timeliness_rating, :communication_rating,
                :safety_compliance_rating, :delivered_gsd_cm

    def fail!(msg)
      Result.new(success?: false, review: nil, errors: [msg])
    end
  end
end
