# frozen_string_literal: true

module Operators
  module Associates
    class ImportRows
      Result = Struct.new(:records, :errors, keyword_init: true) do
        def success?
          errors.blank?
        end

        def failure?
          !success?
        end
      end

      MAX_ROWS = 500

      def initialize(profile:, rows:)
        @profile = profile
        @rows = Array(rows)
      end

      def call
        return Result.new(records: [], errors: ["At most #{MAX_ROWS} associated operators can be imported at once"]) if @rows.size > MAX_ROWS

        records = []
        ApplicationRecord.transaction do
          @rows.each_with_index do |row, index|
            attributes = row.to_h.deep_stringify_keys.slice(
              "full_name", "email", "phone_e164", "company_name", "country_code",
              "state_code", "city", "license_number"
            )
            record = @profile.associated_operators.find_or_initialize_by(email: attributes["email"].presence)
            record.assign_attributes(attributes.merge(organization: @profile.organization, source: "csv"))
            record.full_name = attributes["full_name"].presence || record.full_name
            record.save!
            records << record
          rescue ActiveRecord::RecordInvalid => e
            raise ActiveRecord::Rollback, "Row #{index + 1}: #{e.record.errors.full_messages.join(', ')}"
          end
        end
        return Result.new(records: [], errors: ["The import could not be completed"]) if records.size != @rows.size

        Result.new(records: records, errors: [])
      rescue StandardError => e
        Result.new(records: [], errors: [e.message])
      end
    end
  end
end
