import React, { useState, useEffect, useRef, useCallback } from "react";
import backgroundVideo from "../assets/136906-765457769_small.mp4";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { WorkOrderForm } from './WorkOrder';
import SubscriptionWidget from './SubscriptionWidget';
import SubscriptionManagement from './SubscriptionManagement';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage, useTranslation } from "../i18n/LanguageContext";
import { Clock, Calendar, CheckCircle, X, Bell, Download, Package, ShoppingCart, Gauge, Plus, Search, Eye, MapPin, AlertCircle, Repeat, Edit, ChevronLeft, ChevronDown, MoreHorizontal } from 'lucide-react';

// â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Icon = {
  Dashboard: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Requests: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" />
    </svg>
  ),
  Properties: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Assets: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    </svg>
  ),
  Staff: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Templates: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Subscription: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Alert: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Export: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  Package: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  ShoppingCart: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  Vendors: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Analytics: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Gauge: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 0110 10" /><path d="M12 2a10 10 0 00-10 10" /><path d="M12 12l3.5-3.5" /><circle cx="12" cy="12" r="1" />
    </svg>
  ),
  Edge: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const statusProgressMap = ['SUBMITTED', 'APPROVED', 'IN PROGRESS', 'COMPLETE'];
const statusProgressPercent = (status = '') => {
  const normalized = status.toUpperCase().replace(/_/g, ' ');
  const idx = statusProgressMap.findIndex(s => normalized.includes(s));
  if (idx === -1) return 0;
  return Math.round(((idx + 1) / statusProgressMap.length) * 100);
};

const ProgressBar = ({ status }) => {
  const pct = statusProgressPercent(status);
  return (
    <div className="w-full">
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] font-semibold text-gray-500 mt-1">
        <span>{status || 'Pending'}</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
};


// â”€â”€ Helper Functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const extractId = (obj) => {
  if (!obj) return null;
  if (typeof obj === 'string') return obj;
  return obj._id || obj.id || null;
};

const parseIdList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v)).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map(v => v.trim()).filter(Boolean);
  }
  return [];
};

const formatScheduleFrequency = (schedule) => {
  if (!schedule || !schedule.routine) return 'One-time';
  const freq = String(schedule.frequency || 'daily').toLowerCase();
  const interval = Number(schedule.interval) || 1;
  const freqMap = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' };
  const unit = freqMap[freq] || freq.replace(/ly$/, '') || 'day';
  return `Every ${interval} ${unit}${interval > 1 ? 's' : ''}`;
};

// â”€â”€ Status badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatusBadge({ status }) {
  const s = (status || '').toUpperCase().replace(/_/g, ' ');
  const map = {
    'PENDING': 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    'IN PROGRESS': 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    'COMPLETE': 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    'COMPLETED': 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    'APPROVED': 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    'OVERDUE': 'bg-rose-500/20 text-rose-200 border-rose-500/30',
    'REJECTED': 'bg-rose-500/20 text-rose-200 border-rose-500/30',
  };
  const colorClass = map[s] || 'bg-gray-500/20 text-gray-200 border-gray-500/30';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s}
    </span>
  );
}

const normalizeDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Deduplicate arrays by stable id (helps avoid React key collisions when APIs return duplicates)
const dedupeById = (arr = [], getId = (item) => item?._id || item?.id) => {
  const seen = new Set();
  return arr.filter(item => {
    const id = getId(item);
    if (!id) return true;
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Safely render possibly object/array values (prevents "object as React child" errors)
const renderValue = (val, fallback = '—') => {
  if (val === null || val === undefined || val === '') return fallback;
  if (Array.isArray(val)) return val.filter(Boolean).join(', ') || fallback;
  if (typeof val === 'object') return Object.values(val).filter(Boolean).join(', ') || fallback;
  return val;
};

const requestStatusColor = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'APPROVED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s === 'IN PROGRESS' || s === 'IN_PROGRESS' || s === 'INPROGRESS') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (s === 'DECLINED' || s === 'REJECTED') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (s === 'SUBMITTED' || s === 'PENDING') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-600 border-gray-200';
};

const PriorityBadge = ({ priority }) => {
  const p = String(priority || 'MEDIUM').toUpperCase();
  const classes = p === 'URGENT'
    ? 'bg-rose-100 text-rose-700 border-rose-200'
    : p === 'HIGH'
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : p === 'MEDIUM'
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-blue-100 text-blue-700 border-blue-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${classes}`}>
      {p}
    </span>
  );
};

// â”€â”€ Stat card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatCard({ label, value, sub, accent, icon, onClick }) {
  const accents = {
    blue: 'from-blue-500/20 to-indigo-500/10 border-blue-500/20 text-blue-100',
    green: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-100',
    red: 'from-rose-500/20 to-pink-500/10 border-rose-500/20 text-rose-100',
    indigo: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/20 text-indigo-100',
    amber: 'from-amber-500/20 to-yellow-500/10 border-amber-500/20 text-amber-100',
  };
  const c = accents[accent] || accents.blue;
  return (
    <div
      onClick={onClick}
      className={`glass-surface-strong rounded-2xl p-6 flex items-start gap-4 border-l-4 overflow-hidden relative group transition-all hover:scale-[1.02] ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-white/30' : ''}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c} opacity-50`} />
      <div className="relative z-10 w-12 h-12 rounded-xl glass-mirror flex items-center justify-center text-white shadow-lg">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-black text-white tracking-tight">{value}</div>
        <div className="text-sm font-bold text-white/70 uppercase tracking-wider mt-1">{label}</div>
        {sub && <div className="text-xs text-white/50 mt-1 font-medium">{sub}</div>}
      </div>
    </div>
  );
}

// â”€â”€ Section header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SectionHeader({ title, count, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
        {count !== undefined && (
          <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{count}</span>
        )}
      </div>
      {action}
    </div>
  );
}

