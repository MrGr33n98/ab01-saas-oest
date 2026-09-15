"use client";

import * as React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import { Dropdown, DropdownTrigger, DropdownMenu } from "@/components/ui/dropdown";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body?: string;
  action_url?: string;
  read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState<number>(0);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await apiFetch<{ data: { notifications: NotificationItem[]; unread_count: number } }>(
        "/notifications?limit=8"
      );
      if (res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch {
      // Background poll failure is silent
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  async function markAllRead() {
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Ignore
    }
  }

  async function markRead(id: string) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "POST" });
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // Ignore
    }
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <button
          type="button"
          className="relative rounded-card p-2 text-text-muted hover:bg-surface-soft hover:text-text transition-colors"
          aria-label="Notificações"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-ink px-1 text-[10px] font-bold text-surface">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownTrigger>

      <DropdownMenu className="w-80 p-0 shadow-xl" align="right">
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-text">Notificações</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] text-accent-ink hover:underline"
            >
              Marcar lidas
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-xs text-text-muted">
              Nenhuma notificação recente
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`p-3 text-left transition-colors ${
                  !n.read ? "bg-accent/10 font-medium" : "hover:bg-surface-soft"
                }`}
              >
                <p className="text-xs text-text">{n.title}</p>
                {n.body && <p className="mt-0.5 text-[11px] text-text-muted line-clamp-2">{n.body}</p>}
                {n.action_url && (
                  <Link
                    href={n.action_url}
                    className="mt-1 inline-block text-[11px] text-accent-ink hover:underline"
                  >
                    Ver detalhes →
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenu>
    </Dropdown>
  );
}
