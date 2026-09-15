# frozen_string_literal: true

class CreateOrganizationFollows < ActiveRecord::Migration[7.2]
  def change
    create_table :organization_follows, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :follower_organization, type: :uuid, null: false, foreign_key: { to_table: :organizations }
      t.references :followed_operator_profile, type: :uuid, null: false, foreign_key: { to_table: :operator_profiles }
      t.boolean :notify_on_new_case_studies, default: true, null: false
      t.boolean :notify_on_fleet_update, default: true, null: false
      t.timestamps
    end

    add_index :organization_follows,
              %i[follower_organization_id followed_operator_profile_id],
              unique: true,
              name: "idx_unique_org_follow"
  end
end
