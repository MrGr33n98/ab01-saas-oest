# frozen_string_literal: true

class VerificationBadge < ApplicationRecord
  self.table_name = "verification_badges"

  has_many :operator_badges, dependent: :destroy

  validates :key, :name, presence: true
  validates :key, uniqueness: true

  scope :active, -> { where(active: true).order(:position) }
end
