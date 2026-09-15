# frozen_string_literal: true

ActiveAdmin.register Operators::OperatorProfile, as: "OperatorProfile" do
  menu parent: "Marketplace", priority: 1, label: "Operadores"

  permit_params :slug, :verification_status, :accepting_jobs, :searchable, :profile_kind,
                :company_name, :headline, :about, :category_featured, :quote_request_enabled

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
    f.inputs do
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
    f.actions
  end
end
