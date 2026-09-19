# frozen_string_literal: true

class IdempotencyKey < ApplicationRecord
  belongs_to :organization

  validates :key, presence: true, length: { maximum: 180 }
  validates :scope, presence: true, length: { maximum: 120 }
  validates :request_hash, presence: true, length: { is: 64 }
  validates :expires_at, presence: true
end
