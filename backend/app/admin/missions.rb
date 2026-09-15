# frozen_string_literal: true

ActiveAdmin.register Missions::Mission, as: "Mission" do
  menu parent: "Operações", priority: 1

  actions :index, :show

  scope :all, default: true
  scope("Draft") { |s| s.where(status: "draft") }
  scope("Publicadas") { |s| s.where(status: %w[published quoting]) }
  scope("Em execução") { |s| s.where(status: %w[in_progress processing]) }
  scope("Concluídas") { |s| s.where(status: "completed") }

  filter :title
  filter :status
  filter :mission_type
  filter :organization
  filter :created_at
  filter :published_at

  index do
    id_column
    column :title
    column :status do |m|
      status_tag m.status
    end
    column :mission_type
    column :organization
    column :area_hectares
    column :published_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :title
      row :status
      row :mission_type
      row :organization
      row :project
      row :area_hectares
      row :currency
      row :published_at
      row :completed_at
      row :created_at
    end
  end
end
