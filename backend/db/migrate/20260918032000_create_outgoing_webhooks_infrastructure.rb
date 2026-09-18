# frozen_string_literal: true

class CreateOutgoingWebhooksInfrastructure < ActiveRecord::Migration[7.2]
  def up
    create_table :webhook_endpoints, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :created_by, type: :uuid, foreign_key: { to_table: :users }
      t.string :url, null: false, limit: 2048
      t.string :description, limit: 255
      t.string :secret_key, null: false, limit: 128
      t.jsonb :events, null: false, default: []
      t.string :status, limit: 24, null: false, default: "active"
      t.datetime :disabled_at
      t.datetime :last_successful_delivery_at
      t.datetime :last_failed_delivery_at
      t.timestamps
    end

    add_index :webhook_endpoints, %i[organization_id status]
    add_index :webhook_endpoints, :status
    add_check_constraint :webhook_endpoints,
                         "status IN ('active', 'disabled', 'failed')",
                         name: "webhook_endpoints_status_check"

    create_table :webhook_deliveries, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :webhook_endpoint, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.string :event_type, limit: 120, null: false
      t.string :event_id, limit: 120, null: false
      t.jsonb :payload, null: false, default: {}
      t.string :status, limit: 24, null: false, default: "pending"
      t.integer :attempts_count, null: false, default: 0
      t.datetime :next_retry_at
      t.datetime :completed_at
      t.timestamps
    end

    add_index :webhook_deliveries, %i[webhook_endpoint_id status]
    add_index :webhook_deliveries, %i[organization_id created_at]
    add_index :webhook_deliveries, :event_id
    add_index :webhook_deliveries, %i[status next_retry_at]
    add_check_constraint :webhook_deliveries,
                         "status IN ('pending', 'delivering', 'succeeded', 'failed')",
                         name: "webhook_deliveries_status_check"

    create_table :webhook_attempts, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :webhook_delivery, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.integer :attempt_number, null: false
      t.integer :response_status_code
      t.text :response_body
      t.jsonb :response_headers, default: {}
      t.float :duration_ms
      t.string :error_class, limit: 255
      t.text :error_message
      t.string :status, limit: 24, null: false
      t.datetime :attempted_at, null: false
      t.timestamps
    end

    add_index :webhook_attempts, %i[webhook_delivery_id attempt_number], unique: true
    add_check_constraint :webhook_attempts,
                         "status IN ('succeeded', 'failed')",
                         name: "webhook_attempts_status_check"
  end

  def down
    drop_table :webhook_attempts
    drop_table :webhook_deliveries
    drop_table :webhook_endpoints
  end
end
