# frozen_string_literal: true

require "rails_helper"

RSpec.describe Quotes::Accept do
  it "is defined as MVP service" do
    expect(defined?(Quotes::Accept)).to eq("constant")
  end
end
