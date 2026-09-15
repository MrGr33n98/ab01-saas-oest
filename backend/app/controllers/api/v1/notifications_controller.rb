# frozen_string_literal: true

module Api
  module V1
    class NotificationsController < BaseController
      def index
        skip_authorization
        notifications = Notification.where(user_id: current_user.id)
                                    .recent
                                    .limit(params.fetch(:limit, 30).to_i.clamp(1, 100))
        unread_count = Notification.where(user_id: current_user.id).unread.count

        render_data({
          notifications: notifications.map { |n| serialize(n) },
          unread_count: unread_count
        })
      end

      def mark_as_read
        skip_authorization
        if params[:id] == "all"
          Notification.where(user_id: current_user.id, read_at: nil).update_all(read_at: Time.current)
          render_data({ success: true, message: "Todas as notificações marcadas como lidas" })
        else
          notification = Notification.find_by!(id: params[:id], user_id: current_user.id)
          notification.mark_as_read!
          render_data(serialize(notification))
        end
      end

      private

      def serialize(n)
        {
          id: n.id,
          type: n.notification_type,
          title: n.title,
          body: n.body,
          action_url: n.action_url,
          read_at: n.read_at,
          read: n.read?,
          created_at: n.created_at
        }
      end
    end
  end
end
