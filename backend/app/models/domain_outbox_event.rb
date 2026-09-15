# frozen_string_literal: true

class DomainOutboxEvent < ApplicationRecord
  self.table_name = "domain_outbox_events"

  scope :unpublished, -> { where(published_at: nil).order(:occurred_at) }

  def mark_published!
    update!(published_at: Time.current)
  end
end
