# frozen_string_literal: true

class OperatorProfileSerializer < ApplicationSerializer
  attributes :id, :organization_id, :slug, :headline, :about,
             :verification_status, :missions_completed, :rating_average,
             :rating_count, :accepting_jobs, :searchable, :created_at, :updated_at

  attribute :company_name do |p|
    p.organization&.legal_name || p.organization&.name
  end

  attribute :city do |p|
    p.organization&.city
  end

  attribute :state_code do |p|
    p.organization&.state_code
  end
end
