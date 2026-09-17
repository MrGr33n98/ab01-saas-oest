# frozen_string_literal: true

module Api
  module V1
    module Operator
      # GET /api/v1/operator/activation — checklist driven by real data
      class ActivationController < BaseController
        def show
          org = current_organization
          profile = Operators::OperatorProfile.find_by(organization_id: org.id)
          onboarding = profile&.operator_onboarding_profile

          drones_count = Operators::Drone.where(organization_id: org.id, status: "active").count rescue 0
          coverage_count = if profile
                             Operators::CoverageArea.where(operator_profile_id: profile.id, active: true).count
                           else
                             0
                           end
          services_count = if profile
                             Marketplace::ServiceOffering.where(operator_profile_id: profile.id, active: true).count
                           else
                             0
                           end

          items = [
            {
              id: "onboarding",
              label: "Completar cadastro operacional",
              label_en: "Complete operational onboarding",
              done: onboarding&.ready_to_submit? == true,
              href: "/operator/onboarding"
            },
            {
              id: "profile",
              label: "Completar perfil (headline)",
              label_en: "Complete profile (headline)",
              done: profile.present? && profile.headline.present?,
              href: "/operator/settings"
            },
            {
              id: "verified",
              label: "Perfil verificado pela plataforma",
              label_en: "Platform-verified profile",
              done: profile&.verification_status == "verified",
              href: "/operator/compliance"
            },
            {
              id: "coverage",
              label: "Definir cobertura geográfica",
              label_en: "Set geographic coverage",
              done: coverage_count.positive?,
              href: "/operator/coverage",
              count: coverage_count
            },
            {
              id: "fleet",
              label: "Cadastrar ao menos 1 drone ativo",
              label_en: "Register at least 1 active drone",
              done: drones_count.positive?,
              href: "/operator/fleet",
              count: drones_count
            },
            {
              id: "services",
              label: "Publicar ao menos 1 serviço",
              label_en: "Publish at least 1 service",
              done: services_count.positive?,
              href: "/operator/services",
              count: services_count
            },
            {
              id: "accepting",
              label: "Aceitando novos jobs",
              label_en: "Accepting new jobs",
              done: profile&.accepting_jobs == true,
              href: "/operator/settings"
            }
          ]

          render json: {
            data: {
              ready: items.all? { |i| i[:done] },
              items: items,
              profile: profile && {
                id: profile.id,
                slug: profile.slug,
                verification_status: profile.verification_status,
                accepting_jobs: profile.accepting_jobs,
                headline: profile.headline
              }
            },
            meta: { request_id: request.headers["X-Request-Id"] || SecureRandom.uuid }
          }
        end
      end
    end
  end
end
