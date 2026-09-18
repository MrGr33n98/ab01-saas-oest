# frozen_string_literal: true

require "test_helper"

class GoldenPathCoreDomainTest < ActionDispatch::IntegrationTest
  setup do
    # 1. Customer Organization
    @customer_org = create_test_org(name: "Enterprise Client Corp #{SecureRandom.hex(4)}")
    @customer_user = User.create!(
      email: "client-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      user_type: "enterprise",
      status: "active"
    )
    OrganizationMembership.create!(
      organization: @customer_org,
      user: @customer_user,
      role: "owner",
      status: "active"
    )
    @token_customer = generate_token_for(@customer_user)

    # 2. Operator Organization
    @operator_org = Organization.create!(
      name: "Pro Drone Services #{SecureRandom.hex(4)}",
      slug: "pro-drone-services-#{SecureRandom.hex(4)}",
      organization_type: "drone_operator",
      country_code: "BR",
      status: "active"
    )
    @operator_user = User.create!(
      email: "operator-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      user_type: "operator",
      status: "active"
    )
    OrganizationMembership.create!(
      organization: @operator_org,
      user: @operator_user,
      role: "owner",
      status: "active"
    )
    @operator_profile = Operators::OperatorProfile.create!(
      organization: @operator_org,
      slug: "pro-operator-#{SecureRandom.hex(4)}",
      headline: "Especialista em Mapeamento e Termografia",
      verification_status: "verified",
      searchable: true,
      accepting_jobs: true
    )
    @token_operator = generate_token_for(@operator_user)

    # 3. Third-party Outsider Organization for Multi-tenant isolation testing
    @outsider_org = create_test_org(name: "Outsider Corp #{SecureRandom.hex(4)}")
    @outsider_user = User.create!(
      email: "outsider-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      user_type: "enterprise",
      status: "active"
    )
    OrganizationMembership.create!(
      organization: @outsider_org,
      user: @outsider_user,
      role: "owner",
      status: "active"
    )
    @token_outsider = generate_token_for(@outsider_user)

    # 4. Shared Data Product
    @category = Marketplace::ServiceCategory.first || Marketplace::ServiceCategory.create!(
      name: "Solar Inspections",
      slug: "solar-inspections-#{SecureRandom.hex(4)}",
      status: "published",
      active: true
    )
    @data_product = Marketplace::DataProduct.create!(
      name: "Orthomosaic HD",
      slug: "orthomosaic-hd-#{SecureRandom.hex(4)}",
      product_type: "geotiff",
      active: true
    )
  end

  test "Full Core Domain Golden Path: Creation -> Geometry -> Publish -> Matching -> Quote -> Accept -> Deliverable -> Completion" do
    # Etapa 1: Customer cria Projeto e Missão
    project = Projects::Project.create!(
      organization: @customer_org,
      created_by: @customer_user,
      name: "Solar Farm Survey 2026",
      status: "active"
    )

    create_res = Missions::Create.call(
      organization: @customer_org,
      user: @customer_user,
      project: project,
      attributes: {
        title: "Inspeção Termográfica do Parque Solar",
        mission_type: "solar_inspection",
        priority: "high",
        deadline_at: 10.days.from_now
      }
    )
    assert create_res.success?, "Falha ao criar missão: #{create_res.errors.join(', ')}"
    mission = create_res.mission
    assert_equal "draft", mission.status

    # Etapa 2: Definir Geometria AOI (Polígono)
    geojson_aoi = {
      "type" => "Polygon",
      "coordinates" => [
        [
          [-47.9292, -15.7801],
          [-47.9250, -15.7801],
          [-47.9250, -15.7850],
          [-47.9292, -15.7850],
          [-47.9292, -15.7801]
        ]
      ]
    }
    geom_res = Missions::SetGeometry.call(mission: mission, geojson: geojson_aoi, user: @customer_user)
    assert geom_res.success?, "Falha ao definir geometria: #{geom_res.errors.join(', ')}"
    mission.reload
    assert mission.area_hectares.positive?
    assert mission.has_aoi?

    # Etapa 3: Vincular Produto Requerido
    Missions::MissionProduct.create!(
      organization: @customer_org,
      mission: mission,
      data_product: @data_product,
      quantity: 1.0
    )
    assert mission.has_products?

    # Etapa 4: Publicar a Missão
    pub_res = Missions::Publish.call(mission: mission, user: @customer_user)
    assert pub_res.success?, "Falha ao publicar missão: #{pub_res.errors.join(', ')}"
    mission.reload
    assert_equal "published", mission.status
    assert_not_nil mission.published_at

    # Etapa 5: Executar Matching Engine
    candidates = Matching::BuildCandidateSet.call(mission: mission)
    assert candidates.any?, "Matching não retornou operadores candidatos"
    operator_candidate = candidates.find { |c| c[:operator_id] == @operator_profile.id }
    assert_not_nil operator_candidate
    assert_equal "eligible", operator_candidate[:band]

    # Etapa 6: Operador Submete Proposta / Cotação
    quote = Quotes::Quote.create!(
      mission: mission,
      customer_organization: @customer_org,
      operator_organization: @operator_org,
      operator_profile: @operator_profile,
      submitted_by: @operator_user,
      status: "submitted",
      subtotal: BigDecimal("5000.00"),
      taxes: BigDecimal("0.00"),
      total: BigDecimal("5000.00"),
      currency: "BRL"
    )
    Quotes::QuoteItem.create!(
      quote: quote,
      data_product: @data_product,
      description: "Ortomosaico HD e Relatório Termográfico",
      quantity: 1.0,
      unit: "serviço",
      unit_price: BigDecimal("5000.00"),
      total_price: BigDecimal("5000.00")
    )
    assert_equal "submitted", quote.status

    # Etapa 7: Customer Aceita a Cotação (Atomic Assignment & Order Creation)
    accept_res = Quotes::Accept.call(
      quote: quote,
      user: @customer_user,
      expected_lock_version: quote.lock_version,
      idempotency_key: "accept_key_#{SecureRandom.hex(4)}"
    )
    assert accept_res.success?, "Falha ao aceitar cotação: #{accept_res.errors.join(', ')}"
    quote.reload
    mission.reload
    assert_equal "accepted", quote.status
    assert_equal "operator_selected", mission.status

    order = Orders::Order.find_by(mission_id: mission.id)
    assert_not_nil order
    assert_equal @customer_org.id, order.customer_organization_id
    assert_equal @operator_org.id, order.operator_organization_id
    assert_equal BigDecimal("5000.00"), order.total
    assert order.marketplace_fee > 0

    # Etapa 8: Operador Envia Deliverable
    deliverable = Deliverables::Deliverable.create!(
      organization: @customer_org,
      mission: mission,
      data_product: @data_product,
      uploaded_by: @operator_user,
      title: "Mosaico Ortorretificado Finalizado v1",
      status: "in_review",
      version: 1
    )
    assert deliverable.persisted?

    # Etapa 9: Customer Aprova Deliverable e Conclui a Missão
    approve_res = Deliverables::Approve.call(deliverable: deliverable, user: @customer_user)
    assert approve_res.success?, "Falha ao aprovar deliverable: #{approve_res.errors.join(', ')}"
    deliverable.reload
    mission.reload
    order.reload

    assert_equal "approved", deliverable.status
    assert_equal "completed", mission.status
    assert_equal "completed", order.status
    assert_not_nil mission.completed_at

    # Etapa 10: Multi-Tenant Security Proof (Outsider Org não pode visualizar nem operar na missão)
    assert_raises ActiveRecord::RecordNotFound do
      TenantScope.find!(Missions::Mission, mission.id, organization: @outsider_org)
    end
  end

  private

  def generate_token_for(user)
    body = Base64.urlsafe_encode64({
      sub: user.id,
      jti: user.jti,
      type: "access",
      exp: 24.hours.from_now.to_i
    }.to_json)
    sig = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", ENV["JWT_SECRET"] || "dronehub-mvp-dev-secret-change-me", body))
    "#{body}.#{sig}"
  end
end
