# frozen_string_literal: true

module AdminAuthorization
  extend ActiveSupport::Concern

  ADMIN_ROLES = %w[admin super_admin support ops finance compliance].freeze

  private

  def require_platform_admin!(*roles)
    roles = ADMIN_ROLES if roles.empty?
    u = current_user
    role = u.try(:platform_role).to_s
    ok = u.try(:platform_admin?) || roles.map(&:to_s).include?(role)
    return if ok

    render json: { title: "Forbidden", status: 403, code: "FORBIDDEN", request_id: request.headers["X-Request-Id"] }, status: 403
  end

  def admin_audit!(action:, auditable: nil, after: {})
    AuditLog.create!(
      organization_id: auditable.try(:organization_id),
      actor_id: current_user.id,
      action: action,
      auditable_type: auditable&.class&.name,
      auditable_id: auditable.try(:id),
      after_data: after,
      created_at: Time.current
    )
  rescue StandardError => e
    Rails.logger.warn({ event: "admin_audit_failed", error: e.message, action: action }.to_json)
  end
end
