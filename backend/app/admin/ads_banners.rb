# frozen_string_literal: true

ActiveAdmin.register Ads::Banner, as: "AdsBanner" do
  menu parent: "Growth", priority: 1, label: "Banners"

  permit_params :name, :status, :image_url, :link_url, :alt_text, :starts_at, :ends_at, :priority

  scope :all, default: true
  scope("Ativos") { |s| s.where(status: "active") }
  scope("Draft") { |s| s.where(status: "draft") }

  filter :name
  filter :status
  filter :starts_at
  filter :ends_at

  index do
    selectable_column
    id_column
    column :name
    column :status
    column :priority
    column :starts_at
    column :ends_at
    actions
  end

  form do |f|
    f.inputs do
      f.input :name
      f.input :status, as: :select, collection: %w[draft active paused archived]
      f.input :image_url
      f.input :link_url
      f.input :alt_text
      f.input :priority
      f.input :starts_at, as: :datepicker
      f.input :ends_at, as: :datepicker
    end
    f.actions
  end
end
