# frozen_string_literal: true

module Mail
  # Central dispatch for transactional email.
  # Prefer async (ActiveJob). Failures are logged; never break the domain transaction.
  class Deliver
    CATALOG = {
      welcome: :welcome,
      password_reset: :password_reset,
      email_verification: :email_verification,
      mission_published: :mission_published,
      job_invite: :job_invite,
      quote_received: :quote_received,
      quote_accepted: :quote_accepted,
      payment_confirmed: :payment_confirmed,
      mission_started: :mission_started,
      deliverable_ready: :deliverable_ready,
      deliverable_approved: :deliverable_approved,
      deliverable_rejected: :deliverable_rejected,
      review_received: :review_received,
      operator_verified: :operator_verified
    }.freeze

    def self.call(template, **kwargs)
      new(template, **kwargs).call
    end

    def initialize(template, **kwargs)
      @template = template.to_sym
      @kwargs = kwargs
    end

    def call
      raise ArgumentError, "Unknown email template: #{template}" unless CATALOG.key?(template)

      if ENV.fetch("MAIL_DELIVERY", "async") == "inline"
        deliver_now!
      else
        Mail::SendTransactionalJob.perform_later(template.to_s, serialize_args(kwargs))
      end
    rescue StandardError => e
      Rails.logger.error({ event: "mail_enqueue_failed", template: template, error: e.message }.to_json)
      false
    end

    def deliver_now!
      method = CATALOG.fetch(template)
      TransactionalMailer.public_send(method, **kwargs).deliver_now
      true
    end

    private

    attr_reader :template, :kwargs

    # ActiveJob-friendly: pass IDs, reload in job
    def serialize_args(args)
      args.transform_values do |v|
        case v
        when ActiveRecord::Base then { "_ar" => v.class.name, "id" => v.id }
        else v
        end
      end
    end
  end
end
