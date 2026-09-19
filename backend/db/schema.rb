# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_09_19_160000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "citext"
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_trgm"
  enable_extension "pgcrypto"

  create_table "active_admin_comments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "namespace"
    t.text "body"
    t.string "resource_type"
    t.uuid "resource_id"
    t.string "author_type"
    t.uuid "author_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_type", "author_id"], name: "index_active_admin_comments_on_author_type_and_author_id"
    t.index ["namespace"], name: "index_active_admin_comments_on_namespace"
    t.index ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource_type_and_resource_id"
  end

  create_table "assets", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id"
    t.string "owner_type", limit: 80
    t.uuid "owner_id"
    t.string "asset_type", limit: 48, null: false
    t.string "filename", limit: 255, null: false
    t.string "content_type", limit: 120, null: false
    t.bigint "file_size_bytes"
    t.string "storage_key", limit: 512, null: false
    t.string "checksum_sha256", limit: 64
    t.string "virus_scan_status", limit: 24, default: "pending", null: false
    t.string "processing_status", limit: 24, default: "pending", null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["storage_key"], name: "index_assets_on_storage_key", unique: true
  end

  create_table "audit_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id"
    t.uuid "actor_id"
    t.string "action", limit: 120, null: false
    t.string "auditable_type", limit: 80
    t.uuid "auditable_id"
    t.string "request_id", limit: 120
    t.jsonb "before_data"
    t.jsonb "after_data"
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
  end

  create_table "banner_events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "banner_id", null: false
    t.uuid "banner_placement_id"
    t.string "event_type", null: false
    t.uuid "user_id"
    t.uuid "organization_id"
    t.string "page_path"
    t.string "category_slug"
    t.string "session_id"
    t.string "request_id"
    t.jsonb "meta", default: {}, null: false
    t.datetime "occurred_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["banner_id", "event_type", "occurred_at"], name: "idx_on_banner_id_event_type_occurred_at_3ca3a30197"
    t.index ["occurred_at"], name: "index_banner_events_on_occurred_at"
  end

  create_table "banner_placement_assignments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "banner_id", null: false
    t.uuid "banner_placement_id", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["banner_id", "banner_placement_id"], name: "idx_banner_placement_unique", unique: true
  end

  create_table "banner_placements", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "key", null: false
    t.string "name", null: false
    t.text "description"
    t.string "page_context", default: "global", null: false
    t.integer "width_hint"
    t.integer "height_hint"
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_banner_placements_on_key", unique: true
    t.index ["page_context"], name: "index_banner_placements_on_page_context"
  end

  create_table "banners", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id"
    t.string "name", null: false
    t.string "status", default: "draft", null: false
    t.string "title"
    t.string "subtitle"
    t.string "cta_label"
    t.string "cta_url", null: false
    t.string "image_url"
    t.uuid "image_asset_id"
    t.string "background_color", default: "#10170D"
    t.string "text_color", default: "#FFFFFF"
    t.datetime "starts_at"
    t.datetime "ends_at"
    t.integer "priority", default: 0, null: false
    t.integer "weight", default: 1, null: false
    t.string "target_audience", default: "all"
    t.string "geo_scope", default: "BR"
    t.jsonb "targeting", default: {}, null: false
    t.bigint "impression_count", default: 0, null: false
    t.bigint "click_count", default: 0, null: false
    t.uuid "created_by_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "eyebrow"
    t.string "format_type", default: "standard", null: false
    t.index ["format_type"], name: "index_banners_on_format_type"
    t.index ["priority"], name: "index_banners_on_priority"
    t.index ["starts_at", "ends_at"], name: "index_banners_on_starts_at_and_ends_at"
    t.index ["status"], name: "index_banners_on_status"
  end

  create_table "category_content_versions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "service_category_id", null: false
    t.integer "version", null: false
    t.jsonb "snapshot", default: {}, null: false
    t.uuid "created_by_id"
    t.datetime "created_at", null: false
    t.index ["service_category_id", "version"], name: "idx_on_service_category_id_version_87c2c4f542", unique: true
    t.index ["service_category_id"], name: "index_category_content_versions_on_service_category_id"
  end

  create_table "category_faqs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "service_category_id", null: false
    t.string "question", limit: 300, null: false
    t.text "short_answer"
    t.text "answer", null: false
    t.integer "position", default: 0, null: false
    t.boolean "published", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["service_category_id", "position"], name: "index_category_faqs_on_service_category_id_and_position"
    t.index ["service_category_id"], name: "index_category_faqs_on_service_category_id"
  end

  create_table "category_redirects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "service_category_id", null: false
    t.string "old_slug", limit: 160, null: false
    t.string "new_slug", limit: 160, null: false
    t.integer "redirect_type", default: 301, null: false
    t.datetime "created_at", null: false
    t.index ["old_slug"], name: "index_category_redirects_on_old_slug", unique: true
    t.index ["service_category_id"], name: "index_category_redirects_on_service_category_id"
  end

  create_table "category_relations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "service_category_id", null: false
    t.uuid "related_category_id", null: false
    t.string "relation_type", limit: 40, default: "related"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["service_category_id", "related_category_id"], name: "index_category_relations_on_both_ids", unique: true
    t.index ["service_category_id"], name: "index_category_relations_on_service_category_id"
  end

  create_table "category_use_cases", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "service_category_id", null: false
    t.string "title", limit: 160, null: false
    t.text "short_description"
    t.text "body"
    t.string "icon_key", limit: 80
    t.integer "position", default: 0, null: false
    t.boolean "published", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["service_category_id", "position"], name: "index_category_use_cases_on_service_category_id_and_position"
    t.index ["service_category_id"], name: "index_category_use_cases_on_service_category_id"
  end

  create_table "cms_posts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "slug", limit: 180, null: false
    t.string "locale", limit: 10, default: "pt-BR", null: false
    t.string "translation_key", limit: 64
    t.string "status", limit: 32, default: "draft", null: false
    t.string "title", limit: 200, null: false
    t.string "h1", limit: 200
    t.text "excerpt"
    t.text "body_md", default: "", null: false
    t.string "meta_title", limit: 70
    t.string "meta_description", limit: 180
    t.string "canonical_url", limit: 500
    t.string "og_image_url", limit: 500
    t.string "geo_states", default: [], array: true
    t.string "geo_cities", default: [], array: true
    t.string "category_slugs", default: [], array: true
    t.string "tags", default: [], array: true
    t.jsonb "faq_blocks", default: [], null: false
    t.uuid "author_id"
    t.datetime "published_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_slugs"], name: "index_cms_posts_on_category_slugs", using: :gin
    t.index ["geo_states"], name: "index_cms_posts_on_geo_states", using: :gin
    t.index ["locale", "slug"], name: "index_cms_posts_on_locale_and_slug", unique: true
    t.index ["published_at"], name: "index_cms_posts_on_published_at"
    t.index ["status"], name: "index_cms_posts_on_status"
    t.index ["translation_key"], name: "index_cms_posts_on_translation_key"
  end

  create_table "coverage_areas", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "operator_profile_id", null: false
    t.string "name", limit: 140
    t.string "country_code", limit: 2, default: "BR"
    t.jsonb "geometry", default: {}
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["operator_profile_id"], name: "index_coverage_areas_on_operator_profile_id"
    t.index ["organization_id"], name: "index_coverage_areas_on_organization_id"
  end

  create_table "daily_platform_metrics", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.date "date", null: false
    t.string "metric_name", null: false
    t.bigint "value", default: 0, null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["date", "metric_name"], name: "idx_daily_platform_metrics_unique", unique: true
    t.index ["metric_name", "date"], name: "index_daily_platform_metrics_on_metric_name_and_date"
  end

  create_table "daily_tenant_metrics", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.date "date", null: false
    t.string "metric_name", null: false
    t.bigint "value", default: 0, null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["metric_name", "date"], name: "index_daily_tenant_metrics_on_metric_name_and_date"
    t.index ["organization_id", "date", "metric_name"], name: "idx_daily_tenant_metrics_unique", unique: true
    t.index ["organization_id"], name: "index_daily_tenant_metrics_on_organization_id"
  end

  create_table "data_products", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.citext "slug", null: false
    t.string "name", limit: 160, null: false
    t.text "description"
    t.string "product_type", limit: 48, null: false
    t.string "default_unit", limit: 24
    t.boolean "processing_required", default: true, null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_data_products_on_slug", unique: true
  end

  create_table "deliverables", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "mission_id", null: false
    t.uuid "data_product_id", null: false
    t.uuid "uploaded_by_id", null: false
    t.string "title", limit: 180, null: false
    t.text "description"
    t.string "status", limit: 24, default: "uploading", null: false
    t.string "file_format", limit: 48
    t.bigint "file_size_bytes"
    t.string "storage_key", limit: 512
    t.string "checksum_sha256", limit: 64
    t.integer "version", default: 1, null: false
    t.text "rejection_reason"
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["data_product_id"], name: "index_deliverables_on_data_product_id"
    t.index ["mission_id"], name: "index_deliverables_on_mission_id"
    t.index ["organization_id"], name: "index_deliverables_on_organization_id"
    t.index ["uploaded_by_id"], name: "index_deliverables_on_uploaded_by_id"
  end

  create_table "domain_outbox_events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "aggregate_type", limit: 80, null: false
    t.uuid "aggregate_id", null: false
    t.string "event_type", limit: 120, null: false
    t.jsonb "payload", null: false
    t.datetime "occurred_at", null: false
    t.datetime "published_at"
    t.integer "attempts", default: 0, null: false
    t.text "last_error"
    t.index ["published_at", "occurred_at"], name: "index_domain_outbox_events_on_published_at_and_occurred_at"
  end

  create_table "drone_payloads", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "drone_id", null: false
    t.uuid "payload_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["drone_id", "payload_id"], name: "index_drone_payloads_on_drone_id_and_payload_id", unique: true
    t.index ["drone_id"], name: "index_drone_payloads_on_drone_id"
    t.index ["organization_id"], name: "index_drone_payloads_on_organization_id"
    t.index ["payload_id"], name: "index_drone_payloads_on_payload_id"
  end

  create_table "drones", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.string "manufacturer", limit: 100, null: false
    t.string "model", limit: 120, null: false
    t.string "serial_number", limit: 120
    t.string "registration_number", limit: 120
    t.string "status", limit: 32, default: "active", null: false
    t.integer "max_flight_minutes"
    t.integer "max_payload_grams"
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id", "status"], name: "index_drones_on_organization_id_and_status"
    t.index ["organization_id"], name: "index_drones_on_organization_id"
    t.index ["registration_number"], name: "index_drones_on_registration_number"
  end

  create_table "enterprise_api_keys", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "requested_by_id", null: false
    t.uuid "approved_by_id"
    t.string "name", limit: 120, null: false
    t.string "prefix", limit: 32
    t.string "token_digest", limit: 128
    t.jsonb "scopes", default: [], null: false
    t.string "status", limit: 24, default: "requested", null: false
    t.datetime "requested_at", null: false
    t.datetime "approved_at"
    t.datetime "activated_at"
    t.datetime "revoked_at"
    t.datetime "last_used_at"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["approved_by_id"], name: "index_enterprise_api_keys_on_approved_by_id"
    t.index ["organization_id", "status"], name: "index_enterprise_api_keys_on_organization_id_and_status"
    t.index ["organization_id"], name: "index_enterprise_api_keys_on_organization_id"
    t.index ["prefix"], name: "index_enterprise_api_keys_on_prefix", unique: true, where: "(prefix IS NOT NULL)"
    t.index ["requested_by_id"], name: "index_enterprise_api_keys_on_requested_by_id"
    t.check_constraint "status::text = ANY (ARRAY['requested'::character varying, 'approved'::character varying, 'active'::character varying, 'revoked'::character varying, 'cancelled'::character varying]::text[])", name: "enterprise_api_keys_status_check"
  end

  create_table "enterprise_profiles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.string "industry", limit: 120
    t.string "phone_e164", limit: 32
    t.citext "billing_email"
    t.string "payment_currency", limit: 3, default: "BRL", null: false
    t.jsonb "billing_address", default: {}, null: false
    t.boolean "email_notifications", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["industry"], name: "index_enterprise_profiles_on_industry"
    t.index ["organization_id"], name: "index_enterprise_profiles_on_organization_id", unique: true
  end

  create_table "feature_definitions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "key", limit: 64, null: false
    t.string "name", limit: 120, null: false
    t.text "description"
    t.string "category", limit: 40, default: "growth", null: false
    t.string "min_plan", limit: 32, default: "pro", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_feature_definitions_on_key", unique: true
  end

  create_table "idempotency_keys", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id"
    t.string "key", limit: 180, null: false
    t.string "scope", limit: 120, null: false
    t.string "request_hash", limit: 64, null: false
    t.integer "response_status"
    t.jsonb "response_body"
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.index ["organization_id", "scope", "key"], name: "index_idempotency_keys_on_organization_id_and_scope_and_key", unique: true
  end

  create_table "mission_products", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "mission_id", null: false
    t.uuid "data_product_id", null: false
    t.decimal "quantity", precision: 12, scale: 3, default: "1.0"
    t.jsonb "specifications", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["data_product_id"], name: "index_mission_products_on_data_product_id"
    t.index ["mission_id", "data_product_id"], name: "index_mission_products_on_mission_id_and_data_product_id", unique: true
    t.index ["mission_id"], name: "index_mission_products_on_mission_id"
    t.index ["organization_id"], name: "index_mission_products_on_organization_id"
  end

  create_table "mission_status_events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "mission_id", null: false
    t.uuid "actor_id"
    t.string "from_status", limit: 32
    t.string "to_status", limit: 32, null: false
    t.string "reason_code", limit: 64
    t.text "note"
    t.datetime "created_at", null: false
    t.index ["mission_id"], name: "index_mission_status_events_on_mission_id"
  end

  create_table "missions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "project_id", null: false
    t.uuid "created_by_id", null: false
    t.string "title", limit: 200, null: false
    t.text "description"
    t.string "mission_type", limit: 48, null: false
    t.string "status", limit: 32, default: "draft", null: false
    t.string "priority", limit: 16, default: "normal", null: false
    t.string "country_code", limit: 2, default: "BR"
    t.string "state_code", limit: 12
    t.string "city", limit: 120
    t.jsonb "centroid", default: {}
    t.jsonb "geometry", default: {}
    t.decimal "area_hectares", precision: 14, scale: 4
    t.datetime "preferred_start_at"
    t.datetime "deadline_at"
    t.decimal "estimated_budget_min", precision: 14, scale: 2
    t.decimal "estimated_budget_max", precision: 14, scale: 2
    t.string "currency", limit: 3, default: "BRL", null: false
    t.string "visibility", limit: 24, default: "marketplace", null: false
    t.datetime "published_at"
    t.datetime "completed_at"
    t.jsonb "metadata", default: {}, null: false
    t.integer "lock_version", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_missions_on_created_by_id"
    t.index ["organization_id", "status"], name: "index_missions_on_organization_id_and_status"
    t.index ["organization_id"], name: "index_missions_on_organization_id"
    t.index ["project_id"], name: "index_missions_on_project_id"
  end

  create_table "notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "organization_id"
    t.string "notification_type", limit: 64, null: false
    t.string "title", limit: 255, null: false
    t.text "body"
    t.jsonb "payload", default: {}, null: false
    t.string "action_url", limit: 512
    t.datetime "read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_notifications_on_created_at"
    t.index ["organization_id"], name: "index_notifications_on_organization_id"
    t.index ["user_id", "read_at"], name: "index_notifications_on_user_id_and_read_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "operator_associated_operators", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "operator_profile_id", null: false
    t.uuid "organization_id", null: false
    t.string "full_name", limit: 180, null: false
    t.string "email", limit: 320
    t.string "phone_e164", limit: 32
    t.string "company_name", limit: 180
    t.string "country_code", limit: 2
    t.string "state_code", limit: 12
    t.string "city", limit: 120
    t.string "license_number", limit: 120
    t.string "status", limit: 24, default: "active", null: false
    t.string "source", limit: 24, default: "manual", null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["operator_profile_id", "email"], name: "index_operator_associates_unique_email", unique: true, where: "(email IS NOT NULL)"
    t.index ["operator_profile_id"], name: "index_operator_associated_operators_on_operator_profile_id"
    t.index ["organization_id", "status"], name: "idx_on_organization_id_status_891a838911"
    t.index ["organization_id"], name: "index_operator_associated_operators_on_organization_id"
  end

  create_table "operator_badges", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "operator_profile_id", null: false
    t.uuid "verification_badge_id", null: false
    t.uuid "granted_by_id"
    t.datetime "granted_at", null: false
    t.datetime "expires_at"
    t.string "status", limit: 24, default: "active", null: false
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["operator_profile_id", "verification_badge_id"], name: "idx_operator_badges_unique", unique: true
    t.index ["operator_profile_id"], name: "index_operator_badges_on_operator_profile_id"
    t.index ["verification_badge_id"], name: "index_operator_badges_on_verification_badge_id"
  end

  create_table "operator_contracts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "operator_profile_id", null: false
    t.string "contract_type", limit: 48, default: "platform_terms", null: false
    t.string "title", limit: 240, null: false
    t.string "version", limit: 48
    t.string "status", limit: 24, default: "pending", null: false
    t.string "document_url", limit: 500
    t.datetime "signed_at"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["operator_profile_id", "status"], name: "index_operator_contracts_on_operator_profile_id_and_status"
    t.index ["operator_profile_id"], name: "index_operator_contracts_on_operator_profile_id"
    t.index ["organization_id"], name: "index_operator_contracts_on_organization_id"
  end

  create_table "operator_data_intent_configs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "operator_profile_id", null: false
    t.boolean "wizard_enabled", default: true, null: false
    t.string "headline", limit: 160, default: "Calcule uma estimativa instantânea para sua área"
    t.decimal "min_base_price", precision: 10, scale: 2, default: "1500.0"
    t.decimal "price_per_hectare_rgb", precision: 10, scale: 2, default: "25.0"
    t.decimal "price_per_hectare_multispectral", precision: 10, scale: 2, default: "45.0"
    t.decimal "price_per_hectare_lidar", precision: 10, scale: 2, default: "85.0"
    t.decimal "thermal_asset_base_price", precision: 10, scale: 2, default: "3200.0"
    t.integer "typical_delivery_days", default: 5
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["operator_profile_id"], name: "index_operator_data_intent_configs_on_operator_profile_id", unique: true
  end

  create_table "operator_lead_inquiries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "operator_profile_id", null: false
    t.uuid "organization_id"
    t.string "contact_name", limit: 120, null: false
    t.string "contact_email", limit: 180, null: false
    t.string "contact_phone", limit: 32
    t.string "service_type", limit: 64, null: false
    t.string "city", limit: 120
    t.string "state_code", limit: 12
    t.decimal "estimated_area_ha", precision: 10, scale: 2
    t.decimal "calculated_min_price", precision: 10, scale: 2
    t.decimal "calculated_max_price", precision: 10, scale: 2
    t.string "status", limit: 32, default: "pending_response", null: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["operator_profile_id", "status"], name: "idx_on_operator_profile_id_status_c010a17326"
    t.index ["operator_profile_id"], name: "index_operator_lead_inquiries_on_operator_profile_id"
    t.index ["organization_id"], name: "index_operator_lead_inquiries_on_organization_id"
  end

  create_table "operator_materials", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "operator_profile_id", null: false
    t.uuid "organization_id", null: false
    t.string "title", limit: 160, null: false
    t.text "description"
    t.string "file_url", limit: 500, null: false
    t.string "file_name", limit: 180
    t.string "content_type", limit: 80
    t.integer "byte_size"
    t.integer "position", default: 0, null: false
    t.boolean "published", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["operator_profile_id"], name: "index_operator_materials_on_operator_profile_id"
    t.index ["organization_id"], name: "index_operator_materials_on_organization_id"
  end

  create_table "operator_mission_invites", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "mission_id", null: false
    t.uuid "operator_profile_id", null: false
    t.uuid "invited_by_id", null: false
    t.uuid "responded_by_id"
    t.string "status", limit: 24, default: "pending", null: false
    t.text "message"
    t.datetime "expires_at"
    t.datetime "responded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["invited_by_id"], name: "index_operator_mission_invites_on_invited_by_id"
    t.index ["mission_id", "operator_profile_id"], name: "index_operator_mission_invites_unique_recipient", unique: true
    t.index ["mission_id"], name: "index_operator_mission_invites_on_mission_id"
    t.index ["operator_profile_id", "status", "expires_at"], name: "index_operator_mission_invites_inbox"
    t.index ["operator_profile_id"], name: "index_operator_mission_invites_on_operator_profile_id"
    t.index ["responded_by_id"], name: "index_operator_mission_invites_on_responded_by_id"
  end

  create_table "operator_onboarding_profiles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "operator_profile_id", null: false
    t.string "onboarding_status", limit: 24, default: "draft", null: false
    t.jsonb "contact_data", default: {}, null: false
    t.jsonb "equipment_data", default: {}, null: false
    t.jsonb "business_data", default: {}, null: false
    t.jsonb "experience_data", default: {}, null: false
    t.jsonb "documents_data", default: {}, null: false
    t.jsonb "pricing_data", default: {}, null: false
    t.datetime "submitted_at"
    t.datetime "reviewed_at"
    t.uuid "reviewed_by_id"
    t.text "review_note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["onboarding_status"], name: "index_operator_onboarding_profiles_on_onboarding_status"
    t.index ["operator_profile_id"], name: "index_operator_onboarding_profiles_on_operator_profile_id", unique: true
  end

  create_table "operator_payout_profiles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.string "account_kind", limit: 24, default: "business", null: false
    t.jsonb "billing_data", default: {}, null: false
    t.string "payout_provider", limit: 48, default: "manual_review", null: false
    t.string "payout_provider_reference", limit: 180
    t.string "account_holder_name", limit: 180
    t.string "bank_name", limit: 180
    t.string "bank_account_last4", limit: 4
    t.string "swift_bic", limit: 16
    t.string "paypal_email", limit: 320
    t.string "verification_status", limit: 24, default: "unverified", null: false
    t.uuid "updated_by_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_operator_payout_profiles_on_organization_id", unique: true
    t.index ["updated_by_id"], name: "index_operator_payout_profiles_on_updated_by_id"
    t.index ["verification_status"], name: "index_operator_payout_profiles_on_verification_status"
  end

  create_table "operator_portfolio_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "operator_profile_id", null: false
    t.uuid "service_category_id"
    t.string "title", limit: 160, null: false
    t.text "description"
    t.string "item_type", limit: 32, default: "gallery", null: false
    t.jsonb "media_assets", default: [], null: false
    t.jsonb "before_after_assets", default: {}, null: false
    t.string "location_city", limit: 120
    t.string "location_state", limit: 12
    t.decimal "area_hectares", precision: 10, scale: 2
    t.integer "position", default: 0, null: false
    t.boolean "featured", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["operator_profile_id", "featured"], name: "idx_on_operator_profile_id_featured_f431ceda7c"
    t.index ["operator_profile_id", "position"], name: "idx_on_operator_profile_id_position_80466a6700"
    t.index ["operator_profile_id"], name: "index_operator_portfolio_items_on_operator_profile_id"
    t.index ["service_category_id"], name: "index_operator_portfolio_items_on_service_category_id"
  end

  create_table "operator_profiles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.citext "slug", null: false
    t.string "headline", limit: 180
    t.text "about"
    t.string "verification_status", limit: 32, default: "pending", null: false
    t.integer "missions_completed", default: 0, null: false
    t.decimal "rating_average", precision: 3, scale: 2
    t.integer "rating_count", default: 0, null: false
    t.string "currency", limit: 3, default: "BRL", null: false
    t.boolean "searchable", default: true, null: false
    t.boolean "accepting_jobs", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "profile_kind", limit: 24, default: "solo", null: false
    t.string "company_name", limit: 180
    t.string "company_cnpj", limit: 18
    t.string "hero_image_url", limit: 500
    t.string "hero_title", limit: 160
    t.string "hero_subtitle", limit: 240
    t.string "logo_url", limit: 500
    t.boolean "category_featured", default: false, null: false
    t.boolean "quote_request_enabled", default: false, null: false
    t.string "hero_banner_url", limit: 500
    t.string "avatar_url", limit: 500
    t.string "banner_headline", limit: 180
    t.string "banner_subtitle", limit: 500
    t.jsonb "banner_badges", default: [], null: false
    t.string "website_url", limit: 500
    t.string "linkedin_url", limit: 500
    t.string "instagram_url", limit: 500
    t.string "anac_sisant_status", limit: 48
    t.string "reta_insurance_status", limit: 48
    t.string "mop_status", limit: 48
    t.integer "canac_pilots_count", default: 0, null: false
    t.decimal "minimum_job_value", precision: 14, scale: 2
    t.index ["organization_id"], name: "index_operator_profiles_on_organization_id", unique: true
    t.index ["profile_kind"], name: "index_operator_profiles_on_profile_kind"
    t.index ["slug"], name: "index_operator_profiles_on_slug", unique: true
  end

  create_table "operator_support_requests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "requested_by_id", null: false
    t.string "subject", limit: 240, null: false
    t.text "message", null: false
    t.string "category", limit: 48, default: "general", null: false
    t.string "status", limit: 24, default: "open", null: false
    t.string "priority", limit: 24, default: "normal", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id", "status", "created_at"], name: "index_operator_support_requests_inbox"
    t.index ["organization_id"], name: "index_operator_support_requests_on_organization_id"
    t.index ["requested_by_id"], name: "index_operator_support_requests_on_requested_by_id"
  end

  create_table "orders", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "mission_id", null: false
    t.uuid "quote_id", null: false
    t.uuid "customer_organization_id", null: false
    t.uuid "operator_organization_id", null: false
    t.string "status", limit: 32, default: "pending_payment", null: false
    t.string "payment_status", limit: 32, default: "unpaid", null: false
    t.decimal "subtotal", precision: 14, scale: 2, null: false
    t.decimal "marketplace_fee", precision: 14, scale: 2, null: false
    t.decimal "operator_amount", precision: 14, scale: 2, null: false
    t.decimal "taxes", precision: 14, scale: 2, default: "0.0", null: false
    t.decimal "total", precision: 14, scale: 2, null: false
    t.string "currency", limit: 3, default: "BRL", null: false
    t.datetime "accepted_at"
    t.datetime "paid_at"
    t.datetime "completed_at"
    t.integer "lock_version", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "payment_provider", limit: 32
    t.string "payment_provider_ref", limit: 180
    t.index ["mission_id"], name: "index_orders_on_mission_id", unique: true
    t.index ["payment_provider_ref"], name: "index_orders_on_payment_provider_ref"
    t.index ["quote_id"], name: "index_orders_on_quote_id", unique: true
  end

  create_table "organization_entitlements", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.string "feature_key", limit: 64, null: false
    t.boolean "enabled", default: true, null: false
    t.datetime "expires_at"
    t.string "source", limit: 40, default: "admin"
    t.uuid "granted_by_id"
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id", "feature_key"], name: "idx_org_entitlements_unique", unique: true
    t.index ["organization_id"], name: "index_organization_entitlements_on_organization_id"
  end

  create_table "organization_follows", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "follower_organization_id", null: false
    t.uuid "followed_operator_profile_id", null: false
    t.boolean "notify_on_new_case_studies", default: true, null: false
    t.boolean "notify_on_fleet_update", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["followed_operator_profile_id"], name: "index_organization_follows_on_followed_operator_profile_id"
    t.index ["follower_organization_id", "followed_operator_profile_id"], name: "idx_unique_org_follow", unique: true
    t.index ["follower_organization_id"], name: "index_organization_follows_on_follower_organization_id"
  end

  create_table "organization_memberships", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "user_id", null: false
    t.string "role", limit: 40, null: false
    t.string "status", limit: 24, default: "active", null: false
    t.uuid "invited_by_id"
    t.datetime "joined_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id", "user_id"], name: "index_organization_memberships_on_organization_id_and_user_id", unique: true
    t.index ["organization_id"], name: "index_organization_memberships_on_organization_id"
    t.index ["user_id"], name: "index_organization_memberships_on_user_id"
  end

  create_table "organizations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", limit: 180, null: false
    t.string "legal_name", limit: 220
    t.citext "slug", null: false
    t.string "organization_type", limit: 40, null: false
    t.string "tax_id", limit: 64
    t.citext "email"
    t.string "country_code", limit: 2, default: "BR", null: false
    t.string "state_code", limit: 12
    t.string "city", limit: 120
    t.boolean "verified", default: false, null: false
    t.string "status", limit: 24, default: "active", null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "stripe_account_id", limit: 120
    t.index ["slug"], name: "index_organizations_on_slug", unique: true
    t.index ["stripe_account_id"], name: "index_organizations_on_stripe_account_id"
  end

  create_table "payloads", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.string "name", limit: 120, null: false
    t.string "payload_type", limit: 64, null: false
    t.string "manufacturer", limit: 100
    t.string "model", limit: 120
    t.integer "weight_grams"
    t.jsonb "specs", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id", "payload_type"], name: "index_payloads_on_organization_id_and_payload_type"
    t.index ["organization_id"], name: "index_payloads_on_organization_id"
  end

  create_table "payments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "order_id", null: false
    t.uuid "payer_organization_id", null: false
    t.string "provider", limit: 32, default: "manual", null: false
    t.string "provider_payment_id", limit: 180
    t.string "status", limit: 32, default: "pending", null: false
    t.decimal "amount", precision: 14, scale: 2, null: false
    t.string "currency", limit: 3, default: "BRL", null: false
    t.string "idempotency_key", limit: 180
    t.string "method", limit: 32
    t.datetime "paid_at"
    t.uuid "confirmed_by_id"
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_payments_on_order_id"
  end

  create_table "pilots", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "user_id"
    t.string "full_name", limit: 180, null: false
    t.string "license_number", limit: 64
    t.string "anac_license", limit: 64
    t.string "phone", limit: 32
    t.string "email", limit: 255
    t.string "verification_status", limit: 32, default: "pending", null: false
    t.boolean "available", default: true, null: false
    t.integer "flight_hours_logged", default: 0, null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["anac_license"], name: "index_pilots_on_anac_license"
    t.index ["organization_id", "verification_status"], name: "index_pilots_on_organization_id_and_verification_status"
    t.index ["organization_id"], name: "index_pilots_on_organization_id"
    t.index ["user_id"], name: "index_pilots_on_user_id"
  end

  create_table "plan_features", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "plan_id", null: false
    t.uuid "feature_definition_id", null: false
    t.boolean "enabled", default: true, null: false
    t.jsonb "limits", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["feature_definition_id"], name: "index_plan_features_on_feature_definition_id"
    t.index ["plan_id", "feature_definition_id"], name: "index_plan_features_on_plan_id_and_feature_definition_id", unique: true
    t.index ["plan_id"], name: "index_plan_features_on_plan_id"
  end

  create_table "plans", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "slug", limit: 40
    t.string "name", limit: 80, null: false
    t.string "audience", limit: 32, default: "operator"
    t.integer "price_monthly_cents", default: 0
    t.string "currency", limit: 3, default: "BRL"
    t.boolean "active", default: true, null: false
    t.jsonb "features_json", default: {}, null: false
    t.string "stripe_price_id", limit: 120
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_plans_on_slug", unique: true
  end

  create_table "projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "created_by_id", null: false
    t.string "name", limit: 180, null: false
    t.text "description"
    t.string "industry", limit: 48
    t.string "status", limit: 24, default: "active", null: false
    t.integer "lock_version", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_projects_on_created_by_id"
    t.index ["organization_id"], name: "index_projects_on_organization_id"
  end

  create_table "quote_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "quote_id", null: false
    t.uuid "data_product_id"
    t.string "description", limit: 220, null: false
    t.decimal "quantity", precision: 12, scale: 3, null: false
    t.string "unit", limit: 24, null: false
    t.decimal "unit_price", precision: 14, scale: 2, null: false
    t.decimal "total_price", precision: 14, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["quote_id"], name: "index_quote_items_on_quote_id"
  end

  create_table "quote_requests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "operator_profile_id", null: false
    t.uuid "requester_user_id"
    t.uuid "requester_organization_id"
    t.string "contact_name", limit: 120
    t.string "contact_email", limit: 180, null: false
    t.string "contact_phone", limit: 40
    t.text "message"
    t.string "category_slug", limit: 64
    t.string "status", limit: 24, default: "new", null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["operator_profile_id", "status"], name: "index_quote_requests_on_operator_profile_id_and_status"
    t.index ["operator_profile_id"], name: "index_quote_requests_on_operator_profile_id"
  end

  create_table "quotes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "mission_id", null: false
    t.uuid "customer_organization_id", null: false
    t.uuid "operator_organization_id", null: false
    t.uuid "operator_profile_id", null: false
    t.uuid "submitted_by_id", null: false
    t.string "status", limit: 32, default: "draft", null: false
    t.decimal "subtotal", precision: 14, scale: 2, default: "0.0", null: false
    t.decimal "platform_fee", precision: 14, scale: 2, default: "0.0", null: false
    t.decimal "taxes", precision: 14, scale: 2, default: "0.0", null: false
    t.decimal "total", precision: 14, scale: 2, default: "0.0", null: false
    t.string "currency", limit: 3, default: "BRL", null: false
    t.datetime "estimated_start_at"
    t.datetime "estimated_delivery_at"
    t.text "proposal_text"
    t.datetime "expires_at"
    t.datetime "submitted_at"
    t.datetime "accepted_at"
    t.datetime "rejected_at"
    t.integer "lock_version", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["mission_id", "status"], name: "index_quotes_on_mission_id_and_status"
    t.index ["mission_id"], name: "index_quotes_on_mission_id"
    t.index ["operator_profile_id"], name: "index_quotes_on_operator_profile_id"
    t.index ["submitted_by_id"], name: "index_quotes_on_submitted_by_id"
  end

  create_table "reviews", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "mission_id", null: false
    t.uuid "customer_organization_id", null: false
    t.uuid "operator_profile_id", null: false
    t.uuid "reviewer_id", null: false
    t.integer "overall_rating", null: false
    t.string "title", limit: 180
    t.text "body"
    t.boolean "verified", default: true, null: false
    t.string "moderation_status", limit: 24, default: "published", null: false
    t.datetime "published_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "technical_accuracy_rating", default: 5, null: false
    t.integer "timeliness_rating", default: 5, null: false
    t.integer "communication_rating", default: 5, null: false
    t.integer "safety_compliance_rating", default: 5, null: false
    t.decimal "delivered_gsd_cm", precision: 5, scale: 2
    t.string "headline", limit: 140
    t.index ["mission_id"], name: "index_reviews_on_mission_id", unique: true
    t.index ["operator_profile_id", "overall_rating"], name: "index_reviews_on_operator_profile_id_and_overall_rating"
    t.index ["operator_profile_id"], name: "index_reviews_on_operator_profile_id"
    t.index ["reviewer_id"], name: "index_reviews_on_reviewer_id"
  end

  create_table "service_categories", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "parent_id"
    t.citext "slug", null: false
    t.string "name", limit: 160, null: false
    t.text "description"
    t.string "icon_key", limit: 80
    t.boolean "active", default: true, null: false
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "public_id", limit: 32
    t.string "short_name", limit: 80
    t.string "eyebrow", limit: 60
    t.string "headline", limit: 200
    t.string "subheadline", limit: 300
    t.text "short_description"
    t.text "long_description"
    t.text "ai_summary"
    t.string "hero_image_url"
    t.string "hero_image_mobile_url"
    t.string "hero_image_alt"
    t.string "hero_image_caption"
    t.integer "hero_focal_x", default: 50
    t.integer "hero_focal_y", default: 50
    t.boolean "featured", default: false, null: false
    t.string "overview_title"
    t.text "overview_body"
    t.string "services_title"
    t.text "services_description"
    t.string "use_cases_title"
    t.text "use_cases_description"
    t.string "operators_title"
    t.text "operators_description"
    t.string "faq_title"
    t.text "faq_description"
    t.string "related_categories_title"
    t.string "bottom_cta_title"
    t.text "bottom_cta_description"
    t.string "bottom_cta_primary_label"
    t.string "bottom_cta_primary_url"
    t.string "bottom_cta_secondary_label"
    t.string "bottom_cta_secondary_url"
    t.string "seo_title"
    t.text "seo_description"
    t.string "seo_keywords"
    t.string "canonical_url_override"
    t.boolean "robots_index", default: true, null: false
    t.boolean "robots_follow", default: true, null: false
    t.string "schema_type", default: "CollectionPage"
    t.string "og_title"
    t.text "og_description"
    t.string "og_image_url"
    t.string "twitter_title"
    t.text "twitter_description"
    t.string "twitter_image_url"
    t.text "answer_summary"
    t.text "entity_description"
    t.string "status", limit: 32, default: "draft", null: false
    t.datetime "published_at"
    t.datetime "scheduled_at"
    t.datetime "archived_at"
    t.uuid "created_by_id"
    t.uuid "updated_by_id"
    t.integer "lock_version", default: 0, null: false
    t.datetime "deleted_at"
    t.index ["deleted_at"], name: "index_service_categories_on_deleted_at"
    t.index ["featured"], name: "index_service_categories_on_featured"
    t.index ["parent_id"], name: "index_service_categories_on_parent_id"
    t.index ["position"], name: "index_service_categories_on_position"
    t.index ["public_id"], name: "index_service_categories_on_public_id", unique: true
    t.index ["published_at"], name: "index_service_categories_on_published_at"
    t.index ["slug"], name: "index_service_categories_on_slug", unique: true
    t.index ["status"], name: "index_service_categories_on_status"
  end

  create_table "service_offerings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "operator_profile_id", null: false
    t.uuid "service_category_id", null: false
    t.string "title", limit: 180, null: false
    t.text "description"
    t.string "pricing_model", limit: 32, default: "quote", null: false
    t.decimal "price_from", precision: 14, scale: 2
    t.string "currency", limit: 3, default: "BRL", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["operator_profile_id"], name: "index_service_offerings_on_operator_profile_id"
    t.index ["organization_id"], name: "index_service_offerings_on_organization_id"
    t.index ["service_category_id"], name: "index_service_offerings_on_service_category_id"
  end

  create_table "subscriptions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "plan_id", null: false
    t.string "status", limit: 32, default: "active", null: false
    t.datetime "current_period_end"
    t.string "stripe_subscription_id", limit: 120
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_subscriptions_on_organization_id"
    t.index ["plan_id"], name: "index_subscriptions_on_plan_id"
  end

  create_table "telemetry_events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id"
    t.string "actor_type"
    t.uuid "actor_id"
    t.string "session_id"
    t.string "event_name", null: false
    t.string "entity_type"
    t.uuid "entity_id"
    t.jsonb "properties", default: {}, null: false
    t.datetime "occurred_at", null: false
    t.datetime "received_at", null: false
    t.string "request_id"
    t.string "source", default: "web", null: false
    t.integer "schema_version", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["entity_type", "entity_id"], name: "index_telemetry_events_on_entity_type_and_entity_id"
    t.index ["event_name", "occurred_at"], name: "index_telemetry_events_on_event_name_and_occurred_at"
    t.index ["occurred_at"], name: "index_telemetry_events_on_occurred_at"
    t.index ["organization_id", "occurred_at"], name: "index_telemetry_events_on_organization_id_and_occurred_at"
    t.index ["organization_id"], name: "index_telemetry_events_on_organization_id"
    t.index ["request_id", "event_name"], name: "idx_telemetry_events_idempotency", unique: true, where: "(request_id IS NOT NULL)"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "first_name", limit: 100
    t.string "last_name", limit: 100
    t.citext "email", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "phone_e164", limit: 32
    t.string "locale", limit: 10, default: "pt-BR", null: false
    t.string "timezone", limit: 64, default: "America/Cuiaba", null: false
    t.string "platform_role", limit: 32, default: "user", null: false
    t.string "status", limit: 24, default: "active", null: false
    t.datetime "accepted_terms_at"
    t.datetime "accepted_privacy_at"
    t.datetime "last_sign_in_at"
    t.string "jti"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "email_verified_at"
    t.string "email_verification_token"
    t.string "user_type", limit: 24, default: "enterprise", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["email_verification_token"], name: "index_users_on_email_verification_token", unique: true, where: "(email_verification_token IS NOT NULL)"
    t.index ["jti"], name: "index_users_on_jti", unique: true, where: "(jti IS NOT NULL)"
    t.index ["user_type"], name: "index_users_on_user_type"
    t.check_constraint "user_type::text = ANY (ARRAY['operator'::character varying, 'enterprise'::character varying]::text[])", name: "users_user_type_check"
  end

  create_table "verification_badges", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "key", limit: 48, null: false
    t.string "name", limit: 80, null: false
    t.string "name_en", limit: 80
    t.text "description"
    t.string "icon", limit: 40, default: "shield"
    t.string "color", limit: 24, default: "accent"
    t.integer "position", default: 0, null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_verification_badges_on_key", unique: true
  end

  create_table "webhook_attempts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "webhook_delivery_id", null: false
    t.integer "attempt_number", null: false
    t.integer "response_status_code"
    t.text "response_body"
    t.jsonb "response_headers", default: {}
    t.float "duration_ms"
    t.string "error_class", limit: 255
    t.text "error_message"
    t.string "status", limit: 24, null: false
    t.datetime "attempted_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["webhook_delivery_id", "attempt_number"], name: "idx_on_webhook_delivery_id_attempt_number_d248c91b6b", unique: true
    t.index ["webhook_delivery_id"], name: "index_webhook_attempts_on_webhook_delivery_id"
    t.check_constraint "status::text = ANY (ARRAY['succeeded'::character varying, 'failed'::character varying]::text[])", name: "webhook_attempts_status_check"
  end

  create_table "webhook_deliveries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "webhook_endpoint_id", null: false
    t.uuid "organization_id", null: false
    t.string "event_type", limit: 120, null: false
    t.string "event_id", limit: 120, null: false
    t.jsonb "payload", default: {}, null: false
    t.string "status", limit: 24, default: "pending", null: false
    t.integer "attempts_count", default: 0, null: false
    t.datetime "next_retry_at"
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_webhook_deliveries_on_event_id"
    t.index ["organization_id", "created_at"], name: "index_webhook_deliveries_on_organization_id_and_created_at"
    t.index ["organization_id"], name: "index_webhook_deliveries_on_organization_id"
    t.index ["status", "next_retry_at"], name: "index_webhook_deliveries_on_status_and_next_retry_at"
    t.index ["webhook_endpoint_id", "event_id"], name: "idx_webhook_deliveries_endpoint_event_unique", unique: true
    t.index ["webhook_endpoint_id", "status"], name: "index_webhook_deliveries_on_webhook_endpoint_id_and_status"
    t.index ["webhook_endpoint_id"], name: "index_webhook_deliveries_on_webhook_endpoint_id"
    t.check_constraint "status::text = ANY (ARRAY['pending'::character varying, 'delivering'::character varying, 'succeeded'::character varying, 'failed'::character varying]::text[])", name: "webhook_deliveries_status_check"
  end

  create_table "webhook_endpoints", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "organization_id", null: false
    t.uuid "created_by_id"
    t.string "url", limit: 2048, null: false
    t.string "description", limit: 255
    t.string "secret_key", limit: 128, null: false
    t.jsonb "events", default: [], null: false
    t.string "status", limit: 24, default: "active", null: false
    t.datetime "disabled_at"
    t.datetime "last_successful_delivery_at"
    t.datetime "last_failed_delivery_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_webhook_endpoints_on_created_by_id"
    t.index ["organization_id", "status"], name: "index_webhook_endpoints_on_organization_id_and_status"
    t.index ["organization_id"], name: "index_webhook_endpoints_on_organization_id"
    t.index ["status"], name: "index_webhook_endpoints_on_status"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying, 'disabled'::character varying, 'failed'::character varying]::text[])", name: "webhook_endpoints_status_check"
  end

  add_foreign_key "banner_events", "banners"
  add_foreign_key "banner_placement_assignments", "banner_placements"
  add_foreign_key "banner_placement_assignments", "banners"
  add_foreign_key "category_content_versions", "service_categories"
  add_foreign_key "category_faqs", "service_categories"
  add_foreign_key "category_redirects", "service_categories"
  add_foreign_key "category_relations", "service_categories"
  add_foreign_key "category_relations", "service_categories", column: "related_category_id"
  add_foreign_key "category_use_cases", "service_categories"
  add_foreign_key "coverage_areas", "operator_profiles"
  add_foreign_key "coverage_areas", "organizations"
  add_foreign_key "daily_tenant_metrics", "organizations", on_delete: :cascade
  add_foreign_key "deliverables", "data_products"
  add_foreign_key "deliverables", "missions"
  add_foreign_key "deliverables", "organizations"
  add_foreign_key "deliverables", "users", column: "uploaded_by_id"
  add_foreign_key "drone_payloads", "drones"
  add_foreign_key "drone_payloads", "organizations"
  add_foreign_key "drone_payloads", "payloads"
  add_foreign_key "drones", "organizations"
  add_foreign_key "enterprise_api_keys", "organizations"
  add_foreign_key "enterprise_api_keys", "users", column: "approved_by_id"
  add_foreign_key "enterprise_api_keys", "users", column: "requested_by_id"
  add_foreign_key "enterprise_profiles", "organizations"
  add_foreign_key "mission_products", "data_products"
  add_foreign_key "mission_products", "missions"
  add_foreign_key "mission_products", "organizations"
  add_foreign_key "mission_status_events", "missions"
  add_foreign_key "missions", "organizations"
  add_foreign_key "missions", "projects"
  add_foreign_key "missions", "users", column: "created_by_id"
  add_foreign_key "notifications", "organizations"
  add_foreign_key "notifications", "users"
  add_foreign_key "operator_associated_operators", "operator_profiles"
  add_foreign_key "operator_associated_operators", "organizations"
  add_foreign_key "operator_badges", "operator_profiles"
  add_foreign_key "operator_badges", "verification_badges"
  add_foreign_key "operator_contracts", "operator_profiles"
  add_foreign_key "operator_contracts", "organizations"
  add_foreign_key "operator_data_intent_configs", "operator_profiles"
  add_foreign_key "operator_lead_inquiries", "operator_profiles"
  add_foreign_key "operator_lead_inquiries", "organizations"
  add_foreign_key "operator_materials", "operator_profiles"
  add_foreign_key "operator_materials", "organizations"
  add_foreign_key "operator_mission_invites", "missions"
  add_foreign_key "operator_mission_invites", "operator_profiles"
  add_foreign_key "operator_mission_invites", "users", column: "invited_by_id"
  add_foreign_key "operator_mission_invites", "users", column: "responded_by_id"
  add_foreign_key "operator_onboarding_profiles", "operator_profiles"
  add_foreign_key "operator_onboarding_profiles", "users", column: "reviewed_by_id"
  add_foreign_key "operator_payout_profiles", "organizations"
  add_foreign_key "operator_payout_profiles", "users", column: "updated_by_id"
  add_foreign_key "operator_portfolio_items", "operator_profiles"
  add_foreign_key "operator_portfolio_items", "service_categories"
  add_foreign_key "operator_profiles", "organizations"
  add_foreign_key "operator_support_requests", "organizations"
  add_foreign_key "operator_support_requests", "users", column: "requested_by_id"
  add_foreign_key "orders", "missions"
  add_foreign_key "orders", "quotes"
  add_foreign_key "organization_entitlements", "organizations"
  add_foreign_key "organization_follows", "operator_profiles", column: "followed_operator_profile_id"
  add_foreign_key "organization_follows", "organizations", column: "follower_organization_id"
  add_foreign_key "organization_memberships", "organizations"
  add_foreign_key "organization_memberships", "users"
  add_foreign_key "payloads", "organizations"
  add_foreign_key "payments", "orders"
  add_foreign_key "pilots", "organizations"
  add_foreign_key "pilots", "users"
  add_foreign_key "plan_features", "feature_definitions"
  add_foreign_key "plan_features", "plans"
  add_foreign_key "projects", "organizations"
  add_foreign_key "projects", "users", column: "created_by_id"
  add_foreign_key "quote_items", "quotes"
  add_foreign_key "quote_requests", "operator_profiles"
  add_foreign_key "quotes", "missions"
  add_foreign_key "quotes", "operator_profiles"
  add_foreign_key "quotes", "organizations", column: "customer_organization_id"
  add_foreign_key "quotes", "organizations", column: "operator_organization_id"
  add_foreign_key "quotes", "users", column: "submitted_by_id"
  add_foreign_key "reviews", "missions"
  add_foreign_key "reviews", "operator_profiles"
  add_foreign_key "reviews", "users", column: "reviewer_id"
  add_foreign_key "service_offerings", "operator_profiles"
  add_foreign_key "service_offerings", "organizations"
  add_foreign_key "service_offerings", "service_categories"
  add_foreign_key "subscriptions", "organizations"
  add_foreign_key "subscriptions", "plans"
  add_foreign_key "telemetry_events", "organizations", on_delete: :nullify
  add_foreign_key "webhook_attempts", "webhook_deliveries", on_delete: :cascade
  add_foreign_key "webhook_deliveries", "organizations"
  add_foreign_key "webhook_deliveries", "webhook_endpoints", on_delete: :cascade
  add_foreign_key "webhook_endpoints", "organizations"
  add_foreign_key "webhook_endpoints", "users", column: "created_by_id"
end
