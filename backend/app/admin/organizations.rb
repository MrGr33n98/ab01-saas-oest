# frozen_string_literal: true

ActiveAdmin.register Organization do
  menu parent: "Identidade", priority: 1, label: "Companies / Orgs"

  permit_params :name, :slug, :organization_type, :country_code, :status

  # --- Scopes ---
  scope :all, default: true
  scope("Clientes") { |s| s.where(organization_type: "customer") }
  scope("Operadores") { |s| s.where(organization_type: "drone_operator") }
  scope("Empresas") { |s| s.where(organization_type: %w[data_company engineering_company survey_company enterprise]) }
  scope("Ativas") { |s| s.where(status: "active") }
  scope("Suspensas") { |s| s.where(status: "suspended") }

  # --- Filters ---
  filter :name
  filter :slug
  filter :organization_type, as: :select, collection: Organization::TYPES
  filter :status, as: :select, collection: %w[active suspended closed]
  filter :country_code
  filter :created_at

  index do
    selectable_column
    id_column
    column :name
    column :slug
    column :organization_type
    column :country_code
    column :status do |o|
      status_tag o.status
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :name
      row :slug
      row :organization_type
      row :country_code
      row :status
      row :created_at
      row :updated_at
      row("Operator profile") { |o| o.operator_profile && link_to(o.operator_profile.slug, admin_operator_profile_path(o.operator_profile)) }
    end
  end

  form do |f|
    f.inputs "Organization" do
      f.input :name
      f.input :slug, hint: "URL-safe; gerado do nome se vazio"
      f.input :organization_type, as: :select, collection: Organization::TYPES
      f.input :country_code, as: :string, input_html: { maxlength: 2 }
      f.input :status, as: :select, collection: %w[active suspended closed]
    end
    f.actions
  end

  # --- CSV export columns ---
  csv do
    column :id
    column :name
    column :slug
    column :organization_type
    column :country_code
    column :status
    column :created_at
  end

  # --- Batch ---
  batch_action :suspend do |ids|
    Organization.where(id: ids).update_all(status: "suspended")
    redirect_to collection_path, notice: "#{ids.size} org(s) suspensas"
  end

  batch_action :activate do |ids|
    Organization.where(id: ids).update_all(status: "active")
    redirect_to collection_path, notice: "#{ids.size} org(s) ativadas"
  end

  # --- CSV Import ---
  collection_action :import_csv, method: :get do
    render "admin/organizations/import_csv"
  end

  collection_action :do_import_csv, method: :post do
    file = params[:file]
    if file.blank?
      redirect_to import_csv_admin_organizations_path, alert: "Selecione um arquivo CSV"
      return
    end

    result = Admin::ImportOrganizationsCsv.call(file: file, actor: current_admin_user)
    msg = "Linhas: #{result.rows} · Criadas: #{result.created} · Atualizadas: #{result.updated}"
    if result.errors.any?
      redirect_to admin_organizations_path, alert: "#{msg} · Erros: #{result.errors.first(5).join(" | ")}"
    else
      redirect_to admin_organizations_path, notice: msg
    end
  end

  action_item :import, only: :index do
    link_to "Importar CSV", import_csv_admin_organizations_path
  end

  action_item :template, only: :index do
    link_to "Template CSV", template_csv_admin_organizations_path
  end

  collection_action :template_csv, method: :get do
    csv = "name,slug,organization_type,country_code,status\n" \
          "Fazenda Exemplo,fazenda-exemplo,customer,BR,active\n" \
          "Drones MT Ltda,drones-mt,drone_operator,BR,active\n"
    send_data csv, filename: "organizations_template.csv", type: "text/csv"
  end
end
