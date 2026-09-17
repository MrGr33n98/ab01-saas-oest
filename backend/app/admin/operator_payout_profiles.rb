# frozen_string_literal: true

ActiveAdmin.register Operators::PayoutProfile, as: "OperatorPayoutProfile" do
  menu parent: "Operações", priority: 7, label: "Operator payouts"
  actions :index, :show

  scope :all, default: true
  scope("Unverified") { |scope| scope.where(verification_status: "unverified") }
  scope("Pending") { |scope| scope.where(verification_status: "pending") }
  scope("Verified") { |scope| scope.where(verification_status: "verified") }
  scope("Rejected") { |scope| scope.where(verification_status: "rejected") }

  filter :organization
  filter :account_kind, as: :select, collection: Operators::PayoutProfile::ACCOUNT_KINDS
  filter :verification_status, as: :select, collection: Operators::PayoutProfile::VERIFICATION_STATUSES
  filter :bank_name
  filter :updated_at

  index do
    id_column
    column :organization
    column :account_kind
    column :bank_name
    column("Account") { |record| record.bank_account_last4.present? ? "•••• #{record.bank_account_last4}" : "—" }
    column :paypal_email
    column :verification_status do |record|
      status_tag record.verification_status
    end
    column :updated_at
    actions
  end

  show do
    attributes_table do
      row :organization
      row :account_kind
      row :billing_data
      row :payout_provider
      row :payout_provider_reference
      row :account_holder_name
      row :bank_name
      row("Account") { |record| record.bank_account_last4.present? ? "•••• #{record.bank_account_last4}" : "—" }
      row :swift_bic
      row :paypal_email
      row(:verification_status) { |record| status_tag record.verification_status }
      row :updated_by
      row :updated_at
    end
  end

  member_action :verify, method: :post do
    resource.update!(verification_status: "verified")
    AuditLog.create!(
      organization_id: resource.organization_id,
      actor_id: current_admin_user.id,
      action: "operator_payout.verified",
      auditable_type: resource.class.name,
      auditable_id: resource.id,
      after_data: { verification_status: resource.verification_status }
    )
    redirect_to resource_path, notice: "Payout profile verified"
  end

  member_action :reject, method: :post do
    resource.update!(verification_status: "rejected")
    redirect_to resource_path, notice: "Payout profile rejected"
  end

  action_item :verify, only: :show, if: proc { resource.verification_status.in?(%w[unverified pending]) } do
    link_to "Verify", verify_admin_operator_payout_profile_path(resource), method: :post
  end

  action_item :reject, only: :show, if: proc { resource.verification_status.in?(%w[unverified pending]) } do
    link_to "Reject", reject_admin_operator_payout_profile_path(resource), method: :post
  end
end
