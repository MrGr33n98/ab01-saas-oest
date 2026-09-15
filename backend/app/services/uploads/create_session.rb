# frozen_string_literal: true

module Uploads
  class CreateSession
    Result = Struct.new(:success?, :asset, :upload_url, :storage_key, :errors, keyword_init: true)

    ALLOWED_CONTENT_TYPES = %w[
      image/tiff image/geotiff image/jpeg image/png
      application/geo+json application/json application/pdf application/zip
      application/octet-stream text/csv
    ].freeze

    MAX_BYTES = 5 * 1024 * 1024 * 1024

    def self.call(**args)
      new(**args).call
    end

    def initialize(organization:, user:, filename:, content_type:, byte_size:, owner_type: nil, owner_id: nil)
      @organization = organization
      @user = user
      @filename = filename
      @content_type = content_type
      @byte_size = byte_size.to_i
      @owner_type = owner_type
      @owner_id = owner_id
    end

    def call
      return fail!("content_type not allowed") unless allowed?
      return fail!("file too large") if byte_size > MAX_BYTES
      return fail!("filename required") if filename.blank?

      key = "org/#{organization.id}/#{Time.current.strftime('%Y/%m/%d')}/#{SecureRandom.uuid}/#{safe_name}"
      asset = Deliverables::Asset.create!(
        organization_id: organization.id,
        owner_type: owner_type,
        owner_id: owner_id,
        asset_type: "deliverable",
        filename: safe_name,
        content_type: content_type,
        file_size_bytes: byte_size,
        storage_key: key,
        processing_status: "pending",
        virus_scan_status: "pending"
      )
      url = Integrations::Storage::S3Presigner.new.presign_put(key: key, content_type: content_type)
      Result.new(success?: true, asset: asset, upload_url: url, storage_key: key, errors: [])
    rescue ActiveRecord::RecordInvalid => e
      fail!(e.record.errors.full_messages.join(", "))
    rescue StandardError => e
      fail!("presign failed: #{e.message}")
    end

    private

    attr_reader :organization, :user, :filename, :content_type, :byte_size, :owner_type, :owner_id

    def fail!(msg)
      Result.new(success?: false, asset: nil, upload_url: nil, storage_key: nil, errors: [msg])
    end

    def allowed?
      ALLOWED_CONTENT_TYPES.include?(content_type) || content_type.to_s.start_with?("image/")
    end

    def safe_name
      filename.to_s.gsub(/[^\w.\-]+/, "_").slice(0, 200)
    end
  end
end
