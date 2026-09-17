# frozen_string_literal: true

ActiveAdmin.register Enterprises::ApiKey, as: "EnterpriseApiKey" do
  menu parent: "Operações", priority: 8, label: "API key requests"
  actions :index, :show

  scope :all, default: true
  scope("Requested") { |scope| scope.where(status: "requested") }
  scope("Approved") { |scope| scope.where(status: "approved") }
  scope("Active") { |scope| scope.where(status: "active") }
  scope("Revoked") { |scope| scope.where(status: "revoked") }

  filter :organization
  filter :status, as: :select, collection: Enterprises::ApiKey::STATUSES
  filter :requested_at

  index do
    id_column
    column :organization
    column :name
    column :scopes
    column :status do |key|
      status_tag key.status
    end
    column :requested_by
    column :requested_at
    column :last_used_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :organization
      row :name
      row :prefix
      row :scopes
      row(:status) { |key| status_tag key.status }
      row :requested_by
      row :requested_at
      row :approved_by
      row :approved_at
      row :activated_at
      row :last_used_at
      row :expires_at
    end
  end

  member_action :approve, method: :post do
    resource.approve!(current_admin_user)
    AuditLog.create!(
      organization_id: resource.organization_id,
      actor_id: current_admin_user.id,
      action: "enterprise_api_key.approved",
      auditable_type: resource.class.name,
      auditable_id: resource.id,
      after_data: { status: resource.status }
    )
    redirect_to resource_path, notice: "API key request approved. The enterprise owner can now activate it once."
  end

  member_action :revoke, method: :post do
    resource.revoke!
    redirect_to resource_path, notice: "API key revoked"
  end

  action_item :approve, only: :show, if: proc { resource.status == "requested" } do
    link_to "Approve", approve_admin_enterprise_api_key_path(resource), method: :post,
            data: { confirm: "Approve this API key request?" }
  end

  action_item :revoke, only: :show, if: proc { resource.status.in?(%w[approved active]) } do
    link_to "Revoke", revoke_admin_enterprise_api_key_path(resource), method: :post,
            data: { confirm: "Revoke this API key?" }
  end
end
