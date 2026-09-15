# frozen_string_literal: true

ActiveAdmin.register Billing::Plan, as: "Plan" do
  menu parent: "Billing", priority: 1

  permit_params :slug, :name, :audience, :price_monthly_cents, :currency, :active, :stripe_price_id, features_json: {}

  scope :all, default: true
  scope("Ativos") { |s| s.where(active: true) }

  filter :slug
  filter :name
  filter :active
  filter :audience

  index do
    selectable_column
    id_column
    column :slug
    column :name
    column :audience
    column("Preço/mês") { |p| p.price_monthly_cents.to_i / 100.0 }
    column :active
    actions
  end

  form do |f|
    f.inputs do
      f.input :slug
      f.input :name
      f.input :audience, as: :select, collection: %w[operator customer both]
      f.input :price_monthly_cents, label: "Preço mensal (centavos)"
      f.input :currency
      f.input :active
      f.input :stripe_price_id
    end
    f.actions
  end
end
