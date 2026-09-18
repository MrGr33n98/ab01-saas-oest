# frozen_string_literal: true

class AddUniqueIndexToWebhookDeliveries < ActiveRecord::Migration[7.2]
  def change
    add_index :webhook_deliveries, %i[webhook_endpoint_id event_id], unique: true, name: "idx_webhook_deliveries_endpoint_event_unique"
  end
end
