# frozen_string_literal: true

# Explicitly separates the two product experiences from platform roles.
# `platform_role` remains an internal authorization concern; `user_type` is the
# user's primary workspace and must match the selected organization context.
class AddTenantTypesAndEnterpriseInfrastructure < ActiveRecord::Migration[7.2]
  def up
    add_column :users, :user_type, :string, limit: 24

    execute <<~SQL.squish
      UPDATE users
      SET user_type = CASE
        WHEN EXISTS (
          SELECT 1
          FROM organization_memberships
          INNER JOIN organizations ON organizations.id = organization_memberships.organization_id
          WHERE organization_memberships.user_id = users.id
            AND organization_memberships.status = 'active'
            AND organizations.organization_type = 'drone_operator'
        ) THEN 'operator'
        ELSE 'enterprise'
      END
    SQL

    change_column_default :users, :user_type, from: nil, to: "enterprise"
    change_column_null :users, :user_type, false
    add_index :users, :user_type
    add_check_constraint :users,
                         "user_type IN ('operator', 'enterprise')",
                         name: "users_user_type_check"

    create_table :enterprise_profiles, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true, index: { unique: true }
      t.string :industry, limit: 120
      t.string :phone_e164, limit: 32
      t.citext :billing_email
      t.string :payment_currency, limit: 3, null: false, default: "BRL"
      t.jsonb :billing_address, null: false, default: {}
      t.boolean :email_notifications, null: false, default: true
      t.timestamps
    end
    add_index :enterprise_profiles, :industry

    create_table :enterprise_api_keys, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :organization, type: :uuid, null: false, foreign_key: true
      t.references :requested_by, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.references :approved_by, type: :uuid, foreign_key: { to_table: :users }
      t.string :name, limit: 120, null: false
      t.string :prefix, limit: 32
      t.string :token_digest, limit: 128
      t.jsonb :scopes, null: false, default: []
      t.string :status, limit: 24, null: false, default: "requested"
      t.datetime :requested_at, null: false
      t.datetime :approved_at
      t.datetime :activated_at
      t.datetime :revoked_at
      t.datetime :last_used_at
      t.datetime :expires_at
      t.timestamps
    end
    add_index :enterprise_api_keys, %i[organization_id status]
    add_index :enterprise_api_keys, :prefix, unique: true, where: "prefix IS NOT NULL"
    add_check_constraint :enterprise_api_keys,
                         "status IN ('requested', 'approved', 'active', 'revoked', 'cancelled')",
                         name: "enterprise_api_keys_status_check"
  end

  def down
    drop_table :enterprise_api_keys
    drop_table :enterprise_profiles
    remove_check_constraint :users, name: "users_user_type_check"
    remove_index :users, :user_type
    remove_column :users, :user_type
  end
end
