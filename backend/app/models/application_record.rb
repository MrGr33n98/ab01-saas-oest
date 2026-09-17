# frozen_string_literal: true

class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  self.implicit_order_column = "created_at"

  SENSITIVE_ATTRIBUTES = %w[
    encrypted_password
    reset_password_token
    reset_password_sent_at
    remember_created_at
    jti
    password
    password_confirmation
    secret_key
    token
    api_key
    api_key_hash
    authentication_token
  ].freeze

  def self.ransackable_attributes(auth_object = nil)
    authorizable_ransackable_attributes
  rescue StandardError
    column_names.reject { |col| SENSITIVE_ATTRIBUTES.include?(col) }
  end

  def self.authorizable_ransackable_attributes
    column_names.reject { |col| SENSITIVE_ATTRIBUTES.include?(col) }
  end

  def self.ransackable_associations(auth_object = nil)
    authorizable_ransackable_associations
  rescue StandardError
    reflect_on_all_associations.map { |a| a.name.to_s }
  end

  def self.authorizable_ransackable_associations
    reflect_on_all_associations.map { |a| a.name.to_s }
  end

  def self.ransackable_scopes(auth_object = nil)
    []
  end
end
