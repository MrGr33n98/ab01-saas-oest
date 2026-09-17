# frozen_string_literal: true

if defined?(Flipper)
  Flipper.configure do |config|
    config.default do
      # Use ActiveRecord adapter if available, otherwise Memory/Redis fallback
      if ActiveRecord::Base.connection.data_source_exists?("flipper_features")
        adapter = Flipper::Adapters::ActiveRecord.new
      else
        adapter = Flipper::Adapters::Memory.new
      end
      Flipper.new(adapter)
    rescue StandardError
      Flipper.new(Flipper::Adapters::Memory.new)
    end
  end

  # Register core SaaS feature groups
  Flipper.register(:enterprise_actors) do |actor|
    actor.respond_to?(:enterprise?) && actor.enterprise?
  end

  Flipper.register(:beta_operators) do |actor|
    actor.respond_to?(:beta_tester?) && actor.beta_tester?
  end
end
