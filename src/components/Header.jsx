import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, X } from "lucide-react";
import api from "../api/axios";
import { useLanguage, useTranslation } from "../i18n/LanguageContext";

/**
 * Enhanced Header for Maintenance Management System
 * Props:
 * - title: Main heading (string or JSX)
 * - subtitle: Context or status (string or JSX)
 * - right: Right-aligned content (JSX)
 * - user: { name, role } (optional, for dashboards)
 * - className: Extra classes
 */
export default function Header({ title, subtitle, right, user, className = "", onNotificationNavigate }) {
  const { language, setLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  // Role label mapping
  const roleMap = {
    admin: "Admin",
    manager: "Manager",
    technician: "Technician",
    client: "Client",
    tenant: "Tenant",
    user: "User",
  };

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const knownNotificationIdsRef = useRef(new Set());
  const browserPermissionRequestedRef = useRef(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      const nextNotifications = Array.isArray(res.data) ? res.data : [];

      if (typeof window !== "undefined" && "Notification" in window) {
        const shouldRequestPermission =
          user &&
          !browserPermissionRequestedRef.current &&
          Notification.permission === "default";

        if (shouldRequestPermission) {
          browserPermissionRequestedRef.current = true;
          Notification.requestPermission().catch(() => {});
        }

        const knownIds = knownNotificationIdsRef.current;
        nextNotifications.forEach((notification) => {
          const id = String(notification?.id || notification?._id || "");
          if (!id) return;

          const isKnown = knownIds.has(id);
          if (!isKnown) {
            knownIds.add(id);
            if (Notification.permission === "granted" && !notification?.read) {
              try {
                const systemNotification = new Notification(notification.title || "New notification", {
                  body: notification.message || "",
                  tag: `mms-${id}`,
                });
                systemNotification.onclick = () => {
                  window.focus();
                  handleNotificationNavigate(notification);
                  systemNotification.close();
                };
              } catch (_) {
                /* ignore browser notification failures */
              }
            }
          }
        });
      }

      setNotifications(nextNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (!Array.isArray(notifications) || notifications.length === 0) return;
    notifications.forEach((notification) => {
      const id = String(notification?.id || notification?._id || "");
      if (id) knownNotificationIdsRef.current.add(id);
    });
  }, [notifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/api/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationNavigate = async (notification) => {
    if (!notification) return;
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (typeof onNotificationNavigate === "function") {
      const handled = onNotificationNavigate(notification);
      if (handled) {
        setShowNotifications(false);
        return;
      }
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  return (
    <header className={`flex flex-col xs:flex-row xs:items-center xs:justify-between responsive-gap responsive-container mb-4 xs:mb-6 ${className}`}>
      <div className="flex items-center gap-2 xs:gap-3">
        {/* System Icon */}
        <span className="bg-indigo-600 rounded-lg xs:rounded-xl p-1.5 xs:p-2 flex items-center justify-center">
          <svg width="24" height="24" className="xs:w-[32px] xs:h-[32px]" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1" /><rect x="6" y="6" width="12" height="6" rx="2" fill="#a5b4fc" /></svg>
        </span>
        
      </div>
      <div className="flex-1 flex flex-col xs:flex-row xs:items-center xs:justify-between responsive-gap mt-2 xs:mt-0">
        <div>
          <h2 className="responsive-heading-md text-gray-900 tracking-tight leading-tight">{title}</h2>
          {subtitle && <div className="responsive-text-sm text-gray-500 mt-1">{subtitle}</div>}
        </div>
        {right && <div className="mt-2 xs:mt-0 flex items-center gap-2 xs:gap-4">
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 xs:p-2.5 glass-ghost rounded-lg xs:rounded-xl hover:bg-white/70 transition-all relative group"
              >
                <Bell className={`responsive-icon-sm ${unreadCount > 0 ? "text-indigo-600" : "text-gray-500"}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 xs:w-5 h-4 xs:h-5 bg-red-500 text-white text-[8px] xs:text-[10px] font-bold rounded-full flex items-center justify-center border border-xs:border-2 border-white animate-in zoom-in duration-300">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 xs:w-80 glass-surface-strong rounded-lg xs:rounded-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-300">
                  <div className="p-3 xs:p-4 bg-white/60 border-b border-white/40 flex items-center justify-between backdrop-blur">
                    <h3 className="font-bold text-gray-900 text-sm xs:text-base">{t("header.notifications")}</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[10px] xs:text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        {t("header.markAllRead")}
                      </button>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-white/40">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 xs:p-4 hover:bg-white/60 transition-colors relative group text-xs xs:text-sm ${!n.read ? "bg-blue-50/40" : ""}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className={`text-xs xs:text-sm font-bold ${!n.read ? "text-indigo-900" : "text-gray-900"}`}>{n.title}</p>
                                <p className="text-[10px] xs:text-xs text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                                <p className="text-[8px] xs:text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                              </div>
                              {!n.read && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="p-1 hover:bg-white rounded-md border border-transparent hover:border-gray-200"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 xs:w-3.5 h-3 xs:h-3.5 text-indigo-600" />
                                </button>
                              )}
                            </div>
                            {(n.link || typeof onNotificationNavigate === "function") && (
                              <button
                                type="button"
                                className="mt-2 xs:mt-3 flex items-center gap-1 xs:gap-1.5 text-[8px] xs:text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                                onClick={() => handleNotificationNavigate(n)}
                              >
                                View Details <ExternalLink className="w-2.5 xs:w-3 h-2.5 xs:h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 xs:p-8 text-center">
                        <div className="w-10 xs:w-12 h-10 xs:h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3">
                          <Bell className="w-5 xs:w-6 h-5 xs:h-6 text-gray-300" />
                        </div>
                        <p className="text-xs xs:text-sm text-gray-500">{t("header.noNotifications")}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-2 xs:p-3 bg-white/60 border-t border-white/40 text-center backdrop-blur">
                    <span className="text-[8px] xs:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("header.endOfAlerts")}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 xs:gap-2">
            <span className="text-[9px] xs:text-[11px] font-semibold text-gray-500 hidden xs:block">{t("language.label")}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-[9px] xs:text-[11px] glass-input rounded-md xs:rounded-lg px-1.5 xs:px-2 py-0.5 xs:py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          {right}
        </div>}
      </div>
    </header>
  );
}

