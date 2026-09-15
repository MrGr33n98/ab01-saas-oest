# frozen_string_literal: true

module Deliverables
  class Asset < ApplicationRecord
    self.table_name = "assets"

    belongs_to :organization, optional: true

    validates :asset_type, :filename, :content_type, :storage_key, presence: true
    validates :storage_key, uniqueness: true
  end
end
