import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, X } from "lucide-react";
import api from "../api/axios";

/**
 * Enhanced Header for Maintenance Management System
 * Props:
 * - title: Main heading (string or JSX)
 * - subtitle: Context or status (string or JSX)
 * - right: Right-aligned content (JSX)
 * - user: { name, role } (optional, for dashboards)
 * - className: Extra classes
 */
export default function Header({ title, subtitle, right, user, className = "" }) {
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

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data);
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

  const unreadCount = notifications.filter(n => !n.read).length;
  return (
    <header className={`flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-6 px-2 md:px-0 ${className}`}>
      <div className="flex items-center gap-3">
        {/* System Icon */}
        <span className="bg-indigo-600 rounded-xl p-2 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1" /><rect x="6" y="6" width="12" height="6" rx="2" fill="#a5b4fc" /></svg>
        </span>
        
      </div>
      <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0 mt-2 md:mt-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">{title}</h2>
          {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
        </div>
        {right && <div className="mt-2 md:mt-0 flex items-center gap-4">
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all relative group shadow-sm"
              >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-indigo-600" : "text-gray-500"}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-300">
                  <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-4 hover:bg-gray-50 transition-colors relative group ${!n.read ? "bg-indigo-50/30" : ""}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className={`text-sm font-bold ${!n.read ? "text-indigo-900" : "text-gray-900"}`}>{n.title}</p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                              </div>
                              {!n.read && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="p-1 hover:bg-white rounded-md border border-transparent hover:border-gray-200"
                                  title="Mark as read"
                                >
                                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                                </button>
                              )}
                            </div>
                            {n.link && (
                              <a
                                href={n.link}
                                className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                                onClick={() => markAsRead(n.id)}
                              >
                                View Details <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-500">No notifications yet</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50/50 border-t border-gray-100 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End of alerts</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {right}
        </div>}
      </div>
    </header>
  );
}
