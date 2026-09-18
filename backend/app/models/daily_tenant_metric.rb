# frozen_string_literal: true

class DailyTenantMetric < ApplicationRecord
  belongs_to :organization

  validates :date, presence: true
  validates :metric_name, presence: true
  validates :value, presence: true, numericality: { only_integer: true }

  validates :metric_name, uniqueness: { scope: %i[organization_id date] }

  scope :for_organization, ->(org_id) { where(organization_id: org_id) }
  scope :for_metric, ->(name) { where(metric_name: name) }
  scope :for_period, ->(start_date, end_date) { where(date: start_date..end_date) }
  scope :chronological, -> { order(date: :asc) }
end
