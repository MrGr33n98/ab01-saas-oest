# frozen_string_literal: true

require "rails_helper"

RSpec.describe Missions::SetGeometry do
  let!(:user) do
    User.create!(
      email: "service.client@dronehub.com.br",
      password: "Password123!",
      user_type: "enterprise",
      jti: SecureRandom.uuid,
      platform_role: "user",
      status: "active"
    )
  end

  let!(:org) do
    Organization.create!(
      name: "Agro Test Org",
      slug: "agro-test-org",
      organization_type: "customer",
      country_code: "BR",
      status: "active"
    )
  end

  let!(:project) do
    Projects::Project.create!(
      organization: org, created_by: user, name: "Proj Teste", status: "active"
    )
  end

  let!(:mission) do
    Missions::Mission.create!(
      organization: org, project: project, created_by: user,
      title: "Missão Teste Geometria", mission_type: "mapping", status: "draft", currency: "BRL"
    )
  end

  let(:valid_geojson) do
    {
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
    }
  end

  describe ".call" do
    it "sets geometry and computes area for draft mission" do
      result = described_class.call(mission: mission, geojson: valid_geojson, user: user)

      expect(result.success?).to be true
      expect(result.mission.area_hectares).to be_present
      expect(result.mission.area_hectares.to_f).to be > 0
    end

    it "fails if mission is in terminal status" do
      mission.update!(status: "completed")
      result = described_class.call(mission: mission, geojson: valid_geojson, user: user)

      expect(result.success?).to be false
      expect(result.errors).to include("AOI can only be set on draft/planning missions")
    end

    it "fails and prevents partial persistence when PostGIS is unavailable in production" do
      allow(Rails.env).to receive(:test?).and_return(false)
      allow(Rails.env).to receive(:development?).and_return(false)
      allow_any_instance_of(Missions::CalculateGeometry).to receive(:postgis_available?).and_return(false)

      original_area = mission.area_hectares
      original_geometry = mission.geometry

      result = described_class.call(mission: mission, geojson: valid_geojson, user: user)

      expect(result.success?).to be false
      expect(result.errors).to include("could not compute area")

      mission.reload
      expect(mission.area_hectares).to eq(original_area)
      expect(mission.geometry).to eq(original_geometry)
    end

    it "guarantees atomic rollback and does not persist partial changes if save fails" do
      allow(mission).to receive(:save!).and_raise(ActiveRecord::RecordInvalid.new(mission))

      result = described_class.call(mission: mission, geojson: valid_geojson, user: user)

      expect(result.success?).to be false
    end
  end
end
