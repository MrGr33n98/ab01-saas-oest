# frozen_string_literal: true

require "csv"

module Admin
  class ImportOrganizationsCsv
    Result = Struct.new(:created, :updated, :errors, :rows, keyword_init: true)

    def self.call(file:, actor: nil)
      new(file, actor).call
    end

    def initialize(file, actor)
      @file = file
      @actor = actor
      @created = 0
      @updated = 0
      @errors = []
      @rows = 0
    end

    def call
      content = @file.respond_to?(:read) ? @file.read : File.read(@file.to_s)
      content = content.force_encoding("UTF-8")
      table = CSV.parse(content, headers: true, header_converters: ->(h) { h.to_s.strip.downcase })

      table.each_with_index do |row, idx|
        @rows += 1
        line = idx + 2
        begin
          import_row(row, line)
        rescue StandardError => e
          @errors << "Linha #{line}: #{e.message}"
        end
      end

      Result.new(created: @created, updated: @updated, errors: @errors, rows: @rows)
    end

    private

    def import_row(row, line)
      name = row["name"].to_s.strip
      raise "name obrigatório" if name.blank?

      slug = row["slug"].presence&.parameterize || name.parameterize
      type = row["organization_type"].presence || "customer"
      raise "organization_type inválido: #{type}" unless Organization::TYPES.include?(type)

      country = (row["country_code"].presence || "BR").upcase[0, 2]
      status = row["status"].presence || "active"
      raise "status inválido" unless %w[active suspended closed].include?(status)

      org = Organization.find_or_initialize_by(slug: slug)
      was_new = org.new_record?
      org.assign_attributes(name: name, organization_type: type, country_code: country, status: status)
      org.save!

      was_new ? @created += 1 : @updated += 1

      AuditLog.create!(
        organization_id: org.id,
        actor_id: @actor&.id,
        action: was_new ? "admin.org.csv_created" : "admin.org.csv_updated",
        auditable_type: "Organization",
        auditable_id: org.id,
        after_data: { source: "csv", line: line },
        created_at: Time.current
      )
    rescue ActiveRecord::RecordInvalid => e
      raise e.record.errors.full_messages.join(", ")
    end
  end
end
