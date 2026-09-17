# frozen_string_literal: true

ActiveAdmin.register Operators::AssociatedOperator, as: "OperatorAssociatedOperator" do
  menu parent: "Marketplace", priority: 4, label: "Associated operators"

  permit_params :operator_profile_id, :organization_id, :full_name, :email, :phone_e164,
                :company_name, :country_code, :state_code, :city, :license_number, :status, :source

  scope :all, default: true
  scope("Active") { |scope| scope.where(status: "active") }
  scope("CSV import") { |scope| scope.where(source: "csv") }

  filter :operator_profile
  filter :organization
  filter :full_name
  filter :email
  filter :status, as: :select, collection: Operators::AssociatedOperator::STATUSES
  filter :source, as: :select, collection: Operators::AssociatedOperator::SOURCES

  index do
    selectable_column
    id_column
    column :full_name
    column :operator_profile
    column :email
    column :city
    column :state_code
    column :license_number
    column :status do |record|
      status_tag record.status
    end
    column :source
    actions
  end
end
