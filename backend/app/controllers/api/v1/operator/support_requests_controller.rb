# frozen_string_literal: true

module Api
  module V1
    module Operator
      class SupportRequestsController < BaseController
        # POST /api/v1/operator/support_requests
        def create
          request_record = Operators::SupportRequest.new(
            support_request_attributes.merge(organization: current_organization, requested_by: current_user)
          )
          if request_record.save
            render_data(support_payload(request_record), status: :created)
          else
            render_error(status: 422, code: "VALIDATION", title: "Invalid support request", detail: request_record.errors.full_messages.join(", "))
          end
        end

        private

        def support_request_attributes
          params.permit(:subject, :message, :category, :priority).to_h
        end

        def support_payload(record)
          {
            id: record.id,
            subject: record.subject,
            category: record.category,
            priority: record.priority,
            status: record.status,
            created_at: record.created_at
          }
        end
      end
    end
  end
end
