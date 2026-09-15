# frozen_string_literal: true

require "rails_helper"

RSpec.describe TenantScope do
  it "requires organization" do
    expect { TenantScope.resolve(Projects::Project, organization: nil) }.to raise_error(ArgumentError)
  end
end
