# frozen_string_literal: true

ActiveAdmin.register WebhookEndpoint do
  menu parent: "Integrations & API", priority: 1, label: "Webhook Endpoints"

  actions :all, except: [:new]

  permit_params :url, :description, :status, events: []

  filter :organization
  filter :url
  filter :status, as: :select, collection: WebhookEndpoint::STATUSES
  filter :created_at

  index do
    selectable_column
    id_column
    column :organization
    column :url
    column :events
    column :status do |endpoint|
      status_tag endpoint.status, class: endpoint.active? ? "ok" : "error"
    end
    column :last_successful_delivery_at
    column :last_failed_delivery_at
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :organization
      row :created_by
      row :url
      row :description
      row("Signing Secret (Masked)") do |endpoint|
        status_tag(endpoint.masked_secret, class: "secret-tag")
      end
      row :events
      row :status do |endpoint|
        status_tag endpoint.status
      end
      row :disabled_at
      row :last_successful_delivery_at
      row :last_failed_delivery_at
      row :created_at
      row :updated_at
    end

    panel "Recent Deliveries" do
      table_for webhook_endpoint.webhook_deliveries.recent.limit(20) do
        column :id
        column :event_type
        column :event_id
        column :status do |d|
          status_tag d.status
        end
        column :attempts_count
        column :created_at
        column :completed_at
      end
    end
  end
end
