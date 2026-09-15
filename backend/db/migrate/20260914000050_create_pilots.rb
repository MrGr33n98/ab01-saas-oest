# frozen_string_literal: true

class CreatePilots < ActiveRecord::Migration[7.2]
  def change
    create_table :pilots, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :user, type: :uuid, null: true, foreign_key: true
      t.string :full_name, limit: 180, null: false
      t.string :license_number, limit: 64
      t.string :anac_license, limit: 64
      t.string :phone, limit: 32
      t.string :email, limit: 255
      t.string :verification_status, limit: 32, null: false, default: "pending"
      t.boolean :available, null: false, default: true
      t.integer :flight_hours_logged, null: false, default: 0
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end

    add_index :pilots, %i[organization_id verification_status]
    add_index :pilots, :anac_license
  end
end
