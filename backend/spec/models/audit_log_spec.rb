# frozen_string_literal: true

require "rails_helper"

RSpec.describe AuditLog, type: :model do
  def create_audit_log!
    described_class.create!(action: "mission.published", metadata: { source: "spec" })
  end

  it "permits normal inserts" do
    expect { create_audit_log! }.to change(described_class, :count).by(1)
  end

  it "rejects updates at the Rails layer" do
    audit_log = create_audit_log!

    expect(audit_log.update(action: "mission.cancelled")).to be(false)
    expect(audit_log.errors[:base]).to include("Audit logs are append-only")
    expect(audit_log.reload.action).to eq("mission.published")
  end

  it "rejects update_columns at the PostgreSQL layer" do
    audit_log = create_audit_log!

    expect { audit_log.update_columns(action: "mission.cancelled") }
      .to raise_error(ActiveRecord::StatementInvalid, /audit_logs are append-only/)
  end

  it "rejects destroy at the Rails layer" do
    audit_log = create_audit_log!

    expect(audit_log.destroy).to be(false)
    expect(described_class.exists?(audit_log.id)).to be(true)
  end

  it "rejects delete_all at the PostgreSQL layer" do
    audit_log = create_audit_log!

    expect { described_class.where(id: audit_log.id).delete_all }
      .to raise_error(ActiveRecord::StatementInvalid, /audit_logs are append-only/)
  end
end
