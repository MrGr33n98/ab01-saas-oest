# frozen_string_literal: true

ActiveAdmin.register Marketplace::ServiceCategory, as: "ServiceCategory" do
  menu parent: "Marketplace", priority: 2, label: "Categorias"

  permit_params :slug, :name, :name_en, :description, :position, :active

  scope :all, default: true
  scope("Ativas") { |s| s.where(active: true) }

  filter :slug
  filter :name
  filter :active

  index do
    selectable_column
    column :position
    column :slug
    column :name
    column :active
    actions
  end

  form do |f|
    f.inputs do
      f.input :slug
      f.input :name
      f.input :name_en
      f.input :description
      f.input :position
      f.input :active
    end
    f.actions
  end
end
