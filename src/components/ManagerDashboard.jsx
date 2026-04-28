import React, { useState, useEffect } from "react";
import backgroundVideo from "../assets/136906-765457769_small.mp4";
import api from "../api/axios";
import { getImageUrl } from "../utils/imageUrl";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Header from "./Header";
import SubscriptionManagement from './SubscriptionManagement';
import TeamDetailsModal from './TeamDetailsModal';
import { WorkOrderForm } from './WorkOrder';
import PreventiveMaintenanceDetail from './PreventiveMaintenanceDetail';
import AdminChat from './AdminChat';
import { useLanguage, useTranslation } from "../i18n/LanguageContext";
import {
  Shield,
  BarChart3,
  Clock,
  Wrench,
  CheckCircle,
  LogOut,
  Calendar,
  Search,
  Bell,
  Upload,
  TrendingUp,
  Users,
  ChevronRight,
  ChevronLeft,
  MapPin,
  AlertCircle,
  Eye,
  Edit,
  FileText,
  Filter,
  Download,
  Trash2,
  MessageSquare,
  Award,
  Star,
  LayoutDashboard,
  Brain,
  Video,
  Database,
  LineChart,
  Gauge,
  Box,
  Map,
  ClipboardCheck,
  Package,
  ShoppingCart,
  Contact2,
  Settings,
  MoreHorizontal,
  Plus,
  ArrowUpRight,
  Sparkles,
  HelpCircle,
  Smartphone,
  Info,
  Activity,
  Circle,
  Flag,
  ChevronDown,
  SlidersHorizontal,
  CircleDashed,
  Play,
  Repeat,
  X,
  CreditCard,
  Send,
  Copy
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  Legend
} from 'recharts';

const buildMentionHandle = (person) => {
  const emailLocal = String(person?.email || '').split('@')[0].trim().toLowerCase();
  const compactName = String(person?.name || '').replace(/\s+/g, '').toLowerCase();
  return emailLocal || compactName || '';
};

const getMentionContext = (value, cursorPosition = value.length) => {
  const text = String(value || '');
  const safeCursor = typeof cursorPosition === 'number' ? cursorPosition : text.length;
  const beforeCursor = text.slice(0, safeCursor);
  const match = beforeCursor.match(/(^|\s)@([a-zA-Z0-9._-]*)$/);
  if (!match) return null;
  const rawQuery = match[2] || '';
  const atIndex = beforeCursor.lastIndexOf(`@${rawQuery}`);
  if (atIndex < 0) return null;
  return { query: rawQuery.toLowerCase(), start: atIndex, end: safeCursor };
};

const applyMentionToText = (value, context, person) => {
  if (!context) return String(value || '');
  const handle = buildMentionHandle(person);
  if (!handle) return String(value || '');
  const text = String(value || '');
  return `${text.slice(0, context.start)}@${handle} ${text.slice(context.end)}`;
};

