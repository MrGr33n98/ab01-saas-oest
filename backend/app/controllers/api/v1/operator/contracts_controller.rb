# frozen_string_literal: true

module Api
  module V1
    module Operator
      class ContractsController < BaseController
        # GET /api/v1/operator/contracts
        def index
          contracts = operator_profile.operator_contracts.order(created_at: :desc)
          render_data(contracts.map { |contract| contract_payload(contract) })
        end

        private

        def operator_profile
          @operator_profile ||= current_organization.operator_profile || raise(ActiveRecord::RecordNotFound)
        end

        def contract_payload(contract)
          {
            id: contract.id,
            contract_type: contract.contract_type,
            title: contract.title,
            version: contract.version,
            status: contract.status,
            document_url: contract.document_url,
            signed_at: contract.signed_at,
            expires_at: contract.expires_at,
            created_at: contract.created_at
          }
        end
      end
    end
  end
end
