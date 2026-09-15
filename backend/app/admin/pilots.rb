# frozen_string_literal: true

ActiveAdmin.register Operators::Pilot, as: "Pilot" do
  menu parent: "Marketplace", priority: 3

  actions :index, :show

  scope :all, default: true
  scope("Disponíveis") { |s| s.where(available: true) }
  scope("Verificados") { |s| s.where(verification_status: "verified") }
  scope("Pendentes") { |s| s.where(verification_status: "pending") }

  filter :full_name
  filter :anac_license
  filter :verification_status
  filter :available
  filter :created_at

  index do
    id_column
    column :full_name
    column :organization
    column :anac_license
    column :verification_status do |p|
      status_tag p.verification_status
    end
    column :available do |p|
      status_tag(p.available ? "yes" : "no")
    end
    column :flight_hours_logged
    actions
  end

  show do
    attributes_table do
      row :id
      row :full_name
      row :organization
      row :anac_license
      row :license_number
      row :email
      row :phone
      row :verification_status
      row :available
      row :flight_hours_logged
      row :created_at
    end
  end
end
