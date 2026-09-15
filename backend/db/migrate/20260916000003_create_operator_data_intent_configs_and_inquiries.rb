# frozen_string_literal: true

class CreateOperatorDataIntentConfigsAndInquiries < ActiveRecord::Migration[7.2]
  def change
    create_table :operator_data_intent_configs, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :operator_profile, type: :uuid, null: false, foreign_key: true, index: { unique: true }
      t.boolean :wizard_enabled, default: true, null: false
      t.string :headline, limit: 160, default: "Calcule uma estimativa instantânea para sua área"
      t.decimal :min_base_price, precision: 10, scale: 2, default: 1500.00
      t.decimal :price_per_hectare_rgb, precision: 10, scale: 2, default: 25.00
      t.decimal :price_per_hectare_multispectral, precision: 10, scale: 2, default: 45.00
      t.decimal :price_per_hectare_lidar, precision: 10, scale: 2, default: 85.00
      t.decimal :thermal_asset_base_price, precision: 10, scale: 2, default: 3200.00
      t.integer :typical_delivery_days, default: 5
      t.timestamps
    end

    create_table :operator_lead_inquiries, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :operator_profile, type: :uuid, null: false, foreign_key: true
      t.references :organization, type: :uuid, null: true, foreign_key: true
      t.string :contact_name, null: false, limit: 120
      t.string :contact_email, null: false, limit: 180
      t.string :contact_phone, limit: 32
      t.string :service_type, null: false, limit: 64
      t.string :city, limit: 120
      t.string :state_code, limit: 12
      t.decimal :estimated_area_ha, precision: 10, scale: 2
      t.decimal :calculated_min_price, precision: 10, scale: 2
      t.decimal :calculated_max_price, precision: 10, scale: 2
      t.string :status, default: "pending_response", limit: 32, null: false
      t.text :notes
      t.timestamps
    end

    add_index :operator_lead_inquiries, %i[operator_profile_id status]
  end
end
