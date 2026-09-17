# frozen_string_literal: true

ActiveAdmin.register Ads::BannerPlacement, as: "AdsPlacement" do
  menu parent: "OEST Ads", priority: 2, label: "Espaços (Placements)"

  permit_params :name, :key, :description, :page_context, :width_hint, :height_hint, :active

  scope "Todos", :all, default: true
  scope("Ativos") { |s| s.where(active: true) }
  scope("Inativos") { |s| s.where(active: false) }
  scope("Categorias") { |s| s.where(page_context: "category") }
  scope("Landing") { |s| s.where(page_context: "landing") }
  scope("Operadores") { |s| s.where(page_context: "operators") }

  filter :name
  filter :key
  filter :page_context, as: :select, collection: %w[global landing category operators services data_products app_shell pricing blog]
  filter :active

  # Seed Action
  collection_action :seed_placements, method: :post do
    Ads::BannerPlacement.seed_catalog!
    redirect_to admin_ads_placements_path, notice: "Catálogo de 19 espaços de anúncios canônicos sincronizado com sucesso!"
  end

  action_item :seed, only: :index do
    link_to "Sincronizar Espaços Canônicos", seed_placements_admin_ads_placements_path, method: :post, class: "button"
  end

  index title: "Espaços Publicitários da Plataforma (Placements Catalog)" do
    selectable_column
    id_column
    column "Chave do Slot", :key do |p|
      code p.key
    end
    column "Nome do Espaço", :name
    column "Contexto da Página", :page_context do |p|
      status_tag p.page_context, class: p.page_context == "category" ? "yes" : "gray"
    end
    column "Dimensões Ideais" do |p|
      "#{p.width_hint} x #{p.height_hint} px"
    end
    column "Campanhas Vinculadas" do |p|
      span p.banners.count, style: "font-weight: bold;"
    end
    column "Status", :active do |p|
      status_tag(p.active? ? "Ativo" : "Inativo", class: p.active? ? "yes" : "no")
    end
    actions
  end

  show do
    attributes_table do
      row :id
      row :key
      row :name
      row :description
      row :page_context
      row :width_hint
      row :height_hint
      row :active
      row :created_at
      row :updated_at
    end

    panel "Campanhas neste Espaço" do
      table_for resource.banners do
        column "Banner / Campanha", :name
        column "Status", :status
        column "Prioridade / Peso" do |b|
          "P:#{b.priority} / W:#{b.weight}"
        end
        column "CTR" do |b|
          b.ctr_percentage
        end
      end
    end
  end

  form do |f|
    f.inputs "Detalhes do Espaço Publicitário" do
      f.input :key, label: "Chave única (ex: category.hero_carousel)"
      f.input :name, label: "Nome descritivo"
      f.input :page_context, as: :select, collection: %w[global landing category operators services data_products app_shell mission_workspace pricing blog]
      f.input :width_hint, label: "Largura ideal (px)"
      f.input :height_hint, label: "Altura ideal (px)"
      f.input :description, as: :text, input_html: { rows: 3 }
      f.input :active, label: "Ativo para entrega de campanhas"
    end
    f.actions
  end
end
