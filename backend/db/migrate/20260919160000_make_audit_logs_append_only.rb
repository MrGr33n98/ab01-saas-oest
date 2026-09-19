# frozen_string_literal: true

class MakeAuditLogsAppendOnly < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL
      CREATE OR REPLACE FUNCTION prevent_audit_logs_modification()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RAISE EXCEPTION 'audit_logs are append-only';
      END;
      $$;
    SQL

    execute <<~SQL
      CREATE TRIGGER audit_logs_append_only
      BEFORE UPDATE OR DELETE ON audit_logs
      FOR EACH ROW
      EXECUTE FUNCTION prevent_audit_logs_modification();
    SQL
  end

  def down
    execute "DROP TRIGGER IF EXISTS audit_logs_append_only ON audit_logs"
    execute "DROP FUNCTION IF EXISTS prevent_audit_logs_modification()"
  end
end
