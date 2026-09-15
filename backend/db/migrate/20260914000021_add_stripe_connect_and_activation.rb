# frozen_string_literal: true

class AddStripeConnectAndActivation < ActiveRecord::Migration[7.2]
  def change
    add_column :organizations, :stripe_account_id, :string, limit: 120 unless column_exists?(:organizations, :stripe_account_id)
    add_index :organizations, :stripe_account_id unless index_exists?(:organizations, :stripe_account_id)
  end
end
