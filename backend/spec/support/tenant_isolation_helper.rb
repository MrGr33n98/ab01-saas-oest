# frozen_string_literal: true

module TenantIsolationHelper
  def create_org_user!(type: "customer", role: "owner")
    user = User.create!(
      email: "u-#{SecureRandom.hex(4)}@example.com",
      encrypted_password: "sha256:#{Digest::SHA256.hexdigest('dronehub-mvp-password')}",
      jti: SecureRandom.uuid
    )
    org = Organization.create!(
      name: "Org #{SecureRandom.hex(3)}",
      slug: "org-#{SecureRandom.hex(4)}",
      organization_type: type,
      country_code: "BR"
    )
    OrganizationMembership.create!(organization: org, user: user, role: role, status: "active", joined_at: Time.current)
    [user, org]
  end
end

RSpec.configure do |config|
  config.include TenantIsolationHelper
end
