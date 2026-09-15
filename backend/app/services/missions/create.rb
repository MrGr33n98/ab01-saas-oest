# frozen_string_literal: true

module Missions
  class Create
    Result = Struct.new(:success?, :mission, :errors, keyword_init: true)

    def self.call(**args)
      new(**args).call
    end

    def initialize(organization:, user:, project:, attributes:)
      @organization = organization
      @user = user
      @project = project
      @attributes = attributes
    end

    def call
      mission = Missions::Mission.new(
        organization: organization,
        project: project,
        created_by: user,
        title: attributes[:title],
        description: attributes[:description],
        mission_type: attributes[:mission_type],
        priority: attributes.fetch(:priority, "normal"),
        preferred_start_at: attributes[:preferred_start_at],
        deadline_at: attributes[:deadline_at],
        estimated_budget_min: attributes.dig(:budget, :min),
        estimated_budget_max: attributes.dig(:budget, :max),
        currency: attributes.dig(:budget, :currency) || "BRL",
        status: "draft"
      )

      if mission.save
        record_status_event(mission)
        publish_outbox(mission)
        Result.new(success?: true, mission: mission, errors: [])
      else
        Result.new(success?: false, mission: nil, errors: mission.errors.full_messages)
      end
    end

    private

    attr_reader :organization, :user, :project, :attributes

    def record_status_event(mission)
      Missions::MissionStatusEvent.create!(
        mission: mission,
        actor: user,
        from_status: nil,
        to_status: "draft",
        reason_code: "created"
      )
    end

    def publish_outbox(mission)
      DomainOutboxEvent.create!(
        aggregate_type: "mission",
        aggregate_id: mission.id,
        event_type: "mission.created",
        payload: {
          mission_id: mission.id,
          organization_id: organization.id,
          project_id: project.id
        },
        occurred_at: Time.current
      )
    end
  end
end
