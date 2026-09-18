# frozen_string_literal: true

class DailyPlatformMetric < ApplicationRecord
  validates :date, presence: true
  validates :metric_name, presence: true
  validates :value, presence: true, numericality: { only_integer: true }

  validates :metric_name, uniqueness: { scope: :date }

  scope :for_metric, ->(name) { where(metric_name: name) }
  scope :for_period, ->(start_date, end_date) { where(date: start_date..end_date) }
  scope :chronological, -> { order(date: :asc) }
end
