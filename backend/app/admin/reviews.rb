# frozen_string_literal: true

ActiveAdmin.register Reviews::Review, as: "Review" do
  menu parent: "Marketplace", priority: 5

  actions :index, :show

  filter :operator_profile
  filter :rating
  filter :created_at

  index do
    id_column
    column :mission
    column :operator_profile
    column :rating do |r|
      "⭐ #{r.rating}"
    end
    column :author_organization_id
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :mission
      row :operator_profile
      row :rating
      row :body
      row :author_organization_id
      row :created_at
    end
  end
end
