class CreateTelemetryInfrastructure < ActiveRecord::Migration[8.0]
  def change
    create_table :telemetry_events, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: true, foreign_key: { on_delete: :nullify }, index: true
      t.string :actor_type
      t.uuid :actor_id
      t.string :session_id
      t.string :event_name, null: false
      t.string :entity_type
      t.uuid :entity_id
      t.jsonb :properties, default: {}, null: false
      t.datetime :occurred_at, null: false
      t.datetime :received_at, null: false
      t.string :request_id
      t.string :source, default: "web", null: false
      t.integer :schema_version, default: 1, null: false

      t.timestamps
    end

    add_index :telemetry_events, [:organization_id, :occurred_at]
    add_index :telemetry_events, [:event_name, :occurred_at]
    add_index :telemetry_events, [:entity_type, :entity_id]
    add_index :telemetry_events, :occurred_at
    add_index :telemetry_events, [:request_id, :event_name], unique: true, where: "request_id IS NOT NULL", name: "idx_telemetry_events_idempotency"

    create_table :daily_tenant_metrics, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: { on_delete: :cascade }, index: true
      t.date :date, null: false
      t.string :metric_name, null: false
      t.bigint :value, default: 0, null: false
      t.jsonb :metadata, default: {}, null: false

      t.timestamps
    end

    add_index :daily_tenant_metrics, [:organization_id, :date, :metric_name], unique: true, name: "idx_daily_tenant_metrics_unique"
    add_index :daily_tenant_metrics, [:metric_name, :date]

    create_table :daily_platform_metrics, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.date :date, null: false
      t.string :metric_name, null: false
      t.bigint :value, default: 0, null: false
      t.jsonb :metadata, default: {}, null: false

      t.timestamps
    end

    add_index :daily_platform_metrics, [:date, :metric_name], unique: true, name: "idx_daily_platform_metrics_unique"
    add_index :daily_platform_metrics, [:metric_name, :date]
  end
end
