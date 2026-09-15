# frozen_string_literal: true

ActiveAdmin.register Deliverables::Deliverable, as: "Deliverable" do
  menu parent: "Operações", priority: 2

  actions :index, :show

  scope :all, default: true
  scope("Aguardando Revisão") { |s| s.where(status: "uploaded") }
  scope("Aprovados") { |s| s.where(status: "approved") }
  scope("Rejeitados") { |s| s.where(status: "rejected") }

  filter :title
  filter :status
  filter :version
  filter :created_at

  index do
    id_column
    column :title
    column :mission
    column :version
    column :status do |d|
      status_tag d.status
    end
    column :file_size_bytes do |d|
      d.file_size_bytes ? "#{(d.file_size_bytes / (1024.0 * 1024.0)).round(2)} MB" : "—"
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :mission
      row :title
      row :status
      row :version
      row :storage_key
      row :file_size_bytes
      row :checksum_sha256
      row :rejection_reason
      row :created_at
      row :updated_at
    end
  end
end
