# frozen_string_literal: true

module TenantScope
  module_function

  def resolve(model_class, organization:)
    raise ArgumentError, "organization is required" if organization.nil?

    col = if model_class.column_names.include?("organization_id")
            :organization_id
          elsif model_class.column_names.include?("customer_organization_id")
            :customer_organization_id
          else
            raise ArgumentError, "#{model_class.name} is not tenant-aware"
          end

    model_class.where(col => organization.id)
  end

  def find!(model_class, id, organization:)
    resolve(model_class, organization: organization).find(id)
  end

  def find_order!(id, organization:)
    Orders::Order.where(customer_organization_id: organization.id)
                 .or(Orders::Order.where(operator_organization_id: organization.id))
                 .find(id)
  end

  def find_quote!(id, organization:)
    Quotes::Quote.where(customer_organization_id: organization.id)
                 .or(Quotes::Quote.where(operator_organization_id: organization.id))
                 .find(id)
  end

  def find_deliverable!(id, organization:)
    d = Deliverables::Deliverable.find(id)
    mission = d.mission
    allowed = mission && (
      mission.organization_id == organization.id ||
      (mission.respond_to?(:order) && mission.order&.operator_organization_id == organization.id) ||
      (d.respond_to?(:organization_id) && d.organization_id == organization.id)
    )
    raise ActiveRecord::RecordNotFound unless allowed
    d
  end

  def find_mission!(id, organization:)
    m = Missions::Mission.find(id)
    allowed = m.organization_id == organization.id ||
              (m.respond_to?(:order) && m.order&.operator_organization_id == organization.id) ||
              Quotes::Quote.where(mission_id: m.id, operator_organization_id: organization.id).exists?
    raise ActiveRecord::RecordNotFound unless allowed
    m
  end
end
