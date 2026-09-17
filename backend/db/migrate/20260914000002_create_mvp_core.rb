# frozen_string_literal: true

# MVP core tables — derived from structure.sql, ordered for FK safety.
class CreateMvpCore < ActiveRecord::Migration[7.2]
  def change
    create_table :users, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :first_name, limit: 100
      t.string :last_name, limit: 100
      t.citext :email, null: false
      t.string :encrypted_password, null: false, default: ""
      t.string :phone_e164, limit: 32
      t.string :locale, limit: 10, null: false, default: "pt-BR"
      t.string :timezone, limit: 64, null: false, default: "America/Cuiaba"
      t.string :platform_role, limit: 32, null: false, default: "user"
      t.string :status, limit: 24, null: false, default: "active"
      t.datetime :accepted_terms_at
      t.datetime :accepted_privacy_at
      t.datetime :last_sign_in_at
      t.string :jti
      t.timestamps
    end
    add_index :users, :email, unique: true
    add_index :users, :jti, unique: true, where: "jti IS NOT NULL"

    create_table :organizations, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :name, limit: 180, null: false
      t.string :legal_name, limit: 220
      t.citext :slug, null: false
      t.string :organization_type, limit: 40, null: false
      t.string :tax_id, limit: 64
      t.citext :email
      t.string :country_code, limit: 2, null: false, default: "BR"
      t.string :state_code, limit: 12
      t.string :city, limit: 120
      t.boolean :verified, null: false, default: false
      t.string :status, limit: 24, null: false, default: "active"
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end
    add_index :organizations, :slug, unique: true

    create_table :organization_memberships, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.string :role, limit: 40, null: false
      t.string :status, limit: 24, null: false, default: "active"
      t.uuid :invited_by_id
      t.datetime :joined_at
      t.timestamps
    end
    add_index :organization_memberships, %i[organization_id user_id], unique: true

    create_table :operator_profiles, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true, index: { unique: true }
      t.citext :slug, null: false
      t.string :headline, limit: 180
      t.text :about
      t.string :verification_status, limit: 32, null: false, default: "pending"
      t.integer :missions_completed, null: false, default: 0
      t.decimal :rating_average, precision: 3, scale: 2
      t.integer :rating_count, null: false, default: 0
      t.string :currency, limit: 3, null: false, default: "BRL"
      t.boolean :searchable, null: false, default: true
      t.boolean :accepting_jobs, null: false, default: true
      t.timestamps
    end
    add_index :operator_profiles, :slug, unique: true

    create_table :service_categories, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :parent_id
      t.citext :slug, null: false
      t.string :name, limit: 160, null: false
      t.text :description
      t.string :icon_key, limit: 80
      t.boolean :active, null: false, default: true
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :service_categories, :slug, unique: true

    create_table :data_products, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.citext :slug, null: false
      t.string :name, limit: 160, null: false
      t.text :description
      t.string :product_type, limit: 48, null: false
      t.string :default_unit, limit: 24
      t.boolean :processing_required, null: false, default: true
      t.boolean :active, null: false, default: true
      t.timestamps
    end
    add_index :data_products, :slug, unique: true

    create_table :service_offerings, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :operator_profile, type: :uuid, null: false, foreign_key: true
      t.references :service_category, type: :uuid, null: false, foreign_key: true
      t.string :title, limit: 180, null: false
      t.text :description
      t.string :pricing_model, limit: 32, null: false, default: "quote"
      t.decimal :price_from, precision: 14, scale: 2
      t.string :currency, limit: 3, null: false, default: "BRL"
      t.boolean :active, null: false, default: true
      t.timestamps
    end

    create_table :coverage_areas, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :operator_profile, type: :uuid, null: false, foreign_key: true
      t.string :name, limit: 140
      t.string :country_code, limit: 2, default: "BR"
      if extension_enabled?("postgis")
        t.geography :geometry, limit: { srid: 4326, type: "multi_polygon" }
      else
        t.jsonb :geometry, default: {}
      end
      t.boolean :active, null: false, default: true
      t.timestamps
    end
    add_index :coverage_areas, :geometry, using: :gist if extension_enabled?("postgis")

    create_table :projects, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :created_by, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.string :name, limit: 180, null: false
      t.text :description
      t.string :industry, limit: 48
      t.string :status, limit: 24, null: false, default: "active"
      t.integer :lock_version, null: false, default: 0
      t.timestamps
    end

    create_table :missions, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :project, type: :uuid, null: false, foreign_key: true
      t.references :created_by, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.string :title, limit: 200, null: false
      t.text :description
      t.string :mission_type, limit: 48, null: false
      t.string :status, limit: 32, null: false, default: "draft"
      t.string :priority, limit: 16, null: false, default: "normal"
      t.string :country_code, limit: 2, default: "BR"
      t.string :state_code, limit: 12
      t.string :city, limit: 120
      if extension_enabled?("postgis")
        t.geography :centroid, limit: { srid: 4326, type: "point" }
        t.geography :geometry, limit: { srid: 4326, type: "multi_polygon" }
      else
        t.jsonb :centroid, default: {}
        t.jsonb :geometry, default: {}
      end
      t.decimal :area_hectares, precision: 14, scale: 4
      t.datetime :preferred_start_at
      t.datetime :deadline_at
      t.decimal :estimated_budget_min, precision: 14, scale: 2
      t.decimal :estimated_budget_max, precision: 14, scale: 2
      t.string :currency, limit: 3, null: false, default: "BRL"
      t.string :visibility, limit: 24, null: false, default: "marketplace"
      t.datetime :published_at
      t.datetime :completed_at
      t.jsonb :metadata, null: false, default: {}
      t.integer :lock_version, null: false, default: 0
      t.timestamps
    end
    add_index :missions, :geometry, using: :gist if extension_enabled?("postgis")
    add_index :missions, %i[organization_id status]

    create_table :mission_products, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :mission, type: :uuid, null: false, foreign_key: true
      t.references :data_product, type: :uuid, null: false, foreign_key: true
      t.decimal :quantity, precision: 12, scale: 3, default: 1
      t.jsonb :specifications, null: false, default: {}
      t.timestamps
    end
    add_index :mission_products, %i[mission_id data_product_id], unique: true

    create_table :mission_status_events, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :mission, type: :uuid, null: false, foreign_key: true
      t.uuid :actor_id
      t.string :from_status, limit: 32
      t.string :to_status, limit: 32, null: false
      t.string :reason_code, limit: 64
      t.text :note
      t.datetime :created_at, null: false
    end

    create_table :quotes, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :mission, type: :uuid, null: false, foreign_key: true
      t.uuid :customer_organization_id, null: false
      t.uuid :operator_organization_id, null: false
      t.references :operator_profile, type: :uuid, null: false, foreign_key: true
      t.references :submitted_by, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.string :status, limit: 32, null: false, default: "draft"
      t.decimal :subtotal, precision: 14, scale: 2, null: false, default: 0
      t.decimal :platform_fee, precision: 14, scale: 2, null: false, default: 0
      t.decimal :taxes, precision: 14, scale: 2, null: false, default: 0
      t.decimal :total, precision: 14, scale: 2, null: false, default: 0
      t.string :currency, limit: 3, null: false, default: "BRL"
      t.datetime :estimated_start_at
      t.datetime :estimated_delivery_at
      t.text :proposal_text
      t.datetime :expires_at
      t.datetime :submitted_at
      t.datetime :accepted_at
      t.datetime :rejected_at
      t.integer :lock_version, null: false, default: 0
      t.timestamps
    end
    add_index :quotes, %i[mission_id status]
    add_foreign_key :quotes, :organizations, column: :customer_organization_id
    add_foreign_key :quotes, :organizations, column: :operator_organization_id

    create_table :quote_items, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :quote, type: :uuid, null: false, foreign_key: true
      t.uuid :data_product_id
      t.string :description, limit: 220, null: false
      t.decimal :quantity, precision: 12, scale: 3, null: false
      t.string :unit, limit: 24, null: false
      t.decimal :unit_price, precision: 14, scale: 2, null: false
      t.decimal :total_price, precision: 14, scale: 2, null: false
      t.timestamps
    end

    create_table :orders, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :mission, type: :uuid, null: false, foreign_key: true, index: { unique: true }
      t.references :quote, type: :uuid, null: false, foreign_key: true, index: { unique: true }
      t.uuid :customer_organization_id, null: false
      t.uuid :operator_organization_id, null: false
      t.string :status, limit: 32, null: false, default: "pending_payment"
      t.string :payment_status, limit: 32, null: false, default: "unpaid"
      t.decimal :subtotal, precision: 14, scale: 2, null: false
      t.decimal :marketplace_fee, precision: 14, scale: 2, null: false
      t.decimal :operator_amount, precision: 14, scale: 2, null: false
      t.decimal :taxes, precision: 14, scale: 2, null: false, default: 0
      t.decimal :total, precision: 14, scale: 2, null: false
      t.string :currency, limit: 3, null: false, default: "BRL"
      t.datetime :accepted_at
      t.datetime :paid_at
      t.datetime :completed_at
      t.integer :lock_version, null: false, default: 0
      t.timestamps
    end

    create_table :payments, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :order, type: :uuid, null: false, foreign_key: true
      t.uuid :payer_organization_id, null: false
      t.string :provider, limit: 32, null: false, default: "manual"
      t.string :provider_payment_id, limit: 180
      t.string :status, limit: 32, null: false, default: "pending"
      t.decimal :amount, precision: 14, scale: 2, null: false
      t.string :currency, limit: 3, null: false, default: "BRL"
      t.string :idempotency_key, limit: 180
      t.string :method, limit: 32 # pix | boleto | manual
      t.datetime :paid_at
      t.uuid :confirmed_by_id
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end

    create_table :deliverables, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :mission, type: :uuid, null: false, foreign_key: true
      t.references :data_product, type: :uuid, null: false, foreign_key: true
      t.references :uploaded_by, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.string :title, limit: 180, null: false
      t.text :description
      t.string :status, limit: 24, null: false, default: "uploading"
      t.string :file_format, limit: 48
      t.bigint :file_size_bytes
      t.string :storage_key, limit: 512
      t.string :checksum_sha256, limit: 64
      t.integer :version, null: false, default: 1
      t.text :rejection_reason
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end

    create_table :assets, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :organization_id
      t.string :owner_type, limit: 80
      t.uuid :owner_id
      t.string :asset_type, limit: 48, null: false
      t.string :filename, limit: 255, null: false
      t.string :content_type, limit: 120, null: false
      t.bigint :file_size_bytes
      t.string :storage_key, limit: 512, null: false
      t.string :checksum_sha256, limit: 64
      t.string :virus_scan_status, limit: 24, null: false, default: "pending"
      t.string :processing_status, limit: 24, null: false, default: "pending"
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end
    add_index :assets, :storage_key, unique: true

    create_table :reviews, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :mission, type: :uuid, null: false, foreign_key: true, index: { unique: true }
      t.uuid :customer_organization_id, null: false
      t.references :operator_profile, type: :uuid, null: false, foreign_key: true
      t.references :reviewer, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.integer :overall_rating, null: false
      t.string :title, limit: 180
      t.text :body
      t.boolean :verified, null: false, default: true
      t.string :moderation_status, limit: 24, null: false, default: "published"
      t.datetime :published_at
      t.timestamps
    end

    create_table :domain_outbox_events, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :aggregate_type, limit: 80, null: false
      t.uuid :aggregate_id, null: false
      t.string :event_type, limit: 120, null: false
      t.jsonb :payload, null: false
      t.datetime :occurred_at, null: false
      t.datetime :published_at
      t.integer :attempts, null: false, default: 0
      t.text :last_error
    end
    add_index :domain_outbox_events, %i[published_at occurred_at]

    create_table :idempotency_keys, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :organization_id
      t.string :key, limit: 180, null: false
      t.string :scope, limit: 120, null: false
      t.string :request_hash, limit: 64, null: false
      t.integer :response_status
      t.jsonb :response_body
      t.datetime :expires_at, null: false
      t.datetime :created_at, null: false
    end
    add_index :idempotency_keys, %i[organization_id scope key], unique: true

    create_table :audit_logs, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :organization_id
      t.uuid :actor_id
      t.string :action, limit: 120, null: false
      t.string :auditable_type, limit: 80
      t.uuid :auditable_id
      t.string :request_id, limit: 120
      t.jsonb :before_data
      t.jsonb :after_data
      t.jsonb :metadata, null: false, default: {}
      t.datetime :created_at, null: false
    end
  end
end
