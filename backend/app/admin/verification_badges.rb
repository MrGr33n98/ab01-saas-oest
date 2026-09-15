# frozen_string_literal: true

ActiveAdmin.register VerificationBadge do
  menu parent: "Marketplace", priority: 3, label: "Selos"

  permit_params :key, :name, :name_en, :description, :icon, :color, :position, :active

  scope :all, default: true
  scope("Ativos") { |s| s.where(active: true) }

  filter :key
  filter :name
  filter :active

  index do
    column :position
    column :key
    column :name
    column :icon
    column :active
    actions
  end

  form do |f|
    f.inputs do
      f.input :key
      f.input :name
      f.input :name_en
      f.input :description
      f.input :icon
      f.input :color
      f.input :position
      f.input :active
    end
    f.actions
  end
end
