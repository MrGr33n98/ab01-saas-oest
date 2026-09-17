# frozen_string_literal: true

if defined?(PaperTrail)
  PaperTrail.config.enabled = true
  PaperTrail.config.has_paper_trail_defaults = {
    on: %i[create update destroy]
  }

  # Version limits to avoid unbounded DB growth
  PaperTrail.config.version_limit = 50

  # Models with mandatory audit trail:
  # - Missions::Mission
  # - Quotes::Quote
  # - Orders::Order
  # - Deliverables::Deliverable
  # - Organization
  # - OrganizationMembership
  # - Enterprises::ApiKey
end
