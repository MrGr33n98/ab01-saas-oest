# frozen_string_literal: true

class WebhookEndpoint < ApplicationRecord
  SUPPORTED_EVENTS = %w[
    order.created
    order.updated
    order.completed
    order.cancelled
    mission.published
    mission.status_changed
    mission.completed
    pilot.assigned
    deliverable.uploaded
    invoice.generated
  ].freeze

  STATUSES = %w[active disabled failed].freeze

  belongs_to :organization
  belongs_to :created_by, class_name: "User", optional: true
  has_many :webhook_deliveries, dependent: :destroy

  validates :url, presence: true, length: { maximum: 2048 }
  validates :url, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]), message: "must be a valid HTTP/HTTPS URL" }
  validates :secret_key, presence: true, length: { minimum: 16, maximum: 128 }
  validates :status, inclusion: { in: STATUSES }
  validate :validate_events_list

  before_validation :generate_secret_key, on: :create, if: -> { secret_key.blank? }

  scope :active, -> { where(status: "active") }
  scope :for_event, ->(event_name) { active.where("events ? :event OR events ? '*'", event: event_name.to_s) }

  def subscribed_to?(event_name)
    events.include?("*") || events.include?(event_name.to_s)
  end

  def active?
    status == "active"
  end

  def disable!
    update!(status: "disabled", disabled_at: Time.current)
  end

  def enable!
    update!(status: "active", disabled_at: nil)
  end

  def masked_secret
    return "[REDACTED]" if secret_key.blank?
    return secret_key if secret_key.length < 12

    "#{secret_key[0..7]}...#{secret_key[-4..]}"
  end

  # Previne vazamento em logs/debug
  def inspect
    "#<WebhookEndpoint id: #{id.inspect}, organization_id: #{organization_id.inspect}, url: #{url.inspect}, status: #{status.inspect}, secret_key: [FILTERED]>"
  end

  # Oculta secret_key por padrão na serialização
  def serializable_hash(options = nil)
    opts = options ? options.dup : {}
    opts[:except] = Array(opts[:except]) + [:secret_key] unless opts[:include_secret]
    super(opts)
  end

  private

  def generate_secret_key
    self.secret_key = "whsec_#{SecureRandom.hex(24)}"
  end

  def validate_events_list
    return if events.is_a?(Array) && events.any? && (events - SUPPORTED_EVENTS - ["*"]).empty?

    errors.add(:events, "must contain at least one valid event or '*' (wildcard)")
  end
end
