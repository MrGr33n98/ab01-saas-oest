# frozen_string_literal: true

class CreateEmailVerificationAndNotifications < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :email_verified_at, :datetime
    add_column :users, :email_verification_token, :string
    add_index :users, :email_verification_token, unique: true, where: "email_verification_token IS NOT NULL"

    create_table :notifications, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.references :organization, type: :uuid, null: true, foreign_key: true
      t.string :notification_type, limit: 64, null: false
      t.string :title, limit: 255, null: false
      t.text :body
      t.jsonb :payload, null: false, default: {}
      t.string :action_url, limit: 512
      t.datetime :read_at
      t.timestamps
    end

    add_index :notifications, %i[user_id read_at]
    add_index :notifications, :created_at
  end
end
