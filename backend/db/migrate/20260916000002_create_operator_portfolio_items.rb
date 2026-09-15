# frozen_string_literal: true

class CreateOperatorPortfolioItems < ActiveRecord::Migration[7.2]
  def change
    create_table :operator_portfolio_items, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :operator_profile, type: :uuid, null: false, foreign_key: true
      t.references :service_category, type: :uuid, null: true, foreign_key: true
      t.string :title, null: false, limit: 160
      t.text :description
      t.string :item_type, null: false, default: "gallery", limit: 32 # gallery, before_after, ortho_sample, case_study
      t.jsonb :media_assets, null: false, default: [] # [{ url, type, caption, gsd_cm, sensor }]
      t.jsonb :before_after_assets, null: false, default: {} # { before_url, after_url, before_label, after_label }
      t.string :location_city, limit: 120
      t.string :location_state, limit: 12
      t.decimal :area_hectares, precision: 10, scale: 2
      t.integer :position, default: 0, null: false
      t.boolean :featured, default: false, null: false
      t.timestamps
    end

    add_index :operator_portfolio_items, %i[operator_profile_id position]
    add_index :operator_portfolio_items, %i[operator_profile_id featured]
  end
end
