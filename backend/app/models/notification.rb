# frozen_string_literal: true

class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :organization, optional: true

  validates :title, presence: true
  validates :notification_type, presence: true

  scope :unread, -> { where(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }

  def mark_as_read!
    update!(read_at: Time.current) unless read?
  end

  def read?
    read_at.present?
  end
end
