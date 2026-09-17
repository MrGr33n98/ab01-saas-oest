# frozen_string_literal: true

ActiveAdmin.register Operators::SupportRequest, as: "OperatorSupportRequest" do
  menu parent: "Operações", priority: 9, label: "Operator support"
  actions :index, :show, :edit, :update

  permit_params :status, :priority

  scope :all, default: true
  scope("Open") { |scope| scope.where(status: "open") }
  scope("In progress") { |scope| scope.where(status: "in_progress") }
  scope("Resolved") { |scope| scope.where(status: "resolved") }

  filter :organization
  filter :category, as: :select, collection: Operators::SupportRequest::CATEGORIES
  filter :status, as: :select, collection: Operators::SupportRequest::STATUSES
  filter :priority, as: :select, collection: Operators::SupportRequest::PRIORITIES
  filter :created_at

  index do
    id_column
    column :subject
    column :organization
    column :category
    column :priority
    column :status do |record|
      status_tag record.status
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :subject
      row :organization
      row :requested_by
      row :category
      row :priority
      row(:status) { |record| status_tag record.status }
      row :message
      row :created_at
    end
  end

  form do |f|
    f.inputs "Support workflow" do
      f.input :status, as: :select, collection: Operators::SupportRequest::STATUSES
      f.input :priority, as: :select, collection: Operators::SupportRequest::PRIORITIES
    end
    f.actions
  end
end
