# frozen_string_literal: true

ActiveAdmin.register Cms::Post, as: "CmsPost" do
  menu parent: "Conteúdo", priority: 1, label: "Posts"

  permit_params :slug, :title, :excerpt, :body, :locale, :status, :meta_title, :meta_description,
                :published_at, :author_name, tags: [], faq_blocks: []

  scope :all, default: true
  scope("Publicados") { |s| s.where(status: "published") }
  scope("Draft") { |s| s.where(status: "draft") }
  scope("PT") { |s| s.where(locale: "pt-BR") }
  scope("EN") { |s| s.where(locale: "en") }

  filter :title
  filter :slug
  filter :locale
  filter :status
  filter :published_at

  index do
    selectable_column
    id_column
    column :title
    column :locale
    column :status do |p|
      status_tag p.status
    end
    column :published_at
    actions
  end

  form do |f|
    f.inputs do
      f.input :title
      f.input :slug
      f.input :locale, as: :select, collection: %w[pt-BR en]
      f.input :status, as: :select, collection: %w[draft published archived]
      f.input :excerpt
      f.input :body, as: :text
      f.input :meta_title
      f.input :meta_description
      f.input :author_name
      f.input :published_at, as: :datepicker
    end
    f.actions
  end
end
