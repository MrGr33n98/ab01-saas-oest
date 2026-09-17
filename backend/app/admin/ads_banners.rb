# frozen_string_literal: true

ActiveAdmin.register Ads::Banner, as: "AdsBanner" do
  menu parent: "OEST Ads", priority: 1, label: "Banners & Campanhas"

  permit_params :name, :status, :format_type, :eyebrow, :title, :subtitle, :cta_label, :cta_url,
                :image_url, :background_color, :text_color, :starts_at, :ends_at,
                :priority, :weight, :target_audience, :geo_scope, :organization_id,
                placement_ids: [], targeting: { category_slugs: [], states: [] }

  # Scopes
  scope "Todos", :all, default: true
  scope("Ativos Agora") { |s| s.live }
  scope("Hero Carrossel") { |s| s.where(format_type: "hero_carousel") }
  scope("Rascunhos") { |s| s.where(status: "draft") }
  scope("Agendados") { |s| s.where(status: "scheduled") }
  scope("Pausados") { |s| s.where(status: "paused") }
  scope("Finalizados") { |s| s.where(status: "ended") }

  # Filtros
  filter :name
  filter :status, as: :select, collection: Ads::Banner::STATUSES
  filter :format_type, as: :select, collection: Ads::Banner::FORMAT_TYPES
  filter :placements, as: :select, collection: -> { Ads::BannerPlacement.order(:name) }
  filter :target_audience, as: :select, collection: Ads::Banner::TARGET_AUDIENCES
  filter :starts_at
  filter :ends_at
  filter :created_at

  # Custom Actions
  member_action :duplicate, method: :post do
    new_banner = resource.dup
    new_banner.name = "#{resource.name} (Cópia)"
    new_banner.status = "draft"
    new_banner.impression_count = 0
    new_banner.click_count = 0
    new_banner.save!
    resource.placements.each { |p| new_banner.placements << p }
    redirect_to edit_admin_ads_banner_path(new_banner), notice: "Banner duplicado como rascunho com sucesso."
  end

  action_item :duplicate, only: :show do
    link_to "Duplicar Banner", duplicate_admin_ads_banner_path(resource), method: :post, class: "button"
  end

  # Index View
  index title: "Banners e Campanhas Publicitárias (OEST Ads)" do
    selectable_column
    id_column
    column "Criativo", :name do |banner|
      div style: "display: flex; align-items: center; gap: 10px;" do
        if banner.image_url.present?
          img src: banner.image_url, style: "width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;"
        end
        div do
          b link_to(banner.name, admin_ads_banner_path(banner))
          div style: "font-size: 11px; color: #666;" do
            banner.title.presence || banner.subtitle
          end
        end
      end
    end
    column "Formato", :format_type do |b|
      status_tag b.format_type, class: b.format_type == "hero_carousel" ? "yes" : "no"
    end
    column "Status", :status do |b|
      status_class = case b.status
                     when "active" then "yes"
                     when "scheduled" then "warning"
                     when "draft", "paused" then "no"
                     else "gray"
                     end
      status_tag b.status, class: status_class
    end
    column "Espaços (Slots)" do |b|
      b.placements.map(&:name).join(", ").truncate(40)
    end
    column "Prioridade / Peso" do |b|
      "P:#{b.priority} / W:#{b.weight}"
    end
    column "Métricas (CTR)" do |b|
      div do
        span "👁️ #{b.impression_count.to_i}"
        span " | "
        span "🖱️ #{b.click_count.to_i}"
      end
      div style: "font-weight: bold; color: #1A9E60; font-size: 12px; margin-top: 2px;" do
        "CTR: #{b.ctr_percentage}"
      end
    end
    column "Vigência" do |b|
      div style: "font-size: 11px;" do
        div "De: #{b.starts_at ? b.starts_at.strftime('%d/%m/%Y') : 'Imediato'}"
        div "Até: #{b.ends_at ? b.ends_at.strftime('%d/%m/%Y') : 'Indeterminado'}"
      end
    end
    actions
  end

  # Show View
  show title: ->(b) { "#{b.name} (#{b.format_type})" } do
    columns do
      column span: 2 do
        panel "👁️ Pré-visualização do Banner" do
          div style: "background-color: #{resource.background_color || '#0D192E'}; color: #{resource.text_color || '#FFFFFF'}; padding: 24px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 20px;" do
            div style: "display: flex; align-items: center; gap: 16px; flex: 1;" do
              if resource.image_url.present?
                img src: resource.image_url, style: "width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"
              end
              div do
                if resource.eyebrow.present?
                  div resource.eyebrow.upcase, style: "font-size: 10px; font-weight: bold; letter-spacing: 1px; opacity: 0.7; margin-bottom: 4px;"
                end
                div resource.title.presence || resource.name, style: "font-size: 18px; font-weight: bold; line-height: 1.2;"
                if resource.subtitle.present?
                  div resource.subtitle, style: "font-size: 13px; opacity: 0.85; margin-top: 4px;"
                end
              end
            end
            if resource.cta_url.present?
              a resource.cta_label.presence || "Saiba mais", href: resource.cta_url, target: "_blank", style: "background: #1A9E60; color: #fff; padding: 10px 18px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 13px; white-space: nowrap;"
            end
          end
        end

        panel "📋 Detalhes da Campanha e Criativo" do
          attributes_table_for resource do
            row :name
            row :format_type do |b|
              status_tag b.format_type
            end
            row :status do |b|
              status_tag b.status
            end
            row :eyebrow
            row :title
            row :subtitle
            row :cta_label
            row :cta_url do |b|
              link_to b.cta_url, b.cta_url, target: "_blank" if b.cta_url.present?
            end
            row :image_url do |b|
              link_to b.image_url, b.image_url, target: "_blank" if b.image_url.present?
            end
            row :background_color
            row :text_color
            row :created_at
            row :updated_at
          end
        end

        panel "🎯 Espaços Publicitários Associados" do
          table_for resource.placements do
            column "Chave", :key
            column "Nome do Espaço", :name
            column "Contexto", :page_context
            column "Dimensões Recomendadas" do |p|
              "#{p.width_hint} x #{p.height_hint} px"
            end
          end
        end
      end

      column span: 1 do
        panel "📊 Desempenho & Métricas" do
          attributes_table_for resource do
            row("Total Impressões") { |b| b.impression_count.to_i }
            row("Total Cliques") { |b| b.click_count.to_i }
            row("Taxa de Clique (CTR)") do |b|
              b "#{b.ctr_percentage}", style: "color: #1A9E60; font-size: 16px;"
            end
            row :priority
            row :weight
          end
        end

        panel "🎯 Segmentação & Vigência" do
          attributes_table_for resource do
            row("Audiência Alvo") { |b| b.target_audience.presence || "Todas (all)" }
            row("Escopo Geográfico") { |b| b.geo_scope.presence || "Brasil (BR)" }
            row("Categorias Filtradas") do |b|
              cats = Array(b.targeting["category_slugs"]).compact
              cats.empty? ? "Todas as Categorias" : cats.join(", ")
            end
            row :starts_at
            row :ends_at
          end
        end
      end
    end
  end

  # Form
  form title: ->(b) { b.new_record? ? "Novo Banner Publicitário" : "Editar Banner: #{b.name}" } do |f|
    f.semantic_errors(*f.object.errors.attribute_names)

    f.inputs "1. Informações Básicas & Formato" do
      f.input :name, label: "Nome Interno da Campanha", hint: "Ex: DJI Enterprise - Q3 Energia"
      f.input :status, as: :select, collection: Ads::Banner::STATUSES, prompt: "Selecione o status"
      f.input :format_type, as: :select, collection: [
        ["Hero Carrossel (Categorias & Destaques)", "hero_carousel"],
        ["Leaderboard Horizontal (Topo de Página)", "leaderboard"],
        ["Sidebar Banner (Lateral / Filtros)", "sidebar"],
        ["Card In-feed Patrocinado (No Grid)", "in_feed"],
        ["Footer Banner (Pré-Rodapé)", "footer"],
        ["Ticker Bar Fino (Topo Global)", "ticker"],
        ["Padrão Universal", "standard"]
      ], hint: "Para Hero Banners de Categorias, utilize 'Hero Carrossel'."
      f.input :priority, label: "Prioridade de Entrega", hint: "Números maiores têm precedência (Ex: 10 > 0)."
      f.input :weight, label: "Peso / Probabilidade no Carrossel (1-100)", hint: "Usado para rotação ponderada entre múltiplos anúncios no mesmo slot."
    end

    f.inputs "2. Conteúdo Visual e Criativo" do
      f.input :eyebrow, label: "Eyebrow / Tag Superior", hint: "Ex: LANÇAMENTO EXCLUSIVO, PARCEIRO OFICIAL"
      f.input :title, label: "Título Principal (Headline)", hint: "Ex: Mapeamento Solar e Eólico de Alta Resolução"
      f.input :subtitle, as: :text, input_html: { rows: 3 }, label: "Subtítulo / Descrição Curta", hint: "Texto de apoio visível no banner ou slide do carrossel."
      f.input :cta_label, label: "Texto do Botão CTA", hint: "Ex: Conhecer Sensor, Solicitar Proposta, Saiba mais"
      f.input :cta_url, label: "URL de Destino (CTA URL)", hint: "Link absoluto (https://...) ou relativo (/categories/...)."
      f.input :image_url, label: "URL da Imagem de Fundo / Asset", hint: "Link da imagem de alta resolução do banner."
      f.input :background_color, label: "Cor de Fundo (Hex)", input_html: { value: f.object.background_color.presence || "#0D192E" }
      f.input :text_color, label: "Cor do Texto (Hex)", input_html: { value: f.object.text_color.presence || "#FFFFFF" }
    end

    f.inputs "3. Espaços Publicitários (Placements)" do
      Ads::BannerPlacement.seed_catalog! if Ads::BannerPlacement.count.zero?
      f.input :placements, as: :check_boxes, collection: Ads::BannerPlacement.order(:page_context, :key).map { |p|
        ["[#{p.page_context.upcase}] #{p.name} (#{p.width_hint}x#{p.height_hint}px) - key: #{p.key}", p.id]
      }, hint: "Selecione um ou mais locais onde este anúncio deve ser veiculado."
    end

    f.inputs "4. Segmentação & Regras de Exibição" do
      f.input :target_audience, as: :select, collection: [
        ["Todos os Visitantes", "all"],
        ["Apenas Clientes / Contratantes", "customer"],
        ["Apenas Operadores de Drones", "operator"],
        ["Visitantes Anônimos", "anonymous"]
      ]
      f.input :geo_scope, label: "Escopo Geográfico", input_html: { value: f.object.geo_scope.presence || "BR" }
    end

    f.inputs "5. Agendamento & Vigência" do
      f.input :starts_at, as: :datepicker, label: "Data de Início", hint: "Deixe vazio para veiculação imediata."
      f.input :ends_at, as: :datepicker, label: "Data de Término", hint: "Deixe vazio para veiculação por tempo indeterminado."
    end

    f.actions
  end
end
