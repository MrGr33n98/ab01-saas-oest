# frozen_string_literal: true

ActiveAdmin.register Operators::OnboardingProfile, as: "OperatorOnboardingProfile" do
  menu parent: "Marketplace", priority: 2, label: "Operator onboarding"
  actions :index, :show

  scope :all, default: true
  scope("Draft") { |scope| scope.where(onboarding_status: "draft") }
  scope("Ready for review") { |scope| scope.where(onboarding_status: %w[ready submitted]) }
  scope("Approved") { |scope| scope.where(onboarding_status: "approved") }
  scope("Rejected") { |scope| scope.where(onboarding_status: "rejected") }

  filter :onboarding_status, as: :select, collection: Operators::OnboardingProfile::STATUSES
  filter :operator_profile_organization_name, as: :string
  filter :created_at

  index do
    selectable_column
    id_column
    column("Operator") { |record| link_to record.operator_profile.display_name, admin_operator_profile_path(record.operator_profile) }
    column :onboarding_status do |record|
      status_tag record.onboarding_status
    end
    column("Progress") { |record| "#{record.completion_percentage}%" }
    column("Completed sections") { |record| record.completed_sections.join(", ") }
    column :updated_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :operator_profile
      row(:onboarding_status) { |record| status_tag record.onboarding_status }
      row("Progress") { |record| "#{record.completion_percentage}%" }
      row("Completed sections") { |record| record.completed_sections.join(", ") }
      row :contact_data
      row :equipment_data
      row :business_data
      row :experience_data
      row :documents_data
      row :pricing_data
      row :submitted_at
      row :reviewed_by
      row :reviewed_at
      row :review_note
    end
  end

  member_action :approve, method: :post do
    resource.update!(onboarding_status: "approved", reviewed_by: current_admin_user, reviewed_at: Time.current)
    AuditLog.create!(
      organization_id: resource.operator_profile.organization_id,
      actor_id: current_admin_user.id,
      action: "operator_onboarding.approved",
      auditable_type: resource.class.name,
      auditable_id: resource.id,
      after_data: { onboarding_status: resource.onboarding_status }
    )
    redirect_to resource_path, notice: "Operator onboarding approved"
  end

  member_action :reject, method: :post do
    resource.update!(onboarding_status: "rejected", reviewed_by: current_admin_user, reviewed_at: Time.current)
    redirect_to resource_path, notice: "Operator onboarding rejected"
  end

  action_item :approve, only: :show, if: proc { resource.onboarding_status.in?(%w[ready submitted]) } do
    link_to "Approve", approve_admin_operator_onboarding_profile_path(resource), method: :post,
            data: { confirm: "Approve this onboarding profile?" }
  end

  action_item :reject, only: :show, if: proc { resource.onboarding_status.in?(%w[ready submitted]) } do
    link_to "Reject", reject_admin_operator_onboarding_profile_path(resource), method: :post,
            data: { confirm: "Reject this onboarding profile?" }
  end
end
