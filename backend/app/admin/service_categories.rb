# frozen_string_literal: true

ActiveAdmin.register Marketplace::ServiceCategory, as: "Category" do
  menu parent: "Marketplace", priority: 1, label: "Categorias & CMS"

  permit_params :name, :short_name, :slug, :parent_id, :position, :icon_key, :featured, :active,
                :eyebrow, :headline, :subheadline, :short_description, :long_description, :ai_summary,
                :hero_image_url, :hero_image_mobile_url, :hero_image_alt, :hero_image_caption, :hero_focal_x, :hero_focal_y,
                :overview_title, :overview_body, :services_title, :services_description,
                :use_cases_title, :use_cases_description, :operators_title, :operators_description,
                :faq_title, :faq_description, :related_categories_title,
                :bottom_cta_title, :bottom_cta_description, :bottom_cta_primary_label, :bottom_cta_primary_url,
                :bottom_cta_secondary_label, :bottom_cta_secondary_url,
                :seo_title, :seo_description, :seo_keywords, :canonical_url_override,
                :robots_index, :robots_follow, :schema_type,
                :og_title, :og_description, :og_image_url, :twitter_title, :twitter_description, :twitter_image_url,
                :answer_summary, :entity_description,
                :status, :published_at, :scheduled_at, :archived_at, :lock_version,
                faqs_attributes: %i[id question short_answer answer position published _destroy],
                use_cases_attributes: %i[id title short_description body icon_key position published _destroy]

  # Scopes de Status e Qualidade Editorial
  scope "Todas", :all, default: true
  scope("Publicadas") { |s| s.where(status: "published", active: true) }
  scope("Rascunhos") { |s| s.where(status: "draft") }
  scope("Em Revisão") { |s| s.where(status: "review") }
  scope("Destaques") { |s| s.where(featured: true) }
  scope("Sem SEO") { |s| s.missing_seo }
  scope("Sem Hero Banner") { |s| s.missing_hero }
  scope("Arquivadas") { |s| s.where(status: "archived") }

  # Filtros
  filter :name
  filter :slug
  filter :status, as: :select, collection: Marketplace::ServiceCategory.statuses.keys
  filter :featured
  filter :parent
  filter :robots_index
  filter :created_at
  filter :published_at

  # Custom Actions
  member_action :publish, method: :put do
    Categories::Publish.call(category: resource, actor: current_user)
    redirect_to resource_path, notice: "Categoria '#{resource.name}' publicada com sucesso!"
  end

  member_action :archive, method: :put do
    Categories::Archive.call(category: resource, actor: current_user)
    redirect_to resource_path, notice: "Categoria '#{resource.name}' arquivada."
  end

  member_action :duplicate, method: :post do
    new_cat = Categories::Duplicate.call(category: resource, actor: current_user)
    redirect_to edit_admin_category_path(new_cat), notice: "Cópia criada como rascunho. Edite os campos abaixo."
  end

  action_item :publish, only: :show, if: -> { resource.status != "published" } do
    link_to "Publicar Categoria", publish_admin_category_path(resource), method: :put, class: "button primary"
  end

  action_item :archive, only: :show, if: -> { resource.status != "archived" } do
    link_to "Arquivar", archive_admin_category_path(resource), method: :put, data: { confirm: "Tem certeza que deseja arquivar?" }
  end

  action_item :duplicate, only: :show do
    link_to "Duplicar Categoria", duplicate_admin_category_path(resource), method: :post
  end

  action_item :view_public, only: :show do
    link_to "Ver no Frontend ↗", "/categories/#{resource.slug}", target: "_blank"
  end

  # Index Page
  index do
    selectable_column
    column "Pos.", :position
    column "Nome", :name do |c|
      link_to c.name, admin_category_path(c), class: "font-semibold"
    end
    column "Slug", :slug
    column "Status", :status do |c|
      status_tag(c.status, class: c.status == "published" ? "yes" : "no")
    end
    column "Destaque", :featured do |c|
      c.featured? ? status_tag("Sim", class: "yes") : "—"
    end
    column "Operadores" do |c|
      span c.operators_count, class: "badge font-bold"
    end
    column "Serviços" do |c|
      c.services_count
    end
    column "SEO", :seo_title do |c|
      if c.seo_title.present? && c.seo_description.present?
        status_tag("Completo", class: "yes")
      else
        status_tag("Incompleto", class: "no")
      end
    end
    column "Atualizado em", :updated_at do |c|
      c.updated_at.strftime("%d/%m/%Y %H:%M")
    end
    actions defaults: true do |c|
      if c.status != "published"
        item "Publicar", publish_admin_category_path(c), method: :put, class: "member_link"
      end
    end
  end

  # Show Page
  show do
    panel "Visão Geral & Métricas da Categoria" do
      attributes_table_for category do
        row("Status") { |c| status_tag(c.status, class: c.status == "published" ? "yes" : "no") }
        row("Nome") { |c| c.name }
        row("Slug Canônico") { |c| code "/categories/#{c.slug}" }
        row("Eyebrow") { |c| c.eyebrow }
        row("Headline (H1)") { |c| c.headline }
        row("Subheadline") { |c| c.subheadline }
        row("Operadores Ativos Homologados") { |c| strong c.operators_count }
        row("Serviços Disponíveis") { |c| c.services_count }
        row("Publicado em") { |c| c.published_at ? c.published_at.strftime("%d/%m/%Y %H:%M") : "—" }
      end
    end

    if category.hero_image_url.present?
      panel "Preview do Hero Banner" do
        div class: "hero-preview-container", style: "border-radius: 8px; overflow: hidden; border: 1px solid #ddd; margin-bottom: 20px;" do
          img src: category.hero_image_url, alt: category.hero_image_alt || category.name, style: "width: 100%; max-height: 220px; object-fit: cover;"
        end
      end
    end

    panel "Diagnóstico de Saúde SEO & AEO (Google / IAs)" do
      attributes_table_for category do
        row("SEO Title") { |c| c.seo_title.presence || span("Pendente", class: "empty") }
        row("SEO Description") { |c| c.seo_description.presence || span("Pendente", class: "empty") }
        row("Robots Index") { |c| c.robots_index? ? "index, follow" : "noindex, nofollow" }
        row("Canonical Override") { |c| c.canonical_url_override.presence || "Padrão (/categories/#{c.slug})" }
        row("AI Summary (AEO)") { |c| c.ai_summary.presence || "—" }
        row("Answer Summary (GEO)") { |c| c.answer_summary.presence || "—" }
      end
    end

    panel "Perguntas Frequentes (FAQs)" do
      table_for category.faqs.ordered do
        column("Posição", :position)
        column("Pergunta", :question)
        column("Resposta Resumida (AI)", :short_answer)
        column("Status") { |f| f.published? ? status_tag("Ativa", class: "yes") : status_tag("Inativa") }
      end
    end

    panel "Casos de Uso & Aplicações Práticas" do
      table_for category.use_cases.ordered do
        column("Posição", :position)
        column("Título", :title)
        column("Descrição Curta", :short_description)
        column("Ícone", :icon_key)
        column("Status") { |u| u.published? ? status_tag("Ativo", class: "yes") : status_tag("Inativo") }
      end
    end
  end

  # Form com Tabs Editoriais
  form do |f|
    f.semantic_errors(*f.object.errors.attribute_names)

    tabs do
      tab "1. Geral & Hierarquia" do
        f.inputs "Identificação" do
          f.input :name, label: "Nome da Categoria (Ex: Infraestrutura)"
          f.input :short_name, label: "Nome Curto (Ex: Infra)"
          f.input :slug, label: "Slug URL (Ex: infraestrutura)"
          f.input :parent, as: :select, collection: Marketplace::ServiceCategory.where.not(id: f.object.id), label: "Categoria Pai (Hierarquia)"
          f.input :position, label: "Posição de Ordenação na Sidebar"
          f.input :icon_key, label: "Ícone (Ex: building-2, zap, factory, etc.)"
          f.input :featured, label: "Destaque na Home e Menus"
          f.input :active, label: "Ativa no Sistema"
        end
      end

      tab "2. Hero Banner & Mídia" do
        f.inputs "Apresentação Visual do Hero" do
          f.input :eyebrow, label: "Eyebrow (Ex: 02)"
          f.input :headline, label: "Headline H1 (Ex: Infraestrutura)"
          f.input :subheadline, label: "Subheadline / Subtítulo"
          f.input :short_description, as: :text, input_html: { rows: 3 }, label: "Descrição Curta"
          f.input :hero_image_url, label: "URL da Imagem do Hero (Desktop)"
          f.input :hero_image_mobile_url, label: "URL da Imagem do Hero (Mobile)"
          f.input :hero_image_alt, label: "Texto Alternativo (Alt Text SEO)"
          f.input :hero_image_caption, label: "Legenda / Crédito da Imagem"
          f.input :hero_focal_x, label: "Ponto Focal X (0 a 100%)"
          f.input :hero_focal_y, label: "Ponto Focal Y (0 a 100%)"
        end
      end

      tab "3. Conteúdo Editorial" do
        f.inputs "Seções Editoriais da Página" do
          f.input :overview_title, label: "Título do Overview"
          f.input :overview_body, as: :text, input_html: { rows: 5 }, label: "Texto do Overview"
          f.input :services_title, label: "Título da Seção de Serviços"
          f.input :services_description, as: :text, input_html: { rows: 3 }, label: "Descrição de Serviços"
          f.input :use_cases_title, label: "Título de Casos de Uso"
          f.input :use_cases_description, as: :text, input_html: { rows: 3 }, label: "Descrição de Casos de Uso"
          f.input :operators_title, label: "Título da Seção de Operadores"
          f.input :operators_description, as: :text, input_html: { rows: 3 }, label: "Descrição da Seção de Operadores"
        end
      end

      tab "4. SEO & Meta Tags" do
        f.inputs "Otimização para Motores de Busca (Google)" do
          f.input :seo_title, label: "SEO Title (Recomendado 50-60 chars)"
          f.input :seo_description, as: :text, input_html: { rows: 3 }, label: "Meta Description (Recomendado 140-160 chars)"
          f.input :seo_keywords, label: "Palavras-chave Secundárias"
          f.input :canonical_url_override, label: "URL Canônica Override (Opcional)"
          f.input :robots_index, label: "Permitir Indexação no Google (robots: index)"
          f.input :robots_follow, label: "Permitir Seguir Links (robots: follow)"
          f.input :schema_type, label: "Tipo de Schema.org (Padrão: CollectionPage)"
        end
      end

      tab "5. AEO / GEO & Inteligência Artificial" do
        f.inputs "Estruturação para Busca por IA (ChatGPT, Perplexity, Gemini)" do
          f.input :ai_summary, as: :text, input_html: { rows: 4 }, label: "Resumo Estruturado para Modelos de IA (AI Summary)"
          f.input :answer_summary, as: :text, input_html: { rows: 3 }, label: "Resposta Direta para Snippets (Answer Summary)"
          f.input :entity_description, as: :text, input_html: { rows: 3 }, label: "Definição de Entidade Geoespacial"
        end
      end

      tab "6. Open Graph & Redes Sociais" do
        f.inputs "Compartilhamento Social (Facebook, LinkedIn, WhatsApp)" do
          f.input :og_title, label: "Título Open Graph"
          f.input :og_description, as: :text, input_html: { rows: 3 }, label: "Descrição Open Graph"
          f.input :og_image_url, label: "URL da Imagem Social (1200x630)"
          f.input :twitter_title, label: "Título Twitter/X Card"
          f.input :twitter_description, as: :text, input_html: { rows: 3 }, label: "Descrição Twitter/X Card"
          f.input :twitter_image_url, label: "URL da Imagem Twitter/X"
        end
      end

      tab "7. Perguntas Frequentes (FAQs)" do
        f.inputs "Perguntas e Respostas da Categoria" do
          f.input :faq_title, label: "Título da Seção de FAQ"
          f.input :faq_description, as: :text, input_html: { rows: 2 }, label: "Subtítulo do FAQ"
          f.has_many :faqs, heading: "Perguntas", allow_destroy: true, new_record: "Adicionar Pergunta" do |faq|
            faq.input :question, label: "Pergunta"
            faq.input :short_answer, label: "Resposta Resumida (IA / Snippet)"
            faq.input :answer, as: :text, input_html: { rows: 3 }, label: "Resposta Completa"
            faq.input :position, label: "Posição"
            faq.input :published, label: "Ativa"
          end
        end
      end

      tab "8. Casos de Uso & Aplicações" do
        f.inputs "Sub-segmentos e Aplicações Práticas" do
          f.has_many :use_cases, heading: "Aplicações", allow_destroy: true, new_record: "Adicionar Caso de Uso" do |uc|
            uc.input :title, label: "Título da Aplicação (Ex: Inspeção de Rodovias)"
            uc.input :short_description, label: "Descrição Breve"
            uc.input :body, as: :text, input_html: { rows: 3 }, label: "Detalhes Técnicos"
            uc.input :icon_key, label: "Ícone"
            uc.input :position, label: "Posição"
            uc.input :published, label: "Ativo"
          end
        end
      end

      tab "9. Chamada para Ação (CTA)" do
        f.inputs "Banner de Conversão no Rodapé da Página" do
          f.input :bottom_cta_title, label: "Título do CTA"
          f.input :bottom_cta_description, as: :text, input_html: { rows: 3 }, label: "Texto Descritivo"
          f.input :bottom_cta_primary_label, label: "Texto do Botão Principal"
          f.input :bottom_cta_primary_url, label: "Link do Botão Principal"
          f.input :bottom_cta_secondary_label, label: "Texto do Botão Secundário"
          f.input :bottom_cta_secondary_url, label: "Link do Botão Secundário"
        end
      end

      tab "10. Publicação & Workflow" do
        f.inputs "Ciclo de Vida da Categoria" do
          f.input :status, as: :select, collection: Marketplace::ServiceCategory.statuses.keys, label: "Status Editorial"
          f.input :scheduled_at, as: :datetime_picker, label: "Agendamento de Publicação"
          f.input :lock_version, as: :hidden
        end
      end
    end

    f.actions
  end
end
