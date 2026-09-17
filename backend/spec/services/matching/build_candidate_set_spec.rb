# frozen_string_literal: true

require "rails_helper"

RSpec.describe Matching::BuildCandidateSet, type: :service do
  let!(:user) do
    User.create!(
      email: "matcher@dronehub.com.br",
      password: "Password123!",
      user_type: "enterprise",
      jti: SecureRandom.uuid,
      platform_role: "user",
      status: "active"
    )
  end

  let!(:client_org) do
    Organization.create!(
      name: "Cliente Agro",
      slug: "cliente-agro",
      organization_type: "customer",
      country_code: "BR",
      status: "active"
    )
  end

  let!(:operator_org) do
    Organization.create!(
      name: "Drone Operator SA",
      slug: "drone-operator-sa",
      organization_type: "drone_operator",
      country_code: "BR",
      status: "active"
    )
  end

  let!(:operator_profile) do
    Operators::OperatorProfile.create!(
      organization: operator_org,
      slug: "drone-operator-sa",
      profile_kind: "company",
      verification_status: "verified",
      searchable: true,
      accepting_jobs: true,
      headline: "Operações agrícolas de alta precisão"
    )
  end

  let!(:project) do
    Projects::Project.create!(
      organization: client_org,
      created_by: user,
      name: "Projeto Teste",
      status: "active"
    )
  end

  let!(:mission) do
    Missions::Mission.create!(
      organization: client_org,
      project: project,
      created_by: user,
      title: "Mapeamento Topográfico",
      mission_type: "inspection",
      status: "draft",
      currency: "BRL"
    )
  end

  describe ".call" do
    it "returns eligible candidates when filters match" do
      result = described_class.call(mission: mission)
      expect(result).to be_an(Array)
      expect(result.first[:operator_id]).to eq(operator_profile.id)
      expect(result.first[:band]).to eq("eligible")
    end

    it "returns empty array when no operator is accepting jobs" do
      operator_profile.update!(accepting_jobs: false)
      result = described_class.call(mission: mission)
      expect(result).to eq([])
    end

    context "when mission has geometry and PostGIS fails in production (fail-closed)" do
      before do
        mission.update!(
          geometry: {
            "type" => "Polygon",
            "coordinates" => [
              [
                [-47.8827, -15.7938],
                [-47.8800, -15.7938],
                [-47.8800, -15.7900],
                [-47.8827, -15.7900],
                [-47.8827, -15.7938]
              ]
            ]
          },
          area_hectares: 25.5
        )
      end

      it "fails closed (returns empty array) in production when postgis is unavailable" do
        allow(Rails.env).to receive(:test?).and_return(false)
        allow(Rails.env).to receive(:development?).and_return(false)
        allow_any_instance_of(described_class).to receive(:postgis_available?).and_return(false)

        result = described_class.call(mission: mission)
        expect(result).to eq([])
      end

      it "fails closed and logs error when spatial query throws standard error in production" do
        allow(Rails.env).to receive(:test?).and_return(false)
        allow(Rails.env).to receive(:development?).and_return(false)
        allow_any_instance_of(described_class).to receive(:postgis_available?).and_return(true)
        allow(Operators::CoverageArea).to receive(:active).and_raise(ActiveRecord::StatementInvalid.new("DB connection lost"))

        expect(Rails.logger).to receive(:error).with(/Spatial matching query failed/)

        result = described_class.call(mission: mission)
        expect(result).to eq([])
      end
    end
  end
end
