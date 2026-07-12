"use client";

import React, { useRef, useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useNotificationStore, Notification, NotificationType } from "@/store/notificationStore";

const typeConfig: Record<
  NotificationType,
  { icon: React.ReactNode; color: string; dot: string }
> = {
  success: {
    icon: <CheckCircle className="h-4 w-4 text-emerald-400" />,
    color: "border-l-emerald-500/40",
    dot: "bg-emerald-400",
  },
  error: {
    icon: <AlertCircle className="h-4 w-4 text-rose-400" />,
    color: "border-l-rose-500/40",
    dot: "bg-rose-400",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    color: "border-l-amber-500/40",
    dot: "bg-amber-400",
  },
  info: {
    icon: <Info className="h-4 w-4 text-sky-400" />,
    color: "border-l-sky-500/40",
    dot: "bg-sky-400",
  },
};

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "Just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function NotificationItem({ notif }: { notif: Notification }) {
  const { dismiss } = useNotificationStore();
  const config = typeConfig[notif.type];

  return (
    <div
      className={`relative group flex items-start gap-3 px-4 py-3 border-l-2 ${config.color} ${
        notif.read ? "opacity-60" : ""
      } hover:bg-white/[0.03] transition-colors`}
    >
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white leading-snug">{notif.title}</p>
        {notif.message && (
          <p className="text-[11px] text-white/40 mt-0.5 leading-snug line-clamp-2">{notif.message}</p>
        )}
        <p className="text-[10px] text-white/25 mt-1">{timeAgo(notif.timestamp)}</p>
      </div>
      {!notif.read && (
        <span className={`absolute top-3 right-8 h-1.5 w-1.5 rounded-full ${config.dot} shrink-0`} />
      )}
      <button
        onClick={() => dismiss(notif.id)}
        className="absolute top-2 right-2 p-1 rounded text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Dismiss"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, clearAll } = useNotificationStore();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Mark all read when panel opens
  useEffect(() => {
    if (open && unreadCount > 0) {
      const t = setTimeout(markAllRead, 800);
      return () => clearTimeout(t);
    }
  }, [open, unreadCount, markAllRead]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        id="notification-center-btn"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/[0.08] bg-[#0c0c14] shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllRead}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                    title="Mark all read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={clearAll}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                    title="Clear all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="h-6 w-6 text-white/15 mx-auto mb-2" />
                <p className="text-xs text-white/25">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => <NotificationItem key={n.id} notif={n} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
