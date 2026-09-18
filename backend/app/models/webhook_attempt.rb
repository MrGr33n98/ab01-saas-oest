# frozen_string_literal: true

class WebhookAttempt < ApplicationRecord
  STATUSES = %w[succeeded failed].freeze

  belongs_to :webhook_delivery

  validates :attempt_number, presence: true, numericality: { greater_than: 0 }
  validates :status, inclusion: { in: STATUSES }
  validates :attempted_at, presence: true
end
