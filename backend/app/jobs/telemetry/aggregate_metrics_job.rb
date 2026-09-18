# frozen_string_literal: true

module Telemetry
  class AggregateMetricsJob < ApplicationJob
    queue_as :telemetry

    def perform(date_string = nil)
      date = date_string ? Date.parse(date_string) : Date.current
      AggregatorService.aggregate_date(date)
    end
  end
end
