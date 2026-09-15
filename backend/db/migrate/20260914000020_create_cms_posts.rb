# frozen_string_literal: true

class CreateCmsPosts < ActiveRecord::Migration[7.2]
  def change
    create_table :cms_posts, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :slug, null: false, limit: 180
      t.string :locale, null: false, default: "pt-BR", limit: 10
      t.string :translation_key, limit: 64 # pairs pt-BR ↔ en
      t.string :status, null: false, default: "draft", limit: 32
      t.string :title, null: false, limit: 200
      t.string :h1, limit: 200
      t.text :excerpt
      t.text :body_md, null: false, default: ""
      t.string :meta_title, limit: 70
      t.string :meta_description, limit: 180
      t.string :canonical_url, limit: 500
      t.string :og_image_url, limit: 500
      t.string :geo_states, array: true, default: []
      t.string :geo_cities, array: true, default: []
      t.string :category_slugs, array: true, default: []
      t.string :tags, array: true, default: []
      t.jsonb :faq_blocks, null: false, default: []
      t.uuid :author_id
      t.datetime :published_at
      t.timestamps
    end

    add_index :cms_posts, [:locale, :slug], unique: true
    add_index :cms_posts, :status
    add_index :cms_posts, :published_at
    add_index :cms_posts, :translation_key
    add_index :cms_posts, :geo_states, using: :gin
    add_index :cms_posts, :category_slugs, using: :gin
  end
end
