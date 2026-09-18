# frozen_string_literal: true

ActiveAdmin.register WebhookDelivery do
  menu parent: "Integrations & API", priority: 2, label: "Webhook Deliveries"

  actions :index, :show

  filter :organization
  filter :webhook_endpoint
  filter :event_type
  filter :event_id
  filter :status, as: :select, collection: WebhookDelivery::STATUSES
  filter :created_at

  index do
    id_column
    column :organization
    column :webhook_endpoint
    column :event_type
    column :status do |delivery|
      status_tag delivery.status, class: delivery.status == "succeeded" ? "ok" : "error"
    end
    column :attempts_count
    column :created_at
    column :completed_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :organization
      row :webhook_endpoint
      row :event_type
      row :event_id
      row :status do |delivery|
        status_tag delivery.status
      end
      row :attempts_count
      row :next_retry_at
      row :completed_at
      row :payload do |delivery|
        pre JSON.pretty_generate(delivery.payload) rescue delivery.payload.to_s
      end
      row :created_at
    end

    panel "Delivery Attempts" do
      table_for webhook_delivery.webhook_attempts.order(attempt_number: :asc) do
        column :attempt_number
        column :status do |att|
          status_tag att.status
        end
        column :response_status_code
        column :duration_ms do |att|
          "#{att.duration_ms} ms" if att.duration_ms
        end
        column :error_class
        column :error_message
        column :attempted_at
      end
    end
  end
end
