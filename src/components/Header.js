import React from "react";

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
  return (
    <header className={`flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-6 px-2 md:px-0 ${className}`}>
      <div className="flex items-center gap-3">
        {/* System Icon */}
        <span className="bg-indigo-600 rounded-xl p-2 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1"/><rect x="6" y="6" width="12" height="6" rx="2" fill="#a5b4fc"/></svg>
        </span>
        <div className="flex flex-col">
          {/* System Name */}
          <span className="text-lg font-bold text-gray-900 leading-tight">Maintenance Management System</span>
          {/* User Info (if provided) */}
          {user && (
            <span className="text-xs text-gray-500 font-medium">
              {user.name} <span className="mx-1">|</span> <span className="uppercase tracking-wide text-indigo-600">{roleMap[user.role?.toLowerCase?.()] || user.role || "User"}</span>
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0 mt-2 md:mt-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">{title}</h2>
          {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
        </div>
        {right && <div className="mt-2 md:mt-0">{right}</div>}
      </div>
    </header>
  );
}
