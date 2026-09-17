# frozen_string_literal: true

class EnhanceAdsBanners < ActiveRecord::Migration[8.0]
  def change
    add_column :banners, :eyebrow, :string
    add_column :banners, :format_type, :string, default: "standard", null: false
    add_index :banners, :format_type
  end
end
