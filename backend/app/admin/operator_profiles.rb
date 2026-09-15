# frozen_string_literal: true

ActiveAdmin.register Operators::OperatorProfile, as: "OperatorProfile" do
  menu parent: "Marketplace", priority: 1, label: "Operadores"

  permit_params :slug, :verification_status, :accepting_jobs, :searchable, :profile_kind,
                :company_name, :headline, :about, :category_featured, :quote_request_enabled,
                :hero_banner_url, :avatar_url, :banner_headline, :banner_subtitle,
                :website_url, :linkedin_url, :instagram_url,
                :anac_sisant_status, :reta_insurance_status, :mop_status, :canac_pilots_count

  scope :all, default: true
  scope("Verificados") { |s| s.where(verification_status: "verified") }
  scope("Pendentes") { |s| s.where(verification_status: %w[pending submitted]) }
  scope("Solo") { |s| s.where(profile_kind: "solo") }
  scope("Empresas") { |s| s.where(profile_kind: "company") }
  scope("Aceitando jobs") { |s| s.where(accepting_jobs: true) }

  filter :slug
  filter :verification_status, as: :select, collection: %w[pending submitted verified rejected suspended]
  filter :profile_kind, as: :select, collection: %w[solo company]
  filter :accepting_jobs
  filter :searchable
  filter :category_featured
  filter :created_at

  index do
    selectable_column
    id_column
    column :avatar do |p|
      if p.avatar_url.present?
        image_tag p.avatar_url, style: "width: 40px; height: 40px; object-fit: cover; border-radius: 6px;"
      end
    end
    column :slug
    column :profile_kind
    column :company_name
    column :verification_status do |p|
      status_tag p.verification_status
    end
    column :accepting_jobs
    column :category_featured
    column :organization
    actions
  end

  show do
    attributes_table do
      row :id
      row :slug
      row :profile_kind
      row :company_name
      row :headline
      row :about
      row :verification_status do |p|
        status_tag p.verification_status
      end
      row :avatar do |p|
        if p.avatar_url.present?
          image_tag p.avatar_url, style: "max-width: 120px; border-radius: 8px; border: 1px solid #ccc;"
        end
      end
      row :hero_banner do |p|
        if p.hero_banner_url.present?
          image_tag p.hero_banner_url, style: "max-width: 400px; border-radius: 8px; border: 1px solid #ccc;"
        end
      end
      row :banner_headline
      row :banner_subtitle
      row :website_url do |p|
        link_to p.website_url, p.website_url, target: "_blank" if p.website_url.present?
      end
      row :linkedin_url do |p|
        link_to p.linkedin_url, p.linkedin_url, target: "_blank" if p.linkedin_url.present?
      end
      row :instagram_url
      row :anac_sisant_status
      row :reta_insurance_status
      row :mop_status
      row :canac_pilots_count
      row :accepting_jobs
      row :searchable
      row :category_featured
      row :created_at
      row :updated_at
    end
  end

  member_action :verify, method: :post do
    resource.update!(verification_status: "verified")
    AuditLog.create!(
      organization_id: resource.organization_id,
      actor_id: current_admin_user.id,
      action: "operator.verified",
      auditable_type: resource.class.name,
      auditable_id: resource.id,
      after_data: { verification_status: "verified" },
      created_at: Time.current
    )
    redirect_to resource_path, notice: "Operador verificado"
  end

  member_action :reject, method: :post do
    resource.update!(verification_status: "rejected")
    redirect_to resource_path, notice: "Operador rejeitado"
  end

  action_item :verify, only: :show, if: proc { resource.verification_status != "verified" } do
    link_to "Verificar", verify_admin_operator_profile_path(resource), method: :post
  end

  action_item :reject, only: :show do
    link_to "Rejeitar", reject_admin_operator_profile_path(resource), method: :post, data: { confirm: "Confirmar rejeição?" }
  end

  form do |f|
    f.inputs "Identidade & Dados Gerais" do
      f.input :slug
      f.input :profile_kind, as: :select, collection: %w[solo company]
      f.input :company_name
      f.input :headline
      f.input :about, as: :text
      f.input :verification_status, as: :select, collection: %w[pending submitted verified rejected suspended]
      f.input :accepting_jobs
      f.input :searchable
      f.input :category_featured
      f.input :quote_request_enabled
    end

    f.inputs "Apresentação Visual (Banner & Avatar LinkedIn Style)" do
      f.input :avatar_url, hint: "URL da logomarca ou avatar (PNG/JPG com fundo transparente ou branco)"
      f.input :hero_banner_url, hint: "URL da imagem panorâmica do topo (recomendado 1920x600px)"
      f.input :banner_headline, placeholder: "Ex: Dados do mundo real. Decisões de alto impacto."
      f.input :banner_subtitle, placeholder: "Ex: Mapeamento aéreo, LiDAR e inteligência geoespacial para infraestrutura..."
    end

    f.inputs "Contato & Redes Sociais" do
      f.input :website_url, placeholder: "https://www.suaempresa.com.br"
      f.input :linkedin_url, placeholder: "https://linkedin.com/company/suaempresa"
      f.input :instagram_url, placeholder: "https://instagram.com/suaempresa"
    end

    f.inputs "Compliance & Homologação ANAC" do
      f.input :anac_sisant_status, as: :select, collection: ["Regular", "Pendente", "Não Aplicável"]
      f.input :reta_insurance_status, as: :select, collection: ["Ativo", "Pendente", "Não Aplicável"]
      f.input :mop_status, as: :select, collection: ["Conforme", "Pendente", "Não Aplicável"]
      f.input :canac_pilots_count, as: :number
    end

    f.actions
  end
end