const DirectMessageModal = ({ open, recipientName, message, sending, onChange, onClose, onSend }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Private Message</h3>
            <p className="mt-1 text-sm text-gray-500">
              This goes only to {recipientName || 'the selected person'}. Team-wide discussion should stay in the shared work order comments.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">To</div>
            <div className="mt-1 text-sm font-semibold text-emerald-900">{recipientName || 'Assigned person'}</div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Message</label>
            <textarea
              value={message}
              onChange={(e) => onChange(e.target.value)}
              rows={6}
              placeholder="Write a private message about this work order..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={sending || !String(message || '').trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send message'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CommentModal = ({ open, item, userName, people = [], onClose, onPosted }) => {
  const [messages, setMessages] = useState(Array.isArray(item?.chat) ? item.chat : []);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [mentionCandidates, setMentionCandidates] = useState([]);
  const [mentionContext, setMentionContext] = useState(null);

  useEffect(() => {
    setMessages(Array.isArray(item?.chat) ? item.chat : []);
    setCommentText('');
    setSending(false);
    setMentionCandidates([]);
    setMentionContext(null);
  }, [item, open]);

  if (!open || !item) return null;

  const updateMentionSuggestions = (value, cursorPosition) => {
    const context = getMentionContext(value, cursorPosition);
    setMentionContext(context);
    if (!context) {
      setMentionCandidates([]);
      return;
    }
    const filtered = (people || [])
      .filter((person) => {
        const haystack = `${person?.name || ''} ${person?.email || ''} ${buildMentionHandle(person)}`.toLowerCase();
        return !context.query || haystack.includes(context.query);
      })
      .slice(0, 6);
    setMentionCandidates(filtered);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCommentText(value);
    updateMentionSuggestions(value, e.target.selectionStart);
  };

  const insertMention = (person) => {
    const nextValue = applyMentionToText(commentText, mentionContext, person);
    setCommentText(nextValue);
    setMentionCandidates([]);
    setMentionContext(null);
  };

  const handlePost = async () => {
    const text = String(commentText || '').trim();
    if (!text || sending) return;
    const newMessage = {
      sender: userName || 'Manager',
      text,
      timestamp: new Date().toISOString(),
      role: 'comment'
    };
    const updatedChat = [...messages, newMessage];
    setSending(true);
    try {
      await api.put(`/api/issues/${item.id || item._id}`, { chat: updatedChat });
      setMessages(updatedChat);
      setCommentText('');
      setMentionCandidates([]);
      setMentionContext(null);
      if (onPosted) onPosted(updatedChat);
    } catch (err) {
      alert('Failed to post comment: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Comments</h3>
            <p className="mt-1 text-sm text-gray-500">{item.title || 'Work order'} discussion thread.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[55vh] space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-white px-6 py-5">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
              <div className="text-sm font-semibold text-gray-700">No comments yet</div>
              <div className="mt-1 text-xs text-gray-500">Write the first comment for this work order.</div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${String(msg.sender || msg.user || '').trim() === userName ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {String(msg.sender || msg.user || 'U').trim().split(' ').map(part => part?.[0] || '').join('').slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-bold text-gray-900">{msg.sender || msg.user || 'Unknown'}</span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-gray-100 bg-white px-6 py-5">
          <div className="mb-3">
            <div className="text-sm font-bold text-gray-900">Add a comment</div>
            <div className="text-xs text-gray-500">This will post directly to the work order thread.</div>
          </div>
          <div className="relative">
            {mentionCandidates.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl z-20">
                {mentionCandidates.map((person) => (
                  <button
                    key={person._id || person.id || person.email}
                    type="button"
                    onClick={() => insertMention(person)}
                    className="w-full border-b border-gray-100 px-3 py-2 text-left hover:bg-gray-50 last:border-b-0"
                  >
                    <div className="text-sm font-semibold text-gray-900">{person.name}</div>
                    <div className="text-xs text-gray-500">@{buildMentionHandle(person)}{person.email ? ` • ${person.email}` : ''}</div>
                  </button>
                ))}
              </div>
            )}
            <div className="rounded-2xl border border-gray-200 bg-slate-50/80 p-4">
              <textarea
                value={commentText}
                onChange={handleInputChange}
                placeholder="Write a comment..."
                className="min-h-[120px] w-full resize-none rounded-2xl border border-white bg-white px-4 py-3 text-sm text-gray-800 outline-none ring-1 ring-slate-100 transition focus:ring-2 focus:ring-blue-100"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handlePost}
                  disabled={sending || !String(commentText || '').trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MessageSquare className="h-4 w-4" />
                  {sending ? 'Posting...' : 'Post comment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Status badge with icons and gradients
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const statusMap = {
      'PENDING': {
        bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: '⌛',
        label: 'Pending'
      },
      'APPROVED': {
        bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: '✅',
        label: 'Approved'
      },
      'ASSIGNED': {
        bg: 'bg-gradient-to-r from-purple-50 to-violet-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: '👤',
        label: 'Assigned'
      },
      'IN PROGRESS': {
        bg: 'bg-gradient-to-r from-orange-50 to-red-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        icon: '🚧',
        label: 'In Progress'
      },
      'COMPLETE': {
        bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: '🎯',
        label: 'Complete'
      },
      'COMPLETED': {
        bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: '🎯',
        label: 'Complete'
      },
      'DECLINED': {
        bg: 'bg-gradient-to-r from-rose-50 to-pink-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: '❌',
        label: 'Declined'
      },
      'OVERDUE': {
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '🕒',
        label: 'Overdue'
      },
    };
    return statusMap[status] || {
      bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: '📌',
      label: status
    };
  };

  const config = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text} ${config.border} border shadow-sm`}>
      <span className="text-sm">{config.icon}</span>
      {config.label}
    </span>
  );
};

// Enhanced Priority badge
const PriorityBadge = ({ priority }) => {
  const getPriorityConfig = (priority) => {
    const priorityMap = {
      'LOW': {
        bg: 'bg-gradient-to-r from-emerald-100 to-teal-100',
        text: 'text-emerald-800',
        icon: '⬇️',
        glow: 'shadow-emerald-200'
      },
      'MEDIUM': {
        bg: 'bg-gradient-to-r from-amber-100 to-yellow-100',
        text: 'text-amber-800',
        icon: '⚠️',
        glow: 'shadow-amber-200'
      },
      'HIGH': {
        bg: 'bg-gradient-to-r from-orange-100 to-red-100',
        text: 'text-orange-800',
        icon: '🔥',
        glow: 'shadow-orange-200'
      },
      'URGENT': {
        bg: 'bg-gradient-to-r from-rose-100 to-pink-100',
        text: 'text-rose-800',
        icon: '🚨',
        glow: 'shadow-rose-200'
      },
    };
    return priorityMap[priority] || {
      bg: 'bg-gradient-to-r from-gray-100 to-slate-100',
      text: 'text-gray-800',
      icon: '📌',
      glow: 'shadow-gray-200'
    };
  };

  const config = getPriorityConfig(priority);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text} ${config.glow} shadow-md`}>
      <span className="text-sm">{config.icon}</span>
      {priority}
    </span>
  );
};

// Enhanced Stat Card with animations
const StatCard = ({ title, value, change, icon: Icon, color, trend = "up" }) => {
  const colorMap = {
    blue: { theme: 'from-blue-500/10 to-cyan-500/5', text: 'text-blue-700', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600' },
    orange: { theme: 'from-orange-500/10 to-amber-500/5', text: 'text-orange-700', iconBg: 'bg-orange-500/10', iconColor: 'text-orange-600' },
    green: { theme: 'from-emerald-500/10 to-green-500/5', text: 'text-emerald-700', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
    purple: { theme: 'from-purple-500/10 to-violet-500/5', text: 'text-purple-700', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-600' },
    red: { theme: 'from-rose-500/10 to-pink-500/5', text: 'text-rose-700', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600' },
  };

  const config = colorMap[color] || colorMap.blue;

  return (
    <div className={`glass-surface-strong bg-gradient-to-br ${config.theme} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-gray-500 opacity-80 uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-black mt-2 ${config.text}`}>{value}</p>
        </div>
        <div className={`${config.iconBg} ${config.iconColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-2 text-sm">
          {trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
          <span className="font-semibold text-gray-600">{change}</span>
        </div>
      )}
    </div>
  );
};


// Glass Card Component
const GlassCard = ({ children, className = "", mirror = true }) => (
  <div className={`glass-surface rounded-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden ${mirror ? "glass-mirror" : ""} ${className}`}>
    <div className="glass-reflection absolute inset-x-0 top-0 h-10 opacity-60 pointer-events-none" />
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

// Styled Filter Button
const FilterButton = ({ icon: Icon, label, active, count, onClick, color = "blue" }) => {
  const colorClasses = {
    blue: active ? 'bg-[#edf2fe] border-[#c0d4fb] text-[#2563eb]' : 'bg-white border-gray-100 text-gray-600',
    gray: active ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-white border-gray-100 text-gray-600',
  };

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all shadow-sm h-8 ${colorClasses[color]} hover:bg-gray-50`}
      >
        {Icon && <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#2563eb]' : 'text-gray-400'}`} />}
        <span className="whitespace-nowrap">{label}</span>
        {count !== undefined && <span className="ml-0.5 text-[#2563eb]">{count > 0 ? `(${count})` : ''}</span>}
        <ChevronDown className={`w-3.5 h-3.5 ml-0.5 text-gray-400 transition-transform ${active && color === 'blue' ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};

// Centralized Popover Component
const FilterPopover = ({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className={`absolute top-full mt-2 left-0 z-50 glass-surface-strong rounded-xl min-w-[240px] animate-in fade-in zoom-in duration-200 ${className}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <span className="text-sm font-bold text-gray-900">{title}</span>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-2">
          {children}
        </div>
      </div>
    </>
  );
};

// Helper to normalize IDs (handles plain strings and MongoDB {$oid: "..."} objects)
const normalizeId = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (val.$oid) return String(val.$oid);
  if (val.id) return normalizeId(val.id);
  if (val._id) return normalizeId(val._id);
  return String(val);
};

// Helper to normalize Dates (handles ISO strings and MongoDB {$date: "..."} objects)
const normalizeDate = (val) => {
  if (!val) return null;
  if (val.$date) return new Date(val.$date);
  return new Date(val);
};

const formatDateForInput = (val) => {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const useBulkSelection = (items, getId) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const ids = (items || [])
    .map((item) => {
      const id = getId(item);
      return id ? String(id) : null;
    })
    .filter(Boolean);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = prev.filter((id) => ids.includes(id));
      return next.length === prev.length && next.every((id, index) => id === prev[index]) ? prev : next;
    });
  }, [ids.join('|')]);

  const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
  const toggleAll = (checked) => setSelectedIds(checked ? ids : []);
  const toggleOne = (id) => {
    if (!id) return;
    const stringId = String(id);
    setSelectedIds((prev) => (
      prev.includes(stringId) ? prev.filter((val) => val !== stringId) : [...prev, stringId]
    ));
  };
  const clear = () => setSelectedIds([]);

  return { selectedIds, allSelected, toggleAll, toggleOne, clear };
};

const BulkActionBar = ({ count, label, onDelete }) => {
  if (!count) return null;
  return (
    <div className="mb-4 flex items-center justify-between bg-rose-50 border border-rose-200 rounded-lg px-4 py-2 text-sm font-semibold text-rose-700">
      <span>{count} {label} selected</span>
      <button
        onClick={onDelete}
        className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-rose-700"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  );
};

// Basic CSV parser that supports quoted values with commas
const parseCsvText = (text) => {
  if (!text) return [];
  const lines = String(text).replace(/\r/g, '').split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const parseLine = (line) => {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map(v => v.trim());
  };
  const headers = parseLine(lines[0]).map(h => h.toLowerCase());
  return lines.slice(1).map(line => {
    const cols = parseLine(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? '';
    });
    return obj;
  }).filter(row => Object.values(row).some(v => String(v || '').trim().length > 0));
};

// Combine people and users arrays, deduplicating by id/_id/email
const combinePeopleUsers = (peopleArr = [], usersArr = []) => {
  const seen = new Set();
  const out = [];
  const push = (p) => {
    const key = String(p?.id || p?._id || p?.email || p?.username || '');
    if (!key) return;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(p);
    }
  };
  (peopleArr || []).forEach(push);
  (usersArr || []).forEach(push);
  return out;
};

function ManagerDashboard() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [issues, setIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [locations, setLocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });
  const [assigning, setAssigning] = useState(null);
  const [assignmentData, setAssignmentData] = useState({
    technicianId: "",
    priority: "MEDIUM",
    dueDate: ""
  });
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [workOrderModalTitle, setWorkOrderModalTitle] = useState('Submit Request');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignedTo: 'all'
  });
  const [openPopover, setOpenPopover] = useState(null); // 'status', 'priority', 'location', etc.
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [selectedAssignedTo, setSelectedAssignedTo] = useState([]);
  const [includeSubLocations, setIncludeSubLocations] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [detailModal, setDetailModal] = useState({ open: false, type: null, item: null });
  const [commentModal, setCommentModal] = useState({ open: false, item: null });
  const [directMessageModal, setDirectMessageModal] = useState({
    open: false,
    recipientUserId: '',
    recipientName: '',
    link: '/manager-dashboard',
    message: '',
    sending: false
  });
  const [selectedPreventive, setSelectedPreventive] = useState(null);

  const totalActiveFilters = selectedStatuses.length + selectedPriorities.length + selectedLocations.length + selectedAssets.length + selectedAssignedTo.length;
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasLoadedDashboard, setHasLoadedDashboard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSentiment, setAiSentiment] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [recsError, setRecsError] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const navigate = useNavigate();

  // Load logged-in user from localStorage for sidebar display
  let loggedUser = null;
  try {
    const rawUser = localStorage.getItem('user');
    loggedUser = rawUser ? JSON.parse(rawUser) : null;
  } catch (e) {
    loggedUser = null;
  }

  const userName = loggedUser?.name || loggedUser?.username || 'Manager';
  const initials = (userName.split(' ').map(n => n?.[0] || '').slice(0, 2).join('') || 'M').toUpperCase();
  const userRole = loggedUser?.role || (loggedUser?.isManager ? 'Manager' : 'User');

  const openDirectMessageComposer = ({ recipientUserId, recipientName, link }) => {
    if (!recipientUserId) {
      alert('No recipient is available for private message.');
      return;
    }
    setDirectMessageModal({
      open: true,
      recipientUserId: String(recipientUserId),
      recipientName: recipientName || 'Assigned person',
      link: link || '/manager-dashboard',
      message: '',
      sending: false
    });
  };

  const closeDirectMessageModal = () => {
    setDirectMessageModal({
      open: false,
      recipientUserId: '',
      recipientName: '',
      link: '/manager-dashboard',
      message: '',
      sending: false
    });
  };

  const openCommentModal = (item) => {
    setCommentModal({ open: true, item });
  };

  const closeCommentModal = () => {
    setCommentModal({ open: false, item: null });
  };

  const handleCommentPosted = (updatedChat) => {
    const issueId = commentModal.item?._id || commentModal.item?.id;
    if (!issueId) return;
    const applyChat = (list) => (Array.isArray(list) ? list.map((entry) => (
      String(entry?._id || entry?.id) === String(issueId) ? { ...entry, chat: updatedChat } : entry
    )) : list);
    setIssues(prev => applyChat(prev));
    setAllIssues(prev => applyChat(prev));
    setPendingRequests(prev => applyChat(prev));
    setCommentModal(prev => ({
      ...prev,
      item: prev.item ? { ...prev.item, chat: updatedChat } : prev.item
    }));
  };

  const handleSendDirectMessage = async () => {
    const text = String(directMessageModal.message || '').trim();
    if (!directMessageModal.recipientUserId) {
      alert('No recipient is available for private message.');
      return;
    }
    if (!text) return;
    setDirectMessageModal(prev => ({ ...prev, sending: true }));
    try {
      await api.post('/api/notifications/direct-message', {
        recipientUserId: directMessageModal.recipientUserId,
        message: text,
        title: `Private message from ${userName}`,
        link: directMessageModal.link || '/manager-dashboard'
      });
      alert('Private message sent.');
      closeDirectMessageModal();
    } catch (err) {
      setDirectMessageModal(prev => ({ ...prev, sending: false }));
      alert('Failed to send private message: ' + (err?.response?.data?.message || err.message));
    }
  };

  const requestWithTimeout = (promise, timeoutMs = 10000) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });

  const safeApiGet = async (path, fallback, timeoutMs = 10000) => {
    try {
      const response = await requestWithTimeout(api.get(path), timeoutMs);
      return response?.data ?? fallback;
    } catch (error) {
      console.error(`Failed to load ${path}:`, error);
      return fallback;
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Check if token exists
      if (!token) {
        console.warn('No authentication token found');
        navigate('/login');
        return;
      }

      console.log('Token exists:', !!token, 'First 20 chars:', token?.substring(0, 20));
      console.log('Token exists:', !!token, 'First 20 chars:', token?.substring(0, 20));
      // const config = { headers: { Authorization: `Bearer ${token}` } }; // handled by interceptor

      const [issuesData, techData, usersData, teamsData, summaryData, locationsData, assetsData] = await Promise.all([
        safeApiGet("/api/issues", []),
        safeApiGet("/api/technicians", []),
        safeApiGet("/api/users", []),
        safeApiGet("/api/teams", []),
        safeApiGet("/api/managers/dashboard/summary", {}),
        safeApiGet("/api/properties", []),
        safeApiGet("/api/assets", [])
      ]);

      const allIssuesData = Array.isArray(issuesData) ? issuesData : [];
      setAllIssues(allIssuesData);

      const approvedWorkOrders = allIssuesData.filter(issue => issue.approved);
      const pendingRequestsData = allIssuesData.filter(issue => !issue.approved && issue.status !== 'REJECTED');

      setIssues(approvedWorkOrders);
      setPendingRequests(pendingRequestsData);
      setSystemUsers(Array.isArray(usersData) ? usersData : []);

      const combinedTechs = combinePeopleUsers(Array.isArray(techData) ? techData : [], Array.isArray(usersData) ? usersData : []);
      setTechnicians(combinedTechs);
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
      setAssets(Array.isArray(assetsData) ? assetsData : []);
      setSummary(summaryData && typeof summaryData === 'object' ? summaryData : {});
    } catch (err) {
      console.error('Failed to load data:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);

      // Check if it's a 401 error
      if (err.response?.status === 401) {
        console.warn('Unauthorized - token may have expired');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      setIssues([]);
      setAllIssues([]);
      setPendingRequests([]);
      setSystemUsers([]);
      setTechnicians([]);
      setSummary({ pending: 0, inProgress: 0, completed: 0, overdue: 0 });
    } finally {
      setHasLoadedDashboard(true);
      setLoading(false);
    }
  };

  const fetchAISentiment = async () => {
    try {
      setLoadingAI(true);
      setAiError(null);
      const res = await api.get("/api/ai/sentiment-summary");
      setAiSentiment(res.data);
    } catch (err) {
      console.error("Failed to fetch AI sentiment:", err);
      setAiError(err.response?.data?.message || "Analysis service unavailable");
    } finally {
      setLoadingAI(false);
    }
  };

  const exportToPDF = async () => {
    const dashboardElement = document.getElementById('dashboard-content');
    if (!dashboardElement) return;

    try {
      setLoading(true);
      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MMS-Status-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      // Create CSV content
      const headers = ["Issue Title", "Description", "Location", "Priority", "Status", "Date Created"];
      const rows = issues.map(issue => [
        `"${issue.title}"`,
        `"${issue.description}"`,
        `"${issue.location}"`,
        `"${issue.priority}"`,
        `"${issue.status}"`,
        new Date(issue.createdAt).toLocaleDateString()
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `mms_maintenance_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Excel/CSV Export failed:", err);
      alert("Failed to export data.");
    }
  };

  const fetchAIRecommendations = async () => {
    try {
      setLoadingRecs(true);
      setRecsError(null);
      const res = await api.get("/api/ai/dashboard-recommendations");
      setAiRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error("Failed to fetch AI recommendations:", err);
      setRecsError(err.response?.data?.message || "Recommendation service unavailable");
    } finally {
      setLoadingRecs(false);
    }
  };

  const fetchAIMaintenanceSummary = async () => {
    try {
      setLoadingSummary(true);
      setSummaryError(null);
      const res = await api.get("/api/ai/maintenance-summary");
      setAiSummary(res.data);
    } catch (err) {
      console.error("Failed to fetch AI maintenance summary:", err);
      setSummaryError(err.response?.data?.message || "Maintenance summary unavailable");
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchMaterialRequests = async () => {
    try {
      const res = await api.get('/api/material-requests');
      setMaterialRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch material requests:', err);
      setMaterialRequests([]);
    }
  };

  // Fetch feedbacks when switching to feedback tab
  const fetchFeedbacks = async () => {
    if (activeTab !== 'feedback') return;

    try {
      setLoadingFeedbacks(true);
      const token = localStorage.getItem('token');

      // Check if token exists
      if (!token) {
        console.warn('No authentication token found');
        navigate('/login');
        return;
      }

      // const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await api.get("/api/issues");
      const issuesWithEvidence = response.data.filter(issue =>
        issue.evidence?.afterImage || issue.evidence?.address
      );

      const formattedFeedbacks = issuesWithEvidence.map(issue => ({
        ...issue,
        technicianName: getAssignedTechName(issue),
        completedAt: issue.updatedAt,
        evidence: issue.evidence || {}
      }));

      setFeedbacks(formattedFeedbacks);
    } catch (err) {
      console.error('Failed to load feedbacks:', err);

      // Check if it's a 401 error
      if (err.response?.status === 401) {
        console.warn('Unauthorized - token may have expired');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      setFeedbacks([]);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAISentiment();
    fetchAIRecommendations();
    fetchAIMaintenanceSummary();
    fetchMaterialRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedbacks();
    }
    if (activeTab === 'material-requests') {
      fetchMaterialRequests();
    }
  }, [activeTab]);

  // Approval functions
  const handleApproveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      // const config = { headers: { Authorization: `Bearer ${token}` } };

      const issueId = selectedRequest?._id || selectedRequest?.id || requestId;
      if (!issueId) {
        alert('No issue ID found');
        return;
      }

      await api.post(`/api/issues/${issueId}/approve`, {
        approvedBy: JSON.parse(localStorage.getItem('user')).id,
      });

      await fetchDashboardData();
      setShowApprovalModal(false);
      setSelectedRequest(null);
      alert('Request approved! It has been moved to Issue Management for assignment.');
    } catch (error) {
      console.error('Approval error:', error);
      alert(`Failed to approve request: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeclineRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      // const config = { headers: { Authorization: `Bearer ${token}` } };

      const issueId = selectedRequest?._id || selectedRequest?.id;
      if (!issueId) {
        alert('No issue ID found');
        return;
      }

      await api.post(`/api/issues/${issueId}/decline`, {
        rejectedBy: JSON.parse(localStorage.getItem('user')).id,
        reason: declineReason
      });

      await fetchDashboardData();
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setDeclineReason('');
      alert('Request declined! It has been removed from the pending list.');
    } catch (error) {
      console.error('Decline error:', error);
      alert(`Failed to decline request: ${error.response?.data?.error || error.message}`);
    }
  };

  // Assignment function
  const handleAssignTech = async (issueId) => {
    const techId = assignmentData.technicianId;
    const tech = technicians.find(t => {
      const idsToCheck = [t._id, t.id, t.userId].filter(Boolean).map(String);
      return idsToCheck.includes(String(techId));
    });

    if (!tech) {
      alert('Technician not found');
      setAssigning(null);
      return;
    }

    if (!assignmentData.dueDate) {
      alert('Please select a due date for this assignment');
      return;
    }

    try {
      if (!issueId) {
        alert('No issue ID found');
        return;
      }

      // Use the dedicated assign endpoint (consistent with ManagementIssues)
      await api.post(`/api/issues/${issueId}/assign`, {
        techId: normalizeId(tech._id || tech.id || tech.userId),
        priority: assignmentData.priority,
        dueDate: assignmentData.dueDate,
        status: 'ASSIGNED'
      });

      // Instead of manual state splicing, refresh all dashboard data to ensure consistency
      await fetchDashboardData();

      setAssigning(null);
      setAssignmentData({ technicianId: "", priority: "MEDIUM", dueDate: "" });
      alert('Issue assigned successfully!');
    } catch (err) {
      console.error('Assignment error:', err);
      alert(`Failed to assign issue: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleOpenAssignment = (issue) => {
    if (!issue) {
      setAssigning(null);
      return;
    }
    const issueId = normalizeId(issue._id || issue.id);
    setAssigning(issueId);
    setAssignmentData({
      technicianId: normalizeId(issue.assignedTo) || "",
      priority: issue.priority || "MEDIUM",
      dueDate: (issue.fixDeadline || issue.dueDate) ? normalizeDate(issue.fixDeadline || issue.dueDate).toISOString().split('T')[0] : ""
    });
  };

  // Filter function
  const getFilteredIssues = () => {
    // If we are in the Work Orders tab, only show assigned issues.
    // In the All Issues tab, show both pending requests and work orders.
    let baseList = activeTab === 'issues' ? issues : [...pendingRequests, ...issues];
    let allIssues = [...baseList];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      allIssues = allIssues.filter(issue =>
        String(issue.title || '').toLowerCase().includes(q) ||
        String(issue.description || '').toLowerCase().includes(q) ||
        String(issue.location || issue.address || '').toLowerCase().includes(q)
      );
    }

    return allIssues.filter(issue => {
      const statusVal = String(issue.status || '').toUpperCase();
      const priorityVal = String(issue.priority || '').toUpperCase();
      const assignedId = normalizeId(issue.assignedTo || issue.assignees?.[0]?.id || issue.assignees?.[0]?._id);
      const locationVal = String(issue.location || issue.address || issue.locationName || '').toLowerCase();
      const assetId = normalizeId(issue.assetId || issue.asset?.id || issue.asset?._id);
      const assetName = String(issue.assetName || issue.asset?.name || '').toLowerCase();

      // Status filter (top bar)
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(statusVal)) return false;
      // Status filter (All Issues dropdown)
      if (selectedStatuses.length === 0 && filters.status !== 'all') {
        if (filters.status === 'pending-approval' && issue.assignedTo) return false;
        if (filters.status === 'pending-approval' && statusVal !== 'PENDING') return false;
        if (filters.status === 'in-progress' && statusVal !== 'IN PROGRESS') return false;
        if (filters.status === 'completed' && statusVal !== 'COMPLETE' && statusVal !== 'COMPLETED') return false;
      }

      // Priority filter (top bar)
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(priorityVal)) return false;
      // Priority filter (All Issues dropdown)
      if (selectedPriorities.length === 0 && filters.priority !== 'all' && priorityVal !== String(filters.priority).toUpperCase()) return false;

      // Assigned filter (top bar)
      if (selectedAssignedTo.length > 0 && !selectedAssignedTo.includes(assignedId)) return false;
      // Assigned filter (All Issues dropdown)
      if (selectedAssignedTo.length === 0 && filters.assignedTo !== 'all') {
        if (filters.assignedTo === 'unassigned' && assignedId) return false;
        if (filters.assignedTo === 'assigned' && !assignedId) return false;
      }

      // Location filter
      if (selectedLocations.length > 0) {
        const match = selectedLocations.some(loc => locationVal.includes(String(loc || '').toLowerCase()));
        if (!match) return false;
      }

      // Assets filter
      if (selectedAssets.length > 0) {
        const match = selectedAssets.some(a => {
          const val = String(a || '').toLowerCase();
          return val === String(assetId || '').toLowerCase() || assetName.includes(val);
        });
        if (!match) return false;
      }

      return true;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  const getAssignedTechName = (issue) => {
    if (!issue) return 'Unassigned';
    const assignedId = normalizeId(issue.assignedTo || (issue.assignees?.[0]?.id || issue.assignees?.[0]?._id));
    if (!assignedId) return 'Unassigned';

    const tech = technicians.find(t => {
      const idsToCheck = [t._id, t.id, t.userId].filter(Boolean).map(normalizeId);
      return idsToCheck.includes(assignedId);
    });

    return tech?.name || tech?.username || 'Technician';
  };

  const openDetailModal = (type, item) => {
    if (!item) return;
    setDetailModal({ open: true, type, item });
  };

  const closeDetailModal = () => {
    setDetailModal({ open: false, type: null, item: null });
  };

  const openWorkOrderModal = (title) => {
    setWorkOrderModalTitle(title || 'Submit Request');
    setShowWorkOrderModal(true);
  };

  const NavItem = ({ active, onClick, icon: Icon, label, badge, badgeColor = "bg-blue-600" }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-start justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative mb-1 text-left ${active
        ? 'bg-white/20 text-white shadow-lg shadow-black/5'
        : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-glow-white" />
      )}
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className={`mt-0.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="min-w-0 flex-1 text-sm font-bold tracking-tight leading-5 break-words whitespace-normal">
          {label}
        </span>
      </div>
      {badge && (
        <span className={`mt-0.5 shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white min-w-[18px] text-center ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );

  const TooltipButton = ({ icon: Icon, title }) => (
    <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all" title={title}>
      <Icon className="w-5 h-5" />
    </button>
  );

  const SectionLabel = ({ children }) => (
    <div className="px-3 py-2 text-[10px] font-bold text-white/50 uppercase tracking-widest mt-4">
      {children}
    </div>
  );

  return (
    <div className="glass-theme-blue min-h-screen text-slate-900 overflow-hidden relative" style={{ fontFamily: "'Space Grotesk', 'Manrope', 'Segoe UI', sans-serif" }}>
      {/* Dynamic Background */}
      <div className="video-background-container">
        <video autoPlay loop muted playsInline>
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="video-overlay" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar Redesign */}
        <aside className="glass-surface-strong border-r border-white/20 flex flex-col sticky top-0 h-screen overflow-y-auto shrink-0" style={{ width: 272 }}>
          {/* Sidebar Header */}
          <div style={{ padding: '24px 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>MMS CORE</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Management</div>
              </div>
            </div>
          </div>

          {/* User */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#1D4ED8', flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'capitalize' }}>{userRole}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                title={t("client.actions.logout")}
              >
                <LogOut className="w-4 h-4" />
              </button>
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

          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          <NavItem
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={LayoutDashboard}
            label={t("manager.sidebar.dashboard")}
          />
          <NavItem
            active={false}
            onClick={() => { }}
            icon={Brain}
            label={t("manager.sidebar.intelligence")}
            badge="New"
            badgeColor="bg-blue-600"
          />
          <NavItem
            active={false}
            onClick={() => { }}
            icon={Video}
            label={t("manager.sidebar.studio")}
            badge="New"
            badgeColor="bg-blue-600"
          />

          <SectionLabel>{t("manager.sidebar.core")}</SectionLabel>
          <NavItem
            active={activeTab === 'issues'}
            onClick={() => setActiveTab('issues')}
            icon={FileText}
            label={t("manager.sidebar.workOrders")}
          />
          <NavItem
            active={activeTab === 'preventive-maintenance'}
            onClick={() => setActiveTab('preventive-maintenance')}
            icon={CheckCircle}
            label={t("manager.sidebar.preventiveMaintenance")}
          />
          <NavItem
            active={activeTab === 'scheduler'}
            onClick={() => setActiveTab('scheduler')}
            icon={Calendar}
            label={t("manager.sidebar.scheduler")}
          />
          <NavItem
            active={activeTab === 'requests'}
            onClick={() => setActiveTab('requests')}
            icon={MessageSquare}
            label={t("manager.sidebar.requests")}
            badge={pendingRequests.length}
            badgeColor="bg-blue-600"
          />
          <NavItem
            active={activeTab === 'material-requests'}
            onClick={() => setActiveTab('material-requests')}
            icon={Package}
            label={t("manager.sidebar.materialRequests")}
            badge={materialRequests.filter(r => r.status === 'PENDING').length || undefined}
            badgeColor="bg-purple-600"
          />
          <NavItem
            active={activeTab === 'subscriptions'}
            onClick={() => setActiveTab('subscriptions')}
            icon={CreditCard}
            label={t("manager.sidebar.subscriptions")}
          />

          <SectionLabel>{t("manager.sidebar.dataAnalytics")}</SectionLabel>
          <NavItem
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={LineChart}
            label={t("manager.sidebar.analytics")}
          />
          <NavItem
            active={activeTab === 'meters'}
            onClick={() => setActiveTab('meters')}
            icon={Gauge}
            label={t("manager.sidebar.meters")}
          />
          <NavItem
            active={activeTab === 'edge'}
            onClick={() => setActiveTab('edge')}
            icon={Smartphone}
            label={t("manager.sidebar.edge")}
          />

          <SectionLabel>{t("manager.sidebar.resources")}</SectionLabel>
          <NavItem
            active={activeTab === 'assets'}
            onClick={() => setActiveTab('assets')}
            icon={Box}
            label={t("manager.sidebar.assets")}
          />
          <NavItem
            active={activeTab === 'locations'}
            onClick={() => setActiveTab('locations')}
            icon={Map}
            label={t("manager.sidebar.locations")}
          />
          <NavItem
            active={activeTab === 'people'}
            onClick={() => setActiveTab('people')}
            icon={Users}
            label={t("manager.sidebar.peopleTeams")}
          />
          <NavItem
            active={activeTab === 'user-management'}
            onClick={() => setActiveTab('user-management')}
            icon={Users}
            label="User Management"
          />
          <NavItem
            active={activeTab === 'company-management'}
            onClick={() => setActiveTab('company-management')}
            icon={Database}
            label="Company Management"
          />
          <NavItem
            active={activeTab === 'checklists'}
            onClick={() => setActiveTab('checklists')}
            icon={ClipboardCheck}
            label={t("manager.sidebar.checklists")}
          />
          <NavItem
            active={false}
            onClick={() => { }}
            icon={Database}
            label={t("manager.sidebar.files")}
          />

          <SectionLabel>{t("manager.sidebar.procurement")}</SectionLabel>
          <NavItem
            active={activeTab === 'parts'}
            onClick={() => setActiveTab('parts')}
            icon={Package}
            label={t("manager.sidebar.partsInventory")}
            badge="1"
            badgeColor="bg-blue-600"
          />
          <NavItem
            active={activeTab === 'purchase-orders'}
            onClick={() => setActiveTab('purchase-orders')}
            icon={ShoppingCart}
            label={t("manager.sidebar.purchaseOrders")}
            badge="1"
            badgeColor="bg-blue-600"
          />
          <NavItem
            active={activeTab === 'vendors'}
            onClick={() => setActiveTab('vendors')}
            icon={Contact2}
            label="Vendors"
          />
          <NavItem
            active={activeTab === 'customers'}
            onClick={() => setActiveTab('customers')}
            icon={Users}
            label="Customers"
          />

          <SectionLabel>Communication</SectionLabel>
          <NavItem
            active={activeTab === 'contact-messages'}
            onClick={() => setActiveTab('contact-messages')}
            icon={MessageSquare}
            label="Contact Messages"
          />
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <NavItem
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon={Settings}
              label={t("manager.sidebar.settings")}
            />
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <TooltipButton icon={HelpCircle} title="Help" />
            <TooltipButton icon={MessageSquare} title="Feedback" />
            <TooltipButton icon={Info} title="Info" />
            <TooltipButton icon={Settings} title="Settings" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Results Header */}
        <div className="h-14 border-b border-white/20 bg-white/10 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white">{getFilteredIssues().length} {t("common.resultsReturned")}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 px-2 py-1 rounded-md transition-colors">
                <ArrowUpRight className="w-4 h-4" />
                {t("common.sort")}: {activeTab === 'preventive-maintenance' ? 'Name' : 'Date Created'}
              </button>
              <button className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 px-2 py-1 rounded-md transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                {t("common.columns")}
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-8 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-1 focus:ring-white/40 transition-all placeholder:text-white/40 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white flex items-center justify-between flex-shrink-0 relative z-40 overflow-visible">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#edf2fe] border border-[#c0d4fb] rounded-lg text-[11px] font-bold text-[#2563eb] hover:bg-[#e0e9fe] transition-all shadow-sm h-8">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters ({totalActiveFilters})
            </button>
            <div className="h-4 w-px bg-gray-200 mx-1" />

            {activeTab !== 'preventive-maintenance' && (
              <div className="relative">
                <FilterButton
                  icon={Activity}
                  label={`Status: ${selectedStatuses.length > 0 ? (selectedStatuses.length > 1 ? `${selectedStatuses[0].charAt(0) + selectedStatuses[0].slice(1).toLowerCase()} +${selectedStatuses.length - 1}` : selectedStatuses[0].charAt(0) + selectedStatuses[0].slice(1).toLowerCase()) : 'All'}`}
                  active={selectedStatuses.length > 0}
                  onClick={() => setOpenPopover(openPopover === 'status' ? null : 'status')}
                />
                <FilterPopover
                  isOpen={openPopover === 'status'}
                  onClose={() => setOpenPopover(null)}
                  title="Status"
                >
                  <div className="space-y-1">
                    {[
                      { id: 'OPEN', label: 'Open', icon: CircleDashed, color: 'text-gray-300' },
                      { id: 'IN PROGRESS', label: 'In Progress', icon: Play, color: 'text-blue-500', fill: true },
                      { id: 'ON HOLD', label: 'On Hold', icon: Circle, color: 'text-amber-500' },
                      { id: 'COMPLETE', label: 'Complete', icon: CheckCircle, color: 'text-green-500', fill: true },
                    ].map((status) => (
                      <label key={status.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedStatuses.includes(status.id)}
                          onChange={(e) => {
                            const newStatuses = e.target.checked
                              ? [...selectedStatuses, status.id]
                              : selectedStatuses.filter(s => s !== status.id);
                            setSelectedStatuses(newStatuses);
                          }}
                        />
                        <div className="relative flex items-center justify-center w-5 h-5">
                          <status.icon className={`w-5 h-5 ${status.color} ${status.fill ? `fill-${status.color.split('-')[1]}-500` : ''}`} />
                          {status.id === 'IN PROGRESS' && <div className="absolute inset-0 flex items-center justify-center"><Play className="w-1.5 h-1.5 text-blue-600 fill-white" /></div>}
                          {status.id === 'COMPLETE' && <div className="absolute inset-0 flex items-center justify-center"><CheckCircle className="w-3 h-3 text-green-500 fill-white" /></div>}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{status.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between p-2 mt-2 border-t border-gray-50">
                    <button onClick={() => setSelectedStatuses([])} className="text-xs font-bold text-blue-600 hover:text-blue-700">Clear</button>
                    <div className="flex gap-2">
                      <button onClick={() => setOpenPopover(null)} className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200">Cancel</button>
                      <button onClick={() => setOpenPopover(null)} className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
                    </div>
                  </div>
                </FilterPopover>
              </div>
            )}

            <div className="relative">
              <FilterButton
                icon={Users}
                label="Assigned To"
                active={selectedAssignedTo.length > 0}
                count={selectedAssignedTo.length > 0 ? selectedAssignedTo.length : undefined}
                onClick={() => setOpenPopover(openPopover === 'assigned' ? null : 'assigned')}
              />
              <FilterPopover
                isOpen={openPopover === 'assigned'}
                onClose={() => setOpenPopover(null)}
                title="Assigned To"
              >
                <div className="space-y-1">
                  {technicians.map((tech) => (
                    <label key={tech._id || tech.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedAssignedTo.includes(tech._id || tech.id)}
                        onChange={(e) => {
                          const id = tech._id || tech.id;
                          const newAssigned = e.target.checked
                            ? [...selectedAssignedTo, id]
                            : selectedAssignedTo.filter(a => a !== id);
                          setSelectedAssignedTo(newAssigned);
                        }}
                      />
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                        {tech.name?.charAt(0) || 'T'}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{tech.name}</span>
                    </label>
                  ))}
                  {technicians.length === 0 && <div className="p-4 text-center text-xs text-gray-400 font-medium italic">No technicians found</div>}
                </div>
              </FilterPopover>
            </div>

            <div className="relative">
              <FilterButton
                icon={MapPin}
                label={`Location ${selectedLocations.length > 0 ? `(${selectedLocations.length})` : ''}`}
                active={selectedLocations.length > 0}
                onClick={() => setOpenPopover(openPopover === 'location' ? null : 'location')}
              />
              <FilterPopover
                isOpen={openPopover === 'location'}
                onClose={() => setOpenPopover(null)}
                title="Location"
                className="w-80"
              >
                <div className="p-2 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Include sub-locations in selection</span>
                    <button
                      onClick={() => setIncludeSubLocations(!includeSubLocations)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${includeSubLocations ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${includeSubLocations ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-[200px] overflow-y-auto">
                    {locations.filter(loc => (loc.name || loc.title || '').toLowerCase().includes(locationSearch.toLowerCase())).map((loc) => {
                      const locId = loc._id || loc.id;
                      const locName = loc.name || loc.title || 'Unknown Location';
                      return (
                        <label key={locId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedLocations.includes(locName)}
                            onChange={(e) => {
                              const newLocations = e.target.checked
                                ? [...selectedLocations, locName]
                                : selectedLocations.filter(l => l !== locName);
                              setSelectedLocations(newLocations);
                            }}
                          />
                          <span className="text-sm font-bold text-gray-700 line-clamp-1">{locName}</span>
                        </label>
                      );
                    })}
                    {locations.length === 0 && <div className="p-4 text-center text-xs text-gray-400 font-medium italic">No locations found</div>}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 mt-2 border-t border-gray-50">
                  <button onClick={() => setSelectedLocations([])} className="text-xs font-bold text-blue-600 hover:text-blue-700">Clear</button>
                  <div className="flex gap-2">
                    <button onClick={() => setOpenPopover(null)} className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200">Cancel</button>
                    <button onClick={() => setOpenPopover(null)} className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
                  </div>
                </div>
              </FilterPopover>
            </div>

            <div className="relative">
              <FilterButton
                icon={Flag}
                label="Priority"
                active={selectedPriorities.length > 0}
                onClick={() => setOpenPopover(openPopover === 'priority' ? null : 'priority')}
              />
              <FilterPopover
                isOpen={openPopover === 'priority'}
                onClose={() => setOpenPopover(null)}
                title="Priority"
              >
                <div className="space-y-1">
                  {[
                    { id: 'HIGH', label: 'High', color: 'text-rose-500' },
                    { id: 'MEDIUM', label: 'Medium', color: 'text-amber-500' },
                    { id: 'LOW', label: 'Low', color: 'text-green-500' },
                    { id: 'NONE', label: 'None', color: 'text-gray-400' },
                  ].map((priority) => (
                    <label key={priority.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedPriorities.includes(priority.id)}
                        onChange={(e) => {
                          const newPriorities = e.target.checked
                            ? [...selectedPriorities, priority.id]
                            : selectedPriorities.filter(p => p !== priority.id);
                          setSelectedPriorities(newPriorities);
                        }}
                      />
                      <Flag className={`w-4 h-4 ${priority.color} fill-current`} />
                      <span className="text-sm font-bold text-gray-700">{priority.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between p-2 mt-2 border-t border-gray-50">
                  <button onClick={() => setSelectedPriorities([])} className="text-xs font-bold text-blue-600 hover:text-blue-700">Clear</button>
                  <div className="flex gap-2">
                    <button onClick={() => setOpenPopover(null)} className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200">Cancel</button>
                    <button onClick={() => setOpenPopover(null)} className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
                  </div>
                </div>
              </FilterPopover>
            </div>

            {activeTab !== 'preventive-maintenance' && (
              <div className="relative">
                <FilterButton
                  icon={Box}
                  label="Asset"
                  active={selectedAssets.length > 0}
                  count={selectedAssets.length > 0 ? selectedAssets.length : undefined}
                  onClick={() => setOpenPopover(openPopover === 'asset' ? null : 'asset')}
                />
                <FilterPopover
                  isOpen={openPopover === 'asset'}
                  onClose={() => setOpenPopover(null)}
                  title="Asset"
                >
                  <div className="p-2 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search assets..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {assets.filter(asset => (asset.name || asset.title || '').toLowerCase().includes(locationSearch.toLowerCase())).map((asset) => {
                        const assetId = asset._id || asset.id;
                        const assetName = asset.name || asset.title || 'Unknown Asset';
                        return (
                          <label key={assetId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedAssets.includes(assetName)}
                              onChange={(e) => {
                                const newAssets = e.target.checked
                                  ? [...selectedAssets, assetName]
                                  : selectedAssets.filter(a => a !== assetName);
                                setSelectedAssets(newAssets);
                              }}
                            />
                            <span className="text-sm font-bold text-gray-700 line-clamp-1">{assetName}</span>
                          </label>
                        );
                      })}
                      {assets.length === 0 && <div className="p-4 text-center text-xs text-gray-400 font-medium italic">No assets found</div>}
                    </div>
                  </div>
                </FilterPopover>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedStatuses(['OPEN', 'IN PROGRESS']);
                setSelectedPriorities([]);
                setSelectedLocations([]);
                setSelectedAssets([]);
                setSelectedAssignedTo([]);
                setOpenPopover(null);
              }}
              className="px-2 py-1 text-[11px] font-bold text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors ml-2"
            >
              Reset Filters
            </button>
            <button className="px-2 py-1 text-[11px] font-bold text-gray-400 hover:text-gray-600 ml-auto">
              Save View
            </button>
          </div>
        </div>

        {/* Main Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white/30 backdrop-blur-sm relative z-0">
          <div id="dashboard-content">
            {loading && !hasLoadedDashboard ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-sm font-medium text-gray-500">Loading data...</p>
              </div>
            ) : activeTab === 'overview' ? (
              <OverviewTab
                summary={summary}
                pendingRequests={pendingRequests}
                issues={issues}
                technicians={technicians}
                setActiveTab={setActiveTab}
                onOpenDetails={openDetailModal}
                getAssignedTechName={getAssignedTechName}
                aiSentiment={aiSentiment}
                loadingAI={loadingAI}
                aiError={aiError}
                aiRecommendations={aiRecommendations}
                loadingRecs={loadingRecs}
                recsError={recsError}
                exportToPDF={exportToPDF}
                exportToExcel={exportToExcel}
              />
            ) : activeTab === 'requests' ? (
              <RequestsTab
                pendingRequests={pendingRequests}
                setSelectedRequest={setSelectedRequest}
                setShowApprovalModal={setShowApprovalModal}
                onOpenDetails={openDetailModal}
                onSubmitRequest={() => openWorkOrderModal('Submit Request')}
                technicians={technicians}
                assigning={assigning}
                assignmentData={assignmentData}
                setAssignmentData={setAssignmentData}
                handleOpenAssignment={handleOpenAssignment}
                handleAssignTech={handleAssignTech}
                onRefresh={fetchDashboardData}
              />
            ) : activeTab === 'material-requests' ? (
              <MaterialRequestsTab
                materialRequests={materialRequests}
                onRefresh={fetchMaterialRequests}
                onOpenDetails={openDetailModal}
              />
            ) : activeTab === 'subscriptions' ? (
              <SubscriptionManagement />
            ) : activeTab === 'settings' ? (
              <SystemSettingsTab />
            ) : activeTab === 'issues' ? (
              <IssuesTab
                issues={getFilteredIssues()}
                technicians={technicians}
                assigning={assigning}
                assignmentData={assignmentData}
                setAssignmentData={setAssignmentData}
                handleOpenAssignment={handleOpenAssignment}
                handleAssignTech={handleAssignTech}
                getAssignedTechName={getAssignedTechName}
                onOpenDetails={openDetailModal}
                onCreateWorkOrder={() => openWorkOrderModal('Create Work Order')}
                onRefresh={fetchDashboardData}
              />
            ) : activeTab === 'all-issues' ? (
              <AllIssuesTab
                filters={filters}
                setFilters={setFilters}
                getFilteredIssues={getFilteredIssues}
                getAssignedTechName={getAssignedTechName}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onRefresh={fetchDashboardData}
              />
            ) : activeTab === 'preventive-maintenance' ? (
              selectedPreventive ? (
                <PreventiveMaintenanceDetail
                  schedule={selectedPreventive}
                  onBack={() => setSelectedPreventive(null)}
                  onEdit={(item) => {
                    setDetailModal({ open: true, type: 'issue', item });
                  }}
                  onAddAsset={(item) => {
                    alert('Add Asset functionality for ' + (item.title || item.name));
                  }}
                  technicians={technicians}
                  locations={locations}
                  assets={assets}
                />
              ) : (
                <PreventiveMaintenanceTab
                  issues={allIssues.filter(i => (
                    i.isPreventive ||
                    i.type === 'PREVENTIVE' ||
                    i.issueType === 'preventive' ||
                    i.category === 'preventive' ||
                    (Array.isArray(i.tags) && i.tags.includes('preventive'))
                  ))}
                  technicians={technicians}
                  locations={locations}
                  assets={assets}
                  onRefresh={fetchDashboardData}
                  onOpenDetails={(type, item) => setSelectedPreventive(item)}
                />
              )
            ) : activeTab === 'scheduler' ? (
              <SchedulerTab
                issues={allIssues}
                technicians={technicians}
              />
            ) : activeTab === 'analytics' ? (
              <AnalyticsTab
                issues={allIssues}
                technicians={technicians}
                aiSentiment={aiSentiment}
                aiRecommendations={aiRecommendations}
                loadingAI={loadingAI}
                loadingRecs={loadingRecs}
              />
            ) : activeTab === 'meters' ? (
              <MetersTab />
            ) : activeTab === 'edge' ? (
              <EdgeTab />
            ) : activeTab === 'assets' ? (
              <AssetsTab
                assets={assets}
                onAssetsUpdated={(ids) => setAssets((prev) => (prev || []).filter((asset) => !ids.includes(String(asset._id || asset.id))))}
              />
            ) : activeTab === 'locations' ? (
              <LocationsTab
                locations={locations || []}
                assets={assets}
                onLocationUpdated={(updated) => {
                  if (!updated) return;
                  const updatedId = String(updated._id || updated.id || '');
                  setLocations((prev) => prev.map((loc) => (
                    String(loc._id || loc.id || '') === updatedId ? { ...loc, ...updated } : loc
                  )));
                }}
                onLocationDeleted={(ids) => {
                  setLocations((prev) => (prev || []).filter((loc) => !ids.includes(String(loc._id || loc.id))));
                }}
              />

            ) : activeTab === 'people' ? (
              <PeopleTab
                technicians={technicians}
                teams={teams}
                allIssues={issues}
                onRefresh={fetchDashboardData}
              />
            ) : activeTab === 'user-management' ? (
              <UserManagementTab
                users={systemUsers}
                issues={allIssues}
              />
            ) : activeTab === 'company-management' ? (
              <CompanyManagementTab
                users={systemUsers}
                issues={allIssues}
                assets={assets}
                locations={locations}
              />
            ) : activeTab === 'checklists' ? (
              <ChecklistsTab />
            ) : activeTab === 'parts' ? (
              <PartsInventoryTab />
            ) : activeTab === 'purchase-orders' ? (
              <PurchaseOrdersTab />
            ) : activeTab === 'vendors' ? (
              <VendorsTab type="vendor" />
            ) : activeTab === 'customers' ? (
              <VendorsTab type="customer" />
            ) : activeTab === 'contact-messages' ? (
              <AdminChat />
            ) : (
              <FeedbackTab
                feedbacks={feedbacks}
                loadingFeedbacks={loadingFeedbacks}
              />
            )}
          </div>
        </div>
      </main>
   
      {/* Enhanced Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <GlassCard className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Review Request
                  </h2>
                  <p className="text-gray-600 mt-1">Approve or decline this maintenance request</p>
                </div>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedRequest(null);
                    setDeclineReason('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-gray-500 hover:text-gray-700">×</span>
                </button>
              </div>

              {/* Request Details */}
              <div className="space-y-6">
                {/* Header with image */}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 flex flex-col gap-4">
                    {/* Before/Request Image */}
                    {(selectedRequest.beforePhoto || selectedRequest.photo || selectedRequest.image || selectedRequest.beforeImage) && (
                      <div className="rounded-2xl overflow-hidden shadow-lg">
                        <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 px-4 block bg-white/80">Before</span>
                        <img
                          src={getImageUrl(selectedRequest.beforeImage || selectedRequest.beforePhoto || selectedRequest.photo || selectedRequest.image)}
                          alt="Before"
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* After Image */}
                    {(selectedRequest.afterImage || selectedRequest.afterPhoto) && (
                      <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-green-100">
                        <span className="text-[10px] uppercase font-bold text-green-600 mb-1 px-4 block bg-green-50">After</span>
                        <img
                          src={getImageUrl(selectedRequest.afterImage || selectedRequest.afterPhoto)}
                          alt="After"
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{selectedRequest.title}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <PriorityBadge priority={selectedRequest.priority || 'MEDIUM'} />
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {selectedRequest.location}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{selectedRequest.description}</p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Submitted</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedRequest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Client</p>
                    <p className="font-semibold text-gray-900">Registered Client</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-semibold text-gray-900">Maintenance</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Urgency</p>
                    <div className="w-24">
                      <PriorityBadge priority={selectedRequest.priority || 'MEDIUM'} />
                    </div>
                  </div>
                </div>

                {/* Decline Reason */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      Decline Reason (Optional)
                    </span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows="3"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Provide a reason for declining this request..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <GradientButton
                    onClick={() => handleApproveRequest(selectedRequest._id)}
                    color="green"
                    className="flex-1 py-4"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-5 h-5" />
                      Approve Request
                    </span>
                  </GradientButton>
                  <GradientButton
                    onClick={handleDeclineRequest}
                    color="red"
                    className="flex-1 py-4"
                    disabled={!declineReason.trim()}
                  >
                    <span className="flex items-center justify-center gap-3">
                      <AlertCircle className="w-5 h-5" />
                      Decline Request
                    </span>
                  </GradientButton>
                  <button
                    onClick={() => {
                      setShowApprovalModal(false);
                      setSelectedRequest(null);
                      setDeclineReason('');
                    }}
                    className="flex-1 px-6 py-4 bg-gradient-to-b from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 border border-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
      {showWorkOrderModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-surface-strong rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden border border-white/40 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/40">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{workOrderModalTitle}</h3>
                <p className="text-xs text-slate-500">Provide details to create a new request or work order.</p>
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
                submitLabel={workOrderModalTitle === 'Create Work Order' ? 'Create Work Order' : 'Submit Request'}
                onCancel={() => setShowWorkOrderModal(false)}
                onSubmitted={() => {
                  setShowWorkOrderModal(false);
                  fetchDashboardData();
                }}
                showSidebar
              />
            </div>
          </div>
        </div>
      )}
      <DetailsModal
        open={detailModal.open}
        type={detailModal.type}
        item={detailModal.item}
        onClose={closeDetailModal}
        getAssignedTechName={getAssignedTechName}
        technicians={technicians}
        teams={teams}
        onPrivateMessage={openDirectMessageComposer}
        onRefresh={() => {
          if (detailModal.type === 'material') {
            fetchMaterialRequests();
          } else {
            fetchDashboardData();
          }
        }}
      />
      <CommentModal
        open={commentModal.open}
        item={commentModal.item}
        userName={userName}
        people={technicians}
        onClose={closeCommentModal}
        onPosted={handleCommentPosted}
      />
      <DirectMessageModal
        open={directMessageModal.open}
        recipientName={directMessageModal.recipientName}
        message={directMessageModal.message}
        sending={directMessageModal.sending}
        onChange={(value) => setDirectMessageModal(prev => ({ ...prev, message: value }))}
        onClose={closeDirectMessageModal}
        onSend={handleSendDirectMessage}
      />
    </div>
    </div>
  );
}


const OverviewCards = ({ summary = {}, pendingRequests = [], issues = [], technicians = [], onOpenTab }) => {
  const totalIssues = summary.totalIssues ?? summary.issuesCount ?? (Array.isArray(issues) ? issues.length : 0) ?? 0;
  const completed = summary.completed ?? 0;
  const completionRate = summary.completionRate ?? (totalIssues ? Math.round((completed / Math.max(1, totalIssues)) * 100) : (completed ? Math.round(completed * 100) : 0));
  const openRequests = Array.isArray(pendingRequests) ? pendingRequests.length : (summary.pendingRequests ?? summary.pending ?? 0);
  const techniciansCount = Array.isArray(technicians) ? technicians.length : (summary.techniciansCount ?? summary.techCount ?? 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[
        { label: 'Total Issues', value: totalIssues, tab: 'issues', tone: 'from-blue-600 to-cyan-600', border: 'border-blue-100' },
        { label: 'Completion Rate', value: `${completionRate}%`, tab: 'issues', tone: 'from-emerald-600 to-teal-600', border: 'border-emerald-100' },
        { label: 'Pending Approvals', value: openRequests, tab: 'requests', tone: 'from-amber-600 to-orange-600', border: 'border-amber-100' },
        { label: 'Users', value: techniciansCount, tab: 'people', tone: 'from-slate-700 to-slate-900', border: 'border-slate-200' }
      ].map((card) => (
        <button
          key={card.label}
          onClick={() => onOpenTab && onOpenTab(card.tab)}
          className={`group p-5 rounded-2xl border ${card.border} glass-surface-strong shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">{card.label}</div>
              <div className="text-2xl font-black text-gray-900 mt-2">{card.value}</div>
            </div>
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.tone} text-white flex items-center justify-center text-xs font-bold shadow-md border border-white/30`}>
              {String(card.value).slice(0, 2)}
            </div>
          </div>
          <div className="mt-3 text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view list
          </div>
        </button>
      ))}
    </div>
  );
};

// Simple gradient button used across the dashboard when the original
// shared component isn't available in this file. Keep styling minimal
// and support `color`, `className`, `onClick`, `disabled` props.
const GradientButton = ({ children, color = 'blue', className = '', onClick, disabled }) => {
  const base = `inline-flex items-center justify-center rounded-lg font-semibold shadow-sm ${className}`;
  const colors = {
    blue: 'bg-gradient-to-b from-blue-600 to-blue-500 text-white border border-blue-600',
    green: 'bg-gradient-to-b from-green-600 to-green-500 text-white border border-green-600',
    red: 'bg-gradient-to-b from-red-600 to-red-500 text-white border border-red-600',
    orange: 'bg-gradient-to-b from-orange-500 to-orange-400 text-white border border-orange-500'
  };
  const cls = `${base} ${colors[color] || colors.blue} ${disabled ? 'opacity-60 pointer-events-none' : ''}`;
  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

const OverviewTab = ({
  summary,
  pendingRequests,
  issues,
  technicians,
  setActiveTab,
  onOpenDetails,
  getAssignedTechName,
  aiSentiment,
  loadingAI,
  aiError,
  aiRecommendations,
  aiSummary,
  loadingRecs,
  loadingSummary,
  recsError,
  summaryError,
  exportToPDF,
  exportToExcel
}) => {
  const [privateNote, setPrivateNote] = useState('');
  const [mentionNotifications, setMentionNotifications] = useState([]);
  const [noteReady, setNoteReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadSideData = async () => {
      try {
        const [noteRes, mentionsRes] = await Promise.all([
          api.get('/api/private-notes/me', { params: { scope: 'manager-dashboard' } }),
          api.get('/api/notifications', { params: { type: 'mention', limit: 6 } })
        ]);
        if (cancelled) return;
        setPrivateNote(noteRes?.data?.content || '');
        setMentionNotifications(Array.isArray(mentionsRes?.data) ? mentionsRes.data : []);
      } catch (err) {
        console.error('Failed to load manager overview side data', err);
      } finally {
        if (!cancelled) setNoteReady(true);
      }
    };
    loadSideData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!noteReady) return;
    const timer = setTimeout(async () => {
      try {
        await api.put('/api/private-notes/me', {
          scope: 'manager-dashboard',
          content: privateNote
        });
      } catch (err) {
        console.error('Failed to save manager private note', err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [noteReady, privateNote]);

  const combinedItems = [...(Array.isArray(pendingRequests) ? pendingRequests : []), ...(Array.isArray(issues) ? issues : [])]
    .filter((item, index, arr) => index === arr.findIndex((other) => String(other?._id || other?.id) === String(item?._id || item?.id)));

  const managerTasks = combinedItems
    .flatMap((item) => {
      const rawTasks = Array.isArray(item?.tasks) && item.tasks.length
        ? item.tasks
        : Array.isArray(item?.taskList) && item.taskList.length
          ? item.taskList
          : Array.isArray(item?.checklist)
            ? item.checklist
            : [];

      return rawTasks.map((task, idx) => {
        const normalized = typeof task === 'string' ? { title: task } : (task || {});
        const status = String(normalized.status || (normalized.completed ? 'COMPLETED' : 'OPEN')).toUpperCase();
        const dueDate = normalized.dueDate || normalized.deadline || normalized.due || item.fixDeadline || item.dueDate || null;
        return {
          id: normalized.id || normalized._id || `${item._id || item.id}-task-${idx}`,
          title: normalized.title || normalized.text || normalized.name || `Task ${idx + 1}`,
          parentTitle: item.title || 'Work order',
          completed: status.includes('COMPLETE'),
          overdue: dueDate ? new Date(dueDate) < new Date() && !status.includes('COMPLETE') : false
        };
      });
    })
    .slice(0, 6);

  const mentionItems = Array.isArray(mentionNotifications) ? mentionNotifications : [];

  return (
  <div className="space-y-8">
    {/* Overview Cards */}
    <OverviewCards
      summary={summary}
      pendingRequests={pendingRequests}
      issues={issues}
      technicians={technicians}
      onOpenTab={setActiveTab}
    />

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Team Work Orders</h3>
            <p className="text-sm text-gray-500 mt-1">Recent requests and work orders your team is handling.</p>
          </div>
          <GradientButton onClick={() => setActiveTab('issues')} color="blue" className="px-3 py-2 text-sm">Open List</GradientButton>
        </div>
        <div className="space-y-3">
          {combinedItems.slice(0, 5).map((item) => (
            <button
              key={`overview-item-${item._id || item.id}`}
              onClick={() => onOpenDetails && onOpenDetails(item)}
              className="w-full rounded-2xl border border-gray-100 bg-white/70 px-4 py-3 text-left hover:border-blue-200 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{item.title || 'Untitled work order'}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{item.location || item.address || 'No location yet'}</p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">
                  {String(item.status || 'Pending').replace(/_/g, ' ')}
                </span>
              </div>
            </button>
          ))}
          {combinedItems.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
              No team work orders yet.
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Team Tasks</h3>
            <p className="text-sm text-gray-500 mt-1">Checklist and task items across current work orders.</p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase text-amber-700">
            {managerTasks.filter((task) => !task.completed).length} Active
          </span>
        </div>
        <div className="space-y-3">
          {managerTasks.map((task) => (
            <div key={task.id} className="rounded-2xl border border-gray-100 bg-white/70 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{task.parentTitle}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                  task.completed ? 'bg-emerald-50 text-emerald-700' : task.overdue ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {task.completed ? 'Completed' : task.overdue ? 'Overdue' : 'Open'}
                </span>
              </div>
            </div>
          ))}
          {managerTasks.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
              No task items found yet.
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="mb-5">
          <h3 className="text-xl font-bold text-gray-900">Private Notepad</h3>
          <p className="text-sm text-gray-500 mt-1">Personal follow-ups and reminders for this manager account on this browser.</p>
        </div>
        <textarea
          value={privateNote}
          onChange={(e) => setPrivateNote(e.target.value)}
          placeholder="Capture calls to make, approvals to review, or anything you want to remember..."
          className="min-h-[220px] w-full rounded-2xl border border-gray-200 bg-white/70 px-4 py-4 text-sm text-gray-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Comments Mentioning Me</h3>
            <p className="text-sm text-gray-500 mt-1">Messages that currently include your name or email.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-slate-700">
            {mentionItems.length} Recent
          </span>
        </div>
        <div className="space-y-3">
            {mentionItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.link) window.location.href = item.link;
                }}
                className="w-full rounded-2xl border border-gray-100 bg-white/70 px-4 py-3 text-left hover:border-blue-200 hover:shadow-sm transition"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{item.title}</p>
                <p className="mt-1 text-sm text-gray-800 line-clamp-2">{item.message}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {item.type || 'mention'}
                  {item.createdAt ? ` • ${new Date(item.createdAt).toLocaleString()}` : ''}
                </p>
              </button>
            ))}
          {mentionItems.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
              No mentions found yet.
            </div>
          )}
        </div>
      </GlassCard>
    </div>

    {/* AI Insights Section */}
    <AIInsights
      aiSentiment={aiSentiment}
      loadingAI={loadingAI}
      aiError={aiError}
      aiRecommendations={aiRecommendations}
      aiSummary={aiSummary}
      loadingRecs={loadingRecs}
      loadingSummary={loadingSummary}
      recsError={recsError}
      summaryError={summaryError}
      exportToPDF={exportToPDF}
      exportToExcel={exportToExcel}
    />

    {/* Grid Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pending Requests */}
      <GlassCard className="lg:col-span-2 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pending Approval Requests</h3>
            <p className="text-gray-600">Requests awaiting your review</p>
          </div>
          <GradientButton
            onClick={() => setActiveTab('requests')}
            color="orange"
            className="px-4 py-2 text-sm"
          >
            View All
          </GradientButton>
        </div>
        <div className="space-y-4">
          {pendingRequests.slice(0, 4).map((request, i) => (
            <div
              key={request._id || request.id || `pending-${i}`}
              onClick={() => onOpenDetails && onOpenDetails('request', request)}
              className="group p-4 bg-gradient-to-r from-white to-orange-50 rounded-xl border border-orange-100 hover:border-orange-200 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                      {request.title}
                    </h4>
                    <p className="text-sm text-gray-600">{request.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={request.priority || 'MEDIUM'} />
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
          {pendingRequests.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">All Clear!</h4>
              <p className="text-gray-600">No pending requests to review</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Technician Stats */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Top Technicians</h3>
            <p className="text-gray-600">Based on completion rate</p>
          </div>
          <Users className="w-6 h-6 text-purple-600" />
        </div>
        <div className="space-y-4">
          {technicians.slice(0, 3).map((tech, i) => (
            <div key={tech._id || tech.id || `tech-${i}`} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {tech.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{tech.name}</h4>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-700">95%</div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recent Activity */}
      <GlassCard className="lg:col-span-3 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Recent Activity</h3>
            <p className="text-gray-600">Latest updates across all issues</p>
          </div>
          <Filter className="w-6 h-6 text-blue-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Issue</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Image</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Technician</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Priority</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.slice(0, 5).map((issue, i) => (
                <tr
                  key={issue._id || issue.id || `issue-${i}`}
                  onClick={() => onOpenDetails && onOpenDetails('issue', issue)}
                  className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{issue.title}</div>
                    <div className="text-sm text-gray-600 truncate max-w-xs">{issue.description}</div>
                  </td>
                  <td className="py-4 px-4">
                    {getImageUrl(issue.photo || issue.image || issue.beforePhoto) ? (
                      <img
                        src={getImageUrl(issue.photo || issue.image || issue.beforePhoto)}
                        alt={issue.title}
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
                    <div className="text-sm font-medium text-gray-900">{getAssignedTechName(issue)}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`text-sm font-medium ${(issue.fixDeadline || issue.dueDate) && normalizeDate(issue.fixDeadline || issue.dueDate) < new Date() ? 'text-rose-600' : 'text-gray-900'}`}>
                      {(issue.fixDeadline || issue.dueDate) ? normalizeDate(issue.fixDeadline || issue.dueDate).toLocaleDateString() : 'Not set'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <PriorityBadge priority={issue.priority || 'MEDIUM'} />
                  </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); onOpenDetails && onOpenDetails('issue', issue); }} className="p-2 hover:bg-blue-100 rounded-lg transition-colors" title="Open details">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); openCommentModal(issue); }} className="p-2 hover:bg-indigo-100 rounded-lg transition-colors" title="Open comments">
                            <MessageSquare className="w-4 h-4 text-indigo-600" />
                          </button>
                          <button onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-green-100 rounded-lg transition-colors" title="Edit">
                            <Edit className="w-4 h-4 text-green-600" />
                          </button>
                        </div>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  </div>
  );
};

// Enhanced Requests Tab with Table
const RequestsTab = ({
  pendingRequests,
  setSelectedRequest,
  setShowApprovalModal,
  onOpenDetails,
  onSubmitRequest,
  technicians,
  assigning,
  assignmentData,
  setAssignmentData,
  handleOpenAssignment,
  handleAssignTech,
  onRefresh
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const filteredRequests = React.useMemo(() => {
    const query = localSearch.trim().toLowerCase();
    if (!query) return pendingRequests;
    return (pendingRequests || []).filter((request) => {
      const haystack = [
        request.title,
        request.description,
        request.assetName,
        request.asset?.name,
        request.location,
        request.category,
        request.issueType,
        request.type,
        request.name,
        request.requestorName,
        request.userName,
        request.email,
        request.priority,
        request.status,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [pendingRequests, localSearch]);
  const selection = useBulkSelection(filteredRequests, (request) => request._id || request.id);
  const requestStatusColor = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'APPROVED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'DECLINED' || s === 'REJECTED') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (s === 'SUBMITTED' || s === 'PENDING') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selection.selectedIds.length} request(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(selection.selectedIds.map((id) => api.delete(`/api/issues/${id}`)));
      selection.clear();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete requests', err);
      alert('Failed to delete selected requests: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Approval Requests</h2>
            <p className="text-gray-600">Review and approve client maintenance requests</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search requests..."
                className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <button
              onClick={() => onSubmitRequest && onSubmitRequest()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700"
            >
              Submit Request
            </button>
            <div className="px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
              <span className="text-orange-700 font-semibold">{filteredRequests.length} pending</span>
            </div>
          </div>
        </div>
      </div>

      <BulkActionBar count={selection.selectedIds.length} label="requests" onDelete={handleDeleteSelected} />

      {filteredRequests.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">All Clear!</h3>
          <p className="text-gray-600 mb-6">No pending requests to review</p>
          <GradientButton color="green" className="px-8">
            View Completed Requests
          </GradientButton>
        </GlassCard>
      ) : (
        <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-left border-collapse text-sm">
              <thead className="glass-surface border-b border-white/10 text-[11px] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-3 px-3 w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selection.allSelected}
                      onChange={(e) => selection.toggleAll(e.target.checked)}
                    />
                  </th>
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
                {filteredRequests.map((request, i) => {
                  const reqId = request._id || request.id;
                  const title = request.title || request.items?.[0]?.title || 'Untitled';
                  const imagePath = request.beforePhoto || request.photo || request.image || request.beforeImage || request.afterImage || request.afterPhoto || (Array.isArray(request.files) ? request.files[0] : null);
                  const imageUrl = imagePath ? getImageUrl(imagePath) : '';
                  const asset = request.assetName || request.asset?.name || request.asset || request.location || '—';
                  const rawStatus = String(request.status || '').toUpperCase();
                  const isDeclined = request.rejected || rawStatus === 'DECLINED' || rawStatus === 'REJECTED';
                  const isApproved = request.approved || rawStatus === 'APPROVED';
                  const rawWorkOrderStatus = request.workOrderStatus || request.workOrder?.status || request.workOrderState || request.issueStatus || request.workOrderStatusLabel || '';
                  const normalizedWorkOrder = String(rawWorkOrderStatus || '').toUpperCase();
                  const workOrderLabel = normalizedWorkOrder.includes('PROGRESS') ? 'IN PROGRESS'
                    : normalizedWorkOrder.includes('COMPLETE') ? 'COMPLETED'
                      : normalizedWorkOrder.includes('OPEN') ? 'OPEN'
                        : isApproved ? 'OPEN' : '—';
                  const hasWorkOrderRef = !!(request.workOrderId || request.workOrderNumber || request.workOrderNo || request.workOrder);
                  const statusLabel = isDeclined
                    ? 'DECLINED'
                    : (isApproved || hasWorkOrderRef || workOrderLabel !== '—')
                      ? 'APPROVED'
                      : 'SUBMITTED';
                  const submittedAt = request.createdAt || request.submittedAt || request.date || null;
                  const submittedBy = request.name || request.requestorName || request.userName || request.email || '—';
                  const category = request.category || request.issueType || request.type || request.submissionType || '—';
                  const priorityValue = String(request.priority || 'MEDIUM').toUpperCase();
                  const priorityClass = priorityValue === 'URGENT' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                    priorityValue === 'HIGH' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      priorityValue === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-blue-100 text-blue-700 border-blue-200';
                  const workOrderClass = workOrderLabel === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : workOrderLabel === 'IN PROGRESS'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : workOrderLabel === 'OPEN'
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-gray-50 text-gray-400 border-gray-200';

                  return (
                    <React.Fragment key={reqId || `pending-${i}`}>
                      <tr
                        onClick={() => onOpenDetails && onOpenDetails('request', request)}
                        className="hover:bg-white/40 transition-all cursor-pointer group/row"
                      >
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selection.selectedIds.includes(String(reqId))}
                            onChange={() => selection.toggleOne(reqId)}
                          />
                        </td>
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
                              —
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
                          {submittedAt && !isNaN(new Date(submittedAt).getTime()) ? (
                            <div>
                              <div className="text-xs font-semibold text-gray-700">
                                {new Date(submittedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {new Date(submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ) : '—'}
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
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${priorityClass}`}>
                            {priorityValue}
                          </span>
                        </td>
                      </tr>
                      {assigning === normalizeId(reqId) && (
                        <tr>
                          <td colSpan="10" className="p-0 border-b border-gray-50">
                            <AssignmentForm
                              assignmentData={assignmentData}
                              setAssignmentData={setAssignmentData}
                              technicians={technicians}
                              onAssign={() => handleAssignTech(normalizeId(reqId))}
                              onCancel={() => handleOpenAssignment(null)}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Material Requests Tab
const MaterialRequestsTab = ({ materialRequests = [], onRefresh, onOpenDetails }) => {
  const [forwardModal, setForwardModal] = useState(null); // holds the request being forwarded
  const [clientEmail, setClientEmail] = useState('');
  const [forwarding, setForwarding] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const urgencyColor = (u) => {
    const map = {
      URGENT: 'bg-rose-100 text-rose-700 border-rose-200',
      HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
      MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
      LOW: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return map[u] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const statusColor = (s) => {
    const map = {
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      FORWARDED: 'bg-blue-50 text-blue-700 border-blue-200',
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      DECLINED: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return map[s] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const statusIcon = (s) => {
    if (s === 'PENDING') return <Clock className="w-3.5 h-3.5" />;
    if (s === 'FORWARDED') return <ArrowUpRight className="w-3.5 h-3.5" />;
    if (s === 'APPROVED') return <CheckCircle className="w-3.5 h-3.5" />;
    if (s === 'DECLINED') return <X className="w-3.5 h-3.5" />;
    return <Package className="w-3.5 h-3.5" />;
  };

  const filtered = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (filterStatus === 'ALL'
      ? materialRequests
      : materialRequests.filter((r) => r.status === filterStatus)
    ).filter((req) => {
      if (!query) return true;
      const haystack = [
        req.requestId,
        req.technicianName,
        req.description,
        req.issueId,
        req.status,
        req.urgency,
        ...(Array.isArray(req.items) ? req.items.flatMap((item) => [item?.title, item?.name, item?.materialId]) : []),
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [filterStatus, materialRequests, searchQuery]);
  const selection = useBulkSelection(filtered, (req) => req.id || req._id);

  const counts = {
    ALL: materialRequests.length,
    PENDING: materialRequests.filter(r => r.status === 'PENDING').length,
    FORWARDED: materialRequests.filter(r => r.status === 'FORWARDED').length,
    APPROVED: materialRequests.filter(r => r.status === 'APPROVED').length,
    DECLINED: materialRequests.filter(r => r.status === 'DECLINED').length,
  };

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selection.selectedIds.length} material request(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(selection.selectedIds.map((id) => api.delete(`/api/material-requests/${id}`)));
      selection.clear();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete material requests', err);
      showToast(err.response?.data?.error || 'Failed to delete selected requests', 'error');
    }
  };

  const handleForward = async () => {
    if (!clientEmail.trim()) {
      showToast('Please enter a Client Email', 'error');
      return;
    }
    try {
      setForwarding(true);
      await api.post(`/api/material-requests/${forwardModal.id}/forward`, {
        clientEmail: clientEmail.trim(),
        issueId: forwardModal.issueId || null
      });
      showToast(`Request forwarded to client successfully!`);
      setForwardModal(null);
      setClientEmail('');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to forward request', 'error');
    } finally {
      setForwarding(false);
    }
  };

  return (
    <div className="relative">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 border ${toast.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {toast.type === 'error' ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Material Requests</h2>
            <p className="text-gray-500 text-sm">Review technician material requests and forward to clients for approval</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search material requests..."
                className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {['ALL', 'PENDING', 'FORWARDED', 'APPROVED', 'DECLINED'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterStatus === s ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {statusIcon(s)} {s} {counts[s] > 0 && <span className="ml-1 opacity-70">({counts[s]})</span>}
          </button>
        ))}
      </div>

      <BulkActionBar count={selection.selectedIds.length} label="material requests" onDelete={handleDeleteSelected} />

      {/* Table */}
      {filtered.length === 0 ? (
        <GlassCard className="p-16 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Requests Found</h3>
          <p className="text-gray-500 text-sm">
            {filterStatus === 'ALL' ? 'Technicians haven\'t submitted any material requests yet.' : `No ${filterStatus.toLowerCase()} requests at this time.`}
          </p>
        </GlassCard>
      ) : (
        <div className="glass-surface-strong rounded-2xl overflow-hidden shadow-2xl border border-white/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="glass-surface border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selection.allSelected}
                      onChange={(e) => selection.toggleAll(e.target.checked)}
                    />
                  </th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Request ID</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Technician</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Urgency</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((req, idx) => {
                  const reqId = req.id || req._id;
                  const materialTitle = req.items?.[0]?.title || req.items?.[0]?.materialId || '—';
                  const qty = req.items?.[0]?.quantity ?? '—';
                  return (
                    <tr
                      key={reqId || idx}
                      onClick={() => onOpenDetails && onOpenDetails('material', req)}
                      className="hover:bg-white/10 backdrop-blur-sm transition-all group cursor-pointer border-b border-white/5"
                    >
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selection.selectedIds.includes(String(reqId))}
                          onChange={() => selection.toggleOne(reqId)}
                        />
                      </td>
                      {/* Request ID */}
                      <td className="py-4 px-4">
                        <span className="text-xs font-bold text-purple-600 font-mono bg-purple-50 px-2 py-1 rounded">
                          #{String(reqId || '').slice(-6).toUpperCase()}
                        </span>
                      </td>
                      {/* Technician */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                            {(req.technicianName || 'T').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{req.technicianName || 'Technician'}</div>
                            <div className="text-xs text-gray-400 font-mono">{String(req.technicianId || '').slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      {/* Material */}
                      <td className="py-4 px-4">
                        <div className="text-sm font-semibold text-gray-900">{materialTitle}</div>
                        <div className="text-xs text-gray-400">{req.items?.length > 1 ? `+${req.items.length - 1} more` : ''}</div>
                      </td>
                      {/* Description */}
                      <td className="py-4 px-4 max-w-[200px]">
                        <p className="text-sm text-gray-600 line-clamp-2">{req.description || '—'}</p>
                      </td>
                      {/* Quantity */}
                      <td className="py-4 px-4">
                        <span className="text-sm font-bold text-gray-800">{qty}</span>
                      </td>
                      {/* Urgency */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${urgencyColor(req.urgency)}`}>
                          {req.urgency || 'MEDIUM'}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(req.status)}`}>
                          {statusIcon(req.status)} {req.status || 'PENDING'}
                        </span>
                        {req.clientResponse && (
                          <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
                            Client: {req.clientResponse}
                          </div>
                        )}
                      </td>
                      {/* Date */}
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {req.createdAt ? new Date(req.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        {req.status === 'PENDING' ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setForwardModal(req); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
                          >
                            📤 Forward to Client
                          </button>
                        ) : req.status === 'FORWARDED' ? (
                          <span className="text-xs text-blue-500 font-semibold italic">Awaiting client…</span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium capitalize">{req.status?.toLowerCase()}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Forward to Client Modal */}
      {forwardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Forward to Client</h3>
                  <p className="text-gray-500 text-sm mt-0.5">Send this material request to the issue owner for approval</p>
                </div>
                <button
                  onClick={() => { setForwardModal(null); setClientEmail(''); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Request summary */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 mb-5 border border-purple-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-blue-600 text-sm font-bold">
                    {(forwardModal.technicianName || 'T').charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{forwardModal.technicianName || 'Technician'}</div>
                    <div className="text-xs text-gray-500">Requesting materials</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  📦 {forwardModal.items?.[0]?.title || forwardModal.items?.[0]?.materialId || 'Material'}
                </div>
                {forwardModal.description && (
                  <p className="text-xs text-gray-600 mt-1 italic">{forwardModal.description}</p>
                )}
              </div>

              {/* Client Email input */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Client Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  placeholder="Enter the client's email here…"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  The request will be sent to the user associated with this email.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleForward}
                  disabled={forwarding}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-60 disabled:pointer-events-none"
                >
                  {forwarding ? 'Sending...' : 'Forward Request'}
                </button>
                <button
                  onClick={() => { setForwardModal(null); setClientEmail(''); }}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Scheduler Tab Component
const SchedulerTab = ({ issues, technicians }) => {

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('Day');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUnscheduled, setShowUnscheduled] = useState(true);
  const [schedulerPopover, setSchedulerPopover] = useState(null); // 'unscheduled-status', 'unscheduled-priority', 'team-view', etc.

  // Local filters for unscheduled work orders
  const [unscheduledFilters, setUnscheduledFilters] = useState({
    status: [],
    priority: []
  });

  const getIssueDueDate = (issue) => {
    const raw = issue?.fixDeadline || issue?.dueDate || issue?.scheduledFor || issue?.nextDate || issue?.scheduleDate;
    if (!raw) return null;
    try {
      const dt = normalizeDate(raw);
      return dt instanceof Date && !isNaN(dt.getTime()) ? dt : null;
    } catch (e) {
      const dt = new Date(raw);
      return !isNaN(dt.getTime()) ? dt : null;
    }
  };

  const isCompletedStatus = (status) => {
    const s = String(status || '').toLowerCase();
    return s.includes('complete') || s === 'completed' || s === 'complete';
  };

  const isScheduledIssue = (issue) => {
    const hasAssignee = !!(issue.assignedTo || (Array.isArray(issue.assignees) && issue.assignees.length));
    const hasDate = !!getIssueDueDate(issue);
    return hasAssignee && hasDate && !isCompletedStatus(issue.status);
  };

  const cardsPerPage = 5;
  const filteredUnscheduled = issues.filter(issue => {
    if (isScheduledIssue(issue)) return false;
    if (unscheduledFilters.status.length > 0 && !unscheduledFilters.status.includes(issue.status)) return false;
    if (unscheduledFilters.priority.length > 0 && !unscheduledFilters.priority.includes(issue.priority)) return false;
    if (isCompletedStatus(issue.status)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredUnscheduled.length / cardsPerPage) || 1;
  const currentIssues = filteredUnscheduled.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);

  // Hardcoded time slots for the day view
  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  const parseSlotHour = (slotLabel) => {
    const [time, meridiem] = slotLabel.split(' ');
    const [hourStr] = time.split(':');
    let hour = Number(hourStr);
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    return hour;
  };

  const slotHourMap = timeSlots.map(parseSlotHour);

  const slotIndexForIssue = (issue) => {
    const dt = getIssueDueDate(issue);
    if (!dt) return 0;
    const hr = dt.getHours();
    let idx = slotHourMap.findIndex(h => h === hr);
    if (idx === -1) {
      idx = slotHourMap.findIndex(h => h > hr);
      if (idx === -1) idx = slotHourMap.length - 1;
    }
    return idx;
  };

  const isSameDay = (a, b) => {
    if (!a || !b) return false;
    return a.toDateString() === b.toDateString();
  };

  const scheduledForTech = (tech) => {
    const techId = String(tech?._id || tech?.id || tech?.userId || '');
    return (issues || []).filter(issue => {
      const assignedId = String(issue.assignedTo || (Array.isArray(issue.assignees) && issue.assignees[0]?.id) || '');
      if (!assignedId || assignedId !== techId) return false;
      const due = getIssueDueDate(issue);
      if (!due) return false;
      if (!isSameDay(due, currentDate)) return false;
      if (isCompletedStatus(issue.status)) return false;
      return true;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-amber-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityPill = (priority) => {
    switch (String(priority || '').toUpperCase()) {
      case 'HIGH': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'LOW': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handlePrevDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex flex-col gap-8 bg-transparent min-h-screen glass-theme-blue">
      {/* Unscheduled Work Orders Section */}
      <section className="transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Unscheduled Work Orders</h2>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-bold">{filteredUnscheduled.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 hover:bg-white rounded transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
              <span className="px-3 text-xs font-bold text-gray-600">Page {currentPage}/{totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 hover:bg-white rounded transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setSchedulerPopover(schedulerPopover === 'unscheduled-filters' ? null : 'unscheduled-filters')}
                className={`p-2 border rounded-lg hover:bg-gray-50 transition-colors ${unscheduledFilters.status.length > 0 || unscheduledFilters.priority.length > 0 ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <FilterPopover
                isOpen={schedulerPopover === 'unscheduled-filters'}
                onClose={() => setSchedulerPopover(null)}
                title="Filter Work Orders"
                className="min-w-[200px]"
              >
                <div className="p-2 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Priority</p>
                    <div className="space-y-1">
                      {['HIGH', 'MEDIUM', 'LOW'].map(p => (
                        <label key={p} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={unscheduledFilters.priority.includes(p)}
                            onChange={(e) => {
                              const newP = e.target.checked
                                ? [...unscheduledFilters.priority, p]
                                : unscheduledFilters.priority.filter(x => x !== p);
                              setUnscheduledFilters({ ...unscheduledFilters, priority: newP });
                              setCurrentPage(1);
                            }}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-xs font-medium text-gray-700">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex border-t border-gray-50 p-2 justify-end">
                  <button
                    onClick={() => { setUnscheduledFilters({ status: [], priority: [] }); setSchedulerPopover(null); }}
                    className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                  >
                    Reset
                  </button>
                </div>
              </FilterPopover>
            </div>

            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => setShowUnscheduled(!showUnscheduled)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              {showUnscheduled ? 'Hide Section' : 'Show Section'}
            </button>
          </div>
        </div>

        {showUnscheduled && (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide animate-in fade-in slide-in-from-top-4 duration-300">
            {currentIssues.map((issue, idx) => (
              <div key={issue._id || issue.id || idx} className="min-w-[280px] bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-gray-400">#{String(issue._id || issue.id).slice(-4).toUpperCase()}: {issue.title}</span>
                </div>
                <div className="flex items-center gap-4 mt-auto pt-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-50 border border-gray-100">
                    <Flag className={`w-3 h-3 ${getPriorityColor(issue.priority)} fill-current`} />
                    <span className="text-[10px] font-bold text-gray-600">{issue.priority || 'None'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 ml-auto">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">1 hours</span>
                  </div>
                </div>
              </div>
            ))}
            {currentIssues.length === 0 && (
              <div className="w-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 font-medium">No work orders matching filters</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Team Schedule Section */}
      <section className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Team Schedule</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1 shadow-sm">
              <button
                onClick={handleToday}
                className="px-3 py-1 bg-white shadow-sm border border-gray-200 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Today
              </button>
              <div className="flex items-center gap-3 px-3">
                <ChevronLeft
                  onClick={handlePrevDate}
                  className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                />
                <span className="text-xs font-extrabold text-gray-700 min-w-[180px] text-center">
                  {formatDate(currentDate)}
                </span>
                <ChevronRight
                  onClick={handleNextDate}
                  className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                />
              </div>
            </div>
            <div className="relative">
              <AlertCircle className="w-5 h-5 text-gray-300" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">109</span>
            </div>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>

            <div className="relative">
              <div
                onClick={() => setSchedulerPopover(schedulerPopover === 'view-type' ? null : 'view-type')}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer capitalize shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                {viewType}
                <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${schedulerPopover === 'view-type' ? 'rotate-180' : ''}`} />
              </div>

              <FilterPopover
                isOpen={schedulerPopover === 'view-type'}
                onClose={() => setSchedulerPopover(null)}
                title="Switch View"
                className="w-48"
              >
                <div className="p-1">
                  {['Day', 'Week', 'Month'].map(v => (
                    <button
                      key={v}
                      onClick={() => { setViewType(v); setSchedulerPopover(null); }}
                      className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${viewType === v ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </FilterPopover>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="flex-1 border border-gray-100 rounded-xl overflow-hidden flex flex-col bg-white shadow-sm">
          <div className="flex bg-[#fcfcfd] border-b border-gray-100">
            <div className="w-[280px] p-4 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members
            </div>
            {timeSlots.map(slot => (
              <div key={slot} className={`flex-1 py-4 text-center text-xs font-bold ${slot === '11:00 AM' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400'} border-l border-gray-100 uppercase tracking-widest`}>
                {slot}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto relative min-h-[400px]">
            {/* Current Time Indicator Line (Only visible if Today matches currentDate) */}
            {currentDate.toLocaleDateString() === new Date().toLocaleDateString() && (
              <div className="absolute top-0 bottom-0 left-[calc(280px+25.5%)] w-px bg-blue-600 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-600 border-2 border-white" />
              </div>
            )}

            <div className="divide-y divide-gray-50">
              {technicians.length > 0 ? technicians.map((tech, idx) => {
                const techIssues = scheduledForTech(tech);
                const slotBuckets = timeSlots.map(() => []);
                techIssues.forEach(issue => {
                  const slotIndex = slotIndexForIssue(issue);
                  slotBuckets[slotIndex].push(issue);
                });
                return (
                  <div key={tech._id || tech.id || idx} className="flex group">
                    <div className="w-[280px] p-4 flex items-center justify-between border-r border-gray-50 group-hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold">
                          {tech.name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{tech.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">Vendor / Customer</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-orange-500">{techIssues.length ? `${techIssues.length} tasks` : '0%'}</span>
                        <div className="w-3 h-3 rounded-full border border-gray-200" />
                      </div>
                    </div>
                    {timeSlots.map((slot, slotIdx) => (
                      <div key={slot} className="flex-1 border-l border-gray-50 p-2 group-hover:bg-gray-50/30 transition-colors">
                        <div className="flex flex-col gap-2">
                          {slotBuckets[slotIdx].map((issue) => (
                            <div
                              key={issue._id || issue.id || `${slotIdx}-${issue.title}`}
                              className={`px-2 py-1 rounded-lg border text-[10px] font-semibold ${getPriorityPill(issue.priority)}`}
                              title={issue.title}
                            >
                              <div className="line-clamp-1">{issue.title}</div>
                              <div className="text-[9px] text-gray-500 mt-0.5">{issue.location || issue.assetName || 'Scheduled'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }) : (
                <div className="p-8 text-center text-gray-400 text-sm italic">No technicians found</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
// Analytics Tab
const AnalyticsTab = ({ issues, technicians, aiSentiment, aiRecommendations, loadingAI, loadingRecs }) => {
  const [subTab, setSubTab] = useState('team-performance');
  const [dateRange, setDateRange] = useState('Last 90 Days');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showCustomRange, setShowCustomRange] = useState(false);

  const now = new Date();

  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metrics, setMetrics] = useState({
    completionRate: 0,
    topTechnician: null,
    topLocations: [],
    avgResponseHrs: 0,
    avgCycleHrs: 0,
    backlog: 0,
    upcomingPreventive: [],
    totalCost: 0,
    avgCost: 0,
    materialReqCount: 0,
    assetWithMostDowntime: null,
    utilizationByLocation: [],
    utilizationByCategory: []
  });

  useEffect(() => {
    let mounted = true;
    async function computeMetrics() {
      try {
        setLoadingMetrics(true);
        const [assetsRes, schedulesRes, materialReqsRes] = await Promise.all([
          api.get('/api/assets'),
          api.get('/api/maintenance-schedules'),
          api.get('/api/material-requests')
        ]);
        const assets = (assetsRes && assetsRes.data) || [];
        const schedules = (schedulesRes && schedulesRes.data) || [];
        const materialReqs = (materialReqsRes && materialReqsRes.data) || [];

        const totalCreated = issues.length;
        const totalCompleted = issues.filter(i => i.status && String(i.status).toLowerCase().includes('complete')).length;
        const completionRate = totalCreated ? Math.round((totalCompleted / totalCreated) * 100) : 0;

        // Top technicians
        const techCounts = {};
        issues.filter(i => i.status && String(i.status).toLowerCase().includes('complete')).forEach(i => {
          const techId = i.assignedTo || (Array.isArray(i.assignees) && i.assignees.length ? i.assignees[0].id : null);
          if (!techId) return;
          techCounts[techId] = (techCounts[techId] || 0) + 1;
        });
        const topTechId = Object.keys(techCounts).sort((a, b) => techCounts[b] - techCounts[a])[0] || null;
        const topTechnician = topTechId ? (technicians.find(t => t.id === topTechId || t._id === topTechId) || { id: topTechId, completed: techCounts[topTechId] }) : null;

        // Top locations
        const locCounts = {};
        issues.forEach(i => {
          const loc = i.location || i.address || i.propertyId || 'Unknown';
          locCounts[loc] = (locCounts[loc] || 0) + 1;
        });
        const topLocations = Object.entries(locCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([loc, count]) => ({ location: loc, count }));

        // Response & cycle times
        const responseTimes = issues.filter(i => i.status && !String(i.status).toLowerCase().includes('pending') && i.createdAt && i.updatedAt)
          .map(i => (new Date(i.updatedAt) - new Date(i.createdAt)) / 3600000);
        const avgResponseHrs = responseTimes.length ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;
        const cycleTimes = issues.filter(i => i.status && String(i.status).toLowerCase().includes('complete') && i.createdAt && i.updatedAt)
          .map(i => (new Date(i.updatedAt) - new Date(i.createdAt)) / 3600000);
        const avgCycleHrs = cycleTimes.length ? (cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) : 0;

        const backlog = issues.filter(i => !i.status || String(i.status).toLowerCase().includes('pending')).length;

        const upcomingPreventive = (schedules || []).filter(s => s && s.nextDate && new Date(s.nextDate) > new Date()).slice(0, 10);

        // Cost
        const assetCosts = assets.map(a => Number(a.purchaseCost || 0)).filter(c => !isNaN(c));
        const totalCost = assetCosts.reduce((a, b) => a + b, 0);
        const avgCost = assetCosts.length ? totalCost / assetCosts.length : 0;

        // Asset downtime and utilization
        const assetDowntimeMap = {};
        issues.forEach(i => {
          if (!i.assetId) return;
          const ft = Number(i.fixTime || i.time || 0);
          const hours = ft ? (ft / 60) : 0;
          assetDowntimeMap[i.assetId] = (assetDowntimeMap[i.assetId] || 0) + hours;
        });
        const assetDowntimes = Object.entries(assetDowntimeMap).map(([assetId, hrs]) => ({ assetId, hrs })).sort((a, b) => b.hrs - a.hrs);
        const assetWithMostDowntime = assetDowntimes[0] || null;

        const openAssetIds = new Set(issues.filter(i => !i.status || !String(i.status).toLowerCase().includes('complete')).map(i => i.assetId).filter(Boolean));
        const assetsByLocation = {};
        const assetsByCategory = {};
        assets.forEach(a => {
          const loc = (a.location && (a.location.building || a.location.room || a.location.floor)) || a.propertyId || 'Unknown';
          assetsByLocation[loc] = assetsByLocation[loc] || { total: 0, free: 0 };
          assetsByLocation[loc].total += 1;
          if (!openAssetIds.has(a.id) && !openAssetIds.has(a._id)) assetsByLocation[loc].free += 1;

          const cat = a.type || 'Unknown';
          assetsByCategory[cat] = assetsByCategory[cat] || { total: 0, free: 0 };
          assetsByCategory[cat].total += 1;
          if (!openAssetIds.has(a.id) && !openAssetIds.has(a._id)) assetsByCategory[cat].free += 1;
        });

        const utilizationByLocation = Object.entries(assetsByLocation).map(([loc, vals]) => ({ location: loc, utilization: vals.total ? Math.round((vals.free / vals.total) * 100) : 0 }));
        const utilizationByCategory = Object.entries(assetsByCategory).map(([cat, vals]) => ({ category: cat, utilization: vals.total ? Math.round((vals.free / vals.total) * 100) : 0 }));

        if (!mounted) return;
        setMetrics({
          completionRate,
          topTechnician,
          topLocations,
          avgResponseHrs: Number(avgResponseHrs.toFixed(2)),
          avgCycleHrs: Number(avgCycleHrs.toFixed(2)),
          backlog,
          upcomingPreventive,
          totalCost,
          avgCost: Number(avgCost.toFixed(2)),
          materialReqCount: (materialReqs || []).length,
          assetWithMostDowntime,
          utilizationByLocation,
          utilizationByCategory
        });
      } catch (e) {
        console.error('[AnalyticsTab] computeMetrics error', e);
      } finally {
        if (mounted) setLoadingMetrics(false);
      }
    }
    computeMetrics();
    return () => { mounted = false; };
  }, [issues, technicians]);

  const resolveRange = () => {
    const end = new Date(now);
    const start = new Date(now);
    if (dateRange === 'Last 7 Days') start.setDate(end.getDate() - 6);
    else if (dateRange === 'Last 30 Days') start.setDate(end.getDate() - 29);
    else if (dateRange === 'Last 90 Days') start.setDate(end.getDate() - 89);
    else if (dateRange === 'Last 12 Months') start.setMonth(end.getMonth() - 11);
    else if (dateRange === 'All Time') {
      start.setFullYear(end.getFullYear() - 5);
    } else if (dateRange === 'Do your Own Range' && customRange.start && customRange.end) {
      return { start: new Date(customRange.start), end: new Date(customRange.end) };
    }
    return { start, end };
  };

  const { start: rangeStart, end: rangeEnd } = resolveRange();
  const rangeDays = Math.max(1, Math.round((rangeEnd - rangeStart) / 86400000) + 1);

  const buildLabels = () => {
    const labels = [];
    let cursor = new Date(rangeStart);
    let step = 1;
    if (rangeDays > 120) step = 30;
    else if (rangeDays > 30) step = 7;
    else step = 1;
    while (cursor <= rangeEnd) {
      labels.push(cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      cursor.setDate(cursor.getDate() + step);
    }
    return labels;
  };

  const labels = buildLabels();

  const toBucketKey = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const inRangeIssues = (issues || []).filter(i => {
    if (!i.createdAt) return false;
    const dt = normalizeDate(i.createdAt);
    return dt >= rangeStart && dt <= rangeEnd;
  });
  const createdMap = {};
  const completedMap = {};
  labels.forEach(l => { createdMap[l] = 0; completedMap[l] = 0; });
  inRangeIssues.forEach(i => {
    const key = toBucketKey(normalizeDate(i.createdAt));
    if (createdMap[key] !== undefined) createdMap[key] += 1;
    if ((i.status || '').toString().toLowerCase().includes('complete')) {
      if (completedMap[key] !== undefined) completedMap[key] += 1;
    }
  });

  const created = labels.map(l => createdMap[l] || 0);
  const completed = labels.map(l => completedMap[l] || 0);
  const preventive = labels.map((_, i) => Math.round((created[i] + completed[i]) * 1.6));
  const reactive = labels.map((_, i) => Math.round(preventive[i] * 0.4));

  const maxCreated = Math.max(1, ...created, ...completed);
  const maxBar = Math.max(1, ...preventive);

  const svgW = 580, svgH = 180, pad = 30;
  const pW = svgW - pad * 2;
  const pH = svgH - pad * 2;
  const xStep = pW / Math.max(1, (labels.length - 1));

  const makeLinePath = (data, maxV) =>
    data.map((v, i) => `${i === 0 ? 'M' : 'L'}${pad + i * xStep},${pad + pH - (v / maxV) * pH}`).join(' ');

  const totalCreated = inRangeIssues.length;
  const totalCompleted = inRangeIssues.filter(i => i.status === 'COMPLETE' || i.status === 'COMPLETED').length;

  // Cost data (mock derived from issues)
  // Cost data derived from issue categories (approx)
  const categoryCounts = {};
  (issues || []).forEach(i => {
    const cat = i.category || (i.tags && i.tags.length ? (typeof i.tags[0] === 'string' ? i.tags[0] : i.tags[0].label) : 'Other') || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const costData = categoryEntries.map(([name, count], i) => ({ name, value: Math.round((metrics.avgCost || 0) * count), color: colors[i % colors.length] }));
  const totalCost = costData.reduce((s, c) => s + c.value, metrics.totalCost || 0);

  // Asset downtime derived from metrics (approx by category/location)
  const assetData = (metrics.utilizationByCategory || []).slice(0, 5).map(u => ({ name: u.category || u.location || 'Asset', uptime: u.utilization, downtime: Math.max(0, 100 - u.utilization) }));

  const subTabs = [
    { id: 'team-performance', label: 'Team Performance' },
    { id: 'cost-of-maintenance', label: 'Cost of Maintenance' },
    { id: 'asset-downtime', label: 'Asset Downtime and Utilization' },
  ];

  const dateRanges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 12 Months', 'All Time', 'Do your Own Range'];

  const formatRange = (val) => {
    if (!val) return '';
    try {
      return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return val;
    }
  };

  const dateRangeLabel = dateRange === 'Do your Own Range' && customRange.start && customRange.end
    ? `Custom: ${formatRange(customRange.start)} - ${formatRange(customRange.end)}`
    : dateRange;

  return (
    <div className="flex gap-6">
        {/* Main Chart Area */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="glass-surface rounded-2xl border border-white/20 p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-0">
                {subTabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSubTab(t.id)}
                    className={`px-4 pb-3 pt-1 text-sm font-bold border-b-2 transition-colors ${subTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Bell className="w-3.5 h-3.5" />
                  Manage Pins
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-600 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    View: {subTabs.find(t => t.id === subTab)?.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Tab Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{subTabs.find(t => t.id === subTab)?.label}</h2>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold text-gray-500 uppercase">Date Range</span>
              <div className="relative">
                <button
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  {dateRangeLabel}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showDateDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDateDropdown(false)} />
                    <div className="absolute top-full mt-1 left-0 z-50 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-1">
                      {dateRanges.map(r => (
                        <button
                          key={r}
                          onClick={() => {
                            setDateRange(r);
                            setShowDateDropdown(false);
                            setShowCustomRange(r === 'Do your Own Range');
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${r === dateRange ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                        >{r}</button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {showCustomRange && (
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">From</span>
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">To</span>
                  <input
                    type="date"
                    value={customRange.end}
                    onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700"
                  />
                </div>
                <button
                  onClick={() => setShowCustomRange(false)}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-100"
                >
                  Apply
                </button>
              </div>
            )}

            {subTab === 'team-performance' && (
              <div className="flex flex-col gap-6">
                {/* Created vs Completed toggle cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 text-center cursor-pointer">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Created</p>
                    <p className="text-2xl font-black text-blue-600">{totalCreated}</p>
                  </div>
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4 text-center cursor-pointer">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Completed</p>
                    <p className="text-2xl font-black text-green-600">{totalCompleted}</p>
                  </div>
                </div>

                {/* Line Chart: Created vs Completed */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-gray-700">Issues Over Time</p>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />Created</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" />Completed</span>
                    </div>
                  </div>
                  {/* Line chart: Created vs Completed (Recharts) */}
                  <div style={{ width: '100%', height: 220 }}>
                    {labels && (
                      <ResponsiveContainer>
                        <ReLineChart data={labels.map((label, i) => ({ date: label, created: created[i], completed: completed[i] }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={false} />
                        </ReLineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Big KPIs */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Created', value: totalCreated, color: 'text-blue-600' },
                    { label: 'Total Completed', value: totalCompleted, color: 'text-emerald-600' },
                    { label: 'Completion Rate', value: `${totalCreated ? Math.round((totalCompleted / totalCreated) * 100) : 0}%`, color: 'text-indigo-600' },
                  ].map(kpi => (
                    <div key={kpi.label} className="bg-gray-50 rounded-xl p-5 text-center border border-gray-100">
                      <p className={`text-4xl font-black ${kpi.color}`}>{kpi.value}</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">{kpi.label}</p>
                    </div>
                  ))}
                </div>

                {/* Additional Metrics (mini charts) */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500">Completion Rate</p>
                    <div style={{ width: '100%', height: 96 }} className="flex items-center justify-center">
                      <div style={{ width: 96, height: 96, position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={loadingMetrics ? [{ name: 'none', value: 100 }] : [
                                { name: 'Completed', value: metrics.completionRate },
                                { name: 'Remaining', value: Math.max(0, 100 - metrics.completionRate) }
                              ]}
                              dataKey="value"
                              innerRadius={28}
                              outerRadius={40}
                              startAngle={90}
                              endAngle={-270}
                            >
                              <Cell fill="#6366f1" />
                              <Cell fill="#eef2ff" />
                            </Pie>
                          </RePieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', inset: 0 }} className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{loadingMetrics ? '—' : `${metrics.completionRate}%`}</div>
                            <div className="text-xs text-gray-500">of work orders</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500">Avg Response Time</p>
                    <div style={{ width: '100%', height: 72 }}>
                      <ResponsiveContainer>
                        <ReBarChart data={[{ name: 'Response', value: loadingMetrics ? 0 : metrics.avgResponseHrs }]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <XAxis dataKey="name" hide />
                          <YAxis hide />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 text-sm font-bold text-gray-800">{loadingMetrics ? '—' : `${metrics.avgResponseHrs} hrs`}</div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500">Avg Cycle Time</p>
                    <div style={{ width: '100%', height: 72 }}>
                      <ResponsiveContainer>
                        <ReBarChart data={[{ name: 'Cycle', value: loadingMetrics ? 0 : metrics.avgCycleHrs }]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <XAxis dataKey="name" hide />
                          <YAxis hide />
                          <Tooltip />
                          <Bar dataKey="value" fill="#10b981" />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 text-sm font-bold text-gray-800">{loadingMetrics ? '—' : `${metrics.avgCycleHrs} hrs`}</div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500">Backlog</p>
                    <div style={{ width: '100%', height: 72 }}>
                      <ResponsiveContainer>
                        <ReBarChart data={[{ name: 'Backlog', value: loadingMetrics ? 0 : metrics.backlog }, { name: 'Other', value: loadingMetrics ? 0 : Math.max(0, totalCreated - metrics.backlog) }]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <XAxis dataKey="name" hide />
                          <YAxis hide />
                          <Tooltip />
                          <Bar dataKey="value" fill="#ef4444" />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 text-sm font-bold text-rose-600">{loadingMetrics ? '—' : metrics.backlog}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm font-bold text-gray-700 mb-2">Top Technician (completed)</p>
                    {metrics.topTechnician ? (
                      <div className="flex items-center gap-4">
                        <div style={{ width: 100, height: 100 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                              <Pie
                                data={[{ name: 'Top', value: metrics.topTechnician.completed || 0 }, { name: 'Rest', value: Math.max(0, totalCompleted - (metrics.topTechnician.completed || 0)) }]}
                                dataKey="value"
                                innerRadius={22}
                                outerRadius={36}
                                startAngle={90}
                                endAngle={-270}
                              >
                                <Cell fill="#7c3aed" />
                                <Cell fill="#eef2ff" />
                              </Pie>
                            </RePieChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{metrics.topTechnician.name || metrics.topTechnician.id}</div>
                          <div className="text-sm text-gray-500">Completed: {metrics.topTechnician.completed || '-'}</div>
                          <div className="text-xs text-gray-400 mt-2">Share: {totalCompleted ? Math.round(((metrics.topTechnician.completed || 0) / totalCompleted) * 100) : 0}%</div>
                        </div>
                      </div>
                    ) : (<div className="text-sm text-gray-500">No data</div>)}
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm font-bold text-gray-700 mb-2">Top Locations</p>
                    <div style={{ width: '100%', height: 140 }}>
                      <ResponsiveContainer>
                        <ReBarChart data={(metrics.topLocations || []).map(l => ({ location: l.location, count: l.count }))} layout="vertical" margin={{ left: 0, right: 8 }}>
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="location" width={140} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#2563eb" />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {subTab === 'cost-of-maintenance' && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Maintenance Cost', value: `$${(totalCost / 1000).toFixed(0)}K`, color: 'text-blue-600' },
                    { label: 'Avg Cost per Work Order', value: `$${totalCreated ? Math.round(totalCost / totalCreated).toLocaleString() : 0}`, color: 'text-amber-600' },
                    { label: 'Open Work Orders', value: issues.filter(i => i.status === 'OPEN' || i.status === 'IN PROGRESS').length, color: 'text-rose-600' },
                  ].map(kpi => (
                    <div key={kpi.label} className="bg-gray-50 rounded-xl p-5 text-center border border-gray-100">
                      <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">{kpi.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <p className="text-sm font-bold text-gray-700 mb-4">Cost by Category</p>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <RePieChart>
                        <Pie data={costData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {costData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3">
                    {costData.map(c => (
                      <div key={c.name} className="flex items-center gap-3 text-sm mb-2">
                        <span className="w-3 h-3 inline-block" style={{ background: c.color }} />
                        <span className="font-medium">{c.name}</span>
                        <span className="ml-auto text-gray-500">${(c.value / 1000).toFixed(0)}K</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Preventive vs Reactive Bar Chart */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-gray-700">Preventive vs Reactive</p>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-600 rounded-sm inline-block" />Preventive</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-300 rounded-sm inline-block" />Reactive</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 h-40">
                    {labels.slice(6).map((label, i) => (
                      <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="w-full flex flex-col-reverse gap-0.5">
                          <div className="w-full bg-blue-600 rounded-t" style={{ height: `${(preventive[i + 6] / maxBar) * 120}px` }} />
                          <div className="w-full bg-blue-200 rounded-t" style={{ height: `${(reactive[i + 6] / maxBar) * 60}px` }} />
                        </div>
                        <span className="text-[9px] text-gray-400 font-medium mt-1">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {subTab === 'asset-downtime' && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Avg Uptime', value: `${Math.round(assetData.reduce((s, a) => s + a.uptime, 0) / assetData.length)}%`, color: 'text-emerald-600' },
                    { label: 'Total Assets Tracked', value: assetData.length, color: 'text-blue-600' },
                    { label: 'Assets At Risk', value: assetData.filter(a => a.uptime < 85).length, color: 'text-rose-600' },
                  ].map(kpi => (
                    <div key={kpi.label} className="bg-gray-50 rounded-xl p-5 text-center border border-gray-100">
                      <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">{kpi.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <p className="text-sm font-bold text-gray-700 mb-5">Asset Uptime vs Downtime</p>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <ReBarChart data={assetData.map(a => ({ name: a.name, uptime: a.uptime, downtime: a.downtime }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="uptime" stackId="a" fill="#10b981" />
                        <Bar dataKey="downtime" stackId="a" fill="#ef4444" />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="w-80 shrink-0 flex flex-col gap-4">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-black text-gray-900">AI Insights</span>
              <span className="ml-auto px-2 py-0.5 bg-indigo-500 text-blue-600 text-[10px] font-bold rounded-full">LIVE</span>
            </div>

            {loadingAI ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-3 bg-indigo-100 rounded-full animate-pulse" />)}
              </div>
            ) : aiSentiment ? (
              <div className="space-y-3">
                <div className="bg-white/70 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Overall Sentiment</p>
                  <p className="text-sm font-bold text-gray-800 capitalize">{aiSentiment.overall || 'Neutral'}</p>
                </div>
                {aiSentiment.summary && (
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Summary</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{aiSentiment.summary}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No AI analysis available</p>
            )}
          </div>

          {/* AI Recommendations */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-black text-gray-900">Recommendations</span>
            </div>
            {loadingRecs ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : aiRecommendations?.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {aiRecommendations.map((rec, i) => (
                  <div key={i} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-indigo-50">
                    <p className="text-xs font-bold text-gray-800 leading-relaxed">{typeof rec === 'string' ? rec : rec.recommendation || rec.text || JSON.stringify(rec)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Brain className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400 italic">No recommendations yet</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Quick Stats</p>
            <div className="space-y-2">
              {[
                { label: 'Open Issues', value: issues.filter(i => i.status === 'OPEN').length, color: 'text-blue-600' },
                { label: 'In Progress', value: issues.filter(i => i.status === 'IN PROGRESS').length, color: 'text-amber-600' },
                { label: 'Overdue', value: issues.filter(i => i.overdue).length, color: 'text-rose-600' },
                { label: 'Technicians', value: technicians.length, color: 'text-emerald-600' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">{s.label}</span>
                  <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
};

// Meters Tab
const MetersTab = () => {
  const [meterSearch, setMeterSearch] = useState('');
  const [meterFilter, setMeterFilter] = useState('All');
  const [meters, setMeters] = useState([]);
  const [loadingMeters, setLoadingMeters] = useState(false);
  const [showAddMeterModal, setShowAddMeterModal] = useState(false);
  const [newMeter, setNewMeter] = useState({ name: '', type: 'Electricity', reading: 0, unit: 'kWh', status: 'Normal', location: '' });

  const types = ['All', 'Electricity', 'Water', 'Gas'];

  useEffect(() => {
    let mounted = true;
    setLoadingMeters(true);
    api.get('/api/meters').then(res => {
      if (mounted) setMeters(res.data || []);
    }).catch(err => {
      console.error('Failed to load meters', err);
    }).finally(() => { if (mounted) setLoadingMeters(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = React.useMemo(() => (
    (meters || []).filter(m =>
      (meterFilter === 'All' || m.type === meterFilter) &&
      ((m.name || '').toLowerCase().includes(meterSearch.toLowerCase()) || (m.location || '').toLowerCase().includes(meterSearch.toLowerCase()))
    )
  ), [meters, meterFilter, meterSearch]);
  const selection = useBulkSelection(filtered, (meter) => meter._id || meter.id);

  const getStatusConfig = (status) => ({
    'Normal': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Warning': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Alert': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  }[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' });

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selection.selectedIds.length} meter(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(selection.selectedIds.map((id) => api.delete(`/api/meters/${id}`)));
      setMeters((prev) => (prev || []).filter((m) => !selection.selectedIds.includes(String(m._id || m.id))));
      selection.clear();
    } catch (err) {
      console.error('Failed to delete meters', err);
      alert('Failed to delete selected meters: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Meters</h2>
          <p className="text-sm text-gray-500 mt-0.5">Live readings from all property meters</p>
        </div>
        <button onClick={() => setShowAddMeterModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Meter
        </button>
      </div>

      {/* Add Meter Modal */}
      {showAddMeterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddMeterModal(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md shadow-xl z-10">
            <h3 className="text-lg font-bold mb-3">Add Meter</h3>
            <div className="flex flex-col gap-2">
              <input value={newMeter.name} onChange={e => setNewMeter({ ...newMeter, name: e.target.value })} placeholder="Name" className="p-2 border rounded" />
              <select value={newMeter.type} onChange={e => setNewMeter({ ...newMeter, type: e.target.value, unit: e.target.value === 'Water' ? 'm3' : 'kWh' })} className="p-2 border rounded">
                <option>Electricity</option>
                <option>Water</option>
                <option>Gas</option>
              </select>
              <input value={newMeter.location} onChange={e => setNewMeter({ ...newMeter, location: e.target.value })} placeholder="Location" className="p-2 border rounded" />
              <div className="flex items-center gap-2">
                <input type="number" value={newMeter.reading} onChange={e => setNewMeter({ ...newMeter, reading: Number(e.target.value) })} className="p-2 border rounded w-full" />
                <input value={newMeter.unit} onChange={e => setNewMeter({ ...newMeter, unit: e.target.value })} className="p-2 border rounded w-28" />
              </div>
              <div className="flex items-center justify-end gap-2 mt-3">
                <button onClick={() => setShowAddMeterModal(false)} className="px-3 py-2 bg-white border rounded">Cancel</button>
                <button onClick={async () => {
                  try {
                    const res = await api.post('/api/meters', newMeter);
                    setMeters(prev => [res.data, ...(prev || [])]);
                    setNewMeter({ name: '', type: 'Electricity', reading: 0, unit: 'kWh', status: 'Normal', location: '' });
                    setShowAddMeterModal(false);
                  } catch (e) { console.error('Add meter failed', e); alert('Failed to add meter'); }
                }} className="px-3 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Electricity', value: `${((meters || []).filter(m => m.type === 'Electricity').reduce((s, m) => s + (Number(m.reading) || 0), 0) / 1000).toFixed(1)} MWh`, icon: '⚡', color: 'from-amber-50 to-yellow-50 border-amber-100' },
          { label: 'Total Water', value: `${((meters || []).filter(m => m.type === 'Water').reduce((s, m) => s + (Number(m.reading) || 0), 0)).toLocaleString()} m3`, icon: '💧', color: 'from-blue-50 to-cyan-50 border-blue-100' },
          { label: 'Active Alerts', value: (meters || []).filter(m => m.status !== 'Normal').length, icon: '🚨', color: 'from-rose-50 to-pink-50 border-rose-100' },
        ].map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} border rounded-xl p-4 flex items-center gap-4`}>
            <span className="text-3xl">{c.icon}</span>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{c.label}</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={meterSearch}
            onChange={e => setMeterSearch(e.target.value)}
            placeholder="Search meters..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {types.map(t => (
            <button key={t} onClick={() => setMeterFilter(t)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${meterFilter === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Meters Table */}
      <BulkActionBar count={selection.selectedIds.length} label="meters" onDelete={handleDeleteSelected} />
      <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="glass-surface border-b border-white/10">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selection.allSelected}
                    onChange={(e) => selection.toggleAll(e.target.checked)}
                  />
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Meter</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reading</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trend</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Read</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, idx) => {
                const sc = getStatusConfig(m.status);
                return (
                  <tr key={m.id || `meter-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selection.selectedIds.includes(String(m._id || m.id))}
                        onChange={() => selection.toggleOne(m._id || m.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-xl">{m.icon}</div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{m.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">{m.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 font-mono">{m.id}</td>
                    <td className="py-4 px-4 text-sm text-gray-700">{m.type}</td>
                    <td className="py-4 px-4 text-sm font-black text-gray-900">{m.reading.toLocaleString()} <span className="text-xs text-gray-400 font-medium">{m.unit}</span></td>
                    <td className="py-4 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        {m.trend > 0 ? <TrendingUp className="w-4 h-4 text-rose-500" /> : m.trend < 0 ? <TrendingUp className="w-4 h-4 text-emerald-500 rotate-180" /> : null}
                        <span className={`text-sm font-bold ${m.trend > 0 ? 'text-rose-500' : m.trend < 0 ? 'text-emerald-500' : 'text-gray-400'}`}>{m.trend > 0 ? '+' : ''}{m.trend}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full ${sc.bg} ${sc.text} ${sc.border}`}>{m.status}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{m.location}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{m.lastRead}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => alert(JSON.stringify(m, null, 2))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="More">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="10" className="py-16 text-center">
                    <Gauge className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No meters found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Edge Tab
const EdgeTab = () => {
  const [edgeFilter, setEdgeFilter] = useState('All');
  const [edgeSearch, setEdgeSearch] = useState('');
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const statuses = ['All', 'Online', 'Offline'];

  const typeIcon = { Camera: 'CAM', Sensor: 'SNS', Network: 'NET', Lock: 'LOCK', Controller: 'CTRL' };

  const getSignalColor = (s) => s >= 80 ? 'bg-emerald-500' : s >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  useEffect(() => {
    let mounted = true;
    setLoadingDevices(true);
    api.get('/api/devices').then(res => { if (mounted) setDevices(res.data || []); }).catch(e => console.error('Failed to load devices', e)).finally(() => { if (mounted) setLoadingDevices(false); });
    return () => { mounted = false; };
  }, []);

  const handleDeviceAction = async (id, action) => {
    try {
      const res = await api.post(`/api/devices/${id}/actions/${action}`);
      setDevices(prev => prev.map(d => (String(d.id) === String(res.data.id) ? res.data : d)));
    } catch (e) { console.error('Device action failed', e); alert('Action failed'); }
  };

  const filtered = React.useMemo(() => (
    (devices || []).filter(d =>
      (edgeFilter === 'All' || d.status === edgeFilter) &&
      ((d.name || '').toLowerCase().includes(edgeSearch.toLowerCase()) || (d.location || '').toLowerCase().includes(edgeSearch.toLowerCase()))
    )
  ), [devices, edgeFilter, edgeSearch]);
  const selection = useBulkSelection(filtered, (device) => device._id || device.id);

  const online = (devices || []).filter(d => d.status === 'Online').length;
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', type: 'Sensor', status: 'Online', signal: 80, firmware: 'v1.0.0', location: '', battery: null });

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selection.selectedIds.length} device(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(selection.selectedIds.map((id) => api.delete(`/api/devices/${id}`)));
      setDevices((prev) => (prev || []).filter((d) => !selection.selectedIds.includes(String(d._id || d.id))));
      selection.clear();
    } catch (err) {
      console.error('Failed to delete devices', err);
      alert('Failed to delete selected devices: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Edge Devices</h2>
          <p className="text-sm text-gray-500 mt-0.5">IoT and connected device management</p>
        </div>
        <button onClick={() => setShowAddDeviceModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Add Device Modal */}
      {showAddDeviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddDeviceModal(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md shadow-xl z-10">
            <h3 className="text-lg font-bold mb-3">Add Edge Device</h3>
            <div className="flex flex-col gap-2">
              <input value={newDevice.name} onChange={e => setNewDevice({ ...newDevice, name: e.target.value })} placeholder="Name" className="p-2 border rounded" />
              <select value={newDevice.type} onChange={e => setNewDevice({ ...newDevice, type: e.target.value })} className="p-2 border rounded">
                <option>Sensor</option>
                <option>Camera</option>
                <option>Network</option>
                <option>Lock</option>
                <option>Controller</option>
              </select>
              <input value={newDevice.location} onChange={e => setNewDevice({ ...newDevice, location: e.target.value })} placeholder="Location" className="p-2 border rounded" />
              <div className="flex gap-2">
                <input value={newDevice.firmware} onChange={e => setNewDevice({ ...newDevice, firmware: e.target.value })} placeholder="Firmware" className="p-2 border rounded flex-1" />
                <input type="number" value={newDevice.battery ?? ''} onChange={e => setNewDevice({ ...newDevice, battery: e.target.value ? Number(e.target.value) : null })} placeholder="Battery %" className="p-2 border rounded w-28" />
              </div>
              <div className="flex items-center justify-end gap-2 mt-3">
                <button onClick={() => setShowAddDeviceModal(false)} className="px-3 py-2 bg-white border rounded">Cancel</button>
                <button onClick={async () => {
                  try {
                    const res = await api.post('/api/devices', newDevice);
                    setDevices(prev => [res.data, ...(prev || [])]);
                    setNewDevice({ name: '', type: 'Sensor', status: 'Online', signal: 80, firmware: 'v1.0.0', location: '', battery: null });
                    setShowAddDeviceModal(false);
                  } catch (e) { console.error('Add device failed', e); alert('Failed to add device'); }
                }} className="px-3 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Devices', value: devices.length, icon: Smartphone, color: 'from-blue-50 to-indigo-50 border-blue-100', textColor: 'text-blue-600' },
          { label: 'Online', value: online, icon: Activity, color: 'from-emerald-50 to-green-50 border-emerald-100', textColor: 'text-emerald-600' },
          { label: 'Offline', value: devices.length - online, icon: Circle, color: 'from-rose-50 to-pink-50 border-rose-100', textColor: 'text-rose-600' },
          { label: 'Low Battery', value: devices.filter(d => d.battery != null && d.battery < 25).length, icon: AlertCircle, color: 'from-amber-50 to-yellow-50 border-amber-100', textColor: 'text-amber-600' },
        ].map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} border rounded-xl p-4 flex items-center gap-3`}>
            <c.icon className={`w-5 h-5 ${c.textColor}`} />
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{c.label}</p>
              <p className={`text-2xl font-black mt-0.5 ${c.textColor}`}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={edgeSearch}
            onChange={e => setEdgeSearch(e.target.value)}
            placeholder="Search devices..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {statuses.map(s => (
            <button key={s} onClick={() => setEdgeFilter(s)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${edgeFilter === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {s !== 'All' && <span className={`w-1.5 h-1.5 rounded-full ${s === 'Online' ? 'bg-emerald-500' : 'bg-gray-400'}`} />}
              {s}
            </button>
          ))}
        </div>
      </div>

      <BulkActionBar count={selection.selectedIds.length} label="devices" onDelete={handleDeleteSelected} />

      {/* Devices Table */}
      <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="glass-surface border-b border-white/10">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selection.allSelected}
                    onChange={(e) => selection.toggleAll(e.target.checked)}
                  />
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Device</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Signal</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Battery</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Ping</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Firmware</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, idx) => (
                <tr key={d.id || `dev-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selection.selectedIds.includes(String(d._id || d.id))}
                      onChange={() => selection.toggleOne(d._id || d.id)}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-xl">{typeIcon[d.type] || '📦'}</div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{d.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{d.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">{d.id}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{d.type}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${d.status === 'Online' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : d.status === 'Offline' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{d.status}</span>
                  </td>
                  <td className="py-4 px-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`${getSignalColor(d.signal)} h-full rounded-full`} style={{ width: `${d.signal}%` }} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{d.signal}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm">{d.battery != null ? `${d.battery}%` : '—'}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{d.lastPing}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{d.firmware}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => alert(JSON.stringify(d, null, 2))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button onClick={() => handleDeviceAction(d.id, 'reboot')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Reboot">
                        <Play className="w-4 h-4 text-gray-600" />
                      </button>
                      <button onClick={() => handleDeviceAction(d.id, 'firmwareUpdate')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Update Firmware">
                        <Upload className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="More">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="10" className="py-16 text-center">
                    <Smartphone className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No devices found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Assets Table Tab
const AssetsTab = ({ assets = [], onAssetsUpdated }) => {
  const fileInputRef = React.useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredAssets = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return assets;
    return (assets || []).filter((asset) => {
      const haystack = [
        asset.name,
        asset.title,
        asset.category,
        asset.type,
        asset.property?.name,
        asset.propertyName,
        asset.propertyId,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [assets, searchQuery]);
  const selection = useBulkSelection(filteredAssets, (asset) => asset._id || asset.id);

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selection.selectedIds.length} asset(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(selection.selectedIds.map((id) => api.delete(`/api/assets/${id}`)));
      if (onAssetsUpdated) onAssetsUpdated(selection.selectedIds);
      selection.clear();
    } catch (err) {
      console.error('Failed to delete assets', err);
      alert('Failed to delete selected assets: ' + (err.response?.data?.error || err.message));
    }
  };

  const exportCSV = () => {
    if (!filteredAssets || filteredAssets.length === 0) return;
    const keys = ['id', 'name', 'category', 'propertyName', 'purchaseCost'];
    const rows = filteredAssets.map(a => ({
      id: a.id || a._id || '',
      name: a.name || a.title || '',
      category: a.category || a.type || '',
      propertyName: a.property?.name || a.propertyName || '',
      purchaseCost: a.purchaseCost || ''
    }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g, '""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'assets-export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const onImport = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result || '';
      const lines = text.split(/\r?\n/).filter(Boolean);
      const header = (lines.shift() || '').split(',').map(h => h.trim());
      const parsed = lines.map(l => {
        const parts = l.split(',');
        const obj = {};
        header.forEach((h, i) => obj[h] = parts[i] || '');
        return obj;
      });
      console.log('Imported assets (preview):', parsed.slice(0, 20));
      alert(`Imported ${parsed.length} rows (preview in console).`);
    };
    reader.readAsText(f);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Assets</h2>
          <p className="text-sm text-gray-500 mt-0.5">Inventory of tracked assets</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
          <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Import</button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={onImport} className="hidden" />
        </div>
      </div>

      <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
        <BulkActionBar count={selection.selectedIds.length} label="assets" onDelete={handleDeleteSelected} />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="glass-surface border-b border-white/10">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selection.allSelected}
                    onChange={(e) => selection.toggleAll(e.target.checked)}
                  />
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Purchase Cost</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((a, idx) => (
                <tr key={a.id || a._id || `asset-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      checked={selection.selectedIds.includes(String(a._id || a.id))}
                      onChange={() => selection.toggleOne(a._id || a.id)}
                    />
                  </td>
                  <td className="py-4 px-4"><div className="text-sm font-bold text-gray-900">{a.name || a.title || 'Unnamed'}</div></td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">{String(a._id || a.id || '').slice(-8)}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{a.category || a.type || '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{a.property?.name || a.propertyName || (a.propertyId ? String(a.propertyId) : '-')}</td>
                  <td className="py-4 px-4 text-sm font-black text-gray-900">{a.purchaseCost ? `$${Number(a.purchaseCost).toFixed(2)}` : '—'}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><MoreHorizontal className="w-4 h-4 text-gray-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr><td colSpan="7" className="py-20 text-center"><p className="text-gray-500">No assets found</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Locations Table Tab
const LocationsTab = ({ locations = [], assets = [], onLocationUpdated, onLocationDeleted }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const locationStatusOptions = ['Active', 'Inactive', 'Under Maintenance', 'Closed'];
  const [searchQuery, setSearchQuery] = useState('');
  const [assetNameQuery, setAssetNameQuery] = useState('');
  const filteredLocations = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return locations;
    return (locations || []).filter((location) => {
      const haystack = [
        location.name,
        location.title,
        location.address,
        location.street,
        location.city,
        location.country,
        location.contactName,
        location.contact,
        location.phone,
        location.phoneNumber,
        location.email,
        location.status,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [locations, searchQuery]);
  const selection = useBulkSelection(filteredLocations, (loc) => loc._id || loc.id);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    contactName: '',
    phone: '',
    email: '',
    status: ''
  });

  const openLocation = (loc) => {
    setSelectedLocation(loc);
  };

  const closeLocation = () => {
    setSelectedLocation(null);
  };

  const openEdit = (loc) => {
    setEditingLocation(loc);
    setEditForm({
      name: loc.name || loc.title || '',
      address: loc.address || loc.street || '',
      city: loc.city || '',
      country: loc.country || '',
      contactName: loc.contactName || loc.contact || '',
      phone: loc.phone || loc.phoneNumber || '',
      email: loc.email || '',
      status: loc.status || ''
    });
  };

  const closeEdit = () => {
    setEditingLocation(null);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingLocation) return;
    try {
      setSavingLocation(true);
      const id = editingLocation._id || editingLocation.id;
      const payload = {
        name: editForm.name,
        address: editForm.address,
        city: editForm.city,
        country: editForm.country,
        contactName: editForm.contactName,
        phone: editForm.phone,
        email: editForm.email,
        status: editForm.status
      };
      const res = await api.put(`/api/properties/${id}`, payload);
      const updated = res.data;
      if (selectedLocation && (String(selectedLocation._id || selectedLocation.id) === String(id))) {
        setSelectedLocation(updated);
      }
      if (onLocationUpdated) onLocationUpdated(updated);
      setEditingLocation(null);
      alert('Location updated');
    } catch (err) {
      console.error('Failed to update location', err);
      alert('Failed to update location: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingLocation(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selection.selectedIds.length} location(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(selection.selectedIds.map((id) => api.delete(`/api/properties/${id}`)));
      if (onLocationDeleted) onLocationDeleted(selection.selectedIds);
      selection.clear();
    } catch (err) {
      console.error('Failed to delete locations', err);
      alert('Failed to delete selected locations: ' + (err.response?.data?.error || err.message));
    }
  };

  const getLocationAssets = (loc) => {
    const locId = normalizeId(loc?._id || loc?.id);
    return (assets || []).filter(a => {
      const aLocId = normalizeId(a.propertyId || a.property?.id || a.property?._id);
      return locId && aLocId && String(aLocId) === String(locId);
    });
  };

  const getLocationAssetTotals = (loc) => {
    const locAssets = getLocationAssets(loc);
    const totalValue = locAssets.reduce((sum, a) => sum + Number(a.purchaseCost || 0), 0);
    const byCategory = {};
    locAssets.forEach(a => {
      const key = a.category || a.type || 'Uncategorized';
      byCategory[key] = (byCategory[key] || 0) + 1;
    });
    return { totalValue, byCategory, count: locAssets.length };
  };

  const findAssetByName = (loc, rawName) => {
    if (!rawName) return null;
    const q = String(rawName).trim().toLowerCase();
    const locAssets = getLocationAssets(loc);
    return locAssets.find(a => {
      const name = String(a.name || a.title || '').toLowerCase();
      return name.includes(q);
    }) || null;
  };

  const exportCSV = () => {
    if (!filteredLocations || filteredLocations.length === 0) return;
    const keys = ['id', 'name', 'address', 'assetCount'];
    const rows = filteredLocations.map(l => ({ id: l.id || l._id || '', name: l.name || l.title || '', address: l.address || l.street || '', assetCount: (assets.filter(a => String(a.propertyId) === String(l._id || l.id)).length) }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g, '""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'locations-export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Locations</h2>
          <p className="text-sm text-gray-500 mt-0.5">Properties and locations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locations..."
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
        </div>
      </div>

      <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
        <BulkActionBar count={selection.selectedIds.length} label="locations" onDelete={handleDeleteSelected} />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="glass-surface border-b border-white/10">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selection.allSelected}
                    onChange={(e) => selection.toggleAll(e.target.checked)}
                  />
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assets</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((l, idx) => (
                <tr
                  key={l._id || l.id || `loc-${idx}`}
                  onClick={() => openLocation(l)}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selection.selectedIds.includes(String(l._id || l.id))}
                      onChange={() => selection.toggleOne(l._id || l.id)}
                    />
                  </td>
                  <td className="py-4 px-4"><div className="text-sm font-bold text-gray-900">{l.name || l.title || 'Unnamed'}</div></td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">{String(l._id || l.id || '').slice(-8)}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{l.address || l.street || '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{getLocationAssets(l).length}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{l.contactName || l.contact || '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{l.phone || l.phoneNumber || '-'}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openLocation(l); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); openEdit(l); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLocations.length === 0 && (<tr><td colSpan="8" className="py-20 text-center"><p className="text-gray-500">No locations found</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Location Details</h3>
                  <p className="text-sm text-gray-500">{selectedLocation.name || selectedLocation.title || 'Location'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(selectedLocation)} className="px-3 py-1.5 text-xs font-bold bg-green-600 text-blue-600 rounded-lg hover:bg-green-700">
                    Edit
                  </button>
                  <button onClick={closeLocation} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Address', value: selectedLocation.address || selectedLocation.street || '-' },
                  { label: 'City', value: selectedLocation.city || '-' },
                  { label: 'Country', value: selectedLocation.country || '-' },
                  { label: 'Contact', value: selectedLocation.contactName || selectedLocation.contact || '-' },
                  { label: 'Phone', value: selectedLocation.phone || selectedLocation.phoneNumber || '-' },
                  { label: 'Email', value: selectedLocation.email || '-' },
                  { label: 'Status', value: selectedLocation.status || '-' },
                  { label: 'Created', value: selectedLocation.createdAt ? new Date(selectedLocation.createdAt).toLocaleDateString() : '-' },
                  { label: 'Assets', value: getLocationAssets(selectedLocation).length },
                  { label: 'Asset Value Total', value: `$${getLocationAssetTotals(selectedLocation).totalValue.toLocaleString()}` }
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Assets at this location</h4>
                <div className="mb-3 flex items-center gap-2">
                  <input
                    className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Enter asset name to get total/value"
                    value={assetNameQuery}
                    onChange={(e) => setAssetNameQuery(e.target.value)}
                  />
                  {assetNameQuery && (
                    <button
                      onClick={() => setAssetNameQuery('')}
                      className="px-2 py-1 text-xs font-semibold text-gray-600 hover:text-gray-900"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {assetNameQuery && (
                  <div className="mb-4">
                    {(() => {
                      const found = findAssetByName(selectedLocation, assetNameQuery);
                      if (!found) return <div className="text-sm text-rose-600">No asset found with that name.</div>;
                      return (
                        <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50 text-sm">
                          <div className="font-semibold text-emerald-800">
                            {found.name || found.title || 'Asset'} ({String(found._id || found.id).slice(-8)})
                          </div>
                          <div className="text-emerald-700">Purchase Cost: {found.purchaseCost ? `$${Number(found.purchaseCost).toLocaleString()}` : '—'}</div>
                          <div className="text-emerald-700">Category: {found.category || found.type || '—'}</div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="max-h-56 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="glass-surface border-b border-white/10">
                        <tr>
                          <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase">Asset</th>
                          <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase">Category</th>
                          <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase">ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getLocationAssets(selectedLocation).map((a, i) => (
                          <tr key={a._id || a.id || `asset-${i}`} className="border-b border-gray-50">
                            <td className="py-2 px-3 text-sm text-gray-800">{a.name || a.title || 'Asset'}</td>
                            <td className="py-2 px-3 text-sm text-gray-600">{a.category || a.type || '-'}</td>
                            <td className="py-2 px-3 text-xs font-mono text-gray-500">{String(a._id || a.id || '').slice(-8)}</td>
                          </tr>
                        ))}
                        {getLocationAssets(selectedLocation).length === 0 && (
                          <tr><td colSpan="3" className="py-6 text-center text-sm text-gray-500">No assets linked.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Assets by Category</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(getLocationAssetTotals(selectedLocation).byCategory).map(([cat, count]) => (
                    <span key={cat} className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {cat}: {count}
                    </span>
                  ))}
                  {Object.keys(getLocationAssetTotals(selectedLocation).byCategory).length === 0 && (
                    <span className="text-sm text-gray-500">No assets</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form onSubmit={saveEdit} className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Location</h3>
              <button type="button" onClick={closeEdit} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="border p-2 rounded text-sm" placeholder="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <select
                className="border p-2 rounded text-sm bg-white"
                value={editForm.status || ''}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="">Select status</option>
                {locationStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <input className="border p-2 rounded text-sm col-span-2" placeholder="Address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
              <input className="border p-2 rounded text-sm" placeholder="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
              <input className="border p-2 rounded text-sm" placeholder="Country" value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} />
              <input className="border p-2 rounded text-sm" placeholder="Contact Name" value={editForm.contactName} onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })} />
              <input className="border p-2 rounded text-sm" placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              <input className="border p-2 rounded text-sm col-span-2" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button type="button" onClick={closeEdit} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={savingLocation} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                {savingLocation ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// People & Teams Tab
const PeopleTab = ({ technicians = [], allIssues = [], teams = [], onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPerson, setNewPerson] = useState({ name: '', email: '', phone: '', role: 'Technician', password: '', specialization: '' });
  const [newTeam, setNewTeam] = useState({ name: '', members: [] });


  useEffect(() => {
    // We only need to fetch technicians, which are passed via props.
    // Parent fetchDashboardData handles this.
  }, []);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredTechnicians = React.useMemo(() => {
    const externalOnly = (technicians || []).filter((t) => t.type === 'EXTERNAL');
    if (!normalizedSearch) return externalOnly;
    return externalOnly.filter((tech) => {
      const haystack = [
        tech.name,
        tech.email,
        tech.phone,
        tech.type,
        tech.specialization,
        tech.specialty,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [normalizedSearch, technicians]);
  const filteredTeams = React.useMemo(() => {
    if (!normalizedSearch) return teams;
    return (teams || []).filter((team) => {
      const memberNames = Array.isArray(team.members)
        ? team.members.map((member) => typeof member === 'object' ? member?.name : member)
        : [];
      const haystack = [team.name, ...memberNames].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [normalizedSearch, teams]);

  const exportCSV = () => {
    if (!filteredTechnicians || filteredTechnicians.length === 0) return;
    const keys = ['id', 'name', 'email', 'phone', 'role'];
    const rows = filteredTechnicians.map(t => ({
      id: t._id || t.id || '',
      name: t.name || '',
      email: t.email || '',
      phone: t.phone || '',
      role: t.type || 'EXTERNAL'
    }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g, '""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'external-technicians-export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const handleCreatePerson = async (e) => {
    e.preventDefault();
    try {
      const role = newPerson.role || 'Technician';
      // Register all roles from the list as system users
      const isUserRole = [
        'Manager', 'limited Manager', 'Technician',
        'limited Technician', 'Requestor'
      ].some(r => r.toLowerCase() === role.toLowerCase());

      if (isUserRole) {
        await api.post('/api/users/register', {
          name: newPerson.name,
          email: newPerson.email,
          phone: newPerson.phone,
          password: newPerson.password,
          role
        });
        alert('User created successfully');
      } else {
        await api.post('/api/technicians', { ...newPerson, type: 'EXTERNAL' });
        alert('External technician created successfully');
      }

      setShowAddPerson(false);
      // Since technicians is a prop, we call onRefresh to tell parent to refetch
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to create person', err);
      alert('Failed to create person: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeletePerson = async (id) => {
    if (!confirm('Delete this person?')) return;
    try {
      // Try deleting as technician first, then as user if that fails
      try {
        await api.delete(`/api/technicians/${id}`);
      } catch (err) {
        await api.delete(`/api/users/${id}`);
      }
      if (onRefresh) onRefresh();
      alert('Person deleted successfully');
    } catch (err) {
      console.error('Failed to delete person', err);
      alert('Failed to delete person: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.name.trim()) return alert('Please enter a team name');
    try {
      await api.post('/api/teams', newTeam);
      setShowAddTeam(false);
      setNewTeam({ name: '', members: [] });
      if (onRefresh) onRefresh();
      alert('Team created successfully');
    } catch (err) {
      console.error('Failed to create team', err);
      alert('Failed to create team: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam({
      id: team._id || team.id,
      name: team.name,
      members: Array.isArray(team.members) ? team.members.map(m => typeof m === 'object' ? m.id || m._id : m) : []
    });
    setShowEditTeam(true);
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!editingTeam.name.trim()) return alert('Please enter a team name');
    try {
      await api.put(`/api/teams/${editingTeam.id}`, {
        name: editingTeam.name,
        members: editingTeam.members
      });
      setShowEditTeam(false);
      setEditingTeam(null);
      if (onRefresh) onRefresh();
      alert('Team updated successfully');
    } catch (err) {
      console.error('Failed to update team', err);
      alert('Failed to update team: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!confirm('Delete this team?')) return;
    try {
      await api.delete(`/api/teams/${id}`);
      if (onRefresh) onRefresh();
      alert('Team deleted successfully');
    } catch (err) {
      console.error('Failed to delete team', err);
      alert('Failed to delete team: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* People Tab Content - External Technicians List */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">People</h2>
          <p className="text-sm text-gray-500 mt-0.5">External Technicians and Personnel</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people or teams..."
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
          <button onClick={() => setShowAddTeam(true)} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Add Team</button>
          <button onClick={() => setShowAddPerson(true)} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Add Person</button>
        </div>
      </div>

      <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="glass-surface border-b border-white/10">
              <tr>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                if (filteredTechnicians.length === 0) {
                  return <tr><td colSpan="7" className="py-20 text-center"><p className="text-gray-500">No external technicians found</p></td></tr>;
                }
                return filteredTechnicians.map((t, idx) => (
                  <tr key={t._id || t.id || `person-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4"><div className="text-sm font-bold text-gray-900">{t.name || 'Unnamed Tech'}</div></td>
                    <td className="py-4 px-4 text-sm text-gray-600 font-mono">{String(t._id || t.id || '').slice(-8)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{t.email || '-'}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-gray-700">{t.rating || 0}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {(() => {
                        const techId = String(t._id || t.id);
                        const completedCount = allIssues.filter(i => {
                          const isComplete = i.status === 'COMPLETE' || i.status === 'COMPLETED';
                          const assignedId = String(i.assignedTo?._id || i.assignedTo?.id || i.assignedTo || '');
                          return isComplete && assignedId === techId;
                        }).length;
                        return (
                          <span className="px-2 py-1 text-xs font-bold text-blue-700 bg-blue-50 rounded-full">{completedCount > 0 ? completedCount : (t.completed || 0)} tasks</span>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{t.phone || '-'}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg" title="View Details">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeletePerson(t._id || t.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-red-600 hover:text-red-700"
                          title="Delete Technician"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Teams</h2>
        <p className="text-sm text-gray-500 mt-0.5">Management teams and specialties</p>
      </div>

      <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="glass-surface border-b border-white/10">
              <tr>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Team Name</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Members</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.length === 0 ? (
                <tr><td colSpan="3" className="py-20 text-center"><p className="text-gray-500">No teams found</p></td></tr>
              ) : (
                filteredTeams.map((team, idx) => (
                  <tr key={team._id || team.id || `team-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4"><div className="text-sm font-bold text-gray-900">{team.name}</div></td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(team.members) && team.members.map((m, mIdx) => (
                          <span key={mIdx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
                            {typeof m === 'object' ? m.name : m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditTeam(team)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-blue-600"
                          title="Edit Team"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTeam(team._id || team.id)} 
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-red-600"
                          title="Delete Team"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form onSubmit={handleCreateTeam} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Team</h3>
              <button type="button" onClick={() => setShowAddTeam(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Team Name</label>
                <input
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
                  placeholder="e.g. Civil Engineers, Plumbing, Electricians"
                  value={newTeam.name}
                  onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Members (Technicians)</label>
                <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-2 space-y-1">
                  {technicians.map(t => (
                    <label key={t._id || t.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTeam.members.includes(t._id || t.id)}
                        onChange={e => {
                          const id = t._id || t.id;
                          if (e.target.checked) setNewTeam({ ...newTeam, members: [...newTeam.members, id] });
                          else setNewTeam({ ...newTeam, members: newTeam.members.filter(m => m !== id) });
                        }}
                      />
                      <span className="text-sm font-medium">{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowAddTeam(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Create Team</button>
            </div>
          </form>
        </div>
      )}

      {showEditTeam && editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form onSubmit={handleUpdateTeam} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Team</h3>
              <button type="button" onClick={() => setShowEditTeam(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Team Name</label>
                <input
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
                  placeholder="e.g. Civil Engineers, Plumbing, Electricians"
                  value={editingTeam.name}
                  onChange={e => setEditingTeam({ ...editingTeam, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Members (Technicians)</label>
                <p className="text-xs text-gray-500 mb-2">Check/uncheck to add or remove technicians</p>
                <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-2 space-y-1">
                  {technicians.length === 0 ? (
                    <p className="text-sm text-gray-500 p-2">No technicians available</p>
                  ) : (
                    technicians.map(t => {
                      const techId = t._id || t.id;
                      return (
                        <label key={techId} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingTeam.members.includes(techId)}
                            onChange={e => {
                              if (e.target.checked) {
                                setEditingTeam({ ...editingTeam, members: [...editingTeam.members, techId] });
                              } else {
                                setEditingTeam({ ...editingTeam, members: editingTeam.members.filter(m => m !== techId) });
                              }
                            }}
                          />
                          <span className="text-sm font-medium">{t.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowEditTeam(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Update Team</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Person Modal */}
      {showAddPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form onSubmit={handleCreatePerson} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Person</h3>
              <button type="button" onClick={() => setShowAddPerson(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="border p-2 rounded-lg text-sm" placeholder="Name" value={newPerson.name} onChange={e => setNewPerson({ ...newPerson, name: e.target.value })} />
              <input className="border p-2 rounded-lg text-sm" placeholder="Email" value={newPerson.email} onChange={e => setNewPerson({ ...newPerson, email: e.target.value })} />
              <input className="border p-2 rounded-lg text-sm" placeholder="Phone" value={newPerson.phone} onChange={e => setNewPerson({ ...newPerson, phone: e.target.value })} />
              <input className="border p-2 rounded-lg text-sm" type="password" placeholder="Password" value={newPerson.password} onChange={e => setNewPerson({ ...newPerson, password: e.target.value })} />
              <input className="border p-2 rounded-lg text-sm col-span-2" placeholder="Specialization (e.g. Plumbing, HVAC)" value={newPerson.specialization} onChange={e => setNewPerson({ ...newPerson, specialization: e.target.value })} />
              <select className="border p-2 rounded-lg text-sm col-span-2" value={newPerson.role} onChange={e => setNewPerson({ ...newPerson, role: e.target.value })}>
                <option>Manager</option>
                <option>limited Manager</option>
                <option>Technician</option>
                <option>limited Technician</option>
                <option>Requestor</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button type="button" onClick={() => setShowAddPerson(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Checklists Tab (uses maintenance templates / checklists if available)
const ChecklistsTab = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showCreate, setShowCreate] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    frequency: 'DAILY',
    steps: [{ text: '' }]
  });

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/checklists');
      setItems(res.data || []);
    } catch (e) {
      try {
        const res = await api.get('/api/maintenance-templates');
        setItems(res.data || []);
      } catch (err) {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const stepsFromItem = (it) => {
    if (Array.isArray(it?.steps)) return it.steps;
    if (Array.isArray(it?.checklist)) return it.checklist;
    return [];
  };

  const stepsCount = (it) => stepsFromItem(it).length;
  const filteredItems = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return (items || []).filter((it) => {
      const stepText = stepsFromItem(it)
        .map((step) => typeof step === 'string' ? step : step?.text)
        .filter(Boolean)
        .join(' ');
      const haystack = [
        it.name,
        it.title,
        it.description,
        it.frequency,
        it.interval,
        stepText,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [items, searchQuery]);

  const exportCSV = () => {
    if (!filteredItems || filteredItems.length === 0) return;
    const keys = ['id', 'name', 'description', 'frequency', 'steps'];
    const rows = filteredItems.map(it => {
      const list = stepsFromItem(it);
      const stepsText = (list || [])
        .map(s => (typeof s === 'string' ? s : (s?.text || '')))
        .filter(Boolean)
        .join(' | ');
      return {
        id: it._id || it.id || '',
        name: it.name || it.title || '',
        description: it.description || '',
        frequency: it.frequency || it.interval || '',
        steps: stepsText || (Array.isArray(list) ? String(list.length) : '')
      };
    });
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g, '""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'checklists-export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const addStep = () => setForm(prev => ({ ...prev, steps: [...prev.steps, { text: '' }] }));
  const removeStep = (idx) => setForm(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== idx) }));
  const updateStep = (idx, value) => setForm(prev => ({
    ...prev,
    steps: prev.steps.map((s, i) => (i === idx ? { ...s, text: value } : s))
  }));

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      alert('Please enter a checklist name');
      return;
    }
    const cleanSteps = form.steps.map(s => (s.text || '').trim()).filter(Boolean);
    if (cleanSteps.length === 0) {
      alert('Please add at least one checklist step');
      return;
    }
    try {
      setCreating(true);
      const payload = {
        name,
        description: form.description.trim(),
        frequency: form.frequency,
        steps: cleanSteps.map(text => ({ text, completed: false }))
      };
      const res = await api.post('/api/checklists', payload);
      setItems(prev => [res.data, ...(prev || [])]);
      setShowCreate(false);
      setForm({ name: '', description: '', frequency: 'DAILY', steps: [{ text: '' }] });
    } catch (err) {
      console.error('Failed to create checklist:', err);
      alert('Failed to create checklist: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Checklists</h2>
          <p className="text-sm text-gray-500 mt-0.5">Maintenance checklists and templates</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search checklists..."
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button onClick={() => setShowCreate(true)} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">New Checklist</button>
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="glass-surface-strong rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Create Checklist</h3>
                <p className="text-sm text-slate-600">Add a new maintenance checklist template</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="rounded-full p-2 hover:bg-white/70">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Checklist Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl glass-input px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300/60 outline-none"
                  placeholder="e.g., HVAC Monthly Inspection"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl glass-input px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300/60 outline-none"
                  rows="3"
                  placeholder="Short description of this checklist"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Frequency *</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full rounded-xl glass-input px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300/60 outline-none"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Steps *</label>
                <div className="space-y-2">
                  {form.steps.map((s, idx) => (
                    <div key={`step-${idx}`} className="flex gap-2">
                      <input
                        value={s.text}
                        onChange={(e) => updateStep(idx, e.target.value)}
                        className="flex-1 rounded-xl glass-input px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300/60 outline-none"
                        placeholder={`Step ${idx + 1}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        className="px-3 py-2 rounded-xl glass-ghost text-sm font-semibold"
                        disabled={form.steps.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addStep} className="mt-3 px-3 py-2 rounded-xl glass-ghost text-sm font-semibold">
                  + Add Step
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl glass-ghost text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Checklist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="glass-surface border-b border-white/10">
              <tr>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Steps</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((it, idx) => (
                <tr key={it._id || it.id || `chk-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4"><div className="text-sm font-bold text-gray-900">{it.name || it.title || 'Unnamed'}</div></td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">{String(it._id || it.id || '').slice(-8)}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{it.description || '—'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{it.frequency || it.interval || '—'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{stepsCount(it) || '-'}</td>
                  <td className="py-4 px-4 text-right"><div className="flex items-center justify-end gap-2"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button></div></td>
                </tr>
              ))}
              {filteredItems.length === 0 && !loading && (<tr><td colSpan="6" className="py-20 text-center"><p className="text-gray-500">No checklists/templates found</p></td></tr>)}
              {loading && (<tr><td colSpan="6" className="py-20 text-center"><p className="text-gray-500">Loading checklists...</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Parts & Inventory Tab
const PartsInventoryTab = () => {
  const [items, setItems] = useState([]);
  const fileRef = React.useRef(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [creatingItem, setCreatingItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    status: 'AVAILABLE',
    availableQty: 0,
    allocatedQty: 0,
    onHand: 0,
    incomingQty: 0,
    location: '',
    barcode: ''
  });
  const filteredItems = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return (items || []).filter((item) => {
      const haystack = [
        item.name,
        item.title,
        item.partName,
        item.status,
        item.location,
        item.warehouse,
        item.barcode,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [items, searchQuery]);
  const selection = useBulkSelection(filteredItems, (item) => item._id || item.id);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/parts');
        setItems(res.data || []);
      } catch (e) {
        setItems([]);
      }
    })();
  }, []);

  const exportCSV = () => {
    if (!filteredItems || filteredItems.length === 0) return;
    const keys = ['id', 'name', 'status', 'availableQty', 'allocatedQty', 'onHand', 'incomingQty', 'location', 'barcode'];
    const rows = filteredItems.map(it => ({
      id: it._id || it.id || '',
      name: it.name || it.title || it.partName || '',
      status: it.status || it.state || '',
      availableQty: it.available || it.availableQty || it.quantity || 0,
      allocatedQty: it.allocated || 0,
      onHand: it.onHand || 0,
      incomingQty: it.incoming || 0,
      location: it.location || it.warehouse || '',
      barcode: it.barcode || ''
    }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g, '""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'parts-inventory.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const headers = ['name', 'status', 'available', 'allocated', 'onHand', 'incoming', 'location', 'barcode'];
    const sample = ['HVAC Filter', 'AVAILABLE', '10', '2', '8', '5', 'Warehouse A', 'ABC-123'];
    const csv = [headers.join(','), sample.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'parts-template.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const onImport = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result || '';
        const rows = parseCsvText(text);
        if (rows.length === 0) {
          alert('No rows found in CSV');
          return;
        }
        const itemsPayload = rows.map(r => ({
          name: r.name || r.part || r.partname || r.title || '',
          status: r.status || r.state || 'AVAILABLE',
          available: Number(r.available || r.availableqty || r.quantity || 0),
          allocated: Number(r.allocated || r.allocatedqty || 0),
          onHand: Number(r.onhand || r.on_hand || 0),
          incoming: Number(r.incoming || r.incomingqty || 0),
          location: r.location || r.warehouse || '',
          barcode: r.barcode || ''
        })).filter(it => it.name);
        const res = await api.post('/api/parts/bulk', { items: itemsPayload });
        setItems(prev => [...(res.data || []), ...(prev || [])]);
        alert(`Imported ${itemsPayload.length} parts`);
      } catch (err) {
        console.error('Failed to import parts', err);
        alert('Failed to import parts: ' + (err.response?.data?.error || err.message));
      }
    };
    reader.readAsText(f);
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      alert('Please enter a part name');
      return;
    }
    try {
      setCreatingItem(true);
      const payload = {
        name: newItem.name,
        status: newItem.status,
        available: Number(newItem.availableQty) || 0,
        allocated: Number(newItem.allocatedQty) || 0,
        onHand: Number(newItem.onHand) || 0,
        incoming: Number(newItem.incomingQty) || 0,
        location: newItem.location,
        barcode: newItem.barcode
      };
      const res = await api.post('/api/parts', payload);
      setItems(prev => [res.data, ...(prev || [])]);
      setShowAddItem(false);
      setNewItem({ name: '', status: 'AVAILABLE', availableQty: 0, allocatedQty: 0, onHand: 0, incomingQty: 0, location: '', barcode: '' });
      alert('Item added successfully');
    } catch (err) {
      console.error('Failed to add item', err);
      alert('Failed to add item: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreatingItem(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selection.selectedIds.length} part(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(selection.selectedIds.map((id) => api.delete(`/api/parts/${id}`)));
      setItems((prev) => (prev || []).filter((it) => !selection.selectedIds.includes(String(it._id || it.id))));
      selection.clear();
    } catch (err) {
      console.error('Failed to delete parts', err);
      alert('Failed to delete selected parts: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Parts & Inventory</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage parts, stock levels and locations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parts..."
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
          <button onClick={downloadTemplate} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Download Template</button>
          <button onClick={() => setShowAddItem(true)} className="px-3 py-2 bg-gray-900 text-blue-600 rounded-xl text-sm font-bold">Add Person</button>
          <button onClick={() => fileRef.current && fileRef.current.click()} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Add From File</button>
          <input ref={fileRef} type="file" accept=".csv" onChange={onImport} className="hidden" />
        </div>
      </div>

      <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
        <BulkActionBar count={selection.selectedIds.length} label="parts" onDelete={handleDeleteSelected} />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="glass-surface border-b border-white/10">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selection.allSelected}
                    onChange={(e) => selection.toggleAll(e.target.checked)}
                  />
                </th>
                <th className="py-4 px-4">Name</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Available</th>
                <th className="py-4 px-4">Allocated</th>
                <th className="py-4 px-4">On Hand</th>
                <th className="py-4 px-4">Incoming</th>
                <th className="py-4 px-4">Location</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((it, idx) => (
                <tr key={it._id || it.id || `part-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selection.selectedIds.includes(String(it._id || it.id))}
                      onChange={() => selection.toggleOne(it._id || it.id)}
                    />
                  </td>
                  <td className="py-4 px-4">{it.name || it.partName || 'Unnamed'}</td>
                  <td className="py-4 px-4">{it.status || '-'}</td>
                  <td className="py-4 px-4">{it.available || it.availableQty || it.quantity || 0}</td>
                  <td className="py-4 px-4">{it.allocated || 0}</td>
                  <td className="py-4 px-4">{it.onHand || 0}</td>
                  <td className="py-4 px-4">{it.incoming || 0}</td>
                  <td className="py-4 px-4">{it.location || it.warehouse || '-'}</td>
                  <td className="py-4 px-4 text-right"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button></td>
                </tr>
              ))}
              {filteredItems.length === 0 && (<tr><td colSpan="9" className="py-20 text-center"><p className="text-gray-500">No parts or inventory found</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {showAddItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form onSubmit={handleCreateItem} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Inventory Item</h3>
              <button type="button" onClick={() => setShowAddItem(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Part name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              <select className="w-full border border-gray-200 rounded-lg p-2 text-sm" value={newItem.status} onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}>
                <option value="AVAILABLE">Available</option>
                <option value="LOW">Low</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Available Qty" value={newItem.availableQty} onChange={(e) => setNewItem({ ...newItem, availableQty: e.target.value })} />
                <input type="number" className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Allocated Qty" value={newItem.allocatedQty} onChange={(e) => setNewItem({ ...newItem, allocatedQty: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="On Hand" value={newItem.onHand} onChange={(e) => setNewItem({ ...newItem, onHand: e.target.value })} />
                <input type="number" className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Incoming Qty" value={newItem.incomingQty} onChange={(e) => setNewItem({ ...newItem, incomingQty: e.target.value })} />
              </div>
              <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Location" value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} />
              <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Barcode (optional)" value={newItem.barcode} onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })} />
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button type="button" onClick={() => setShowAddItem(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={creatingItem} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                {creatingItem ? 'Saving...' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Purchase Orders Tab
const PurchaseOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    poNumber: '',
    vendor: '',
    vendorId: '',
    dueDate: '',
    category: '',
    tags: '',
    additionalDetails: '',
    lineItems: [],
    files: [],
    purchaseDate: '',
    terms: '',
    shippingMethod: '',
    fobShippingPoint: '',
    requisitioner: '',
    notes: '',
    billingUseCompanyProfile: true,
    billingCompanyName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingPhone: '',
    billingFax: '',
    showLogoOnPdf: false,
    hideLogoOnPdf: false,
    shippingSameAsBilling: true,
    shippingName: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: ''
  });

  useEffect(() => {
    if (selectedPo) setShowDetails(true);
  }, [selectedPo]);

  useEffect(() => {
    const loadPurchaseOrders = async () => {
      try {
        const [poRes, venRes] = await Promise.all([
          api.get('/api/purchase-orders'),
          api.get('/api/vendors'),
        ]);
        setOrders(poRes.data || []);
        setVendors(venRes.data || []);
      } catch (e) {
        setOrders([]);
        setVendors([]);
      }
    };

    loadPurchaseOrders();

    const handleRefresh = () => {
      loadPurchaseOrders();
    };

    window.addEventListener('purchase-order-created', handleRefresh);
    return () => {
      window.removeEventListener('purchase-order-created', handleRefresh);
    };
  }, []);

  const exportCSV = () => {
    if (!filteredOrders || filteredOrders.length === 0) return;
    const keys = ['id', 'title', 'poNumber', 'itemsCount', 'totalCost', 'vendor', 'createdBy'];
    const rows = filteredOrders.map(o => ({ id: o._id || o.id || '', title: o.title || o.name || '', poNumber: o.poNumber || o.number || '', itemsCount: Array.isArray(o.items) ? o.items.length : '', totalCost: o.totalCost || o.cost || '', vendor: o.vendor?.name || o.vendor || '', createdBy: o.createdBy?.name || o.createdBy || '' }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g, '""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'purchase-orders.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const formatDate = (val) => {
    if (!val) return '—';
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? val : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPoRouteId = (po) => po?._id || po?.id || po?.poNumber || po?.number;

  const getPoTotal = (po) => {
    const explicitTotal = Number(po?.totalCost || po?.cost);
    if (explicitTotal) return explicitTotal;
    if (!Array.isArray(po?.items)) return 0;
    return po.items.reduce((sum, item) => sum + ((Number(item?.quantity) || 0) * (Number(item?.unitCost || item?.cost) || 0)), 0);
  };
  const filteredOrders = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return orders;
    return (orders || []).filter((order) => {
      const haystack = [
        order.title,
        order.name,
        order.poNumber,
        order.number,
        order.vendor?.name,
        order.vendor,
        order.createdBy?.name,
        order.createdBy?.email,
        order.category,
        order.status,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [orders, searchQuery]);

  const resetPoForm = () => setForm({
    title: '',
    poNumber: '',
    vendor: '',
    vendorId: '',
    dueDate: '',
    category: '',
    tags: '',
    additionalDetails: '',
    lineItems: [],
    files: [],
    purchaseDate: '',
    terms: '',
    shippingMethod: '',
    fobShippingPoint: '',
    requisitioner: '',
    notes: '',
    billingUseCompanyProfile: true,
    billingCompanyName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingPhone: '',
    billingFax: '',
    showLogoOnPdf: false,
    hideLogoOnPdf: false,
    shippingSameAsBilling: true,
    shippingName: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: ''
  });

  const openPoEditor = (po) => {
    setForm({
      title: po?.title || '',
      poNumber: po?.poNumber || po?.number || '',
      vendor: po?.vendor?.name || po?.vendor || po?.vendorDetails?.name || '',
      vendorId: po?.vendorId?._id || po?.vendorId || '',
      dueDate: formatDateForInput(po?.expectedDate || po?.dueDate),
      category: po?.category || '',
      tags: Array.isArray(po?.tags) ? po.tags.join(', ') : (po?.tags || ''),
      additionalDetails: po?.additionalDetails || po?.notes || '',
      lineItems: Array.isArray(po?.items) && po.items.length ? po.items.map((it) => ({
        name: it?.name || '',
        quantity: Number(it?.quantity) || 1,
        unitCost: Number(it?.unitCost || it?.cost) || 0
      })) : [],
      files: po?.files || [],
      purchaseDate: formatDateForInput(po?.purchaseDate || po?.createdAt),
      terms: po?.terms || '',
      shippingMethod: po?.shippingMethod || '',
      fobShippingPoint: po?.fobShippingPoint || '',
      requisitioner: po?.requisitioner || '',
      notes: po?.notes || po?.additionalDetails || '',
      billingUseCompanyProfile: !(po?.billing?.companyName || po?.billing?.address || po?.billing?.phone || po?.billing?.fax),
      billingCompanyName: po?.billing?.companyName || '',
      billingAddress: po?.billing?.address || '',
      billingCity: po?.billing?.city || '',
      billingState: po?.billing?.state || '',
      billingZip: po?.billing?.zip || '',
      billingPhone: po?.billing?.phone || '',
      billingFax: po?.billing?.fax || '',
      showLogoOnPdf: Boolean(po?.billing?.showLogoOnPdf),
      hideLogoOnPdf: Boolean(po?.billing?.hideLogoOnPdf),
      shippingSameAsBilling: !(po?.shipping?.name || po?.shipping?.address || po?.shipping?.city || po?.shipping?.state || po?.shipping?.zip),
      shippingName: po?.shipping?.name || '',
      shippingAddress: po?.shipping?.address || '',
      shippingCity: po?.shipping?.city || '',
      shippingState: po?.shipping?.state || '',
      shippingZip: po?.shipping?.zip || ''
    });
    setEditingId(getPoRouteId(po));
    setShowAdd(true);
    setShowDetails(false);
  };

  const updatePoStatus = async (po, status) => {
    const id = getPoRouteId(po);
    if (!id) {
      alert('Purchase order id not found');
      return;
    }
    try {
      const res = await api.put(`/api/purchase-orders/${id}`, { status });
      setOrders(prev => prev.map(o => (getPoRouteId(o) === id ? res.data : o)));
      setSelectedPo(res.data);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const savePo = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { alert('Title required'); return; }
    setSaving(true);
    try {
      const selectedVendor = vendors.find((vendor) => String(vendor._id || vendor.id) === String(form.vendorId));
      const payload = {
        title: form.title,
        poNumber: form.poNumber || `PO-${Date.now()}`,
        vendor: form.vendor || selectedVendor?.name,
        vendorId: form.vendorId || undefined,
        vendorEmail: selectedVendor?.email || undefined,
        expectedDate: form.dueDate || undefined,
        dueDate: form.dueDate || undefined,
        category: form.category || undefined,
        tags: form.tags || undefined,
        additionalDetails: form.additionalDetails || undefined,
        purchaseDate: form.purchaseDate || undefined,
        terms: form.terms || undefined,
        shippingMethod: form.shippingMethod || undefined,
        fobShippingPoint: form.fobShippingPoint || undefined,
        requisitioner: form.requisitioner || undefined,
        notes: form.notes || undefined,
        billing: {
          useCompanyProfile: form.billingUseCompanyProfile,
          companyName: form.billingCompanyName,
          address: form.billingAddress,
          city: form.billingCity,
          state: form.billingState,
          zip: form.billingZip,
          phone: form.billingPhone,
          fax: form.billingFax,
          showLogoOnPdf: form.showLogoOnPdf,
          hideLogoOnPdf: form.hideLogoOnPdf
        },
        shipping: {
          sameAsBilling: form.shippingSameAsBilling,
          name: form.shippingName,
          address: form.shippingAddress,
          city: form.shippingCity,
          state: form.shippingState,
          zip: form.shippingZip
        },
        items: (form.lineItems || []).map(it => ({
          name: it.name,
          quantity: Number(it.quantity) || 1,
          unitCost: Number(it.unitCost) || 0
        })),
        sendVendorLink: Boolean(selectedVendor?.email),
      };
      let res;
      if (editingId) {
        res = await api.put(`/api/purchase-orders/${editingId}`, payload);
        setOrders(prev => prev.map(o => (getPoRouteId(o) === editingId ? res.data : o)));
      } else {
        res = await api.post('/api/purchase-orders', payload);
        setOrders(prev => [res.data, ...(prev || [])]);
      }
      setSelectedPo(res.data);
      resetPoForm();
      setShowAdd(false);
      setEditingId(null);
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search purchase orders..."
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button onClick={() => setShowAdd(s => !s)} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">
            {showAdd ? 'Close' : 'New PO'}
          </button>
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={savePo} className="glass-surface rounded-lg border border-white/10 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Purchase Order' : 'New Purchase Order'}</h3>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setShowAdd(false); setEditingId(null); resetPoForm(); }} className="px-3 py-2 text-sm border rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                  {saving ? 'Saving...' : editingId ? 'Update Purchase Order' : 'Create Purchase Order'}
                </button>
              </div>
            </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">PO Number</label>
              <input value={form.poNumber} onChange={e => setForm(f => ({ ...f, poNumber: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Auto-generates if blank" />
              <span className="text-[11px] text-gray-400">This auto-generates unless a custom one is entered</span>
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
              <label className="text-xs font-semibold text-gray-600">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Category</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Tags</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Comma separated" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Additional Details</label>
              <textarea value={form.additionalDetails} onChange={e => setForm(f => ({ ...f, additionalDetails: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[90px]" />
            </div>
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-900">Line Items *</h4>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, lineItems: [...(f.lineItems || []), { name: '', quantity: 1, unitCost: 0 }] }))} className="px-3 py-2 border rounded-lg text-sm">Add Parts</button>
                <button type="button" className="px-3 py-2 border rounded-lg text-sm">More Actions</button>
              </div>
            </div>
            {(!form.lineItems || form.lineItems.length === 0) ? (
              <div className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-lg">No line items have been added yet</div>
            ) : (
              <div className="flex flex-col gap-3">
                {(form.lineItems || []).map((item, idx) => (
                  <div key={`li-${idx}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <input
                      value={item.name}
                      onChange={e => setForm(f => ({ ...f, lineItems: f.lineItems.map((it, i) => i === idx ? { ...it, name: e.target.value } : it) }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Item name"
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => setForm(f => ({ ...f, lineItems: f.lineItems.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) || 1 } : it) }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Qty"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitCost}
                      onChange={e => setForm(f => ({ ...f, lineItems: f.lineItems.map((it, i) => i === idx ? { ...it, unitCost: Number(e.target.value) || 0 } : it) }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Unit Cost"
                    />
                    <button type="button" onClick={() => setForm(f => ({ ...f, lineItems: f.lineItems.filter((_, i) => i !== idx) }))} className="px-3 py-2 text-sm border rounded-lg">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-4">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Files</h4>
            <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-500">Upload or drop files</div>
            <button type="button" className="mt-2 text-sm text-blue-600 hover:underline">Add from Saved Files</button>
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Billing Address</h4>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={form.billingUseCompanyProfile} onChange={() => setForm(f => ({ ...f, billingUseCompanyProfile: true }))} />
                  Use address from Company profile
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={!form.billingUseCompanyProfile} onChange={() => setForm(f => ({ ...f, billingUseCompanyProfile: false }))} />
                  Use a different address
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <input type="checkbox" checked={form.showLogoOnPdf} onChange={e => setForm(f => ({ ...f, showLogoOnPdf: e.target.checked }))} />
                Show company logo on PDF
              </label>
            </div>
            {!form.billingUseCompanyProfile && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Company Name</label>
                  <input value={form.billingCompanyName} onChange={e => setForm(f => ({ ...f, billingCompanyName: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Address</label>
                  <input value={form.billingAddress} onChange={e => setForm(f => ({ ...f, billingAddress: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">City</label>
                  <input value={form.billingCity} onChange={e => setForm(f => ({ ...f, billingCity: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">State</label>
                  <input value={form.billingState} onChange={e => setForm(f => ({ ...f, billingState: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Zip Code</label>
                  <input value={form.billingZip} onChange={e => setForm(f => ({ ...f, billingZip: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Phone Number</label>
                  <input value={form.billingPhone} onChange={e => setForm(f => ({ ...f, billingPhone: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Fax Number</label>
                  <input value={form.billingFax} onChange={e => setForm(f => ({ ...f, billingFax: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </>
            )}
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Shipping Address</h4>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={form.shippingSameAsBilling} onChange={() => setForm(f => ({ ...f, shippingSameAsBilling: true }))} />
                  Same as billing address
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={!form.shippingSameAsBilling} onChange={() => setForm(f => ({ ...f, shippingSameAsBilling: false }))} />
                  Use a different address
                </label>
              </div>
            </div>
            {!form.shippingSameAsBilling && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Ship To Name</label>
                  <input value={form.shippingName} onChange={e => setForm(f => ({ ...f, shippingName: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Address</label>
                  <input value={form.shippingAddress} onChange={e => setForm(f => ({ ...f, shippingAddress: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">City</label>
                  <input value={form.shippingCity} onChange={e => setForm(f => ({ ...f, shippingCity: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">State</label>
                  <input value={form.shippingState} onChange={e => setForm(f => ({ ...f, shippingState: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Zip Code</label>
                  <input value={form.shippingZip} onChange={e => setForm(f => ({ ...f, shippingZip: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </>
            )}
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Purchase Date</label>
              <input type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Terms</label>
              <input value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Shipping Method</label>
              <input value={form.shippingMethod} onChange={e => setForm(f => ({ ...f, shippingMethod: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">F.O.B. Shipping Point</label>
              <input value={form.fobShippingPoint} onChange={e => setForm(f => ({ ...f, fobShippingPoint: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Requisitioner</label>
              <input value={form.requisitioner} onChange={e => setForm(f => ({ ...f, requisitioner: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[90px]" />
            </div>
            <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.hideLogoOnPdf} onChange={e => setForm(f => ({ ...f, hideLogoOnPdf: e.target.checked }))} />
              Hide logo on PDF
            </label>
          </div>
        </form>
      )}

      <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="glass-surface border-b border-white/10">
              <tr>
                <th className="py-4 px-4">Title</th>
                <th className="py-4 px-4">PO Number</th>
                <th className="py-4 px-4"># Items</th>
                <th className="py-4 px-4">Total Cost</th>
                <th className="py-4 px-4">Vendor</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o, idx) => (
                <tr key={o._id || o.id || `po-${idx}`} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedPo && getPoRouteId(selectedPo) === getPoRouteId(o) ? 'bg-blue-50/60' : ''}`} onClick={() => { setSelectedPo(o); setShowDetails(true); }}>
                  <td className="py-4 px-4">{o.title || o.name || 'PO'}</td>
                  <td className="py-4 px-4">{o.poNumber || o.number || '-'}</td>
                  <td className="py-4 px-4">{Array.isArray(o.items) ? o.items.length : (o.itemsCount || '-')}</td>
                  <td className="py-4 px-4">{o.totalCost ? `$${Number(o.totalCost).toFixed(2)}` : '-'}</td>
                  <td className="py-4 px-4">{o.vendor?.name || o.vendor || '-'}</td>
                  <td className="py-4 px-4 text-right"><button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg" onClick={(e) => { e.stopPropagation(); setSelectedPo(o); setShowDetails(true); }}><Eye className="w-4 h-4 text-blue-600" /></button></td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (<tr><td colSpan="6" className="py-20 text-center"><p className="text-gray-500">No purchase orders found</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPo && showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs uppercase font-bold text-gray-400">Purchase Order</p>
                <h3 className="text-lg font-bold text-gray-900">#{selectedPo.poNumber || selectedPo.number || '—'} / {selectedPo.title || 'Untitled PO'}</h3>
                <p className="text-sm text-gray-500">Status: {selectedPo.status || 'Pending'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-sm border rounded-lg" onClick={() => setShowDetails(false)}>Close</button>
                <button className="px-3 py-2 text-sm border rounded-lg" onClick={() => openPoEditor(selectedPo)}>Edit</button>
                <button className="px-3 py-2 text-sm bg-rose-500 text-white rounded-lg" onClick={() => updatePoStatus(selectedPo, 'DECLINED')}>Decline</button>
                <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg" onClick={() => updatePoStatus(selectedPo, 'APPROVED')}>Approve</button>
              </div>
            </div>
            <div className="border-b border-gray-100 px-6">
              <div className="flex items-center gap-8 text-sm font-semibold text-gray-500">
                <button type="button" className="py-4 border-b-2 border-blue-600 text-gray-900">Details</button>
                <button type="button" className="py-4">Activity</button>
                <button type="button" className="py-4">Files</button>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_320px] gap-6">
              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 text-lg font-bold text-gray-900">Shipping Information</div>
                  <div className="divide-y divide-gray-100 text-sm">
                    <div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Company Name</span><span className="font-medium text-gray-900">{selectedPo.shipping?.name || selectedPo.billing?.companyName || selectedPo.vendorDetails?.name || selectedPo.vendor?.name || selectedPo.vendor || '—'}</span></div>
                    <div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Address</span><span className="font-medium text-gray-900">{selectedPo.shipping?.address || selectedPo.billing?.address || '—'}</span></div>
                    <div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Phone Number</span><span className="font-medium text-gray-900">{selectedPo.shipping?.phone || selectedPo.billing?.phone || selectedPo.vendorDetails?.phone || '—'}</span></div>
                    <div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Fax</span><span className="font-medium text-gray-900">{selectedPo.billing?.fax || 'None'}</span></div>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 text-lg font-bold text-gray-900">Line Items</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-600">
                        <tr>
                          <th className="py-3 px-4">Item</th>
                          <th className="py-3 px-4">Cost</th>
                          <th className="py-3 px-4">Qty</th>
                          <th className="py-3 px-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {(selectedPo.items || []).map((item, idx) => {
                          const qty = Number(item.quantity) || 0;
                          const cost = Number(item.unitCost || item.cost) || 0;
                          return (
                            <tr key={idx} className="border-t border-gray-100">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-gray-900">{item.name || 'Item'}</div>
                                {item.description && <div className="text-xs text-gray-500 mt-1">{item.description}</div>}
                              </td>
                              <td className="py-3 px-4 text-gray-700">${cost.toFixed(2)}</td>
                              <td className="py-3 px-4 text-gray-700">{qty}</td>
                              <td className="py-3 px-4 text-right font-bold text-gray-900">${(qty * cost).toFixed(2)}</td>
                            </tr>
                          );
                        })}
                        {(selectedPo.items || []).length === 0 && (
                          <tr><td colSpan={4} className="py-8 text-center text-gray-400">No items</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 text-lg font-bold text-gray-900">Additional Details</div>
                  <div className="divide-y divide-gray-100 text-sm">
                    <div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Purchase Date</span><span className="font-medium text-gray-900">{formatDate(selectedPo.purchaseDate || selectedPo.createdAt)}</span></div>
                    <div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Shipping Method</span><span className="font-medium text-gray-900">{selectedPo.shippingMethod || 'None'}</span></div>
                    <div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Terms</span><span className="font-medium text-gray-900">{selectedPo.terms || 'None'}</span></div>
                    <div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">F.O.B. Shipping Point</span><span className="font-medium text-gray-900">{selectedPo.fobShippingPoint || 'None'}</span></div>
                    <div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Notes</span><span className="font-medium text-gray-900">{selectedPo.notes || selectedPo.additionalDetails || 'None'}</span></div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white">
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Status</span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${requestStatusColor(selectedPo.status || 'PENDING')}`}>
                      {String(selectedPo.status || 'Pending').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4"><span className="text-gray-500">Vendor</span><span className="font-medium text-gray-900 text-right">{selectedPo.vendor?.name || selectedPo.vendorDetails?.name || selectedPo.vendor || '—'}</span></div>
                  <div className="flex items-center justify-between gap-4"><span className="text-gray-500">Due Date</span><span className="font-medium text-gray-900 text-right">{formatDate(selectedPo.expectedDate || selectedPo.dueDate)}</span></div>
                  <div className="flex items-center justify-between gap-4"><span className="text-gray-500">Added By</span><span className="font-medium text-gray-900 text-right">{selectedPo.createdBy?.name || selectedPo.createdBy?.email || '—'}</span></div>
                  <div className="flex items-center justify-between gap-4"><span className="text-gray-500">Date Added</span><span className="font-medium text-gray-900 text-right">{formatDate(selectedPo.createdAt)}</span></div>
                  <div className="flex items-center justify-between gap-4"><span className="text-gray-500">Cost</span><span className="font-medium text-gray-900 text-right">${getPoTotal(selectedPo).toFixed(2)}</span></div>
                  <div className="flex items-center justify-between gap-4"><span className="text-gray-500">Category</span><span className="font-medium text-gray-900 text-right">{selectedPo.category || 'None'}</span></div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-gray-500">Public Link</span>
                    <div className="flex max-w-[240px] items-center gap-2 text-right">
                      <span className="truncate font-medium text-blue-700">
                        {selectedPo.publicLink || 'Not available'}
                      </span>
                      {selectedPo.publicLink ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(selectedPo.publicLink);
                              alert('Public link copied.');
                            } catch (error) {
                              alert(`Copy failed. Use this link manually:\n${selectedPo.publicLink}`);
                            }
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy Link
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-5">
                    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 text-sm">
                      <span className="text-gray-500">Additional Details</span>
                      <span className="font-medium text-gray-900">{selectedPo.notes || selectedPo.additionalDetails || 'None'}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-5">Requester Information</h4>
                  <div className="space-y-5 text-sm">
                    <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Requisitioner</span><span className="font-medium text-gray-900 text-right">{selectedPo.requisitioner || selectedPo.createdBy?.name || 'Requisitioner'}</span></div>
                    <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Company Name</span><span className="font-medium text-gray-900 text-right">{selectedPo.billing?.companyName || selectedPo.shipping?.name || '—'}</span></div>
                    <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Address</span><span className="font-medium text-gray-900 text-right">{selectedPo.billing?.address || selectedPo.shipping?.address || '—'}</span></div>
                    <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Phone Number</span><span className="font-medium text-gray-900 text-right">{selectedPo.billing?.phone || selectedPo.shipping?.phone || '—'}</span></div>
                    <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Fax</span><span className="font-medium text-gray-900 text-right">{selectedPo.billing?.fax || '—'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Vendors or Customers Tab
const VendorsTab = ({ type = 'vendor' }) => {
  const [vendors, setVendors] = useState([]);
  const fileRef = React.useRef(null);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [creatingVendor, setCreatingVendor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newVendor, setNewVendor] = useState({
    name: '',
    address: '',
    phone: '',
    contact: '',
    email: '',
    type: '',
    description: '',
    website: '',
    hourlyRate: '',
    isLocationBased: false,
    billingName: '',
    billingAddress1: '',
    billingAddress2: '',
    billingAddress3: '',
    currency: 'USD',
    customFields: [{ name: '', value: '' }]
  });
  const normalizeEntry = (item, source) => {
    const roleLabel = item.role === 'requestor' ? 'Requestor' : item.role === 'client' ? 'Client' : '';
    const typeLabel = source === 'vendor' ? 'Vendor' : source === 'client' ? 'Customer' : roleLabel || 'Customer';
    return {
      ...item,
      __source: source,
      __typeLabel: typeLabel,
      name: item.name || item.company || item.fullName || item.contactName || item.email || 'Unnamed',
    };
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [vendorsRes, clientsRes, usersRes] = await Promise.allSettled([
        api.get('/api/vendors'),
        api.get('/api/clients'),
        api.get('/api/users/clients-requestors'),
      ]);
      const vendorItems = vendorsRes.status === 'fulfilled' ? vendorsRes.value.data || [] : [];
      const clientItems = clientsRes.status === 'fulfilled' ? clientsRes.value.data || [] : [];
      const userItems = usersRes.status === 'fulfilled' ? usersRes.value.data || [] : [];
      const merged = [
        ...vendorItems.map((v) => normalizeEntry(v, 'vendor')),
        ...clientItems.map((v) => normalizeEntry(v, 'client')),
        ...userItems.map((u) => normalizeEntry(u, 'user')),
      ];
      if (mounted) setVendors(merged);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredEntries = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (vendors || []).filter((v) => {
      const label = (v.__typeLabel || v.type || v.role || '').toLowerCase();
      const typeMatch = type === 'vendor'
        ? label.includes('vendor')
        : label.includes('customer') || label.includes('client') || label.includes('requestor');
      if (!typeMatch) return false;
      if (!query) return true;
      const haystack = [
        v.name,
        v.company,
        v.fullName,
        v.address,
        v.street,
        v.phone,
        v.phoneNumber,
        v.contactName,
        v.contact,
        v.email,
        v.__typeLabel,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery, type, vendors]);
  const selection = useBulkSelection(filteredEntries, (vendor) => vendor._id || vendor.id);

  const exportCSV = () => {
    if (!filteredEntries || filteredEntries.length === 0) return;
    const keys = ['id', 'name', 'type', 'address', 'phone', 'contact', 'email'];
    const rows = filteredEntries.map(v => ({
      id: v._id || v.id || '',
      name: v.name || v.company || v.fullName || '',
      type: v.__typeLabel || v.type || v.role || '',
      address: v.address || v.street || '',
      phone: v.phone || v.phoneNumber || '',
      contact: v.contactName || v.contact || '',
      email: v.email || ''
    }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g, '""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'vendors.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const headers = ['name', 'address', 'phone', 'contactName', 'email', 'type'];
    const sample = ['Acme Supplies', '123 Main St', '+1-555-0100', 'Jane Doe', 'jane@acme.com', 'vendor'];
    const csv = [headers.join(','), sample.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'vendors-template.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const onImport = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result || '';
        const rows = parseCsvText(text);
        if (rows.length === 0) {
          alert('No rows found in CSV');
          return;
        }
        const itemsPayload = rows.map(r => ({
          name: r.name || r.company || r.vendor || '',
          address: r.address || r.street || '',
          phone: r.phone || r.phonenumber || '',
          contactName: r.contact || r.contactname || '',
          email: r.email || '',
          type: r.type || r.category || 'vendor'
        })).filter(it => it.name);
        const endpoint = type === 'vendor' ? '/api/vendors/bulk' : '/api/clients/bulk';
        const res = await api.post(endpoint, { items: itemsPayload });
        setVendors(prev => [...(res.data || []), ...(prev || [])]);
        alert(`Imported ${itemsPayload.length} ${type === 'vendor' ? 'vendors' : 'customers'}`);
      } catch (err) {
        console.error('Failed to import vendors/customers', err);
        alert('Failed to import vendors/customers: ' + (err.response?.data?.error || err.message));
      }
    };
    reader.readAsText(f);
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    if (!newVendor.name.trim()) {
      alert('Please enter a name');
      return;
    }
    try {
      setCreatingVendor(true);
      let created = null;
      try {
        const res = await api.post(type === 'vendor' ? '/api/vendors' : '/api/clients', {
          name: newVendor.name,
          address: newVendor.address,
          phone: newVendor.phone,
          contactName: newVendor.contact,
          email: newVendor.email,
          type: newVendor.type,
          description: newVendor.description,
          website: newVendor.website,
          hourlyRate: newVendor.hourlyRate,
          isLocationBased: newVendor.isLocationBased,
          billing: type === 'customer' ? {
            name: newVendor.billingName,
            address1: newVendor.billingAddress1,
            address2: newVendor.billingAddress2,
            address3: newVendor.billingAddress3,
            currency: newVendor.currency
          } : undefined,
          customFields: type === 'customer'
            ? (newVendor.customFields || []).filter(f => f.name || f.value)
            : undefined
        });
        created = res.data;
      } catch (err) {
        const res = await api.post(type === 'vendor' ? '/api/clients' : '/api/vendors', {
          name: newVendor.name,
          address: newVendor.address,
          phone: newVendor.phone,
          contactName: newVendor.contact,
          email: newVendor.email,
          type: newVendor.type,
          description: newVendor.description,
          website: newVendor.website,
          hourlyRate: newVendor.hourlyRate,
          isLocationBased: newVendor.isLocationBased,
          billing: type === 'customer' ? {
            name: newVendor.billingName,
            address1: newVendor.billingAddress1,
            address2: newVendor.billingAddress2,
            address3: newVendor.billingAddress3,
            currency: newVendor.currency
          } : undefined,
          customFields: type === 'customer'
            ? (newVendor.customFields || []).filter(f => f.name || f.value)
            : undefined
        });
        created = res.data;
      }
      setVendors(prev => [created, ...(prev || [])]);
      setShowAddVendor(false);
      setNewVendor({
        name: '',
        address: '',
        phone: '',
        contact: '',
        email: '',
        type: '',
        description: '',
        website: '',
        hourlyRate: '',
        isLocationBased: false,
        billingName: '',
        billingAddress1: '',
        billingAddress2: '',
        billingAddress3: '',
        currency: 'USD',
        customFields: [{ name: '', value: '' }]
      });
      alert(`${type === 'vendor' ? 'Vendor' : 'Customer'} added successfully`);
    } catch (err) {
      console.error('Failed to add vendor/customer', err);
      alert('Failed to add vendor/customer: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreatingVendor(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    const selectedItems = (filteredEntries || []).filter((v) => selection.selectedIds.includes(String(v._id || v.id)));
    const deletableItems = selectedItems.filter((v) => v.__source !== 'user');
    const blockedItems = selectedItems.filter((v) => v.__source === 'user');
    if (blockedItems.length > 0) {
      alert(`Skipping ${blockedItems.length} user account(s). Delete users from the Users module.`);
    }
    if (deletableItems.length === 0) return;
    if (!window.confirm(`Delete ${deletableItems.length} vendor/customer record(s)? This cannot be undone.`)) return;
    try {
      for (const item of deletableItems) {
        const id = item._id || item.id;
        try {
          await api.delete(`/api/vendors/${id}`);
        } catch (err) {
          await api.delete(`/api/clients/${id}`);
        }
      }
      const removedIds = new Set(deletableItems.map((v) => String(v._id || v.id)));
      setVendors((prev) => (prev || []).filter((v) => !removedIds.has(String(v._id || v.id))));
      selection.clear();
    } catch (err) {
      console.error('Failed to delete vendors', err);
      alert(`Failed to delete selected ${type === 'vendor' ? 'vendors' : 'customers'}: ` + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{type === 'vendor' ? 'Vendors' : 'Customers'}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{type === 'vendor' ? 'Suppliers and service partners' : 'Customer contacts'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${type === 'vendor' ? 'vendors' : 'customers'}...`}
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
          <button onClick={downloadTemplate} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Download Template</button>
          <button onClick={() => setShowAddVendor(true)} className="px-3 py-2 bg-gray-900 text-blue-600 rounded-xl text-sm font-bold">
            {type === 'vendor' ? 'Create Vendor' : 'Create Customer'}
          </button>
          <button onClick={() => fileRef.current && fileRef.current.click()} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Import CSV</button>
          <input ref={fileRef} type="file" accept=".csv" onChange={onImport} className="hidden" />
        </div>
      </div>

      <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
        <BulkActionBar count={selection.selectedIds.length} label={type === 'vendor' ? 'vendors' : 'customers'} onDelete={handleDeleteSelected} />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="glass-surface border-b border-white/10">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selection.allSelected}
                    onChange={(e) => selection.toggleAll(e.target.checked)}
                  />
                </th>
                <th className="py-4 px-4">Name</th>
                <th className="py-4 px-4">Address</th>
                <th className="py-4 px-4">Phone Number</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((v, idx) => (
                <tr key={v._id || v.id || `vend-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selection.selectedIds.includes(String(v._id || v.id))}
                      onChange={() => selection.toggleOne(v._id || v.id)}
                    />
                  </td>
                  <td className="py-4 px-4">{v.name || v.company || 'Unnamed'}</td>
                  <td className="py-4 px-4">{v.address || v.street || 'N/A'}</td>
                  <td className="py-4 px-4">{v.phone || v.phoneNumber || 'N/A'}</td>
                  <td className="py-4 px-4">{v.contactName || v.contact || 'N/A'}</td>
                  <td className="py-4 px-4">{v.email || 'N/A'}</td>
                  <td className="py-4 px-4 text-right"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button></td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (<tr><td colSpan="7" className="py-20 text-center"><p className="text-gray-500">No {type === 'vendor' ? 'vendors' : 'customers'} found</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {showAddVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form onSubmit={handleCreateVendor} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{type === 'vendor' ? 'Create Vendor' : 'Create Customer'}</h3>
              <button type="button" onClick={() => setShowAddVendor(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Name / Company" value={newVendor.name} onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })} />
              <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Address" value={newVendor.address} onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Phone" value={newVendor.phone} onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })} />
                <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Contact Name" value={newVendor.contact} onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })} />
              </div>
              <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Email" value={newVendor.email} onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Type" value={newVendor.type} onChange={(e) => setNewVendor({ ...newVendor, type: e.target.value })} />
                <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Website" value={newVendor.website} onChange={(e) => setNewVendor({ ...newVendor, website: e.target.value })} />
              </div>
              <textarea className="w-full border border-gray-200 rounded-lg p-2 text-sm min-h-[90px]" placeholder="Description" value={newVendor.description} onChange={(e) => setNewVendor({ ...newVendor, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <span className="px-3 text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className="flex-1 p-2 text-sm outline-none"
                    placeholder="Hourly Rate"
                    value={newVendor.hourlyRate}
                    onChange={(e) => setNewVendor({ ...newVendor, hourlyRate: e.target.value })}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={newVendor.isLocationBased}
                    onChange={(e) => setNewVendor({ ...newVendor, isLocationBased: e.target.checked })}
                  />
                  Is Location Based
                </label>
              </div>

              {type === 'customer' && (
                <div className="mt-4 space-y-4">
                  <div className="text-sm font-semibold text-gray-800">Billing Information</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Billing Name" value={newVendor.billingName} onChange={(e) => setNewVendor({ ...newVendor, billingName: e.target.value })} />
                    <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Address" value={newVendor.billingAddress1} onChange={(e) => setNewVendor({ ...newVendor, billingAddress1: e.target.value })} />
                    <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Address Line 2" value={newVendor.billingAddress2} onChange={(e) => setNewVendor({ ...newVendor, billingAddress2: e.target.value })} />
                    <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Address Line 3" value={newVendor.billingAddress3} onChange={(e) => setNewVendor({ ...newVendor, billingAddress3: e.target.value })} />
                    <select className="w-full border border-gray-200 rounded-lg p-2 text-sm" value={newVendor.currency} onChange={(e) => setNewVendor({ ...newVendor, currency: e.target.value })}>
                      <option value="USD">USD - United States Dollar - $</option>
                      <option value="EUR">EUR - Euro - €</option>
                      <option value="GBP">GBP - British Pound - £</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-800">Custom Data</div>
                      <button
                        type="button"
                        onClick={() => setNewVendor(v => ({ ...v, customFields: [...(v.customFields || []), { name: '', value: '' }] }))}
                        className="text-blue-600 text-sm font-semibold"
                      >
                        Add Custom Field
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(newVendor.customFields || []).map((cf, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">Field Name</label>
                            <input
                              value={cf.name}
                              onChange={e => setNewVendor(v => {
                                const next = [...(v.customFields || [])];
                                next[idx] = { ...next[idx], name: e.target.value };
                                return { ...v, customFields: next };
                              })}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">Value</label>
                            <input
                              value={cf.value}
                              onChange={e => setNewVendor(v => {
                                const next = [...(v.customFields || [])];
                                next[idx] = { ...next[idx], value: e.target.value };
                                return { ...v, customFields: next };
                              })}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                          <div className="text-right">
                            {(newVendor.customFields || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => setNewVendor(v => ({ ...v, customFields: v.customFields.filter((_, i) => i !== idx) }))}
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
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button type="button" onClick={() => setShowAddVendor(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={creatingVendor} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                {creatingVendor ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Preventive Maintenance Tab Component
const PreventiveMaintenanceTab = ({ issues, technicians, locations, assets, onRefresh, onOpenDetails }) => {
  const [localSearch, setLocalSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    location: '',
    assetId: '',
    priority: 'MEDIUM',
    frequency: 'MONTHLY',
    dueDate: '',
    technicianId: ''
  });

  const filtered = React.useMemo(() => (
    issues.filter(issue =>
      issue.title?.toLowerCase().includes(localSearch.toLowerCase()) ||
      issue.description?.toLowerCase().includes(localSearch.toLowerCase())
    )
  ), [issues, localSearch]);
  const selection = useBulkSelection(filtered, (issue) => issue._id || issue.id);
  const formatFrequency = (value) => {
    if (!value) return '—';
    const normalized = String(value).toLowerCase();
    if (normalized === 'daily') return 'Daily';
    if (normalized === 'weekly') return 'Weekly';
    if (normalized === 'monthly') return 'Monthly';
    if (normalized === 'quarterly') return 'Quarterly';
    if (normalized === 'yearly' || normalized === 'annual') return 'Yearly';
    return value;
  };

  const handleCreatePreventive = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      alert('Please enter a title');
      return;
    }
    try {
      setCreating(true);
      const payload = {
        title: newTask.title,
        description: newTask.description,
        location: newTask.location,
        assetId: newTask.assetId || undefined,
        priority: newTask.priority || 'MEDIUM',
        frequency: newTask.frequency || 'MONTHLY',
        dueDate: newTask.dueDate || undefined,
        tags: ['preventive'],
        issueType: 'preventive',
        category: 'preventive',
        internalTechnicianId: newTask.technicianId || undefined
      };
      await api.post('/api/issues', payload);
      setShowCreate(false);
      setNewTask({ title: '', description: '', location: '', assetId: '', priority: 'MEDIUM', frequency: 'MONTHLY', dueDate: '', technicianId: '' });
      if (onRefresh) onRefresh();
      alert('Preventive task created successfully');
    } catch (err) {
      console.error('Failed to create preventive task', err);
      alert('Failed to create preventive task: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selection.selectedIds.length} preventive task(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(selection.selectedIds.map((id) => api.delete(`/api/issues/${id}`)));
      selection.clear();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete preventive tasks', err);
      alert('Failed to delete selected tasks: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Preventive Maintenance</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create and assign preventive tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search tasks"
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>
      <BulkActionBar count={selection.selectedIds.length} label="preventive tasks" onDelete={handleDeleteSelected} />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="glass-surface border-b border-white/10">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selection.allSelected}
                    onChange={(e) => selection.toggleAll(e.target.checked)}
                  />
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Work Order Title</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Work Order Description</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Image</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assets & Locations</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((issue, idx) => (
                <tr
                  key={issue._id || issue.id || idx}
                  onClick={() => onOpenDetails && onOpenDetails('issue', issue)}
                  className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selection.selectedIds.includes(String(issue._id || issue.id))}
                      onChange={() => selection.toggleOne(issue._id || issue.id)}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Box className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-900 line-clamp-1">{issue.assetName || issue.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-gray-500 font-mono tracking-tighter">
                      {String(issue._id || issue.id).length > 8 ? `${String(issue._id || issue.id).slice(-8)}...` : issue._id || issue.id}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-gray-900 line-clamp-1">{issue.title}</span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-500 line-clamp-1 max-w-[250px]">{issue.description}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-gray-700">
                      {(issue.fixDeadline || issue.dueDate || issue.nextDate)
                        ? normalizeDate(issue.fixDeadline || issue.dueDate || issue.nextDate).toLocaleDateString()
                        : 'Not set'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-gray-700">
                      {formatFrequency(issue.frequency || issue.interval || issue?.checklist?.frequency)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 border border-gray-100 overflow-hidden">
                        {issue.image || issue.photo || issue.assetImage ? (
                          <img src={getImageUrl(issue.image || issue.photo || issue.assetImage)} alt="Asset" className="w-full h-full object-cover" />
                        ) : (
                          <Database className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors max-w-[140px]">
                      <span className="text-xs font-bold text-gray-700 truncate">
                        {issue.locationName || issue.address || 'Global'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 font-medium">
                    {issue.category || '-'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="10" className="py-24 text-center">
                    <div className="flex flex-col items-center max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                        <CircleDashed className="w-8 h-8 text-gray-200 animate-spin-slow" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">No tasks returned</h3>
                      <p className="text-gray-500 text-sm">We couldn't find any preventive maintenance tasks matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form onSubmit={handleCreatePreventive} className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create Preventive Task</h3>
                <p className="text-sm text-gray-500">Schedule and assign maintenance</p>
              </div>
              <button type="button" onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Replace filters, test sensors, etc."
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                <textarea
                  className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm h-24"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Describe the preventive work"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                <select
                  className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm bg-white"
                  value={newTask.location}
                  onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => {
                    const locName = loc.name || loc.title || loc.address || 'Location';
                    return (
                      <option key={loc._id || loc.id || locName} value={locName}>
                        {locName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Asset</label>
                <select
                  className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm bg-white"
                  value={newTask.assetId}
                  onChange={(e) => setNewTask({ ...newTask, assetId: e.target.value })}
                >
                  <option value="">No asset</option>
                  {assets.map((asset) => (
                    <option key={asset._id || asset.id} value={asset._id || asset.id}>
                      {asset.name || asset.title || 'Asset'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Priority</label>
                <select
                  className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm bg-white"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Frequency</label>
                <select
                  className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm bg-white"
                  value={newTask.frequency}
                  onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Due Date</label>
                <input
                  type="date"
                  className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Assign To</label>
                <select
                  className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm bg-white"
                  value={newTask.technicianId}
                  onChange={(e) => setNewTask({ ...newTask, technicianId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {technicians.map((tech) => (
                    <option key={tech._id || tech.id} value={tech._id || tech.id}>
                      {tech.name || tech.fullName || tech.email || 'Technician'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold">
                Cancel
              </button>
              <button type="submit" disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                {creating ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Redesigned Issues Tab (Work Orders)
const IssuesTab = ({
  issues,
  technicians,
  assigning,
  assignmentData,
  setAssignmentData,
  handleOpenAssignment,
  handleAssignTech,
  getAssignedTechName,
  onOpenDetails,
  onRefresh,
  onCreateWorkOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [calendarFilterOpen, setCalendarFilterOpen] = useState(null);
  const [calendarStatusFilters, setCalendarStatusFilters] = useState(['OPEN', 'IN PROGRESS', 'ON HOLD', 'COMPLETE']);
  const [calendarPriorityFilters, setCalendarPriorityFilters] = useState(['HIGH', 'MEDIUM', 'LOW', 'NONE']);
  const [calendarAssigneeFilter, setCalendarAssigneeFilter] = useState('all');
  const [calendarDayFilter, setCalendarDayFilter] = useState('any');
  const [calendarLocationFilters, setCalendarLocationFilters] = useState([]);
  const filteredIssues = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return issues;
    return (issues || []).filter((issue) => {
      const haystack = [
        issue.title,
        issue.description,
        issue.location,
        issue.assetName,
        issue.priority,
        issue.status,
        getAssignedTechName(issue),
        normalizeId(issue._id || issue.id),
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [issues, searchQuery, getAssignedTechName]);
  const selection = useBulkSelection(filteredIssues, (issue) => issue._id || issue.id);

  const getIssueDate = (issue) => normalizeDate(issue.fixDeadline || issue.dueDate || issue.createdAt || issue.date);

  const normalizeStatus = (issue) => {
    const status = String(issue.status || '').toUpperCase();
    return status.includes('PROGRESS')
      ? 'IN PROGRESS'
      : status.includes('HOLD')
        ? 'ON HOLD'
        : status.includes('COMPLETE')
          ? 'COMPLETE'
          : status.includes('OPEN') || status.includes('PENDING')
            ? 'OPEN'
            : 'OPEN';
  };

  const getAssigneeLabel = (issue) => {
    const name = getAssignedTechName(issue);
    return name && name !== 'Unassigned' ? name : 'No Assignee';
  };

  const getInitials = (name) => {
    if (!name) return 'N/A';
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    return (first + last).toUpperCase() || 'N/A';
  };

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const buildCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days = [];
    for (let i = 0; i < startOffset; i += 1) days.push(null);
    for (let d = 1; d <= totalDays; d += 1) days.push(new Date(year, month, d));
    return { days, monthLabel: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  };

  const { days: calendarDays, monthLabel } = buildCalendarDays();
  const issuesByDay = filteredIssues.reduce((acc, issue) => {
    const date = getIssueDate(issue);
    if (!date || Number.isNaN(date.getTime())) return acc;
    const key = date.toISOString().slice(0, 10);
    acc[key] = acc[key] || [];
    acc[key].push(issue);
    return acc;
  }, {});
  const statusCounts = filteredIssues.reduce((acc, issue) => {
    const normalized = normalizeStatus(issue);
    acc[normalized] = (acc[normalized] || 0) + 1;
    return acc;
  }, {});

  const allLocations = Array.from(new Set(filteredIssues.map((issue) => issue.location || issue.assetName).filter(Boolean)));
  const calendarIssues = filteredIssues.filter((issue) => {
    const statusOk = calendarStatusFilters.includes(normalizeStatus(issue));
    const priority = String(issue.priority || 'NONE').toUpperCase();
    const priorityOk = calendarPriorityFilters.includes(priority);
    const assignee = getAssignedTechName(issue);
    const assigneeOk = calendarAssigneeFilter === 'all'
      ? true
      : calendarAssigneeFilter === 'assigned'
        ? assignee !== 'Unassigned'
        : assignee === 'Unassigned';
    const locationVal = String(issue.location || issue.assetName || '');
    const locationOk = calendarLocationFilters.length === 0 || calendarLocationFilters.includes(locationVal);
    const date = getIssueDate(issue);
    let dayOk = true;
    if (calendarDayFilter !== 'any' && date && !Number.isNaN(date.getTime())) {
      const now = new Date();
      if (calendarDayFilter === 'today') {
        dayOk = date.toDateString() === now.toDateString();
      } else if (calendarDayFilter === 'week') {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        dayOk = date >= start && date <= end;
      } else if (calendarDayFilter === 'month') {
        dayOk = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
    }
    return statusOk && priorityOk && assigneeOk && locationOk && dayOk;
  });
  const calendarIssuesByDay = calendarIssues.reduce((acc, issue) => {
    const date = getIssueDate(issue);
    if (!date || Number.isNaN(date.getTime())) return acc;
    const key = date.toISOString().slice(0, 10);
    acc[key] = acc[key] || [];
    acc[key].push(issue);
    return acc;
  }, {});

  const groups = filteredIssues.reduce((acc, issue) => {
    const label = getAssigneeLabel(issue);
    if (!acc[label]) acc[label] = [];
    acc[label].push(issue);
    return acc;
  }, {});
  const groupEntries = Object.entries(groups);

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selection.selectedIds.length} work order(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(selection.selectedIds.map((id) => api.delete(`/api/issues/${id}`)));
      selection.clear();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete issues', err);
      alert('Failed to delete selected work orders: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 glass-surface">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Orders</h2>
          <p className="text-sm text-gray-600">Manage and track active work orders</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search work orders..."
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white/70 p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => onCreateWorkOrder && onCreateWorkOrder()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700"
          >
            Create Work Order
          </button>
        </div>
      </div>
      <BulkActionBar count={selection.selectedIds.length} label="work orders" onDelete={handleDeleteSelected} />
      {viewMode === 'table' && (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="glass-surface border-b border-white/10">
            <tr>
              <th className="py-4 px-4 w-10">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selection.allSelected}
                  onChange={(e) => selection.toggleAll(e.target.checked)}
                />
              </th>
              <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">WO #</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Work Order Title</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Technician</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue, idx) => (
              <React.Fragment key={issue._id || issue.id || `issue-row-${idx}`}>
                <tr
                  onClick={() => onOpenDetails && onOpenDetails('issue', issue)}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-300 group cursor-pointer"
                >
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selection.selectedIds.includes(String(issue._id || issue.id))}
                      onChange={() => selection.toggleOne(issue._id || issue.id)}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">
                        {String(normalizeId(issue._id || issue.id)).slice(-4)}
                      </span>
                      <div className="w-5 h-5 bg-rose-50 rounded flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-rose-500" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 group/title">
                      <div className="text-sm font-bold text-gray-900 group-hover/title:text-blue-600 transition-colors">
                        {issue.title}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      {getImageUrl(issue.beforeImage || issue.beforePhoto || issue.photo || issue.image) ? (
                        <img
                          src={getImageUrl(issue.beforeImage || issue.beforePhoto || issue.photo || issue.image)}
                          alt="Before"
                          className="w-12 h-12 rounded object-cover border border-gray-200"
                          title="Before"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-[10px] text-center border border-gray-200">No img</div>
                      )}
                      {getImageUrl(issue.afterImage || issue.afterPhoto) && (
                        <img
                          src={getImageUrl(issue.afterImage || issue.afterPhoto)}
                          alt="After"
                          className="w-12 h-12 rounded object-cover border border-green-200"
                          title="After"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px]">{issue.description}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-[11px] font-bold text-[#b45309]">
                      {(issue.fixDeadline || issue.dueDate) ? normalizeDate(issue.fixDeadline || issue.dueDate).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-[11px] font-bold text-[#b45309]">
                      {issue.createdAt ? normalizeDate(issue.createdAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-semibold text-gray-700">
                      {getAssignedTechName(issue)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center justify-center w-5 h-5">
                        <CircleDashed className={`w-5 h-5 ${issue.status === 'COMPLETE' ? 'text-green-500' : 'text-gray-300'}`} />
                        {issue.status === 'IN PROGRESS' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <Play className="w-1.5 h-1.5 text-blue-600 fill-white" />
                            </div>
                          </div>
                        )}
                        {issue.status === 'COMPLETE' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-500 fill-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-700 capitalize">
                        {issue.status === 'PENDING' ? 'Open' : issue.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Flag className={`w-4 h-4 ${issue.priority === 'HIGH' ? 'text-[#e11d48] fill-[#e11d48]' : issue.priority === 'MEDIUM' ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-gray-400 fill-gray-400'}`} />
                      <span className="text-sm font-bold text-gray-700">
                        {issue.priority === 'HIGH' ? 'High' : issue.priority === 'MEDIUM' ? 'Medium' : issue.priority === 'LOW' ? 'Low' : 'None'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openCommentModal(issue); }}
                        className="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="Open comments"
                      >
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                      </button>
                      {assigning === (issue._id || issue.id) ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenAssignment(null); }}
                          className="text-xs font-bold text-gray-400 hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      ) : (
                        !(issue.assignedTo || issue.assignedTechnicianId || (Array.isArray(issue.assignees) && issue.assignees.length > 0)) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenAssignment(issue); }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Assign"
                          >
                            <Plus className="w-4 h-4 text-blue-600" />
                          </button>
                        )
                      )}
                      <button onClick={(e) => e.stopPropagation()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
                {assigning === (issue._id || issue.id) && (
                  <tr>
                    <td colSpan="10" className="p-0 border-b border-gray-50">
                      <AssignmentForm
                        assignmentData={assignmentData}
                        setAssignmentData={setAssignmentData}
                        technicians={technicians}
                        onAssign={() => handleAssignTech(normalizeId(issue._id || issue.id))}
                        onCancel={() => handleOpenAssignment(null)}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filteredIssues.length === 0 && (
              <tr>
                <td colSpan="11" className="py-20 text-center">
                  <div className="flex flex-col items-center">
                    <Box className="w-12 h-12 text-gray-200 mb-4" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No work orders found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {viewMode === 'list' && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Open', key: 'OPEN', color: 'border-l-4 border-rose-500' },
              { label: 'In Progress', key: 'IN PROGRESS', color: 'border-l-4 border-emerald-500' },
              { label: 'On Hold', key: 'ON HOLD', color: 'border-l-4 border-amber-500' },
              { label: 'Complete', key: 'COMPLETE', color: 'border-l-4 border-slate-400' }
            ].map((item) => (
              <div key={item.key} className={`bg-white/80 rounded-xl p-4 border border-gray-100 ${item.color} shadow-sm`}>
                <div className="text-sm font-bold text-gray-600">{item.label}</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{statusCounts[item.key] || 0}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {groupEntries.map(([assignee, items]) => {
              const expanded = expandedGroups[assignee] !== false;
              return (
                <div key={assignee} className="bg-white/70 rounded-2xl border border-gray-100 shadow-sm">
                  <button
                    onClick={() => toggleGroup(assignee)}
                    className="w-full flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">
                        {getInitials(assignee)}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-gray-900">{assignee}</div>
                        <div className="text-xs text-gray-500">{items.length} work orders</div>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {items.map((issue, idx) => (
                          <div
                            key={issue._id || issue.id || `list-card-${idx}`}
                            onClick={() => onOpenDetails && onOpenDetails('issue', issue)}
                            className="p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded px-2 py-0.5">
                                  #{String(normalizeId(issue._id || issue.id)).slice(-4)}
                                </span>
                                <span className={`text-[11px] font-bold rounded px-2 py-0.5 ${
                                  issue.priority === 'HIGH' ? 'bg-rose-100 text-rose-700'
                                    : issue.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700'
                                      : issue.priority === 'LOW' ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {issue.priority || 'None'}
                                </span>
                              </div>
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">{issue.title}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="w-3.5 h-3.5" />
                              {(issue.fixDeadline || issue.dueDate)
                                ? normalizeDate(issue.fixDeadline || issue.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                                : 'No due date'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {issue.location || issue.assetName || 'Unknown location'}
                            </div>
                          </div>
                        ))}
                        {items.length === 0 && (
                          <div className="col-span-full text-sm text-gray-400 italic py-6 text-center">No work order found for the status</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {groupEntries.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No work orders found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500">
                <Filter className="w-4 h-4" />
              </button>
              {[
                { label: calendarAssigneeFilter === 'all' ? 'Everyone' : calendarAssigneeFilter === 'assigned' ? 'Assigned' : 'Unassigned', icon: Users, key: 'assignee' },
                { label: calendarLocationFilters.length > 0 ? `${calendarLocationFilters.length} Location(s)` : 'Anywhere', icon: MapPin, key: 'location' },
                { label: calendarDayFilter === 'any' ? 'Any Day' : calendarDayFilter === 'today' ? 'Today' : calendarDayFilter === 'week' ? 'This Week' : 'This Month', icon: Calendar, key: 'day' },
                { label: calendarStatusFilters.length === 4 ? 'Open, On Hold, In Progress' : `${calendarStatusFilters.length} Status`, icon: CircleDashed, key: 'status' },
                { label: calendarPriorityFilters.length === 4 ? 'Any Priority' : `${calendarPriorityFilters.length} Priority`, icon: Flag, key: 'priority' },
                { label: 'Bookmarked', icon: Star }
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => chip.key && setCalendarFilterOpen((prev) => (prev === chip.key ? null : chip.key))}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  <chip.icon className="w-4 h-4 text-gray-400" />
                  {chip.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
              <button className="text-blue-600 hover:text-blue-700">Save Filter</button>
              <button className="p-2 rounded-lg border border-gray-200 bg-white">
                <Repeat className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  setCalendarStatusFilters(['OPEN', 'IN PROGRESS', 'ON HOLD', 'COMPLETE']);
                  setCalendarPriorityFilters(['HIGH', 'MEDIUM', 'LOW', 'NONE']);
                  setCalendarAssigneeFilter('all');
                  setCalendarDayFilter('any');
                  setCalendarLocationFilters([]);
                }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-gray-400" />
                Quick Filters
              </button>
            </div>
          </div>

          <div className="relative">
            <FilterPopover
              isOpen={calendarFilterOpen === 'status'}
              onClose={() => setCalendarFilterOpen(null)}
              title="Status"
              className="w-64"
            >
              {['OPEN', 'IN PROGRESS', 'ON HOLD', 'COMPLETE'].map((s) => (
                <label key={s} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={calendarStatusFilters.includes(s)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...calendarStatusFilters, s]
                        : calendarStatusFilters.filter((x) => x !== s);
                      setCalendarStatusFilters(next);
                    }}
                  />
                  <span className="text-sm font-semibold text-gray-700">{s}</span>
                </label>
              ))}
            </FilterPopover>

            <FilterPopover
              isOpen={calendarFilterOpen === 'priority'}
              onClose={() => setCalendarFilterOpen(null)}
              title="Priority"
              className="w-56"
            >
              {['HIGH', 'MEDIUM', 'LOW', 'NONE'].map((p) => (
                <label key={p} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={calendarPriorityFilters.includes(p)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...calendarPriorityFilters, p]
                        : calendarPriorityFilters.filter((x) => x !== p);
                      setCalendarPriorityFilters(next);
                    }}
                  />
                  <span className="text-sm font-semibold text-gray-700">{p}</span>
                </label>
              ))}
            </FilterPopover>

            <FilterPopover
              isOpen={calendarFilterOpen === 'assignee'}
              onClose={() => setCalendarFilterOpen(null)}
              title="Assignee"
              className="w-56"
            >
              {[
                { id: 'all', label: 'Everyone' },
                { id: 'assigned', label: 'Assigned' },
                { id: 'unassigned', label: 'Unassigned' }
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    name="calendar-assignee"
                    checked={calendarAssigneeFilter === opt.id}
                    onChange={() => setCalendarAssigneeFilter(opt.id)}
                  />
                  <span className="text-sm font-semibold text-gray-700">{opt.label}</span>
                </label>
              ))}
            </FilterPopover>

            <FilterPopover
              isOpen={calendarFilterOpen === 'day'}
              onClose={() => setCalendarFilterOpen(null)}
              title="Day"
              className="w-56"
            >
              {[
                { id: 'any', label: 'Any Day' },
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' }
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    name="calendar-day"
                    checked={calendarDayFilter === opt.id}
                    onChange={() => setCalendarDayFilter(opt.id)}
                  />
                  <span className="text-sm font-semibold text-gray-700">{opt.label}</span>
                </label>
              ))}
            </FilterPopover>

            <FilterPopover
              isOpen={calendarFilterOpen === 'location'}
              onClose={() => setCalendarFilterOpen(null)}
              title="Location"
              className="w-72"
            >
              <div className="space-y-1">
                {allLocations.map((loc) => (
                  <label key={loc} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={calendarLocationFilters.includes(loc)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...calendarLocationFilters, loc]
                          : calendarLocationFilters.filter((x) => x !== loc);
                        setCalendarLocationFilters(next);
                      }}
                    />
                    <span className="text-sm font-semibold text-gray-700">{loc}</span>
                  </label>
                ))}
                {allLocations.length === 0 && (
                  <div className="p-3 text-xs text-gray-400 italic text-center">No locations found</div>
                )}
              </div>
            </FilterPopover>
          </div>

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">{monthLabel}</h3>
            <span className="text-xs text-gray-500">Dates are based on due date or created date</span>
          </div>

          <div className="grid grid-cols-7 gap-0 text-xs font-bold text-gray-500 mb-2 border border-gray-200 rounded-t-xl overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center py-2 bg-gray-50 border-r last:border-r-0 border-gray-200">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0 border border-gray-200 border-t-0 rounded-b-xl overflow-hidden bg-white">
            {calendarDays.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className="h-28 border-r border-b border-gray-200 bg-gray-50/50" />;
              }
              const key = day.toISOString().slice(0, 10);
              const dayIssues = calendarIssuesByDay[key] || [];
              const isToday = new Date().toDateString() === day.toDateString();
              return (
                <div key={key} className={`h-28 border-r border-b border-gray-200 p-2 overflow-hidden ${isToday ? 'bg-blue-50/60' : 'bg-white'}`}>
                  <div className="text-[11px] font-bold text-gray-500 text-right">{String(day.getDate()).padStart(2, '0')}</div>
                  <div className="mt-1 space-y-1">
                    {dayIssues.slice(0, 2).map((issue, idx) => {
                      const status = normalizeStatus(issue);
                      const tone = status.includes('PROGRESS')
                        ? 'bg-emerald-500'
                        : status.includes('HOLD')
                          ? 'bg-amber-500'
                          : status.includes('COMPLETE')
                            ? 'bg-slate-500'
                            : 'bg-rose-500';
                      const timeLabel = (issue.fixDeadline || issue.dueDate || issue.createdAt)
                        ? normalizeDate(issue.fixDeadline || issue.dueDate || issue.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '3:00 pm';
                      return (
                        <div
                          key={`${key}-${idx}`}
                          onClick={() => onOpenDetails && onOpenDetails('issue', issue)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold text-white truncate ${tone}`}
                          title={issue.title}
                        >
                          {timeLabel} #{String(normalizeId(issue._id || issue.id)).slice(-4)} {issue.title}
                        </div>
                      );
                    })}
                    {dayIssues.length > 2 && (
                      <div className="text-[10px] text-gray-400 font-semibold">+{dayIssues.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Assignment Form
const AssignmentForm = ({ assignmentData, setAssignmentData, technicians, onAssign, onCancel }) => (
  <div className="mt-4 p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-200">
    <h4 className="text-lg font-bold text-gray-900 mb-4">Assign Issue to Technician</h4>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Technician</label>
        <select
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={assignmentData.technicianId}
          onChange={(e) => setAssignmentData({ ...assignmentData, technicianId: e.target.value })}
        >
          <option value="">Select technician...</option>
          {technicians.map((tech, i) => (
            <option key={normalizeId(tech._id || tech.id || tech.userId) || `tech-${i}`} value={normalizeId(tech._id || tech.id || tech.userId) || ''}>
              {tech.name || tech.username || 'Unnamed'}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
        <select
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={assignmentData.priority}
          onChange={(e) => setAssignmentData({ ...assignmentData, priority: e.target.value })}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
        <input
          type="date"
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={assignmentData.dueDate}
          onChange={(e) => setAssignmentData({ ...assignmentData, dueDate: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
    </div>
    <div className="flex gap-3">
      <GradientButton
        onClick={onAssign}
        disabled={!assignmentData.technicianId || !assignmentData.dueDate}
        color="green"
        className="px-6 py-2.5"
      >
        Assign Issue
      </GradientButton>
      <button
        onClick={onCancel}
        className="px-6 py-2.5 bg-gradient-to-b from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 border border-gray-300"
      >
        Cancel
      </button>
    </div>
  </div>
);

// Enhanced All Issues Tab
const AllIssuesTab = ({
  filters,
  setFilters,
  getFilteredIssues,
  getAssignedTechName,
  searchQuery,
  setSearchQuery,
  onRefresh
}) => {
  const filteredIssues = getFilteredIssues();
  const selection = useBulkSelection(filteredIssues, (issue) => issue._id || issue.id);

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selection.selectedIds.length} issue(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(selection.selectedIds.map((id) => api.delete(`/api/issues/${id}`)));
      selection.clear();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete issues', err);
      alert('Failed to delete selected issues: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Issues</h2>
            <p className="text-gray-600">View and manage all maintenance requests</p>
          </div>
          <div className="flex items-center gap-3">
            <GradientButton color="blue" className="px-4 py-2.5 text-sm">
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </span>
            </GradientButton>
          </div>
        </div>
      </div>

      <BulkActionBar count={selection.selectedIds.length} label="issues" onDelete={handleDeleteSelected} />

      {/* Enhanced Filters */}
      <GlassCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <Filter className="w-5 h-5 text-blue-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="pending-approval">Pending Approval</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="all">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment</label>
            <select
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
            >
              <option value="all">All Issues</option>
              <option value="unassigned">Unassigned</option>
              <option value="assigned">Assigned</option>
            </select>
          </div>
        </div>
      </GlassCard>

      <div className="glass-surface-strong rounded-xl overflow-hidden shadow-2xl border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="glass-surface border-b border-white/10">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">WO #</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Work Order Title</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Technician</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue, idx) => (
                <tr
                  key={issue._id || issue.id || `all-issue-${idx}`}
                  className="border-b border-white/10 hover:bg-white/40 transition-all duration-300 group"
                >
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selection.selectedIds.includes(String(issue._id || issue.id))}
                      onChange={() => selection.toggleOne(issue._id || issue.id)}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">
                        {String(normalizeId(issue._id || issue.id)).slice(-4)}
                      </span>
                      <div className="w-5 h-5 bg-rose-50 rounded flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-rose-500" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 group/title">
                      <div className="text-sm font-bold text-gray-900 group-hover/title:text-blue-600 transition-colors">
                        {issue.title}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      {/* Before Image */}
                      {getImageUrl(issue.beforeImage || issue.beforePhoto || issue.photo || issue.image) ? (
                        <img
                          src={getImageUrl(issue.beforeImage || issue.beforePhoto || issue.photo || issue.image)}
                          alt="Before"
                          className="w-12 h-12 rounded object-cover border border-gray-200"
                          title="Before"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-[10px] text-center border border-gray-200">No img</div>
                      )}

                      {/* After Image (Only if exists) */}
                      {getImageUrl(issue.afterImage || issue.afterPhoto) && (
                        <img
                          src={getImageUrl(issue.afterImage || issue.afterPhoto)}
                          alt="After"
                          className="w-12 h-12 rounded object-cover border border-green-200"
                          title="After"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px]">{issue.description}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-[11px] font-bold text-[#b45309]">
                      {(issue.fixDeadline || issue.dueDate) ? normalizeDate(issue.fixDeadline || issue.dueDate).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-[11px] font-bold text-[#b45309]">
                      {issue.createdAt ? normalizeDate(issue.createdAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-semibold text-gray-700">
                      {getAssignedTechName(issue)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center justify-center w-5 h-5">
                        <CircleDashed className={`w-5 h-5 ${issue.status === 'COMPLETE' ? 'text-green-500' : 'text-gray-300'}`} />
                        {issue.status === 'IN PROGRESS' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <Play className="w-1.5 h-1.5 text-blue-600 fill-white" />
                            </div>
                          </div>
                        )}
                        {issue.status === 'COMPLETE' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-500 fill-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-700 capitalize">
                        {issue.status === 'PENDING' ? 'Open' : issue.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Flag className={`w-4 h-4 ${issue.priority === 'HIGH' ? 'text-[#e11d48] fill-[#e11d48]' : issue.priority === 'MEDIUM' ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-gray-400 fill-gray-400'}`} />
                      <span className="text-sm font-bold text-gray-700">
                        {issue.priority === 'HIGH' ? 'High' : issue.priority === 'MEDIUM' ? 'Medium' : issue.priority === 'LOW' ? 'Low' : 'None'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={(e) => e.stopPropagation()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Enhanced Feedback Tab
const FeedbackTab = ({ feedbacks, loadingFeedbacks }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredFeedbacks = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return feedbacks;
    return (feedbacks || []).filter((fb) => {
      const haystack = [
        fb.technicianName,
        fb.title,
        fb.evidence?.address,
        fb.evidence?.notes,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [feedbacks, searchQuery]);

  return (
  <div>
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Technician Feedback</h2>
          <p className="text-gray-600">Review completion reports and feedback from technicians</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback..."
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>
          <GradientButton color="green" className="px-6">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Feedback Overview
            </span>
          </GradientButton>
        </div>
      </div>
    </div>

    {loadingFeedbacks ? (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-green-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 animate-pulse">Loading feedback...</p>
      </div>
    ) : filteredFeedbacks.length === 0 ? (
      <GlassCard className="p-12 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Feedback Yet</h3>
        <p className="text-gray-600 mb-6">Wait for technicians to complete jobs and submit feedback</p>
        <GradientButton color="blue" className="px-8">
          Check Progress
        </GradientButton>
      </GlassCard>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeedbacks.map((fb, idx) => (
          <div key={fb._id || idx} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <GlassCard className="relative p-6 hover:scale-[1.02] transition-all duration-300">
              {/* Technician Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    {(fb.technicianName || 'T').charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Award className="w-3 h-3 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{fb.technicianName || 'Technician'}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Completed: {new Date(fb.completedAt || fb.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status="COMPLETED" />
              </div>

              {/* Issue Info */}
              <div className="mb-4">
                <h5 className="font-semibold text-gray-900 mb-2">Issue: {fb.title}</h5>
                <p className="text-gray-600 text-sm bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-xl border border-emerald-100">
                  {fb.evidence.address || 'No completion details provided.'}
                </p>
              </div>
              {/* After Image */}
              {getImageUrl(fb.evidence.afterImage) && (
                <div className="mb-4">
                  <div className="relative rounded-xl overflow-hidden shadow-lg group">
                    <img
                      src={getImageUrl(fb.evidence.afterImage)}
                      alt="After evidence"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-3 text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Click to view
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {fb.location}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-semibold text-gray-900">5.0</span>
                </div>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    )}
  </div>
  );
};

const UserManagementTab = ({ users = [], issues = [] }) => {
  const [search, setSearch] = useState('');
  const [actionKey, setActionKey] = useState('');

  const filteredUsers = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return (users || []).filter((user) => {
      const haystack = [
        user.name,
        user.email,
        user.phone,
        user.role,
        user.status,
        user.companyName,
        user.branchName,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [users, search]);

  const roleCounts = React.useMemo(() => {
    const counts = {};
    (users || []).forEach((user) => {
      const role = String(user.role || 'unknown').toLowerCase();
      counts[role] = (counts[role] || 0) + 1;
    });
    return counts;
  }, [users]);

  const getWorkload = (user) => {
    const userId = String(user._id || user.id || '');
    if (!userId) return 0;
    return (issues || []).filter((issue) => {
      const assigned = String(issue.assignedTo || issue.assignees?.[0]?.id || issue.assignees?.[0]?._id || '');
      return assigned === userId;
    }).length;
  };

  const handleUserEdit = async (user) => {
    const name = window.prompt('Update user name', user.name || '');
    if (name === null) return;
    const role = window.prompt('Update user role', user.role || '');
    if (role === null) return;
    const status = window.prompt('Update user status', user.status || 'active');
    if (status === null) return;

    try {
      setActionKey(`edit:${user._id || user.id}`);
      await api.patch(`/api/users/${user._id || user.id}`, {
        name: name.trim(),
        role: role.trim().toLowerCase(),
        status: status.trim().toLowerCase(),
      });
      window.location.reload();
    } catch (err) {
      alert('Failed to update user: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionKey('');
    }
  };

  const handleUserDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name || user.email || 'this user'}?`)) return;
    try {
      setActionKey(`delete:${user._id || user.id}`);
      await api.delete(`/api/users/${user._id || user.id}`);
      window.location.reload();
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionKey('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage platform users, roles, status, and company assignment from one place.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-72 rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'All Users', value: users.length, tone: 'from-blue-50 to-indigo-50 border-blue-100' },
          { label: 'Admins', value: (roleCounts.superadmin || 0) + (roleCounts.admin || 0) + (roleCounts.manager || 0), tone: 'from-violet-50 to-purple-50 border-violet-100' },
          { label: 'Technicians', value: roleCounts.technician || 0, tone: 'from-emerald-50 to-green-50 border-emerald-100' },
          { label: 'Clients & Requestors', value: (roleCounts.client || 0) + (roleCounts.requestor || 0), tone: 'from-amber-50 to-yellow-50 border-amber-100' },
        ].map((card) => (
          <div key={card.label} className={`rounded-2xl border bg-gradient-to-br ${card.tone} p-5 shadow-sm`}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">{card.label}</p>
            <p className="mt-3 text-3xl font-black text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/30 bg-white/90 p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-gray-100">
              <tr>
                {['User', 'Role', 'Company', 'Status', 'Phone', 'Assigned Work', 'Created', 'Actions'].map((header) => (
                  <th key={header} className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user._id || user.id || user.email || index} className="border-b border-gray-50 hover:bg-gray-50/70">
                  <td className="py-3 px-3">
                    <div>
                      <div className="font-semibold text-gray-900">{user.name || 'Unnamed User'}</div>
                      <div className="text-xs text-gray-500">{user.email || 'No email'}</div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {String(user.role || 'unknown').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-700">{user.companyName || 'No company'}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${String(user.status || '').toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {user.status || 'unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-600">{user.phone || '—'}</td>
                  <td className="py-3 px-3 text-sm font-semibold text-gray-900">{getWorkload(user)}</td>
                  <td className="py-3 px-3 text-sm text-gray-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUserEdit(user)}
                        disabled={actionKey === `edit:${user._id || user.id}`}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUserDelete(user)}
                        disabled={actionKey === `delete:${user._id || user.id}`}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-14 text-center text-sm text-gray-500">No users matched your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CompanyManagementTab = ({ users = [], issues = [], assets = [], locations = [] }) => {
  const [search, setSearch] = useState('');
  const [actionKey, setActionKey] = useState('');

  const companies = React.useMemo(() => {
    const map = new globalThis.Map();
    const ensure = (key) => {
      if (!map.has(key)) {
        map.set(key, {
          name: key,
          users: 0,
          activeUsers: 0,
          admins: 0,
          technicians: 0,
          requests: 0,
          assets: 0,
          locations: 0,
        });
      }
      return map.get(key);
    };

    (users || []).forEach((user) => {
      const company = String(user.companyName || 'Unassigned Company').trim() || 'Unassigned Company';
      const entry = ensure(company);
      entry.users += 1;
      if (String(user.status || '').toLowerCase() === 'active') entry.activeUsers += 1;
      if (['superadmin', 'admin', 'manager'].includes(String(user.role || '').toLowerCase())) entry.admins += 1;
      if (String(user.role || '').toLowerCase() === 'technician') entry.technicians += 1;
    });

    (issues || []).forEach((issue) => {
      const entry = ensure(String(issue.companyName || 'Unassigned Company').trim() || 'Unassigned Company');
      entry.requests += 1;
    });

    (assets || []).forEach((asset) => {
      const entry = ensure(String(asset.companyName || 'Unassigned Company').trim() || 'Unassigned Company');
      entry.assets += 1;
    });

    (locations || []).forEach((location) => {
      const entry = ensure(String(location.companyName || 'Unassigned Company').trim() || 'Unassigned Company');
      entry.locations += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.users - a.users || b.requests - a.requests);
  }, [users, issues, assets, locations]);

  const filteredCompanies = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return companies;
    return companies.filter((company) => {
      const haystack = [
        company.name,
        company.users,
        company.activeUsers,
        company.admins,
        company.technicians,
        company.requests,
        company.assets,
        company.locations,
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [companies, search]);

  const handleCompanyAction = async (action, companyName) => {
    try {
      setActionKey(`${action}:${companyName}`);
      let payload = { action, companyName };
      if (action === 'rename') {
        const nextCompanyName = window.prompt('Enter the new company name', companyName);
        if (!nextCompanyName || !nextCompanyName.trim() || nextCompanyName.trim() === companyName) {
          setActionKey('');
          return;
        }
        payload = { ...payload, nextCompanyName: nextCompanyName.trim() };
      }
      await api.patch('/api/users/company/manage', payload);
      window.location.reload();
    } catch (err) {
      alert('Failed to apply company action: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionKey('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Management</h2>
          <p className="text-sm text-gray-500 mt-1">View tenant companies and their platform footprint across users, issues, assets, and locations.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-72 rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Companies', value: companies.length, tone: 'from-blue-50 to-indigo-50 border-blue-100' },
          { label: 'Users', value: users.length, tone: 'from-emerald-50 to-green-50 border-emerald-100' },
          { label: 'Assets', value: assets.length, tone: 'from-amber-50 to-yellow-50 border-amber-100' },
          { label: 'Locations', value: locations.length, tone: 'from-violet-50 to-purple-50 border-violet-100' },
        ].map((card) => (
          <div key={card.label} className={`rounded-2xl border bg-gradient-to-br ${card.tone} p-5 shadow-sm`}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">{card.label}</p>
            <p className="mt-3 text-3xl font-black text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/30 bg-white/90 p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-gray-100">
              <tr>
                {['Company', 'Users', 'Active Users', 'Admins', 'Technicians', 'Requests', 'Assets', 'Locations', 'Actions'].map((header) => (
                  <th key={header} className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.name} className="border-b border-gray-50 hover:bg-gray-50/70">
                  <td className="py-3 px-3 font-semibold text-gray-900">{company.name}</td>
                  <td className="py-3 px-3 text-sm text-gray-700">{company.users}</td>
                  <td className="py-3 px-3 text-sm text-gray-700">{company.activeUsers}</td>
                  <td className="py-3 px-3 text-sm text-gray-700">{company.admins}</td>
                  <td className="py-3 px-3 text-sm text-gray-700">{company.technicians}</td>
                  <td className="py-3 px-3 text-sm font-semibold text-blue-700">{company.requests}</td>
                  <td className="py-3 px-3 text-sm text-gray-700">{company.assets}</td>
                  <td className="py-3 px-3 text-sm text-gray-700">{company.locations}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCompanyAction('rename', company.name)}
                        disabled={actionKey === `rename:${company.name}`}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => handleCompanyAction('suspend', company.name)}
                        disabled={actionKey === `suspend:${company.name}`}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => handleCompanyAction('activate', company.name)}
                        disabled={actionKey === `activate:${company.name}`}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                      >
                        Activate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-14 text-center text-sm text-gray-500">No companies matched your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SystemSettingsTab = () => {
  const [settings, setSettings] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSummary, setAuditSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [securityActionKey, setSecurityActionKey] = useState('');
  const [manualBlockedIp, setManualBlockedIp] = useState('');
  const [manualLockedEmail, setManualLockedEmail] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [settingsRes, logsRes] = await Promise.all([
        api.get('/api/system-settings'),
        api.get('/api/audit-logs?limit=80'),
      ]);
      setSettings(settingsRes.data?.data || null);
      setAuditLogs(logsRes.data?.data || []);
      setAuditSummary(logsRes.data?.summary || null);
    } catch (err) {
      console.error('Failed to load system settings', err);
      alert('Failed to load system settings: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updatePricingValue = (plan, cycle, value) => {
    setSettings((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [plan]: {
          ...prev.pricing?.[plan],
          [cycle]: value,
        },
      },
    }));
  };

  const updateSecurityValue = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value,
      },
    }));
  };

  const updatePlatformValue = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      platform: {
        ...prev.platform,
        [key]: value,
      },
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const payload = {
        pricing: settings?.pricing || {},
        security: settings?.security || {},
        platform: settings?.platform || {},
      };
      const res = await api.put('/api/system-settings', payload);
      setSettings(res.data?.data || settings);
      await loadSettings();
    } catch (err) {
      console.error('Failed to save system settings', err);
      alert('Failed to save system settings: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const quickToggleMaintenanceMode = async () => {
    const nextSettings = {
      ...(settings || {}),
      platform: {
        ...(settings?.platform || {}),
        maintenanceMode: !Boolean(settings?.platform?.maintenanceMode),
      },
    };

    setSettings(nextSettings);

    try {
      setSaving(true);
      const payload = {
        pricing: nextSettings?.pricing || {},
        security: nextSettings?.security || {},
        platform: nextSettings?.platform || {},
      };
      const res = await api.put('/api/system-settings', payload);
      setSettings(res.data?.data || nextSettings);
      await loadSettings();
    } catch (err) {
      console.error('Failed to toggle maintenance mode', err);
      alert('Failed to toggle maintenance mode: ' + (err.response?.data?.error || err.message));
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const filteredAuditLogs = React.useMemo(() => {
    const query = auditSearch.trim().toLowerCase();
    if (!query) return auditLogs;
    return (auditLogs || []).filter((log) => {
      const metadataString = (() => {
        try {
          return JSON.stringify(log.metadata || {});
        } catch (error) {
          return '';
        }
      })();
      const haystack = [
        log.actorName,
        log.actorEmail,
        log.actorRole,
        log.action,
        log.entityType,
        log.entityId,
        log.path,
        log.companyName,
        log.ipAddress,
        log.userAgent,
        log.severity,
        log.statusCode,
        log.success ? 'success' : 'failed',
        metadataString,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [auditLogs, auditSearch]);

  const suspiciousAlerts = React.useMemo(() => {
    return (auditLogs || [])
      .filter((log) => log.action === 'security.failed_login_threshold_triggered')
      .slice(0, 6);
  }, [auditLogs]);

  const applySecuritySearch = (value) => {
    setAuditSearch(value);
    const auditSection = document.getElementById('superadmin-audit-trail');
    auditSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const applySecurityAction = async ({ actionType, email, ipAddress }) => {
    try {
      setSecurityActionKey(`${actionType}:${email || ipAddress || 'unknown'}`);
      await api.post('/api/audit-logs/security-action', {
        actionType,
        email,
        ipAddress,
      });
      if (actionType === 'block_ip' || actionType === 'unblock_ip') setManualBlockedIp('');
      if (actionType === 'lock_account' || actionType === 'unlock_account') setManualLockedEmail('');
      await loadSettings();
    } catch (err) {
      console.error('Failed to apply security action', err);
      alert('Failed to apply security action: ' + (err.response?.data?.error || err.message));
    } finally {
      setSecurityActionKey('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-500">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Superadmin controls for pricing, security, platform behavior, and system monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadSettings} className="px-4 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Refresh</button>
          <button onClick={saveSettings} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Audit Events', value: auditSummary?.totalEvents ?? 0, icon: Activity },
          { label: 'Failed Logins (24h)', value: auditSummary?.failedLogins24h ?? 0, icon: Shield },
          { label: 'Successful Logins (24h)', value: auditSummary?.successfulLogins24h ?? 0, icon: Users },
          { label: 'Sensitive Changes (24h)', value: auditSummary?.sensitiveChanges24h ?? 0, icon: AlertCircle },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/30 bg-white/70 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-gray-900">{item.value}</p>
              </div>
              <item.icon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/30 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Subscription Pricing</h3>
                <p className="text-sm text-gray-500">Manage plan pricing and subscription currency for the entire platform.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Currency:</span>
              <select value={settings?.platform?.subscriptionCurrency ?? 'USD'} onChange={(e) => updatePlatformValue('subscriptionCurrency', e.target.value)} className="bg-white border border-blue-200 rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="USD">USD ($)</option>
                <option value="RWF">RWF (FRw)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
          <div className="space-y-5">
            {['basic', 'professional', 'enterprise', 'premium'].map((plan) => (
              <div key={plan} className={`rounded-xl border p-4 ${plan === 'premium' ? 'border-purple-200 bg-purple-50/50' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold uppercase tracking-wide text-gray-700">{plan}</div>
                  {plan === 'premium' && (
                    <span className="inline-flex rounded-full bg-purple-200 px-2.5 py-0.5 text-xs font-bold text-purple-700">Admin Quote</span>
                  )}
                </div>
                {plan === 'premium' ? (
                  <div className="rounded-lg bg-white border border-purple-200 p-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Premium plans are custom-quoted by the system administrator based on specific business requirements.
                    </p>
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-gray-500">Admin will quote on:</div>
                      <ul className="text-xs text-gray-600 space-y-1 ml-3">
                        <li>• Custom features and integrations</li>
                        <li>• Volume and usage requirements</li>
                        <li>• Support level and SLA</li>
                        <li>• Billing cycle preference</li>
                      </ul>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-purple-100 border border-purple-200">
                      <p className="text-xs text-purple-700 font-semibold">
                        💡 Tip: Clients requesting Premium will trigger a quote request notification to you.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {['weekly', 'monthly', 'yearly'].map((cycle) => (
                      <label key={cycle} className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-gray-500 capitalize">{cycle}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={settings?.pricing?.[plan]?.[cycle] ?? 0}
                          onChange={(e) => updatePricingValue(plan, cycle, Number(e.target.value) || 0)}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/30 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Shield className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Security Controls</h3>
              <p className="text-sm text-gray-500">Monitoring and hardening settings for the platform.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500">Max Login Attempts</span>
              <input type="number" min="1" value={settings?.security?.maxLoginAttempts ?? 5} onChange={(e) => updateSecurityValue('maxLoginAttempts', Number(e.target.value) || 1)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500">Lockout Minutes</span>
              <input type="number" min="1" value={settings?.security?.lockoutMinutes ?? 15} onChange={(e) => updateSecurityValue('lockoutMinutes', Number(e.target.value) || 1)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500">Session Timeout Hours</span>
              <input type="number" min="1" value={settings?.security?.sessionTimeoutHours ?? 24} onChange={(e) => updateSecurityValue('sessionTimeoutHours', Number(e.target.value) || 1)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500">Password Min Length</span>
              <input type="number" min="6" value={settings?.security?.passwordMinLength ?? 8} onChange={(e) => updateSecurityValue('passwordMinLength', Number(e.target.value) || 8)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
              <span className="text-sm font-semibold text-gray-700">Audit Logging</span>
              <input type="checkbox" checked={Boolean(settings?.security?.auditLoggingEnabled)} onChange={(e) => updateSecurityValue('auditLoggingEnabled', e.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
              <span className="text-sm font-semibold text-gray-700">Notify on Failed Login</span>
              <input type="checkbox" checked={Boolean(settings?.security?.notifyOnFailedLogin)} onChange={(e) => updateSecurityValue('notifyOnFailedLogin', e.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
              <span className="text-sm font-semibold text-gray-700">Enforce MFA</span>
              <input type="checkbox" checked={Boolean(settings?.security?.enforceMfa)} onChange={(e) => updateSecurityValue('enforceMfa', e.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
              <span className="text-sm font-semibold text-gray-700">Allow Public Registration</span>
              <input type="checkbox" checked={Boolean(settings?.security?.allowPublicRegistration)} onChange={(e) => updateSecurityValue('allowPublicRegistration', e.target.checked)} />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">Security Response Center</h3>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                settings?.platform?.maintenanceMode
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {settings?.platform?.maintenanceMode ? 'Maintenance is ON' : 'Maintenance is OFF'}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Use these controls when you suspect attackers or want to monitor abnormal login activity quickly.
            </p>
            <p className="mt-2 text-sm font-medium text-gray-700">
              {settings?.platform?.maintenanceMode
                ? 'Normal users are currently blocked from logging in. Only superadmin can still access the system.'
                : 'Normal users can log in normally right now.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={quickToggleMaintenanceMode}
              disabled={saving}
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                settings?.platform?.maintenanceMode
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-rose-600 text-white hover:bg-rose-700'
              } disabled:opacity-60`}
            >
              {settings?.platform?.maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
            </button>
            <button
              onClick={() => applySecuritySearch('security.failed_login_threshold_triggered')}
              className="px-4 py-2 rounded-xl border border-amber-200 bg-white text-sm font-semibold text-amber-700 hover:bg-amber-100"
            >
              Review Security Alerts
            </button>
            <button
              onClick={() => applySecuritySearch('auth.login_failed')}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Review Failed Logins
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/70 bg-white/80 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Recommended Response</p>
            <div className="mt-3 space-y-3 text-sm text-gray-700">
              <p>1. Review the latest failed-login alerts below and verify the account email and source IP.</p>
              <p>2. If the pattern looks hostile, turn on maintenance mode and save settings to notify the whole system.</p>
              <p>3. Keep audit logging enabled so every suspicious action is recorded for follow-up.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Recent Security Alerts</p>
                <p className="mt-1 text-sm text-gray-500">Triggered after 3 consecutive failed logins.</p>
              </div>
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                {suspiciousAlerts.length} recent
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {suspiciousAlerts.length ? suspiciousAlerts.map((log, index) => (
                <div key={log._id || index} className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-gray-900">{log.metadata?.attemptedEmail || log.actorEmail || 'Unknown account'}</div>
                    <div className="text-xs text-gray-500">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</div>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {log.metadata?.threshold || 3} failed attempts {log.ipAddress ? `from ${log.ipAddress}` : 'from an unknown IP'}.
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => applySecuritySearch(log.metadata?.attemptedEmail || log.actorEmail || 'security.failed_login_threshold_triggered')}
                      className="text-sm font-semibold text-amber-700 hover:text-amber-800"
                    >
                      Investigate this alert
                    </button>
                    {log.ipAddress && (
                      <button
                        onClick={() => applySecurityAction({ actionType: 'block_ip', ipAddress: log.ipAddress })}
                        disabled={securityActionKey === `block_ip:${log.ipAddress}`}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                      >
                        {securityActionKey === `block_ip:${log.ipAddress}` ? 'Blocking IP...' : 'Block IP'}
                      </button>
                    )}
                    {(log.metadata?.attemptedEmail || log.actorEmail) && (
                      <button
                        onClick={() => applySecurityAction({ actionType: 'lock_account', email: log.metadata?.attemptedEmail || log.actorEmail })}
                        disabled={securityActionKey === `lock_account:${log.metadata?.attemptedEmail || log.actorEmail}`}
                        className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                      >
                        {securityActionKey === `lock_account:${log.metadata?.attemptedEmail || log.actorEmail}` ? 'Locking...' : 'Lock Account'}
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-amber-200 bg-white/80 px-4 py-6 text-sm text-gray-500">
                  No suspicious failed-login threshold alerts yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/70 bg-white/85 p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Security Actions</p>
              <p className="mt-1 text-sm text-gray-500">Always-available controls for blocking IPs, locking accounts, and reversing those actions.</p>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              Support contact: {settings?.platform?.supportEmail || 'Not configured'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
              <p className="text-sm font-bold text-gray-900">IP Address Control</p>
              <p className="mt-1 text-sm text-gray-500">Manually block or unblock a source IP.</p>
              <div className="mt-3 space-y-3">
                <input
                  value={manualBlockedIp}
                  onChange={(e) => setManualBlockedIp(e.target.value)}
                  placeholder="Enter IP address"
                  className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applySecurityAction({ actionType: 'block_ip', ipAddress: manualBlockedIp.trim() })}
                    disabled={!manualBlockedIp.trim() || securityActionKey === `block_ip:${manualBlockedIp.trim()}`}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                  >
                    Block IP
                  </button>
                  <button
                    onClick={() => applySecurityAction({ actionType: 'unblock_ip', ipAddress: manualBlockedIp.trim() })}
                    disabled={!manualBlockedIp.trim() || securityActionKey === `unblock_ip:${manualBlockedIp.trim()}`}
                    className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                  >
                    Unblock IP
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-sm font-bold text-gray-900">Local Account Control</p>
              <p className="mt-1 text-sm text-gray-500">Lock a user account during suspicious activity, or unlock it after review.</p>
              <div className="mt-3 space-y-3">
                <input
                  value={manualLockedEmail}
                  onChange={(e) => setManualLockedEmail(e.target.value)}
                  placeholder="Enter account email"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-100"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applySecurityAction({ actionType: 'lock_account', email: manualLockedEmail.trim() })}
                    disabled={!manualLockedEmail.trim() || securityActionKey === `lock_account:${manualLockedEmail.trim()}`}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    Lock Account
                  </button>
                  <button
                    onClick={() => applySecurityAction({ actionType: 'unlock_account', email: manualLockedEmail.trim() })}
                    disabled={!manualLockedEmail.trim() || securityActionKey === `unlock_account:${manualLockedEmail.trim()}`}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    Unlock Account
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Locked users are shown a support message on login so they know how to get help.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/30 bg-white/80 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <Settings className="w-5 h-5 text-violet-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Platform Settings</h3>
            <p className="text-sm text-gray-500">Global system details visible to the whole platform.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500">App Name</span>
            <input value={settings?.platform?.appName || ''} onChange={(e) => updatePlatformValue('appName', e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500">Support Email</span>
            <input value={settings?.platform?.supportEmail || ''} onChange={(e) => updatePlatformValue('supportEmail', e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-gray-700">Maintenance Mode Enabled</span>
            <input type="checkbox" checked={Boolean(settings?.platform?.maintenanceMode)} onChange={(e) => updatePlatformValue('maintenanceMode', e.target.checked)} />
          </label>
        </div>
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">Blocked IP Addresses</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(settings?.security?.blockedIpAddresses || []).length ? (settings?.security?.blockedIpAddresses || []).map((ip) => (
                <button
                  key={ip}
                  onClick={() => applySecurityAction({ actionType: 'unblock_ip', ipAddress: ip })}
                  disabled={securityActionKey === `unblock_ip:${ip}`}
                  className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                >
                  {securityActionKey === `unblock_ip:${ip}` ? `Unblocking ${ip}...` : `${ip} - Unblock`}
                </button>
              )) : <span className="text-sm text-gray-500">No blocked IP addresses.</span>}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">Locked Accounts</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(settings?.security?.blockedAccountEmails || []).length ? (settings?.security?.blockedAccountEmails || []).map((entry) => (
                <button
                  key={entry}
                  onClick={() => applySecurityAction({ actionType: 'unlock_account', email: entry })}
                  disabled={securityActionKey === `unlock_account:${entry}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                  {securityActionKey === `unlock_account:${entry}` ? `Unlocking ${entry}...` : `${entry} - Unlock`}
                </button>
              )) : <span className="text-sm text-gray-500">No locked local accounts.</span>}
            </div>
          </div>
        </div>
      </div>

      <SubscriptionManagementSection settings={settings} updatePlatformValue={updatePlatformValue} />

      <div id="superadmin-audit-trail" className="rounded-2xl border border-white/30 bg-white/80 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Audit Trail</h3>
            <p className="text-sm text-gray-500">Recent activity across logins and system actions.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Search audit logs..."
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">When</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">Actor</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">Action</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">Target</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">IP</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">Respond</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuditLogs.map((log, idx) => (
                <tr key={log._id || idx} className="border-b border-gray-50">
                  <td className="py-3 px-3 text-sm text-gray-600">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</td>
                  <td className="py-3 px-3 text-sm text-gray-700">
                    <div className="font-semibold">{log.actorName || log.actorEmail || 'System'}</div>
                    <div className="text-xs text-gray-500">{log.actorRole || '-'}</div>
                  </td>
                  <td className="py-3 px-3 text-sm font-semibold text-gray-900">{log.action}</td>
                  <td className="py-3 px-3 text-sm text-gray-600">{log.entityType}{log.entityId ? ` / ${log.entityId}` : ''}</td>
                  <td className="py-3 px-3 text-sm">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${log.success ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {log.statusCode || (log.success ? 'OK' : 'ERROR')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-500">{log.ipAddress || '-'}</td>
                  <td className="py-3 px-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      {log.ipAddress && (
                        <button
                          onClick={() => applySecurityAction({ actionType: 'block_ip', ipAddress: log.ipAddress })}
                          disabled={securityActionKey === `block_ip:${log.ipAddress}`}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                        >
                          Block IP
                        </button>
                      )}
                      {(log.metadata?.attemptedEmail || log.actorEmail) && (
                        <button
                          onClick={() => applySecurityAction({ actionType: 'lock_account', email: log.metadata?.attemptedEmail || log.actorEmail })}
                          disabled={securityActionKey === `lock_account:${log.metadata?.attemptedEmail || log.actorEmail}`}
                          className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                        >
                          Lock Account
                        </button>
                      )}
                      {!log.ipAddress && !(log.metadata?.attemptedEmail || log.actorEmail) && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAuditLogs.length === 0 && (
                <tr><td colSpan="7" className="py-12 text-center text-sm text-gray-500">No audit events found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DetailsModal = ({ open, type, item, onClose, getAssignedTechName, onRefresh, technicians = [], teams = [], onPrivateMessage }) => {
  const [formData, setFormData] = useState({
    category: item?.category || '',
    priority: item?.priority || 'MEDIUM',
    location: item?.location || item?.address || '',
    assetName: item?.assetName || '',
    assignedTo: item?.assignedTo || '',
    team: item?.team || '',
    estimatedTime: item?.estimatedTime || '',
    frequency: item?.frequency || item?.interval || '',
    fixDeadline: item?.fixDeadline ? new Date(item.fixDeadline).toISOString().split('T')[0] : '',
    checklist: Array.isArray(item?.checklist) ? item.checklist : (item?.checklist ? [item.checklist] : []),
    chat: Array.isArray(item?.chat) ? item.chat : []
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [chatInput, setChatInput] = useState('');
  const [mentionCandidates, setMentionCandidates] = useState([]);
  const [mentionContext, setMentionContext] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || user.username || 'Manager';
  const userRole = String(user.role || user.userRole || user.type || user.accountType || '').toLowerCase();
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';

  useEffect(() => {
    if (item) {
      setFormData({
        category: item.category || '',
        priority: item.priority || 'MEDIUM',
        location: item.location || item.address || '',
        assetName: item.assetName || '',
        assignedTo: item.assignedTo || '',
        team: item.team || '',
        estimatedTime: item.estimatedTime || '',
        frequency: item.frequency || item.interval || '',
        fixDeadline: item.fixDeadline ? new Date(item.fixDeadline).toISOString().split('T')[0] : '',
        checklist: Array.isArray(item.checklist) ? item.checklist : [],
        chat: Array.isArray(item.chat) ? item.chat : []
      });
      setActiveTab('overview');
    }
  }, [item]);

  if (!open || !item) return null;

  const isMaterial = type === 'material';
  const isRequest = type === 'request';
  const isIssue = type === 'issue';

  const title = isMaterial ? 'Material Request Details' : isRequest ? 'Request Details' : 'Work Order Details';
  const location = formData.location || item.locationName || item.propertyName || item.assetLocation || 'Not specified';
  const dueDate = item.fixDeadline || item.dueDate || item.nextDate || item.scheduledFor || null;
  const createdAt = item.createdAt || item.date || item.nextDate || null;
  const status = item.status || (item.approved ? 'APPROVED' : 'PENDING') || '—';
  const description = item.description || item.details || 'No description provided.';
  const assignee = isIssue ? (getAssignedTechName ? getAssignedTechName(item) : item.assignedTo) : (item.technicianName || item.assignedTo || 'Unassigned');
  const workOrderRef = item.workOrderId || item.workOrder || item.workOrderNumber || item.workOrderNo || item.workOrderCode || item.workOrderRef || '';
  const frequencyValue = formData.frequency || item.frequency || item.interval || '';
  const normalizedStatus = String(status || '').toLowerCase();
  const isInProgress = normalizedStatus.includes('in progress') || normalizedStatus === 'in_progress' || normalizedStatus === 'inprogress' || normalizedStatus === 'started' || normalizedStatus === 'working';
  const isCompleted = normalizedStatus.includes('complete') || normalizedStatus === 'completed' || normalizedStatus === 'complete';
  const isApproved = isRequest && (item.approved || normalizedStatus === 'approved' || !!workOrderRef);
  const canEdit = !isRequest || (isManagerOrAdmin && !isInProgress && !isCompleted);
  const isRequestReadOnly = isRequest && !canEdit;
  const requestLockClass = isRequestReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : '';
  const requestFieldClass = `w-full border border-gray-300 rounded-lg p-2.5 text-sm ${requestLockClass}`;
  const privateRecipientId = item?.assignedTo || item?.userId || item?.requestorId || '';
  const privateRecipientName = getAssignedTechName ? getAssignedTechName(item) : (item?.name || item?.email || 'User');
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
  const tasks = Array.isArray(item?.tasks) ? item.tasks : Array.isArray(item?.taskList) ? item.taskList : Array.isArray(formData.checklist) ? formData.checklist : [];
  const hasStructuredTasks = (Array.isArray(item?.tasks) && item.tasks.length > 0) || (Array.isArray(item?.taskList) && item.taskList.length > 0);
  const laborEntries = Array.isArray(item?.labor) ? item.labor : Array.isArray(item?.laborEntries) ? item.laborEntries : [];
  const partsItems = Array.isArray(item?.parts) ? item.parts : Array.isArray(item?.materials) ? item.materials : Array.isArray(item?.items) ? item.items : [];
  const fileItems = Array.isArray(item?.files) ? item.files : Array.isArray(item?.attachments) ? item.attachments : [];
  const activityItems = Array.isArray(item?.activity) ? item.activity : Array.isArray(item?.history) ? item.history : Array.isArray(item?.logs) ? item.logs : [];
  const linkItems = Array.isArray(item?.links) ? item.links : Array.isArray(item?.urlLinks) ? item.urlLinks : [];
  const provider = item?.provider || item?.vendor || item?.contractor || {};
  const estimatedHours = Number(formData.estimatedTime || item.estimatedTime || item.laborHours || 0) || 0;

  const toNumber = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const num = Number(String(val).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(num) ? num : 0;
  };
  const moneyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const formatMoney = (val) => moneyFormatter.format(Number.isFinite(val) ? val : 0);
  const laborCost = toNumber(item?.laborCost ?? item?.laborTotal ?? item?.labor?.total ?? item?.labor?.cost);
  const partsCost = toNumber(item?.partsCost ?? item?.materialsCost ?? item?.totalPartsCost ?? item?.parts?.total ?? item?.itemsCost);
  const otherCost = toNumber(item?.otherCost ?? item?.miscCost ?? item?.additionalCost);
  const totalCost = toNumber(item?.totalCost ?? item?.cost ?? laborCost + partsCost + otherCost);

  const formatDateTime = (val) => {
    if (!val) return 'Not set';
    try { return normalizeDate(val).toLocaleString(); } catch (e) { return 'Not set'; }
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
      await api.put(`/api/issues/${item.id || item._id}`, { ...formData, status: 'APPROVED', approved: true });
      alert('Request approved.');
      if (onRefresh) onRefresh();
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
      onClose();
    } catch (err) {
      console.error('Failed to decline issue:', err);
      alert('Failed to decline request.');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMessage = {
      sender: userName,
      text: chatInput,
      timestamp: new Date().toISOString(),
      role: 'manager'
    };
    const updatedChat = [...formData.chat, newMessage];
    try {
      await api.put(`/api/issues/${item.id || item._id}`, { chat: updatedChat });
      setFormData(prev => ({ ...prev, chat: updatedChat }));
      setChatInput('');
      setMentionCandidates([]);
      setMentionContext(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message.');
    }
  };

  const updateMentionSuggestions = (value, cursorPosition) => {
    const context = getMentionContext(value, cursorPosition);
    setMentionContext(context);
    if (!context) {
      setMentionCandidates([]);
      return;
    }
    const currentUserId = String(user?.id || user?._id || '');
    const filtered = (technicians || [])
      .filter((person) => {
        const id = String(person?._id || person?.id || '');
        if (!id || id === currentUserId) return false;
        const haystack = `${person?.name || ''} ${person?.email || ''} ${buildMentionHandle(person)}`.toLowerCase();
        return !context.query || haystack.includes(context.query);
      })
      .slice(0, 6);
    setMentionCandidates(filtered);
  };

  const handleChatInputChange = (e) => {
    const value = e.target.value;
    setChatInput(value);
    updateMentionSuggestions(value, e.target.selectionStart);
  };

  const insertMention = (person) => {
    const nextValue = applyMentionToText(chatInput, mentionContext, person);
    setChatInput(nextValue);
    setMentionCandidates([]);
    setMentionContext(null);
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">Details and Approval Settings</p>
            </div>
            <div className="flex items-center gap-2">
              {!!privateRecipientId && (
                <button
                  type="button"
                  onClick={() => onPrivateMessage && onPrivateMessage({
                    recipientUserId: privateRecipientId,
                    recipientName: privateRecipientName,
                    link: `/manager-dashboard?tab=issues&id=${item.id || item._id}`
                  })}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  <Send className="w-4 h-4" />
                  Private Message
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors md:hidden">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {showTabs && (
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
            )}

            {activeTabId === 'overview' && (
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
                      <option value="upgrate">Upgrade</option>
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
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">First Responsible (Assignee)</label>
                    <select
                      className={requestFieldClass}
                      value={formData.assignedTo}
                      onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                      disabled={isRequestReadOnly}
                    >
                      <option value="">Unassigned</option>
                      {technicians.map(t => (
                        <option key={t._id || t.id} value={t._id || t.id}>{t.name}</option>
                      ))}
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
                            <div className="text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded">Qty: {it.quantity ?? it.qty ?? '—'}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-gray-500">No items attached.</div>
                      )}
                    </div>
                  </div>
                )}
              </>
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
                            const taskAssignee = typeof task === 'string' ? '—' : (task.assignedTo || task.assignee || task.owner || '—');
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
                                <td className="px-4 py-3">{taskDue ? formatDateTime(taskDue) : '—'}</td>
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
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Labor</h4>
                    <p className="text-xs text-gray-500">Track time and labor allocation.</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                    {estimatedHours} hrs est.
                  </span>
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

                {laborEntries.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                    No labor entries yet.
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/70">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="text-left px-4 py-3">Technician</th>
                          <th className="text-left px-4 py-3">Hours</th>
                          <th className="text-left px-4 py-3">Rate</th>
                          <th className="text-left px-4 py-3">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {laborEntries.map((entry, idx) => {
                          const techName = entry.name || entry.technician || entry.assignee || `Tech ${idx + 1}`;
                          const hours = entry.hours ?? entry.time ?? entry.duration ?? '—';
                          const rate = entry.rate ?? entry.hourlyRate ?? '';
                          const cost = entry.cost ?? (toNumber(rate) * toNumber(hours));
                          return (
                            <tr key={idx} className="text-gray-700">
                              <td className="px-4 py-3">{techName}</td>
                              <td className="px-4 py-3">{hours}</td>
                              <td className="px-4 py-3">{rate ? formatMoney(toNumber(rate)) : '—'}</td>
                              <td className="px-4 py-3">{cost ? formatMoney(toNumber(cost)) : '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTabId === 'parts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Parts</h4>
                    <p className="text-xs text-gray-500">Materials and parts used.</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                    {partsItems.length} items
                  </span>
                </div>

                {partsItems.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                    No parts recorded yet.
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/70">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="text-left px-4 py-3">Part</th>
                          <th className="text-left px-4 py-3">Qty</th>
                          <th className="text-left px-4 py-3">Unit Cost</th>
                          <th className="text-left px-4 py-3">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {partsItems.map((part, idx) => {
                          const name = typeof part === 'string' ? part : (part.name || part.title || part.materialId || `Part ${idx + 1}`);
                          const qty = typeof part === 'string' ? '—' : (part.quantity ?? part.qty ?? 1);
                          const unit = typeof part === 'string' ? '' : (part.unitCost ?? part.cost ?? part.price ?? '');
                          const total = unit ? toNumber(unit) * toNumber(qty) : '';
                          return (
                            <tr key={idx} className="text-gray-700">
                              <td className="px-4 py-3">{name}</td>
                              <td className="px-4 py-3">{qty}</td>
                              <td className="px-4 py-3">{unit ? formatMoney(toNumber(unit)) : '—'}</td>
                              <td className="px-4 py-3">{total ? formatMoney(toNumber(total)) : '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTabId === 'costs' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Costs</h4>
                  <p className="text-xs text-gray-500">Summary of labor and materials cost.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-gray-200 bg-white/70">
                    <div className="text-xs text-gray-500">Labor</div>
                    <div className="text-lg font-bold text-gray-900 mt-1">{formatMoney(laborCost)}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-white/70">
                    <div className="text-xs text-gray-500">Parts</div>
                    <div className="text-lg font-bold text-gray-900 mt-1">{formatMoney(partsCost)}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-white/70">
                    <div className="text-xs text-gray-500">Other</div>
                    <div className="text-lg font-bold text-gray-900 mt-1">{formatMoney(otherCost)}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                    <div className="text-xs text-blue-700">Total</div>
                    <div className="text-lg font-bold text-blue-900 mt-1">{formatMoney(totalCost)}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTabId === 'files' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Files</h4>
                  <p className="text-xs text-gray-500">Attachments and evidence files.</p>
                </div>

                {fileItems.length === 0 && !(item.beforePhoto || item.photo || item.image || item.beforeImage || item.afterImage || item.afterPhoto) ? (
                  <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                    No files uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      item.beforePhoto && { label: 'Before Photo', url: item.beforePhoto },
                      item.afterPhoto && { label: 'After Photo', url: item.afterPhoto },
                      item.beforeImage && { label: 'Before Image', url: item.beforeImage },
                      item.afterImage && { label: 'After Image', url: item.afterImage },
                      item.photo && { label: 'Photo', url: item.photo },
                      item.image && { label: 'Image', url: item.image }
                    ].filter(Boolean).map((f, idx) => (
                      <div key={`core-${idx}`} className="border border-gray-200 rounded-xl overflow-hidden bg-white/70">
                        <div className="text-xs font-semibold text-gray-600 px-3 py-2 border-b border-gray-100">{f.label}</div>
                        <img src={getImageUrl(f.url)} alt={f.label} className="w-full h-36 object-cover" />
                      </div>
                    ))}
                    {fileItems.map((f, idx) => {
                      const name = typeof f === 'string' ? f : (f.name || f.title || f.filename || `File ${idx + 1}`);
                      const url = typeof f === 'string' ? '' : (f.url || f.link || f.path || '');
                      return (
                        <div key={`file-${idx}`} className="border border-gray-200 rounded-xl p-4 bg-white/70 flex items-center justify-between">
                          <div className="text-sm font-semibold text-gray-800">{name}</div>
                          {url ? (
                            <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-semibold">Open</a>
                          ) : (
                            <span className="text-xs text-gray-400">No link</span>
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

                {activityItems.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                    No activity recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activityItems.map((act, idx) => {
                      const label = typeof act === 'string' ? act : (act.title || act.type || act.action || 'Update');
                      const detail = typeof act === 'string' ? '' : (act.description || act.note || act.details || '');
                      const when = typeof act === 'string' ? '' : (act.timestamp || act.date || act.createdAt || '');
                      return (
                        <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-white/70">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-gray-800">{label}</div>
                            <div className="text-xs text-gray-500">{when ? formatDateTime(when) : '—'}</div>
                          </div>
                          {detail && <p className="text-xs text-gray-600 mt-2">{detail}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTabId === 'links' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Links</h4>
                  <p className="text-xs text-gray-500">Related resources and reference URLs.</p>
                </div>

                {linkItems.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                    No links added yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {linkItems.map((link, idx) => {
                      const title = typeof link === 'string' ? link : (link.title || link.label || link.name || `Link ${idx + 1}`);
                      const url = typeof link === 'string' ? link : (link.url || link.href || link.link || '');
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white/70">
                          <div className="text-sm font-semibold text-gray-800">{title}</div>
                          {url ? (
                            <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-semibold">Open</a>
                          ) : (
                            <span className="text-xs text-gray-400">No URL</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTabId === 'provider' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Provider Portal</h4>
                  <p className="text-xs text-gray-500">External provider details and handoff info.</p>
                </div>

                {!provider || Object.keys(provider).length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 bg-white/60">
                    No provider linked yet.
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
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
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
                  className="px-5 py-2.5 bg-green-600 border border-transparent text-blue-600 rounded-xl text-sm font-bold shadow-sm hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Approve
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Chat Panel */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-gray-50 border-l border-gray-200 flex-shrink-0">
          <div className="px-4 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Comments</h4>
              <p className="mt-1 text-[11px] text-gray-500">Shared work-order discussion for the team.</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hidden md:block">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Conversation</div>
              <div className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
                {formData.chat.length} comments
              </div>
            </div>
            {formData.chat.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
                <div className="text-sm font-semibold text-gray-700">No comments yet</div>
                <div className="mt-1 text-xs text-gray-500">Post the first update for this work order, or mention someone with @.</div>
              </div>
            ) : (
              formData.chat.map((msg, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${String(msg.sender || msg.user || '').trim() === userName ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      {String(msg.sender || msg.user || 'U').trim().split(' ').map(part => part?.[0] || '').join('').slice(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-bold text-gray-900">{msg.sender || msg.user || 'Unknown'}</span>
                        {msg.role && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            {String(msg.role).replace(/_/g, ' ')}
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400">
                          {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 bg-white p-3">
            <div className="rounded-2xl border border-gray-200 bg-slate-50/80 p-4 shadow-sm">
              <div className="mb-3">
                <div className="text-sm font-bold text-gray-900">Add a public comment</div>
                <div className="text-xs text-gray-500">Everyone on this work order can see this message.</div>
              </div>
            <div className="relative">
              {mentionCandidates.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl z-20">
                  {mentionCandidates.map((person) => (
                    <button
                      key={person._id || person.id}
                      type="button"
                      onClick={() => insertMention(person)}
                      className="w-full border-b border-gray-100 px-3 py-2 text-left hover:bg-gray-50 last:border-b-0"
                    >
                      <div className="text-sm font-semibold text-gray-900">{person.name}</div>
                      <div className="text-xs text-gray-500">@{buildMentionHandle(person)}{person.email ? ` • ${person.email}` : ''}</div>
                    </button>
                  ))}
                </div>
              )}
            <div className="flex items-end gap-2 rounded-2xl border border-white bg-white px-3 py-3 ring-1 ring-slate-100">
              <textarea
                className="min-h-[88px] flex-1 resize-none bg-transparent border-none text-sm text-gray-800 focus:outline-none"
                placeholder="Share an update, add context, or mention a teammate with @..."
                value={chatInput}
                onChange={handleChatInputChange}
              />
              <button
                onClick={handleSendMessage}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Post
              </button>
            </div>
            </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const AIInsights = ({ aiSentiment, loadingAI, aiError, aiRecommendations, aiSummary, loadingRecs, loadingSummary, recsError, summaryError, exportToPDF, exportToExcel }) => {
  if (loadingAI || loadingRecs || loadingSummary) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="p-8 bg-white/50 rounded-2xl animate-pulse text-center border border-gray-100">Analysing sentiment trends...</div>
      <div className="p-8 bg-white/50 rounded-2xl animate-pulse text-center border border-gray-100">Generating proactive recommendations...</div>
    </div>
  );

  const topPropertiesData = (aiSummary?.topProperties || []).map((entry) => ({
    name: entry.property,
    incidents: entry.incidentCount
  }));
  const recurringIssuesData = (aiSummary?.recurringIssues || []).map((entry) => ({
    name: `${entry.category} @ ${entry.property}`,
    count: entry.count
  }));
  const technicianSpeedData = (aiSummary?.technicianPerformance || []).map((entry) => ({
    name: entry.technicianName,
    hours: entry.averageResolutionHours || 0
  }));
  const slaData = [
    { name: 'Breached', value: aiSummary?.metrics?.slaBreaches || 0 },
    { name: 'Within SLA', value: Math.max(0, (aiSummary?.metrics?.totalIssues || 0) - (aiSummary?.metrics?.slaBreaches || 0)) }
  ];
  const chartColors = ['#2563eb', '#7c3aed', '#14b8a6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-5 bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-500">Open Issues</div>
          <div className="mt-2 text-3xl font-black text-gray-900">{aiSummary?.metrics?.openIssues ?? '—'}</div>
          <p className="mt-2 text-xs text-gray-500">Current unresolved work orders</p>
        </GlassCard>
        <GlassCard className="p-5 bg-gradient-to-br from-rose-50 to-white border-rose-100">
          <div className="text-xs font-bold uppercase tracking-widest text-rose-500">SLA Breaches</div>
          <div className="mt-2 text-3xl font-black text-gray-900">{aiSummary?.metrics?.slaBreaches ?? '—'}</div>
          <p className="mt-2 text-xs text-gray-500">Issues past due or beyond target</p>
        </GlassCard>
        <GlassCard className="p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-500">Avg Resolution</div>
          <div className="mt-2 text-3xl font-black text-gray-900">
            {aiSummary?.metrics?.avgResolutionHours ? `${aiSummary.metrics.avgResolutionHours}h` : '—'}
          </div>
          <p className="mt-2 text-xs text-gray-500">Average time to resolve completed issues</p>
        </GlassCard>
        <GlassCard className="p-5 bg-gradient-to-br from-violet-50 to-white border-violet-100">
          <div className="text-xs font-bold uppercase tracking-widest text-violet-500">Active Technicians</div>
          <div className="mt-2 text-3xl font-black text-gray-900">{aiSummary?.metrics?.activeTechnicians ?? '—'}</div>
          <p className="mt-2 text-xs text-gray-500">Technicians currently in the system</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sentiment Analysis Card */}
      <GlassCard className="p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">AI Sentiment Analysis</h3>
        </div>

        {aiSentiment ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Overall Vibe:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${aiSentiment.overallSentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                aiSentiment.overallSentiment === 'Negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                {aiSentiment.overallSentiment}
              </span>
            </div>
            <p className="text-sm text-gray-700 italic leading-relaxed">"{aiSentiment.summary}"</p>

          </div>
        ) : aiError ? (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100">
            <AlertCircle className="w-4 h-4" />
            <span>Analysis failed: {aiError}</span>
          </div>
        ) : (
          <div className="text-gray-500 text-sm italic">No data available for sentiment analysis.</div>
        )}
      </GlassCard>

      {/* Predictive Recommendations Card */}
      <GlassCard className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Star className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Predictive Recommendations</h3>
        </div>
        <div className="space-y-3">
          {aiRecommendations.length > 0 ? (
            aiRecommendations.map((rec, i) => (
              <div key={i} className="p-3 bg-white hover:bg-purple-50 transition-colors rounded-xl border border-purple-100 shadow-sm">
                <p className="text-[10px] text-purple-600 font-bold mb-1 tracking-wider uppercase">{rec.type}</p>
                <p className="font-bold text-gray-900 text-sm mb-1">{rec.title}</p>
                <p className="text-xs text-gray-700 line-clamp-2">{rec.content}</p>
              </div>
            ))
          ) : recsError ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100">
              <AlertCircle className="w-4 h-4" />
              <span>Recommendations failed: {recsError}</span>
            </div>
          ) : (
            <div className="text-gray-500 text-sm italic py-4 text-center">
              Processing system patterns for your first recommendations...
            </div>
          )}
        </div>
      </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GlassCard className="p-6 bg-gradient-to-br from-white to-blue-50 border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Risky Properties</h3>
              <p className="text-xs text-gray-500">Properties with the highest incident counts</p>
            </div>
          </div>
          {topPropertiesData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={topPropertiesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="incidents" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-500">
              {summaryError || 'No property incident data available yet.'}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-white to-rose-50 border-rose-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">SLA Performance</h3>
              <p className="text-xs text-gray-500">Breached versus within-target incidents</p>
            </div>
          </div>
          {aiSummary ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={slaData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                    {slaData.map((entry, index) => (
                      <Cell key={entry.name} fill={index === 0 ? '#ef4444' : '#14b8a6'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-500">
              {summaryError || 'No SLA data available yet.'}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-white to-violet-50 border-violet-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Repeat className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recurring Issues</h3>
              <p className="text-xs text-gray-500">Patterns that suggest preventive maintenance opportunities</p>
            </div>
          </div>
          {recurringIssuesData.length > 0 ? (
            <div className="space-y-3">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={recurringIssuesData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#7c3aed" radius={[0, 8, 8, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {(aiSummary?.recurringIssues || []).slice(0, 3).map((item) => (
                  <div key={`${item.category}-${item.property}`} className="rounded-xl border border-violet-100 bg-white px-3 py-3">
                    <div className="text-sm font-semibold text-gray-900">{item.category} at {item.property}</div>
                    <div className="mt-1 text-xs text-gray-600">{item.prediction}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-500">
              {summaryError || 'No recurring issue pattern detected yet.'}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-white to-emerald-50 border-emerald-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Technician Resolution Speed</h3>
              <p className="text-xs text-gray-500">Lower resolution time means faster issue closure</p>
            </div>
          </div>
          {technicianSpeedData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={technicianSpeedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#14b8a6" radius={[8, 8, 0, 0]}>
                    {technicianSpeedData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-500">
              {summaryError || 'Not enough technician performance data yet.'}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

const SubscriptionManagementSection = ({ settings, updatePlatformValue }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    email: '',
    plan: 'basic',
    billingCycle: 'monthly',
    status: 'active'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/subscriptions', { params: { limit: 100 } });
      setSubscriptions(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    if (!formData.companyId || !formData.email) {
      alert('Please fill in Company ID and Email');
      return;
    }

    try {
      setSaving(true);
      await api.post('/api/subscriptions', {
        companyId: formData.companyId,
        userId: formData.companyId,
        email: formData.email,
        plan: formData.plan,
        billingCycle: formData.billingCycle,
        status: formData.status,
        clientId: formData.companyId,
        secretId: Math.random().toString(36).substring(2, 15),
      });
      alert('Subscription created successfully');
      setFormData({ companyId: '', email: '', plan: 'basic', billingCycle: 'monthly', status: 'active' });
      setShowCreateModal(false);
      await loadSubscriptions();
    } catch (err) {
      console.error('Failed to create subscription:', err);
      alert('Failed to create subscription: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;

    try {
      await api.delete(`/api/subscriptions/${id}`);
      alert('Subscription deleted');
      await loadSubscriptions();
    } catch (err) {
      console.error('Failed to delete subscription:', err);
      alert('Failed to delete: ' + (err.response?.data?.error || err.message));
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = { 'USD': '$', 'RWF': 'FRw', 'EUR': '€', 'GBP': '£' };
    return symbols[currency] || currency;
  };

  return (
    <div className="rounded-2xl border border-white/30 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Active Subscriptions</h3>
            <p className="text-sm text-gray-500">Manage company subscriptions across all clients. Changes affect pricing display.</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
        >
          + Create Subscription
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">Company ID</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">Email</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">Plan</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">Cycle</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">Price</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, idx) => {
                const pricing = settings?.pricing?.[sub.plan]?.[sub.billingCycle] || 0;
                const currency = settings?.platform?.subscriptionCurrency || 'USD';
                const symbol = getCurrencySymbol(currency);
                return (
                  <tr key={sub._id || idx} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 text-sm text-gray-600 font-medium">{sub.companyId}</td>
                    <td className="py-3 px-3 text-sm text-gray-600">{sub.email}</td>
                    <td className="py-3 px-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                        sub.plan === 'premium' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {sub.plan || 'N/A'}
                        {sub.plan === 'premium' && ' 👑'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600 capitalize">{sub.billingCycle || 'monthly'}</td>
                    <td className="py-3 px-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {sub.status || 'unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm font-semibold text-gray-900">
                      {sub.plan === 'premium' ? (
                        <span className="text-purple-600 font-bold">Custom Quote</span>
                      ) : (
                        `${symbol}${pricing}`
                      )}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      <button
                        onClick={() => handleDeleteSubscription(sub._id || sub.id)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          No subscriptions found. Create one to get started.
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl bg-white p-6 shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Subscription</h3>
            <div className="space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Company ID</span>
                <input
                  type="text"
                  value={formData.companyId}
                  onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                  placeholder="Enter company ID"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Email</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="company@example.com"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Plan</span>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({...formData, plan: e.target.value})}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="premium">Premium (Custom Quote)</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Billing Cycle</span>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubscription}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;












