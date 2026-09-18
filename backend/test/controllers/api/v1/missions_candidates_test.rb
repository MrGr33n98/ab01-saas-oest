# frozen_string_literal: true

require "test_helper"

class MissionsCandidatesTest < ActionDispatch::IntegrationTest
  setup do
    @org_a = create_test_org(name: "Enterprise Client A #{SecureRandom.hex(4)}")
    @org_b = create_test_org(name: "Enterprise Client B #{SecureRandom.hex(4)}")
    
    @operator_org = Organization.create!(
      name: "Aerovision Alpha #{SecureRandom.hex(4)}",
      slug: "aerovision-alpha-#{SecureRandom.hex(4)}",
      organization_type: "drone_operator",
      country_code: "BR",
      status: "active"
    )

    @operator_profile = Operators::OperatorProfile.create!(
      organization: @operator_org,
      slug: "aerovision-alpha-#{SecureRandom.hex(4)}",
      headline: "Especialista em Mapeamento Aéreo",
      verification_status: "verified",
      accepting_jobs: true,
      searchable: true
    )

    @user_a = User.create!(email: "owner_a_#{SecureRandom.hex(4)}@test.com", password: "Password123!", user_type: "enterprise", status: "active")
    @user_b = User.create!(email: "owner_b_#{SecureRandom.hex(4)}@test.com", password: "Password123!", user_type: "enterprise", status: "active")

    OrganizationMembership.create!(organization: @org_a, user: @user_a, role: "owner", status: "active")
    OrganizationMembership.create!(organization: @org_b, user: @user_b, role: "owner", status: "active")

    @token_a = generate_token_for(@user_a)
    @token_b = generate_token_for(@user_b)

    @project = Projects::Project.create!(organization: @org_a, created_by: @user_a, name: "Solar Farm Survey A", status: "active")
    
    create_res = Missions::Create.call(
      organization: @org_a,
      user: @user_a,
      project: @project,
      attributes: {
        title: "Inspeção Solar A",
        mission_type: "solar_inspection",
        priority: "high"
      }
    )
    @mission_a = create_res.mission
  end

  test "GET /api/v1/missions/:id/candidates returns candidates for own tenant mission" do
    get "/api/v1/missions/#{@mission_a.id}/candidates",
        headers: { "Authorization" => "Bearer #{@token_a}", "X-Organization-Id" => @org_a.id }

    assert_response :success
    json = JSON.parse(response.body)
    assert json["data"].is_a?(Array)
    
    if json["data"].any?
      candidate = json["data"].first
      assert_includes candidate.keys, "operator_id"
      assert_includes candidate.keys, "slug"
      assert_includes candidate.keys, "band"
      assert_includes candidate.keys, "algorithm_version"
      assert_nil candidate["score"] # Score is not fabricated in V1
    end
  end

  test "GET /api/v1/missions/:id/candidates is strictly denied for cross-tenant request" do
    get "/api/v1/missions/#{@mission_a.id}/candidates",
        headers: { "Authorization" => "Bearer #{@token_b}", "X-Organization-Id" => @org_b.id }

    assert_response :not_found
  end
end
