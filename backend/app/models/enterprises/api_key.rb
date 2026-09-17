# frozen_string_literal: true

module Enterprises
  # API secrets are never persisted in clear text. An approved request becomes
  # active only when an enterprise owner performs the one-time activation call.
  class ApiKey < ApplicationRecord
    self.table_name = "enterprise_api_keys"

    STATUSES = %w[requested approved active revoked cancelled].freeze
    SCOPES = %w[
      missions:read missions:write
      orders:read deliverables:read
      webhooks:read webhooks:write
    ].freeze

    belongs_to :organization
    belongs_to :requested_by, class_name: "User"
    belongs_to :approved_by, class_name: "User", optional: true

    validates :name, presence: true, length: { maximum: 120 }
    validates :status, inclusion: { in: STATUSES }
    validate :scopes_are_supported

    before_validation { self.requested_at ||= Time.current }

    scope :recent_first, -> { order(created_at: :desc) }
    scope :manageable, -> { where(status: %w[requested approved active]) }

    def approved?
      status == "approved"
    end

    def active?
      status == "active" && !expired?
    end

    def expired?
      expires_at.present? && expires_at.past?
    end

    def approve!(actor)
      update!(status: "approved", approved_by: actor, approved_at: Time.current)
    end

    def activate!
      raise ActiveRecord::RecordInvalid, self unless approved?

      secret = generate_secret
      update!(
        status: "active",
        prefix: secret.first(16),
        token_digest: self.class.digest(secret),
        activated_at: Time.current
      )
      secret
    end

    def revoke!
      update!(status: "revoked", revoked_at: Time.current, token_digest: nil)
    end

    def cancel!
      update!(status: "cancelled")
    end

    def self.digest(secret)
      key = Rails.application.secret_key_base
      OpenSSL::HMAC.hexdigest("SHA256", key, secret)
    end

    private

    def generate_secret
      "dh_live_#{SecureRandom.urlsafe_base64(32).tr('-_', 'ab')}"
    end

    def scopes_are_supported
      requested = Array(scopes)
      errors.add(:scopes, "contain unsupported values") unless (requested - SCOPES).empty?
    end
  end
end
