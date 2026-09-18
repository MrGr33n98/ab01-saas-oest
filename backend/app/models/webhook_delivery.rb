# frozen_string_literal: true

class WebhookDelivery < ApplicationRecord
  STATUSES = %w[pending delivering succeeded failed].freeze

  belongs_to :webhook_endpoint
  belongs_to :organization
  has_many :webhook_attempts, -> { order(attempt_number: :asc) }, dependent: :destroy

  validates :event_type, presence: true, length: { maximum: 120 }
  validates :event_id, presence: true, length: { maximum: 120 }
  validates :status, inclusion: { in: STATUSES }
  validates :attempts_count, numericality: { greater_than_or_equal_to: 0 }

  scope :pending_retry, -> { where(status: "pending").where("next_retry_at IS NULL OR next_retry_at <= ?", Time.current) }
  scope :recent, -> { order(created_at: :desc) }

  def mark_delivering!
    update!(status: "delivering")
  end

  def mark_succeeded!
    update!(status: "succeeded", completed_at: Time.current, next_retry_at: nil)
    webhook_endpoint.update!(last_successful_delivery_at: Time.current)
  end

  def mark_failed!(retry_at: nil)
    new_status = retry_at.present? ? "pending" : "failed"
    update!(
      status: new_status,
      next_retry_at: retry_at,
      completed_at: (retry_at.present? ? nil : Time.current)
    )
    webhook_endpoint.update!(last_failed_delivery_at: Time.current)
  end
end
