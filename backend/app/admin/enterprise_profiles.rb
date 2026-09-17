# frozen_string_literal: true

ActiveAdmin.register Enterprises::Profile, as: "EnterpriseProfile" do
  menu parent: "Identidade", priority: 3, label: "Enterprise profiles"

  permit_params :industry, :phone_e164, :billing_email, :payment_currency,
                :billing_address, :email_notifications

  filter :industry
  filter :payment_currency
  filter :email_notifications
  filter :created_at

  index do
    selectable_column
    id_column
    column :organization
    column :industry
    column :billing_email
    column :payment_currency
    column :email_notifications
    column :updated_at
    actions
  end

  form do |f|
    f.inputs "Enterprise profile" do
      f.input :industry
      f.input :phone_e164
      f.input :billing_email
      f.input :payment_currency, as: :select, collection: %w[BRL USD EUR]
      f.input :email_notifications
      f.input :billing_address, as: :text, hint: "JSON: street, city, state_code, postal_code, country_code"
    end
    f.actions
  end
end
