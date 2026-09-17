# frozen_string_literal: true

class CreateOperatorVerticalInfrastructure < ActiveRecord::Migration[7.2]
  def change
    # Presentation and compliance fields were already consumed by the existing
    # Operator settings UI, but were not represented in the relational schema.
    add_column :operator_profiles, :hero_banner_url, :string, limit: 500 unless column_exists?(:operator_profiles, :hero_banner_url)
    add_column :operator_profiles, :avatar_url, :string, limit: 500 unless column_exists?(:operator_profiles, :avatar_url)
    add_column :operator_profiles, :banner_headline, :string, limit: 180 unless column_exists?(:operator_profiles, :banner_headline)
    add_column :operator_profiles, :banner_subtitle, :string, limit: 500 unless column_exists?(:operator_profiles, :banner_subtitle)
    add_column :operator_profiles, :banner_badges, :jsonb, null: false, default: [] unless column_exists?(:operator_profiles, :banner_badges)
    add_column :operator_profiles, :website_url, :string, limit: 500 unless column_exists?(:operator_profiles, :website_url)
    add_column :operator_profiles, :linkedin_url, :string, limit: 500 unless column_exists?(:operator_profiles, :linkedin_url)
    add_column :operator_profiles, :instagram_url, :string, limit: 500 unless column_exists?(:operator_profiles, :instagram_url)
    add_column :operator_profiles, :anac_sisant_status, :string, limit: 48 unless column_exists?(:operator_profiles, :anac_sisant_status)
    add_column :operator_profiles, :reta_insurance_status, :string, limit: 48 unless column_exists?(:operator_profiles, :reta_insurance_status)
    add_column :operator_profiles, :mop_status, :string, limit: 48 unless column_exists?(:operator_profiles, :mop_status)
    add_column :operator_profiles, :canac_pilots_count, :integer, null: false, default: 0 unless column_exists?(:operator_profiles, :canac_pilots_count)
    add_column :operator_profiles, :minimum_job_value, :decimal, precision: 14, scale: 2 unless column_exists?(:operator_profiles, :minimum_job_value)

    create_table :operator_onboarding_profiles, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :operator_profile, type: :uuid, null: false,
                   foreign_key: { to_table: :operator_profiles }, index: { unique: true }
      t.string :onboarding_status, limit: 24, null: false, default: "draft"
      t.jsonb :contact_data, null: false, default: {}
      t.jsonb :equipment_data, null: false, default: {}
      t.jsonb :business_data, null: false, default: {}
      t.jsonb :experience_data, null: false, default: {}
      t.jsonb :documents_data, null: false, default: {}
      t.jsonb :pricing_data, null: false, default: {}
      t.datetime :submitted_at
      t.datetime :reviewed_at
      t.uuid :reviewed_by_id
      t.text :review_note
      t.timestamps
    end
    add_foreign_key :operator_onboarding_profiles, :users, column: :reviewed_by_id
    add_index :operator_onboarding_profiles, :onboarding_status

    # The platform never persists a full bank account number. Provider tokens
    # belong in payout_provider_reference; only display-safe metadata is stored.
    create_table :operator_payout_profiles, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true, index: { unique: true }
      t.string :account_kind, limit: 24, null: false, default: "business"
      t.jsonb :billing_data, null: false, default: {}
      t.string :payout_provider, limit: 48, null: false, default: "manual_review"
      t.string :payout_provider_reference, limit: 180
      t.string :account_holder_name, limit: 180
      t.string :bank_name, limit: 180
      t.string :bank_account_last4, limit: 4
      t.string :swift_bic, limit: 16
      t.string :paypal_email, limit: 320
      t.string :verification_status, limit: 24, null: false, default: "unverified"
      t.references :updated_by, type: :uuid, null: true, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :operator_payout_profiles, :verification_status

    create_table :operator_mission_invites, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :mission, type: :uuid, null: false, foreign_key: true
      t.references :operator_profile, type: :uuid, null: false,
                   foreign_key: { to_table: :operator_profiles }
      t.references :invited_by, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.references :responded_by, type: :uuid, null: true, foreign_key: { to_table: :users }
      t.string :status, limit: 24, null: false, default: "pending"
      t.text :message
      t.datetime :expires_at
      t.datetime :responded_at
      t.timestamps
    end
    add_index :operator_mission_invites, %i[mission_id operator_profile_id], unique: true,
              name: "index_operator_mission_invites_unique_recipient"
    add_index :operator_mission_invites, %i[operator_profile_id status expires_at],
              name: "index_operator_mission_invites_inbox"

    create_table :operator_associated_operators, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :operator_profile, type: :uuid, null: false,
                   foreign_key: { to_table: :operator_profiles }
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.string :full_name, limit: 180, null: false
      t.string :email, limit: 320
      t.string :phone_e164, limit: 32
      t.string :company_name, limit: 180
      t.string :country_code, limit: 2
      t.string :state_code, limit: 12
      t.string :city, limit: 120
      t.string :license_number, limit: 120
      t.string :status, limit: 24, null: false, default: "active"
      t.string :source, limit: 24, null: false, default: "manual"
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end
    add_index :operator_associated_operators, %i[operator_profile_id email], unique: true,
              where: "email IS NOT NULL", name: "index_operator_associates_unique_email"
    add_index :operator_associated_operators, %i[organization_id status]

    create_table :operator_contracts, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :operator_profile, type: :uuid, null: false,
                   foreign_key: { to_table: :operator_profiles }
      t.string :contract_type, limit: 48, null: false, default: "platform_terms"
      t.string :title, limit: 240, null: false
      t.string :version, limit: 48
      t.string :status, limit: 24, null: false, default: "pending"
      t.string :document_url, limit: 500
      t.datetime :signed_at
      t.datetime :expires_at
      t.timestamps
    end
    add_index :operator_contracts, %i[operator_profile_id status]

    create_table :operator_support_requests, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :requested_by, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.string :subject, limit: 240, null: false
      t.text :message, null: false
      t.string :category, limit: 48, null: false, default: "general"
      t.string :status, limit: 24, null: false, default: "open"
      t.string :priority, limit: 24, null: false, default: "normal"
      t.timestamps
    end
    add_index :operator_support_requests, %i[organization_id status created_at],
              name: "index_operator_support_requests_inbox"
  end
end
