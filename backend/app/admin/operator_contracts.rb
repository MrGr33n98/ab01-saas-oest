# frozen_string_literal: true

ActiveAdmin.register Operators::OperatorContract, as: "OperatorContract" do
  menu parent: "Operações", priority: 6, label: "Operator contracts"

  permit_params :organization_id, :operator_profile_id, :contract_type, :title, :version,
                :status, :document_url, :signed_at, :expires_at

  scope :all, default: true
  scope("Pending") { |scope| scope.where(status: "pending") }
  scope("Active") { |scope| scope.where(status: "active") }
  scope("Expired") { |scope| scope.where(status: "expired") }

  filter :organization
  filter :operator_profile
  filter :contract_type
  filter :status, as: :select, collection: Operators::OperatorContract::STATUSES
  filter :signed_at

  index do
    id_column
    column :title
    column :operator_profile
    column :contract_type
    column :version
    column :status do |record|
      status_tag record.status
    end
    column :signed_at
    column :expires_at
    actions
  end
end
