# frozen_string_literal: true

class ReadinessUnavailableDatabase < ActiveRecord::Base
  self.table_name = "audit_logs"
end
