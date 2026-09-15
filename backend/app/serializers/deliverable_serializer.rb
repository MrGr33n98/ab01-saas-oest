# frozen_string_literal: true

class DeliverableSerializer < ApplicationSerializer
  attributes :id, :mission_id, :data_product_id, :title, :status,
             :version, :storage_key, :file_size_bytes, :checksum_sha256,
             :rejection_reason, :created_at, :updated_at

  attribute :download_ready do |d|
    d.status == "approved" || d.status == "uploaded"
  end
end
