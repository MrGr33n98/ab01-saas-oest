# frozen_string_literal: true

class OrganizationEntitlement < ApplicationRecord
  self.table_name = "organization_entitlements"

  belongs_to :organization

  validates :feature_key, presence: true
  validates :feature_key, uniqueness: { scope: :organization_id }
end
