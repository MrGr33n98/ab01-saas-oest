# frozen_string_literal: true

ActiveAdmin.register Operators::Drone, as: "Drone" do
  menu parent: "Marketplace", priority: 4

  actions :index, :show

  scope :all, default: true
  scope("Ativos") { |s| s.where(status: "active") }
  scope("Em Manutenção") { |s| s.where(status: "maintenance") }

  filter :manufacturer
  filter :model
  filter :status
  filter :registration_number

  index do
    id_column
    column :manufacturer
    column :model
    column :organization
    column :registration_number
    column :status do |d|
      status_tag d.status
    end
    column :max_flight_minutes do |d|
      "#{d.max_flight_minutes} min" if d.max_flight_minutes
    end
    actions
  end

  show do
    attributes_table do
      row :id
      row :organization
      row :manufacturer
      row :model
      row :serial_number
      row :registration_number
      row :status
      row :max_flight_minutes
      row :max_payload_grams
      row :created_at
    end
  end
end
