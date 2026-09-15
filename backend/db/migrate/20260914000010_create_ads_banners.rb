# frozen_string_literal: true

class CreateAdsBanners < ActiveRecord::Migration[8.0]
  def change
    create_table :banner_placements, id: :uuid do |t|
      t.string :key, null: false
      t.string :name, null: false
      t.text :description
      t.string :page_context, null: false, default: "global"
      # global | landing | category | operators | services | data_products | app_shell | mission_workspace
      t.integer :width_hint
      t.integer :height_hint
      t.boolean :active, null: false, default: true
      t.timestamps
    end
    add_index :banner_placements, :key, unique: true
    add_index :banner_placements, :page_context

    create_table :banners, id: :uuid do |t|
      t.uuid :organization_id # optional advertiser org (internal or partner)
      t.string :name, null: false
      t.string :status, null: false, default: "draft"
      # draft | scheduled | active | paused | ended | rejected
      t.string :title
      t.string :subtitle
      t.string :cta_label
      t.string :cta_url, null: false
      t.string :image_url
      t.uuid :image_asset_id
      t.string :background_color, default: "#10170D"
      t.string :text_color, default: "#FFFFFF"
      t.datetime :starts_at
      t.datetime :ends_at
      t.integer :priority, null: false, default: 0
      t.integer :weight, null: false, default: 1
      t.string :target_audience, default: "all"
      # all | customer | operator | anonymous
      t.string :geo_scope, default: "BR"
      t.jsonb :targeting, null: false, default: {}
      # { category_slugs: [], states: [], min_plan: "starter" }
      t.bigint :impression_count, null: false, default: 0
      t.bigint :click_count, null: false, default: 0
      t.uuid :created_by_id
      t.timestamps
    end
    add_index :banners, :status
    add_index :banners, [:starts_at, :ends_at]
    add_index :banners, :priority

    create_table :banner_placement_assignments, id: :uuid do |t|
      t.uuid :banner_id, null: false
      t.uuid :banner_placement_id, null: false
      t.boolean :active, null: false, default: true
      t.timestamps
    end
    add_index :banner_placement_assignments, [:banner_id, :banner_placement_id], unique: true, name: "idx_banner_placement_unique"
    add_foreign_key :banner_placement_assignments, :banners
    add_foreign_key :banner_placement_assignments, :banner_placements

    create_table :banner_events, id: :uuid do |t|
      t.uuid :banner_id, null: false
      t.uuid :banner_placement_id
      t.string :event_type, null: false # impression | click
      t.uuid :user_id
      t.uuid :organization_id
      t.string :page_path
      t.string :category_slug
      t.string :session_id
      t.string :request_id
      t.jsonb :meta, null: false, default: {}
      t.datetime :occurred_at, null: false
      t.timestamps
    end
    add_index :banner_events, [:banner_id, :event_type, :occurred_at]
    add_index :banner_events, :occurred_at
    add_foreign_key :banner_events, :banners
  end
end
