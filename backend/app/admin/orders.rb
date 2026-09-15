# frozen_string_literal: true

ActiveAdmin.register Orders::Order, as: "Order" do
  menu parent: "Comércio", priority: 1

  actions :index, :show

  scope :all, default: true
  scope("Aguardando Pagamento") { |s| s.where(status: "pending_payment") }
  scope("Pagas") { |s| s.where(payment_status: "paid") }
  scope("Concluídas") { |s| s.where(status: "completed") }
  scope("Canceladas") { |s| s.where(status: "cancelled") }

  filter :id
  filter :status
  filter :payment_status
  filter :created_at

  index do
    id_column
    column :mission
    column :customer_organization
    column :operator_organization
    column :status do |o|
      status_tag o.status
    end
    column :payment_status do |o|
      status_tag o.payment_status || "pending"
    end
    column :total do |o|
      "R$ #{o.total}"
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :mission
      row :customer_organization
      row :operator_organization
      row :status
      row :payment_status
      row :subtotal
      row :marketplace_fee
      row :operator_amount
      row :taxes
      row :total
      row :currency
      row :accepted_at
      row :completed_at
      row :created_at
    end
  end
end
