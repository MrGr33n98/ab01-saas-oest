# frozen_string_literal: true

ActiveAdmin.register Ads::BannerEvent, as: "AdsEvent" do
  menu parent: "OEST Ads", priority: 3, label: "Auditoria & Eventos"

  actions :index, :show, :destroy

  scope "Todos", :all, default: true
  scope("Impressões") { |s| s.where(event_type: "impression") }
  scope("Cliques") { |s| s.where(event_type: "click") }

  filter :banner, as: :select, collection: -> { Ads::Banner.order(:name) }
  filter :event_type, as: :select, collection: %w[impression click]
  filter :category_slug
  filter :page_path
  filter :occurred_at

  index title: "Registro Analítico de Eventos (OEST Ads)" do
    selectable_column
    id_column
    column "Tipo", :event_type do |e|
      status_tag e.event_type, class: e.event_type == "click" ? "yes" : "gray"
    end
    column "Banner / Campanha", :banner do |e|
      e.banner ? link_to(e.banner.name, admin_ads_banner_path(e.banner)) : "-"
    end
    column "Espaço (Slot)", :banner_placement do |e|
      e.banner_placement&.key || "-"
    end
    column "Categoria", :category_slug do |e|
      e.category_slug.presence || "Global"
    end
    column "Caminho da Página", :page_path do |e|
      e.page_path.to_s.truncate(40)
    end
    column "Data / Hora", :occurred_at do |e|
      e.occurred_at.strftime("%d/%m/%Y %H:%M:%S")
    end
    actions
  end

  show do
    attributes_table do
      row :id
      row :event_type do |e|
        status_tag e.event_type
      end
      row :banner
      row :banner_placement
      row :category_slug
      row :page_path
      row :session_id
      row :request_id
      row :user_id
      row :organization_id
      row :meta
      row :occurred_at
      row :created_at
    end
  end
end
