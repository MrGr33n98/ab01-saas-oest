# frozen_string_literal: true

module Operators
  class AssociatedOperator < ApplicationRecord
    self.table_name = "operator_associated_operators"

    STATUSES = %w[active inactive pending].freeze
    SOURCES = %w[manual csv].freeze

    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"
    belongs_to :organization

    validates :full_name, presence: true, length: { maximum: 180 }
    validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
    validates :country_code, length: { is: 2 }, allow_blank: true
    validates :status, inclusion: { in: STATUSES }
    validates :source, inclusion: { in: SOURCES }
  end
end
