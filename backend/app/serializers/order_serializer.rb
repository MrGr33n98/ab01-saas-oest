# frozen_string_literal: true

class OrderSerializer < ApplicationSerializer
  attributes :id, :mission_id, :quote_id, :status, :payment_status,
             :currency, :subtotal, :platform_fee, :taxes, :total,
             :created_at, :updated_at

  attribute :customer_organization_id do |o|
    o.customer_organization_id
  end

  attribute :operator_organization_id do |o|
    o.operator_organization_id
  end
end
