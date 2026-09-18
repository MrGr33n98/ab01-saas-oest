# frozen_string_literal: true

ActiveAdmin.register TelemetryEvent do
  menu priority: 16, label: "Telemetry Events", parent: "Platform Ops"
  actions :index, :show

  filter :organization
  filter :event_name, as: :select, collection: -> { TelemetryEvent::TAXONOMY }
  filter :source
  filter :request_id
  filter :occurred_at

  index do
    selectable_column
    id_column
    column :organization
    column :event_name
    column :actor_type
    column :entity_type
    column :source
    column :occurred_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :organization
      row :event_name
      row :actor_type
      row :actor_id
      row :entity_type
      row :entity_id
      row :session_id
      row :request_id
      row :source
      row :schema_version
      row :occurred_at
      row :received_at
      row :properties do |event|
        pre JSON.pretty_generate(event.properties || {})
      end
      row :created_at
    end
  end
end
