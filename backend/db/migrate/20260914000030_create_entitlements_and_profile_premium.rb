# frozen_string_literal: true

class CreateEntitlementsAndProfilePremium < ActiveRecord::Migration[7.2]
  def change
    # --- Feature catalog (what can be gated) ---
    create_table :feature_definitions, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :key, null: false, limit: 64
      t.string :name, null: false, limit: 120
      t.text :description
      t.string :category, null: false, default: "growth", limit: 40
      # free | starter | pro | enterprise
      t.string :min_plan, null: false, default: "pro", limit: 32
      t.boolean :active, null: false, default: true
      t.timestamps
    end
    add_index :feature_definitions, :key, unique: true

    # Ensure plans table exists
    unless table_exists?(:plans)
      create_table :plans, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.string :slug, limit: 40
        t.string :name, limit: 80, null: false
        t.string :audience, limit: 32, default: "operator"
        t.integer :price_monthly_cents, default: 0
        t.string :currency, limit: 3, default: "BRL"
        t.boolean :active, default: true, null: false
        t.jsonb :features_json, default: {}, null: false
        t.string :stripe_price_id, limit: 120
        t.timestamps
      end
      add_index :plans, :slug, unique: true
    end

    # Ensure subscriptions table exists
    unless table_exists?(:subscriptions)
      create_table :subscriptions, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :organization, type: :uuid, null: false, foreign_key: true
        t.references :plan, type: :uuid, null: false, foreign_key: true
        t.string :status, limit: 32, default: "active", null: false
        t.datetime :current_period_end
        t.string :stripe_subscription_id, limit: 120
        t.timestamps
      end
    end

    # Plan → feature matrix
    create_table :plan_features, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :plan, type: :uuid, null: false, foreign_key: true
      t.references :feature_definition, type: :uuid, null: false, foreign_key: true
      t.boolean :enabled, null: false, default: true
      t.jsonb :limits, null: false, default: {}
      t.timestamps
    end
    add_index :plan_features, %i[plan_id feature_definition_id], unique: true

    # Org overrides (admin grants / trials)
    create_table :organization_entitlements, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.string :feature_key, null: false, limit: 64
      t.boolean :enabled, null: false, default: true
      t.datetime :expires_at
      t.string :source, limit: 40, default: "admin" # admin | trial | promo
      t.uuid :granted_by_id
      t.text :note
      t.timestamps
    end
    add_index :organization_entitlements, %i[organization_id feature_key], unique: true, name: "idx_org_entitlements_unique"

    # Ensure plans table has commercial fields
    unless column_exists?(:plans, :slug)
      add_column :plans, :slug, :string, limit: 40
      add_index :plans, :slug, unique: true
    end
    add_column :plans, :name, :string, limit: 80 unless column_exists?(:plans, :name)
    add_column :plans, :audience, :string, limit: 32, default: "operator" unless column_exists?(:plans, :audience)
    add_column :plans, :price_monthly_cents, :integer, default: 0 unless column_exists?(:plans, :price_monthly_cents)
    add_column :plans, :currency, :string, limit: 3, default: "BRL" unless column_exists?(:plans, :currency)
    add_column :plans, :active, :boolean, default: true, null: false unless column_exists?(:plans, :active)
    add_column :plans, :features_json, :jsonb, default: {}, null: false unless column_exists?(:plans, :features_json)
    add_column :plans, :stripe_price_id, :string, limit: 120 unless column_exists?(:plans, :stripe_price_id)

    unless column_exists?(:subscriptions, :status)
      add_column :subscriptions, :status, :string, limit: 32, default: "active", null: false
    end
    add_column :subscriptions, :current_period_end, :datetime unless column_exists?(:subscriptions, :current_period_end)
    add_column :subscriptions, :stripe_subscription_id, :string, limit: 120 unless column_exists?(:subscriptions, :stripe_subscription_id)

    # Operator profile: solo vs company + premium presentation
    add_column :operator_profiles, :profile_kind, :string, limit: 24, default: "solo", null: false unless column_exists?(:operator_profiles, :profile_kind)
    add_column :operator_profiles, :company_name, :string, limit: 180 unless column_exists?(:operator_profiles, :company_name)
    add_column :operator_profiles, :company_cnpj, :string, limit: 18 unless column_exists?(:operator_profiles, :company_cnpj)
    add_column :operator_profiles, :hero_image_url, :string, limit: 500 unless column_exists?(:operator_profiles, :hero_image_url)
    add_column :operator_profiles, :hero_title, :string, limit: 160 unless column_exists?(:operator_profiles, :hero_title)
    add_column :operator_profiles, :hero_subtitle, :string, limit: 240 unless column_exists?(:operator_profiles, :hero_subtitle)
    add_column :operator_profiles, :logo_url, :string, limit: 500 unless column_exists?(:operator_profiles, :logo_url)
    add_column :operator_profiles, :category_featured, :boolean, default: false, null: false unless column_exists?(:operator_profiles, :category_featured)
    add_column :operator_profiles, :quote_request_enabled, :boolean, default: false, null: false unless column_exists?(:operator_profiles, :quote_request_enabled)
    add_index :operator_profiles, :profile_kind unless index_exists?(:operator_profiles, :profile_kind)

    # Verification badges catalog + assignments
    create_table :verification_badges, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :key, null: false, limit: 48
      t.string :name, null: false, limit: 80
      t.string :name_en, limit: 80
      t.text :description
      t.string :icon, limit: 40, default: "shield"
      t.string :color, limit: 24, default: "accent"
      t.integer :position, default: 0, null: false
      t.boolean :active, null: false, default: true
      t.timestamps
    end
    add_index :verification_badges, :key, unique: true

    create_table :operator_badges, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :operator_profile, type: :uuid, null: false, foreign_key: true
      t.references :verification_badge, type: :uuid, null: false, foreign_key: true
      t.uuid :granted_by_id
      t.datetime :granted_at, null: false
      t.datetime :expires_at
      t.string :status, limit: 24, null: false, default: "active"
      t.text :note
      t.timestamps
    end
    add_index :operator_badges, %i[operator_profile_id verification_badge_id], unique: true, name: "idx_operator_badges_unique"

    # Downloadable materials (paid feature)
    create_table :operator_materials, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :operator_profile, type: :uuid, null: false, foreign_key: true
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.string :title, null: false, limit: 160
      t.text :description
      t.string :file_url, null: false, limit: 500
      t.string :file_name, limit: 180
      t.string :content_type, limit: 80
      t.integer :byte_size
      t.integer :position, default: 0, null: false
      t.boolean :published, null: false, default: true
      t.timestamps
    end

    # Lead: request quote from public profile (paid feature)
    create_table :quote_requests, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :operator_profile, type: :uuid, null: false, foreign_key: true
      t.uuid :requester_user_id
      t.uuid :requester_organization_id
      t.string :contact_name, limit: 120
      t.string :contact_email, null: false, limit: 180
      t.string :contact_phone, limit: 40
      t.text :message
      t.string :category_slug, limit: 64
      t.string :status, null: false, default: "new", limit: 24
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end
    add_index :quote_requests, %i[operator_profile_id status]
  end
end
