# frozen_string_literal: true

class AuditLog < ApplicationRecord
  self.table_name = "audit_logs"

  before_update :prevent_modification
  before_destroy :prevent_modification

  private

  def prevent_modification
    errors.add(:base, "Audit logs are append-only")
    throw(:abort)
  end
end
