# frozen_string_literal: true

module Missions
  # Single source of truth for the customer mission workspace.
  class WorkspaceQuery
    def self.call(mission:, organization:)
      new(mission: mission, organization: organization).call
    end

    def initialize(mission:, organization:)
      @mission = mission
      @organization = organization
    end

    def call
      raise ActiveRecord::RecordNotFound if mission.organization_id != organization.id

      order = mission.order
      quotes_count = Quotes::Quote.where(mission_id: mission.id, status: %w[submitted viewed negotiating accepted]).count
      deliverables = Deliverables::Deliverable.where(mission_id: mission.id).order(version: :desc)

      {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        status: mission.status,
        mission_type: mission.mission_type,
        priority: mission.priority,
        area_hectares: mission.area_hectares,
        deadline_at: mission.deadline_at,
        preferred_start_at: mission.preferred_start_at,
        published_at: mission.published_at,
        completed_at: mission.completed_at,
        currency: mission.currency,
        estimated_budget_min: mission.estimated_budget_min,
        estimated_budget_max: mission.estimated_budget_max,
        project_id: mission.project_id,
        lock_version: mission.lock_version,
        next_action: next_action(order, quotes_count, deliverables),
        geometry_present: mission.geometry.present? || mission.area_hectares.present?,
        products: mission.mission_products.includes(:data_product).map { |mp|
          {
            data_product_id: mp.data_product_id,
            quantity: mp.quantity,
            name: mp.data_product&.name,
            slug: mp.data_product&.slug
          }
        },
        quotes_summary: {
          open_count: quotes_count,
          comparison_path: "/app/missions/#{mission.id}/quotes"
        },
        order: order && {
          id: order.id,
          status: order.status,
          payment_status: order.respond_to?(:payment_status) ? order.payment_status : nil,
          total: order.total&.to_f,
          currency: order.currency,
          operator_organization_id: order.operator_organization_id
        },
        operator: operator_summary(order),
        deliverables: deliverables.map { |d| serialize_deliverable(d) },
        timeline: timeline_events
      }
    end

    private

    attr_reader :mission, :organization

    def next_action(order, quotes_count, deliverables)
      case mission.status
      when "draft", "planning"
        { key: "publish", label: "Completar AOI/produtos e publicar", href: "/app/missions/new" }
      when "published", "quoting"
        if quotes_count.zero?
          { key: "wait_quotes", label: "Aguardando propostas de operadores", href: nil }
        else
          { key: "compare_quotes", label: "Comparar e aceitar proposta", href: "/app/missions/#{mission.id}/quotes" }
        end
      when "operator_selected"
        if order && order.respond_to?(:payment_status) && order.payment_status != "paid"
          { key: "pay", label: "Confirmar pagamento", href: "/app/missions/#{mission.id}" }
        else
          { key: "wait_start", label: "Aguardando início da execução", href: nil }
        end
      when "scheduled", "in_progress", "processing"
        { key: "wait_delivery", label: "Aguardando entrega do operador", href: nil }
      when "review"
        pending = deliverables.find { |d| d.status.in?(%w[in_review available]) }
        if pending
          { key: "approve_deliverable", label: "Revisar e aprovar entrega", href: "/app/missions/#{mission.id}/deliverables" }
        else
          { key: "wait_delivery", label: "Aguardando entrega", href: nil }
        end
      when "completed"
        { key: "review_operator", label: "Avaliar operador", href: "/app/missions/#{mission.id}" }
      when "cancelled", "disputed"
        { key: "closed", label: "Missão encerrada", href: nil }
      else
        { key: "view", label: "Acompanhar missão", href: nil }
      end
    end

    def operator_summary(order)
      return nil unless order

      profile = Operators::OperatorProfile.find_by(organization_id: order.operator_organization_id)
      return nil unless profile

      {
        slug: profile.slug,
        name: profile.organization&.name,
        verified: profile.verification_status == "verified",
        headline: profile.headline
      }
    end

    def serialize_deliverable(d)
      {
        id: d.id,
        title: d.title,
        status: d.status,
        version: d.version,
        data_product_id: d.data_product_id,
        file_format: d.file_format,
        storage_key: d.storage_key,
        rejection_reason: d.respond_to?(:rejection_reason) ? d.rejection_reason : nil,
        preview_url: preview_url(d),
        download_ready: d.status.in?(%w[available in_review approved])
      }
    end

    def preview_url(d)
      return nil if d.storage_key.blank?
      return nil unless d.status.in?(%w[available in_review approved])

      Integrations::Storage::S3Presigner.new.public_object_url(d.storage_key)
    rescue StandardError
      nil
    end

    def timeline_events
      Missions::MissionStatusEvent
        .where(mission_id: mission.id)
        .order(:created_at)
        .limit(50)
        .map { |e|
          {
            from_status: e.from_status,
            to_status: e.to_status,
            reason_code: e.reason_code,
            note: e.note,
            created_at: e.created_at
          }
        }
    end
  end
end
