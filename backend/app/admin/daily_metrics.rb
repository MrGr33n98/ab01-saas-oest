# frozen_string_literal: true

ActiveAdmin.register DailyTenantMetric do
  menu priority: 17, label: "Tenant Daily Metrics", parent: "Platform Ops"
  actions :index, :show

  filter :organization
  filter :metric_name
  filter :date

  index do
    selectable_column
    id_column
    column :organization
    column :date
    column :metric_name
    column :value
    column :updated_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :organization
      row :date
      row :metric_name
      row :value
      row :metadata do |m|
        pre JSON.pretty_generate(m.metadata || {})
      end
      row :created_at
      row :updated_at
    end
  end
end
