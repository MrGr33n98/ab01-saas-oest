# frozen_string_literal: true

module Matching
  class EnqueueJob < ApplicationJob
    queue_as :default

    def perform(mission_id)
      Matching::RunForMissionJob.perform_now(mission_id)
    end
  end
end
