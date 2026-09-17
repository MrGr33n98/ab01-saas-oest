# frozen_string_literal: true

class CreateOperatorFleet < ActiveRecord::Migration[7.2]
  def change
    create_table :drones, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.string :manufacturer, limit: 100, null: false
      t.string :model, limit: 120, null: false
      t.string :serial_number, limit: 120
      t.string :registration_number, limit: 120
      t.string :status, limit: 32, null: false, default: "active"
      t.integer :max_flight_minutes
      t.integer :max_payload_grams
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end
    add_index :drones, [:organization_id, :status]
    add_index :drones, :registration_number

    create_table :payloads, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.string :name, limit: 120, null: false
      t.string :payload_type, limit: 64, null: false
      t.string :manufacturer, limit: 100
      t.string :model, limit: 120
      t.integer :weight_grams
      t.jsonb :specs, null: false, default: {}
      t.timestamps
    end
    add_index :payloads, [:organization_id, :payload_type]

    create_table :drone_payloads, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :drone, type: :uuid, null: false, foreign_key: true
      t.references :payload, type: :uuid, null: false, foreign_key: true
      t.timestamps
    end
    add_index :drone_payloads, [:drone_id, :payload_id], unique: true

    create_table :active_admin_comments, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :namespace
      t.text   :body
      t.string :resource_type
      t.uuid   :resource_id
      t.string :author_type
      t.uuid   :author_id
      t.timestamps
    end
    add_index :active_admin_comments, [:namespace]
    add_index :active_admin_comments, [:resource_type, :resource_id]
    add_index :active_admin_comments, [:author_type, :author_id]
  end
end
