# frozen_string_literal: true

class EnhanceServiceCategoriesToCmsDomain < ActiveRecord::Migration[7.1]
  def change
    # 1. Expand service_categories table
    change_table :service_categories, bulk: true do |t|
      # Identity & Hierarchy
      t.string :public_id, limit: 32
      t.string :short_name, limit: 80
      
      # Presentation & Hero
      t.string :eyebrow, limit: 60
      t.string :headline, limit: 200
      t.string :subheadline, limit: 300
      t.text :short_description
      t.text :long_description
      t.text :ai_summary

      # Hero Media & Focal Point
      t.string :hero_image_url
      t.string :hero_image_mobile_url
      t.string :hero_image_alt
      t.string :hero_image_caption
      t.integer :hero_focal_x, default: 50
      t.integer :hero_focal_y, default: 50

      # Navigation & Highlights
      t.boolean :featured, default: false, null: false

      # Editorial Sections
      t.string :overview_title
      t.text :overview_body
      t.string :services_title
      t.text :services_description
      t.string :use_cases_title
      t.text :use_cases_description
      t.string :operators_title
      t.text :operators_description
      t.string :faq_title
      t.text :faq_description
      t.string :related_categories_title
      
      # Bottom Call to Action
      t.string :bottom_cta_title
      t.text :bottom_cta_description
      t.string :bottom_cta_primary_label
      t.string :bottom_cta_primary_url
      t.string :bottom_cta_secondary_label
      t.string :bottom_cta_secondary_url

      # SEO & Social Graph
      t.string :seo_title
      t.text :seo_description
      t.string :seo_keywords
      t.string :canonical_url_override
      t.boolean :robots_index, default: true, null: false
      t.boolean :robots_follow, default: true, null: false
      t.string :schema_type, default: "CollectionPage"
      t.string :og_title
      t.text :og_description
      t.string :og_image_url
      t.string :twitter_title
      t.text :twitter_description
      t.string :twitter_image_url

      # AEO / GEO
      t.text :answer_summary
      t.text :entity_description

      # Workflow & Publishing
      t.string :status, limit: 32, default: "draft", null: false
      t.datetime :published_at
      t.datetime :scheduled_at
      t.datetime :archived_at

      # System & Optimistic Locking
      t.uuid :created_by_id
      t.uuid :updated_by_id
      t.integer :lock_version, default: 0, null: false
      t.datetime :deleted_at
    end

    add_index :service_categories, :status
    add_index :service_categories, :featured
    add_index :service_categories, :position
    add_index :service_categories, :parent_id
    add_index :service_categories, :published_at
    add_index :service_categories, :deleted_at
    add_index :service_categories, :public_id, unique: true

    # 2. Table: category_faqs
    create_table :category_faqs, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :service_category, type: :uuid, null: false, foreign_key: true, index: true
      t.string :question, limit: 300, null: false
      t.text :short_answer
      t.text :answer, null: false
      t.integer :position, default: 0, null: false
      t.boolean :published, default: true, null: false
      t.timestamps
    end
    add_index :category_faqs, %i[service_category_id position]

    # 3. Table: category_use_cases
    create_table :category_use_cases, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :service_category, type: :uuid, null: false, foreign_key: true, index: true
      t.string :title, limit: 160, null: false
      t.text :short_description
      t.text :body
      t.string :icon_key, limit: 80
      t.integer :position, default: 0, null: false
      t.boolean :published, default: true, null: false
      t.timestamps
    end
    add_index :category_use_cases, %i[service_category_id position]

    # 4. Table: category_relations (Related Categories)
    create_table :category_relations, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :service_category, type: :uuid, null: false, foreign_key: true, index: true
      t.uuid :related_category_id, null: false
      t.string :relation_type, limit: 40, default: "related"
      t.integer :position, default: 0, null: false
      t.timestamps
    end
    add_index :category_relations, %i[service_category_id related_category_id], unique: true, name: "index_category_relations_on_both_ids"
    add_foreign_key :category_relations, :service_categories, column: :related_category_id

    # 5. Table: category_redirects (Slug historical tracking)
    create_table :category_redirects, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :service_category, type: :uuid, null: false, foreign_key: true, index: true
      t.string :old_slug, limit: 160, null: false
      t.string :new_slug, limit: 160, null: false
      t.integer :redirect_type, default: 301, null: false
      t.datetime :created_at, null: false
    end
    add_index :category_redirects, :old_slug, unique: true

    # 6. Table: category_content_versions (Content Versioning & Snapshot)
    create_table :category_content_versions, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :service_category, type: :uuid, null: false, foreign_key: true, index: true
      t.integer :version, null: false
      t.jsonb :snapshot, default: {}, null: false
      t.uuid :created_by_id
      t.datetime :created_at, null: false
    end
    add_index :category_content_versions, %i[service_category_id version], unique: true
  end
end
