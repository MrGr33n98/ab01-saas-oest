# frozen_string_literal: true

class MissionSerializer < ApplicationSerializer
  attributes :id, :title, :description, :status, :mission_type,
             :area_hectares, :estimated_budget_min, :estimated_budget_max,
             :currency, :deadline_at, :created_at, :updated_at

  attribute :organization_id do |mission|
    mission.organization_id
  end

  attribute :project_id do |mission|
    mission.project_id
  end

  attribute :has_geometry do |mission|
    mission.geometry.present?
  end

  many :products, proc: [MissionProductSerializer] if defined?(MissionProductSerializer)
end
