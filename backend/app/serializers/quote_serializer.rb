# frozen_string_literal: true

class QuoteSerializer < ApplicationSerializer
  attributes :id, :mission_id, :status, :subtotal, :platform_fee,
             :taxes, :total, :currency, :proposal_text, :lock_version,
             :estimated_start_at, :estimated_delivery_at, :submitted_at,
             :created_at, :updated_at

  attribute :operator_organization_id do |q|
    q.operator_organization_id
  end

  attribute :customer_organization_id do |q|
    q.customer_organization_id
  end

  attribute :operator_name do |q|
    q.operator_profile&.organization&.name
  end

  attribute :operator_slug do |q|
    q.operator_profile&.slug
  end

  attribute :operator_verified do |q|
    q.operator_profile&.verification_status == "verified"
  end
end
