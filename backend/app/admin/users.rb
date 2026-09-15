# frozen_string_literal: true

ActiveAdmin.register User do
  menu parent: "Identidade", priority: 2

  permit_params :email, :first_name, :last_name, :platform_role, :status

  scope :all, default: true
  scope("Admins") { |s| s.where(platform_role: %w[admin super_admin support ops finance compliance]) }
  scope("Ativos") { |s| s.where(status: "active") }

  filter :email
  filter :platform_role, as: :select, collection: %w[user admin super_admin support ops finance compliance]
  filter :status
  filter :created_at

  index do
    selectable_column
    id_column
    column :email
    column :first_name
    column :last_name
    column :platform_role
    column :status do |u|
      status_tag u.status
    end
    column :created_at
    actions
  end

  form do |f|
    f.inputs do
      f.input :email
      f.input :first_name
      f.input :last_name
      f.input :platform_role, as: :select, collection: %w[user admin super_admin support ops finance compliance]
      f.input :status, as: :select, collection: %w[active suspended closed]
    end
    f.actions
  end

  show do
    attributes_table do
      row :id
      row :email
      row :first_name
      row :last_name
      row :platform_role
      row :status
      row :jti
      row :created_at
    end
  end
end