// â”€â”€ Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Table({ heads, rows, empty = 'No data found.' }) {
  return (
    <div className="glass-surface border border-white/10 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
      {rows.length === 0 ? (
        <div className="text-center py-16 px-6 text-white/40 text-sm font-medium">{empty}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                {heads.map((h, i) => (
                  <th key={i} className="py-4 px-6 text-left text-[10px] font-bold text-white/50 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, i) => {
                if (!row) return null;
                if (React.isValidElement(row)) return row;
                const rowData = Array.isArray(row) ? { cells: row } : row;
                const cells = Array.isArray(rowData) ? rowData : rowData.cells;
                if (!cells) return null;
                const isClickable = typeof rowData.onClick === 'function';
                const rowClass = rowData.className || '';
                return (
                  <tr
                    key={rowData.key || i}
                    onClick={rowData.onClick}
                    className={`hover:bg-white/10 transition-colors duration-200 ${isClickable ? 'cursor-pointer' : ''} ${rowClass}`}
                  >
                    {cells}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const Td = ({ children, mono }) => (
  <td className={`py-4 px-6 text-sm text-white/80 ${mono ? 'font-mono' : ''}`}>{children ?? 'â€”'}</td>
);

// â”€â”€ Input / Select â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Input = ({ className = '', ...props }) => (
  <input
    className={`glass-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 border-white/10 w-full transition-all outline-none ${className}`}
    {...props}
  />
);

const Select = ({ className = '', children, ...props }) => (
  <select
    className={`glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-white/20 border-white/10 w-full transition-all outline-none appearance-none ${className}`}
    {...props}
  >
    {children}
  </select>
);

// â”€â”€ Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', className = '' }) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-500/20',
    ghost: 'glass-ghost text-white hover:bg-white/10',
    outline: 'bg-transparent border border-white/20 text-white hover:bg-white/5',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20',
    teal: 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/20',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-5 py-2.5 text-sm font-bold',
    lg: 'px-8 py-3 text-base font-black uppercase tracking-wider',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

const INVITE_ROLE_OPTIONS = [
  {
    value: 'administrator',
    label: 'Administrator',
    paidSeat: true,
    description: 'Administrator has full access; including editing, adding, deleting work orders and requests.'
  },
  {
    value: 'limited_administrator',
    label: 'Limited Administrator',
    paidSeat: true,
    description: 'Limited administrators have the same access as administrators except they cannot view/edit settings or add/edit people and teams (Beta).'
  },
  {
    value: 'limited_technician',
    label: 'Limited Technician',
    paidSeat: true,
    description: 'Limited technicians can only see work orders assigned to them.'
  },
  {
    value: 'technician',
    label: 'Technician',
    paidSeat: true,
    description: 'Technicians can create and close work orders, update statuses, and manage assigned tasks.'
  },
];

const getInviteRole = (value) => INVITE_ROLE_OPTIONS.find((r) => r.value === value) || INVITE_ROLE_OPTIONS[0];

function InviteUsersModal({ open, onClose, onInvite, unusedSeats = '—', busy = false }) {
  const [rows, setRows] = React.useState([{ email: '', role: 'administrator' }]);
  const [rolePickerForRow, setRolePickerForRow] = React.useState(null);

  React.useEffect(() => {
    if (!open) return;
    setRows([{ email: '', role: 'administrator' }]);
    setRolePickerForRow(null);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const setRow = (idx, patch) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const removeRow = (idx) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
    setRolePickerForRow((prev) => (prev === idx ? null : prev));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { email: '', role: 'administrator' }]);
  };

  const cleanEmail = (email) => String(email || '').trim().toLowerCase();
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail(email));

  const cleanedRows = rows
    .map((r) => ({ email: cleanEmail(r.email), role: r.role || 'administrator' }))
    .filter((r) => r.email);
  const hasValid = cleanedRows.some((r) => isValidEmail(r.email));

  const submit = async () => {
    const unique = [];
    const seen = new Set();
    for (const row of cleanedRows) {
      if (!isValidEmail(row.email)) continue;
      const key = `${row.email}::${row.role}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(row);
    }
    if (unique.length === 0) return;
    await onInvite?.(unique);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">Invite Users</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close invite users"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 text-sm">
          <div className="text-gray-600">Unused paid seats: <span className="font-semibold text-gray-900">{unusedSeats}</span></div>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Learn more about seats, inviting, and roles
          </a>
        </div>

        <div className="p-6">
          {rows.map((row, idx) => {
            const role = getInviteRole(row.role);
            const showPicker = rolePickerForRow === idx;
            return (
              <div key={`invite-row-${idx}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-5">
                <div className="md:col-span-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    value={row.email}
                    onChange={(e) => setRow(idx, { email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                  />
                </div>

                <div className="md:col-span-5 relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                  <button
                    type="button"
                    onClick={() => setRolePickerForRow((prev) => (prev === idx ? null : idx))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm flex items-center justify-between gap-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-gray-900 truncate">{role.label}</span>
                      {role.paidSeat && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 font-black text-sm">
                          $
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
                  </button>

                  {showPicker && (
                    <div className="absolute z-[90] mt-2 right-0 w-full md:w-[520px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                      <div className="max-h-72 overflow-y-auto p-2">
                        {INVITE_ROLE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setRow(idx, { role: opt.value });
                              setRolePickerForRow(null);
                            }}
                            className={`w-full text-left rounded-lg p-3 hover:bg-gray-50 transition ${opt.value === row.role ? 'bg-blue-50 border border-blue-100' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="text-base font-semibold text-gray-900">{opt.label}</div>
                                  {opt.paidSeat && (
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 font-black text-sm flex-shrink-0">
                                      $
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 leading-relaxed">{opt.description}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    aria-label="Remove user row"
                    title="Remove"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 text-gray-800 hover:text-gray-900 font-semibold"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 text-gray-600">+</span>
            Add User
          </button>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!hasValid || busy}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Inviting…' : 'Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateTeamModal({ open, onClose, people = [], onCreate, busy = false }) {
  const [name, setName] = React.useState('');
  const [members, setMembers] = React.useState([]);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setName('');
    setMembers([]);
    setSearch('');
  }, [open]);

  if (!open) return null;

  const filteredPeople = (people || []).filter((p) => {
    const q = String(search || '').toLowerCase().trim();
    if (!q) return true;
    const email = String(p.email || '').toLowerCase();
    const personName = String(p.name || '').toLowerCase();
    const role = String(p.role || '').toLowerCase();
    return email.includes(q) || personName.includes(q) || role.includes(q);
  });

  const toggleMember = (id) => {
    setMembers((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const submit = async () => {
    const trimmed = String(name || '').trim();
    if (!trimmed) return;
    await onCreate?.({ name: trimmed, members });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Create Team</h3>
            <p className="text-sm text-gray-600 mt-1">Group people into a team for easier assignment.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Close create team">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Team Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Plumbing, Electrical, Civil"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <label className="block text-sm font-semibold text-gray-700">Members</label>
              <div className="text-xs text-gray-500 font-semibold">{members.length} selected</div>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
            />
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1 bg-gray-50">
              {filteredPeople.length === 0 ? (
                <div className="text-sm text-gray-500 py-6 text-center">No people found.</div>
              ) : (
                filteredPeople.map((p) => {
                  const id = p.id || p._id;
                  const checked = members.includes(id);
                  return (
                    <label key={id} className="flex items-start gap-3 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={() => toggleMember(id)} className="mt-1" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{p.name || p.email || id}</div>
                        <div className="text-xs text-gray-500 truncate">{[p.email, p.role].filter(Boolean).join(' • ')}</div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!String(name || '').trim() || busy}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Creating…' : 'Create Team'}
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Sidebar nav item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NavItem({ label, icon, active, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${active
          ? 'bg-white/20 text-white shadow-lg shadow-black/5'
          : 'text-white/60 hover:text-white hover:bg-white/10'
        } ${danger ? 'hover:bg-rose-500/20 hover:text-rose-200' : ''}`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-glow-white" />
      )}
      <span className={`transition-transform duration-200 group-hover:scale-110 ${active ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
        {icon}
      </span>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
  );
}

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ClientDashboard() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const backendBase = (import.meta.env.VITE_API_URL || '') + '';

  const imageSrc = useCallback((path) => {
    if (!path || path === 'null' || path === 'undefined') return null;
    try {
      if (String(path).startsWith('http') || String(path).startsWith('//')) return path;
      if (String(path).startsWith('/')) return `${backendBase}${path}`;
      return path;
    } catch {
      return path;
    }
  }, [backendBase]);

  // â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyUseNamedBlocks, setPropertyUseNamedBlocks] = useState(false);
  const [assets, setAssets] = useState([]);
  const [internalTechnicians, setInternalTechnicians] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [people, setPeople] = useState([]);
  const [teams, setTeams] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyForm, setPropertyForm] = useState({ 
    name: '', type: '', address: '', beds: '', baths: '', area: '', floors: '', blocks: '', rooms: '', namedBlocks: [], roomNames: [],
    latitude: '', longitude: '', includeMapCoordinates: false,
    parentPropertyId: '', assignedWorkers: [], assignedTeam: '',
    vendors: [], customers: [],
    customData: [] // Array of { name, value, unit }
  });
  const [propertyFiles, setPropertyFiles] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetForm, setAssetForm] = useState({ name: '', type: '', description: '', propertyId: '', quantity: 1, building: '', blocks: [], room: '' });
  const [originalAssetBlocks, setOriginalAssetBlocks] = useState([]);
  const [editingTech, setEditingTech] = useState(null);
  const [techForm, setTechForm] = useState({ name: '', email: '', phone: '', password: '', specialty: [], rating: 0, completed: 0, propertyId: '' });
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleDetailTab, setScheduleDetailTab] = useState('assets');
  const [reminders, setReminders] = useState([]);
  const [issues, setIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [selectedTechs, setSelectedTechs] = useState({});
  const [assignLoading, setAssignLoading] = useState({});
  const [statusCounts, setStatusCounts] = useState({ Pending: 0, 'In Progress': 0, Completed: 0, Overdue: 0 });
  const [maintenanceCounts, setMaintenanceCounts] = useState({ Preventive: 0, Routine: 0, Pending: 0, 'In Progress': 0, Completed: 0, Overdue: 0 });
  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTechForAssign, setSelectedTechForAssign] = useState(null);
  const [selectedIssueForAssign, setSelectedIssueForAssign] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState('');
  const [issueAssignModalOpen, setIssueAssignModalOpen] = useState(false);
  const [selectedIssueToAssign, setSelectedIssueToAssign] = useState(null);
  const [selectedInternalTechForIssue, setSelectedInternalTechForIssue] = useState('');
  const [assignableIssues, setAssignableIssues] = useState([]);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [loading, setLoading] = useState({ properties: false, assets: false, internalTechnicians: false, people: false, teams: false });
  const [materialRequests, setMaterialRequests] = useState([]);
  const [errors, setErrors] = useState({ properties: null, assets: null, internalTechnicians: null, people: null, teams: null });
  const [showReminderPanel, setShowReminderPanel] = useState(true);
  const propertiesRef = useRef([]);
  const assetsRef = useRef([]);
  const importFileRef = useRef(null);
  const importAssetsRef = useRef(null);
  const inviteEmailRef = useRef(null);
  const inviteRoleRef = useRef(null);
  const inviteLocationRef = useRef(null);
  const [inviteUsersOpen, setInviteUsersOpen] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [inviteUsersBusy, setInviteUsersBusy] = useState(false);
  const [createTeamBusy, setCreateTeamBusy] = useState(false);
  const [modalData, setModalData] = useState({ open: false, type: '', item: null });

  const allWorkers = React.useMemo(() => {
    const onlyUsers = (people || []).filter(p => p.kind !== 'invite');
    return dedupeById(
      [...internalTechnicians, ...technicians, ...onlyUsers],
      person => person?._id || person?.id || person?.userId || person?.email || person?.phone
    );
  }, [internalTechnicians, technicians, people]);

  // New Detail Modal Implementation (manager parity)
  const DetailsModal = useCallback(function DetailsModal({ open, type, item, onClose, getAssignedTechName, onRefresh, technicians = [], teams = [], workOrders = [] }) {
    const normalizeTaskArray = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          return [{ text: trimmed, completed: false }];
        }
        return [];
      }
      if (typeof value === 'object') {
        if (Array.isArray(value.items)) return value.items;
        if (Array.isArray(value.tasks)) return value.tasks;
      }
      return [];
    };
    const [formData, setFormData] = useState({
      category: item?.category || '',
      priority: item?.priority || 'MEDIUM',
      status: item?.status || '',
      location: item?.location || item?.address || '',
      assetName: item?.assetName || '',
      assignedTo: item?.assignedTo || '',
      team: item?.team || '',
      estimatedTime: item?.estimatedTime || '',
      frequency: item?.frequency || item?.interval || '',
      fixDeadline: item?.fixDeadline ? new Date(item.fixDeadline).toISOString().split('T')[0] : '',
      checklist: normalizeTaskArray(item?.checklist || item?.tasks || item?.taskList),
      chat: Array.isArray(item?.chat) ? item.chat : []
    });
    const [activeTab, setActiveTab] = useState('overview');
    const [chatInput, setChatInput] = useState('');
    const [localFiles, setLocalFiles] = useState([]);
    const [localLinks, setLocalLinks] = useState([]);
    const [newLink, setNewLink] = useState({ title: '', url: '' });
    const [linkRelation, setLinkRelation] = useState('relates to');
    const [linkedWorkOrders, setLinkedWorkOrders] = useState('');
    const [providerEnabled, setProviderEnabled] = useState(false);
    const [providerPortalUrl, setProviderPortalUrl] = useState('');
    const [localActivity, setLocalActivity] = useState([]);
    const [addCostOpen, setAddCostOpen] = useState(false);
    const [costForm, setCostForm] = useState({ description: '', category: '', cost: '', assignedTo: '', date: '' });
    const [localCosts, setLocalCosts] = useState([]);
    const [addPartOpen, setAddPartOpen] = useState(false);
    const [partForm, setPartForm] = useState({ name: '', status: '', cost: '', quantity: 1, location: '' });
    const [inventoryParts, setInventoryParts] = useState([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [inventorySearch, setInventorySearch] = useState('');
    const [selectedInventoryParts, setSelectedInventoryParts] = useState({});
    const [localParts, setLocalParts] = useState([]);
    const [addLaborOpen, setAddLaborOpen] = useState(false);
    const [laborForm, setLaborForm] = useState({ worker: '', rate: 0, startedAt: '', hours: 0, minutes: 0, category: '' });
    const [localLabor, setLocalLabor] = useState([]);
    const fileInputRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || user.username || 'Manager';
    const userRole = String(user.role || user.userRole || user.type || user.accountType || '').toLowerCase();
    const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';

    const itemId = item?.id || item?._id;

    useEffect(() => {
      if (item) {
        setFormData({
          category: item.category || '',
          priority: item.priority || 'MEDIUM',
          status: item.status || '',
          location: item.location || item.address || '',
          assetName: item.assetName || '',
          assignedTo: item.assignedTo || '',
          team: item.team || '',
          estimatedTime: item.estimatedTime || '',
          frequency: item.frequency || item.interval || '',
          fixDeadline: item.fixDeadline ? new Date(item.fixDeadline).toISOString().split('T')[0] : '',
          checklist: normalizeTaskArray(item.checklist || item.tasks || item.taskList),
          chat: Array.isArray(item.chat) ? item.chat : []
        });
      }
    }, [item]);

    useEffect(() => {
      if (open && itemId) {
        setActiveTab('overview');
      }
    }, [open, itemId]);

    useEffect(() => {
      if (!itemId) return;
      setLocalFiles([]);
      setLocalLinks([]);
      setNewLink({ title: '', url: '' });
      setLinkedWorkOrders('');
      setLocalActivity([]);
      setLocalCosts([]);
      setAddCostOpen(false);
      setCostForm({ description: '', category: '', cost: '', assignedTo: '', date: '' });
      setLocalParts([]);
      setAddPartOpen(false);
      setPartForm({ name: '', status: '', cost: '', quantity: 1, location: '' });
      setLocalLabor([]);
      setAddLaborOpen(false);
      setLaborForm({ worker: '', rate: 0, startedAt: '', hours: 0, minutes: 0, category: '' });
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const fallbackUrl = item?.providerPortalUrl || (itemId ? `${origin}/provider-portal/${itemId}` : '');
      setProviderPortalUrl(fallbackUrl);
      setProviderEnabled(Boolean(item?.providerPortalEnabled));
    }, [itemId]);

    useEffect(() => {
      let isActive = true;
      const loadLinks = async () => {
        if (!itemId) return;
        try {
          const res = await api.get(`/api/issues/${itemId}/links`);
          const links = Array.isArray(res?.data) ? res.data : [];
          if (!isActive) return;
          const normalized = links.map((link, idx) => ({
            id: link.id || `link-${idx}`,
            ...link,
            source: link.source || 'remote'
          }));
          setLocalLinks(normalized);
        } catch (err) {
          console.warn('Failed to load links', err);
        }
      };
      loadLinks();
      return () => { isActive = false; };
    }, [itemId]);

    useEffect(() => {
      let isActive = true;
      const loadFiles = async () => {
        if (!itemId) return;
        try {
          const res = await api.get(`/api/issues/${itemId}/files`);
          const files = Array.isArray(res?.data) ? res.data : [];
          if (!isActive) return;
          const normalized = files.map((file, idx) => ({
            id: file.id || `file-${idx}`,
            ...file,
            url: file.url ? getImageUrl(file.url) : file.url,
            source: file.source || 'remote'
          }));
          setLocalFiles(normalized);
        } catch (err) {
          console.warn('Failed to load files', err);
        }
      };
      loadFiles();
      return () => { isActive = false; };
    }, [itemId]);

    useEffect(() => {
      let isActive = true;
      const loadActivity = async () => {
        if (!itemId) return;
        try {
          const res = await api.get(`/api/issues/${itemId}/activity`);
          const activity = Array.isArray(res?.data) ? res.data : [];
          if (!isActive) return;
          const normalized = activity.map((act, idx) => ({
            id: act.id || `activity-${idx}`,
            ...act,
            source: act.source || 'remote'
          }));
          setLocalActivity(normalized);
        } catch (err) {
          console.warn('Failed to load activity', err);
        }
      };
      loadActivity();
      return () => { isActive = false; };
    }, [itemId]);

    useEffect(() => {
      let isActive = true;
      const loadCosts = async () => {
        if (!itemId) return;
        try {
          const res = await api.get(`/api/issues/${itemId}/costs`);
          const costs = Array.isArray(res?.data) ? res.data : [];
          if (!isActive) return;
          const normalized = costs.map((entry, idx) => ({
            id: entry.id || `cost-${idx}`,
            ...entry
          }));
          setLocalCosts(normalized);
        } catch (err) {
          console.warn('Failed to load costs', err);
        }
      };
      loadCosts();
      return () => { isActive = false; };
    }, [itemId]);

    useEffect(() => {
      let isActive = true;
      const loadParts = async () => {
        if (!itemId) return;
        try {
          const res = await api.get(`/api/issues/${itemId}/parts`);
          const parts = Array.isArray(res?.data) ? res.data : [];
          if (!isActive) return;
          const normalized = parts.map((entry, idx) => ({
            id: entry.id || `part-${idx}`,
            ...entry
          }));
          setLocalParts(normalized);
        } catch (err) {
          console.warn('Failed to load parts', err);
        }
      };
      loadParts();
      return () => { isActive = false; };
    }, [itemId]);

    useEffect(() => {
      let isActive = true;
      const loadLabor = async () => {
        if (!itemId) return;
        try {
          const res = await api.get(`/api/issues/${itemId}/labor`);
          const labor = Array.isArray(res?.data) ? res.data : [];
          if (!isActive) return;
          const normalized = labor.map((entry, idx) => ({
            id: entry.id || `labor-${idx}`,
            ...entry,
            name: entry.name || entry.technician || `Tech ${idx + 1}`,
            source: entry.source || 'remote'
          }));
          setLocalLabor(normalized);
        } catch (err) {
          console.warn('Failed to load labor entries', err);
        }
      };
      loadLabor();
      return () => { isActive = false; };
    }, [itemId]);

    useEffect(() => {
      let isActive = true;
      const loadLabor = async () => {
        if (!itemId) return;
        try {
          const res = await api.get(`/api/issues/${itemId}/labor`);
          const labor = Array.isArray(res?.data) ? res.data : [];
          if (!isActive) return;
          const normalized = labor.map((entry, idx) => ({
            id: entry.id || `labor-${idx}`,
            ...entry
          }));
          setLocalLabor(normalized);
        } catch (err) {
          console.warn('Failed to load labor', err);
        }
      };
      loadLabor();
      return () => { isActive = false; };
    }, [itemId]);

    useEffect(() => {
      let isActive = true;
      const loadProvider = async () => {
        if (!itemId) return;
        try {
          const res = await api.get(`/api/issues/${itemId}/provider-portal`);
          const data = res?.data || {};
          if (!isActive) return;
          if (typeof data.providerPortalEnabled !== 'undefined') {
            setProviderEnabled(Boolean(data.providerPortalEnabled));
          }
          if (data.providerPortalUrl) {
            setProviderPortalUrl(data.providerPortalUrl);
          }
        } catch (err) {
          console.warn('Failed to load provider portal', err);
        }
      };
      loadProvider();
      return () => { isActive = false; };
    }, [itemId]);

    const logActivity = useCallback(async (action, detail) => {
      const entry = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        action,
        detail,
        user: userName,
        role: userRole,
        timestamp: new Date().toISOString(),
        source: 'local'
      };
      setLocalActivity(prev => [entry, ...prev]);
      if (!itemId) return;
      try {
        const res = await api.post(`/api/issues/${itemId}/activity`, {
          action,
          detail,
          user: entry.user,
          role: entry.role,
          timestamp: entry.timestamp
        });
        const saved = res?.data;
        if (saved && saved.id) {
          const normalized = { ...saved, source: saved.source || 'remote' };
          setLocalActivity(prev => [normalized, ...prev.filter(e => e.id !== entry.id)]);
        }
      } catch (err) {
        console.warn('Failed to save activity', err);
      }
    }, [itemId, userName, userRole]);

    const isMaterial = type === 'material';
    const isRequest = type === 'request';
    const isIssue = type === 'issue';

    const title = isMaterial ? 'Material Request Details' : isRequest ? 'Request Details' : 'Work Order Details';
    const location = formData.location || item?.locationName || item?.propertyName || item?.assetLocation || 'Not specified';
    const dueDate = item?.fixDeadline || item?.dueDate || item?.nextDate || item?.scheduledFor || null;
    const createdAt = item?.createdAt || item?.date || item?.nextDate || null;
    const status = item?.status || (item?.approved ? 'IN PROGRESS' : 'PENDING') || 'â€”';
    const description = item?.description || item?.details || 'No description provided.';
    const assignee = isIssue ? (typeof getAssignedTechName === 'function' ? getAssignedTechName(item) : item?.assignedTo) : (item?.technicianName || item?.assignedTo || 'Unassigned');
    const workOrderRef = item?.workOrderId || item?.workOrder || item?.workOrderNumber || item?.workOrderNo || item?.workOrderCode || item?.workOrderRef || '';
    const frequencyValue = formData.frequency || item?.frequency || item?.interval || '';
    const normalizedStatus = String(status || '').toLowerCase();
    const isInProgress = normalizedStatus.includes('in progress') || normalizedStatus === 'in_progress' || normalizedStatus === 'inprogress' || normalizedStatus === 'started' || normalizedStatus === 'working';
    const isCompleted = normalizedStatus.includes('complete') || normalizedStatus === 'completed' || normalizedStatus === 'complete';
    const isApproved = isRequest && (item?.approved || normalizedStatus === 'approved' || !!workOrderRef);
    const isPendingOrSubmitted = normalizedStatus === 'pending' || normalizedStatus === 'submitted';
    const canEdit = !isRequest || (isManagerOrAdmin && !isInProgress && !isCompleted) || (isRequest && isPendingOrSubmitted);
    const isRequestReadOnly = !canEdit;
    const requestLockClass = isRequestReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : '';
    const requestFieldClass = `w-full border border-gray-300 rounded-lg p-2.5 text-sm ${requestLockClass}`;
    const showTabs = isIssue;
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'tasks', label: 'Tasks' },
      { id: 'labor', label: 'Labor' },
      { id: 'parts', label: 'Parts' },
      { id: 'costs', label: 'Costs' },
      { id: 'files', label: 'Files' },
      { id: 'activity', label: 'Activity' },
      { id: 'links', label: 'Links' },
      { id: 'provider', label: 'Provider Portal' }
    ];
    const activeTabId = showTabs ? activeTab : 'overview';
    const tasksSource = (Array.isArray(item?.tasks) && item.tasks.length)
      ? item.tasks
      : (Array.isArray(item?.taskList) && item.taskList.length)
        ? item.taskList
        : (item?.checklist || formData.checklist);
    const tasks = normalizeTaskArray(tasksSource);
    const hasStructuredTasks = (Array.isArray(item?.tasks) && item.tasks.length > 0)
      || (Array.isArray(item?.taskList) && item.taskList.length > 0)
      || tasks.length > 0;
    const laborEntries = Array.isArray(item?.labor) ? item.labor : Array.isArray(item?.laborEntries) ? item.laborEntries : [];
    const partsItems = Array.isArray(item?.parts) ? item.parts : Array.isArray(item?.materials) ? item.materials : Array.isArray(item?.items) ? item.items : [];
    const fileItems = Array.isArray(item?.files) ? item.files : Array.isArray(item?.attachments) ? item.attachments : [];
    const activityItems = Array.isArray(item?.activity) ? item.activity : Array.isArray(item?.history) ? item.history : Array.isArray(item?.logs) ? item.logs : [];
    const linkItems = Array.isArray(item?.links) ? item.links : Array.isArray(item?.urlLinks) ? item.urlLinks : [];
    const provider = item?.provider || item?.vendor || item?.contractor || {};
    const normalizedFileItems = fileItems.map((f, idx) => {
      const name = typeof f === 'string' ? f : (f.name || f.title || f.filename || `File ${idx + 1}`);
      const rawUrl = typeof f === 'string' ? f : (f.url || f.link || f.path || '');
      return {
        id: `remote-file-${idx}`,
        name,
        url: rawUrl ? getImageUrl(rawUrl) : '',
        source: 'remote'
      };
    });
    const normalizedLinkItems = linkItems.map((link, idx) => {
      const title = typeof link === 'string' ? link : (link.title || link.label || link.name || `Link ${idx + 1}`);
      const url = typeof link === 'string' ? link : (link.url || link.href || link.link || '');
      return {
        id: `remote-link-${idx}`,
        title,
        url,
        type: 'url',
        source: 'remote'
      };
    });
    const normalizedActivityItems = activityItems.map((act, idx) => {
      const actionLabel = typeof act === 'string' ? act : (act.title || act.type || act.action || 'Update');
      const actDetail = typeof act === 'string' ? '' : (act.description || act.note || act.details || '');
      const actTimestamp = typeof act === 'string' ? '' : (act.timestamp || act.date || act.createdAt || '');
      const actUser = typeof act === 'string' ? '' : (act.user || act.actor || act.by || (typeof act.createdBy === 'object' ? act.createdBy?.name : act.createdBy) || '');
      return {
        id: `remote-activity-${idx}`,
        action: actionLabel,
        detail: actDetail,
        timestamp: actTimestamp,
        user: actUser,
        source: 'remote'
      };
    });
    const toMillis = (value) => {
      const t = Date.parse(value);
      return Number.isNaN(t) ? 0 : t;
    };
    const combinedFileItems = [...localFiles, ...normalizedFileItems];
    const combinedLinkItems = [...localLinks, ...normalizedLinkItems];
    const combinedActivityItems = [...localActivity, ...normalizedActivityItems]
      .sort((a, b) => toMillis(b.timestamp) - toMillis(a.timestamp));
    const coreImageItems = [
      item?.beforePhoto && { label: 'Before Photo', url: item.beforePhoto },
      item?.afterPhoto && { label: 'After Photo', url: item.afterPhoto },
      item?.beforeImage && { label: 'Before Image', url: item.beforeImage },
      item?.afterImage && { label: 'After Image', url: item.afterImage },
      item?.photo && { label: 'Photo', url: item.photo },
      item?.image && { label: 'Image', url: item.image }
    ].filter(Boolean);
    const availableWorkOrders = Array.isArray(workOrders)
      ? workOrders.filter(wo => String(wo._id || wo.id) !== String(itemId))
      : [];
    const localCostsTotal = localCosts.reduce((sum, entry) => sum + (Number(entry.cost) || 0), 0);
    const normalizedParts = partsItems.map((part, idx) => {
      const name = typeof part === 'string' ? part : (part.name || part.title || part.materialId || `Part ${idx + 1}`);
      const status = typeof part === 'string' ? '' : (part.status || part.stockStatus || part.inventoryStatus || '');
      const cost = typeof part === 'string' ? '' : (part.unitCost ?? part.cost ?? part.price ?? '');
      const quantity = typeof part === 'string' ? 1 : (part.quantity ?? part.qty ?? 1);
      const location = typeof part === 'string' ? '' : (part.location || part.room || part.area || part.site || '');
      return {
        id: part?._id || part?.id || `remote-part-${idx}`,
        name,
        status,
        cost,
        quantity,
        location,
        source: 'remote'
      };
    });
    const toNumber = (val) => {
      if (val === null || val === undefined || val === '') return 0;
      const num = Number(String(val).replace(/[^0-9.-]/g, ''));
      return Number.isFinite(num) ? num : 0;
    };
    const combinedParts = [...localParts, ...normalizedParts];
    const partsTotal = combinedParts.reduce((sum, entry) => sum + (toNumber(entry.cost) * toNumber(entry.quantity || 1)), 0);
    const estimatedHours = Number(formData.estimatedTime || item?.estimatedTime || item?.laborHours || 0) || 0;
    const normalizedLabor = laborEntries.map((entry, idx) => {
      const name = entry.name || entry.technician || entry.technicianName || entry.assignee || `Tech ${idx + 1}`;
      const rate = entry.rate ?? entry.hourlyRate ?? 0;
      const hours = entry.hours ?? entry.time ?? 0;
      const minutes = entry.minutes ?? 0;
      const seconds = entry.seconds ?? 0;
      const cost = entry.cost ?? (toNumber(rate) * (toNumber(hours) + toNumber(minutes) / 60 + toNumber(seconds) / 3600));
      return {
        id: entry._id || entry.id || `remote-labor-${idx}`,
        name,
        rate,
        hours,
        minutes,
        seconds,
        cost,
        startedAt: entry.startedAt || entry.date || entry.timestamp || '',
        category: entry.category || 'Maintenance',
        source: 'remote'
      };
    });
    const combinedLabor = [...localLabor, ...normalizedLabor];
    const laborTotal = combinedLabor.reduce((sum, entry) => sum + toNumber(entry.cost), 0);
    const moneyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const formatMoney = (val) => moneyFormatter.format(Number.isFinite(val) ? val : 0);
    const laborCost = laborTotal || toNumber(item?.laborCost ?? item?.laborTotal ?? item?.labor?.total ?? item?.labor?.cost);
    const partsCost = toNumber(item?.partsCost ?? item?.materialsCost ?? item?.totalPartsCost ?? item?.parts?.total ?? item?.itemsCost);
    const otherCost = toNumber(item?.otherCost ?? item?.miscCost ?? item?.additionalCost);
    const totalCost = toNumber(item?.totalCost ?? item?.cost ?? laborCost + partsCost + otherCost);
    const partsDisplayCost = combinedParts.length ? partsTotal : partsCost;
    const baseTotalCost = totalCost || (laborCost + partsDisplayCost + otherCost);
    const fullTotalCost = baseTotalCost + localCostsTotal;

    const formatDateTime = (val) => {
      if (!val) return 'Not set';
      try { return normalizeDate(val).toLocaleString(); } catch (e) { return 'Not set'; }
    };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t?.completed || t?.done || t?.checked).length;
    const laborSeconds = combinedLabor.reduce((sum, entry) => {
      if (typeof entry === 'number') return sum + entry * 3600;
      const hours = Number(entry?.hours || entry?.durationHours || entry?.timeHours || 0);
      const minutes = Number(entry?.minutes || entry?.durationMinutes || entry?.timeMinutes || 0);
      const seconds = Number(entry?.seconds || entry?.durationSeconds || entry?.timeSeconds || 0);
      if (!hours && !minutes && !seconds && entry?.duration) {
        const dur = Number(entry.duration);
        if (!Number.isNaN(dur)) return sum + dur * 3600;
      }
      return sum + (hours * 3600) + (minutes * 60) + seconds;
    }, 0);
    const formatTimer = (seconds) => {
      const s = Math.max(0, Number(seconds) || 0);
      const hrs = Math.floor(s / 3600).toString().padStart(2, '0');
      const mins = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
      const secs = Math.floor(s % 60).toString().padStart(2, '0');
      return `${hrs}:${mins}:${secs}`;
    };
    const timeDisplay = formatTimer(laborSeconds);
    const assetStatus = item?.assetStatus || item?.operationalStatus || 'Operational';
    const priorityValue = formData.priority || item?.priority || 'Medium';
    const closeoutNotes = item?.closeoutNotes || item?.closeoutNote || item?.closeout || 'N/A';
    const createdBy = item?.createdByName || item?.createdBy?.name || item?.requestorName || item?.requestedBy || item?.userName || item?.name || 'N/A';
    const updatedBy = item?.updatedByName || item?.updatedBy?.name || item?.lastUpdatedBy || createdBy || 'N/A';
    const pmTrigger = item?.pmTrigger || item?.preventiveMaintenanceName || item?.scheduleName || item?.pmName || 'N/A';
    const rawWorkOrderLabel = String(workOrderRef || item?.workOrderNumber || item?.workOrderNo || item?.workOrderId || item?.workOrder || item?.id || item?._id || '').trim();
    const workOrderTitle = rawWorkOrderLabel
      ? (rawWorkOrderLabel.toUpperCase().includes('WO') ? rawWorkOrderLabel : `WO #${rawWorkOrderLabel}`)
      : 'Work Order';

    if (!open || !item) return null;



    const handleFileImport = async (fileList) => {
      if (!fileList || fileList.length === 0) return;
      const filesArray = Array.from(fileList);
      if (!itemId) {
        const entries = filesArray.map((file) => ({
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'file',
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
          source: 'local'
        }));
        setLocalFiles(prev => [...entries, ...prev]);
        logActivity('Uploaded file', entries.map(e => e.name).join(', '));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      try {
        const formData = new FormData();
        filesArray.forEach((file) => formData.append('files', file));
        const res = await api.post(`/api/issues/${itemId}/files`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const saved = Array.isArray(res?.data) ? res.data : [];
        const entries = saved.map((file) => ({
          ...file,
          url: file.url ? getImageUrl(file.url) : file.url
        }));
        setLocalFiles(prev => [...entries, ...prev]);
        logActivity('Uploaded file', filesArray.map(f => f.name).join(', '));
      } catch (err) {
        console.error('Failed to upload files', err);
        const entries = filesArray.map((file) => ({
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'file',
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
          source: 'local'
        }));
        setLocalFiles(prev => [...entries, ...prev]);
        logActivity('Uploaded file', entries.map(e => e.name).join(', '));
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    const handleFileDrop = (event) => {
      event.preventDefault();
      handleFileImport(event.dataTransfer?.files);
    };

    const handleAddLink = async () => {
      if (!itemId) return;
      const url = String(newLink.url || '').trim();
      if (!url) return;
      const title = String(newLink.title || '').trim() || url;
      try {
        const res = await api.post(`/api/issues/${itemId}/links`, {
          title,
          url,
          type: 'url'
        });
        const saved = res?.data;
        const entry = saved || {
          id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title,
          url,
          type: 'url',
          addedAt: new Date().toISOString(),
          addedBy: userName,
          source: 'local'
        };
        setLocalLinks(prev => [entry, ...prev]);
        setNewLink({ title: '', url: '' });
        logActivity('Added link', title);
      } catch (err) {
        console.error('Failed to save link', err);
      }
    };

    const handleSelectLinkedWorkOrders = (event) => {
      setLinkedWorkOrders(event.target.value);
    };

    const handleLinkWorkOrders = async () => {
      if (!itemId || !linkedWorkOrders) return;
      const selection = Array.isArray(workOrders)
        ? workOrders.find(wo => String(wo._id || wo.id) === String(linkedWorkOrders))
        : null;
      if (!selection) return;
      const payload = {
        title: selection.title || selection.name || 'Work Order',
        url: '',
        type: 'workorder',
        relationship: linkRelation,
        workOrderId: selection._id || selection.id
      };
      try {
        const res = await api.post(`/api/issues/${itemId}/links`, payload);
        const saved = res?.data;
        const entry = saved || {
          id: `wo-link-${selection._id || selection.id}-${Date.now()}`,
          ...payload,
          source: 'local'
        };
        setLocalLinks(prev => [entry, ...prev]);
        setLinkedWorkOrders('');
        logActivity('Linked work order', `${linkRelation}: ${payload.title}`);
      } catch (err) {
        console.error('Failed to link work order', err);
      }
    };

    const handleCopyProviderLink = async () => {
      if (!providerPortalUrl) return;
      try {
        await navigator.clipboard.writeText(providerPortalUrl);
        logActivity('Copied provider link', providerPortalUrl);
      } catch (err) {
        try {
          const temp = document.createElement('textarea');
          temp.value = providerPortalUrl;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
          logActivity('Copied provider link', providerPortalUrl);
        } catch (fallbackErr) {
          console.error('Failed to copy provider link', fallbackErr);
        }
      }
    };

    const handleToggleProvider = async () => {
      const next = !providerEnabled;
      setProviderEnabled(next);
      logActivity(next ? 'Enabled provider portal' : 'Disabled provider portal', `Work Order ${workOrderTitle}`);
      if (!itemId) return;
      try {
        await api.put(`/api/issues/${itemId}/provider-portal`, {
          providerPortalEnabled: next,
          providerPortalUrl
        });
      } catch (err) {
        console.error('Failed to update provider portal', err);
      }
    };

    const handleOpenAddCost = () => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const localDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setCostForm({
        description: '',
        category: '',
        cost: '',
        assignedTo: '',
        date: localDate
      });
      setAddCostOpen(true);
    };

    const handleConfirmCost = async () => {
      if (!costForm.description || !costForm.category || !costForm.cost || !costForm.assignedTo || !costForm.date) return;
      const payload = {
        description: costForm.description.trim(),
        category: costForm.category,
        cost: Number(costForm.cost) || 0,
        assignedTo: costForm.assignedTo,
        date: costForm.date,
        createdBy: userName
      };
      try {
        if (itemId) {
          const res = await api.post(`/api/issues/${itemId}/costs`, payload);
          const saved = res?.data || { id: `cost-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...payload };
          setLocalCosts(prev => [saved, ...prev]);
        } else {
          const entry = { id: `cost-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...payload };
          setLocalCosts(prev => [entry, ...prev]);
        }
        setAddCostOpen(false);
        logActivity('Added cost', `${payload.category}: ${payload.description}`);
      } catch (err) {
        console.error('Failed to save cost', err);
      }
    };

    const getStockBadge = (status) => {
      const s = String(status || '').toLowerCase();
      if (s.includes('low')) return 'bg-orange-100 text-orange-700';
      if (s.includes('non')) return 'bg-gray-100 text-gray-700';
      if (s.includes('out')) return 'bg-rose-100 text-rose-700';
      return 'bg-emerald-100 text-emerald-700';
    };
    const getAvailableQty = (part) => Number(part?.available ?? part?.quantity ?? part?.onHand ?? 0);
    const getMaxQty = (part) => {
      const v = Number(part?.maxQty ?? part?.maximumQty ?? part?.capacity ?? part?.maxQuantity);
      return Number.isFinite(v) && v > 0 ? v : '—';
    };
    const getAreaLabel = (part) => part?.area || part?.section || part?.zone || part?.room || part?.bin || '';

    const fetchInventoryParts = useCallback(async () => {
      try {
        setInventoryLoading(true);
        const res = await api.get('/api/parts');
        setInventoryParts(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.warn('Failed to load inventory parts', err);
      } finally {
        setInventoryLoading(false);
      }
    }, []);

    const handleOpenAddPart = () => {
      setPartForm({ name: '', status: '', cost: '', quantity: 1, location: '' });
      setSelectedInventoryParts({});
      setAddPartOpen(true);
      fetchInventoryParts();
    };

    const handleConfirmPart = async () => {
      const selections = Object.values(selectedInventoryParts || {});
      if (selections.length === 0) return;
      try {
        for (const sel of selections) {
          const part = sel.part || {};
          const qty = Number(sel.quantity) || 1;
          const payload = {
            name: part.name || part.partNumber || 'Part',
            status: part.status || 'In stock',
            cost: Number(part.cost ?? part.unitCost ?? part.price ?? 0) || 0,
            quantity: qty,
            location: part.location || '',
            inventoryPartId: part._id || part.id || null
          };
          if (itemId) {
            const res = await api.post(`/api/issues/${itemId}/parts`, payload);
            const saved = res?.data || { id: `part-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...payload };
            setLocalParts(prev => [saved, ...prev]);
          } else {
            const entry = { id: `part-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...payload, source: 'local' };
            setLocalParts(prev => [entry, ...prev]);
          }

          const selId = part._id || part.id;
          if (selId) {
            setInventoryParts(prev => prev.map(p => {
              const pid = p._id || p.id;
              if (pid && pid === selId) {
                const current = Number(p.quantity ?? p.available ?? 0) || 0;
                const remaining = Math.max(0, current - qty);
                return { ...p, quantity: remaining, available: remaining };
              }
              return p;
            }));
          }
        }
        setAddPartOpen(false);
        logActivity('Added parts', `${selections.length} part(s) added`);
      } catch (err) {
        console.error('Failed to save part', err);
      }
    };

    const handleOpenAddLabor = () => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const localDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setLaborForm({
        worker: userName,
        rate: 0,
        startedAt: localDate,
        hours: 0,
        minutes: 0,
        category: 'Maintenance'
      });
      setAddLaborOpen(true);
    };

    const handleConfirmLabor = async () => {
      if (!laborForm.worker || !laborForm.startedAt || (laborForm.hours === 0 && laborForm.minutes === 0)) return;
      const hourlyRate = Number(laborForm.rate) || 0;
      const totalHours = Number(laborForm.hours) + (Number(laborForm.minutes) / 60);
      const cost = hourlyRate * totalHours;

      const payload = {
        technician: laborForm.worker,
        rate: hourlyRate,
        startedAt: laborForm.startedAt,
        hours: Number(laborForm.hours),
        minutes: Number(laborForm.minutes),
        cost,
        category: laborForm.category,
        createdBy: userName
      };

      try {
        if (itemId) {
          const res = await api.post(`/api/issues/${itemId}/labor`, payload);
          const saved = res?.data || { id: `labor-${Date.now()}`, ...payload };
          const normalized = {
            ...saved,
            name: saved.name || saved.technician || payload.technician
          };
          setLocalLabor(prev => [normalized, ...prev]);
        } else {
          const entry = { id: `labor-${Date.now()}`, ...payload, name: payload.technician, source: 'local' };
          setLocalLabor(prev => [entry, ...prev]);
        }
        setAddLaborOpen(false);
        logActivity('Added labor time', `${payload.technician}: ${payload.hours}h ${payload.minutes}m`);
      } catch (err) {
        console.error('Failed to save labor entry:', err);
      }
    };
 
    const handleSaveModal = async () => {
      if (isRequestReadOnly) {
        alert('This request is in progress and cannot be edited.');
        return;
      }
      try {
        await api.put(`/api/issues/${item.id || item._id}`, formData);
        alert('Changes saved successfully.');
        if (onRefresh) onRefresh();
        logActivity('Saved changes', workOrderTitle);
      } catch (err) {
        console.error('Failed to save issue:', err);
        alert('Failed to save changes.');
      }
    };

    const handleApproveModal = async () => {
      if (isRequestReadOnly) {
        alert('This request is in progress and cannot be edited.');
        return;
      }
      try {
        await api.put(`/api/issues/${item.id || item._id}`, { ...formData, status: 'IN PROGRESS', approved: true });
        alert('Request approved.');
        if (onRefresh) onRefresh();
        logActivity('Approved request', workOrderTitle);
        onClose();
      } catch (err) {
        console.error('Failed to approve issue:', err);
        alert('Failed to approve request.');
      }
    };

    const handleDeclineModal = async () => {
      if (isRequestReadOnly) {
        alert('This request is in progress and cannot be edited.');
        return;
      }
      const reason = prompt('Please enter a reason for declining:');
      if (reason === null) return;
      try {
        await api.put(`/api/issues/${item.id || item._id}`, {
          ...formData,
          status: 'DECLINED',
          rejected: true,
          rejectionReason: reason,
          rejectedAt: new Date()
        });
        alert('Request declined.');
        if (onRefresh) onRefresh();
        logActivity('Declined request', reason || workOrderTitle);
        onClose();
      } catch (err) {
        console.error('Failed to decline issue:', err);
        alert('Failed to decline request.');
      }
    };

    const handleSendMessage = async () => {
      const messageText = chatInput.trim();
      if (!messageText) return;
      const newMessage = {
        sender: userName,
        text: messageText,
        timestamp: new Date().toISOString(),
        role: 'manager'
      };
      const updatedChat = [...formData.chat, newMessage];
      try {
        await api.put(`/api/issues/${item.id || item._id}`, { chat: updatedChat });
        setFormData(prev => ({ ...prev, chat: updatedChat }));
        setChatInput('');
        logActivity('Sent message', messageText);
      } catch (err) {
        console.error('Failed to send message:', err);
        alert('Failed to send message.');
      }
    };

    const addChecklistItem = () => {
      setFormData(prev => ({ ...prev, checklist: [...prev.checklist, { text: '', completed: false }] }));
    };

    const updateChecklistItem = (index, field, value) => {
      const newList = [...formData.checklist];
      newList[index][field] = value;
      setFormData(prev => ({ ...prev, checklist: newList }));
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-gray-900">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">

          {/* Left Side: Fields Form */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-100">
            <div className={`px-6 py-4 border-b border-gray-100 flex-shrink-0 ${isIssue ? 'bg-white' : 'bg-gray-50'}`}>
              {isIssue ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">{workOrderTitle}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <select
                        value={formData.status || 'OPEN'}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-800 bg-white"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ON HOLD">On Hold</option>
                      </select>
                      <div className="flex items-center gap-3 text-gray-500">
                        <button className="p-1.5 hover:bg-gray-100 rounded">
                          <Clock className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded text-sm font-semibold">$</button>
                        <button className="p-1.5 hover:bg-gray-100 rounded">
                          <Repeat className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50">
                      Start Timer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <p className="text-xs text-gray-500">Details and Approval Settings</p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors md:hidden">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {showTabs && (
                isIssue ? (
                  <div className="flex items-center gap-6 border-b border-gray-200 pb-2">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${activeTabId === tab.id
                          ? 'border-blue-600 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${activeTabId === tab.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white/70 text-gray-600 border-gray-200 hover:border-blue-200 hover:text-blue-700'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )
              )}

              {activeTabId === 'overview' && (
                  isIssue ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-xl p-4 bg-slate-900 border border-slate-700 shadow-sm">
                          <div className="text-xs text-slate-300 font-semibold">Tasks</div>
                          <div className="text-lg font-bold text-white">{completedTasks}/{totalTasks}</div>
                        </div>
                        <div className="rounded-xl p-4 bg-slate-900 border border-slate-700 shadow-sm">
                          <div className="text-xs text-slate-300 font-semibold">Time</div>
                          <div className="text-lg font-bold text-white">{timeDisplay}</div>
                        </div>
                        <div className="rounded-xl p-4 bg-slate-900 border border-slate-700 shadow-sm">
                          <div className="text-xs text-slate-300 font-semibold">Parts</div>
                          <div className="text-lg font-bold text-white">{combinedParts.length}</div>
                        </div>
                        <div className="rounded-xl p-4 bg-slate-900 border border-slate-700 shadow-sm">
                          <div className="text-xs text-slate-300 font-semibold">Total Cost</div>
                          <div className="text-lg font-bold text-white">{formatMoney(fullTotalCost)}</div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-xl p-6 bg-white">
                        <h4 className="text-lg font-bold text-gray-900">{item.title || item.name || 'Untitled'}</h4>
                        <p className="text-sm text-gray-600 mt-2">{description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <div>
                            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Location</div>
                            <div className="text-sm text-blue-600 font-semibold mt-1">{location}</div>
                          </div>
                          <div className="flex md:justify-end">
                            <select
                              value={assetStatus}
                              onChange={() => { }}
                              className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 bg-white"
                            >
                              <option>Operational</option>
                              <option>Needs Attention</option>
                              <option>Offline</option>
                            </select>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Asset</div>
                            <div className="text-sm text-blue-600 font-semibold mt-1">
                              {formData.assetName || item.assetName || item.asset?.name || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Priority</div>
                            <div className="mt-1">
                              <PriorityBadge priority={priorityValue} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-xl p-6 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Closeout Notes</div>
                            <div className="mt-1 text-gray-800">{closeoutNotes}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Category</div>
                            <div className="mt-1 text-gray-800">{formData.category || item.category || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Estimated Duration</div>
                            <div className="mt-1 text-gray-800">{formData.estimatedTime || item.estimatedTime || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Created</div>
                            <div className="mt-1 text-gray-800">{formatDateTime(createdAt)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Created By</div>
                            <div className="mt-1 text-gray-800">{createdBy}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Last Updated</div>
                            <div className="mt-1 text-gray-800">{formatDateTime(item.updatedAt || item.lastUpdated || item.modifiedAt)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Updated By</div>
                            <div className="mt-1 text-gray-800">{updatedBy}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Due Date</div>
                            <div className="mt-1 text-gray-800">{formatDateTime(formData.fixDeadline || dueDate)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Primary Assignee</div>
                            <div className="mt-1 text-gray-800">{assignee || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">PM Trigger</div>
                            <div className="mt-1 text-gray-800">{pmTrigger}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {isRequest && isManagerOrAdmin && isApproved && (
                        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600" />
                          <div className="text-sm">
                            <div className="font-semibold">
                              This request was approved{workOrderRef ? ` and turned into Work Order ${workOrderRef}` : '.'}
                            </div>
                            {workOrderRef && (
                              <div className="text-xs text-emerald-700 mt-1">Work Order ID: {workOrderRef}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {isRequest && (isInProgress || isCompleted) && (
                        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                          <AlertCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                          <div className="text-sm">
                            <div className="font-semibold">
                              This request is {isCompleted ? 'completed' : 'in progress'}.
                            </div>
                            <div className="text-xs text-amber-700 mt-1">Editing is disabled once work has started or completed.</div>
                          </div>
                        </div>
                      )}

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{item.title || item.name || 'Untitled'}</h4>
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                      </div>

                      {/* Quick Metadata */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                          Status: {String(status)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200">
                          <Clock className="w-3.5 h-3.5" /> Created: {formatDateTime(createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200">
                          <Calendar className="w-3.5 h-3.5" /> Due: {formatDateTime(formData.fixDeadline || dueDate)}
                        </span>
                        {isIssue && frequencyValue && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200">
                            <Repeat className="w-3.5 h-3.5" /> Frequency: {String(frequencyValue)}
                          </span>
                        )}
                      </div>

                      {/* Editing Form Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    {/* Category & Priority */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Category</label>
                      <select
                        className={requestFieldClass}
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        disabled={isRequestReadOnly}
                      >
                        <option value="">Select Category</option>
                        <option value="Damage">Damage</option>
                        <option value="electrical">Electrical</option>
                        <option value="inspections">Inspections</option>
                        <option value="Meter Reading">Meter Reading</option>
                        <option value="None">None</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="preventative">Preventative</option>
                        <option value="project">Project</option>
                        <option value="safety">Safety</option>
                        <option value="upgrade">Upgrade</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Priority</label>
                      <select
                        className={requestFieldClass}
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                        disabled={isRequestReadOnly}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                    {isIssue && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Frequency</label>
                        <select
                          className={requestFieldClass}
                          value={formData.frequency}
                          onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                          disabled={isRequestReadOnly}
                        >
                          <option value="">Select Frequency</option>
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="MONTHLY">Monthly</option>
                          <option value="QUARTERLY">Quarterly</option>
                          <option value="YEARLY">Yearly</option>
                        </select>
                      </div>
                    )}

                    {/* Location & Asset */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Location</label>
                      <input
                        type="text"
                        className={requestFieldClass}
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        disabled={isRequestReadOnly}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Asset</label>
                      <input
                        type="text"
                        className={requestFieldClass}
                        placeholder="e.g. HVAC Unit 2"
                        value={formData.assetName}
                        onChange={e => setFormData({ ...formData, assetName: e.target.value })}
                        disabled={isRequestReadOnly}
                      />
                    </div>

                    {/* Responsibility */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">First Responsible (Technician/User)</label>
                      <select
                        className={requestFieldClass}
                        value={formData.assignedTo}
                        onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                        disabled={isRequestReadOnly}
                      >
                        <option value="">Select technician or user</option>
                        {technicians.map((t, idx) => {
                          const displayName = t.name || t.fullName || t.email || t.phone || 'User';
                          return (
                            <option key={`${t._id || t.id || 'tech'}-${idx}`} value={t._id || t.id}>{displayName}</option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Team</label>
                      <select
                        className={requestFieldClass}
                        value={formData.team}
                        onChange={e => setFormData({ ...formData, team: e.target.value })}
                        disabled={isRequestReadOnly}
                      >
                        <option value="">Select Team</option>
                        {teams.map(team => (
                          <option key={team._id || team.id} value={team.name}>{team.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Additional Responsible Workers</label>
                      <input
                        type="text"
                        className={requestFieldClass}
                        placeholder="Search and add workers..."
                        value={formData.additionalResponsibleWorkers || ''}
                        onChange={e => setFormData({ ...formData, additionalResponsibleWorkers: e.target.value })}
                        disabled={isRequestReadOnly}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Estimated Time (hrs)</label>
                      <input
                        type="number"
                        step="0.5"
                        className={requestFieldClass}
                        placeholder="e.g. 2.5"
                        value={formData.estimatedTime}
                        onChange={e => setFormData({ ...formData, estimatedTime: e.target.value })}
                        disabled={isRequestReadOnly}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Due Date (Deadline)</label>
                      <input
                        type="date"
                        className={requestFieldClass}
                        value={formData.fixDeadline}
                        onChange={e => setFormData({ ...formData, fixDeadline: e.target.value })}
                        disabled={isRequestReadOnly}
                      />
                    </div>

                    {/* Signature & Files */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Signature</label>
                      <div className="border border-gray-300 border-dashed rounded-lg h-24 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                        {item.signature ? <img src={item.signature} className="h-full object-contain" alt="Signature" /> : 'Draw or Upload Signature'}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Attachments</label>
                      <div className="border border-gray-300 border-dashed rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center text-center gap-2">
                        <div className="text-sm text-gray-600">Drag & drop files here</div>
                        <div className="text-xs text-blue-600 cursor-pointer hover:underline border border-blue-600 rounded px-2 py-1 mt-1 inline-block mx-auto">Add from saved file</div>
                      </div>
                    </div>

                  </div>

                  {/* Existing Image Display (if any) */}
                  {(item.beforePhoto || item.photo || item.image || item.beforeImage || item.afterImage || item.afterPhoto) && (
                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Original Attachment</label>
                      <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 w-48">
                        <img
                          src={getImageUrl(item.afterImage || item.afterPhoto || item.beforeImage || item.beforePhoto || item.photo || item.image)}
                          alt="Attachment"
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* If material request, show items */}
                  {isMaterial && (
                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Requested Materials</label>
                      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                        {(item.items || []).length > 0 ? (
                          item.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 text-sm">
                              <div className="font-medium text-gray-900">{it.title || it.materialId || 'Item'}</div>
                              <div className="text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded">Qty: {it.quantity ?? it.qty ?? 'â€”'}</div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-sm text-gray-500">No items attached.</div>
                        )}
                      </div>
                    </div>
                  )}
                    </>
                  )
              )}

              {activeTabId === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Tasks</h4>
                      <p className="text-xs text-gray-500">Track and update work order tasks.</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                      {tasks.length} total
                    </span>
                  </div>

                  {hasStructuredTasks ? (
                    tasks.length === 0 ? (
                      <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                        No tasks added yet.
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/70">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                              <th className="text-left px-4 py-3">Task</th>
                              <th className="text-left px-4 py-3">Status</th>
                              <th className="text-left px-4 py-3">Assignee</th>
                              <th className="text-left px-4 py-3">Due</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {tasks.map((task, idx) => {
                              const taskTitle = typeof task === 'string' ? task : (task.title || task.text || task.name || `Task ${idx + 1}`);
                              const taskStatus = typeof task === 'string' ? 'Open' : (task.status || (task.completed ? 'Complete' : 'Open'));
                              const taskAssignee = typeof task === 'string' ? 'â€”' : (task.assignedTo || task.assignee || task.owner || 'â€”');
                              const taskDue = typeof task === 'string' ? '' : (task.dueDate || task.deadline || task.due || '');
                              return (
                                <tr key={idx} className="text-gray-700">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300"
                                        checked={!!(typeof task === 'object' && task.completed)}
                                        disabled
                                      />
                                      <span>{taskTitle}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                      {taskStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">{taskAssignee}</td>
                                  <td className="px-4 py-3">{taskDue ? formatDateTime(taskDue) : 'â€”'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/70">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Checklist Items</label>
                      {formData.checklist.length === 0 && (
                        <div className="text-xs text-gray-500 mb-2">No checklist items yet.</div>
                      )}
                      <div className="flex flex-col gap-2">
                        {formData.checklist.map((ci, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300"
                              checked={ci.completed}
                              onChange={e => updateChecklistItem(idx, 'completed', e.target.checked)}
                              disabled={isRequestReadOnly}
                            />
                            <input
                              type="text"
                              className={`flex-1 bg-transparent border-b border-gray-300 text-sm py-1 focus:outline-none focus:border-blue-500 ${isRequestReadOnly ? 'text-gray-500 cursor-not-allowed' : ''}`}
                              placeholder={`Item ${idx + 1}`}
                              value={ci.text}
                              onChange={e => updateChecklistItem(idx, 'text', e.target.value)}
                              disabled={isRequestReadOnly}
                            />
                          </div>
                        ))}
                        <button
                          onClick={addChecklistItem}
                          className={`text-xs font-semibold self-start mt-1 ${isRequestReadOnly ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'}`}
                          disabled={isRequestReadOnly}
                        >
                          + Add Item
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTabId === 'labor' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Labor</h4>
                      <p className="text-xs text-gray-500">Track time and labor allocation.</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button
                         onClick={handleOpenAddLabor}
                         className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 flex items-center gap-2"
                       >
                         <Clock className="w-3.5 h-3.5" />
                         Add Time
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl border border-gray-200 bg-white/70">
                      <div className="text-xs text-gray-500">Assigned To</div>
                      <div className="text-sm font-bold text-gray-900 mt-1">{assignee || 'Unassigned'}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 bg-white/70">
                      <div className="text-xs text-gray-500">Estimated Hours</div>
                      <div className="text-sm font-bold text-gray-900 mt-1">{estimatedHours || 0} hrs</div>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 bg-white/70">
                      <div className="text-xs text-gray-500">Labor Cost</div>
                      <div className="text-sm font-bold text-gray-900 mt-1">{formatMoney(laborCost)}</div>
                    </div>
                  </div>

                  {combinedLabor.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                      No labor entries yet.
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/70">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                          <tr>
                            <th className="text-left px-4 py-3">Technician</th>
                            <th className="text-left px-4 py-3">Category</th>
                            <th className="text-left px-4 py-3">Duration</th>
                            <th className="text-left px-4 py-3">Rate</th>
                            <th className="text-right px-4 py-3">Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {combinedLabor.map((entry, idx) => {
                            const durationSeconds = (toNumber(entry.hours) * 3600) + (toNumber(entry.minutes) * 60) + toNumber(entry.seconds || 0);



                            return (
                              <tr key={entry.id} className="text-gray-700">
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-blue-700">{entry.name}</div>
                                  {entry.startedAt && <div className="text-[10px] text-gray-500">{formatDateTime(entry.startedAt)}</div>}
                                </td>
                                <td className="px-4 py-3">{entry.category || 'Maintenance'}</td>
                                <td className="px-4 py-3">{formatTimer(durationSeconds)}</td>
                                <td className="px-4 py-3">{entry.rate ? formatMoney(toNumber(entry.rate)) : '—'}</td>
                                <td className="px-4 py-3 text-right font-semibold">{formatMoney(toNumber(entry.cost))}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="flex justify-end text-sm font-semibold text-gray-800 pb-2">
                    Total Labor: {formatMoney(laborTotal)}
                  </div>
                </div>
              )}

              {activeTabId === 'parts' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Parts</h4>
                      <p className="text-xs text-gray-500">Materials and parts used.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50">
                        Edit
                      </button>
                      <button
                        onClick={handleOpenAddPart}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                      >
                        Add Parts
                      </button>
                    </div>
                  </div>

                  {combinedParts.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                      No parts recorded yet.
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/70">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                          <tr>
                            <th className="text-left px-4 py-3">Name</th>
                            <th className="text-left px-4 py-3">Status</th>
                            <th className="text-left px-4 py-3">Cost</th>
                            <th className="text-left px-4 py-3">Quantity</th>
                            <th className="text-left px-4 py-3">Total Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {combinedParts.map((part) => {
                            const total = toNumber(part.cost) * toNumber(part.quantity || 1);
                            return (
                              <tr key={part.id} className="text-gray-700">
                                <td className="px-4 py-3">
                                  <div className="text-sm font-semibold text-blue-700">{part.name || 'Part'}</div>
                                  {part.location && <div className="text-xs text-gray-500">{part.location}</div>}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStockBadge(part.status)}`}>
                                    {part.status || 'In stock'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">{formatMoney(toNumber(part.cost))}</td>
                                <td className="px-4 py-3">{part.quantity || 1}</td>
                                <td className="px-4 py-3">{formatMoney(total)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="flex justify-end text-sm font-semibold text-gray-800">
                    Total: {formatMoney(partsTotal)}
                  </div>
                </div>
              )}
{activeTabId === 'costs' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Costs</h4>
                      <p className="text-xs text-gray-500">Summary of labor and materials cost.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleOpenAddCost}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                      >
                        $ Add Cost
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-gray-200 bg-white/70">
                      <div className="text-xs text-gray-500">Labor</div>
                      <div className="text-lg font-bold text-gray-900 mt-1">{formatMoney(laborCost)}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 bg-white/70">
                      <div className="text-xs text-gray-500">Parts</div>
                      <div className="text-lg font-bold text-gray-900 mt-1">{formatMoney(partsDisplayCost)}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 bg-white/70">
                      <div className="text-xs text-gray-500">Other</div>
                      <div className="text-lg font-bold text-gray-900 mt-1">{formatMoney(otherCost)}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                      <div className="text-xs text-blue-700">Total</div>
                      <div className="text-lg font-bold text-blue-900 mt-1">{formatMoney(fullTotalCost)}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50">
                      <div className="text-xs text-purple-700">Added Costs</div>
                      <div className="text-lg font-bold text-purple-900 mt-1">{formatMoney(localCostsTotal)}</div>
                    </div>
                  </div>

                  {localCosts.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                      No added costs yet.
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/70">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                          <tr>
                            <th className="text-left px-4 py-3">Description</th>
                            <th className="text-left px-4 py-3">Category</th>
                            <th className="text-left px-4 py-3">Assigned To</th>
                            <th className="text-left px-4 py-3">Date</th>
                            <th className="text-right px-4 py-3">Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {localCosts.map((entry) => (
                            <tr key={entry.id} className="text-gray-700">
                              <td className="px-4 py-3">{entry.description}</td>
                              <td className="px-4 py-3">{entry.category}</td>
                              <td className="px-4 py-3">{entry.assignedTo}</td>
                              <td className="px-4 py-3">{entry.date ? formatDateTime(entry.date) : '-'}</td>
                              <td className="px-4 py-3 text-right">{formatMoney(entry.cost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="flex justify-end text-sm font-semibold text-gray-800">
                    Grand Total: {formatMoney(fullTotalCost)}
                  </div>
                </div>
              )}

              {activeTabId === 'files' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Files</h4>
                    <p className="text-xs text-gray-500">Attachments and evidence files.</p>
                  </div>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    className="border border-dashed border-gray-200 rounded-xl p-4 bg-white/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Import files</div>
                        <div className="text-xs text-gray-500">PDFs, images, docs, or any evidence files.</div>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded-lg border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-50"
                      >
                        Import Files
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileImport(e.target.files)}
                      />
                    </div>
                    <div className="text-[11px] text-gray-400 mt-2">Drag & drop files here or click Import.</div>
                  </div>

                  {combinedFileItems.length === 0 && coreImageItems.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                      No files uploaded yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coreImageItems.map((f, idx) => (
                        <div key={`core-${idx}`} className="border border-gray-200 rounded-xl overflow-hidden bg-white/70">
                          <div className="text-xs font-semibold text-gray-600 px-3 py-2 border-b border-gray-100">{f.label}</div>
                          <img src={getImageUrl(f.url)} alt={f.label} className="w-full h-36 object-cover" />
                        </div>
                      ))}
                      {combinedFileItems.map((f, idx) => {
                        const sizeLabel = f.size ? `${Math.round(f.size / 1024)} KB` : '';
                        return (
                          <div key={f.id || `file-${idx}`} className="border border-gray-200 rounded-xl p-4 bg-white/70 flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-gray-800">{f.name || `File ${idx + 1}`}</div>
                              <div className="text-xs text-gray-500">{f.type || 'File'}{sizeLabel ? ` â€¢ ${sizeLabel}` : ''}</div>
                            </div>
                            {f.url ? (
                              <a href={f.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-semibold">Open</a>
                            ) : (
                              <span className="text-xs text-gray-400">Pending</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTabId === 'activity' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Activity</h4>
                    <p className="text-xs text-gray-500">Recent updates on this work order.</p>
                  </div>

                  {combinedActivityItems.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                      No activity recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {combinedActivityItems.map((act, idx) => {
                        const when = act.timestamp || '';
                        const actorLabel = act.user ? (act.user === userName ? 'You' : act.user) : '';
                        return (
                          <div key={act.id || `activity-${idx}`} className="p-4 rounded-xl border border-gray-200 bg-white/70">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-gray-800">{act.action || 'Update'}</div>
                              <div className="text-xs text-gray-500">{when ? formatDateTime(when) : 'â€”'}</div>
                            </div>
                            {act.detail && <p className="text-xs text-gray-600 mt-2">{act.detail}</p>}
                            {(actorLabel || act.role || act.source === 'local') && (
                              <div className="text-[11px] text-gray-400 mt-2">
                                {actorLabel ? `by ${actorLabel}` : 'Activity'}
                                {act.role ? ` • ${act.role}` : ''}
                                {act.source === 'local' ? ' • local' : ''}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTabId === 'links' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Links</h4>
                    <p className="text-xs text-gray-500">Related resources, linked work orders, and reference URLs.</p>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-white/70 space-y-3">
                    <div className="text-sm font-semibold text-gray-900">Link Work Orders</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Link Relationship</label>
                        <select
                          value={linkRelation}
                          onChange={(e) => setLinkRelation(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="relates to">Relates to</option>
                          <option value="blocks">Blocks</option>
                          <option value="is blocked by">Is blocked by</option>
                          <option value="duplicates">Duplicates</option>
                          <option value="parent of">Parent of</option>
                          <option value="child of">Child of</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Work Order(s) to Link</label>
                        <select
                          value={linkedWorkOrders}
                          onChange={handleSelectLinkedWorkOrders}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">Select work order</option>
                          {availableWorkOrders.length === 0 ? (
                            <option disabled>No other work orders available</option>
                          ) : (
                            availableWorkOrders.map((wo, idx) => (
                              <option key={`${wo._id || wo.id || 'workorder'}-${idx}`} value={String(wo._id || wo.id)}>
                                {wo.title || wo.name || wo.workOrderNumber || wo._id || wo.id}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleLinkWorkOrders}
                        disabled={!linkedWorkOrders}
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold disabled:opacity-60"
                      >
                        Link
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-white/70 space-y-3">
                    <div className="text-sm font-semibold text-gray-900">Add URL</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        value={newLink.title}
                        onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Link title"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        value={newLink.url}
                        onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://example.com"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <button
                        onClick={handleAddLink}
                        className="px-3 py-2 rounded-lg border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-50"
                      >
                        Add Link
                      </button>
                    </div>
                  </div>

                  {combinedLinkItems.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                      No links added yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {combinedLinkItems.map((link, idx) => {
                        const title = link.title || link.label || link.name || `Link ${idx + 1}`;
                        const url = link.url || '';
                        const relationship = link.relationship;
                        return (
                          <div key={link.id || `link-${idx}`} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white/70">
                            <div>
                              <div className="text-sm font-semibold text-gray-800">{title}</div>
                              {relationship && <div className="text-[11px] text-gray-400">Relationship: {relationship}</div>}
                            </div>
                            {url ? (
                              <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-semibold">Open</a>
                            ) : (
                              <span className="text-xs text-gray-400">Linked</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {activeTabId === 'provider' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Provider Portal</h4>
                    <p className="text-xs text-gray-500">External provider details and handoff info.</p>
                  </div>

                  <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-blue-900">Create a public link for this Work Order.</div>
                      <div className="text-xs text-blue-700">Share this link with providers to track updates.</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCopyProviderLink}
                        disabled={!providerPortalUrl}
                        className="px-3 py-2 rounded-lg bg-white border border-blue-200 text-blue-700 text-xs font-semibold disabled:opacity-60"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={handleToggleProvider}
                        aria-pressed={providerEnabled}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${providerEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${providerEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-white/70">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Provider Portal Link</label>
                    <div className="flex items-center gap-2">
                      <input
                        value={providerPortalUrl}
                        readOnly
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                        placeholder="Link will appear here"
                      />
                      <button
                        onClick={handleCopyProviderLink}
                        disabled={!providerPortalUrl}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold disabled:opacity-60"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {providerEnabled ? (
                    !provider || Object.keys(provider).length === 0 ? (
                      <div className="rounded-xl border border-gray-200 bg-white/70 p-6 text-center">
                        <div className="text-sm font-semibold text-gray-900">Keep Vendors in the Loop</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Assign a vendor to this Work Order to create the provider portal. They'll be able to track updates and stay connected.
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-gray-200 bg-white/70">
                          <div className="text-xs text-gray-500">Provider</div>
                          <div className="text-sm font-bold text-gray-900 mt-1">{provider.name || provider.company || provider.title || 'Provider'}</div>
                        </div>
                        <div className="p-4 rounded-xl border border-gray-200 bg-white/70">
                          <div className="text-xs text-gray-500">Contact</div>
                          <div className="text-sm font-bold text-gray-900 mt-1">{provider.email || provider.phone || provider.contact || 'Not provided'}</div>
                        </div>
                        <div className="p-4 rounded-xl border border-gray-200 bg-white/70 md:col-span-2">
                          <div className="text-xs text-gray-500">Notes</div>
                          <div className="text-sm text-gray-700 mt-1">{provider.notes || provider.description || 'No provider notes added.'}</div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                      Provider portal is disabled.
                    </div>
                  )}
                </div>
              )}
            </div>


            {!isIssue && (
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-end gap-3 flex-shrink-0">
                <button
                  onClick={handleSaveModal}
                  disabled={isRequestReadOnly}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Save (Without Appr.)
                </button>
                {(!isRequest || !isApproved) && (
                  <>
                    <button
                      onClick={handleDeclineModal}
                      disabled={isRequestReadOnly}
                      className="px-5 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold shadow-sm hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Decline
                    </button>
                    <button
                      onClick={handleApproveModal}
                      disabled={isRequestReadOnly}
                      className="px-5 py-2.5 bg-green-600 border border-transparent text-white rounded-xl text-sm font-bold shadow-sm hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Chat Panel */}
          {!isIssue && (
            <div className="w-full md:w-80 lg:w-96 flex flex-col bg-gray-50 border-l border-gray-200 flex-shrink-0">
            <div className="px-4 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Internal Chat
              </h4>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hidden md:block">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="text-center text-xs text-gray-400 font-semibold mt-2 mb-4">Messages</div>
              {formData.chat.length === 0 ? (
                <div className="text-center text-gray-400 text-xs py-10 italic">No messages yet. Start the conversation.</div>
              ) : (
                formData.chat.map((msg, i) => (
                  <div key={i} className={`flex flex-col gap-1 ${msg.sender === userName ? 'items-end' : 'items-start'}`}>
                    <span className={`text-[10px] text-gray-500 ${msg.sender === userName ? 'mr-1' : 'ml-1'}`}>
                      {msg.sender} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className={`${msg.sender === userName ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'} rounded-2xl px-4 py-2 text-sm shadow-sm max-w-[85%] break-words`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="text-blue-600 font-semibold p-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          )}
        </div>

        {addCostOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Add Cost</h3>
                <button onClick={() => setAddCostOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description <span className="text-rose-500">*</span></label>
                  <textarea
                    rows="3"
                    value={costForm.description}
                    onChange={(e) => setCostForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-rose-500">*</span></label>
                    <select
                      value={costForm.category}
                      onChange={(e) => setCostForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select category</option>
                      <option value="Tax">Tax</option>
                      <option value="Labor Cost">Labor Cost</option>
                      <option value="Parts Cost">Parts Cost</option>
                      <option value="Travel Cost">Travel Cost</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cost <span className="text-rose-500">*</span></label>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                      <span className="text-gray-400 mr-2">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={costForm.cost}
                        onChange={(e) => setCostForm(prev => ({ ...prev, cost: e.target.value }))}
                        className="w-full text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned To <span className="text-rose-500">*</span></label>
                    <select
                      value={costForm.assignedTo}
                      onChange={(e) => setCostForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select assignee</option>
                      <option value={userName}>{userName}</option>
                      {technicians.map((t, idx) => (
                        <option key={`${t._id || t.id || 'tech'}-${idx}`} value={t.name || t.email || t._id || t.id}>
                          {t.name || t.email || t._id || t.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date <span className="text-rose-500">*</span></label>
                    <input
                      type="datetime-local"
                      value={costForm.date}
                      onChange={(e) => setCostForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setAddCostOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCost}
                  disabled={!costForm.description || !costForm.category || !costForm.cost || !costForm.assignedTo || !costForm.date}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {addPartOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-5xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Add Parts</h3>
                <button onClick={() => setAddPartOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="px-6 pt-4 pb-2">
                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative">
                    <input
                      value={inventorySearch}
                      onChange={e => setInventorySearch(e.target.value)}
                      placeholder="Search inventory parts..."
                      className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button type="button" onClick={fetchInventoryParts} className="px-3 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">
                    Refresh
                  </button>
                </div>
              </div>
              <div className="px-6 pb-2 max-h-[55vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase border-b">
                    <tr>
                      <th className="w-10 px-2 py-2"></th>
                      <th className="text-left px-2 py-2">Name</th>
                      <th className="text-left px-2 py-2">ID</th>
                      <th className="text-left px-2 py-2">Location</th>
                      <th className="text-left px-2 py-2">Area</th>
                      <th className="text-left px-2 py-2">Cost</th>
                      <th className="text-left px-2 py-2">Available Qty</th>
                      <th className="text-left px-2 py-2">Maximum Qty</th>
                      <th className="text-left px-2 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventoryLoading ? (
                      <tr><td colSpan="9" className="py-6 text-center text-gray-500">Loading inventory…</td></tr>
                    ) : (
                      inventoryParts
                        .filter(p => {
                          const q = inventorySearch.toLowerCase();
                          if (!q) return true;
                          return (p.name || '').toLowerCase().includes(q)
                            || (p.partNumber || '').toLowerCase().includes(q)
                            || (p.category || '').toLowerCase().includes(q)
                            || (p.id || '').toLowerCase().includes(q);
                        })
                        .slice(0, 100)
                        .map((part, idx) => {
                          const pid = part._id || part.id || idx;
                        const selected = Boolean(selectedInventoryParts[part._id || part.id || idx]);
                        const stock = getAvailableQty(part);
                        const maxQty = getMaxQty(part);
                        const price = part.cost ?? part.unitCost ?? part.price ?? 0;
                        return (
                          <tr key={pid} className={`${selected ? 'bg-blue-50' : ''} hover:bg-gray-50`}>
                            <td className="px-2 py-2">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setSelectedInventoryParts(prev => {
                                    const key = part._id || part.id || idx;
                                    if (checked) {
                                      return {
                                        ...prev,
                                        [key]: { part, quantity: 1 }
                                      };
                                    }
                                    const clone = { ...prev };
                                    delete clone[key];
                                    return clone;
                                  });
                                }}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <div className="font-semibold text-gray-900">{part.name || 'Part'}</div>
                              <div className="text-xs text-gray-500">{part.category || ''}</div>
                            </td>
                              <td className="px-2 py-2 font-mono text-xs text-gray-600">{part.partNumber || part.id || part._id || '—'}</td>
                              <td className="px-2 py-2 text-gray-700">{part.location || '—'}</td>
                              <td className="px-2 py-2 text-gray-700">{getAreaLabel(part) || '—'}</td>
                              <td className="px-2 py-2 text-gray-800">{price ? formatMoney(price) : '—'}</td>
                              <td className="px-2 py-2 text-gray-800">
                                <div className="flex items-center gap-2">
                                  <span>{stock}</span>
                                  {selected && (
                                    <input
                                      type="number"
                                      min="1"
                                      max={stock || undefined}
                                      value={selectedInventoryParts[part._id || part.id || idx]?.quantity || 1}
                                      onChange={e => {
                                        const val = Number(e.target.value) || 1;
                                        const key = part._id || part.id || idx;
                                        setSelectedInventoryParts(prev => ({
                                          ...prev,
                                          [key]: { part, quantity: val }
                                        }));
                                      }}
                                      className="w-16 border border-gray-200 rounded px-2 py-1 text-xs"
                                    />
                                  )}
                                </div>
                              </td>
                              <td className="px-2 py-2 text-gray-800">{maxQty}</td>
                              <td className="px-2 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStockBadge(part.status)}`}>
                                  {part.status || 'In stock'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                    )}
                    {!inventoryLoading && inventoryParts.length === 0 && (
                      <tr><td colSpan="9" className="py-6 text-center text-gray-500">No inventory parts found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-gray-200 flex flex-wrap items-center gap-4 justify-between">
                <div className="text-sm text-gray-700">
                  Selected: {Object.keys(selectedInventoryParts).length} part(s)
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAddPartOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPart}
                    disabled={Object.keys(selectedInventoryParts).length === 0}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {addLaborOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Add Labor Time</h3>
                <button onClick={() => setAddLaborOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Worker <span className="text-rose-500">*</span></label>
                      <select
                        value={laborForm.worker}
                        onChange={(e) => setLaborForm(prev => ({ ...prev, worker: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Select worker</option>
                        {allWorkers.map((t, idx) => {
                          const displayName = t.name || t.fullName || t.email || t.phone || 'User';
                          const value = t._id || t.id || t.userId || displayName;
                          return (
                            <option key={`${value}-${idx}`} value={value}>
                              {displayName}
                            </option>
                          );
                        })}
                      </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Rate ($/hr)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={laborForm.rate}
                      onChange={(e) => setLaborForm(prev => ({ ...prev, rate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Time (Hours)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={laborForm.hours}
                      onChange={(e) => setLaborForm(prev => ({ ...prev, hours: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Time (Minutes)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="5"
                      value={laborForm.minutes}
                      onChange={(e) => setLaborForm(prev => ({ ...prev, minutes: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date <span className="text-rose-500">*</span></label>
                    <input
                      type="datetime-local"
                      value={laborForm.startedAt}
                      onChange={(e) => setLaborForm(prev => ({ ...prev, startedAt: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      value={laborForm.category}
                      onChange={(e) => setLaborForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="Repair">Repair</option>
                      <option value="Inspection">Inspection</option>
                      <option value="Installation">Installation</option>
                      <option value="Travel">Travel</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setAddLaborOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLabor}
                  disabled={!laborForm.worker || !laborForm.startedAt || (laborForm.hours === 0 && laborForm.minutes === 0)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, []);

          

  // â”€â”€ Helper Functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const getCurrentUser = useCallback(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const getCurrentUserId = useCallback(() => {
    const user = getCurrentUser();
    return user?.id || user?._id || null;
  }, [getCurrentUser]);

  const modalTechnicians = allWorkers;

  const isRestrictedRole = useCallback((role) => {
    const r = String(role || '').toLowerCase();
    return r === 'client' || r === 'requestor';
  }, []);

  const matchesUser = useCallback((value, userId) => {
    if (!value || !userId) return false;
    return String(value) === String(userId);
  }, []);

  const filterPropertiesForUser = useCallback((items, userId) => {
    if (!Array.isArray(items) || !userId) return [];
    return items.filter((p) => (
      matchesUser(p.userId, userId) ||
      matchesUser(p.clientId, userId) ||
      matchesUser(p.ownerId, userId) ||
      matchesUser(p.createdBy, userId) ||
      matchesUser(p.requestorId, userId) ||
      (Array.isArray(p.users) && p.users.some(u => matchesUser(u?.id || u?._id || u, userId)))
    ));
  }, [matchesUser]);

  const filterAssetsForUser = useCallback((items, userId, propertyIds) => {
    if (!Array.isArray(items)) return [];
    return items.filter((a) => (
      matchesUser(a.userId, userId) ||
      matchesUser(a.clientId, userId) ||
      matchesUser(a.ownerId, userId) ||
      (propertyIds || []).includes(String(a.propertyId || a.property?._id || a.property?.id))
    ));
  }, [matchesUser]);

  const filterIssuesForUser = useCallback((items, userId, propertyIds, assetIds, companyName) => {
    if (!Array.isArray(items)) return [];
    if (companyName) {
      const cmp = String(companyName).toLowerCase();
      return items.filter(issue => {
        const issueCompany = String(issue.companyName || '').toLowerCase();
        // Strict matching: if user has a company, only show issues for that company.
        return issueCompany === cmp;
      });
    }
    // If we have no way to scope (anonymous client creating first request), show all so the user sees their submission.
    if (!userId && (!propertyIds || propertyIds.length === 0) && (!assetIds || assetIds.length === 0)) {
      return items;
    }
    return items.filter((issue) => {
      const issuePropertyId = issue.propertyId || issue.property?._id || issue.property?.id;
      const issueAssetId = issue.assetId || issue.asset?._id || issue.asset?.id;
      return (
        matchesUser(issue.userId, userId) ||
        matchesUser(issue.clientId, userId) ||
        matchesUser(issue.requestedBy, userId) ||
        matchesUser(issue.createdBy, userId) ||
        matchesUser(issue.reporterId, userId) ||
        matchesUser(issue.requestorId, userId) ||
        (propertyIds || []).includes(String(issuePropertyId)) ||
        (assetIds || []).includes(String(issueAssetId))
      );
    });
  }, [matchesUser]);

  const filterSchedulesForUser = useCallback((items, userId, propertyIds, assetIds) => {
    if (!Array.isArray(items)) return [];
    return items.filter((s) => {
      const schedulePropertyId = s.propertyId || s.property?._id || s.property?.id;
      const scheduleAssetId = s.assetId || s.asset?._id || s.asset?.id;
      return (
        matchesUser(s.userId, userId) ||
        matchesUser(s.clientId, userId) ||
        matchesUser(s.requestorId, userId) ||
        (propertyIds || []).includes(String(schedulePropertyId)) ||
        (assetIds || []).includes(String(scheduleAssetId))
      );
    });
  }, [matchesUser]);

  const filterTechsForUser = useCallback((items, userId, propertyIds) => {
    if (!Array.isArray(items)) return [];
    return items.filter((t) => (
      matchesUser(t.userId, userId) ||
      matchesUser(t.clientId, userId) ||
      matchesUser(t.requestorId, userId) ||
      (propertyIds || []).includes(String(t.propertyId || t.property?._id || t.property?.id))
    ));
  }, [matchesUser]);

  useEffect(() => {
    propertiesRef.current = properties;
  }, [properties]);

  // Keep a selected property for the detail view (default to first result)
  useEffect(() => {
    if (!properties || properties.length === 0) {
      setSelectedProperty(null);
      return;
    }
    if (!selectedProperty) {
      setSelectedProperty(properties[0]);
      return;
    }
    const match = properties.find(
      p => String(p._id || p.id) === String(selectedProperty._id || selectedProperty.id)
    );
    if (match && match !== selectedProperty) {
      setSelectedProperty(match);
    }
  }, [properties, selectedProperty]);

  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  useEffect(() => {
    if (selectedSchedule) {
      setScheduleDetailTab('assets');
    }
  }, [selectedSchedule]);

  useEffect(() => {
    if (activeTab !== 'maintenanceTemplates' && activeTab !== 'preventiveMaintenance') {
      setSelectedSchedule(null);
    }
  }, [activeTab]);

  // â”€â”€ Data fetching â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchIssues = useCallback(async (context = {}) => {
    try {
      const res = await api.get('/api/issues');
      const now = new Date();
      const fetched = (res.data || []).map(issue => {
        const diff = now - new Date(issue.createdAt);
        const hours = Math.floor(diff / 3600000);
        const time = hours > 24 ? `${Math.floor(hours / 24)}d ago` : hours > 0 ? `${hours}h ago` : 'Just now';
        const st = (issue.status || '').toUpperCase();
        const isOverdue = (st === 'PENDING' || st.includes('PROGRESS')) && hours > 72;
        return { ...issue, time, overdue: issue.overdue ?? isOverdue };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const user = context.user || getCurrentUser();
      const userId = user?.id || user?._id || null;
      const companyName = user?.companyName || null;
      const propertyIds = (context.propertyIds || propertiesRef.current.map(p => p._id || p.id)).filter(Boolean).map(String);
      const assetIds = (context.assetIds || assetsRef.current.map(a => a._id || a.id)).filter(Boolean).map(String);
      const scoped = isRestrictedRole(user?.role)
        ? filterIssuesForUser(fetched, userId, propertyIds, assetIds, companyName)
        : fetched;

      setIssues(scoped);
      setAllIssues(scoped);
      const counts = { Pending: 0, 'In Progress': 0, Completed: 0, Overdue: 0 };
      scoped.forEach(issue => {
        const st = (issue.status || '').toLowerCase().replace(/_/g, ' ');
        if (st.includes('pending')) counts.Pending++;
        else if (st.includes('progress')) counts['In Progress']++;
        else if (st.includes('complete') || st.includes('verified') || st.includes('approved')) counts.Completed++;
        if (issue.overdue) counts.Overdue++;
      });
      setStatusCounts(counts);
    } catch {
      setIssues([]);
      setAllIssues([]);
    }
  }, [filterIssuesForUser, getCurrentUser, isRestrictedRole]);

  // Keep issues fresh for client progress tracking
  useEffect(() => {
    fetchIssues();
    const interval = setInterval(() => fetchIssues(), 30000);
    return () => clearInterval(interval);
  }, [fetchIssues]);

  // Listen for technician updates dispatched as custom events
  useEffect(() => {
    const handler = (e) => {
      const { id, status, chat } = e.detail || {};
      if (!id) return;
      setIssues(prev => prev.map(it => String(it._id || it.id) === String(id)
        ? { ...it, status: status || it.status, chat: chat || it.chat }
        : it));
      setAllIssues(prev => prev.map(it => String(it._id || it.id) === String(id)
        ? { ...it, status: status || it.status, chat: chat || it.chat }
        : it));
    };
    window.addEventListener('issueStatusUpdated', handler);
    return () => window.removeEventListener('issueStatusUpdated', handler);
  }, []);

  const refreshSchedules = useCallback(async () => {
    try {
      const r = await api.get('/api/maintenance-schedules');
      setMaintenanceSchedules(r.data || []);
    } catch {
      // Handle error silently
    }
  }, []);

  const refreshPeople = useCallback(async () => {
    setLoading(l => ({ ...l, people: true }));
    try {
      const [usersRes, invitesRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/users/invites'),
      ]);

      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const invites = Array.isArray(invitesRes.data) ? invitesRes.data : [];

      const normStatus = (s) => {
        const v = String(s || '').toLowerCase();
        if (!v) return 'Active';
        if (v === 'active') return 'Active';
        if (v === 'inactive') return 'Inactive';
        return s;
      };

      setPeople([
        ...users.map((u) => ({ ...u, kind: 'user', status: normStatus(u.status) })),
        ...invites.map((inv) => ({ ...inv, kind: 'invite', status: 'Invited' }))
      ]);
      setErrors(e => ({ ...e, people: null }));
    } catch (err) {
      setErrors(e => ({ ...e, people: err?.response?.data?.error || err?.response?.data?.message || err.message }));
    } finally {
      setLoading(l => ({ ...l, people: false }));
    }
  }, []);

  const refreshTeams = useCallback(async () => {
    setLoading(l => ({ ...l, teams: true }));
    try {
      const r = await api.get('/api/teams');
      setTeams(r.data || []);
      setErrors(e => ({ ...e, teams: null }));
    } catch (err) {
      setErrors(e => ({ ...e, teams: err?.response?.data?.error || err?.response?.data?.message || err.message }));
    } finally {
      setLoading(l => ({ ...l, teams: false }));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'internalTechnicians') {
      refreshPeople();
      refreshTeams();
      return;
    }

    // Needed for approving requests (team assignment dropdown)
    if (activeTab === 'requests') {
      refreshTeams();
    }
  }, [activeTab, refreshPeople, refreshTeams]);

  const handleInviteUsers = useCallback(async (invites) => {
    if (!Array.isArray(invites) || invites.length === 0) return;
    try {
      setInviteUsersBusy(true);
      for (const invite of invites) {
        await api.post('/api/users/invite', { email: invite.email, role: invite.role });
      }
      setInviteUsersOpen(false);
      await refreshPeople();
      alert(`Invited ${invites.length} user${invites.length === 1 ? '' : 's'}.`);
    } catch (err) {
      alert('Invite failed: ' + (err?.response?.data?.error || err?.response?.data?.message || err.message));
    } finally {
      setInviteUsersBusy(false);
    }
  }, [refreshPeople]);

  const handleCreateTeam = useCallback(async ({ name, members }) => {
    const trimmedName = String(name || '').trim();
    if (!trimmedName) return;
    try {
      setCreateTeamBusy(true);
      await api.post('/api/teams', { name: trimmedName, members: Array.isArray(members) ? members : [] });
      setCreateTeamOpen(false);
      await refreshTeams();
      alert('Team created.');
    } catch (err) {
      alert('Create team failed: ' + (err?.response?.data?.error || err?.response?.data?.message || err.message));
    } finally {
      setCreateTeamBusy(false);
    }
  }, [refreshTeams]);

  const handleDeletePerson = useCallback(async (id) => {
    if (!id) return;
    if (!window.confirm('Delete this invitation?')) return;
    try {
      await api.delete(`/api/users/invites/${id}`);
      await refreshPeople();
    } catch (err) {
      alert('Delete failed: ' + (err?.response?.data?.error || err?.response?.data?.message || err.message));
    }
  }, [refreshPeople]);

  const handleDeleteTeam = useCallback(async (id) => {
    if (!id) return;
    if (!window.confirm('Delete this team?')) return;
    try {
      await api.delete(`/api/teams/${id}`);
      await refreshTeams();
    } catch (err) {
      alert('Delete failed: ' + (err?.response?.data?.error || err?.response?.data?.message || err.message));
    }
  }, [refreshTeams]);

  const fetchMaterialRequests = useCallback(async () => {
    try {
      const uid = getCurrentUserId();
      if (!uid) return;
      const res = await api.get(`/api/material-requests?clientId=${uid}`);
      setMaterialRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch material requests:', err);
    }
  }, [getCurrentUserId]);

  useEffect(() => {
    const fetchData = async () => {
      let userObj = null;
      let scopedProperties = [];
      let scopedPropertyIds = [];
      let scopedAssetIds = [];
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          userObj = JSON.parse(stored);
          setCurrentUser(userObj);
          setUserName(userObj.name || userObj.email || 'User');
        }
      } catch (e) {
        console.error('Error parsing user:', e);
      }

      const isRestricted = isRestrictedRole(userObj?.role);
      const userId = userObj?.id || userObj?._id || null;

      // Properties
      setLoading(l => ({ ...l, properties: true }));
      try {
        const res = await api.get('/api/properties');
        const propertiesData = dedupeById(res.data || [], p => p?._id || p?.id);
        scopedProperties = dedupeById(
          isRestricted ? filterPropertiesForUser(propertiesData, userId) : propertiesData,
          p => p?._id || p?.id
        );
        scopedPropertyIds = scopedProperties.map(p => p._id || p.id).filter(Boolean).map(String);
        setProperties(scopedProperties);

        if (isRestricted) {
          const [techResults, assetResults] = await Promise.all([
            Promise.allSettled(scopedPropertyIds.map(pid => api.get(`/api/internal-technicians?propertyId=${pid}`))),
            Promise.allSettled(scopedPropertyIds.map(pid => api.get(`/api/assets?propertyId=${pid}`))),
          ]);
          const techData = techResults.flatMap(r => r.status === 'fulfilled' && Array.isArray(r.value.data) ? r.value.data : []);
          const assetData = dedupeById(
            assetResults.flatMap(r => r.status === 'fulfilled' && Array.isArray(r.value.data) ? r.value.data : []),
            a => a?._id || a?.id
          );
          const scopedAssets = dedupeById(filterAssetsForUser(assetData, userId, scopedPropertyIds), a => a?._id || a?.id);
          scopedAssetIds = scopedAssets.map(a => a._id || a.id).filter(Boolean).map(String);
          setInternalTechnicians(filterTechsForUser(techData, userId, scopedPropertyIds));
          setAssets(scopedAssets);
        }
      } catch (err) {
        setErrors(e => ({ ...e, properties: err?.response?.data?.message || err.message }));
      } finally {
        setLoading(l => ({ ...l, properties: false }));
      }

      // Assets + Techs (non-client)
      if (!isRestricted) {
        setLoading(l => ({ ...l, assets: true }));
        try {
          const r = await api.get('/api/assets');
          const assetsData = dedupeById(r.data || [], a => a?._id || a?.id);
          scopedAssetIds = assetsData.map(a => a._id || a.id).filter(Boolean).map(String);
          setAssets(assetsData);
        } catch (err) {
          setErrors(e => ({ ...e, assets: err?.response?.data?.message || err.message }));
        } finally {
          setLoading(l => ({ ...l, assets: false }));
        }

        setLoading(l => ({ ...l, internalTechnicians: true }));
        try {
          const r = await api.get('/api/internal-technicians');
          setInternalTechnicians(r.data || []);
        } catch (err) {
          setErrors(e => ({ ...e, internalTechnicians: err?.response?.data?.message || err.message }));
        } finally {
          setLoading(l => ({ ...l, internalTechnicians: false }));
        }
      }

      // External technicians (managers/admins only)
      if (userObj?.role === 'manager' || userObj?.role === 'admin') {
        try {
          const ep = '/api/technicians/for-assignment';
          const r = await api.get(ep);
          setTechnicians(r.data || []);
        } catch {
          // Handle error silently
        }
      } else {
        setTechnicians([]);
      }

      // All registered users (for worker selection)
      await refreshPeople();

      // Schedules
      try {
        const r = await api.get('/api/maintenance-schedules');
        const scopedSchedules = isRestricted
          ? filterSchedulesForUser(r.data || [], userId, scopedPropertyIds, scopedAssetIds)
          : (r.data || []);
        setMaintenanceSchedules(scopedSchedules);
        const now = new Date();
        const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        setReminders(scopedSchedules.filter(s => s?.routine && s.nextDate && new Date(s.nextDate) <= cutoff && (!s.lastReminder || new Date(s.lastReminder) < new Date(s.nextDate))));
        const counts = { Preventive: 0, Routine: 0, Pending: 0, 'In Progress': 0, Completed: 0, Overdue: 0 };
        scopedSchedules.forEach(s => {
          if (!s) return;
          s.routine ? counts.Routine++ : counts.Preventive++;
          const st = (s.status || '').toLowerCase();
          if (st.includes('pending')) counts.Pending++;
          else if (st.includes('progress')) counts['In Progress']++;
          else if (st.includes('complete')) counts.Completed++;
          if (s.nextDate && new Date(s.nextDate) < now && !st.includes('complete')) counts.Overdue++;
        });
        setMaintenanceCounts(counts);
      } catch {
        // Handle error silently
      }

      // Issues
      await fetchIssues({ user: userObj, propertyIds: scopedPropertyIds, assetIds: scopedAssetIds });

      // Material Requests
      await fetchMaterialRequests();
    };

    fetchData();
  }, [fetchIssues, fetchMaterialRequests, filterAssetsForUser, filterPropertiesForUser, filterSchedulesForUser, filterTechsForUser, isRestrictedRole, refreshPeople]);

  // Issue actions
  const approveIssue = useCallback(async (id) => {
    try {
      await api.put(`/api/issues/${id}`, { status: 'IN PROGRESS', approved: true });
      await fetchIssues();
    } catch {
      alert('Failed to approve');
    }
  }, [fetchIssues]);

  const declineIssue = useCallback(async (id) => {
    try {
      await api.put(`/api/issues/${id}`, { status: 'REJECTED' });
      await fetchIssues();
    } catch {
      alert('Failed to decline');
    }
  }, [fetchIssues]);

  const resubmitIssue = useCallback(async (id) => {
    try {
      await api.post(`/api/issues/${id}/resubmit`);
      await fetchIssues();
    } catch {
      alert('Failed to resubmit');
    }
  }, [fetchIssues]);

  const assignInternal = useCallback(async (issueId, internalTechId, dueDate) => {
    if (!internalTechId) return;
    try {
      setAssignLoading(s => ({ ...s, [issueId]: true }));
      const payload = { internalTechId };
      if (dueDate) payload.dueDate = dueDate;
      await api.post(`/api/issues/${issueId}/assign-internal`, payload);
      await fetchIssues();
    } catch {
      alert('Failed to assign');
    } finally {
      setAssignLoading(s => ({ ...s, [issueId]: false }));
    }
  }, [fetchIssues]);

  const assignToTech = useCallback(async (issueId, techId) => {
    if (!techId) return;
    try {
      setAssignLoading(s => ({ ...s, [issueId]: true }));
      await api.post(`/api/issues/${issueId}/assign`, { techId });
      await fetchIssues();
    } catch {
      alert('Failed to assign');
    } finally {
      setAssignLoading(s => ({ ...s, [issueId]: false }));
    }
  }, [fetchIssues]);

  // Reminder actions
  const dismissOne = useCallback(async (id) => {
    try {
      await api.post(`/api/maintenance-schedules/${id}/dismiss`, { userId: getCurrentUserId() });
      setReminders(r => r.filter(x => (x._id || x.id) !== id));
      refreshSchedules();
    } catch {
      // Handle error silently
    }
  }, [getCurrentUserId, refreshSchedules]);

  const snoozeOne = useCallback(async (id) => {
    try {
      await api.post(`/api/maintenance-schedules/${id}/snooze`, { minutes: 60, userId: getCurrentUserId() });
      setReminders(r => r.filter(x => (x._id || x.id) !== id));
      refreshSchedules();
    } catch {
      // Handle error silently
    }
  }, [getCurrentUserId, refreshSchedules]);

  const dismissAll = useCallback(async () => {
    for (const s of reminders) {
      await dismissOne(s._id || s.id).catch(() => { });
    }
  }, [reminders, dismissOne]);

  const snoozeAll = useCallback(async () => {
    for (const s of reminders) {
      await snoozeOne(s._id || s.id).catch(() => { });
    }
  }, [reminders, snoozeOne]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }, [navigate]);

  const handleApproveMaterial = useCallback(async (id) => {
    try {
      await api.post(`/api/material-requests/${id}/respond`, { response: 'APPROVED' });
      await fetchMaterialRequests();
      alert('Request approved successfully!');
    } catch (err) {
      alert('Failed to approve request: ' + (err.response?.data?.error || err.message));
    }
  }, [fetchMaterialRequests]);

  const handleDeclineMaterial = useCallback(async (id) => {
    try {
      await api.post(`/api/material-requests/${id}/respond`, { response: 'DECLINED' });
      await fetchMaterialRequests();
      alert('Request declined.');
    } catch (err) {
      alert('Failed to decline request: ' + (err.response?.data?.error || err.message));
    }
  }, [fetchMaterialRequests]);

  const handleNewRequest = () => {
    setShowWorkOrderModal(true);
  };

  const exportIssuesPDF = useCallback(async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(16);
      doc.text('Issues Report', 14, 16);
      doc.setFontSize(11);
      if (!issues.length) {
        doc.text('No issues to export.', 14, y);
      } else {
        issues.forEach((issue, idx) => {
          doc.text(`${idx + 1}. ${issue.title || 'Untitled'}`, 14, y);
          y += 7;
          doc.text(`Status: ${issue.status || 'N/A'}  |  ${issue.location || ''}`, 14, y);
          y += 6;
          const split = doc.splitTextToSize(issue.description || '', 180);
          doc.text(split, 14, y);
          y += split.length * 6 + 8;
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });
      }
      doc.save('issues-report.pdf');
    } catch (err) {
      alert('PDF export failed: ' + err?.message);
    }
  }, [issues]);

  // Resolve property name from issue (fallback to lookup by id)
  const getPropertyName = useCallback((issue) => {
    if (!issue) return 'â€”';
    if (issue.property && (issue.property.name || issue.property.title)) return issue.property.name || issue.property.title;
    const pid = extractId(issue.propertyId) || (issue.property && (issue.property.id || issue.property._id));
    if (!pid) return 'â€”';
    const p = properties.find(pp => {
      const ids = [pp._id, pp.id].filter(Boolean).map(String);
      return ids.includes(String(pid));
    });
    return p ? (p.name || p.title || String(pid)) : String(pid);
  }, [properties]);

  // Resolve assigned technician name from issue (check assignedTo, technician, internal/ external lists)
  const getAssignedName = useCallback((issue) => {
    if (!issue) return 'â€”';
    if (issue.assignedTo && typeof issue.assignedTo === 'object' && (issue.assignedTo.name || issue.assignedTo.fullName)) return issue.assignedTo.name || issue.assignedTo.fullName;
    const aid = extractId(issue.assignedTo) || extractId(issue.technician) || (issue.assignedTo && String(issue.assignedTo));
    if (!aid) return 'â€”';
    // Look in internal technicians first
    let tech = internalTechnicians.find(t => [t._id, t.id, t.userId].filter(Boolean).map(String).includes(String(aid)));
    if (tech) return tech.name || tech.fullName || tech.email || String(aid);
    // Then external technicians
    tech = technicians.find(t => [t._id, t.id, t.userId].filter(Boolean).map(String).includes(String(aid)));
    if (tech) return tech.name || tech.fullName || tech.email || String(aid);
    // Fallback: if assignedTo is a string name already
    if (typeof issue.assignedTo === 'string' && issue.assignedTo.length && isNaN(Number(issue.assignedTo))) return issue.assignedTo;
    return String(aid);
  }, [internalTechnicians, technicians]);

  // Import assets from Excel (.xlsx/.xls)
  const handleImportAssetsFile = useCallback(async (file) => {
    if (!file) return;
    try {
      const { read, utils } = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = utils.sheet_to_json(sheet, { defval: '' });
      if (!rows.length) {
        alert('No rows found in spreadsheet.');
        return;
      }
      const created = [];
      const skipped = [];
      for (const r of rows) {
        const name = r.Name || r.Asset || r.AssetName;
        if (!name) {
          skipped.push(r);
          continue;
        }
        const locationName = r.Location || r.LocationName || r.Site || r.Property;
        const prop = properties.find(p => String(p.name).toLowerCase() === String(locationName || '').toLowerCase());
        if (!prop) {
          skipped.push(r);
          continue;
        }
        const payload = {
          name: String(name).trim(),
          type: r.Type || r.Category || '',
          description: r.Description || r.Notes || '',
          quantity: +r.Quantity || +r.Qty || 1,
          propertyId: prop.id || prop._id,
          building: r.Building || '',
          blocks: r.Blocks ? String(r.Blocks).split(/[;,|]/).map(s => s.trim()).filter(Boolean) : [],
          room: r.Room || r.RoomName || ''
        };
        try {
          await api.post('/api/assets', payload);
          created.push(payload);
        } catch {
          skipped.push(r);
        }
      }
      const r = await api.get('/api/assets');
      setAssets(r.data || []);
      alert(`Import finished. Created: ${created.length}, Skipped: ${skipped.length}`);
    } catch (err) {
      alert('Import failed: ' + (err?.message || err));
    }
  }, [properties]);

  // Assign modal
  const openAssignModal = useCallback((tech) => {
    const techPropId = tech.propertyId || (tech.property && (tech.property.id || tech.property._id));
    if (!techPropId) {
      alert('Technician is not linked to a property.');
      return;
    }
    const pending = allIssues.filter(i => {
      const pid = extractId(i.propertyId) || (i.property && (i.property.id || i.property._id));
      const st = (i.status || '').toUpperCase();
      return String(pid) === String(techPropId) && (st === 'PENDING' || st.includes('PROGRESS'));
    });
    setAssignableIssues(pending);
    setSelectedTechForAssign(tech);
    setSelectedIssueForAssign('');
    setAssignModalOpen(true);
  }, [allIssues]);

  const openIssueAssignModal = useCallback((issue) => {
    setSelectedIssueToAssign(issue);
    setSelectedInternalTechForIssue('');
    setIssueAssignModalOpen(true);
  }, []);

  const handleAssignSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedTechForAssign || !selectedIssueForAssign) return;
    try {
      await assignInternal(selectedIssueForAssign, selectedTechForAssign.id || selectedTechForAssign._id, selectedDueDate || undefined);
      setAssignModalOpen(false);
      setSelectedTechForAssign(null);
      setSelectedIssueForAssign('');
      setSelectedDueDate('');
      alert('Assigned successfully!');
    } catch {
      alert('Assignment failed.');
    }
  }, [selectedTechForAssign, selectedIssueForAssign, selectedDueDate, assignInternal]);

  const handleInvite = useCallback(async () => {
    const email = inviteEmailRef.current?.value?.trim();
    const role = inviteRoleRef.current?.value;
    const loc = inviteLocationRef.current?.value;

    if (!email) {
      alert('Enter an email');
      return;
    }

    try {
      if (role === 'internal') {
        await api.post('/api/internal-technicians/invite', { email, propertyId: loc || undefined });
        alert('Invitation sent (internal)');
      } else {
        await api.post('/api/technicians/invite', { email, categories: [] });
        alert('Invitation sent (external)');
      }
    } catch {
      alert('Invite failed');
    }
  }, []);

  // â”€â”€ Last 7 days chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - i));
    return issues.filter(it => {
      try {
        const d = new Date(it.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === day.getTime();
      } catch {
        return false;
      }
    }).length;
  });

  const dayLabels = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const locale = language === 'fr' ? 'fr' : language === 'rw' ? 'rw' : 'en';
    return d.toLocaleDateString(locale, { weekday: 'short' });
  });

  const combinedPending = (statusCounts.Pending || 0) + (maintenanceCounts.Pending || 0);
  const combinedInProgress = (statusCounts['In Progress'] || 0) + (maintenanceCounts['In Progress'] || 0);
  const combinedCompleted = (statusCounts.Completed || 0) + (maintenanceCounts.Completed || 0);
  const combinedOverdue = (statusCounts.Overdue || 0) + (maintenanceCounts.Overdue || 0);

  const isRejectedRequest = (issue) => {
    const st = String(issue?.status || '').toUpperCase();
    return st === 'REJECTED' || st === 'DECLINED';
  };

  const isApprovedWorkOrder = (issue) => {
    const st = String(issue?.status || '').toUpperCase();
    const hasWorkOrderRef = !!(issue?.workOrderId || issue?.workOrder || issue?.workOrderNumber || issue?.workOrderNo || issue?.workOrderCode || issue?.workOrderRef);
    return Boolean(issue?.approved) || hasWorkOrderRef || st === 'APPROVED' || st.includes('IN PROGRESS') || st.includes('COMPLETE');
  };

  const pendingRequests = allIssues.filter(issue => !isApprovedWorkOrder(issue) && !isRejectedRequest(issue));
  const workOrders = allIssues.filter(issue => isApprovedWorkOrder(issue));

  const selectedScheduleAssetIds = selectedSchedule ? (() => {
    const ids = new Set(parseIdList(selectedSchedule.assets));
    const directAssetId = extractId(selectedSchedule.assetId || selectedSchedule.asset);
    if (directAssetId) ids.add(String(directAssetId));
    return Array.from(ids);
  })() : [];

  const selectedScheduleAssets = selectedSchedule
    ? (selectedScheduleAssetIds.length
      ? assets.filter(a => selectedScheduleAssetIds.includes(String(extractId(a))))
      : [])
    : [];

  const selectedScheduleEmployeeIds = selectedSchedule ? parseIdList(selectedSchedule.employees) : [];
  const selectedScheduleAssignees = selectedSchedule ? (() => {
    const names = [];
    if (selectedSchedule.technician?.name) names.push(selectedSchedule.technician.name);
    selectedScheduleEmployeeIds.forEach((id) => {
      const tech = internalTechnicians.find(t => String(t._id || t.id) === String(id));
      if (tech?.name) names.push(tech.name);
    });
    return Array.from(new Set(names.filter(Boolean)));
  })() : [];

  const selectedScheduleWorkOrders = selectedSchedule ? allIssues.filter((issue) => {
    const issueAssetId = extractId(issue.assetId || issue.asset);
    const matchesAsset = issueAssetId && selectedScheduleAssetIds.includes(String(issueAssetId));
    const scheduleName = String(selectedSchedule.name || '').toLowerCase();
    const matchesName = scheduleName
      ? String(issue.title || '').toLowerCase().includes(scheduleName) || String(issue.description || '').toLowerCase().includes(scheduleName)
      : false;
    return matchesAsset || matchesName;
  }) : [];
  const selectedScheduleFrequency = selectedSchedule ? formatScheduleFrequency(selectedSchedule) : '';
  const selectedScheduleNextDate = selectedSchedule ? normalizeDate(selectedSchedule.nextDate || selectedSchedule.date) : null;
  const selectedScheduleStatus = selectedSchedule ? (selectedSchedule.status || 'Scheduled') : '';
  const selectedScheduleAssignedLabel = selectedScheduleAssignees.length ? selectedScheduleAssignees.join(', ') : 'Unassigned';

  const navItems = [
    { key: 'dashboard', label: t("manager.sidebar.dashboard"), icon: <Icon.Dashboard /> },
    { key: 'intelligence', label: t("manager.sidebar.intelligence"), icon: <Icon.Analytics /> },
    { key: 'studio', label: t("manager.sidebar.studio"), icon: <Icon.Templates /> },

    { key: 'workOrders', label: t("manager.sidebar.workOrders"), icon: <Icon.Requests />, group: 'core' },
    { key: 'preventiveMaintenance', label: t("manager.sidebar.preventiveMaintenance"), icon: <Icon.Templates />, group: 'core' },
    { key: 'scheduler', label: t("manager.sidebar.scheduler"), icon: <Icon.Clock />, group: 'core' },
    { key: 'requests', label: t("manager.sidebar.requests"), icon: <Icon.Requests />, group: 'core' },
    { key: 'materialRequests', label: t("manager.sidebar.materialRequests"), icon: <Icon.Package />, group: 'core' },
    { key: 'subscription', label: t("manager.sidebar.subscriptions"), icon: <Icon.Subscription />, group: 'core' },

    { key: 'analytics', label: t("manager.sidebar.analytics"), icon: <Icon.Analytics />, group: 'data' },
    { key: 'meters', label: t("manager.sidebar.meters"), icon: <Icon.Gauge />, group: 'data' },
    { key: 'edge', label: t("manager.sidebar.edge"), icon: <Icon.Edge />, group: 'data' },

    { key: 'assets', label: t("manager.sidebar.assets"), icon: <Icon.Assets />, group: 'resources' },
    { key: 'properties', label: t("manager.sidebar.locations"), icon: <Icon.Properties />, group: 'resources' },
    { key: 'internalTechnicians', label: t("manager.sidebar.peopleTeams"), icon: <Icon.Staff />, group: 'resources' },
    { key: 'maintenanceTemplates', label: t("manager.sidebar.checklists"), icon: <Icon.Templates />, group: 'resources' },
    { key: 'files', label: t("manager.sidebar.files"), icon: <Icon.Download />, group: 'resources' },

    { key: 'parts', label: t("manager.sidebar.partsInventory"), icon: <Icon.Package />, group: 'procurement' },
    { key: 'purchaseOrders', label: t("manager.sidebar.purchaseOrders"), icon: <Icon.ShoppingCart />, group: 'procurement' },
    { key: 'vendors', label: t("manager.sidebar.vendorsCustomers"), icon: <Icon.Vendors />, group: 'procurement' },
  ];

  const navSections = [
    { key: 'core', label: t("manager.sidebar.core") },
    { key: 'data', label: t("manager.sidebar.dataAnalytics") },
    { key: 'resources', label: t("manager.sidebar.resources") },
    { key: 'procurement', label: t("manager.sidebar.procurement") },
  ];

  return (
    <div className="glass-theme-blue min-h-screen text-white overflow-hidden relative" style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="video-background-container">
        <video autoPlay loop muted playsInline className="video-background text-transparent">
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      </div>
      <div className="relative z-10 flex min-h-screen">

      {/* â”€â”€ Sidebar â”€â”€ */}
      <aside className="glass-surface-strong border-r border-white/20 flex flex-col sticky top-0 h-screen overflow-y-auto shrink-0" style={{ width: 220 }}>
        {/* Logo */}
        <div style={{ padding: '24px 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{t("client.portalTitle")}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{t("client.portalSubtitle")}</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#1D4ED8', flexShrink: 0 }}>
              {(userName || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'capitalize' }}>{currentUser?.role || 'client'}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {t("language.label")}
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB', color: '#111827', background: 'white' }}
          >
            <option value="en">{t("language.english")}</option>
            <option value="fr">{t("language.french")}</option>
            <option value="rw">{t("language.kinyarwanda")}</option>
          </select>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {navItems.filter(n => !n.group).map(({ key, label, icon }) => (
            <NavItem key={key} label={label} icon={icon} active={activeTab === key} onClick={() => setActiveTab(key)} />
          ))}
          {navSections.map(section => (
            <div key={section.key}>
              <div style={{ marginTop: 12, marginBottom: 4, padding: '0 6px', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {section.label}
              </div>
              {navItems.filter(n => n.group === section.key).map(({ key, label, icon }) => (
                <NavItem key={key} label={label} icon={icon} active={activeTab === key} onClick={() => setActiveTab(key)} />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '10px', borderTop: '1px solid #F3F4F6' }}>
          <NavItem label={t("client.actions.exportPdf")} icon={<Icon.Export />} onClick={exportIssuesPDF} />
          <NavItem label={t("client.actions.importCsv")} icon={<Icon.Download />} onClick={() => importFileRef.current?.click()} />
          <input type="file" ref={importFileRef} accept=".csv" onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => {
              console.log('Import preview:', r.result?.slice(0, 2000));
              alert('Import complete (preview in console).');
            };
            r.readAsText(f);
          }} style={{ display: 'none' }} />
          <input type="file" ref={importAssetsRef} accept=".xlsx,.xls" onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            handleImportAssetsFile(f);
          }} style={{ display: 'none' }} />
          <NavItem label={t("client.actions.logout")} icon={<Icon.Logout />} onClick={handleLogout} danger />
        </div>
      </aside>

      {/* â”€â”€ Main â”€â”€ */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <header className="glass-surface border-b border-white/20 px-7 h-[60px] flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>
              {navItems.find(n => n.key === activeTab)?.label || t("manager.sidebar.dashboard")}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {reminders.length > 0 && (
              <button onClick={() => setShowReminderPanel(v => !v)} style={{ position: 'relative', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#92400E' }}>
                <Icon.Bell />
                <span>{reminders.length} Reminder{reminders.length > 1 ? 's' : ''}</span>
              </button>
            )}
            {/* New Request button moved to Requests tab */}
          </div>
        </header>

        {/* Reminder panel */}
        {reminders.length > 0 && showReminderPanel && (
          <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '12px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#92400E', fontSize: 13 }}>
                <Icon.Alert />
                {reminders.length} upcoming maintenance item{reminders.length > 1 ? 's' : ''} due within 24 hours
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn size="sm" variant="ghost" onClick={snoozeAll}>Snooze All 1h</Btn>
                <Btn size="sm" variant="ghost" onClick={dismissAll}>Dismiss All</Btn>
                <button onClick={() => setShowReminderPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 4 }}><Icon.X /></button>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {reminders.map(r => {
                const id = r._id || r.id;
                return (
                  <div key={id} style={{ background: 'white', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{r.name || r.title || 'Maintenance'}</span>
                    <span style={{ color: '#9CA3AF' }}>{r.nextDate ? new Date(r.nextDate).toLocaleDateString() : ''}</span>
                    <button onClick={() => snoozeOne(id)} style={{ fontSize: 11, background: '#FEF3C7', border: 'none', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', color: '#92400E', fontWeight: 600 }}>Snooze</button>
                    <button onClick={() => dismissOne(id)} style={{ fontSize: 11, background: '#F3F4F6', border: 'none', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', color: '#374151', fontWeight: 600 }}>Dismiss</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

          {/* â”€â”€ Dashboard â”€â”€ */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Welcome */}
              <div className="glass-surface-strong rounded-2xl p-8 mb-6 text-white flex items-center justify-between overflow-hidden relative shadow-2xl border border-white/20">
                <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'absolute', right: 40, bottom: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Welcome back, {userName.split(' ')[0]}!</h2>
                  <p style={{ margin: '6px 0 0', opacity: 0.8, fontSize: 14 }}>Here's your property activity overview.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, position: 'relative', flexShrink: 0 }}>
                  <Btn onClick={() => setActiveTab('requests')} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>View Requests</Btn>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <StatCard label="Pending" value={combinedPending} sub="Awaiting action" accent="amber" onClick={() => setActiveTab('requests')}
                  icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
                <StatCard label="In Progress" value={combinedInProgress} sub="Currently active" accent="blue" onClick={() => setActiveTab('workOrders')}
                  icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>} />
                <StatCard label="Completed" value={combinedCompleted} sub="Successfully resolved" accent="green" onClick={() => setActiveTab('workOrders')}
                  icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>} />
                <StatCard label="Overdue" value={combinedOverdue} sub="Requires attention" accent="red" onClick={() => setActiveTab('workOrders')}
                  icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>} />
              </div>

              {/* Charts + Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16, marginBottom: 28 }}>
                {/* Issues chart */}
                <div className="glass-surface rounded-2xl border border-white/10 p-6 shadow-lg">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Issues â€” Last 7 Days</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 2 }}>{last7.reduce((a, b) => a + b, 0)} total</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ fontSize: 11, padding: '3px 8px', background: '#EFF6FF', color: '#1D4ED8', borderRadius: 20, fontWeight: 600 }}>Issues</div>
                    </div>
                  </div>
                  {/* Bar chart */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 64, marginBottom: 6 }}>
                    {last7.map((v, i) => {
                      const max = Math.max(...last7, 1);
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                          <div title={`${v} issues`} style={{ width: '100%', background: 'linear-gradient(180deg, #3B82F6, #1D4ED8)', borderRadius: '4px 4px 0 0', height: `${Math.max(4, (v / max) * 100)}%`, minHeight: 4, transition: 'height 0.4s ease' }} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {dayLabels.map((d, i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#9CA3AF' }}>{d}</div>)}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="glass-surface-strong rounded-2xl border border-white/20 p-5 shadow-xl">
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Quick Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Btn onClick={() => setActiveTab('requests')} variant="outline" style={{ justifyContent: 'center', width: '100%' }}>All Requests</Btn>
                    <Btn onClick={exportIssuesPDF} variant="ghost" style={{ justifyContent: 'center', width: '100%' }}><Icon.Export /> {t("client.actions.exportPdf")}</Btn>
                    <Btn onClick={() => setActiveTab('maintenanceTemplates')} variant="ghost" style={{ justifyContent: 'center', width: '100%' }}>
                      <Icon.Templates /> Schedule Maintenance
                    </Btn>
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Portfolio</div>
                    {[{ label: 'Locations', value: properties.length }, { label: 'Assets', value: assets.length }, { label: 'Staff', value: internalTechnicians.length }].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                        <span style={{ color: '#6B7280' }}>{label}</span>
                        <span style={{ fontWeight: 700, color: '#111827' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent issues */}
              <SectionHeader title={t("client.sections.recentIssues")} count={issues.length}
                action={<button onClick={() => setActiveTab('requests')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1D4ED8', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>View all <Icon.ChevronRight /></button>} />

              {issues.length === 0 ? (
                <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl text-white/40 shadow-inner">
                  <div className="text-5xl mb-4 grayscale opacity-50">ðŸ“‹</div>
                  <div className="text-lg font-bold mb-1 text-white/50">No issues found</div>
                  <div className="text-sm">Submit a new request to get started</div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {issues.slice(0, 5).map(issue => {
                    const id = issue.id || issue._id;
                    return (
                      <div key={id} className={`glass-surface border ${issue.overdue ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/10'} rounded-2xl p-5 flex gap-5 transition-all hover:scale-[1.01] hover:shadow-xl group`}>
                        {/* Left accent */}
                        <div className={`w-1.5 rounded-full shadow-lg ${issue.overdue ? 'bg-rose-500 shadow-rose-500/40' : issue.status?.includes('PROGRESS') ? 'bg-blue-500 shadow-blue-500/40' : issue.status?.includes('COMPLETE') || issue.status === 'APPROVED' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-amber-500 shadow-amber-500/40'} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <div className="font-extrabold text-base text-white truncate group-hover:text-blue-300 transition-colors">{issue.title}</div>
                            <div className="flex items-center gap-3 shrink-0">
                              <StatusBadge status={issue.status} />
                              {issue.overdue && <span className="text-[10px] font-black uppercase tracking-tighter text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">Overdue</span>}
                            </div>
                          </div>
                          {issue.location && <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {renderValue(issue.location)}</div>}

                          {/* Project images */}
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                            {/* Original issue photo */}
                            {(issue.photo || issue.image) && !issue.beforeImage && (
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 }}>Issue</span>
                                <img src={imageSrc(issue.photo || issue.image)} alt="Issue" style={{ height: 100, width: 140, borderRadius: 8, border: '1px solid #E5E7EB', objectFit: 'cover' }} onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                              </div>
                            )}

                            {/* Before Image */}
                            {issue.beforeImage && (
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 }}>Before</span>
                                <img src={imageSrc(issue.beforeImage)} alt="Before" style={{ height: 100, width: 140, borderRadius: 8, border: '1px solid #E5E7EB', objectFit: 'cover' }} onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                              </div>
                            )}

                            {/* After Image */}
                            {issue.afterImage && (
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 }}>After</span>
                                <img src={imageSrc(issue.afterImage)} alt="After" style={{ height: 100, width: 140, borderRadius: 8, border: '1px solid #E5E7EB', objectFit: 'cover' }} onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          {Array.isArray(issue.tags) && issue.tags.filter(t => !['PENDING', 'IN PROGRESS', 'COMPLETE', 'OVERDUE'].includes(t?.label || t)).length > 0 && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                              {issue.tags.filter(t => !['PENDING', 'IN PROGRESS', 'COMPLETE', 'OVERDUE'].includes(t?.label || t)).map((tag, i) => {
                                const label = tag.label || tag;
                                return <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: label === 'URGENT' ? '#FEE2E2' : '#EFF6FF', color: label === 'URGENT' ? '#991B1B' : '#1D4ED8', border: `1px solid ${label === 'URGENT' ? '#FECACA' : '#BFDBFE'}` }}>{label}</span>;
                              })}
                            </div>
                          )}

                          {/* Assignees */}
                          {Array.isArray(issue.assignees) && issue.assignees.length > 0 && (
                            <div style={{ fontSize: 12, color: '#059669', fontWeight: 500, marginBottom: 8 }}>
                              ðŸ‘¤ {issue.assignees.map(a => a.name || 'Unknown').join(', ')}
                            </div>
                          )}

                          {/* Progress */}
                          <div style={{ marginTop: 6, marginBottom: 10 }}>
                            <ProgressBar status={issue.status || 'PENDING'} />
                          </div>

                          {/* Client actions */}
                          {issue.status === 'PENDING' && currentUser?.role === 'client' && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              <Btn size="sm" variant="success" onClick={() => approveIssue(id)}><Icon.Check /> Accept</Btn>
                              <Btn size="sm" variant="danger" onClick={() => declineIssue(id)}><Icon.X /> Decline</Btn>
                              <Btn size="sm" variant="ghost" onClick={() => resubmitIssue(id)}>Resubmit</Btn>
                            </div>
                          )}

                          {/* Manager/Client internal assign */}
                          {(currentUser?.role === 'manager' || currentUser?.role === 'admin' || currentUser?.role === 'client' || currentUser?.role === 'requestor') && internalTechnicians.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                              <Select style={{ flex: 1, fontSize: 12, padding: '5px 8px' }} value={(selectedTechs[id]?.internal) || ''} onChange={e => setSelectedTechs(s => ({ ...s, [id]: { ...s[id], internal: e.target.value } }))}>
                                <option value="">Assign internal technicianâ€¦</option>
                                {internalTechnicians.map((t, i) => <option key={`${t.id || t._id || 'internal'}-${i}`} value={t.id || t._id}>{t.name}{t.email ? ` (${t.email})` : ''}</option>)}
                              </Select>
                              <Btn size="sm" variant="primary" disabled={!selectedTechs[id]?.internal || assignLoading[id]} onClick={() => assignInternal(id, selectedTechs[id]?.internal)}>
                                {assignLoading[id] ? 'â€¦' : 'Assign'}
                              </Btn>
                            </div>
                          )}

                          {/* Manager external assign */}
                          {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && technicians.length > 0 && (issue.status === 'APPROVED' || String(issue.status || '').toUpperCase().includes('PROGRESS')) && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                              <Select style={{ flex: 1, fontSize: 12, padding: '5px 8px' }} value={(selectedTechs[id]?.external) || ''} onChange={e => setSelectedTechs(s => ({ ...s, [id]: { ...s[id], external: e.target.value } }))}>
                                <option value="">Assign technicianâ€¦</option>
                                {technicians.map((t, i) => <option key={`${t.id || t._id || 'tech'}-${i}`} value={t.id || t._id}>{t.name}{t.email ? ` (${t.email})` : ''}</option>)}
                              </Select>
                              <Btn size="sm" variant="primary" disabled={!selectedTechs[id]?.external || assignLoading[id]} onClick={() => assignToTech(id, selectedTechs[id]?.external)}>
                                {assignLoading[id] ? 'â€¦' : 'Assign'}
                              </Btn>
                            </div>
                          )}
                        </div>

                        <div style={{ flexShrink: 0, textAlign: 'right', fontSize: 12, color: '#9CA3AF', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, paddingTop: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon.Clock />{issue.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'intelligence' && (
            <PlaceholderPanel
              title={t("manager.sidebar.intelligence")}
              description="AI-driven insights and automation tools will appear here soon."
            />
          )}

          {activeTab === 'studio' && (
            <PlaceholderPanel
              title={t("manager.sidebar.studio")}
              description="Build custom workflows, forms, and automations here."
            />
          )}

          {activeTab === 'scheduler' && (
            <PlaceholderPanel
              title={t("manager.sidebar.scheduler")}
              description="Scheduling and calendar views will be available here."
            />
          )}

          {activeTab === 'files' && (
            <PlaceholderPanel
              title={t("manager.sidebar.files")}
              description="Centralized files and documents will show here."
            />
          )}

          {activeTab === 'vendors' && <ClientVendorsTab />}

          {/* â”€â”€ Work Orders â”€â”€ */}
          {activeTab === 'workOrders' && (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Orders</h2>
                    <p className="text-gray-600">View and manage approved work orders</p>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <span className="text-blue-700 font-semibold">{workOrders.length} total</span>
                  </div>
                </div>
              </div>

              {workOrders.length === 0 ? (
                <div className="glass-surface rounded-xl p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-xl">
                    <Icon.Requests />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Work Orders</h3>
                  <p className="text-gray-600">Approved work orders will appear here.</p>
                </div>
              ) : (
                <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
                  <div className="overflow-x-auto">
                    <table className="min-w-[1000px] w-full text-left border-collapse text-sm">
                      <thead className="glass-surface border-b border-white/10 text-[11px] uppercase tracking-wider text-gray-500">
                        <tr>
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Image</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Assigned</th>
                          <th className="py-3 px-4">Due Date</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workOrders.map((issue, i) => {
                          const due = normalizeDate(issue.fixDeadline || issue.dueDate || issue.nextDate);
                          const isOverdue = due && due < new Date();
                          const imgSrc = imageSrc(issue.photo || issue.image || issue.beforePhoto);
                          return (
                            <tr
                              key={issue._id || issue.id || `workorder-${i}`}
                              onClick={() => setModalData({ open: true, type: 'issue', item: issue })}
                              className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors cursor-pointer"
                            >
                              <td className="py-4 px-4">
                                <div className="font-medium text-gray-900">{issue.title || 'Untitled'}</div>
                                <div className="text-sm text-gray-600 truncate max-w-xs">{issue.description || 'No description provided.'}</div>
                              </td>
                              <td className="py-4 px-4">
                                {imgSrc ? (
                                  <img
                                    src={imgSrc}
                                    alt={issue.title || 'Issue'}
                                    className="w-12 h-12 rounded object-cover border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs text-center border border-gray-200">
                                    No img
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <StatusBadge status={issue.status} />
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm font-medium text-gray-900">{getAssignedName(issue)}</div>
                              </td>
                              <td className="py-4 px-4">
                                <div className={`text-sm font-medium ${isOverdue ? 'text-rose-600' : 'text-gray-900'}`}>
                                  {due ? due.toLocaleDateString() : 'Not set'}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <PriorityBadge priority={issue.priority || 'MEDIUM'} />
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <button onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                                    <Eye className="w-4 h-4 text-blue-600" />
                                  </button>
                                  <button onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                                    <Edit className="w-4 h-4 text-green-600" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* â”€â”€ Requests â”€â”€ */}
          {activeTab === 'requests' && (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Approval Requests</h2>
                    <p className="text-gray-600">Review and approve client maintenance requests</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleNewRequest}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700"
                    >
                      Submit Request
                    </button>
                    <div className="px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                      <span className="text-orange-700 font-semibold">{pendingRequests.length} pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="glass-surface rounded-xl p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">All Clear!</h3>
                  <p className="text-gray-600 mb-6">No pending requests to review</p>
                </div>
              ) : (
                <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
                  <div className="overflow-x-auto">
                    <table className="min-w-[1200px] w-full text-left border-collapse text-sm">
                      <thead className="glass-surface border-b border-white/10 text-[11px] uppercase tracking-wider text-gray-500">
                        <tr>
                          <th className="py-3 px-3">Title</th>
                          <th className="py-3 px-3">Image</th>
                          <th className="py-3 px-3">Asset</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3">Work Order</th>
                          <th className="py-3 px-3">Submitted Date</th>
                          <th className="py-3 px-3">Category</th>
                          <th className="py-3 px-3">Submitted By</th>
                          <th className="py-3 px-3 text-right">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pendingRequests.map((request, i) => {
                          const reqId = request._id || request.id || `pending-${i}`;
                          const title = request.title || request.items?.[0]?.title || 'Untitled';
                          const imagePath = request.beforePhoto || request.photo || request.image || request.beforeImage || request.afterImage || request.afterPhoto || (Array.isArray(request.files) ? request.files[0] : null);
                          const imageUrl = imageSrc(imagePath);
                          const asset = renderValue(request.assetName || request.asset?.name || request.asset || request.location || getPropertyName(request) || 'N/A');
                          const rawStatus = String(request.status || '').toUpperCase();
                          const isDeclined = request.rejected || rawStatus === 'DECLINED' || rawStatus === 'REJECTED';
                          const isInProgress = rawStatus === 'IN PROGRESS' || rawStatus === 'IN_PROGRESS' || rawStatus.includes('IN PROGRESS');
                          const isApproved = request.approved || rawStatus === 'APPROVED' || isInProgress;
                          const rawWorkOrderStatus = request.workOrderStatus || request.workOrder?.status || request.workOrderState || request.issueStatus || request.workOrderStatusLabel || '';
                          const normalizedWorkOrder = String(rawWorkOrderStatus || '').toUpperCase();
                          const workOrderLabel = normalizedWorkOrder.includes('PROGRESS') ? 'IN PROGRESS'
                            : normalizedWorkOrder.includes('COMPLETE') ? 'COMPLETED'
                              : normalizedWorkOrder.includes('OPEN') ? 'OPEN'
                                : (isDeclined ? 'N/A' : 'OPEN');
                          const hasWorkOrderRef = !!(request.workOrderId || request.workOrderNumber || request.workOrderNo || request.workOrder);
                          const statusLabel = isDeclined
                            ? 'DECLINED'
                            : isInProgress
                              ? 'IN PROGRESS'
                              : (isApproved || hasWorkOrderRef)
                                ? 'APPROVED'
                                : 'SUBMITTED';
                          const submittedAt = request.createdAt || request.submittedAt || request.date || null;
                          const submittedBy = request.name || request.requestorName || request.userName || request.email || 'N/A';
                          const category = request.category || request.issueType || request.type || request.submissionType || 'N/A';
                          const workOrderClass = workOrderLabel === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : workOrderLabel === 'IN PROGRESS'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : workOrderLabel === 'OPEN'
                                ? 'bg-slate-100 text-slate-700 border-slate-200'
                                : 'bg-gray-50 text-gray-400 border-gray-200';

                          return (
                            <tr
                              key={reqId}
                              onClick={() => setModalData({ open: true, type: 'request', item: request })}
                              className="hover:bg-white/40 transition-all cursor-pointer group/row"
                            >
                              <td className="py-3 px-3">
                                <div className="font-semibold text-gray-800 line-clamp-1" title={title}>{title}</div>
                              </td>
                              <td className="py-3 px-3">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt="Request"
                                    className="h-9 w-12 rounded-lg object-cover border border-gray-100"
                                    onError={e => { e.currentTarget.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="h-9 w-12 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                                    N/A
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 text-gray-700">{asset}</td>
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${requestStatusColor(statusLabel)}`}>
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${workOrderClass}`}>
                                  {workOrderLabel}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-gray-600">
                                {submittedAt && !Number.isNaN(new Date(submittedAt).getTime()) ? (
                                  <div>
                                    <div className="text-xs font-semibold text-gray-700">
                                      {new Date(submittedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                      {new Date(submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                ) : 'N/A'}
                              </td>
                              <td className="py-3 px-3 text-gray-700">{category}</td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-600 flex items-center justify-center">
                                    {String(submittedBy).trim().charAt(0).toUpperCase()}
                                  </span>
                                  <span className="text-gray-700 text-xs line-clamp-1" title={submittedBy}>{submittedBy}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <PriorityBadge priority={request.priority || 'MEDIUM'} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* â”€â”€ Material Requests â”€â”€ */}
          {activeTab === 'materialRequests' && (
            <div className="flex flex-col gap-6">
              <SectionHeader
                title="Material Requests"
                count={materialRequests.length}
                action={<Btn onClick={fetchMaterialRequests} variant="outline" size="sm">Refresh</Btn>}
              />
              {materialRequests.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: 60, textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>ðŸ“¦</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>No Material Requests Found</div>
                  <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>Any material requests forwarded to you for approval will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {materialRequests.map((req, idx) => {
                    const reqId = req.id || req._id;
                    const items = req.items || [];
                    const firstItem = items[0] || {};
                    const isPending = req.status === 'FORWARDED' || req.status === 'PENDING';
                    return (
                      <div key={reqId || idx} className="glass-surface rounded-2xl hover:shadow-md transition-all overflow-hidden flex flex-col">
                        <div className="p-5 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">
                              #{String(reqId).slice(-6).toUpperCase()}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              req.status === 'DECLINED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                              {req.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-base mb-1">
                            {firstItem.title || firstItem.materialId || 'Material Request'}
                            {items.length > 1 && <span className="text-gray-400 font-medium ml-1">+{items.length - 1} more</span>}
                          </h4>
                          <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-gray-500">
                            <Icon.User style={{ width: 14, height: 14 }} />
                            <span>Requested by: {req.technicianName || 'Technician'}</span>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Details</span>
                              <span className="text-[10px] font-black glass-ghost px-2 py-0.5 rounded shadow-sm">
                                Qty: {firstItem.quantity || req.quantity || 1}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed italic line-clamp-3">
                              "{req.description || 'No description provided'}"
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-gray-400 font-bold border-t border-gray-50 pt-3 mt-3">
                            <div className="flex items-center gap-1.5">
                              <Icon.Clock style={{ width: 12, height: 12 }} />
                              {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'â€”'}
                            </div>
                            <div className="flex items-center gap-1.5 ml-auto">
                              <Icon.Alert style={{ width: 12, height: 12 }} />
                              Urgency: <span className={req.urgency === 'URGENT' ? 'text-rose-500' : 'text-amber-500'}>{req.urgency || 'MEDIUM'}</span>
                            </div>
                          </div>
                        </div>
                        {isPending && (
                          <div className="p-3 bg-gray-50/50 border-t border-gray-50 flex gap-2">
                            <button onClick={() => handleApproveMaterial(reqId)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-colors shadow-sm">Approve</button>
                            <button onClick={() => handleDeclineMaterial(reqId)} className="flex-1 glass-ghost hover:bg-rose-50 text-slate-700 hover:text-rose-600 py-2 rounded-xl text-xs font-bold transition-all">Decline</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* â”€â”€ Subscription â”€â”€ */}
          {activeTab === 'subscription' && (
            <div style={{ padding: '24px' }}>
              {(currentUser?.role === 'admin' || currentUser?.role === 'manager') ? (
                <SubscriptionManagement />
              ) : (
                <SubscriptionWidget userId={currentUser?._id || currentUser?.id} />
              )}
            </div>
          )}

          {/* â”€â”€ Properties â”€â”€ */}
          {activeTab === 'properties' && (
            <div>
              <SectionHeader title={t("client.sections.locations")} count={properties.length}
                action={!editingProperty && <Btn onClick={() => setEditingProperty({})} variant="primary" size="sm"><Icon.Plus /> {t("client.actions.addLocations")}</Btn>} />

              {loading.properties && <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loadingâ€¦</div>}
              {errors.properties && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 14, marginBottom: 16, color: '#991B1B', fontSize: 13 }}>Error: {errors.properties}</div>}

              {/* Form */}
              {editingProperty !== null && (
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24, marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 16 }}>{editingProperty._id || editingProperty.id ? t("client.actions.editLocation") : t("client.actions.newLocation")}</div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const userId = getCurrentUserId();
                      const payload = {
                        ...propertyForm,
                        beds: propertyForm.beds ? +propertyForm.beds : undefined,
                        baths: propertyForm.baths ? +propertyForm.baths : undefined,
                        area: propertyForm.area ? +propertyForm.area : undefined,
                        floors: propertyForm.floors ? +propertyForm.floors : undefined,
                        rooms: propertyForm.rooms ? +propertyForm.rooms : undefined,
                        clientId: userId,
                        userId
                      };
                      if (propertyUseNamedBlocks) {
                        payload.blocks = (propertyForm.namedBlocks || []).join(',');
                        payload.blocksModifiable = true;
                      } else {
                        payload.blocks = propertyForm.blocks ? +propertyForm.blocks : undefined;
                        payload.blocksModifiable = false;
                      }
                      if (propertyForm.roomNames && Array.isArray(propertyForm.roomNames)) payload.roomNames = propertyForm.roomNames.join(',');
                      const eid = editingProperty._id || editingProperty.id;
                      if (eid) {
                        await api.put(`/api/properties/${eid}`, payload);
                      } else {
                        const r = await api.post('/api/properties', payload);
                        if (propertyFiles?.length) {
                          const fd = new FormData();
                          Array.from(propertyFiles).forEach(f => fd.append('photos', f));
                          await api.post(`/api/properties/${r.data.id || r.data._id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => { });
                        }
                      }
                      if (eid && propertyFiles?.length) {
                        const fd = new FormData();
                        Array.from(propertyFiles).forEach(f => fd.append('photos', f));
                        await api.post(`/api/properties/${eid}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => { });
                      }
                      setEditingProperty(null);
                      setPropertyFiles(null);
                      setPropertyForm({ 
                        name: '', type: '', address: '', block: '', hierarchy: '', beds: '', baths: '', area: '', floors: '', blocks: '', rooms: '', namedBlocks: [], roomNames: [],
                        latitude: '', longitude: '', includeMapCoordinates: false,
                        parentPropertyId: '', assignedWorkers: [], assignedTeam: '',
                        vendors: [], customers: [],
                        customData: []
                      });
                      const res = await api.get('/api/properties');
                      setProperties(res.data || []);
                    } catch {
                      alert('Failed to save property.');
                    }
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                      {[['Location Name', 'name', 'text', true], ['Type', 'type', 'text', true], ['Address', 'address', 'text', true], ['Beds', 'beds', 'number'], ['Baths', 'baths', 'number'], ['Area (sqft)', 'area', 'number'], ['Floors', 'floors', 'number'], ['Blocks', 'blocks', 'number'], ['Rooms', 'rooms', 'number']].map(([ph, field, type, req]) => (
                        <div key={field}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ph}</label>
                          <Input placeholder={ph} type={type} value={propertyForm[field]} onChange={e => setPropertyForm(f => ({ ...f, [field]: e.target.value }))} required={req} />
                        </div>
                      ))}
                      <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Room Names (comma separated)</label>
                        <textarea value={(propertyForm.roomNames || []).join(', ')} onChange={e => setPropertyForm(f => ({ ...f, roomNames: String(e.target.value).split(/[;,|]/).map(s => s.trim()).filter(Boolean) }))} style={{ width: '100%', minHeight: 64, padding: 8, borderRadius: 8, border: '1px solid #D1D5DB', fontFamily: 'inherit' }} />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Photos</label>
                      <div onClick={() => document.getElementById('property-photos-input')?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); setPropertyFiles(e.dataTransfer.files); }} style={{ border: '2px dashed #D1D5DB', borderRadius: 8, padding: 16, textAlign: 'center', cursor: 'pointer', background: '#F9FAFB' }}>
                        {propertyFiles?.length ? (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {Array.from(propertyFiles).slice(0, 6).map((f, i) => <img key={i} src={URL.createObjectURL(f)} alt="" style={{ height: 72, width: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid #E5E7EB' }} />)}
                          </div>
                        ) : <div style={{ fontSize: 13, color: '#9CA3AF' }}>Click or drag to upload photos</div>}
                      </div>
                      <input id="property-photos-input" type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => setPropertyFiles(e.target.files)} />
                    </div>

                    {editingProperty && (
                      (() => {
                        const eid = editingProperty._id || editingProperty.id;
                        const blockDisplay = propertyForm.block
                          || editingProperty.block
                          || (Array.isArray(editingProperty.blocks) && editingProperty.blocks[0])
                          || editingProperty.blocks
                          || '-';
                        const hierarchyDisplay = propertyForm.hierarchy
                          || editingProperty.hierarchy
                          || editingProperty.parentName
                          || editingProperty.name
                          || propertyForm.name
                          || '-';
                        const workerCount = internalTechnicians.filter(t => String(t.propertyId || t.property?._id || t.property?.id) === String(eid)).length || '—';
                        const counts = {
                          assets: assets.filter(a => String(a.propertyId || a.property?._id || a.property?.id) === String(eid)).length || 0,
                          workOrders: issues.filter(i => String(i.propertyId || i.property?._id || i.property?.id) === String(eid)).length || 0,
                          blocks: Array.isArray(editingProperty.blocks) ? editingProperty.blocks.length : (editingProperty.blocks ? 1 : 0),
                          rooms: Array.isArray(editingProperty.roomNames) ? editingProperty.roomNames.length : (editingProperty.rooms || 0),
                        };
                        return (
                          <div style={{ gridColumn: '1 / -1', marginTop: 8, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.06em' }}>Building</div>
                              <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{blockDisplay}</div>
                              <div style={{ marginTop: 4, fontSize: 13, color: '#4B5563' }}>Hierarchy: {hierarchyDisplay}</div>
                            </div>

                            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>More Information</div>
                              {[
                                ['Workers', workerCount],
                                ['Teams', '—'],
                                ['Vendors', '—'],
                                ['Customers', '—'],
                                ['Hierarchy', hierarchyDisplay],
                              ].map(([label, value]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB' }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: '#4B5563' }}>{label}</span>
                                  <span style={{ fontSize: 13, color: '#111827' }}>{value || '—'}</span>
                                </div>
                              ))}
                            </div>

                        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Counts</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                            {[
                              ['Assets', counts.assets],
                              ['Work Orders', counts.workOrders],
                              ['Blocks', counts.blocks],
                              ['Rooms', counts.rooms],
                            ].map(([label, value]) => (
                              <div key={label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.05em' }}>{label}</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{value ?? '—'}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Current Entry</div>
                          {[
                            ['Location Name', propertyForm.name || '—'],
                            ['Type', propertyForm.type || '—'],
                            ['Address', propertyForm.address || '—'],
                            ['Beds', propertyForm.beds || '—'],
                            ['Baths', propertyForm.baths || '—'],
                            ['Area (sqft)', propertyForm.area || '—'],
                            ['Floors', propertyForm.floors || '—'],
                            ['Blocks', propertyForm.blocks || '—'],
                            ['Rooms', propertyForm.rooms || '—'],
                            ['Room Names', (propertyForm.roomNames || []).join(', ') || '—'],
                            ['Photos', propertyFiles?.length ? `${propertyFiles.length} selected` : '0'],
                          ].map(([label, value]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB' }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#4B5563' }}>{label}</span>
                              <span style={{ fontSize: 13, color: '#111827' }}>{value}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Other Details</div>
                          {[
                            ['Type', propertyForm.type || editingProperty.type || '—'],
                            ['Address', propertyForm.address || editingProperty.address || '—'],
                            ['Parent/Hierarchy', propertyForm.hierarchy || editingProperty.hierarchy || editingProperty.parentName || '—'],
                            ['Latitude', propertyForm.latitude || editingProperty.latitude || '—'],
                            ['Longitude', propertyForm.longitude || editingProperty.longitude || '—'],
                          ].map(([label, value]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB' }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#4B5563' }}>{label}</span>
                              <span style={{ fontSize: 13, color: '#111827' }}>{value || '—'}</span>
                            </div>
                          ))}
                        </div>

                      </div>
                        );
                      })()
                    )}

                  </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      <Btn type="submit" variant="primary">Save Property</Btn>
                      <Btn onClick={() => {
                        setEditingProperty(null);
                        setPropertyFiles(null);
                        setPropertyForm({ 
                        name: '', type: '', address: '', block: '', hierarchy: '', beds: '', baths: '', area: '', floors: '', blocks: '', rooms: '', namedBlocks: [], roomNames: [],
                        latitude: '', longitude: '', includeMapCoordinates: false,
                        parentPropertyId: '', assignedWorkers: [], assignedTeam: '',
                        vendors: [], customers: [],
                        customData: []
                      });
                      }} variant="ghost">Cancel</Btn>
                    </div>
                  </form>
                </div>
              )}

                            <Table
                heads={['Name', 'Type', 'Address', 'Beds', 'Baths', 'Area', 'Actions']}
                empty="No properties yet. Add your first one."
                rows={properties.map(p => {
                  const isActive = selectedProperty && String(selectedProperty._id || selectedProperty.id) === String(p._id || p.id);
                  return {
                    key: p._id || p.id || p.name,
                    onClick: () => { setSelectedProperty(p); setPropertyModalOpen(true); },
                    className: isActive ? 'bg-white/10' : '',
                    cells: [
                      <Td key="n"><span style={{ fontWeight: 600 }}>{p.name}</span></Td>,
                      <Td key="t"><span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{p.type}</span></Td>,
                      <Td key="a">{p.address}</Td>,
                      <Td key="b">{p.beds ?? '�'}</Td>,
                      <Td key="ba">{p.baths ?? '�'}</Td>,
                      <Td key="ar">{p.area ?? p.sqft ?? '�'}</Td>,
                      <Td key="x">
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Btn size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation();
                            const named = Array.isArray(p.blocks) || (p.blocks && isNaN(parseInt(String(p.blocks))));
                            setEditingProperty(p);
                            setPropertyUseNamedBlocks(!!named);
                            setPropertyForm({
                              name: p.name || '',
                              type: p.type || '',
                              address: p.address || '',
                              beds: p.beds || '',
                              baths: p.baths || '',
                              area: p.area || '',
                              floors: p.floors || '',
                              blocks: !named ? (p.blocks || '') : '',
                              namedBlocks: named ? (Array.isArray(p.blocks) ? p.blocks : String(p.blocks).split(/[;,|]/).map(s => s.trim()).filter(Boolean)) : [],
                              rooms: p.rooms || '',
                              roomNames: Array.isArray(p.roomNames) ? p.roomNames : (p.roomNames ? String(p.roomNames).split(/[;,|]/).map(s => s.trim()).filter(Boolean) : [])
                            });
                          }}>Edit</Btn>
                          <Btn size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedProperty(p); setPropertyModalOpen(true); }}>View</Btn>
                          <Btn size="sm" variant="danger" onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete property?')) {
                              try {
                                await api.delete(`/api/properties/${p._id || p.id}`);
                                const r = await api.get('/api/properties');
                                setProperties(r.data || []);
                              } catch {
                                alert('Delete failed');
                              }
                            }
                          }}>Delete</Btn>
                        </div>
                      </Td>,
                    ]
                  };
                })}
              />

              {/* Property Detail Modal */}
              {propertyModalOpen && selectedProperty && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
                    <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500">Details</p>
                        <h3 className="text-2xl font-bold text-gray-900">{selectedProperty.name || 'Location'}</h3>
                    <p className="text-sm font-semibold text-gray-700 mt-1">
                      {selectedProperty.block
                        || (Array.isArray(selectedProperty.blocks) && selectedProperty.blocks[0])
                        || selectedProperty.blocks
                        || 'Building —'}
                    </p>
                    <p className="mt-1 flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>{selectedProperty.address || 'No address provided.'}</span>
                    </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                          {selectedProperty.type || 'Location'}
                        </span>
                        <button
                          onClick={() => setPropertyModalOpen(false)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500"
                          aria-label="Close property details"
                        >
                          <Icon.X />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 space-y-5 overflow-y-auto">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-[0.08em]">Building</div>
                        <div className="text-lg font-bold text-gray-900">
                          {selectedProperty.block
                            || (Array.isArray(selectedProperty.blocks) && selectedProperty.blocks[0])
                            || selectedProperty.blocks
                            || selectedProperty.address
                            || '-'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Hierarchy: {selectedProperty.hierarchy || selectedProperty.parentName || selectedProperty.name || '-'}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <div className="text-sm font-bold text-gray-700 mb-3">More Information</div>
                          {[
                            ['Workers', internalTechnicians.filter(t => String(t.propertyId || t.property?._id || t.property?.id) === String(selectedProperty._id || selectedProperty.id)).length || '—'],
                            ['Teams', '—'],
                            ['Vendors', '—'],
                            ['Customers', '—'],
                            ['Hierarchy', selectedProperty.hierarchy || selectedProperty.parentName || selectedProperty.name || '—'],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                              <span className="text-sm font-semibold text-gray-600">{label}</span>
                              <span className="text-sm text-gray-900">{value || '—'}</span>
                            </div>
                          ))}
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <div className="text-sm font-bold text-gray-700 mb-3">Counts</div>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              ['Assets', assets.filter(a => String(a.propertyId || a.property?._id || a.property?.id) === String(selectedProperty._id || selectedProperty.id)).length],
                              ['Work Orders', issues.filter(i => String(i.propertyId || i.property?._id || i.property?.id) === String(selectedProperty._id || selectedProperty.id)).length],
                              ['Blocks', Array.isArray(selectedProperty.blocks) ? selectedProperty.blocks.length : (selectedProperty.blocks ? 1 : 0)],
                              ['Rooms', Array.isArray(selectedProperty.roomNames) ? selectedProperty.roomNames.length : (selectedProperty.rooms || 0)],
                            ].map(([label, value]) => (
                              <div key={label} className="rounded-lg bg-white border border-gray-200 px-3 py-2">
                                <div className="text-[11px] font-bold uppercase text-gray-500 tracking-[0.08em]">{label}</div>
                                <div className="text-lg font-black text-gray-900">{value ?? '-'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="text-sm font-bold text-gray-700 mb-3">Location Details</div>
                        {[
                          ['Location Name', selectedProperty.name || '—'],
                          ['Type', selectedProperty.type || '—'],
                          ['Address', selectedProperty.address || '—'],
                          ['Beds', selectedProperty.beds],
                          ['Baths', selectedProperty.baths],
                          ['Area (sqft)', selectedProperty.area ?? selectedProperty.sqft],
                          ['Floors', selectedProperty.floors],
                          ['Blocks', renderValue(selectedProperty.blocks, '—')],
                          ['Rooms', selectedProperty.rooms ?? (Array.isArray(selectedProperty.roomNames) ? selectedProperty.roomNames.length : undefined)],
                          ['Room Names (comma separated)', renderValue(Array.isArray(selectedProperty.roomNames) ? selectedProperty.roomNames : (selectedProperty.roomNames ? String(selectedProperty.roomNames).split(/[;,|]/).map(s => s.trim()).filter(Boolean) : []), '—')],
                          ['Photos', Array.isArray(selectedProperty.photos) ? selectedProperty.photos.length : (selectedProperty.photos ? 1 : 0)],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <span className="text-sm font-semibold text-gray-600">{label}</span>
                            <span className="text-sm text-gray-900">{(value === '' || value === null || value === undefined) ? '—' : value}</span>
                          </div>
                        ))}

                        {Array.isArray(selectedProperty.photos) && selectedProperty.photos.length > 0 && (
                          <div className="mt-4">
                            <div className="text-[11px] font-bold uppercase text-gray-500 tracking-[0.08em] mb-2">Photos</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {selectedProperty.photos.map((p, idx) => {
                                const src = getImageUrl(p);
                                if (!src) return null;
                                return (
                                  <a
                                    key={`${p}-${idx}`}
                                    href={src}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block"
                                    title="Open photo"
                                  >
                                    <img
                                      src={src}
                                      alt={`Location photo ${idx + 1}`}
                                      className="w-full h-28 object-cover rounded-lg border border-gray-200"
                                    />
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="text-sm font-bold text-gray-700 mb-3">Other Details</div>
                        {[
                          ['Type', selectedProperty.type || '—'],
                          ['Address', selectedProperty.address || '—'],
                          ['Parent', selectedProperty.parentName || selectedProperty.hierarchy || '—'],
                          ['Latitude', selectedProperty.latitude ?? '—'],
                          ['Longitude', selectedProperty.longitude ?? '—'],
                          ['Created At', selectedProperty.createdAt ? new Date(selectedProperty.createdAt).toLocaleString() : '—'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <span className="text-sm font-semibold text-gray-600">{label}</span>
                            <span className="text-sm text-gray-900">{value || '—'}</span>
                          </div>
                        ))}
                      </div>

                      {(selectedProperty.latitude || selectedProperty.longitude) && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 flex items-center gap-3">
                          <Gauge className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="font-semibold text-gray-800">Map Coordinates</div>
                            <div className="text-gray-600">Lat: {selectedProperty.latitude ?? '-'}, Lng: {selectedProperty.longitude ?? '-'}</div>
                            {selectedProperty.includeMapCoordinates === false && (
                              <div className="text-[11px] text-amber-600 mt-1">Map coordinates are currently disabled for this location.</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Btn variant="primary" onClick={() => setPropertyModalOpen(false)}>Close</Btn>
                      </div>
                    </div>
                  </div>
                </div>
              )}

          </div>
          )}
          {/* â”€â”€ Assets â”€â”€ */}
          {activeTab === 'assets' && (
            <div>
              <SectionHeader title={t("client.sections.assets")} count={assets.length}
                action={!editingAsset && <div style={{ display: 'flex', gap: 8 }}><Btn onClick={() => setEditingAsset({})} variant="primary" size="sm"><Icon.Plus /> Add Asset</Btn><Btn onClick={() => importAssetsRef.current?.click()} variant="outline" size="sm">Import Excel</Btn></div>} />

              {loading.assets && <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loadingâ€¦</div>}
              {errors.assets && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 14, marginBottom: 16, color: '#991B1B', fontSize: 13 }}>Error: {errors.assets}</div>}

              {editingAsset !== null && (
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24, marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 16 }}>{editingAsset._id || editingAsset.id ? 'Edit Asset' : 'New Asset'}</div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const payload = { ...assetForm };
                      const eid = editingAsset._id || editingAsset.id;
                      if (eid) {
                        const prev = originalAssetBlocks.map(String);
                        const now = (assetForm.blocks || []).map(String);
                        const remove = prev.filter(p => !now.includes(p));
                        if (remove.length) payload.removeBlocks = remove;
                        await api.put(`/api/assets/${eid}`, payload);
                        setEditingAsset(null);
                        setOriginalAssetBlocks([]);
                      } else {
                        const userId = getCurrentUserId();
                        await api.post('/api/assets', { ...payload, userId });
                        setEditingAsset(null);
                      }
                      setAssetForm({ name: '', type: '', description: '', propertyId: '', quantity: 1, building: '', blocks: [], room: '' });
                      const r = await api.get('/api/assets');
                      setAssets(r.data || []);
                    } catch {
                      alert('Failed to save asset.');
                    }
                  }}>
                    <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <input type="checkbox" checked={propertyUseNamedBlocks} onChange={e => setPropertyUseNamedBlocks(e.target.checked)} />
                        Use named blocks (comma separated)
                      </label>
                    </div>
                    {propertyUseNamedBlocks && (
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Block Names</label>
                        <textarea value={(propertyForm.namedBlocks || []).join(', ')} onChange={e => setPropertyForm(f => ({ ...f, namedBlocks: String(e.target.value).split(/[;,|]/).map(s => s.trim()).filter(Boolean) }))} style={{ width: '100%', minHeight: 64, padding: 8, borderRadius: 8, border: '1px solid #D1D5DB', fontFamily: 'inherit' }} />
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                      {[['Asset Name', 'name', 'text', true], ['Type', 'type', 'text', true], ['Description', 'description', 'text']].map(([ph, field, type, req]) => (
                        <div key={field}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ph}</label>
                          <Input placeholder={ph} type={type} value={assetForm[field] || ''} onChange={e => setAssetForm(f => ({ ...f, [field]: e.target.value }))} required={req} />
                        </div>
                      ))}
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</label>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D1D5DB', borderRadius: 8, overflow: 'hidden' }}>
                          <button type="button" onClick={() => setAssetForm(f => ({ ...f, quantity: Math.max(1, (f.quantity || 1) - 1) }))} style={{ padding: '9px 14px', background: '#F9FAFB', border: 'none', cursor: 'pointer', fontSize: 16, color: '#374151' }}>âˆ’</button>
                          <input type="number" min="1" value={assetForm.quantity} onChange={e => setAssetForm(f => ({ ...f, quantity: Math.max(1, +e.target.value || 1) }))} style={{ flex: 1, textAlign: 'center', border: 'none', outline: 'none', fontSize: 14, fontWeight: 600 }} />
                          <button type="button" onClick={() => setAssetForm(f => ({ ...f, quantity: (f.quantity || 1) + 1 }))} style={{ padding: '9px 14px', background: '#F9FAFB', border: 'none', cursor: 'pointer', fontSize: 16, color: '#374151' }}>+</button>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Property</label>
                        <Select value={assetForm.propertyId} onChange={e => {
                          const pid = e.target.value;
                          const prop = properties.find(p => (p.id || p._id) === pid);
                          setAssetForm(f => ({ ...f, propertyId: pid, building: prop?.name || '', blocks: [] }));
                        }} required>
                          <option value="">Select locationâ€¦</option>
                          {properties.map((p, idx) => (
                            <option key={`${p.id || p._id || 'property'}-${idx}`} value={p.id || p._id}>
                              {p.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Room</label>
                        <Input placeholder="Room (optional)" value={assetForm.room || ''} onChange={e => setAssetForm(f => ({ ...f, room: e.target.value }))} />
                      </div>
                      {/* Blocks */}
                      {(() => {
                        const prop = properties.find(p => (p.id || p._id) === assetForm.propertyId) || {};
                        let namedBlocks = [];
                        let blocksCount = 0;
                        if (Array.isArray(prop.blocks)) namedBlocks = prop.blocks.map(String);
                        else if (prop.blocks && String(prop.blocks).match(/[,|;]/)) namedBlocks = String(prop.blocks).split(/[;,|]/).map(s => s.trim()).filter(Boolean);
                        else blocksCount = parseInt(prop?.blocks) || 0;

                        if (namedBlocks.length > 0) return (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blocks</label>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {namedBlocks.map((name, idx) => {
                                const val = String(name);
                                const checked = (assetForm.blocks || []).map(String).includes(val);
                                return <label key={idx} style={{ cursor: 'pointer', padding: '5px 12px', borderRadius: 6, border: `1px solid ${checked ? '#1D4ED8' : '#D1D5DB'}`, background: checked ? '#EFF6FF' : 'white', fontSize: 12, fontWeight: 600, color: checked ? '#1D4ED8' : '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <input type="checkbox" style={{ display: 'none' }} checked={checked} onChange={() => setAssetForm(f => {
                                    const cur = (f.blocks || []).map(String);
                                    return { ...f, blocks: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] };
                                  })} />
                                  {val}
                                </label>;
                              })}
                            </div>
                          </div>
                        );

                        if (blocksCount > 0) return (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blocks</label>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {Array.from({ length: blocksCount }).map((_, idx) => {
                                const val = String(idx + 1);
                                const checked = (assetForm.blocks || []).includes(val);
                                return <label key={val} style={{ cursor: 'pointer', padding: '5px 12px', borderRadius: 6, border: `1px solid ${checked ? '#1D4ED8' : '#D1D5DB'}`, background: checked ? '#EFF6FF' : 'white', fontSize: 12, fontWeight: 600, color: checked ? '#1D4ED8' : '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <input type="checkbox" style={{ display: 'none' }} checked={checked} onChange={() => setAssetForm(f => {
                                    const cur = f.blocks || [];
                                    return { ...f, blocks: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] };
                                  })} />
                                  Block {val}
                                </label>;
                              })}
                            </div>
                          </div>
                        );

                        return (
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Block</label>
                            <Input placeholder="Block (optional)" value={(assetForm.blocks || []).join(', ')} onChange={e => setAssetForm(f => ({ ...f, blocks: String(e.target.value).split(/[;,|]/).map(s => s.trim()).filter(Boolean) }))} />
                          </div>
                        );
                      })()}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      <Btn type="submit" variant="primary">Save Asset</Btn>
                      <Btn onClick={() => {
                        setEditingAsset(null);
                        setAssetForm({ name: '', type: '', description: '', propertyId: '', quantity: 1, building: '', blocks: [], room: '' });
                      }} variant="ghost">Cancel</Btn>
                    </div>
                  </form>
                </div>
              )}

              <Table heads={['Name', 'Type', 'Qty', 'Location', 'Building', 'Room', 'Block', 'Description', 'Actions']} empty="No assets yet."
                rows={assets.map(asset => [
                  <Td key="n"><span style={{ fontWeight: 600 }}>{asset.name}</span></Td>,
                  <Td key="t"><span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{asset.type}</span></Td>,
                  <Td key="q"><span style={{ fontWeight: 700 }}>{asset.quantity || 1}</span></Td>,
                  <Td key="p">{renderValue(asset.property?.name)}</Td>,
                  <Td key="bu">{renderValue(asset.building || asset.location?.building)}</Td>,
                  <Td key="ro">{renderValue(asset.room || asset.location?.room)}</Td>,
                  <Td key="bl">{renderValue(asset.blocks || asset.block || asset.location?.block)}</Td>,
                  <Td key="d"><span style={{ color: '#9CA3AF' }}>{renderValue(asset.description)}</span></Td>,
                  <Td key="x">
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" variant="outline" onClick={() => {
                        const blocksSource = asset.blocks ?? asset.block ?? asset.location?.block;
                        let blocksArr = [];
                        if (Array.isArray(blocksSource)) blocksArr = blocksSource.map(String);
                        else if (blocksSource) blocksArr = String(blocksSource).split(/[;,|]/).map(s => s.trim()).filter(Boolean);
                        setEditingAsset(asset);
                        setOriginalAssetBlocks(blocksArr);
                        setAssetForm({
                          name: asset.name,
                          type: asset.type,
                          description: asset.description || '',
                          propertyId: asset.propertyId,
                          quantity: asset.quantity || 1,
                          building: asset.building || asset.location?.building || '',
                          blocks: blocksArr,
                          room: asset.room || asset.location?.room || ''
                        });
                      }}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={async () => {
                        if (window.confirm('Delete this asset?')) {
                          try {
                            await api.delete(`/api/assets/${asset._id || asset.id}`);
                            setAssets(assets.filter(a => (a._id || a.id) !== (asset._id || asset.id)));
                          } catch {
                            alert('Delete failed');
                          }
                        }
                      }}>Delete</Btn>
                    </div>
                  </Td>,
                ])}
              />
            </div>
          )}

          {/* â”€â”€ Staff â”€â”€ */}
          {activeTab === 'internalTechnicians' && (
            <div>
              <SectionHeader
                title={t("manager.sidebar.peopleTeams")}
                count={internalTechnicians.length}
                action={!editingTech && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Btn onClick={() => setInviteUsersOpen(true)} variant="outline" size="sm"><Icon.Plus /> Invite Users</Btn>
                    <Btn onClick={() => setCreateTeamOpen(true)} variant="outline" size="sm"><Icon.Plus /> Add Team</Btn>
                    <Btn onClick={() => setEditingTech({})} variant="primary" size="sm"><Icon.Plus /> Add Technician</Btn>
                  </div>
                )}
              />

              {loading.internalTechnicians && <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loadingâ€¦</div>}
              {errors.internalTechnicians && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 14, marginBottom: 16, color: '#991B1B', fontSize: 13 }}>Error: {errors.internalTechnicians}</div>}

              <InviteUsersModal
                open={inviteUsersOpen}
                onClose={() => setInviteUsersOpen(false)}
                onInvite={handleInviteUsers}
                unusedSeats={(() => {
                  const total = Number(currentUser?.techniciansCount || currentUser?.seats || currentUser?.seatCount);
                  if (!Number.isFinite(total) || total <= 0) return '—';
                  return Math.max(0, total - (people?.length || 0));
                })()}
                busy={inviteUsersBusy}
              />

              <CreateTeamModal
                open={createTeamOpen}
                onClose={() => setCreateTeamOpen(false)}
                people={(people || []).filter((p) => p.kind === 'user')}
                onCreate={handleCreateTeam}
                busy={createTeamBusy}
              />

              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>People</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Invited users and roles</div>
                  </div>
                  <Btn onClick={() => setInviteUsersOpen(true)} variant="outline" size="sm"><Icon.Plus /> Invite</Btn>
                </div>

                {loading.people && <div style={{ textAlign: 'center', padding: 20, color: '#9CA3AF' }}>Loading peopleâ€¦</div>}
                {errors.people && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 14, marginBottom: 12, color: '#991B1B', fontSize: 13 }}>Error: {errors.people}</div>}

                <Table
                  heads={['Email', 'Role', 'Status', 'Actions']}
                  empty="No people invited yet."
                  rows={(people || []).map((p, idx) => {
                    const id = p.id || p._id || String(idx);
                    const role = String(p.role || '').toLowerCase();
                    const accessLevel = String(p.accessLevel || '').toLowerCase();
                    const roleLabel =
                      role === 'manager' ? (accessLevel === 'limited' ? 'Limited Administrator' : 'Administrator') :
                      role === 'admin' ? (accessLevel === 'limited' ? 'Limited Administrator' : 'Administrator') :
                      role === 'technician' ? (accessLevel === 'limited' ? 'Limited Technician' : 'Technician') :
                      (p.role || '—');
                    return [
                      <Td key="e">{renderValue(p.email)}</Td>,
                      <Td key="r">{renderValue(roleLabel)}</Td>,
                      <Td key="s">{renderValue(p.status, p.kind === 'invite' ? 'Invited' : 'Active')}</Td>,
                      <Td key="x">
                        {p.kind === 'invite' ? (
                          <Btn size="sm" variant="danger" onClick={() => handleDeletePerson(id)}>Delete</Btn>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 700 }}>—</span>
                        )}
                      </Td>,
                    ];
                  })}
                />
              </div>

              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>Teams</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Groups of people for assignment</div>
                  </div>
                  <Btn onClick={() => setCreateTeamOpen(true)} variant="outline" size="sm"><Icon.Plus /> Add Team</Btn>
                </div>

                {loading.teams && <div style={{ textAlign: 'center', padding: 20, color: '#9CA3AF' }}>Loading teamsâ€¦</div>}
                {errors.teams && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 14, marginBottom: 12, color: '#991B1B', fontSize: 13 }}>Error: {errors.teams}</div>}

                <Table
                  heads={['Team', 'Members', 'Actions']}
                  empty="No teams yet."
                  rows={(teams || []).map((team, idx) => {
                    const teamId = team._id || team.id || String(idx);
                    const members = Array.isArray(team.members) ? team.members : [];
                    const labels = members.map((m) => {
                      if (!m && m !== 0) return null;
                      if (typeof m === 'object') return m.name || m.email || m.id || m._id;
                      const pid = String(m);
                      const match = (people || []).find(pp => String(pp.id || pp._id) === pid);
                      return match?.email || match?.name || pid;
                    }).filter(Boolean);
                    const shown = labels.slice(0, 4);
                    const remaining = labels.length - shown.length;

                    return [
                      <Td key="n"><span style={{ fontWeight: 700 }}>{team.name || 'Team'}</span></Td>,
                      <Td key="m">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {shown.length === 0 ? (
                            <span style={{ color: 'rgba(255,255,255,0.55)' }}>—</span>
                          ) : (
                            shown.map((label) => (
                              <span key={label} style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                {label}
                              </span>
                            ))
                          )}
                          {remaining > 0 && (
                            <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)' }}>
                              +{remaining} more
                            </span>
                          )}
                        </div>
                      </Td>,
                      <Td key="x">
                        <Btn size="sm" variant="danger" onClick={() => handleDeleteTeam(teamId)}>Delete</Btn>
                      </Td>,
                    ];
                  })}
                />
              </div>

              {editingTech !== null && (
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24, marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 16 }}>{editingTech._id || editingTech.id ? 'Edit Technician' : 'New Technician'}</div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const userId = getCurrentUserId();
                      const data = { ...techForm, specialty: techForm.specialty.filter(s => s.trim()), userId };
                      const eid = editingTech._id || editingTech.id;
                      if (eid) {
                        await api.put(`/api/internal-technicians/${eid}`, data);
                      } else {
                        await api.post('/api/internal-technicians', data);
                      }
                      setEditingTech(null);
                      setTechForm({ name: '', email: '', phone: '', password: '', specialty: [], rating: 0, completed: 0, propertyId: '' });
                      const r = await api.get('/api/internal-technicians');
                      setInternalTechnicians(r.data || []);
                    } catch {
                      alert('Failed to save technician.');
                    }
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                      {[['Name', 'name', 'text', true], ['Email', 'email', 'email'], ['Phone', 'phone', 'text', true]].map(([ph, field, type, req]) => (
                        <div key={field}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ph}</label>
                          <Input placeholder={ph} type={type} value={techForm[field] || ''} onChange={e => setTechForm(f => ({ ...f, [field]: e.target.value }))} required={req} />
                        </div>
                      ))}
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specialty</label>
                        <Input placeholder="e.g. Plumbing, HVAC" value={techForm.specialty.join(', ')} onChange={e => setTechForm(f => ({ ...f, specialty: e.target.value.split(',').map(s => s.trim()) }))} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating (0â€“5)</label>
                        <Input type="number" step="0.1" min="0" max="5" value={techForm.rating} onChange={e => setTechForm(f => ({ ...f, rating: parseFloat(e.target.value) || 0 }))} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed Jobs</label>
                        <Input type="number" min="0" value={techForm.completed} onChange={e => setTechForm(f => ({ ...f, completed: parseInt(e.target.value) || 0 }))} />
                      </div>
                      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
                          <Select value={techForm.propertyId} onChange={e => setTechForm(f => ({ ...f, propertyId: e.target.value }))} required>
                            <option value="">Select locationâ€¦</option>
                            {properties.map((p, idx) => (
                              <option key={`${p.id || p._id || 'property'}-${idx}`} value={p.id || p._id}>
                                {p.name}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password (optional)</label>
                          <Input type="password" placeholder="Password" value={techForm.password} onChange={e => setTechForm(f => ({ ...f, password: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      <Btn type="submit" variant="primary">Save Technician</Btn>
                      <Btn onClick={() => {
                        setEditingTech(null);
                        setTechForm({ name: '', email: '', phone: '', password: '', specialty: [], rating: 0, completed: 0, propertyId: '' });
                      }} variant="ghost">Cancel</Btn>
                    </div>
                  </form>
                </div>
              )}

              <Table heads={['Name', 'Contact', 'Specialty', 'Rating', 'Jobs', 'Location', 'Actions']} empty="No technicians yet."
                rows={internalTechnicians.map(tech => [
                  <Td key="n"><span style={{ fontWeight: 600 }}>{tech.name}</span></Td>,
                  <Td key="c"><div style={{ fontSize: 12 }}><div>{renderValue(tech.email, '—')}</div><div style={{ color: '#9CA3AF' }}>{tech.phone || ''}</div></div></Td>,
                  <Td key="s">{renderValue(Array.isArray(tech.specialty) ? tech.specialty.filter(Boolean) : tech.specialty)}</Td>,
                  <Td key="r"><span style={{ color: '#F59E0B', fontWeight: 700 }}>★ {tech.rating || 0}</span></Td>,
                  <Td key="j"><span style={{ fontWeight: 600 }}>{tech.completed || 0}</span></Td>,
                  <Td key="p">{renderValue(tech.property?.name)}</Td>,
                  <Td key="x">
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" variant="outline" onClick={() => {
                        setEditingTech(tech);
                        setTechForm({
                          name: tech.name,
                          email: tech.email || '',
                          phone: tech.phone,
                          specialty: Array.isArray(tech.specialty) ? tech.specialty : [],
                          rating: tech.rating || 0,
                          completed: tech.completed || 0,
                          propertyId: tech.propertyId
                        });
                      }}>Edit</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => {
                        handleNewRequest();
                      }}>Report Issue</Btn>
                      <Btn size="sm" variant="success" onClick={() => openAssignModal(tech)}>Assign</Btn>
                      <Btn size="sm" variant="danger" onClick={async () => {
                        if (window.confirm('Delete this technician?')) {
                          try {
                            await api.delete(`/api/internal-technicians/${tech._id || tech.id}`);
                            setInternalTechnicians(internalTechnicians.filter(t => (t._id || t.id) !== (tech._id || tech.id)));
                          } catch {
                            alert('Delete failed');
                          }
                        }
                      }}>Delete</Btn>
                    </div>
                  </Td>,
                ])}
              />
            </div>
          )}


          {/* -- Maintenance Templates -- */}
          {(activeTab === 'maintenanceTemplates' || activeTab === 'preventiveMaintenance') && (
            <div>
              {!selectedSchedule && (
                <>
                  <SectionHeader title={t("client.sections.maintenance")} count={maintenanceSchedules.length} />

                  {/* Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    {[{
                      title: 'Preventive Maintenance',
                      desc: 'Report issues for preventive maintenance. Technicians will be assigned, and you\'ll be notified upon completion.',
                      bg: 'linear-gradient(135deg,#1E3A8A,#1D4ED8)',
                      border: '#1D4ED8',
                      iconBg: 'rgba(255,255,255,0.15)',
                      icon: <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                      onClick: () => {
                        handleNewRequest();
                      },
                    }, {
                      title: 'Routine Maintenance',
                      desc: 'Schedule recurring tasks like cleaning or inspection on daily, weekly, or monthly intervals.',
                      bg: 'linear-gradient(135deg,#0F766E,#0D9488)',
                      border: '#0F766E',
                      iconBg: 'rgba(255,255,255,0.15)',
                      icon: <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
                      onClick: () => setShowScheduleForm(true),
                    }].map(({ title, desc, bg, icon, onClick }) => (
                      <button
                        key={title}
                        onClick={onClick}
                        style={{
                          background: bg,
                          border: 'none',
                          borderRadius: 14,
                          padding: '24px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'transform 0.15s, box-shadow 0.15s',
                          color: 'white'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{icon}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</div>
                        <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>{desc}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {showScheduleForm && (
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24, marginBottom: 24 }}>
                  <ScheduleMaintenanceForm
                    technicians={internalTechnicians}
                    assets={assets}
                    initialData={editingSchedule}
                    onSuccess={async () => {
                      await refreshSchedules();
                      setShowScheduleForm(false);
                      setEditingSchedule(null);
                    }}
                    onClose={() => {
                      setShowScheduleForm(false);
                      setEditingSchedule(null);
                    }}
                  />
                </div>
              )}

              {selectedSchedule ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedSchedule(null)}
                        className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedSchedule.name || 'Preventive Maintenance'}</h2>
                        <p className="text-xs text-gray-500">Maintenance schedule</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          setEditingSchedule(selectedSchedule);
                          setShowScheduleForm(true);
                        }}
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                        onClick={() => {
                          setEditingSchedule(selectedSchedule);
                          setShowScheduleForm(true);
                        }}
                      >
                        Add Asset
                      </button>
                      <button className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 px-6 border-b border-gray-100 text-sm font-semibold text-gray-500">
                    {[
                      { key: 'assets', label: 'Assets & Locations' },
                      { key: 'details', label: 'Details' },
                      { key: 'work-orders', label: 'Work Orders' },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setScheduleDetailTab(tab.key)}
                        className={`py-4 border-b-2 transition-colors ${scheduleDetailTab === tab.key ? 'border-blue-600 text-gray-900' : 'border-transparent hover:text-gray-900'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {scheduleDetailTab === 'assets' && (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                              <Search className="w-4 h-4" /> Filters
                            </button>
                            <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Location</button>
                            <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Assigned To</button>
                            <button className="text-blue-600 hover:underline">Reset Filters</button>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Columns</button>
                            <button className="hover:underline">Save View</button>
                          </div>
                        </div>

                        <div className="overflow-x-auto border border-gray-200 rounded-xl">
                          <table className="min-w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="py-3 px-4 w-10">
                                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                                </th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Schedule</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Asset</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Location</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">ID</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Meter</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {selectedScheduleAssets.length === 0 && (
                                <tr>
                                  <td colSpan="7" className="py-10 px-4 text-center text-sm text-gray-500">No assets assigned yet.</td>
                                </tr>
                              )}
                              {selectedScheduleAssets.map(asset => {
                                const assetId = asset._id || asset.id;
                                const property = properties.find(p => String(p._id || p.id) === String(asset.propertyId || asset.property?._id || asset.property?.id));
                                const locationLabel = renderValue(asset.location || asset.address || property?.name || property?.address);
                                const meterLabel = asset.meter || asset.meterReading || asset.meterValue || '-';
                                return (
                                  <tr key={assetId}>
                                    <td className="py-3 px-4">
                                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{selectedScheduleFrequency}</td>
                                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{asset.name || asset.title || 'Asset'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{locationLabel}</td>
                                    <td className="py-3 px-4 text-sm font-mono text-gray-500">{String(assetId).slice(-8)}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{meterLabel}</td>
                                    <td className="py-3 px-4 text-right">
                                      <button className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">...</button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {scheduleDetailTab === 'details' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Status</div>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${requestStatusColor(selectedScheduleStatus)}`}>
                              {selectedScheduleStatus}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Type</div>
                          <div className="mt-1 text-sm text-gray-700">{selectedSchedule.routine ? 'Routine' : 'Preventive'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Frequency</div>
                          <div className="mt-1 text-sm text-gray-700">{selectedScheduleFrequency}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Next Date</div>
                          <div className="mt-1 text-sm text-gray-700">{selectedScheduleNextDate ? selectedScheduleNextDate.toLocaleDateString() : 'TBD'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Assigned To</div>
                          <div className="mt-1 text-sm text-gray-700">{selectedScheduleAssignedLabel}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Company</div>
                          <div className="mt-1 text-sm text-gray-700">{selectedSchedule.company || '-'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Email</div>
                          <div className="mt-1 text-sm text-gray-700">{selectedSchedule.email || '-'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Phone</div>
                          <div className="mt-1 text-sm text-gray-700">{selectedSchedule.phone || '-'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Block</div>
                          <div className="mt-1 text-sm text-gray-700">{selectedSchedule.block || '-'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Rooms / Floors</div>
                          <div className="mt-1 text-sm text-gray-700">{[selectedSchedule.rooms, selectedSchedule.floors].filter(Boolean).join(' / ') || '-'}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-xs font-bold text-gray-500 uppercase">Description</div>
                          <div className="mt-1 text-sm text-gray-700">{selectedSchedule.description || '-'}</div>
                        </div>
                      </div>
                    )}

                    {scheduleDetailTab === 'work-orders' && (
                      <div>
                        {selectedScheduleWorkOrders.length === 0 ? (
                          <div className="text-sm text-gray-500">No work orders linked to this schedule yet.</div>
                        ) : (
                          <div className="overflow-x-auto border border-gray-200 rounded-xl">
                            <table className="min-w-full text-left">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Work Order</th>
                                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Priority</th>
                                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Due Date</th>
                                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Asset</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {selectedScheduleWorkOrders.map(issue => {
                                  const due = normalizeDate(issue.fixDeadline || issue.dueDate || issue.nextDate);
                                  return (
                                    <tr
                                      key={issue._id || issue.id}
                                      className="hover:bg-gray-50 cursor-pointer"
                                      onClick={() => setModalData({ open: true, type: 'issue', item: issue })}
                                    >
                                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">{issue.title || 'Work Order'}</td>
                                      <td className="py-3 px-4 text-sm text-gray-600">{issue.status || 'Pending'}</td>
                                      <td className="py-3 px-4 text-sm text-gray-600">{issue.priority || 'Medium'}</td>
                                      <td className="py-3 px-4 text-sm text-gray-600">{due ? due.toLocaleDateString() : 'TBD'}</td>
                                      <td className="py-3 px-4 text-sm text-gray-600">{renderValue(issue.assetName || issue.location || '-')}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <SectionHeader title={t("client.sections.scheduledMaintenance")} count={maintenanceSchedules.length}
                    action={<Btn onClick={() => setShowScheduleForm(true)} variant="outline" size="sm"><Icon.Plus /> New Schedule</Btn>} />

                  <Table heads={['Name', 'Type', 'Status', 'Next Date', 'Frequency', 'Assets', 'Actions']} empty="No maintenance schedules. Create one above."
                    rows={maintenanceSchedules.map(schedule => {
                      const sid = schedule.id || schedule._id;
                      const assetIds = parseIdList(schedule.assets);
                      const assetNames = assetIds.map(id => assets.find(a => String(a.id || a._id) === String(id))?.name || id).join(', ');
                      const isOverdue = schedule.nextDate && new Date(schedule.nextDate) < new Date() && !(schedule.status || '').toLowerCase().includes('complete');
                      return {
                        key: sid,
                        onClick: () => {
                          setSelectedSchedule(schedule);
                          setScheduleDetailTab('assets');
                        },
                        cells: [
                          <Td key="n"><span style={{ fontWeight: 600 }}>{schedule.name || 'Unnamed'}</span></Td>,
                          <Td key="t"><span style={{ background: schedule.routine ? '#ECFDF5' : '#EFF6FF', color: schedule.routine ? '#065F46' : '#1D4ED8', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{schedule.routine ? 'Routine' : 'Preventive'}</span></Td>,
                          <Td key="s"><StatusBadge status={isOverdue ? 'OVERDUE' : schedule.status || 'Scheduled'} /></Td>,
                          <Td key="nd">{schedule.nextDate ? new Date(schedule.nextDate).toLocaleDateString() : 'TBD'}</Td>,
                          <Td key="f">{schedule.routine ? (schedule.frequency || 'daily') : '-'}</Td>,
                          <Td key="a"><span style={{ color: assetNames ? '#374151' : '#9CA3AF' }}>{assetNames || 'Unassigned'}</span></Td>,
                          <Td key="x">
                            <div style={{ display: 'flex', gap: 6 }}>
                              <Btn size="sm" variant="outline" onClick={(e) => {
                                e.stopPropagation();
                                setEditingSchedule(schedule);
                                setShowScheduleForm(true);
                              }}>Edit</Btn>
                              <Btn size="sm" variant="danger" onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm('Delete this schedule?')) {
                                  try {
                                    await api.delete(`/api/maintenance-schedules/${sid}`);
                                    setMaintenanceSchedules(maintenanceSchedules.filter(s => (s._id || s.id) !== sid));
                                  } catch {
                                    alert('Delete failed');
                                  }
                                }
                              }}>Delete</Btn>
                            </div>
                          </Td>,
                        ],
                      };
                    })}
                  />
                </>
              )}
            </div>
          )}
          {/* â”€â”€ Parts & Inventory â”€â”€ */}
          {activeTab === 'parts' && (
            <ClientPartsTab />
          )}

          {/* â”€â”€ Purchase Orders â”€â”€ */}
          {activeTab === 'purchaseOrders' && (
            <ClientPurchaseOrdersTab />
          )}

          {/* â”€â”€ Analytics â”€â”€ */}
          {activeTab === 'analytics' && (
            <ClientAnalyticsTab allIssues={allIssues} />
          )}

          {/* â”€â”€ Meters â”€â”€ */}
          {activeTab === 'meters' && (
            <ClientMetersTab />
          )}

          {/* â”€â”€ Edge â”€â”€ */}
          {activeTab === 'edge' && (
            <ClientEdgeTab />
          )}

        </div>
      </main>

      {/* â”€â”€ Submit Request Modal â”€â”€ */}
      {showWorkOrderModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-surface-strong rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden border border-white/40 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/40">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Submit Request</h3>
                <p className="text-xs text-slate-500">Provide details to create a new request.</p>
              </div>
              <button
                onClick={() => setShowWorkOrderModal(false)}
                className="p-2 rounded-lg hover:bg-white/60 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <WorkOrderForm
                submitLabel="Submit Request"
                onCancel={() => setShowWorkOrderModal(false)}
                onSubmitted={() => {
                  setShowWorkOrderModal(false);
                  fetchIssues().catch(() => { });
                  setActiveTab('requests');
                }}
                showSidebar
              />
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Issue Assign Modal (For Client) â”€â”€ */}
      {issueAssignModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxWidth: 450, width: '100%', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Assign Specialist</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9CA3AF' }}>Work Order: {selectedIssueToAssign?.title}</p>
              </div>
              <button onClick={() => setIssueAssignModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}><Icon.X /></button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Available Internal Staff</label>
              <Select
                value={selectedInternalTechForIssue}
                onChange={e => setSelectedInternalTechForIssue(e.target.value)}
              >
                <option value="">Select technicianâ€¦</option>
                {internalTechnicians
                  .filter(t => {
                    const techPid = t.propertyId || (t.property && (t.property.id || t.property._id));
                    const issuePid = extractId(selectedIssueToAssign?.propertyId) || (selectedIssueToAssign?.property && (selectedIssueToAssign.property.id || selectedIssueToAssign.property._id));
                    return !techPid || !issuePid || String(techPid) === String(issuePid);
                  })
                  .map((t, idx) => (
                    <option key={`${t.id || t._id || 'tech'}-${idx}`} value={t.id || t._id}>{t.name} ({t.email || t.phone})</option>
                  ))
                }
              </Select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Btn variant="outline" onClick={() => setIssueAssignModalOpen(false)}>Cancel</Btn>
              <Btn
                variant="primary"
                disabled={!selectedInternalTechForIssue || assignLoading[selectedIssueToAssign?.id || selectedIssueToAssign?._id]}
                onClick={async () => {
                  await assignInternal(selectedIssueToAssign.id || selectedIssueToAssign._id, selectedInternalTechForIssue);
                  setIssueAssignModalOpen(false);
                }}
              >
                {assignLoading[selectedIssueToAssign?.id || selectedIssueToAssign?._id] ? 'Assigning...' : 'Confirm Assignment'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Assign Modal â”€â”€ */}
      {assignModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxWidth: 520, width: '100%', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Assign to {selectedTechForAssign?.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9CA3AF' }}>Select a pending issue from {selectedTechForAssign?.property?.name || 'this property'}</p>
              </div>
              <button onClick={() => setAssignModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}><Icon.X /></button>
            </div>

            {assignableIssues.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 24px', background: '#F9FAFB', borderRadius: 10, marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>ðŸ¤·</div>
                <div style={{ fontSize: 14, color: '#9CA3AF' }}>No pending issues for this property</div>
              </div>
            ) : (
              <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {assignableIssues.map(issue => {
                  const iid = issue.id || issue._id;
                  const selected = selectedIssueForAssign === iid;
                  return (
                    <label key={iid} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 10, border: `1.5px solid ${selected ? '#1D4ED8' : '#E5E7EB'}`, background: selected ? '#EFF6FF' : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <input type="radio" name="issueAssign" value={iid} checked={selected} onChange={e => setSelectedIssueForAssign(e.target.value)} style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{issue.title}</div>
                        {issue.description && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.description}</div>}
                        <div style={{ fontSize: 11, color: '#1D4ED8', marginTop: 4 }}>{new Date(issue.createdAt).toLocaleDateString()}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {assignableIssues.length > 0 && (
              <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>Due date/time</label>
                <input type="datetime-local" value={selectedDueDate} onChange={e => setSelectedDueDate(e.target.value)} style={{ border: '1px solid #D1D5DB', borderRadius: 8, padding: '6px 8px' }} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Btn onClick={() => setAssignModalOpen(false)} variant="ghost">Cancel</Btn>
              <Btn onClick={handleAssignSubmit} variant="primary" disabled={!selectedIssueForAssign || assignableIssues.length === 0}>Confirm Assignment</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <DetailsModal
        open={modalData.open}
        type={modalData.type}
        item={modalData.item}
        onClose={() => setModalData({ open: false, type: '', item: null })}
        getAssignedTechName={getAssignedName}
        onRefresh={fetchIssues}
        technicians={modalTechnicians}
        teams={teams}
        workOrders={workOrders}
      />
      </div>
    </div>
  );
}

const PlaceholderPanel = ({ title, description }) => (
  <div className="glass-surface rounded-xl p-6 border border-white/10">
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-500 mt-2">{description}</p>
  </div>
);


const ClientPartsTab = () => {
  const [items, setItems] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const fileRef = React.useRef(null);
  const [showAddPart, setShowAddPart] = React.useState(false);
  const [savingPart, setSavingPart] = React.useState(false);
  const [newPart, setNewPart] = React.useState({
    name: '',
    partNumber: '',
    category: '',
    tags: [],
    description: '',
    status: 'STOCK_IN',
    available: 0,
    allocated: 0,
    onHand: 0,
    incoming: 0,
    location: '',
    barcode: '',
    nonStock: false,
    critical: false,
    inventoryLines: [{ location: '', area: '', minQty: '', maxQty: '', availQty: '', cost: '', barcode: '' }]
  });
  React.useEffect(() => {
    (async () => {
      try { const res = await api.get('/api/parts'); setItems(res.data || []); }
      catch { setItems([]); }
    })();
  }, []);
  const filtered = items.filter(it => (it.name || it.partName || '').toLowerCase().includes(search.toLowerCase()));
  const exportCSV = () => {
    if (!filtered.length) return;
    const keys = ['name', 'status', 'available', 'allocated', 'onHand', 'incoming', 'location'];
    const rows = filtered.map(it => ({ name: it.name || it.partName || '', status: it.status || '', available: it.available || it.availableQty || it.quantity || 0, allocated: it.allocated || 0, onHand: it.onHand || 0, incoming: it.incoming || 0, location: it.location || it.warehouse || '' }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'parts.csv' }); a.click();
  };

  const parseCsv = (text) => {
    if (!text) return [];
    const lines = String(text).replace(/\r/g, '').split('\n').filter(l => l.trim().length > 0);
    const header = (lines.shift() || '').split(',').map(h => h.trim().toLowerCase());
    return lines.map(line => {
      const cols = line.split(',');
      const row = {};
      header.forEach((h, i) => { row[h] = cols[i] || ''; });
      return row;
    });
  };

  const handleImport = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rows = parseCsv(reader.result || '');
        const payload = rows.map(r => ({
          name: r.name || r.part || r.partname || '',
          status: r.status || 'AVAILABLE',
          available: Number(r.available || r.availableqty || r.quantity || 0),
          allocated: Number(r.allocated || r.allocatedqty || 0),
          onHand: Number(r.onhand || r.on_hand || 0),
          incoming: Number(r.incoming || r.incomingqty || 0),
          location: r.location || r.warehouse || '',
          barcode: r.barcode || ''
        })).filter(p => p.name);
        if (!payload.length) {
          alert('No valid rows found in CSV.');
          return;
        }
        const res = await api.post('/api/parts/bulk', { items: payload });
        setItems(prev => [...(res.data || []), ...(prev || [])]);
        alert(`Imported ${payload.length} parts`);
      } catch (err) {
        console.error('Import failed', err);
        alert('Failed to import parts: ' + (err.response?.data?.error || err.message));
      }
    };
    reader.readAsText(file);
  };

  const savePart = async (e) => {
    e.preventDefault();
    if (!newPart.name.trim()) {
      alert('Name is required');
      return;
    }
    setSavingPart(true);
    try {
      const payload = {
        name: newPart.name,
        status: newPart.status,
        available: newPart.available,
        allocated: newPart.allocated,
        onHand: newPart.onHand,
        incoming: newPart.incoming,
        location: newPart.location,
        barcode: newPart.barcode,
        partNumber: newPart.partNumber,
        category: newPart.category,
        tags: newPart.tags,
        description: newPart.description,
        nonStock: newPart.nonStock,
        critical: newPart.critical,
        inventoryLines: newPart.inventoryLines
      };
      const res = await api.post('/api/parts', payload);
      setItems(prev => [res.data, ...(prev || [])]);
      setNewPart({
        name: '',
        partNumber: '',
        category: '',
        tags: [],
        description: '',
        status: 'AVAILABLE',
        available: 0,
        allocated: 0,
        onHand: 0,
        incoming: 0,
        location: '',
        barcode: '',
        nonStock: false,
        critical: false,
        inventoryLines: [{ location: '', area: '', minQty: '', maxQty: '', availQty: '', cost: '', barcode: '' }]
      });
      setShowAddPart(false);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSavingPart(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Parts &amp; Inventory</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage parts, stock levels and locations</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="px-3 py-2 glass-ghost rounded-xl text-sm font-semibold hover:bg-white/70">Export CSV</button>
          <button onClick={() => fileRef.current?.click()} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Import</button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleImport(e.target.files?.[0])} />
          <button onClick={() => setShowAddPart(s => !s)} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">
            {showAddPart ? 'Close' : 'Add Part'}
          </button>
        </div>
      </div>
      {showAddPart && (
        <form onSubmit={savePart} className="glass-surface rounded-xl border border-white/10 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">New Part</div>
              <div className="text-xs text-gray-500">Part Details</div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setShowAddPart(false); setNewPart({
                name: '',
                partNumber: '',
                category: '',
                tags: [],
                description: '',
                status: 'AVAILABLE',
                available: 0,
                allocated: 0,
                onHand: 0,
                incoming: 0,
                location: '',
                barcode: '',
                nonStock: false,
                critical: false,
                inventoryLines: [{ location: '', area: '', minQty: '', maxQty: '', availQty: '', cost: '', barcode: '' }]
              }); }} className="px-3 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" disabled={savingPart} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                {savingPart ? 'Saving...' : 'Create Part'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              ['Part Name *', 'name', 'text', true],
              ['Part Number *', 'partNumber', 'text', true],
              ['Category', 'category', 'text', false],
            ].map(([label, field, type, req]) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">{label}</label>
                <input
                  type={type}
                  value={newPart[field]}
                  onChange={e => setNewPart(p => ({ ...p, [field]: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  required={req}
                />
              </div>
            ))}
            <div className="md:col-span-3 flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Tags</label>
              <input
                value={newPart.tags.join(', ')}
                onChange={e => setNewPart(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder="Separate with commas"
              />
            </div>
            <div className="md:col-span-3 flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Description</label>
              <textarea
                value={newPart.description}
                onChange={e => setNewPart(p => ({ ...p, description: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[80px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ['Status', 'status', 'select'],
              ['Available Qty', 'available', 'number'],
              ['Allocated Qty', 'allocated', 'number'],
              ['On Hand Qty', 'onHand', 'number'],
              ['Incoming Qty', 'incoming', 'number'],
              ['Location', 'location', 'text'],
              ['Barcode', 'barcode', 'text'],
            ].map(([label, field, type]) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">{label}</label>
                {type === 'select' ? (
                  <select
                    value={newPart.status}
                    onChange={e => setNewPart(p => ({ ...p, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="STOCK_IN">Stock In</option>
                    <option value="STOCK_OUT">Stock Out</option>
                    <option value="LOW_STOCK">Low Stock</option>
                  </select>
                ) : (
                  <input
                    type={type}
                    value={newPart[field]}
                    onChange={e => setNewPart(p => ({ ...p, [field]: type === 'number' ? Number(e.target.value || 0) : e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    required={field === 'name'}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input type="checkbox" checked={newPart.nonStock} onChange={e => setNewPart(p => ({ ...p, nonStock: e.target.checked }))} className="mt-1" />
              <span>
                <div className="font-semibold">This is a non-stock part</div>
                <div className="text-xs text-gray-500">Non-stock parts are purchased on-demand and won’t trigger low-stock alerts.</div>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input type="checkbox" checked={newPart.critical} onChange={e => setNewPart(p => ({ ...p, critical: e.target.checked }))} className="mt-1" />
              <span>
                <div className="font-semibold">This is a critical part</div>
                <div className="text-xs text-gray-500">Critical parts require immediate attention when low to prevent downtime.</div>
              </span>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-800 text-sm">Inventory Lines</div>
              <button type="button" onClick={() => setNewPart(p => ({ ...p, inventoryLines: [...p.inventoryLines, { location: '', area: '', minQty: '', maxQty: '', availQty: '', cost: '', barcode: '' }] }))} className="text-blue-600 text-sm font-semibold">Add Inventory Line</button>
            </div>
            <div className="overflow-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {['Location', 'Area', 'Min QTY', 'Max QTY', 'Avail QTY', 'Cost', 'Barcode', ''].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {newPart.inventoryLines.map((line, idx) => (
                    <tr key={idx} className="border-t">
                      {['location', 'area', 'minQty', 'maxQty', 'availQty', 'cost', 'barcode'].map(field => (
                        <td key={field} className="px-3 py-1">
                          <input
                            value={line[field]}
                            onChange={e => setNewPart(p => {
                              const next = [...p.inventoryLines];
                              next[idx] = { ...next[idx], [field]: e.target.value };
                              return { ...p, inventoryLines: next };
                            })}
                            className="w-full px-2 py-1 border border-gray-200 rounded"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-1 text-right">
                        {newPart.inventoryLines.length > 1 && (
                          <button type="button" onClick={() => setNewPart(p => ({ ...p, inventoryLines: p.inventoryLines.filter((_, i) => i !== idx) }))} className="text-rose-600 font-semibold">×</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {newPart.inventoryLines.length === 0 && (
                    <tr><td colSpan="8" className="px-3 py-3 text-center text-gray-500">No inventory lines</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      )}
      <div className="relative max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
      <div className="glass-surface rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>{['Name', 'Status', 'Available', 'Allocated', 'On Hand', 'Incoming', 'Location', 'Actions'].map(h => <th key={h} className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((it, idx) => (
                <tr key={it._id || it.id || `part-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4 text-sm font-bold text-gray-900">{it.name || it.partName || 'Unnamed'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {(it.status || 'â€”').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{it.available || it.availableQty || it.quantity || 0}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{it.allocated || 0}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{it.onHand || 0}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{it.incoming || 0}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{it.location || it.warehouse || 'â€”'}</td>
                  <td className="py-4 px-4 text-right"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="8" className="py-20 text-center text-gray-500">No parts or inventory found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ClientPurchaseOrdersTab = () => {
  const [orders, setOrders] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [showAdd, setShowAdd] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '',
    vendor: '',
    vendorId: '',
    expectedDate: '',
    itemName: '',
    quantity: 1,
    unitCost: 0
  });
  React.useEffect(() => {
    (async () => {
      try {
        const [poRes, venRes] = await Promise.all([
          api.get('/api/purchase-orders'),
          api.get('/api/vendors'),
        ]);
        setOrders(poRes.data || []);
        setVendors(venRes.data || []);
      } catch {
        setOrders([]);
        setVendors([]);
      }
    })();
  }, []);
  const exportCSV = () => {
    if (!orders.length) return;
    const keys = ['title', 'poNumber', 'itemsCount', 'totalCost', 'vendor'];
    const rows = orders.map(o => ({ title: o.title || o.name || '', poNumber: o.poNumber || o.number || '', itemsCount: Array.isArray(o.items) ? o.items.length : '', totalCost: o.totalCost || o.cost || '', vendor: o.vendor?.name || o.vendor || '' }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'purchase-orders.csv' }); a.click();
  };

  const savePo = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { alert('Title required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        vendor: form.vendor || vendors.find(v => String(v._id || v.id) === String(form.vendorId))?.name,
        vendorId: form.vendorId || undefined,
        expectedDate: form.expectedDate || undefined,
        poNumber: `PO-${Date.now()}`,
        items: form.itemName ? [{ name: form.itemName, quantity: Number(form.quantity) || 1, unitCost: Number(form.unitCost) || 0 }] : []
      };
      const res = await api.post('/api/purchase-orders', payload);
      setOrders(prev => [res.data, ...(prev || [])]);
      setForm({ title: '', vendor: '', vendorId: '', expectedDate: '', itemName: '', quantity: 1, unitCost: 0 });
      setShowAdd(false);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Purchase Orders</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create, view and export purchase orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAdd(s => !s)} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">
            {showAdd ? 'Close' : 'New PO'}
          </button>
          <button onClick={exportCSV} className="px-3 py-2 glass-ghost rounded-xl text-sm font-semibold hover:bg-white/70">Export CSV</button>
        </div>
      </div>
      {showAdd && (
        <form onSubmit={savePo} className="glass-surface rounded-lg border border-white/10 p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Vendor</label>
            <select
              value={form.vendorId}
              onChange={e => setForm(f => ({ ...f, vendorId: e.target.value, vendor: '' }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">Select vendor…</option>
              {vendors.map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>)}
            </select>
            <input
              value={form.vendor}
              onChange={e => setForm(f => ({ ...f, vendor: e.target.value, vendorId: '' }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm mt-2"
              placeholder="Or enter new vendor name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Expected Date</label>
            <input type="date" value={form.expectedDate} onChange={e => setForm(f => ({ ...f, expectedDate: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Item</label>
            <input value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Optional" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Quantity</label>
            <input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) || 1 }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Unit Cost</label>
            <input type="number" step="0.01" value={form.unitCost} onChange={e => setForm(f => ({ ...f, unitCost: Number(e.target.value) || 0 }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="col-span-full flex items-center gap-2 justify-end">
            <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-2 text-sm border rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
              {saving ? 'Saving...' : 'Create PO'}
            </button>
          </div>
        </form>
      )}
      <div className="glass-surface rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>{['Title', 'PO Number', '# Items', 'Total Cost', 'Vendor', 'Actions'].map(h => <th key={h} className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => (
                <tr key={o._id || o.id || `po-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4 text-sm font-bold text-gray-900">{o.title || o.name || 'PO'}</td>
                  <td className="py-4 px-4 text-sm font-mono text-gray-600">{o.poNumber || o.number || 'â€”'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{Array.isArray(o.items) ? o.items.length : (o.itemsCount || 'â€”')}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{o.totalCost ? `$${Number(o.totalCost).toFixed(2)}` : 'â€”'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{o.vendor?.name || o.vendor || 'â€”'}</td>
                  <td className="py-4 px-4 text-right"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button></td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="6" className="py-20 text-center text-gray-500">No purchase orders found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ClientVendorsTab = () => {
  const [vendors, setVendors] = React.useState([]);
  const [customers, setCustomers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddVendor, setShowAddVendor] = React.useState(false);
  const [showAddCustomer, setShowAddCustomer] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [vendorForm, setVendorForm] = React.useState({ name: '', email: '', phone: '', contactName: '', address: '' });
  const [customerForm, setCustomerForm] = React.useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    email: '',
    type: '',
    description: '',
    hourlyRate: '',
    billingName: '',
    billingAddress1: '',
    billingAddress2: '',
    billingAddress3: '',
    currency: 'USD',
    customFields: [{ name: '', value: '' }]
  });

  const normalizeVendor = (item) => ({
    ...item,
    __typeLabel: 'Vendor',
    name: item.name || item.company || item.fullName || item.contactName || item.email || 'Unnamed'
  });

  const normalizeCustomer = (item) => ({
    ...item,
    __typeLabel: 'Customer',
    name: item.name || item.company || item.fullName || item.contactName || item.email || 'Unnamed'
  });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [vendorsRes, clientsRes] = await Promise.allSettled([api.get('/api/vendors'), api.get('/api/clients')]);
        const vendorItems = vendorsRes.status === 'fulfilled' ? vendorsRes.value.data || [] : [];
        const clientItems = clientsRes.status === 'fulfilled' ? clientsRes.value.data || [] : [];
        if (mounted) {
          setVendors(vendorItems.map(normalizeVendor));
          setCustomers(clientItems.map(normalizeCustomer));
        }
      } catch {
        if (mounted) {
          setVendors([]);
          setCustomers([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const saveVendor = async (e) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) { alert('Name required'); return; }
    setSaving(true);
    try {
      const res = await api.post('/api/vendors', vendorForm);
      setVendors(prev => [normalizeVendor(res.data), ...(prev || [])]);
      setVendorForm({ name: '', email: '', phone: '', contactName: '', address: '' });
      setShowAddVendor(false);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveCustomer = async (e) => {
    e.preventDefault();
    if (!customerForm.name.trim()) { alert('Name required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: customerForm.name,
        address: customerForm.address,
        phone: customerForm.phone,
        website: customerForm.website,
        email: customerForm.email,
        type: customerForm.type,
        description: customerForm.description,
        hourlyRate: customerForm.hourlyRate,
        billing: {
          name: customerForm.billingName,
          address1: customerForm.billingAddress1,
          address2: customerForm.billingAddress2,
          address3: customerForm.billingAddress3,
          currency: customerForm.currency,
        },
        customFields: (customerForm.customFields || []).filter(f => f.name || f.value)
      };
      const res = await api.post('/api/clients', payload);
      setCustomers(prev => [normalizeCustomer(res.data), ...(prev || [])]);
      setCustomerForm({
        name: '',
        address: '',
        phone: '',
        website: '',
        email: '',
        type: '',
        description: '',
        hourlyRate: '',
        billingName: '',
        billingAddress1: '',
        billingAddress2: '',
        billingAddress3: '',
        currency: 'USD',
        customFields: [{ name: '', value: '' }]
      });
      setShowAddCustomer(false);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vendors &amp; Customers</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage suppliers and customer contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowAddVendor(s => !s); setShowAddCustomer(false); }} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">
            {showAddVendor ? 'Close Vendor Form' : 'Add Vendor'}
          </button>
          <button onClick={() => { setShowAddCustomer(s => !s); setShowAddVendor(false); }} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">
            {showAddCustomer ? 'Close Customer Form' : 'Add Customer'}
          </button>
        </div>
      </div>

      {showAddVendor && (
        <form onSubmit={saveVendor} className="glass-surface rounded-lg border border-white/10 p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ['Name', 'name', 'text', true],
            ['Email', 'email', 'email', false],
            ['Phone', 'phone', 'text', false],
            ['Contact', 'contactName', 'text', false],
            ['Address', 'address', 'text', false],
          ].map(([label, field, type, req]) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">{label}</label>
              <input
                type={type}
                value={vendorForm[field]}
                onChange={e => setVendorForm(f => ({ ...f, [field]: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                required={req}
              />
            </div>
          ))}
          <div className="col-span-full flex items-center gap-2 justify-end">
            <button type="button" onClick={() => setShowAddVendor(false)} className="px-3 py-2 text-sm border rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Vendor'}
            </button>
          </div>
        </form>
      )}

      {showAddCustomer && (
        <form onSubmit={saveCustomer} className="glass-surface rounded-lg border border-white/10 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">Create Customer</div>
              <div className="text-xs text-gray-500">Details</div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddCustomer(false)} className="px-3 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                {saving ? 'Saving...' : 'Create Customer'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              ['Customer Name *', 'name', 'text', true],
              ['Address', 'address', 'text', false],
              ['Phone Number', 'phone', 'text', false],
              ['Website', 'website', 'text', false],
              ['Email', 'email', 'email', false],
              ['Type', 'type', 'text', false],
            ].map(([label, field, type, req]) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">{label}</label>
                <input
                  type={type}
                  value={customerForm[field]}
                  onChange={e => setCustomerForm(f => ({ ...f, [field]: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  required={req}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Description</label>
            <textarea
              value={customerForm.description}
              onChange={e => setCustomerForm(f => ({ ...f, description: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Hourly Rate</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <span className="px-3 text-sm text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={customerForm.hourlyRate}
                  onChange={e => setCustomerForm(f => ({ ...f, hourlyRate: e.target.value }))}
                  className="flex-1 px-3 py-2 text-sm outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-800">Billing Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ['Billing Name', 'billingName'],
                ['Address', 'billingAddress1'],
                ['Address Line 2', 'billingAddress2'],
                ['Address Line 3', 'billingAddress3'],
              ].map(([label, field]) => (
                <div key={field} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">{label}</label>
                  <input
                    value={customerForm[field]}
                    onChange={e => setCustomerForm(f => ({ ...f, [field]: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Currency</label>
                <select
                  value={customerForm.currency}
                  onChange={e => setCustomerForm(f => ({ ...f, currency: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="USD">USD - United States Dollar - $</option>
                  <option value="EUR">EUR - Euro - €</option>
                  <option value="GBP">GBP - British Pound - £</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-800">Custom Data</div>
              <button
                type="button"
                onClick={() => setCustomerForm(f => ({ ...f, customFields: [...(f.customFields || []), { name: '', value: '' }] }))}
                className="text-blue-600 text-sm font-semibold"
              >
                Add Custom Field
              </button>
            </div>
            <div className="space-y-2">
              {(customerForm.customFields || []).map((cf, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Custom Field Name</label>
                    <input
                      value={cf.name}
                      onChange={e => setCustomerForm(f => {
                        const next = [...(f.customFields || [])];
                        next[idx] = { ...next[idx], name: e.target.value };
                        return { ...f, customFields: next };
                      })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Value</label>
                    <input
                      value={cf.value}
                      onChange={e => setCustomerForm(f => {
                        const next = [...(f.customFields || [])];
                        next[idx] = { ...next[idx], value: e.target.value };
                        return { ...f, customFields: next };
                      })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="text-right">
                    {(customerForm.customFields || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCustomerForm(f => ({ ...f, customFields: f.customFields.filter((_, i) => i !== idx) }))}
                        className="text-rose-600 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

      <div className="glass-surface rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>{['Name', 'Contact', 'Phone', 'Type', 'Actions'].map(h => <th key={h} className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="5" className="py-10 text-center text-gray-500 text-sm">Loading…</td></tr>}
              {!loading && vendors.map((v, idx) => (
                <tr key={v._id || v.id || `vendor-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4 text-sm font-bold text-gray-900">{v.name}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{v.email || v.contactName || '—'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{v.phone || '—'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{v.__typeLabel}</td>
                  <td className="py-4 px-4 text-right"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button></td>
                </tr>
              ))}
              {!loading && customers.map((c, idx) => (
                <tr key={c._id || c.id || `customer-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4 text-sm font-bold text-gray-900">{c.name}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{c.email || c.contactName || '—'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{c.phone || '—'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{c.__typeLabel}</td>
                  <td className="py-4 px-4 text-right"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button></td>
                </tr>
              ))}
              {!loading && vendors.length === 0 && customers.length === 0 && <tr><td colSpan="5" className="py-12 text-center text-sm text-gray-500">No vendors or customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ClientAnalyticsTab = ({ allIssues = [] }) => {
  const resolved = allIssues.filter(i => (i.status || '').toUpperCase().includes('COMPLETE')).length;
  const pending = allIssues.filter(i => (i.status || '').toUpperCase() === 'PENDING').length;
  const inProg = allIssues.filter(i => (i.status || '').toUpperCase().includes('PROGRESS')).length;
  const overdue = allIssues.filter(i => i.overdue).length;
  const bars = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(); day.setDate(day.getDate() - (6 - i)); day.setHours(0, 0, 0, 0);
    return { count: allIssues.filter(it => { try { const d = new Date(it.createdAt); d.setHours(0, 0, 0, 0); return d.getTime() === day.getTime(); } catch { return false; } }).length, label: day.toLocaleDateString('en', { weekday: 'short' }) };
  });
  const barsMax = Math.max(...bars.map(b => b.count), 1);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your maintenance and issue activity</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Issues', value: allIssues.length, icon: 'ðŸ“‹', color: 'from-blue-50 to-indigo-50 border-blue-100' },
          { label: 'Resolved', value: resolved, icon: 'âœ…', color: 'from-emerald-50 to-green-50 border-emerald-100' },
          { label: 'Pending', value: pending, icon: 'â³', color: 'from-amber-50 to-yellow-50 border-amber-100' },
          { label: 'Overdue', value: overdue, icon: 'ðŸš¨', color: 'from-rose-50 to-pink-50 border-rose-100' },
        ].map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} border rounded-xl p-4 flex items-center gap-4`}>
            <span className="text-3xl">{c.icon}</span>
            <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{c.label}</p><p className="text-2xl font-black text-gray-900 mt-0.5">{c.value}</p></div>
          </div>
        ))}
      </div>
      <div className="glass-surface rounded-xl p-5">
        <p className="text-sm font-bold text-gray-900 mb-4">Issues â€” Last 7 Days</p>
        <div className="flex items-end gap-2" style={{ height: 80 }}>
          {bars.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div style={{ width: '100%', height: `${Math.max(4, (b.count / barsMax) * 100)}%`, minHeight: 4 }} className="bg-gradient-to-t from-blue-700 to-blue-400 rounded-t" />
              <span className="text-[10px] text-gray-400">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-surface rounded-xl p-5">
        <p className="text-sm font-bold text-gray-900 mb-4">Status Breakdown</p>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Pending', color: '#F59E0B', count: pending },
            { label: 'In Progress', color: '#3B82F6', count: inProg },
            { label: 'Completed', color: '#10B981', count: resolved },
            { label: 'Overdue', color: '#EF4444', count: overdue },
          ].map(s => (
            <div key={s.label}>
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-semibold text-gray-700">{s.label}</span>
                <span className="font-bold" style={{ color: s.color }}>{s.count}</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div style={{ width: `${allIssues.length ? Math.round((s.count / allIssues.length) * 100) : 0}%`, background: s.color, transition: 'width 0.5s ease' }} className="h-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const ClientMetersTab = () => {
  const [meters, setMeters] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('All');
  const [showAdd, setShowAdd] = React.useState(false);
  const [newMeter, setNewMeter] = React.useState({ name: '', type: 'Electricity', reading: 0, unit: 'kWh', status: 'Normal', location: '' });
  const types = ['All', 'Electricity', 'Water', 'Gas'];
  React.useEffect(() => { api.get('/api/meters').then(r => setMeters(r.data || [])).catch(() => setMeters([])); }, []);
  const filtered = meters.filter(m => (filter === 'All' || m.type === filter) && ((m.name || '').toLowerCase().includes(search.toLowerCase()) || (m.location || '').toLowerCase().includes(search.toLowerCase())));
  const sc = s => ({ Normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }, Warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }, Alert: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' } }[s] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' });
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-gray-900">Meters</h2><p className="text-sm text-gray-500 mt-0.5">Live readings from all property meters</p></div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Add Meter
        </button>
      </div>
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="relative glass-surface-strong rounded-xl p-6 w-full max-w-md z-10">
            <h3 className="text-lg font-bold mb-3">Add Meter</h3>
            <div className="flex flex-col gap-2">
              <input value={newMeter.name} onChange={e => setNewMeter({ ...newMeter, name: e.target.value })} placeholder="Name" className="p-2 border rounded" />
              <select value={newMeter.type} onChange={e => setNewMeter({ ...newMeter, type: e.target.value, unit: e.target.value === 'Water' ? 'mÂ³' : 'kWh' })} className="p-2 border rounded">
                <option>Electricity</option><option>Water</option><option>Gas</option>
              </select>
              <input value={newMeter.location} onChange={e => setNewMeter({ ...newMeter, location: e.target.value })} placeholder="Location" className="p-2 border rounded" />
              <div className="flex gap-2">
                <input type="number" value={newMeter.reading} onChange={e => setNewMeter({ ...newMeter, reading: Number(e.target.value) })} className="p-2 border rounded flex-1" />
                <input value={newMeter.unit} onChange={e => setNewMeter({ ...newMeter, unit: e.target.value })} className="p-2 border rounded w-24" />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setShowAdd(false)} className="px-3 py-2 glass-ghost rounded">Cancel</button>
                <button onClick={async () => { try { const res = await api.post('/api/meters', newMeter); setMeters(p => [res.data, ...p]); setShowAdd(false); setNewMeter({ name: '', type: 'Electricity', reading: 0, unit: 'kWh', status: 'Normal', location: '' }); } catch { alert('Failed to add meter'); } }} className="px-3 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Electricity', value: `${(meters.filter(m => m.type === 'Electricity').reduce((s, m) => s + (Number(m.reading) || 0), 0) / 1000).toFixed(1)} MWh`, icon: 'âš¡', color: 'from-amber-50 to-yellow-50 border-amber-100' },
          { label: 'Total Water', value: `${meters.filter(m => m.type === 'Water').reduce((s, m) => s + (Number(m.reading) || 0), 0).toLocaleString()} mÂ³`, icon: 'ðŸ’§', color: 'from-blue-50 to-cyan-50 border-blue-100' },
          { label: 'Active Alerts', value: meters.filter(m => m.status !== 'Normal').length, icon: 'ðŸš¨', color: 'from-rose-50 to-pink-50 border-rose-100' },
        ].map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} border rounded-xl p-4 flex items-center gap-4`}>
            <span className="text-3xl">{c.icon}</span>
            <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{c.label}</p><p className="text-xl font-black text-gray-900 mt-0.5">{c.value}</p></div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search meters..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {types.map(t => <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filter === t ? 'bg-white/70 shadow-sm text-gray-900 backdrop-blur' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>)}
        </div>
      </div>
      <div className="glass-surface rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>{['Meter', 'Type', 'Reading', 'Trend', 'Status', 'Location', 'Last Read', 'Actions'].map(h => <th key={h} className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((m, idx) => {
                const badge = sc(m.status); return (
                  <tr key={m.id || m._id || `m-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-xl">{m.icon || 'ðŸ“Š'}</div><div><p className="text-sm font-bold text-gray-900">{m.name}</p><p className="text-[10px] text-gray-400 mt-0.5">{m.type}</p></div></div></td>
                    <td className="py-4 px-4 text-sm text-gray-600">{m.type}</td>
                    <td className="py-4 px-4 text-sm font-black text-gray-900">{(m.reading || 0).toLocaleString()} <span className="text-xs text-gray-400 font-medium">{m.unit}</span></td>
                    <td className="py-4 px-4"><span className={`text-sm font-bold ${(m.trend || 0) > 0 ? 'text-rose-500' : (m.trend || 0) < 0 ? 'text-emerald-500' : 'text-gray-400'}`}>{(m.trend || 0) > 0 ? '+' : ''}{m.trend || 0}%</span></td>
                    <td className="py-4 px-4"><span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full ${badge.bg} ${badge.text} ${badge.border}`}>{m.status || 'Normal'}</span></td>
                    <td className="py-4 px-4 text-sm text-gray-600">{m.location || 'â€”'}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{m.lastRead || 'â€”'}</td>
                    <td className="py-4 px-4 text-right"><button className="p-1.5 hover:bg-gray-100 rounded-lg" onClick={() => alert(JSON.stringify(m, null, 2))}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan="8" className="py-16 text-center text-gray-500">No meters found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ClientEdgeTab = () => {
  const [devices, setDevices] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('All');
  const [showAdd, setShowAdd] = React.useState(false);
  const [newDevice, setNewDevice] = React.useState({ name: '', type: 'Sensor', status: 'Online', signal: 80, firmware: 'v1.0.0', location: '', battery: null });
  const statuses = ['All', 'Online', 'Offline'];
  const typeIcon = { Camera: 'ðŸ“·', Sensor: 'ðŸ“¡', Network: 'ðŸŒ', Lock: 'ðŸ”’', Controller: 'ðŸŽ›ï¸' };
  React.useEffect(() => { api.get('/api/devices').then(r => setDevices(r.data || [])).catch(() => setDevices([])); }, []);
  const filtered = devices.filter(d => (filter === 'All' || d.status === filter) && ((d.name || '').toLowerCase().includes(search.toLowerCase()) || (d.location || '').toLowerCase().includes(search.toLowerCase())));
  const online = devices.filter(d => d.status === 'Online').length;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-gray-900">Edge Devices</h2><p className="text-sm text-gray-500 mt-0.5">Monitor and manage connected IoT edge devices</p></div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Add Device
        </button>
      </div>
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="relative glass-surface-strong rounded-xl p-6 w-full max-w-md z-10">
            <h3 className="text-lg font-bold mb-3">Add Device</h3>
            <div className="flex flex-col gap-2">
              <input value={newDevice.name} onChange={e => setNewDevice({ ...newDevice, name: e.target.value })} placeholder="Device name" className="p-2 border rounded" />
              <select value={newDevice.type} onChange={e => setNewDevice({ ...newDevice, type: e.target.value })} className="p-2 border rounded">
                {Object.keys(typeIcon).map(t => <option key={t}>{t}</option>)}
              </select>
              <input value={newDevice.location} onChange={e => setNewDevice({ ...newDevice, location: e.target.value })} placeholder="Location" className="p-2 border rounded" />
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setShowAdd(false)} className="px-3 py-2 glass-ghost rounded">Cancel</button>
                <button onClick={async () => { try { const res = await api.post('/api/devices', newDevice); setDevices(p => [res.data, ...p]); setShowAdd(false); } catch { alert('Failed to add device'); } }} className="px-3 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Devices', value: devices.length, icon: 'ðŸ–¥ï¸', color: 'from-blue-50 to-indigo-50 border-blue-100' },
          { label: 'Online', value: online, icon: 'ðŸŸ¢', color: 'from-emerald-50 to-green-50 border-emerald-100' },
          { label: 'Offline', value: devices.length - online, icon: 'ðŸ”´', color: 'from-rose-50 to-pink-50 border-rose-100' },
        ].map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} border rounded-xl p-4 flex items-center gap-4`}>
            <span className="text-3xl">{c.icon}</span>
            <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{c.label}</p><p className="text-2xl font-black text-gray-900 mt-0.5">{c.value}</p></div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search devices..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {statuses.map(s => <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${filter === s ? 'bg-white/70 shadow-sm text-gray-900 backdrop-blur' : 'text-gray-500 hover:text-gray-700'}`}>{s !== 'All' && <span className={`w-1.5 h-1.5 rounded-full ${s === 'Online' ? 'bg-emerald-500' : 'bg-gray-400'}`} />}{s}</button>)}
        </div>
      </div>
      <div className="glass-surface rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>{['Device', 'Type', 'Location', 'Status', 'Signal', 'Firmware', 'Actions'].map(h => <th key={h} className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((d, idx) => (
                <tr key={d.id || d._id || `dev-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-xl">{typeIcon[d.type] || 'ðŸ“Ÿ'}</div><div><p className="text-sm font-bold text-gray-900">{d.name}</p><p className="text-[10px] text-gray-400 mt-0.5 font-mono">{String(d.id || d._id || '').slice(-8)}</p></div></div></td>
                  <td className="py-4 px-4 text-sm text-gray-600">{d.type}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{d.location || 'â€”'}</td>
                  <td className="py-4 px-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${d.status === 'Online' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : d.status === 'Offline' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{d.status}</span></td>
                  <td className="py-4 px-4"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div style={{ width: `${d.signal || 0}%` }} className={`h-full rounded-full ${(d.signal || 0) >= 80 ? 'bg-emerald-500' : (d.signal || 0) >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} /></div><span className="text-xs text-gray-500">{d.signal || 0}%</span></div></td>
                  <td className="py-4 px-4 text-xs font-mono text-gray-500">{d.firmware || 'â€”'}</td>
                  <td className="py-4 px-4 text-right"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="7" className="py-16 text-center text-gray-500">No edge devices found. Add your first device above.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;



 
 
