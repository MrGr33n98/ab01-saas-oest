# frozen_string_literal: true

ActiveAdmin.register Operators::MissionInvite, as: "OperatorMissionInvite" do
  menu parent: "Operações", priority: 5, label: "Operator invites"

  permit_params :mission_id, :operator_profile_id, :message, :expires_at, :status

  scope :all, default: true
  scope("Pending") { |scope| scope.where(status: "pending") }
  scope("Accepted") { |scope| scope.where(status: "accepted") }
  scope("Declined") { |scope| scope.where(status: "declined") }
  scope("Expired") { |scope| scope.where(status: "expired") }

  filter :mission
  filter :operator_profile
  filter :status, as: :select, collection: Operators::MissionInvite::STATUSES
  filter :expires_at
  filter :created_at

  controller do
    def build_resource
      super.tap do |invite|
        invite.invited_by ||= current_admin_user
      end
    end
  end

  index do
    selectable_column
    id_column
    column :mission
    column :operator_profile
    column :status do |record|
      status_tag record.status
    end
    column :expires_at
    column :responded_at
    actions
  end

  form do |f|
    f.inputs "Invite" do
      f.input :mission
      f.input :operator_profile
      f.input :message
      f.input :expires_at
      f.input :status, as: :select, collection: Operators::MissionInvite::STATUSES
    end
    f.actions
  end
end
