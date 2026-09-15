# frozen_string_literal: true

class QuoteRequest < ApplicationRecord
  self.table_name = "quote_requests"

  belongs_to :operator_profile, class_name: "Operators::OperatorProfile"

  validates :contact_email, presence: true
  validates :status, inclusion: { in: %w[new read contacted archived] }
end
