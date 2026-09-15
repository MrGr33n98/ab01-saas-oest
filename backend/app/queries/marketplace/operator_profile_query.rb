# frozen_string_literal: true

module Marketplace
  # Public operator profile — only real aggregates, never fabricated ratings.
  class OperatorProfileQuery
    def self.call(slug:)
      new(slug: slug).call
    end

    def initialize(slug:)
      @slug = slug.to_s
    end

    def call
      profile = Operators::OperatorProfile
        .includes(:organization)
        .find_by!(slug: slug)

      {
        id: profile.id,
        slug: profile.slug,
        headline: profile.headline,
        about: profile.about,
        verification_status: profile.verification_status,
        verified: profile.verification_status == "verified",
        accepting_jobs: profile.accepting_jobs,
        searchable: profile.searchable,
        currency: profile.currency,
        minimum_job_value: profile.minimum_job_value,
        years_experience: profile.years_experience,
        # Real aggregates only — null/zero when no reviews yet
        rating_average: profile.rating_count.to_i.positive? ? profile.rating_average&.to_f : nil,
        rating_count: profile.rating_count.to_i,
        missions_completed: profile.missions_completed.to_i,
        response_time_minutes: profile.response_time_minutes,
        response_rate: profile.response_rate&.to_f,
        organization: org_payload(profile.organization),
        logo_url: logo_url_for(profile.organization),
        services: services_for(profile),
        data_products: data_products_for(profile),
        coverage: coverage_for(profile),
        fleet: fleet_for(profile.organization),
        pilots: pilots_for(profile.organization),
        reviews: reviews_for(profile),
        portfolio: portfolio_for(profile)
      }
    end

    private

    attr_reader :slug

    def org_payload(org)
      return nil unless org

      {
        id: org.id,
        name: org.name,
        slug: org.slug,
        city: org.city,
        state_code: org.state_code,
        country_code: org.country_code,
        verified: org.verified
      }
    end

    def logo_url_for(org)
      return nil unless org&.logo_asset_id

      asset = Deliverables::Asset.find_by(id: org.logo_asset_id)
      return nil unless asset

      # Public or short-lived URL via storage adapter
      Integrations::Storage::S3Presigner.new.public_object_url(asset.storage_key)
    rescue StandardError
      nil
    end

    def services_for(profile)
      Marketplace::ServiceOffering
        .where(operator_profile_id: profile.id, active: true)
        .includes(:service_category)
        .limit(20)
        .map do |o|
          {
            id: o.id,
            title: o.title,
            description: o.description,
            pricing_model: o.pricing_model,
            price_from: o.price_from,
            currency: o.currency,
            category: o.service_category && {
              slug: o.service_category.slug,
              name: o.service_category.name
            }
          }
        end
    end

    def data_products_for(profile)
      Operators::OperatorDataProduct
        .where(operator_profile_id: profile.id, active: true)
        .includes(:data_product)
        .limit(20)
        .map do |odp|
          {
            id: odp.id,
            base_price: odp.base_price,
            pricing_model: odp.pricing_model,
            turnaround_hours: odp.turnaround_hours,
            sample_url: sample_url(odp.sample_asset_id),
            product: odp.data_product && {
              slug: odp.data_product.slug,
              name: odp.data_product.name,
              product_type: odp.data_product.product_type
            }
          }
        end
    end

    def sample_url(asset_id)
      return nil if asset_id.blank?

      asset = Deliverables::Asset.find_by(id: asset_id)
      return nil unless asset

      Integrations::Storage::S3Presigner.new.public_object_url(asset.storage_key)
    rescue StandardError
      nil
    end

    def coverage_for(profile)
      areas = Operators::CoverageArea.where(operator_profile_id: profile.id, active: true).limit(20)
      {
        areas: areas.map { |a|
          {
            id: a.id,
            name: a.name,
            country_code: a.country_code,
            state_code: a.state_code,
            city: a.city
            # geometry omitted on public card list; map endpoint can expose simplified geo later
          }
        },
        summary: areas.map { |a| [a.city, a.state_code].compact.join(" — ").presence || a.name }.compact.uniq.first(8)
      }
    end

    def fleet_for(org)
      return { drones: [], payloads: [] } unless org

      drones = Operators::Drone.where(organization_id: org.id, status: "active").limit(12)
      payloads = Operators::Payload.where(organization_id: org.id).limit(12)
      {
        drones: drones.map { |d|
          {
            id: d.id,
            manufacturer: d.manufacturer,
            model: d.model,
            aircraft_type: d.aircraft_type,
            weight_class: d.weight_class
          }
        },
        payloads: payloads.map { |p|
          {
            id: p.id,
            name: p.name,
            payload_type: p.payload_type,
            manufacturer: p.manufacturer,
            model: p.model
          }
        }
      }
    end

    def pilots_for(org)
      return [] unless org

      Operators::Pilot.where(organization_id: org.id, available: true).limit(12).map do |p|
        {
          id: p.id,
          full_name: p.full_name,
          experience_years: p.experience_years,
          verification_status: p.verification_status
        }
      end
    end

    def reviews_for(profile)
      Reviews::Review
        .where(operator_profile_id: profile.id, moderation_status: %w[published approved])
        .where.not(published_at: nil)
        .order(published_at: :desc)
        .limit(10)
        .map do |r|
          {
            id: r.id,
            overall_rating: r.overall_rating,
            title: r.title,
            body: r.body,
            published_at: r.published_at,
            verified: r.verified
          }
        end
    end

    def portfolio_for(profile)
      # Portfolio = sample assets from operator data products + approved deliverables metadata only
      samples = Operators::OperatorDataProduct
        .where(operator_profile_id: profile.id, active: true)
        .where.not(sample_asset_id: nil)
        .includes(:data_product)
        .limit(6)

      samples.filter_map do |odp|
        url = sample_url(odp.sample_asset_id)
        next unless url

        {
          kind: "sample",
          title: odp.data_product&.name || "Amostra",
          product_slug: odp.data_product&.slug,
          url: url
        }
      end
    end
  end
end
