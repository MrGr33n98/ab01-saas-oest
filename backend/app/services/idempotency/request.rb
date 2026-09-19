# frozen_string_literal: true

require "digest"
require "json"

module Idempotency
  class Request
    RESPONSE_TTL = 24.hours

    Conflict = Class.new(StandardError)
    InProgress = Class.new(StandardError)
    Result = Struct.new(:status, :body, :replayed?, keyword_init: true)

    def initialize(organization:, identity:, endpoint:, key:, payload:)
      @organization = organization
      @identity = identity.to_s
      @endpoint = endpoint.to_s
      @key = key.to_s
      @payload = payload
    end

    def call(&operation)
      raise ArgumentError, "Idempotency-Key is required" if key.blank?

      existing = find_record
      return replay(existing) if existing

      create_and_execute(&operation)
    rescue ActiveRecord::RecordNotUnique
      existing = find_record
      raise InProgress, "Idempotency request is still being processed" unless existing

      replay(existing)
    end

    private

    attr_reader :organization, :identity, :endpoint, :key, :payload

    def create_and_execute(&operation)
      ActiveRecord::Base.transaction(requires_new: true) do
        existing = find_record(lock: true)
        next replay(existing) if existing

        record = IdempotencyKey.create!(
          organization: organization,
          scope: scope,
          key: key_digest,
          request_hash: request_hash,
          expires_at: RESPONSE_TTL.from_now
        )
        status, body = operation.call
        record.update!(response_status: status, response_body: body)

        Result.new(status: status, body: body, replayed?: false)
      end
    end

    def replay(record)
      raise Conflict, "Idempotency-Key was already used with a different request" unless record.request_hash == request_hash
      raise InProgress, "Idempotency request is still being processed" if record.response_status.blank?

      Result.new(status: record.response_status, body: record.response_body, replayed?: true)
    end

    def find_record(lock: false)
      relation = IdempotencyKey.where(organization_id: organization.id, scope: scope, key: key_digest)
      relation = relation.lock if lock
      relation.first
    end

    def scope
      "#{endpoint}:#{identity}"
    end

    def key_digest
      Digest::SHA256.hexdigest(key)
    end

    def request_hash
      @request_hash ||= Digest::SHA256.hexdigest(JSON.generate(canonicalize(payload)))
    end

    def canonicalize(value)
      case value
      when Hash
        value.each_with_object({}) do |(key, nested_value), normalized|
          normalized[key.to_s] = canonicalize(nested_value)
        end.sort.to_h
      when Array
        value.map { |nested_value| canonicalize(nested_value) }
      else
        value
      end
    end
  end
end
