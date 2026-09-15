# frozen_string_literal: true

module Reviews
  class Review < ApplicationRecord
    self.table_name = "reviews"

    belongs_to :mission, class_name: "Missions::Mission"
    belongs_to :customer_organization, class_name: "Organization"
    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"
    belongs_to :reviewer, class_name: "User"

    validates :overall_rating, inclusion: { in: 1..5 }
    validates :technical_accuracy_rating, :timeliness_rating,
              :communication_rating, :safety_compliance_rating,
              inclusion: { in: 1..5 }
    validates :mission_id, uniqueness: true

    after_save :trigger_profile_metric_recalculation
    after_destroy :trigger_profile_metric_recalculation

    private

    def trigger_profile_metric_recalculation
      operator_profile&.recalculate_rating_metrics!
    end
  end
end
