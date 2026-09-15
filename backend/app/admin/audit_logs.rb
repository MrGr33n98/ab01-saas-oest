# frozen_string_literal: true

ActiveAdmin.register AuditLog, as: "AuditLog" do
  menu parent: "Plataforma", priority: 1

  actions :index, :show

  filter :action
  filter :actor_id
  filter :auditable_type
  filter :created_at

  index do
    id_column
    column :action
    column :actor_id
    column :auditable_type
    column :auditable_id
    column :organization_id
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :action
      row :actor_id
      row :auditable_type
      row :auditable_id
      row :organization_id
      row :before_data
      row :after_data
      row :created_at
    end
  end
end
