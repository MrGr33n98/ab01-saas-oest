# frozen_string_literal: true

ActiveAdmin.register Quotes::Quote, as: "Quote" do
  menu parent: "Comércio", priority: 2

  actions :index, :show

  scope :all, default: true
  scope("Submetidas") { |s| s.where(status: "submitted") }
  scope("Aceitas") { |s| s.where(status: "accepted") }
  scope("Rejeitadas") { |s| s.where(status: "rejected") }

  filter :mission
  filter :status
  filter :created_at

  index do
    id_column
    column :mission
    column :operator_profile
    column :status do |q|
      status_tag q.status
    end
    column :total do |q|
      "R$ #{q.total}"
    end
    column :submitted_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :mission
      row :customer_organization_id
      row :operator_organization_id
      row :operator_profile
      row :status
      row :proposal_text
      row :subtotal
      row :platform_fee
      row :taxes
      row :total
      row :currency
      row :estimated_start_at
      row :estimated_delivery_at
      row :submitted_at
      row :created_at
    end
  end
end
