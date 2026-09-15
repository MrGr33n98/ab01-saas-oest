# frozen_string_literal: true

module Matching
  class RunForMissionJob < ApplicationJob
    queue_as :default

    def perform(mission_id)
      mission = Missions::Mission.find(mission_id)
      candidates = Matching::BuildCandidateSet.call(mission: mission)
      mission.update!(
        metadata: mission.metadata.merge(
          "matching" => {
            "ran_at" => Time.current.iso8601,
            "candidate_count" => candidates.size,
            "algorithm_version" => "v1",
            "candidates" => candidates.first(25)
          }
        )
      )
      DomainOutboxEvent.create!(
        aggregate_type: "mission",
        aggregate_id: mission.id,
        event_type: "mission.matching_completed",
        payload: { mission_id: mission.id, candidate_count: candidates.size },
        occurred_at: Time.current
      )

      candidates.first(25).each do |c|
        profile = Operators::OperatorProfile.find_by(id: c[:operator_id] || c["operator_id"])
        next unless profile
        OrganizationMembership.where(organization_id: profile.organization_id, status: "active", role: %w[owner admin]).find_each do |m|
          Mail::Deliver.call(:job_invite, user: m.user, mission: mission, operator_profile: profile) if m.user
        end
      rescue StandardError => e
        Rails.logger.warn({ event: "job_invite_mail_failed", error: e.message }.to_json)
      end
    end
  end
end
