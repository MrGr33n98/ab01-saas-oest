# frozen_string_literal: true

class AddStripeRefsToOrders < ActiveRecord::Migration[7.2]
  def change
    add_column :orders, :payment_provider, :string, limit: 32 unless column_exists?(:orders, :payment_provider)
    add_column :orders, :payment_provider_ref, :string, limit: 180 unless column_exists?(:orders, :payment_provider_ref)
    add_index :orders, :payment_provider_ref unless index_exists?(:orders, :payment_provider_ref)

    unless column_exists?(:payments, :method)
      add_column :payments, :method, :string, limit: 32
    end
    unless column_exists?(:payments, :paid_at)
      add_column :payments, :paid_at, :datetime
    end
    unless column_exists?(:payments, :confirmed_by_id)
      add_column :payments, :confirmed_by_id, :uuid
    end
    unless column_exists?(:payments, :idempotency_key)
      add_column :payments, :idempotency_key, :string, limit: 120
    end
  end
end
