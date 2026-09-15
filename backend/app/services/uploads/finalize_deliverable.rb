# frozen_string_literal: true

module Uploads
  class FinalizeDeliverable
    Result = Struct.new(:success?, :deliverable, :errors, keyword_init: true)

    def self.call(mission:, organization:, user:, data_product_id:, title:, storage_key:, checksum_sha256: nil, file_size_bytes: nil)
      new(
        mission: mission,
        organization: organization,
        user: user,
        data_product_id: data_product_id,
        title: title,
        storage_key: storage_key,
        checksum_sha256: checksum_sha256,
        file_size_bytes: file_size_bytes
      ).call
    end

    def initialize(mission:, organization:, user:, data_product_id:, title:, storage_key:, checksum_sha256:, file_size_bytes:)
      @mission = mission
      @organization = organization
      @user = user
      @data_product_id = data_product_id
      @title = title
      @storage_key = storage_key
      @checksum_sha256 = checksum_sha256
      @file_size_bytes = file_size_bytes
    end

    def call
      return fail!("storage_key required") if storage_key.blank?
      return fail!("mission not in executable state") unless mission.status.in?(%w[in_progress processing operator_selected scheduled])

      version = Deliverables::Deliverable.where(mission_id: mission.id, data_product_id: data_product_id).maximum(:version).to_i + 1

      deliverable = nil
      ActiveRecord::Base.transaction do
        deliverable = Deliverables::Deliverable.create!(
          organization_id: organization.id,
          mission_id: mission.id,
          data_product_id: data_product_id,
          uploaded_by_id: user.id,
          title: title.presence || "Deliverable",
          status: "in_review",
          storage_key: storage_key,
          checksum_sha256: checksum_sha256,
          file_size_bytes: file_size_bytes,
          version: version
        )

        DomainOutboxEvent.create!(
          aggregate_type: "deliverable",
          aggregate_id: deliverable.id,
          event_type: "deliverable.uploaded",
          payload: { deliverable_id: deliverable.id, mission_id: mission.id },
          occurred_at: Time.current
        )

        if mission.status == "in_progress"
          from = mission.status
          mission.update!(status: "review")
          Missions::MissionStatusEvent.create!(
            mission: mission,
            actor_id: user.id,
            from_status: from,
            to_status: "review",
            reason_code: "deliverable_uploaded",
            created_at: Time.current
          )
        end
      end

      Notifications::Notify.deliverable_ready(mission: mission, deliverable: deliverable)
      Result.new(success?: true, deliverable: deliverable, errors: [])
    rescue ActiveRecord::RecordInvalid => e
      fail!(e.record.errors.full_messages.join(", "))
    end

    private

    attr_reader :mission, :organization, :user, :data_product_id, :title, :storage_key, :checksum_sha256, :file_size_bytes

    def fail!(msg)
      Result.new(success?: false, deliverable: nil, errors: [msg])
    end
  end
end
