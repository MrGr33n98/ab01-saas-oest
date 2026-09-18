# frozen_string_literal: true

class TelemetryEvent < ApplicationRecord
  belongs_to :organization, optional: true
  belongs_to :actor, polymorphic: true, optional: true
  belongs_to :entity, polymorphic: true, optional: true

  validates :event_name, presence: true
  validates :occurred_at, presence: true
  validates :received_at, presence: true
  validates :source, presence: true
  validates :schema_version, numericality: { greater_than_or_equal_to: 1 }

  scope :for_organization, ->(org_id) { where(organization_id: org_id) }
  scope :by_event, ->(name) { where(event_name: name) }
  scope :in_range, ->(start_time, end_time) { where(occurred_at: start_time..end_time) }
  scope :recent, -> { order(occurred_at: :desc) }

  # Allowed taxonomic event names
  TAXONOMY = %w[
    account.created
    organization.created
    mission.created
    mission.published
    mission.viewed
    mission.completed
    quote.created
    quote.sent
    quote.accepted
    quote.rejected
    order.created
    order.started
    order.completed
    order.cancelled
    subscription.created
    subscription.activated
    subscription.cancelled
    webhook.delivery_succeeded
    webhook.delivery_failed
    operator.profile_viewed
  ].freeze

  def self.valid_event?(name)
    TAXONOMY.include?(name.to_s)
  end
end
