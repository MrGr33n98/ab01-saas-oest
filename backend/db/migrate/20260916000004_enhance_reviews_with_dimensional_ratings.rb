# frozen_string_literal: true

class EnhanceReviewsWithDimensionalRatings < ActiveRecord::Migration[7.2]
  def change
    add_column :reviews, :technical_accuracy_rating, :integer, default: 5, null: false
    add_column :reviews, :timeliness_rating, :integer, default: 5, null: false
    add_column :reviews, :communication_rating, :integer, default: 5, null: false
    add_column :reviews, :safety_compliance_rating, :integer, default: 5, null: false
    add_column :reviews, :delivered_gsd_cm, :decimal, precision: 5, scale: 2
    add_column :reviews, :headline, :string, limit: 140

    add_index :reviews, %i[operator_profile_id overall_rating]
  end
end
