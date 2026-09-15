# frozen_string_literal: true

ActiveAdmin.register_page "Dashboard" do
  menu priority: 1, label: "Dashboard"

  content title: "DroneHub — Console" do
    columns do
      column do
        panel "Organizações" do
          ul do
            li "Total: #{Organization.count}"
            li "Operadores: #{Organization.where(organization_type: "drone_operator").count}"
            li "Clientes: #{Organization.where(organization_type: "customer").count}"
          end
        end
      end
      column do
        panel "Missões" do
          ul do
            li "Total: #{Missions::Mission.count}"
            li "Publicadas: #{Missions::Mission.where(status: %w[published quoting]).count}"
          end
        end
      end
      column do
        panel "Operadores" do
          ul do
            li "Perfis: #{Operators::OperatorProfile.count}"
            li "Verificados: #{Operators::OperatorProfile.where(verification_status: "verified").count}"
            li "Pendentes: #{Operators::OperatorProfile.where(verification_status: %w[pending submitted]).count}"
          end
        end
      end
    end

    panel "Atalhos" do
      ul do
        li link_to("Importar companies (CSV)", import_csv_admin_organizations_path)
        li link_to("Operadores pendentes", admin_operator_profiles_path(q: { verification_status_eq: "submitted" }))
        li link_to("Planos", admin_plans_path)
        li link_to("Posts CMS", admin_cms_posts_path)
        li link_to("Banners", admin_ads_banners_path)
      end
    end
  end
end
