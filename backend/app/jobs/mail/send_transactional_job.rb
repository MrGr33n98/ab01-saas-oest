# frozen_string_literal: true

module Mail
  class SendTransactionalJob < ApplicationJob
    queue_as :mailers
    retry_on StandardError, wait: :polynomially_longer, attempts: 5

    def perform(template, serialized_kwargs)
      kwargs = deserialize(serialized_kwargs)
      Mail::Deliver.new(template.to_sym, **kwargs).deliver_now!
    end

    private

    def deserialize(hash)
      hash.to_h.transform_keys(&:to_sym).transform_values do |v|
        if v.is_a?(Hash) && (v["_ar"] || v[:_ar])
          klass = (v["_ar"] || v[:_ar]).constantize
          klass.find(v["id"] || v[:id])
        else
          v
        end
      end
    end
  end
end
