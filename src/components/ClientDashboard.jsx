import React, { useState, useEffect, useRef, useCallback } from "react";
import backgroundVideo from "../assets/136906-765457769_small.mp4";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { WorkOrderForm } from './WorkOrder';
import SubscriptionWidget from './SubscriptionWidget';
import SubscriptionManagement from './SubscriptionManagement';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage, useTranslation } from "../i18n/LanguageContext";
import { Clock, Calendar, CheckCircle, X, Bell, Download, Package, ShoppingCart, Gauge, Plus, Search, Eye, MapPin, AlertCircle, Repeat, Edit, ChevronLeft, ChevronRight, ChevronDown, SlidersHorizontal, Flag, MoreHorizontal, Trash2, Image as ImageIcon, Tag, Paperclip, MessageSquare, Send } from 'lucide-react';

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
              This message goes only to {recipientName || 'the selected person'}. Shared work comments should stay in the work order chat.
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
      sender: userName || 'User',
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
    'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
    'IN PROGRESS': 'bg-blue-100 text-blue-700 border-blue-200',
    'COMPLETE': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'COMPLETED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'APPROVED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'OVERDUE': 'bg-rose-100 text-rose-700 border-rose-200',
    'REJECTED': 'bg-rose-100 text-rose-700 border-rose-200',
  };
  const colorClass = map[s] || 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current/70" />
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

const formatDateForInput = (val) => {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const getWorkOrderDisplayStatus = (issue) => {
  const raw = String(issue?.status || '').toUpperCase().replace(/_/g, ' ').trim();
  if (raw.includes('COMPLETE')) return 'COMPLETED';
  if (raw.includes('IN PROGRESS')) return 'IN PROGRESS';
  if (issue?.approved || raw === 'APPROVED') return 'OPEN';
  return raw || 'OPEN';
};

// Minimal fallback form to avoid runtime errors when the real component is absent.
// Replace with actual implementation when available.
function ScheduleMaintenanceForm({ onSuccess, onClose }) {
  return (
    <div className="border border-amber-200 bg-amber-50 text-amber-800 rounded-lg p-4 text-sm">
      Schedule form component is not defined yet. Click
      {' '}
      <button
        type="button"
        className="underline font-semibold"
        onClick={() => {
          onClose?.();
        }}
      >
        close
      </button>
      {' '}
      to continue.
    </div>
  );
}

const useBulkSelection = (items, getId) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const ids = (items || [])
    .map((item) => {
      const id = getId(item);
      return id ? String(id) : null;
    })
    .filter(Boolean);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => ids.includes(id)));
  }, [items]);

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
        className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  );
};

const parseCsvText = (text) => {
  if (!text) return [];
  const lines = String(text).replace(/\r/g, '').split('\n').filter((line) => line.trim().length > 0);
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
    return out.map((value) => value.trim());
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = parseLine(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? '';
    });
    return obj;
  }).filter((row) => Object.values(row).some((value) => String(value || '').trim().length > 0));
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
    blue: 'from-blue-50 to-indigo-50 border-blue-100',
    green: 'from-emerald-50 to-teal-50 border-emerald-100',
    red: 'from-rose-50 to-pink-50 border-rose-100',
    indigo: 'from-indigo-50 to-purple-50 border-indigo-100',
    amber: 'from-amber-50 to-yellow-50 border-amber-100',
  };
  const c = accents[accent] || accents.blue;
  return (
    <div
      onClick={onClick}
      className={`glass-surface rounded-2xl p-6 flex items-start gap-4 border-l-4 overflow-hidden relative group transition-all hover:scale-[1.02] ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-100' : ''}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c} opacity-90`} />
      <div className="relative z-10 w-12 h-12 rounded-xl glass-mirror flex items-center justify-center text-blue-700 shadow-lg bg-white/80 border border-blue-100">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
        <div className="text-sm font-bold text-gray-700 uppercase tracking-wider mt-1">{label}</div>
        {sub && <div className="text-xs text-gray-600 mt-1 font-medium">{sub}</div>}
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
// Centralized Popover (manager parity)
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

function Table({ heads, rows, empty = 'No data found.' }) {
  return (
    <div className="glass-surface border border-gray-200/80 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
      {rows.length === 0 ? (
        <div className="text-center py-16 px-6 text-gray-500 text-sm font-medium">{empty}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {heads.map((h, i) => (
                  <th key={i} className="py-4 px-6 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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
                    className={`hover:bg-gray-50 transition-colors duration-150 ${isClickable ? 'cursor-pointer' : ''} ${rowClass}`}
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
  <td className={`py-4 px-6 text-sm text-gray-800 ${mono ? 'font-mono' : ''}`}>{children ?? '—'}</td>
);

// â”€â”€ Input / Select â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Input = ({ className = '', ...props }) => (
  <input
    className={`glass-input rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-200 border-gray-200 w-full transition-all outline-none ${className}`}
    {...props}
  />
);

const Select = ({ className = '', children, ...props }) => (
  <select
    className={`glass-input rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-200 border-gray-200 w-full transition-all outline-none appearance-none ${className}`}
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
    ghost: 'bg-white border border-gray-200 text-blue-700 hover:bg-blue-50',
    outline: 'bg-white border border-gray-200 text-blue-700 hover:bg-blue-50',
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
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
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
  const [privateNote, setPrivateNote] = useState('');
  const [mentionNotifications, setMentionNotifications] = useState([]);
  const [noteReady, setNoteReady] = useState(false);
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
  const [pmTasks, setPmTasks] = useState([{ id: 1, title: '', status: 'Open' }]);
  const [pmWorkOrder, setPmWorkOrder] = useState({
    title: '',
    description: '',
    createNow: false,
    priority: 'Medium',
    category: 'General',
    durationHours: '',
    requiresSignature: false,
  });
  const [pmChecklist, setPmChecklist] = useState([
    { id: Date.now(), text: '', type: 'Status', meter: '' },
  ]);
  const [pmChecklistLibrary, setPmChecklistLibrary] = useState([]);
  const [selectedChecklistTemplate, setSelectedChecklistTemplate] = useState(null);
  const [checklistDetailOpen, setChecklistDetailOpen] = useState(false);
  const [editingChecklistTemplate, setEditingChecklistTemplate] = useState(null);
  const [checklistEditForm, setChecklistEditForm] = useState({ name: '', description: '', tags: [], items: [] });
  const [savingChecklistTemplate, setSavingChecklistTemplate] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [checklistViewTab, setChecklistViewTab] = useState('your');
  const [pmSchedule, setPmSchedule] = useState({
    scheduleType: null,
    calendarRule: null,
  });
  const [pmSessionId, setPmSessionId] = useState(0);
  const [showCreatePm, setShowCreatePm] = useState(false);
  const [showWorkOrderDetails, setShowWorkOrderDetails] = useState(false);
  const [launchChecklistBuilderFromMain, setLaunchChecklistBuilderFromMain] = useState(false);
  const [showCalendarSchedule, setShowCalendarSchedule] = useState(false);
  const [showMeterSchedule, setShowMeterSchedule] = useState(false);
  const [showCombinedSchedule, setShowCombinedSchedule] = useState(false);
  const [modalData, setModalData] = useState({ open: false, type: '', item: null });
  const [commentModal, setCommentModal] = useState({ open: false, item: null });
  const [directMessageModal, setDirectMessageModal] = useState({
    open: false,
    recipientUserId: '',
    recipientName: '',
    link: '/client-dashboard',
    message: '',
    sending: false
  });

  const startNewPm = () => {
    setPmWorkOrder({
      title: '',
      description: '',
      createNow: false,
      priority: 'Medium',
      category: 'General',
      durationHours: '',
      requiresSignature: false,
    });
    setPmTasks([{ id: Date.now(), title: '', status: 'Open' }]);
    setPmChecklist([{ id: Date.now() + 1, text: '', type: 'Status', meter: '' }]);
    // keep library across sessions
    setPmSchedule({ scheduleType: null, calendarRule: null });
    setPmSessionId((n) => n + 1);
    setShowCreatePm(true);
  };

  const refreshChecklists = useCallback(async () => {
    try {
      const res = await api.get('/api/checklists');
      const items = Array.isArray(res.data) ? res.data : [];
      setPmChecklistLibrary(items.map((tpl, index) => ({
        ...tpl,
        id: tpl.id || tpl._id || `checklist-${index}`,
        name: tpl.name || tpl.title || 'Checklist',
        description: tpl.description || '',
        items: Array.isArray(tpl.items) ? tpl.items : (Array.isArray(tpl.checklist) ? tpl.checklist : []),
        tags: Array.isArray(tpl.tags) ? tpl.tags : [],
      })));
    } catch (err) {
      console.error('Failed to refresh checklists:', err);
    }
  }, []);

  React.useEffect(() => {
    refreshChecklists();
  }, [refreshChecklists]);

  const filteredChecklistLibrary = (pmChecklistLibrary || []).filter((tpl) => (
    (tpl.name || '').toLowerCase().includes((searchText || '').toLowerCase())
  ));
  const checklistTemplateTypeOptions = ['Status', 'Text', 'Number', 'Inspection', 'Multiple Choice', 'Meter', 'Signature', 'Checkbox', 'Warning', 'Multiselect'];
  const normalizeChecklistTemplateItems = useCallback((items = []) => (
    (Array.isArray(items) ? items : []).map((item, index) => ({
      id: item.id || item._id || `${Date.now()}-${index}`,
      text: item.text || item.label || item.name || '',
      type: item.type || 'Status',
      meter: item.meter || '',
      required: !!item.required,
    }))
  ), []);
  const openChecklistTemplateEditor = useCallback((tpl) => {
    if (!tpl) return;
    setEditingChecklistTemplate(tpl);
    setChecklistEditForm({
      name: tpl.name || tpl.title || 'Checklist',
      description: tpl.description || '',
      tags: Array.isArray(tpl.tags) ? tpl.tags : [],
      items: normalizeChecklistTemplateItems(tpl.items || tpl.checklist || []),
    });
  }, [normalizeChecklistTemplateItems]);
  const saveChecklistTemplateChanges = useCallback(async () => {
    if (!editingChecklistTemplate?.id && !editingChecklistTemplate?._id) return;
    if (!String(checklistEditForm.name || '').trim()) {
      alert('Checklist name is required');
      return;
    }
    if (!Array.isArray(checklistEditForm.items) || checklistEditForm.items.filter((item) => String(item.text || '').trim()).length === 0) {
      alert('Add at least one checklist item');
      return;
    }

    setSavingChecklistTemplate(true);
    try {
      const checklistId = editingChecklistTemplate.id || editingChecklistTemplate._id;
      await api.put(`/api/checklists/${checklistId}`, {
        name: checklistEditForm.name,
        title: checklistEditForm.name,
        description: checklistEditForm.description || '',
        tags: Array.isArray(checklistEditForm.tags) ? checklistEditForm.tags : [],
        items: checklistEditForm.items.map((item, index) => ({
          id: item.id || `${Date.now()}-${index}`,
          text: item.text || '',
          type: item.type || 'Status',
          meter: item.meter || '',
          required: !!item.required,
        })),
      });
      await refreshChecklists();
      setSelectedChecklistTemplate((current) => current ? {
        ...current,
        name: checklistEditForm.name,
        title: checklistEditForm.name,
        description: checklistEditForm.description || '',
        tags: Array.isArray(checklistEditForm.tags) ? checklistEditForm.tags : [],
        items: checklistEditForm.items,
      } : current);
      setEditingChecklistTemplate(null);
    } catch (err) {
      console.error('Failed to update checklist template', err);
      alert(err?.response?.data?.error || err?.message || 'Failed to update checklist');
    } finally {
      setSavingChecklistTemplate(false);
    }
  }, [checklistEditForm, editingChecklistTemplate, refreshChecklists]);

  const allWorkers = React.useMemo(() => {
    const onlyUsers = (people || []).filter(p => p.kind !== 'invite');
    return dedupeById(
      [...internalTechnicians, ...technicians, ...onlyUsers],
      person => person?._id || person?.id || person?.userId || person?.email || person?.phone
    );
  }, [internalTechnicians, technicians, people]);

  // New Detail Modal Implementation (manager parity)
  const DetailsModal = useCallback(function DetailsModal({ open, type, item, onClose, getAssignedTechName, onRefresh, technicians = [], teams = [], workOrders = [], people = [], onPrivateMessage }) {
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
      title: item?.title || item?.name || '',
      description: item?.description || '',
      category: item?.category || '',
      priority: item?.priority || 'MEDIUM',
      status: item?.status || '',
      location: item?.location || item?.address || '',
      assetName: item?.assetName || '',
      assignedTo: item?.assignedTo || '',
      additionalResponsibleWorkers: item?.additionalResponsibleWorkers || '',
      team: item?.team || '',
      estimatedTime: item?.estimatedTime || '',
      startDate: item?.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
      frequency: item?.frequency || item?.interval || '',
      fixDeadline: item?.fixDeadline ? new Date(item.fixDeadline).toISOString().split('T')[0] : '',
      checklist: normalizeTaskArray(item?.checklist || item?.tasks || item?.taskList),
      chat: Array.isArray(item?.chat) ? item.chat : []
    });
    const [activeTab, setActiveTab] = useState('overview');
    const [chatInput, setChatInput] = useState('');
    const [mentionCandidates, setMentionCandidates] = useState([]);
    const [mentionContext, setMentionContext] = useState(null);
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
          title: item.title || item.name || '',
          description: item.description || '',
          category: item.category || '',
          priority: item.priority || 'MEDIUM',
          status: item.status || '',
          location: item.location || item.address || '',
          assetName: item.assetName || '',
          assignedTo: item.assignedTo || '',
          additionalResponsibleWorkers: item.additionalResponsibleWorkers || '',
          team: item.team || '',
          estimatedTime: item.estimatedTime || '',
          startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
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
        await api.post(`/api/issues/${item.id || item._id}/approve`);
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
        await api.post(`/api/issues/${item.id || item._id}/decline`, { reason });
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
        setMentionCandidates([]);
        setMentionContext(null);
        logActivity('Sent message', messageText);
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
      const filtered = (people || [])
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

    const privateRecipientId = item?.assignedTo || item?.userId || item?.requestorId || '';
    const privateRecipientName = getAssignedTechName ? getAssignedTechName(item) : (item?.name || item?.email || 'User');

    const addChecklistItem = () => {
      setFormData(prev => ({ ...prev, checklist: [...prev.checklist, { text: '', completed: false }] }));
    };

    const updateChecklistItem = (index, field, value) => {
      const newList = [...formData.checklist];
      newList[index][field] = value;
      setFormData(prev => ({ ...prev, checklist: newList }));
    };

    if (!open || !item) return null;

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
                    <div className="flex items-center gap-2">
                      {!!privateRecipientId && (
                        <button
                          type="button"
                          onClick={() => onPrivateMessage && onPrivateMessage({
                            recipientUserId: privateRecipientId,
                            recipientName: privateRecipientName,
                            link: `/client-dashboard?id=${item.id || item._id}`
                          })}
                          className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <Send className="w-4 h-4" />
                          Private Message
                        </button>
                      )}
                      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
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
                  <h3 className="text-[22px] font-bold text-gray-900">{isRequest ? 'Request' : title}</h3>
                  <div className="flex items-center gap-5">
                    {isRequest && (
                      <button className="text-[15px] font-medium text-blue-600 hover:text-blue-700">
                        PDF Options
                      </button>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
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

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Title <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            disabled={isRequestReadOnly}
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Description</label>
                          <textarea
                            rows={4}
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            disabled={isRequestReadOnly}
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Priority</label>
                          <select
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
                            value={formData.priority}
                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            disabled={isRequestReadOnly}
                          >
                            <option value="">Select Priority</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Image</label>
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            className="rounded-lg border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-500"
                          >
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-800 font-medium"
                            >
                              Upload
                            </button>
                            <span className="ml-4">or Drop Images</span>
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => handleFileImport(e.target.files)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Start Date</label>
                          <input
                            type="date"
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
                            value={formData.startDate || ''}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            disabled={isRequestReadOnly}
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Due Date</label>
                          <input
                            type="date"
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
                            value={formData.fixDeadline}
                            onChange={e => setFormData({ ...formData, fixDeadline: e.target.value })}
                            disabled={isRequestReadOnly}
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Category</label>
                          <select
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            disabled={isRequestReadOnly}
                          >
                            <option value="">Select Category</option>
                            <option value="Damage">Damage</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Inspections">Inspections</option>
                            <option value="Meter Reading">Meter Reading</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Preventative">Preventative</option>
                            <option value="Project">Project</option>
                            <option value="Safety">Safety</option>
                            <option value="Upgrade">Upgrade</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Location</label>
                          <select
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            disabled={isRequestReadOnly}
                          >
                            <option value="">Select Location</option>
                            {(properties || []).map((property) => (
                              <option key={property._id || property.id} value={property.name || property.title || property.address || ''}>
                                {property.name || property.title || property.address || 'Property'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Asset</label>
                          <select
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
                            value={formData.assetName}
                            onChange={e => setFormData({ ...formData, assetName: e.target.value })}
                            disabled={isRequestReadOnly}
                          >
                            <option value="">Select Asset</option>
                            {(assets || []).map((asset) => (
                              <option key={asset._id || asset.id} value={asset.name || asset.title || ''}>
                                {asset.name || asset.title || 'Asset'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Primary Worker</label>
                          <select
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
                            value={formData.assignedTo}
                            onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                            disabled={isRequestReadOnly}
                          >
                            <option value="">Select worker</option>
                            {technicians.map((t, idx) => (
                              <option key={`${t._id || t.id || 'tech'}-${idx}`} value={t._id || t.id}>
                                {t.name || t.fullName || t.email || 'Worker'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Additional Workers</label>
                          <input
                            type="text"
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
                            value={formData.additionalResponsibleWorkers || ''}
                            onChange={e => setFormData({ ...formData, additionalResponsibleWorkers: e.target.value })}
                            disabled={isRequestReadOnly}
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Team</label>
                          <select
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
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

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Checklists</label>
                          <select
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
                            value={formData.checklistTemplateId || ''}
                            onChange={e => {
                              const selected = (pmChecklistLibrary || []).find((tpl) => String(tpl.id || tpl._id) === String(e.target.value));
                              setFormData({
                                ...formData,
                                checklistTemplateId: e.target.value,
                                checklist: selected?.items || formData.checklist,
                              });
                            }}
                            disabled={isRequestReadOnly}
                          >
                            <option value="">Select Checklist</option>
                            {(pmChecklistLibrary || []).map((tpl) => (
                              <option key={tpl.id || tpl._id} value={tpl.id || tpl._id}>
                                {tpl.name || tpl.title || 'Checklist'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-800 mb-2">Estimated Duration</label>
                          <input
                            type="text"
                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] ${requestLockClass}`}
                            value={formData.estimatedTime}
                            onChange={e => setFormData({ ...formData, estimatedTime: e.target.value })}
                            disabled={isRequestReadOnly}
                          />
                        </div>

                        <label className="flex items-center gap-3 border-t border-gray-200 pt-5 text-[15px] text-gray-800">
                          <input
                            type="checkbox"
                            className="h-6 w-6 rounded border-gray-300"
                            checked={!!formData.signature}
                            onChange={e => setFormData({ ...formData, signature: e.target.checked })}
                            disabled={isRequestReadOnly}
                          />
                          Signature Required
                        </label>

                        <div className="border-t border-gray-200 pt-5">
                          <label className="block text-sm text-gray-800 mb-2">Files</label>
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            className="rounded-lg border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-500"
                          >
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-800 font-medium"
                            >
                              Upload
                            </button>
                            <span className="ml-4">or Drop Files</span>
                          </div>
                          <button type="button" className="mt-5 text-[15px] font-medium text-blue-600 hover:text-blue-700">
                            Add from Saved Files
                          </button>
                        </div>

                        {(item.beforePhoto || item.photo || item.image || item.beforeImage || item.afterImage || item.afterPhoto) && (
                          <div className="pt-2">
                            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 w-56">
                              <img
                                src={getImageUrl(item.afterImage || item.afterPhoto || item.beforeImage || item.beforePhoto || item.photo || item.image)}
                                alt="Attachment"
                                className="w-full h-36 object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>

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
                        const actorName = act.user || act.sender || act.createdBy || '';
                        const actorLabel = actorName ? (actorName === userName ? 'You' : actorName) : '';
                        return (
                          <div key={act.id || `activity-${idx}`} className="p-4 rounded-xl border border-gray-200 bg-white/70">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-gray-800">{act.action || 'Update'}</div>
                              <div className="text-xs text-gray-500">{when ? formatDateTime(when) : 'â€”'}</div>
                            </div>
                            {act.detail && <p className="text-xs text-gray-600 mt-2">{act.detail}</p>}
                            {(actorLabel || act.source === 'local') && (
                              <div className="text-[11px] text-gray-400 mt-2">
                                {actorLabel ? `by ${actorLabel}` : 'Activity'}
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
            <div className="w-full md:w-[34rem] lg:w-[35rem] flex flex-col bg-white border-l border-gray-200 flex-shrink-0">
            <div className="px-0 py-0 bg-white flex items-center justify-between">
              <div className="px-4 py-4 border-b border-gray-200 w-full">
                <h4 className="text-[18px] font-bold text-gray-900">Comments</h4>
                <p className="mt-1 text-xs text-gray-500">Shared discussion for everyone who can access this request.</p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hidden md:block">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-white">
              {formData.chat.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
                  <div className="text-sm font-semibold text-gray-700">No comments yet</div>
                  <div className="mt-1 text-xs text-gray-500">Start the thread with an update, a question, or tag someone with @.</div>
                </div>
              ) : (
                <div className="space-y-4">
                {formData.chat.map((msg, i) => (
                  <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${String(msg.sender || msg.user || msg.createdBy || '').trim() === userName ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        {String(msg.sender || msg.user || msg.createdBy || 'U').trim().split(' ').map(part => part?.[0] || '').join('').slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-bold text-gray-900">{msg.sender || msg.user || msg.createdBy || 'Unknown'}</span>
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
                ))}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="rounded-2xl border border-gray-200 bg-slate-50/80 p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Add a public comment</div>
                    <div className="text-xs text-gray-500">Everyone with access to this request can read this thread.</div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
                    {formData.chat.length} comments
                  </span>
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
                <textarea
                  className="min-h-[120px] w-full resize-none rounded-2xl border border-white bg-white px-4 py-3 text-[15px] text-gray-800 outline-none ring-1 ring-slate-100 transition focus:ring-2 focus:ring-blue-100"
                  placeholder="Share an update, ask a question, or use @ to mention someone..."
                  value={chatInput}
                  onChange={handleChatInputChange}
                />
                <div className="mt-3 flex items-center justify-between">
                  <button type="button" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-700">
                    <Paperclip className="w-6 h-6" />
                    Attach
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.4 20.4L20.85 12 3.4 3.6 3.39 10.13l12.47 1.87-12.47 1.87z" />
                    </svg>
                    Post
                  </button>
                </div>
                </div>
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

  const isRestrictedRole = useCallback((role, companyName = '') => {
    const r = String(role || '').toLowerCase();
    const hasCompanyScope = Boolean(String(companyName || '').trim());
    if (hasCompanyScope && (r === 'client' || r === 'requestor')) {
      return false;
    }
    return r === 'client' || r === 'requestor';
  }, []);

  useEffect(() => {
    const userId = currentUser?._id || currentUser?.id;
    if (!userId) return;
    let cancelled = false;
    const loadSideData = async () => {
      try {
        const [noteRes, mentionsRes] = await Promise.all([
          api.get('/api/private-notes/me', { params: { scope: 'client-dashboard' } }),
          api.get('/api/notifications', { params: { type: 'mention', limit: 6 } })
        ]);
        if (cancelled) return;
        setPrivateNote(noteRes?.data?.content || '');
        setMentionNotifications(Array.isArray(mentionsRes?.data) ? mentionsRes.data : []);
      } catch (err) {
        console.error('Failed to load client dashboard side data', err);
      } finally {
        if (!cancelled) setNoteReady(true);
      }
    };

    loadSideData();
    return () => { cancelled = true; };
  }, [currentUser]);

  useEffect(() => {
    if (!noteReady) return;
    const timer = setTimeout(async () => {
      try {
        await api.put('/api/private-notes/me', {
          scope: 'client-dashboard',
          content: privateNote
        });
      } catch (err) {
        console.error('Failed to save client private note', err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [privateNote, noteReady]);

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
      const scoped = isRestrictedRole(user?.role, companyName)
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
      const res = await api.get('/api/material-requests');
      setMaterialRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch material requests:', err);
    }
  }, []);

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

      const isRestricted = isRestrictedRole(userObj?.role, userObj?.companyName);
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
      await api.post(`/api/issues/${id}/approve`);
      await fetchIssues();
    } catch {
      alert('Failed to approve');
    }
  }, [fetchIssues]);

  const declineIssue = useCallback(async (id) => {
    try {
      await api.post(`/api/issues/${id}/decline`, { reason: 'Declined by manager' });
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

  const openPrivateMessageComposer = useCallback(({ recipientUserId, recipientName, link }) => {
    if (!recipientUserId) {
      alert('No recipient is available for private message.');
      return;
    }
    setDirectMessageModal({
      open: true,
      recipientUserId: String(recipientUserId),
      recipientName: recipientName || 'Assigned person',
      link: link || '/client-dashboard',
      message: '',
      sending: false
    });
  }, []);

  const closeDirectMessageModal = useCallback(() => {
    setDirectMessageModal({
      open: false,
      recipientUserId: '',
      recipientName: '',
      link: '/client-dashboard',
      message: '',
      sending: false
    });
  }, []);

  const openCommentModal = useCallback((item) => {
    setCommentModal({ open: true, item });
  }, []);

  const closeCommentModal = useCallback(() => {
    setCommentModal({ open: false, item: null });
  }, []);

  const handleCommentPosted = useCallback((updatedChat) => {
    const issueId = commentModal.item?._id || commentModal.item?.id;
    if (!issueId) return;
    const applyChat = (list) => (Array.isArray(list) ? list.map((entry) => (
      String(entry?._id || entry?.id) === String(issueId) ? { ...entry, chat: updatedChat } : entry
    )) : list);
    setIssues(prev => applyChat(prev));
    setAllIssues(prev => applyChat(prev));
    setCommentModal(prev => ({
      ...prev,
      item: prev.item ? { ...prev.item, chat: updatedChat } : prev.item
    }));
  }, [commentModal.item]);

  const handleSendDirectMessage = useCallback(async () => {
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
        title: `Private message from ${userName || 'User'}`,
        link: directMessageModal.link || '/client-dashboard'
      });
      alert('Private message sent.');
      closeDirectMessageModal();
    } catch (err) {
      setDirectMessageModal(prev => ({ ...prev, sending: false }));
      alert('Failed to send private message: ' + (err?.response?.data?.message || err.message));
    }
  }, [closeDirectMessageModal, directMessageModal, userName]);

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

  const pendingRequests = allIssues.filter(issue => !isRejectedRequest(issue));
  const workOrders = allIssues.filter(issue => isApprovedWorkOrder(issue));
  const clientTasks = allIssues.flatMap((issue) => {
    const rawTasks = Array.isArray(issue?.tasks) && issue.tasks.length
      ? issue.tasks
      : Array.isArray(issue?.taskList) && issue.taskList.length
        ? issue.taskList
        : Array.isArray(issue?.checklist)
          ? issue.checklist
          : [];

    return rawTasks.map((task, idx) => {
      const normalized = typeof task === 'string' ? { title: task } : (task || {});
      const status = String(normalized.status || (normalized.completed ? 'COMPLETED' : 'OPEN')).toUpperCase();
      const dueDate = normalized.dueDate || normalized.deadline || normalized.due || issue.fixDeadline || issue.dueDate || null;
      return {
        id: normalized.id || normalized._id || `${issue._id || issue.id}-task-${idx}`,
        title: normalized.title || normalized.text || normalized.name || `Task ${idx + 1}`,
        parentTitle: issue.title || 'Work order',
        completed: status.includes('COMPLETE'),
        overdue: dueDate ? new Date(dueDate) < new Date() && !status.includes('COMPLETE') : false
      };
    });
  });

  const clientMentions = Array.isArray(mentionNotifications) ? mentionNotifications : [];

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
  const startEditingAsset = useCallback((asset) => {
    if (!asset) return;
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
      propertyId: asset.propertyId || asset.property?.id || asset.property?._id || '',
      quantity: asset.quantity || 1,
      building: asset.building || asset.location?.building || '',
      blocks: blocksArr,
      room: asset.room || asset.location?.room || ''
    });
  }, []);

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
    { key: 'imports', label: 'Import / Export', icon: <Icon.Download />, group: 'data' },

    { key: 'assets', label: t("manager.sidebar.assets"), icon: <Icon.Assets />, group: 'resources' },
    { key: 'properties', label: t("manager.sidebar.locations"), icon: <Icon.Properties />, group: 'resources' },
    { key: 'internalTechnicians', label: t("manager.sidebar.peopleTeams"), icon: <Icon.Staff />, group: 'resources' },
    { key: 'maintenanceTemplates', label: t("manager.sidebar.checklists"), icon: <Icon.Templates />, group: 'resources' },
    { key: 'files', label: t("manager.sidebar.files"), icon: <Icon.Download />, group: 'resources' },

    { key: 'parts', label: t("manager.sidebar.partsInventory"), icon: <Icon.Package />, group: 'procurement' },
    { key: 'purchaseOrders', label: t("manager.sidebar.purchaseOrders"), icon: <Icon.ShoppingCart />, group: 'procurement' },
    { key: 'vendors', label: 'Vendors', icon: <Icon.Vendors />, group: 'procurement' },
    { key: 'customers', label: 'Customers', icon: <Icon.Staff />, group: 'procurement' },
  ];

  const navSections = [
    { key: 'core', label: t("manager.sidebar.core") },
    { key: 'data', label: t("manager.sidebar.dataAnalytics") },
    { key: 'resources', label: t("manager.sidebar.resources") },
    { key: 'procurement', label: t("manager.sidebar.procurement") },
  ];

  return (
    <div className="glass-theme-blue min-h-screen text-slate-900 overflow-hidden relative" style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
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
              <div className="glass-surface rounded-2xl p-8 mb-6 text-gray-900 flex items-center justify-between overflow-hidden relative shadow-2xl border border-gray-200/70">
                <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'absolute', right: 40, bottom: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, color: '#4B5563' }}>{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: '#111827' }}>Welcome back, {userName.split(' ')[0]}!</h2>
                  <p style={{ margin: '6px 0 0', opacity: 0.8, fontSize: 14, color: '#374151' }}>Here's your property activity overview.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, position: 'relative', flexShrink: 0 }}>
                  <Btn onClick={() => setActiveTab('requests')} style={{ background: '#1D4ED8', color: 'white', border: '1px solid #1D4ED8' }}>View Requests</Btn>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
                <div className="glass-surface rounded-2xl border border-gray-200/70 p-6 shadow-xl">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>My Work Orders</div>
                      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Requests and work orders that affect your company.</div>
                    </div>
                    <Btn onClick={() => setActiveTab('workOrders')} variant="outline" className="!text-blue-700 !border-blue-200 !bg-white">Open List</Btn>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {workOrders.slice(0, 5).map((issue) => (
                      <button
                        key={`dashboard-workorder-${issue._id || issue.id}`}
                        onClick={() => setModalData({ open: true, type: 'request', item: issue })}
                        style={{ border: '1px solid #E5E7EB', background: 'rgba(255,255,255,0.7)', borderRadius: 14, padding: '12px 14px', textAlign: 'left', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.title || 'Untitled work order'}</div>
                            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.location || 'No location yet'}</div>
                          </div>
                          <span style={{ alignSelf: 'flex-start', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '4px 8px', borderRadius: 999, background: '#DBEAFE', color: '#1D4ED8' }}>
                            {String(issue.status || 'Open').replace(/_/g, ' ')}
                          </span>
                        </div>
                      </button>
                    ))}
                    {workOrders.length === 0 && (
                      <div style={{ border: '2px dashed #E5E7EB', borderRadius: 16, padding: '28px 16px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
                        No work orders yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-surface rounded-2xl border border-gray-200/70 p-6 shadow-xl">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>My Tasks</div>
                      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Checklist and task items across your requests and work orders.</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '6px 10px', borderRadius: 999, background: '#FEF3C7', color: '#92400E' }}>
                      {clientTasks.filter((task) => !task.completed).length} Active
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {clientTasks.slice(0, 6).map((task) => (
                      <div key={task.id} style={{ border: '1px solid #E5E7EB', background: 'rgba(255,255,255,0.7)', borderRadius: 14, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.parentTitle}</div>
                          </div>
                          <span style={{ alignSelf: 'flex-start', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '4px 8px', borderRadius: 999, background: task.completed ? '#D1FAE5' : task.overdue ? '#FEE2E2' : '#DBEAFE', color: task.completed ? '#065F46' : task.overdue ? '#991B1B' : '#1D4ED8' }}>
                            {task.completed ? 'Completed' : task.overdue ? 'Overdue' : 'Open'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {clientTasks.length === 0 && (
                      <div style={{ border: '2px dashed #E5E7EB', borderRadius: 16, padding: '28px 16px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
                        No tasks yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-surface rounded-2xl border border-gray-200/70 p-6 shadow-xl">
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>Private Notepad</div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Personal reminders stored only for your account in this browser.</div>
                  </div>
                  <textarea
                    value={privateNote}
                    onChange={(e) => setPrivateNote(e.target.value)}
                    placeholder="Write personal follow-ups, calls to make, or reminders here..."
                    style={{ width: '100%', minHeight: 220, borderRadius: 16, border: '1px solid #E5E7EB', background: 'rgba(255,255,255,0.72)', padding: 16, fontSize: 14, color: '#374151', outline: 'none' }}
                  />
                </div>

                <div className="glass-surface rounded-2xl border border-gray-200/70 p-6 shadow-xl">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>Comments Mentioning Me</div>
                      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Current chat messages that include your name or email.</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '6px 10px', borderRadius: 999, background: '#F3F4F6', color: '#374151' }}>
                      {clientMentions.length} Recent
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {clientMentions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.link) {
                            window.location.href = item.link;
                          }
                        }}
                        style={{ border: '1px solid #E5E7EB', background: 'rgba(255,255,255,0.7)', borderRadius: 14, padding: '12px 14px', textAlign: 'left', cursor: 'pointer' }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#9CA3AF' }}>{item.title}</div>
                        <div style={{ fontSize: 14, color: '#111827', marginTop: 6, lineHeight: 1.45 }}>{item.message}</div>
                        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>
                          {item.type || 'mention'}{item.createdAt ? ` • ${new Date(item.createdAt).toLocaleString()}` : ''}
                        </div>
                      </button>
                    ))}
                    {clientMentions.length === 0 && (
                      <div style={{ border: '2px dashed #E5E7EB', borderRadius: 16, padding: '28px 16px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
                        No mentions found yet.
                      </div>
                    )}
                  </div>
                </div>
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
                <div className="glass-surface rounded-2xl border border-gray-200/70 p-5 shadow-xl">
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Quick Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Btn onClick={() => setActiveTab('requests')} variant="outline" className="!text-blue-700 !border-blue-200 !bg-white" style={{ justifyContent: 'center', width: '100%' }}>All Requests</Btn>
                    <Btn onClick={exportIssuesPDF} variant="ghost" className="!text-blue-700 !border-blue-200 !bg-white" style={{ justifyContent: 'center', width: '100%' }}><Icon.Export /> {t("client.actions.exportPdf")}</Btn>
                    <Btn onClick={() => setActiveTab('maintenanceTemplates')} variant="ghost" className="!text-blue-700 !border-blue-200 !bg-white" style={{ justifyContent: 'center', width: '100%' }}>
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
                <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl text-gray-500 shadow-inner">
                  {/* <div className="text-5xl mb-4 grayscale opacity-50">ðŸ“‹</div> */}
                  <div className="text-lg font-bold mb-1 text-gray-700">No issues found</div>
                  <div className="text-sm text-gray-500">Submit a new request to get started</div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {issues.slice(0, 5).map(issue => {
                    const id = issue.id || issue._id;
                    return (
                      <div key={id} className={`glass-surface border ${issue.overdue ? 'border-rose-200 bg-rose-50' : 'border-gray-200'} rounded-2xl p-5 flex gap-5 transition-all hover:scale-[1.01] hover:shadow-xl group`}>
                        {/* Left accent */}
                        <div className={`w-1.5 rounded-full shadow-lg ${issue.overdue ? 'bg-rose-500 shadow-rose-500/40' : issue.status?.includes('PROGRESS') ? 'bg-blue-500 shadow-blue-500/40' : issue.status?.includes('COMPLETE') || issue.status === 'APPROVED' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-amber-500 shadow-amber-500/40'} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <div className="font-extrabold text-base text-gray-900 truncate group-hover:text-blue-700 transition-colors">{issue.title}</div>
                            <div className="flex items-center gap-3 shrink-0">
                              <StatusBadge status={issue.status} />
                              {issue.overdue && <span className="text-[10px] font-black uppercase tracking-tighter text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">Overdue</span>}
                            </div>
                          </div>
                          {issue.location && <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {renderValue(issue.location)}</div>}

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

          {activeTab === 'maintenanceTemplates' && (
            <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center border-b border-gray-200 bg-gray-50/60">
                <div className="flex h-[76px] w-[88px] items-center justify-center border-r border-gray-200 text-gray-400">
                  <Icon.Templates />
                </div>
                <div className="px-7">
                  <h2 className="text-[22px] font-bold tracking-tight text-gray-900">Checklists</h2>
                </div>
              </div>

              <div className="border-b border-gray-200 bg-white px-6">
                <div className="flex items-center gap-8 text-[15px] font-medium text-gray-500">
                  <button
                    type="button"
                    onClick={() => setChecklistViewTab('your')}
                    className={`border-b-2 px-0 py-5 transition-colors ${
                      checklistViewTab === 'your'
                        ? 'border-blue-600 text-gray-900'
                        : 'border-transparent hover:text-gray-700'
                    }`}
                  >
                    Your Checklists
                  </button>
                  <button
                    type="button"
                    onClick={() => setChecklistViewTab('library')}
                    className={`border-b-2 px-0 py-5 transition-colors ${
                      checklistViewTab === 'library'
                        ? 'border-blue-600 text-gray-900'
                        : 'border-transparent hover:text-gray-700'
                    }`}
                  >
                    Template Library
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50/70 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-[15px] font-medium text-gray-500">
                  {filteredChecklistLibrary.length} Checklists
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 sm:w-72"
                      placeholder="Search by Name"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  <button
                    className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                    onClick={() => {
                      setLaunchChecklistBuilderFromMain(true);
                      setShowWorkOrderDetails(true);
                    }}
                  >
                    Add Checklist
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 px-6 py-5">
                <button className="inline-flex h-11 items-center gap-2 rounded-2xl border-2 border-gray-300 bg-white px-4 text-[15px] font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
                  <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                  Filters
                </button>
                <div className="hidden h-10 w-px bg-gray-200 sm:block" />
                <button className="inline-flex h-11 items-center gap-2 rounded-2xl border-2 border-gray-300 bg-white px-4 text-[15px] font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
                  <Tag className="h-4 w-4 text-gray-500" />
                  Tags
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                <button className="text-[15px] font-medium text-blue-600 transition hover:text-blue-700">
                  Reset Filters
                </button>
              </div>

              <div className="p-6">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-white text-gray-700">
                      <tr>
                        <th className="w-16 px-6 py-4 text-left">
                          <input type="checkbox" className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </th>
                        <th className="px-6 py-4 text-left text-[15px] font-bold text-gray-900">Name</th>
                        <th className="px-6 py-4 text-left text-[15px] font-bold text-gray-900">Description</th>
                        <th className="w-32 px-6 py-4 text-left text-[15px] font-bold text-gray-900">Tasks</th>
                        <th className="w-24 px-6 py-4 text-left text-[15px] font-bold text-gray-900">Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChecklistLibrary.map((tpl) => (
                        <tr
                          key={tpl.id}
                          className="cursor-pointer border-t border-gray-200 transition hover:bg-gray-50/80"
                          onClick={() => {
                            setSelectedChecklistTemplate(tpl);
                            setChecklistDetailOpen(true);
                          }}
                        >
                          <td className="px-6 py-6 align-top">
                            <input
                              type="checkbox"
                              className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-6 align-top text-[15px] font-medium text-gray-900">
                            {tpl.name || 'Checklist'}
                          </td>
                          <td className="max-w-[520px] px-6 py-6 align-top text-[15px] text-gray-700">
                            <span className="line-clamp-1">{tpl.description || '—'}</span>
                          </td>
                          <td className="px-6 py-6 align-top text-[15px] text-gray-900">
                            {(tpl.items || []).length}
                          </td>
                          <td className="px-6 py-6 align-top text-gray-500">
                            <button
                              type="button"
                              className="rounded-md p-1 transition hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedChecklistTemplate(tpl);
                                setChecklistDetailOpen(true);
                              }}
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredChecklistLibrary.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                            No checklists yet. Click "Add Checklist" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {checklistDetailOpen && selectedChecklistTemplate && (
                <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
                  <div className="flex min-h-full items-center justify-center">
                  <div className="my-6 w-full max-w-3xl rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
                    <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{selectedChecklistTemplate.name || 'Checklist'}</h3>
                        <p className="mt-1 text-sm text-gray-500">{selectedChecklistTemplate.description || 'No description provided.'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setChecklistDetailOpen(false)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-6 py-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 text-sm font-bold text-gray-700">Checklist Details</div>
                        {[
                          ['Name', selectedChecklistTemplate.name || selectedChecklistTemplate.title],
                          ['Description', selectedChecklistTemplate.description],
                          ['Tasks', (selectedChecklistTemplate.items || []).length],
                          ['Created At', selectedChecklistTemplate.createdAt ? new Date(selectedChecklistTemplate.createdAt).toLocaleString() : '—'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <span className="text-sm font-semibold text-gray-600">{label}</span>
                            <span className="text-sm text-gray-900 text-right max-w-[60%]">{renderValue(value, '—')}</span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 text-sm font-bold text-gray-700">Preview Items</div>
                        <div className="space-y-3">
                          {(selectedChecklistTemplate.items || []).slice(0, 6).map((item, index) => (
                            <div key={item.id || index} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                              <div className="text-sm font-semibold text-gray-900">{item.text || `Item ${index + 1}`}</div>
                              <div className="mt-1 text-xs text-gray-500">{item.type || 'Status'}{item.meter ? ` | ${item.meter}` : ''}</div>
                            </div>
                          ))}
                          {(selectedChecklistTemplate.items || []).length === 0 && (
                            <div className="text-sm text-gray-500">No checklist items found.</div>
                          )}
                        </div>
                      </div>
                    </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(selectedChecklistTemplate.tags || []).map((tag, index) => (
                          <span key={`${tag}-${index}`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <Btn variant="outline" onClick={() => setChecklistDetailOpen(false)}>Close</Btn>
                        <Btn
                          variant="primary"
                          onClick={() => {
                            setChecklistDetailOpen(false);
                            openChecklistTemplateEditor(selectedChecklistTemplate);
                          }}
                        >
                          Edit Checklist
                        </Btn>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              )}

              {editingChecklistTemplate && (
                <div className="fixed inset-0 z-[95] overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
                  <div className="flex min-h-full items-center justify-center">
                  <div className="my-6 w-full max-w-4xl rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
                    <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Edit Checklist</h3>
                        <p className="mt-1 text-sm text-gray-500">Update checklist details and tasks.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingChecklistTemplate(null)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-6 py-6">
                    <div className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Checklist Name</label>
                          <input
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                            value={checklistEditForm.name}
                            onChange={(e) => setChecklistEditForm((prev) => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Tags</label>
                          <input
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                            value={(checklistEditForm.tags || []).join(', ')}
                            onChange={(e) => setChecklistEditForm((prev) => ({ ...prev, tags: String(e.target.value || '').split(/[;,|]/).map((tag) => tag.trim()).filter(Boolean) }))}
                            placeholder="Separate tags with commas"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
                        <textarea
                          className="min-h-[96px] w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                          value={checklistEditForm.description}
                          onChange={(e) => setChecklistEditForm((prev) => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Checklist Items</label>
                          <button
                            type="button"
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                            onClick={() => setChecklistEditForm((prev) => ({
                              ...prev,
                              items: [...(prev.items || []), { id: `${Date.now()}`, text: '', type: 'Status', meter: '', required: false }],
                            }))}
                          >
                            Add Item
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(checklistEditForm.items || []).map((item, index) => (
                            <div key={item.id || index} className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[1fr_180px_180px_auto]">
                              <input
                                className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                                placeholder={`Item ${index + 1}`}
                                value={item.text || ''}
                                onChange={(e) => setChecklistEditForm((prev) => ({
                                  ...prev,
                                  items: prev.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, text: e.target.value } : entry),
                                }))}
                              />
                              <select
                                className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                                value={item.type || 'Status'}
                                onChange={(e) => setChecklistEditForm((prev) => ({
                                  ...prev,
                                  items: prev.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, type: e.target.value } : entry),
                                }))}
                              >
                                {checklistTemplateTypeOptions.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              <input
                                className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                                placeholder="Meter name"
                                value={item.meter || ''}
                                onChange={(e) => setChecklistEditForm((prev) => ({
                                  ...prev,
                                  items: prev.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, meter: e.target.value } : entry),
                                }))}
                              />
                              <button
                                type="button"
                                className="rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                                onClick={() => setChecklistEditForm((prev) => ({
                                  ...prev,
                                  items: prev.items.filter((_, itemIndex) => itemIndex !== index),
                                }))}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                      <Btn variant="outline" onClick={() => setEditingChecklistTemplate(null)}>Cancel</Btn>
                      <Btn variant="primary" onClick={saveChecklistTemplateChanges} disabled={savingChecklistTemplate}>
                        {savingChecklistTemplate ? 'Saving...' : 'Save Changes'}
                      </Btn>
                    </div>
                  </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preventiveMaintenance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">Preventive Maintenance</div>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow hover:bg-blue-700" onClick={startNewPm}>Create PM</button>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {['Filters', 'Assigned To', 'Location', 'Priority'].map(label => (
                  <button key={label} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
                    <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                    {label}
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                ))}
                <button className="text-sm font-semibold text-blue-700">Reset Filters</button>
                <div className="flex items-center gap-2 text-sm text-gray-600 ml-auto">
                  <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Sort: Date Created</button>
                  <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Columns</button>
                  <div className="relative">
                    <input placeholder="Search" className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 w-48" />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
                      <th className="px-4 py-3 text-left font-bold">Name</th>
                      <th className="px-4 py-3 text-left font-bold">ID</th>
                      <th className="px-4 py-3 text-left font-bold">Work Order Title</th>
                      <th className="px-4 py-3 text-left font-bold">Work Order Description</th>
                      <th className="px-4 py-3 text-left font-bold">Image</th>
                      <th className="px-4 py-3 text-left font-bold">Assets & Locations</th>
                      <th className="px-4 py-3 text-left font-bold">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceSchedules.map((pm, idx) => (
                      <tr key={pm._id || pm.id || idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                        <td className="px-4 py-3 text-gray-800 font-semibold">{pm.name || pm.title || 'Preventive Item'}</td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{String(pm._id || pm.id || '').slice(0, 10)}...</td>
                        <td className="px-4 py-3 text-gray-800">{pm.workOrderTitle || pm.title || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{pm.description || pm.workOrderDescription || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{pm.assetsCount || pm.locationsCount || pm.assets?.length || 1}</td>
                        <td className="px-4 py-3 text-gray-700">{pm.category || 'Preventive'}</td>
                      </tr>
                    ))}
                    {maintenanceSchedules.length === 0 && (
                      <tr><td colSpan={8} className="text-center text-gray-500 py-8">No preventive maintenance items</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <CreatePmModal
            key={`pm-${pmSessionId}`}
            open={showCreatePm}
            onClose={() => setShowCreatePm(false)}
            onAddWorkOrderDetails={() => setShowWorkOrderDetails(true)}
            onAddCalendar={() => setShowCalendarSchedule(true)}
            onAddMeter={() => setShowMeterSchedule(true)}
            onAddCombined={() => setShowCombinedSchedule(true)}
            onCreated={async () => {
              await refreshSchedules();
              setShowCreatePm(false);
            }}
            pmTasks={pmTasks}
            checklist={pmChecklist}
            workOrderDetails={pmWorkOrder}
            setWorkOrderDetails={setPmWorkOrder}
            scheduleConfig={pmSchedule}
          />
          <WorkOrderDetailsModal
            open={showWorkOrderDetails}
            onClose={() => {
              setShowWorkOrderDetails(false);
              setLaunchChecklistBuilderFromMain(false);
            }}
            tasks={pmTasks}
            setTasks={setPmTasks}
            workOrderDetails={pmWorkOrder}
            setWorkOrderDetails={setPmWorkOrder}
            checklist={pmChecklist}
            setChecklist={setPmChecklist}
            checklistLibrary={pmChecklistLibrary}
            setChecklistLibrary={setPmChecklistLibrary}
            companyAssets={assets}
            onChecklistSaved={refreshChecklists}
            launchChecklistBuilderDirect={launchChecklistBuilderFromMain}
          />
          <CalendarScheduleModal
            resetKey={pmSessionId}
            open={showCalendarSchedule}
            onClose={() => setShowCalendarSchedule(false)}
            scheduleConfig={pmSchedule}
            setScheduleConfig={setPmSchedule}
          />
          <MeterScheduleModal open={showMeterSchedule} onClose={() => setShowMeterSchedule(false)} />
          <CombinedScheduleModal open={showCombinedSchedule} onClose={() => setShowCombinedSchedule(false)} />
          {activeTab === 'scheduler' && (
            <ClientSchedulerTab issues={workOrders} technicians={allWorkers} />
          )}

          {activeTab === 'files' && (
            <PlaceholderPanel
              title={t("manager.sidebar.files")}
              description="Centralized files and documents will show here."
            />
          )}

          {activeTab === 'vendors' && <ClientContactsTab type="vendor" />}
          {activeTab === 'customers' && <ClientContactsTab type="customer" />}

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
                <div className="glass-surface rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-[1000px] w-full text-left border-collapse text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-600">
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
                          const workOrderStatus = getWorkOrderDisplayStatus(issue);
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
                                <StatusBadge status={workOrderStatus} />
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
                                  <button onClick={(e) => { e.stopPropagation(); setModalData({ open: true, type: 'issue', item: issue }); }} className="p-2 hover:bg-blue-100 rounded-lg transition-colors" title="Open details">
                                    <Eye className="w-4 h-4 text-blue-600" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); openCommentModal(issue); }} className="p-2 hover:bg-indigo-100 rounded-lg transition-colors" title="Open comments">
                                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openPrivateMessageComposer({
                                        recipientUserId: issue.assignedTo,
                                        recipientName: getAssignedName(issue),
                                        link: `/client-dashboard?id=${issue._id || issue.id}`
                                      });
                                    }}
                                    className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                                    title="Private message"
                                  >
                                    <Send className="w-4 h-4 text-emerald-600" />
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Requests</h2>
                    <p className="text-gray-600">Review submitted requests and follow their work order progress</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleNewRequest}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700"
                    >
                      Submit Request
                    </button>
                    <div className="px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                      <span className="text-orange-700 font-semibold">{pendingRequests.length} total</span>
                    </div>
                  </div>
                </div>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="glass-surface rounded-xl p-12 text-center border border-gray-200">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">All Clear!</h3>
                  <p className="text-gray-600 mb-6">No requests to review</p>
                </div>
              ) : (
                <div className="glass-surface rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-[1200px] w-full text-left border-collapse text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-600">
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
                      <tbody className="divide-y divide-gray-100 bg-white">
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
                              className="hover:bg-gray-50 transition-all cursor-pointer group/row"
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
                      <Td key="b">{p.beds ?? '?'}</Td>,
                      <Td key="ba">{p.baths ?? '?'}</Td>,
                      <Td key="ar">{p.area ?? p.sqft ?? '?'}</Td>,
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
                rows={assets.map(asset => ({
                  onClick: () => { setSelectedAsset(asset); setAssetModalOpen(true); },
                  cells: [
                  <Td key="n">
                    <span style={{ fontWeight: 600, color: '#111827' }}>{asset.name}</span>
                  </Td>,
                  <Td key="t"><span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{asset.type}</span></Td>,
                  <Td key="q"><span style={{ fontWeight: 700 }}>{asset.quantity || 1}</span></Td>,
                  <Td key="p">{renderValue(asset.property?.name)}</Td>,
                  <Td key="bu">{renderValue(asset.building || asset.location?.building)}</Td>,
                  <Td key="ro">{renderValue(asset.room || asset.location?.room)}</Td>,
                  <Td key="bl">{renderValue(asset.blocks || asset.block || asset.location?.block)}</Td>,
                  <Td key="d"><span style={{ color: '#9CA3AF' }}>{renderValue(asset.description)}</span></Td>,
                  <Td key="x">
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); startEditingAsset(asset); }}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={async (e) => {
                        e.stopPropagation();
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
                ]}))}
              />

              {assetModalOpen && selectedAsset && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
                    <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{selectedAsset.name || 'Asset'}</h3>
                        <p className="mt-1 text-sm text-gray-500">{selectedAsset.property?.name || 'No location assigned'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAssetModalOpen(false)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 text-sm font-bold text-gray-700">Asset Information</div>
                        {[
                          ['Name', selectedAsset.name],
                          ['Type', selectedAsset.type],
                          ['Quantity', selectedAsset.quantity || 1],
                          ['Description', selectedAsset.description],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <span className="text-sm font-semibold text-gray-600">{label}</span>
                            <span className="text-sm text-gray-900 text-right max-w-[60%]">{renderValue(value, '—')}</span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 text-sm font-bold text-gray-700">Location Details</div>
                        {[
                          ['Property', selectedAsset.property?.name],
                          ['Building', selectedAsset.building || selectedAsset.location?.building],
                          ['Room', selectedAsset.room || selectedAsset.location?.room],
                          ['Block', selectedAsset.blocks || selectedAsset.block || selectedAsset.location?.block],
                          ['Created At', selectedAsset.createdAt ? new Date(selectedAsset.createdAt).toLocaleString() : '—'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <span className="text-sm font-semibold text-gray-600">{label}</span>
                            <span className="text-sm text-gray-900 text-right max-w-[60%]">{renderValue(value, '—')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                      <Btn variant="outline" onClick={() => setAssetModalOpen(false)}>Close</Btn>
                      <Btn
                        variant="primary"
                        onClick={() => {
                          setAssetModalOpen(false);
                          startEditingAsset(selectedAsset);
                        }}
                      >
                        Edit Asset
                      </Btn>
                    </div>
                  </div>
                </div>
              )}
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
                  <Td key="r"><span style={{ color: '#F59E0B', fontWeight: 700 }}>? {tech.rating || 0}</span></Td>,
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
          {false && activeTab === 'maintenanceTemplates' && (
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

          {activeTab === 'imports' && <ImportExportPanel />}

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
                checklistTemplates={pmChecklistLibrary}
                companyProperties={properties}
                companyAssets={assets}
                companyTechnicians={internalTechnicians}
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
        people={people}
        onPrivateMessage={openPrivateMessageComposer}
      />
      <CommentModal
        open={commentModal.open}
        item={commentModal.item}
        userName={userName}
        people={people}
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
  const [showDetails, setShowDetails] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [selectedPo, setSelectedPo] = React.useState(null);
  const [editingId, setEditingId] = React.useState(null);
  const [form, setForm] = React.useState({
    title: '',
    vendor: '',
    vendorId: '',
    expectedDate: '',
    purchaseDate: '',
    shippingMethod: '',
    terms: '',
    fobShippingPoint: '',
    category: '',
    additionalDetails: '',
    requisitioner: '',
    shippingCompanyName: '',
    shippingAddress: '',
    shippingPhone: '',
    shippingFax: '',
    requesterCompanyName: '',
    requesterAddress: '',
    requesterPhone: '',
    requesterFax: '',
    itemName: '',
    quantity: 1,
    unitCost: 0,
    poNumber: ''
  });
  React.useEffect(() => {
    if (selectedPo) setShowDetails(true);
  }, [selectedPo]);
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
  const resetForm = () => setForm({
    title: '', vendor: '', vendorId: '', expectedDate: '', purchaseDate: '', shippingMethod: '', terms: '', fobShippingPoint: '', category: '', additionalDetails: '', requisitioner: '', shippingCompanyName: '', shippingAddress: '', shippingPhone: '', shippingFax: '', requesterCompanyName: '', requesterAddress: '', requesterPhone: '', requesterFax: '', itemName: '', quantity: 1, unitCost: 0, poNumber: ''
  });
  const openPoEditor = (po) => {
    setForm({
      title: po?.title || '',
      vendor: po?.vendor?.name || po?.vendor || po?.vendorDetails?.name || '',
      vendorId: po?.vendorId?._id || po?.vendorId || '',
      expectedDate: formatDateForInput(po?.expectedDate),
      purchaseDate: formatDateForInput(po?.purchaseDate || po?.createdAt),
      shippingMethod: po?.shippingMethod || '',
      terms: po?.terms || '',
      fobShippingPoint: po?.fobShippingPoint || '',
      category: po?.category || '',
      additionalDetails: po?.additionalDetails || po?.notes || '',
      requisitioner: po?.requisitioner || '',
      shippingCompanyName: po?.shipping?.name || po?.billing?.companyName || '',
      shippingAddress: po?.shipping?.address || '',
      shippingPhone: po?.shipping?.phone || '',
      shippingFax: po?.billing?.fax || '',
      requesterCompanyName: po?.billing?.companyName || '',
      requesterAddress: po?.billing?.address || '',
      requesterPhone: po?.billing?.phone || '',
      requesterFax: po?.billing?.fax || '',
      itemName: po?.items?.[0]?.name || '',
      quantity: po?.items?.[0]?.quantity || 1,
      unitCost: po?.items?.[0]?.unitCost || po?.items?.[0]?.cost || 0,
      poNumber: po?.poNumber || ''
    });
    setEditingId(getPoRouteId(po));
    setShowAdd(true);
    setShowDetails(false);
  };
  const updatePoStatus = async (po, status) => {
    const id = getPoRouteId(po);
    if (!id) return alert('Purchase order id not found');
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
      const payload = {
        title: form.title,
        vendor: form.vendor || vendors.find(v => String(v._id || v.id) === String(form.vendorId))?.name,
        vendorId: form.vendorId || undefined,
        expectedDate: form.expectedDate || undefined,
        purchaseDate: form.purchaseDate || undefined,
        shippingMethod: form.shippingMethod || '',
        terms: form.terms || '',
        fobShippingPoint: form.fobShippingPoint || '',
        category: form.category || '',
        additionalDetails: form.additionalDetails || '',
        requisitioner: form.requisitioner || '',
        billing: {
          companyName: form.requesterCompanyName || '',
          address: form.requesterAddress || '',
          phone: form.requesterPhone || '',
          fax: form.requesterFax || form.shippingFax || ''
        },
        shipping: {
          name: form.shippingCompanyName || '',
          address: form.shippingAddress || '',
          phone: form.shippingPhone || ''
        },
        poNumber: form.poNumber || `PO-${Date.now()}`,
        notes: form.additionalDetails || '',
        items: form.itemName ? [{ name: form.itemName, quantity: Number(form.quantity) || 1, unitCost: Number(form.unitCost) || 0 }] : []
      };
      let res;
      if (editingId) {
        res = await api.put(`/api/purchase-orders/${editingId}`, payload);
        setOrders(prev => (prev || []).map(o => (getPoRouteId(o) === editingId ? res.data : o)));
      } else {
        res = await api.post('/api/purchase-orders', payload);
        setOrders(prev => [res.data, ...(prev || [])]);
      }
      setSelectedPo(res.data);
      resetForm();
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
          <button onClick={() => setShowAdd(s => !s)} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">
            {showAdd ? 'Close' : 'New PO'}
          </button>
          <button onClick={exportCSV} className="px-3 py-2 glass-ghost rounded-xl text-sm font-semibold hover:bg-white/70">Export CSV</button>
        </div>
      </div>
      {showAdd && (
        <form onSubmit={savePo} className="glass-surface rounded-lg border border-white/10 p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" required /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">PO Number</label><input value={form.poNumber || ''} onChange={e => setForm(f => ({ ...f, poNumber: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Auto if blank" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Vendor</label><select value={form.vendorId} onChange={e => setForm(f => ({ ...f, vendorId: e.target.value, vendor: '' }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="">Select vendor…</option>{vendors.map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>)}</select><input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value, vendorId: '' }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm mt-2" placeholder="Or enter new vendor name" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Expected Date</label><input type="date" value={form.expectedDate} onChange={e => setForm(f => ({ ...f, expectedDate: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Purchase Date</label><input type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Category</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="None" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Item</label><input value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Optional" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Quantity</label><input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) || 1 }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Unit Cost</label><input type="number" step="0.01" value={form.unitCost} onChange={e => setForm(f => ({ ...f, unitCost: Number(e.target.value) || 0 }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Shipping Method</label><input value={form.shippingMethod} onChange={e => setForm(f => ({ ...f, shippingMethod: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="None" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Terms</label><input value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="None" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">F.O.B. Shipping Point</label><input value={form.fobShippingPoint} onChange={e => setForm(f => ({ ...f, fobShippingPoint: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="None" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Requisitioner</label><input value={form.requisitioner} onChange={e => setForm(f => ({ ...f, requisitioner: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Requisitioner" /></div>
          <div className="col-span-full mt-2 text-sm font-bold text-gray-900">Shipping Information</div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Company Name</label><input value={form.shippingCompanyName} onChange={e => setForm(f => ({ ...f, shippingCompanyName: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="—" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Address</label><input value={form.shippingAddress} onChange={e => setForm(f => ({ ...f, shippingAddress: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="—" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Phone Number</label><input value={form.shippingPhone} onChange={e => setForm(f => ({ ...f, shippingPhone: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="—" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Fax</label><input value={form.shippingFax} onChange={e => setForm(f => ({ ...f, shippingFax: e.target.value, requesterFax: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="None" /></div>
          <div className="col-span-full mt-2 text-sm font-bold text-gray-900">Requester Information</div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Company Name</label><input value={form.requesterCompanyName} onChange={e => setForm(f => ({ ...f, requesterCompanyName: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="—" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Address</label><input value={form.requesterAddress} onChange={e => setForm(f => ({ ...f, requesterAddress: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="—" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Phone Number</label><input value={form.requesterPhone} onChange={e => setForm(f => ({ ...f, requesterPhone: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="—" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Fax</label><input value={form.requesterFax} onChange={e => setForm(f => ({ ...f, requesterFax: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="None" /></div>
          <div className="col-span-full flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Additional Details / Notes</label><textarea value={form.additionalDetails} onChange={e => setForm(f => ({ ...f, additionalDetails: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[96px]" placeholder="None" /></div>
          <div className="col-span-full flex items-center gap-2 justify-end"><button type="button" onClick={() => { setShowAdd(false); setEditingId(null); resetForm(); }} className="px-3 py-2 text-sm border rounded-lg">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">{saving ? 'Saving...' : editingId ? 'Update PO' : 'Create PO'}</button></div>
        </form>
      )}
      <div className="glass-surface rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100"><tr>{['Title', 'PO Number', '# Items', 'Total Cost', 'Vendor', 'Actions'].map(h => <th key={h} className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {orders.map((o, idx) => (
                <tr key={o._id || o.id || `po-${idx}`} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedPo && getPoRouteId(selectedPo) === getPoRouteId(o) ? 'bg-blue-50/60' : ''}`} onClick={() => { setSelectedPo(o); setShowDetails(true); }}>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900">{o.title || o.name || 'PO'}</td>
                  <td className="py-4 px-4 text-sm font-mono text-gray-600">{o.poNumber || o.number || '—'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{Array.isArray(o.items) ? o.items.length : (o.itemsCount || '—')}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{o.totalCost ? `$${Number(o.totalCost).toFixed(2)}` : '—'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{o.vendor?.name || o.vendor || '—'}</td>
                  <td className="py-4 px-4 text-right"><button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg" onClick={(e) => { e.stopPropagation(); setSelectedPo(o); setShowDetails(true); }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button></td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="6" className="py-20 text-center text-gray-500">No purchase orders found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {selectedPo && showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><div><p className="text-xs uppercase font-bold text-gray-400">Purchase Order</p><h3 className="text-lg font-bold text-gray-900">#{selectedPo.poNumber || selectedPo.number || '—'} / {selectedPo.title || 'Untitled PO'}</h3><p className="text-sm text-gray-500">Status: {selectedPo.status || 'Pending'}</p></div><div className="flex items-center gap-2"><button className="px-3 py-2 text-sm border rounded-lg" onClick={() => setShowDetails(false)}>Close</button><button className="px-3 py-2 text-sm border rounded-lg" onClick={() => openPoEditor(selectedPo)}>Edit</button><button className="px-3 py-2 text-sm bg-rose-500 text-white rounded-lg" onClick={() => updatePoStatus(selectedPo, 'DECLINED')}>Decline</button><button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg" onClick={() => updatePoStatus(selectedPo, 'APPROVED')}>Approve</button></div></div>
            <div className="border-b border-gray-100 px-6"><div className="flex items-center gap-8 text-sm font-semibold text-gray-500"><button type="button" className="py-4 border-b-2 border-blue-600 text-gray-900">Details</button><button type="button" className="py-4">Activity</button><button type="button" className="py-4">Files</button></div></div>
            <div className="p-6 grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_320px] gap-6">
              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 overflow-hidden"><div className="px-6 py-4 bg-gray-50 text-lg font-bold text-gray-900">Shipping Information</div><div className="divide-y divide-gray-100 text-sm"><div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Company Name</span><span className="font-medium text-gray-900">{selectedPo.shipping?.name || selectedPo.billing?.companyName || selectedPo.vendorDetails?.name || selectedPo.vendor?.name || selectedPo.vendor || '—'}</span></div><div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Address</span><span className="font-medium text-gray-900">{selectedPo.shipping?.address || selectedPo.billing?.address || renderValue(selectedPo.address, '—')}</span></div><div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Phone Number</span><span className="font-medium text-gray-900">{selectedPo.shipping?.phone || selectedPo.billing?.phone || selectedPo.vendorDetails?.phone || '—'}</span></div><div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Fax</span><span className="font-medium text-gray-900">{selectedPo.billing?.fax || 'None'}</span></div></div></div>
                <div className="rounded-2xl border border-gray-200 overflow-hidden"><div className="px-6 py-4 bg-gray-50 text-lg font-bold text-gray-900">Line Items</div><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 text-xs font-bold text-gray-600"><tr><th className="py-3 px-4">Item</th><th className="py-3 px-4">Cost</th><th className="py-3 px-4">Qty</th><th className="py-3 px-4 text-right">Total</th></tr></thead><tbody className="text-sm">{(selectedPo.items || []).map((item, idx) => { const qty = Number(item.quantity) || 0; const cost = Number(item.unitCost || item.cost) || 0; return (<tr key={idx} className="border-t border-gray-100"><td className="py-3 px-4"><div className="font-semibold text-gray-900">{item.name || 'Item'}</div>{item.description && <div className="text-xs text-gray-500 mt-1">{item.description}</div>}</td><td className="py-3 px-4 text-gray-700">${cost.toFixed(2)}</td><td className="py-3 px-4 text-gray-700">{qty}</td><td className="py-3 px-4 text-right font-bold text-gray-900">${(qty * cost).toFixed(2)}</td></tr>); })}{(selectedPo.items || []).length === 0 && (<tr><td colSpan={4} className="py-8 text-center text-gray-400">No items</td></tr>)}</tbody></table></div></div>
                <div className="rounded-2xl border border-gray-200 overflow-hidden"><div className="px-6 py-4 bg-gray-50 text-lg font-bold text-gray-900">Additional Details</div><div className="divide-y divide-gray-100 text-sm"><div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Purchase Date</span><span className="font-medium text-gray-900">{formatDate(selectedPo.purchaseDate || selectedPo.createdAt)}</span></div><div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Shipping Method</span><span className="font-medium text-gray-900">{selectedPo.shippingMethod || 'None'}</span></div><div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Terms</span><span className="font-medium text-gray-900">{selectedPo.terms || 'None'}</span></div><div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">F.O.B. Shipping Point</span><span className="font-medium text-gray-900">{selectedPo.fobShippingPoint || 'None'}</span></div><div className="grid grid-cols-2 gap-4 px-6 py-5"><span className="text-gray-500">Notes</span><span className="font-medium text-gray-900">{selectedPo.notes || selectedPo.additionalDetails || 'None'}</span></div></div></div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white"><div className="p-6 space-y-5"><div className="flex items-center justify-between gap-4"><span className="text-gray-500">Status</span><span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${requestStatusColor(selectedPo.status || 'PENDING')}`}>{String(selectedPo.status || 'Pending').replace(/_/g, ' ')}</span></div><div className="flex items-center justify-between gap-4"><span className="text-gray-500">Vendor</span><span className="font-medium text-gray-900 text-right">{selectedPo.vendor?.name || selectedPo.vendorDetails?.name || selectedPo.vendor || '—'}</span></div><div className="flex items-center justify-between gap-4"><span className="text-gray-500">Due Date</span><span className="font-medium text-gray-900 text-right">{formatDate(selectedPo.expectedDate)}</span></div><div className="flex items-center justify-between gap-4"><span className="text-gray-500">Added By</span><span className="font-medium text-gray-900 text-right">{selectedPo.createdBy?.name || selectedPo.createdBy?.email || '—'}</span></div><div className="flex items-center justify-between gap-4"><span className="text-gray-500">Date Added</span><span className="font-medium text-gray-900 text-right">{formatDate(selectedPo.createdAt)}</span></div><div className="flex items-center justify-between gap-4"><span className="text-gray-500">Cost</span><span className="font-medium text-gray-900 text-right">${getPoTotal(selectedPo).toFixed(2)}</span></div><div className="flex items-center justify-between gap-4"><span className="text-gray-500">Category</span><span className="font-medium text-gray-900 text-right">{selectedPo.category || 'None'}</span></div><div className="border-t border-gray-100 pt-5"><div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 text-sm"><span className="text-gray-500">Additional Details</span><span className="font-medium text-gray-900">{selectedPo.notes || selectedPo.additionalDetails || 'None'}</span></div></div></div><div className="border-t border-gray-100 p-6"><h4 className="text-lg font-bold text-gray-900 mb-5">Requester Information</h4><div className="space-y-5 text-sm"><div className="flex items-start justify-between gap-4"><span className="text-gray-500">Requisitioner</span><span className="font-medium text-gray-900 text-right">{selectedPo.requisitioner || selectedPo.createdBy?.name || 'Requisitioner'}</span></div><div className="flex items-start justify-between gap-4"><span className="text-gray-500">Company Name</span><span className="font-medium text-gray-900 text-right">{selectedPo.billing?.companyName || selectedPo.shipping?.name || '—'}</span></div><div className="flex items-start justify-between gap-4"><span className="text-gray-500">Address</span><span className="font-medium text-gray-900 text-right">{selectedPo.billing?.address || selectedPo.shipping?.address || '—'}</span></div><div className="flex items-start justify-between gap-4"><span className="text-gray-500">Phone Number</span><span className="font-medium text-gray-900 text-right">{selectedPo.billing?.phone || selectedPo.shipping?.phone || '—'}</span></div><div className="flex items-start justify-between gap-4"><span className="text-gray-500">Fax</span><span className="font-medium text-gray-900 text-right">{selectedPo.billing?.fax || '—'}</span></div></div></div></div>
            </div>
          </div>
        </div>
      )}
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
    currency: 'rwf',
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

const ClientContactsTab = ({ type = 'vendor' }) => {
  const [entries, setEntries] = useState([]);
  const fileRef = useRef(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [creatingEntry, setCreatingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
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
        ...vendorItems.map((item) => normalizeEntry(item, 'vendor')),
        ...clientItems.map((item) => normalizeEntry(item, 'client')),
        ...userItems.map((item) => normalizeEntry(item, 'user')),
      ];
      if (mounted) setEntries(merged);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredEntries = (entries || []).filter((entry) => {
    const label = (entry.__typeLabel || entry.type || entry.role || '').toLowerCase();
    if (type === 'vendor') return label.includes('vendor');
    return label.includes('customer') || label.includes('client') || label.includes('requestor');
  });
  const selection = useBulkSelection(filteredEntries, (entry) => entry._id || entry.id);

  const resetEntryForm = () => {
    setNewEntry({
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
  };

  const exportCSV = () => {
    if (!filteredEntries.length) return;
    const keys = ['id', 'name', 'type', 'address', 'phone', 'contact', 'email'];
    const rows = filteredEntries.map((entry) => ({
      id: entry._id || entry.id || '',
      name: entry.name || entry.company || entry.fullName || '',
      type: entry.__typeLabel || entry.type || entry.role || '',
      address: entry.address || entry.street || '',
      phone: entry.phone || entry.phoneNumber || '',
      contact: entry.contactName || entry.contact || '',
      email: entry.email || ''
    }));
    const csv = [keys.join(',')].concat(rows.map((row) => keys.map((key) => (`"${String(row[key] ?? '').replace(/"/g, '""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type === 'vendor' ? 'vendors' : 'customers'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const headers = ['name', 'address', 'phone', 'contactName', 'email', 'type'];
    const sample = ['Acme Supplies', '123 Main St', '+1-555-0100', 'Jane Doe', 'jane@acme.com', type];
    const csv = [headers.join(','), sample.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type === 'vendor' ? 'vendors' : 'customers'}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rows = parseCsvText(reader.result || '');
        if (!rows.length) {
          alert('No rows found in CSV');
          return;
        }
        const itemsPayload = rows.map((row) => ({
          name: row.name || row.company || row.vendor || '',
          address: row.address || row.street || '',
          phone: row.phone || row.phonenumber || '',
          contactName: row.contact || row.contactname || '',
          email: row.email || '',
          type: row.type || row.category || type
        })).filter((item) => item.name);
        const endpoint = type === 'vendor' ? '/api/vendors/bulk' : '/api/clients/bulk';
        const res = await api.post(endpoint, { items: itemsPayload });
        const created = (res.data || []).map((item) => normalizeEntry(item, type === 'vendor' ? 'vendor' : 'client'));
        setEntries((prev) => [...created, ...(prev || [])]);
        alert(`Imported ${itemsPayload.length} ${type === 'vendor' ? 'vendors' : 'customers'}`);
      } catch (err) {
        console.error('Failed to import vendors/customers', err);
        alert('Failed to import vendors/customers: ' + (err.response?.data?.error || err.message));
      } finally {
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.name.trim()) {
      alert('Please enter a name');
      return;
    }
    try {
      setCreatingEntry(true);
      const payload = {
        name: newEntry.name,
        address: newEntry.address,
        phone: newEntry.phone,
        contactName: newEntry.contact,
        email: newEntry.email,
        type: newEntry.type,
        description: newEntry.description,
        website: newEntry.website,
        hourlyRate: newEntry.hourlyRate,
        isLocationBased: newEntry.isLocationBased,
        billing: type === 'customer' ? {
          name: newEntry.billingName,
          address1: newEntry.billingAddress1,
          address2: newEntry.billingAddress2,
          address3: newEntry.billingAddress3,
          currency: newEntry.currency
        } : undefined,
        customFields: type === 'customer'
          ? (newEntry.customFields || []).filter((field) => field.name || field.value)
          : undefined
      };

      let created;
      try {
        const res = await api.post(type === 'vendor' ? '/api/vendors' : '/api/clients', payload);
        created = res.data;
      } catch {
        const res = await api.post(type === 'vendor' ? '/api/clients' : '/api/vendors', payload);
        created = res.data;
      }

      setEntries((prev) => [normalizeEntry(created, type === 'vendor' ? 'vendor' : 'client'), ...(prev || [])]);
      setShowAddEntry(false);
      resetEntryForm();
      alert(`${type === 'vendor' ? 'Vendor' : 'Customer'} added successfully`);
    } catch (err) {
      console.error('Failed to add vendor/customer', err);
      alert('Failed to add vendor/customer: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreatingEntry(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    const selectedItems = filteredEntries.filter((entry) => selection.selectedIds.includes(String(entry._id || entry.id)));
    const deletableItems = selectedItems.filter((entry) => entry.__source !== 'user');
    const blockedItems = selectedItems.filter((entry) => entry.__source === 'user');

    if (blockedItems.length > 0) {
      alert(`Skipping ${blockedItems.length} user account(s). Delete users from the Users module.`);
    }
    if (!deletableItems.length) return;
    if (!window.confirm(`Delete ${deletableItems.length} ${type === 'vendor' ? 'vendor' : 'customer'} record(s)? This cannot be undone.`)) return;

    try {
      for (const item of deletableItems) {
        const id = item._id || item.id;
        try {
          await api.delete(`/api/vendors/${id}`);
        } catch {
          await api.delete(`/api/clients/${id}`);
        }
      }
      const removedIds = new Set(deletableItems.map((item) => String(item._id || item.id)));
      setEntries((prev) => (prev || []).filter((entry) => !removedIds.has(String(entry._id || entry.id))));
      selection.clear();
    } catch (err) {
      console.error('Failed to delete vendors/customers', err);
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
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
          <button onClick={downloadTemplate} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Download Template</button>
          <button onClick={() => setShowAddEntry(true)} className="px-3 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold">
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
              {filteredEntries.map((entry, idx) => (
                <tr key={entry._id || entry.id || `entry-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selection.selectedIds.includes(String(entry._id || entry.id))}
                      onChange={() => selection.toggleOne(entry._id || entry.id)}
                    />
                  </td>
                  <td className="py-4 px-4">{entry.name || entry.company || 'Unnamed'}</td>
                  <td className="py-4 px-4">{entry.address || entry.street || 'N/A'}</td>
                  <td className="py-4 px-4">{entry.phone || entry.phoneNumber || 'N/A'}</td>
                  <td className="py-4 px-4">{entry.contactName || entry.contact || 'N/A'}</td>
                  <td className="py-4 px-4">{entry.email || 'N/A'}</td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <p className="text-gray-500">No {type === 'vendor' ? 'vendors' : 'customers'} found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form onSubmit={handleCreateEntry} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{type === 'vendor' ? 'Create Vendor' : 'Create Customer'}</h3>
              <button type="button" onClick={() => setShowAddEntry(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Name / Company" value={newEntry.name} onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })} />
              <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Address" value={newEntry.address} onChange={(e) => setNewEntry({ ...newEntry, address: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Phone" value={newEntry.phone} onChange={(e) => setNewEntry({ ...newEntry, phone: e.target.value })} />
                <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Contact Name" value={newEntry.contact} onChange={(e) => setNewEntry({ ...newEntry, contact: e.target.value })} />
              </div>
              <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Email" value={newEntry.email} onChange={(e) => setNewEntry({ ...newEntry, email: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Type" value={newEntry.type} onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })} />
                <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Website" value={newEntry.website} onChange={(e) => setNewEntry({ ...newEntry, website: e.target.value })} />
              </div>
              <textarea className="w-full border border-gray-200 rounded-lg p-2 text-sm min-h-[90px]" placeholder="Description" value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <span className="px-3 text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className="flex-1 p-2 text-sm outline-none"
                    placeholder="Hourly Rate"
                    value={newEntry.hourlyRate}
                    onChange={(e) => setNewEntry({ ...newEntry, hourlyRate: e.target.value })}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={newEntry.isLocationBased}
                    onChange={(e) => setNewEntry({ ...newEntry, isLocationBased: e.target.checked })}
                  />
                  Is Location Based
                </label>
              </div>

              {type === 'customer' && (
                <div className="mt-4 space-y-4">
                  <div className="text-sm font-semibold text-gray-800">Billing Information</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Billing Name" value={newEntry.billingName} onChange={(e) => setNewEntry({ ...newEntry, billingName: e.target.value })} />
                    <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Address" value={newEntry.billingAddress1} onChange={(e) => setNewEntry({ ...newEntry, billingAddress1: e.target.value })} />
                    <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Address Line 2" value={newEntry.billingAddress2} onChange={(e) => setNewEntry({ ...newEntry, billingAddress2: e.target.value })} />
                    <input className="w-full border border-gray-200 rounded-lg p-2 text-sm" placeholder="Address Line 3" value={newEntry.billingAddress3} onChange={(e) => setNewEntry({ ...newEntry, billingAddress3: e.target.value })} />
                    <select className="w-full border border-gray-200 rounded-lg p-2 text-sm" value={newEntry.currency} onChange={(e) => setNewEntry({ ...newEntry, currency: e.target.value })}>
                      <option value="USD">USD - United States Dollar - $</option>
                      <option value="EUR">EUR - Euro - EUR</option>
                      <option value="GBP">GBP - British Pound - GBP</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-800">Custom Data</div>
                      <button
                        type="button"
                        onClick={() => setNewEntry((prev) => ({ ...prev, customFields: [...(prev.customFields || []), { name: '', value: '' }] }))}
                        className="text-blue-600 text-sm font-semibold"
                      >
                        Add Custom Field
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(newEntry.customFields || []).map((field, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">Field Name</label>
                            <input
                              value={field.name}
                              onChange={(e) => setNewEntry((prev) => {
                                const next = [...(prev.customFields || [])];
                                next[idx] = { ...next[idx], name: e.target.value };
                                return { ...prev, customFields: next };
                              })}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">Value</label>
                            <input
                              value={field.value}
                              onChange={(e) => setNewEntry((prev) => {
                                const next = [...(prev.customFields || [])];
                                next[idx] = { ...next[idx], value: e.target.value };
                                return { ...prev, customFields: next };
                              })}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                          <div className="text-right">
                            {(newEntry.customFields || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => setNewEntry((prev) => ({ ...prev, customFields: prev.customFields.filter((_, index) => index !== idx) }))}
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
              <button type="button" onClick={() => setShowAddEntry(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={creatingEntry} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                {creatingEntry ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
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
          { label: 'Total Issues', value: allIssues.length, color: 'from-blue-50 to-indigo-50 border-blue-100' },
          { label: 'Resolved', value: resolved, color: 'from-emerald-50 to-green-50 border-emerald-100' },
          { label: 'Pending', value: pending, color: 'from-amber-50 to-yellow-50 border-amber-100' },
          { label: 'Overdue', value: overdue, color: 'from-rose-50 to-pink-50 border-rose-100' },
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

// ── Scheduler (client) copied from Manager ───────────────────────────────────
const ClientSchedulerTab = ({ issues = [], technicians = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('Day');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUnscheduled, setShowUnscheduled] = useState(true);
  const [schedulerPopover, setSchedulerPopover] = useState(null);
  const [unscheduledFilters, setUnscheduledFilters] = useState({ status: [], priority: [] });

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

  const timeSlots = ["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"];
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

  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const handlePrevDate = () => setCurrentDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 1); return nd; });
  const handleNextDate = () => setCurrentDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 1); return nd; });
  const handleToday = () => setCurrentDate(new Date());

  return (
    <div className="flex flex-col gap-8 bg-transparent min-h-screen glass-theme-blue">
      {/* Scheduler Controls */}
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-gray-900">Scheduler</div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button onClick={() => setCurrentPage(1)} className="px-3 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Back to First</button>
          <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg bg-white">
            <span>Page {currentPage} / {totalPages}</span>
            <ChevronLeft className="w-4 h-4 text-gray-400 cursor-pointer" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
            <ChevronRight className="w-4 h-4 text-gray-400 cursor-pointer" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><SlidersHorizontal className="w-4 h-4 text-gray-500" /></button>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><Eye className="w-4 h-4 text-gray-500" /></button>
          <button onClick={() => setShowUnscheduled(!showUnscheduled)} className="px-3 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">{showUnscheduled ? 'Hide Section' : 'Show Section'}</button>
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700">
            <option>2 rows</option>
            <option>3 rows</option>
          </select>
          <button className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700">Smart Schedule</button>
        </div>
      </div>

      <section className="transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Unscheduled Work Orders</h2>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-bold">{filteredUnscheduled.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 hover:bg-white rounded transition-colors disabled:opacity-30">
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
              <span className="px-3 text-xs font-bold text-gray-600">Page {currentPage}/{totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 hover:bg-white rounded transition-colors disabled:opacity-30">
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
                              const newP = e.target.checked ? [...unscheduledFilters.priority, p] : unscheduledFilters.priority.filter(x => x !== p);
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
                  <button onClick={() => { setUnscheduledFilters({ status: [], priority: [] }); setSchedulerPopover(null); }} className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">
                    Reset
                  </button>
                </div>
              </FilterPopover>
            </div>

            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4 text-gray-400" />
            </button>
            <button onClick={() => setShowUnscheduled(!showUnscheduled)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
              {showUnscheduled ? 'Hide Section' : 'Show Section'}
            </button>
          </div>
        </div>

        {showUnscheduled && (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide animate-in fade-in slide-in-from-top-4 duration-300">
            {currentIssues.map((issue, idx) => {
              const statusChip = issue.status || 'Open';
              const assetChip = issue.assetName || issue.location || 'General';
              const typeChip = issue.category || issue.issueType || issue.priority || 'Task';
              const due = getIssueDueDate(issue);
              return (
                <div key={issue._id || issue.id || idx} className="min-w-[300px] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-gray-500">#{String(issue._id || issue.id).slice(-4).toUpperCase()}</span>
                    <button className="p-1 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{issue.title || 'Work Order'}</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-[11px] font-semibold rounded-full border bg-gray-50 text-gray-700">{statusChip}</span>
                    <span className="px-2 py-1 text-[11px] font-semibold rounded-full border bg-amber-50 text-amber-700">{assetChip}</span>
                    <span className="px-2 py-1 text-[11px] font-semibold rounded-full border bg-emerald-50 text-emerald-700">{typeChip}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-500">▮</span>
                      {due ? due.toLocaleDateString() : 'No date'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flag className={`w-3 h-3 ${getPriorityColor(issue.priority)} fill-current`} />
                      <span className="font-semibold text-gray-700">{issue.priority || 'None'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-semibold text-gray-700">{issue.expectedHours || '1'} hours</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredUnscheduled.length === 0 && (
              <div className="min-w-[280px] bg-white border border-dashed border-gray-200 rounded-xl p-4 text-center text-sm text-gray-500">
                No unscheduled work orders
              </div>
            )}
          </div>
        )}
      </section>

      {/* Team schedule grid */}
      <section className="transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Team Schedule</h2>
            <p className="text-sm text-gray-500">{formatDate(currentDate)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevDate} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50">Today</button>
            <button onClick={handleNextDate} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <select value={viewType} onChange={(e) => setViewType(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700">
              <option>Day</option>
              <option>Week</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-60 text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Team Members</th>
                {timeSlots.map(slot => (
                  <th key={slot} className="text-center px-4 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {technicians.map((tech, idx) => {
                const techIssues = scheduledForTech(tech);
                return (
                  <tr key={tech._id || tech.id || idx} className="border-b border-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                          {(tech.name || tech.fullName || 'T').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{tech.name || tech.fullName || 'Technician'}</div>
                          <div className="text-[11px] text-gray-500">{tech.role || tech.specialty?.join?.(', ') || '—'}</div>
                        </div>
                        <span className="ml-auto text-[11px] text-amber-500 font-bold">0%</span>
                        <span className="w-3 h-3 border border-gray-300 rounded-full inline-block"></span>
                      </div>
                    </td>
                    {timeSlots.map((slot, slotIdx) => {
                      const issueAtSlot = techIssues.find((iss) => {
                        const due = getIssueDueDate(iss);
                        if (!due) return false;
                        return due.getHours() === slotHourMap[slotIdx];
                      });
                      return (
                        <td key={slot} className="h-16 px-2 py-2 text-center align-middle">
                          {issueAtSlot ? (
                            <div className={`mx-auto max-w-[120px] p-2 rounded-lg border ${getPriorityPill(issueAtSlot.priority)} shadow-sm text-left`}>
                              <div className="text-[11px] font-bold text-gray-900 truncate">{issueAtSlot.title || 'Work Order'}</div>
                              <div className="text-[10px] text-gray-500 truncate">{issueAtSlot.location || issueAtSlot.assetName || 'Not specified'}</div>
                            </div>
                          ) : (
                            <div className="h-8 w-full bg-gray-50 rounded-md border border-gray-100"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {technicians.length === 0 && (
                <tr>
                  <td colSpan={1 + timeSlots.length} className="text-center py-8 text-sm text-gray-500">
                    No technicians yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const ImportExportPanel = () => {
  const [dataset, setDataset] = React.useState('Work Orders');
  const datasets = ['Work Orders', 'Assets', 'Properties', 'Technicians', 'Parts', 'Vendors', 'Customers'];
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Import Data</h1>
        <div className="max-w-md">
          <label className="block text-sm font-bold text-gray-700 mb-2">Data Set</label>
          <select value={dataset} onChange={(e) => setDataset(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 shadow-sm">
            {datasets.map(d => <option key={d}>{d}</option>)}
          </select>
          <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg px-4 py-3 shadow-sm">
            {`Start ${dataset} Import Process`}
          </button>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-wrap gap-4 text-sm font-semibold text-blue-700">
          <button className="hover:underline">Download Template</button>
          <button className="hover:underline">Export Current {dataset}</button>
          <button className="hover:underline">See Examples & Tutorials ↗</button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <span className="font-bold text-gray-700">Tip:</span> If you are assigning any people, teams, assets, locations, parts or purchase orders, ensure they are already created in your account.
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;

// --- Create PM Modal ---
// Placed after export for readability; component defined above return usage.
function CreatePmModal({ open, onClose, onAddWorkOrderDetails, onAddCalendar, onAddMeter, onAddCombined, onCreated, pmTasks, checklist = [], workOrderDetails, setWorkOrderDetails, scheduleConfig }) {
  const [showScheduleMenu, setShowScheduleMenu] = React.useState(false);
  const [assetRows, setAssetRows] = React.useState([{ id: 1, assetId: '', locationId: '', startDate: '', endDate: '', timezone: '(UTC+02:00) Africa/Kigali', assignee: '' }]);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState('');
  const imageFiles = Array.isArray(workOrderDetails?.imageFiles) ? workOrderDetails.imageFiles : [];
  const attachmentFiles = Array.isArray(workOrderDetails?.attachmentFiles) ? workOrderDetails.attachmentFiles : [];

  const addAssetRow = () => {
    setAssetRows((rows) => [...rows, { id: rows.length + 1, assetId: '', locationId: '', startDate: '', endDate: '', timezone: '(UTC+02:00) Africa/Kigali', assignee: '' }]);
  };

  const updateAssetRow = (idx, key, value) => {
    setAssetRows((rows) => rows.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  };

  const removeAssetRow = (idx) => {
    setAssetRows((rows) => rows.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    setError('');
    if (!workOrderDetails?.title?.trim()) {
      setError('Work order title is required.');
      return;
    }
    setCreating(true);
    try {
      const nextDate = assetRows[0]?.startDate || new Date().toISOString();
      const payload = {
        name: workOrderDetails.title || 'Preventive Maintenance',
        workOrderTitle: workOrderDetails.title,
        workOrderDescription: workOrderDetails.description,
        priority: workOrderDetails.priority,
        category: workOrderDetails.category,
        durationHours: workOrderDetails.durationHours ? Number(workOrderDetails.durationHours) : undefined,
        requiresSignature: !!workOrderDetails.requiresSignature,
        createFirstWorkOrder: !!workOrderDetails.createNow,
        tasks: pmTasks || [],
        checklist: checklist || [],
        assetsRows: assetRows,
        assetsCount: assetRows.length,
        timezone: assetRows[0]?.timezone,
        scheduleType: scheduleConfig?.scheduleType || 'calendar',
        calendarRule: scheduleConfig?.calendarRule || { every: 1, unit: 'day', time: '09:00', leadDays: 0 },
        nextDate,
        routine: true,
        status: 'Pending',
      };
      const hasUploads = imageFiles.length > 0 || attachmentFiles.length > 0;
      if (hasUploads) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (Array.isArray(value) || (typeof value === 'object' && !(value instanceof Date))) {
            formData.append(key, JSON.stringify(value));
            return;
          }
          formData.append(key, value instanceof Date ? value.toISOString() : String(value));
        });
        imageFiles.forEach((file) => formData.append('photos', file));
        attachmentFiles.forEach((file) => formData.append('files', file));
        await api.post('/api/maintenance-schedules', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/api/maintenance-schedules', payload);
      }
      if (typeof onCreated === 'function') await onCreated();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to create PM.');
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-auto py-10">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-6xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="text-xl font-bold text-gray-900">Untitled PM</div>
            <button className="text-sm text-blue-700 hover:underline">Edit</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-60"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? 'Creating…' : 'Create PM'}
            </button>
          </div>
        </div>
        {error && <div className="px-6 pt-2 text-sm text-rose-600 font-semibold">{error}</div>}

        <div className="grid grid-cols-2 gap-8 px-6 py-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Work Order details <span className="text-rose-500">*</span></h3>
            <p className="text-sm text-gray-600 mb-3">Specify the details of the work order that will be generated by this preventive maintenance trigger.</p>
            <button
              className="w-full h-14 border border-gray-300 rounded-lg text-gray-700 text-sm font-semibold hover:border-gray-400"
              type="button"
              onClick={() => onAddWorkOrderDetails?.()}
            >
              Add Work Order Details
            </button>
            {workOrderDetails?.title ? (
              <div className="mt-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">{workOrderDetails.title}</div>
                    <div className="text-xs text-gray-600 flex gap-2 items-center mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[11px] font-semibold">
                        {workOrderDetails.priority || 'Medium'}
                      </span>
                      {workOrderDetails.category && <span className="text-gray-600 text-xs">{workOrderDetails.category}</span>}
                    </div>
                    {workOrderDetails.description ? <div className="text-sm text-gray-700 mt-1 line-clamp-2">{workOrderDetails.description}</div> : null}
                  </div>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100" onClick={() => onAddWorkOrderDetails?.()}>Edit</button>
                </div>
              </div>
            ) : null}
            <div className="mt-3 space-y-2">
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Work Order Title"
                value={workOrderDetails?.title || ''}
                onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, title: e.target.value }))}
              />
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[80px]"
                placeholder="Description"
                value={workOrderDetails?.description || ''}
                onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, description: e.target.value }))}
              />
              <div className="grid grid-cols-3 gap-2">
                <select className="border border-gray-300 rounded-lg px-2 py-2 text-sm" value={workOrderDetails?.priority || 'Medium'} onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, priority: e.target.value }))}>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Low</option>
                  <option>Urgent</option>
                </select>
                <select className="border border-gray-300 rounded-lg px-2 py-2 text-sm" value={workOrderDetails?.category || 'General'} onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, category: e.target.value }))}>
                  <option>General</option>
                  <option>HVAC</option>
                  <option>Electrical</option>
                  <option>Plumbing</option>
                </select>
                <input
                  className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
                  placeholder="Duration (hrs)"
                  value={workOrderDetails?.durationHours || ''}
                  onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, durationHours: e.target.value }))}
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" checked={!!workOrderDetails?.requiresSignature} onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, requiresSignature: e.target.checked }))} />
                Requires Signature
              </label>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Schedules</h3>
            <p className="text-sm text-gray-600 mb-3">Specify the date and time for the scheduled maintenance.</p>
            <div className="relative">
            <button
              className="w-full h-14 border border-gray-300 rounded-lg text-gray-700 text-sm font-semibold hover:border-gray-400 text-left px-4"
              onClick={() => setShowScheduleMenu(prev => !prev)}
            >
                Add Schedule
            </button>
            {scheduleConfig?.calendarRule && (
              <div className="mt-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">Due every {scheduleConfig.calendarRule.every} {scheduleConfig.calendarRule.unit}(s)</div>
                    <div className="text-xs text-gray-600 mt-1">Created {scheduleConfig.calendarRule.leadDays} day(s) before due date at {scheduleConfig.calendarRule.time || '09:00'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100" onClick={onAddCalendar}>Edit</button>
                    <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100" onClick={() => setPmSchedule({ scheduleType: null, calendarRule: null })}>Remove</button>
                  </div>
                </div>
              </div>
            )}
      {showScheduleMenu && (
        <div className="absolute left-0 top-16 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl w-[520px]">
          <div className="py-2">
            {[
              { label: 'Calendar', desc: 'WOs due regularly, or when the previous is completed', icon: <Calendar className="w-5 h-5" />, action: () => { setShowScheduleMenu(false); onAddCalendar?.(); } },
              { label: 'Meter readings', desc: 'Creates WOs when readings meet specific criteria', icon: <Gauge className="w-5 h-5" />, action: () => { setShowScheduleMenu(false); onAddMeter?.(); } },
                      { label: 'Calendar OR meter readings', desc: 'Uses both, based on whichever happens first', icon: <AlertCircle className="w-5 h-5" />, action: () => { setShowScheduleMenu(false); onAddCombined?.(); } },
            ].map((opt, idx) => (
              <button
                key={idx}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3 items-start"
                onClick={() => {
                          setShowScheduleMenu(false);
                          opt.action?.();
                        }}
                      >
                        <div className="mt-0.5 text-gray-600">{opt.icon}</div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                          <div className="text-sm text-gray-600">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Assets & Locations</h3>
              <p className="text-sm text-gray-600">Select Asset and Locations, assign them to the schedule, and define assignees and start dates.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={addAssetRow}
                type="button"
              >
                + Add Row
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Bulk Select Assets</button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Asset</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Start Date</th>
                  <th className="px-4 py-3 text-left">End Date</th>
                  <th className="px-4 py-3 text-left">Timezone</th>
                  <th className="px-4 py-3 text-left">Assigned To</th>
                  <th className="px-4 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {assetRows.map((row, idx) => (
                  <tr className="border-b border-gray-100" key={row.id}>
                    <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <select
                        className="w-40 border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-700"
                        value={row.assetId}
                        onChange={(e) => updateAssetRow(idx, 'assetId', e.target.value)}
                      >
                        <option value="">Asset</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="w-40 border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-700"
                        value={row.locationId}
                        onChange={(e) => updateAssetRow(idx, 'locationId', e.target.value)}
                      >
                        <option value="">Location</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        className="border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-700"
                        value={row.startDate}
                        onChange={(e) => updateAssetRow(idx, 'startDate', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="datetime-local"
                        className="border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-700"
                        value={row.endDate}
                        onChange={(e) => updateAssetRow(idx, 'endDate', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="w-48 border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-700"
                        value={row.timezone}
                        onChange={(e) => updateAssetRow(idx, 'timezone', e.target.value)}
                      >
                        <option>(UTC+02:00) Africa/Kigali</option>
                        <option>(UTC+00:00) UTC</option>
                        <option>(UTC+03:00) Africa/Nairobi</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="w-40 border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-700"
                        value={row.assignee}
                        onChange={(e) => updateAssetRow(idx, 'assignee', e.target.value)}
                      >
                        <option>Assigned To</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                        onClick={() => removeAssetRow(idx)}
                        type="button"
                        disabled={assetRows.length === 1}
                        title={assetRows.length === 1 ? 'Keep at least one row' : 'Remove row'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Work Order Details Modal (for PM) ---
function WorkOrderDetailsModal({ open, onClose, tasks = [], setTasks, workOrderDetails, setWorkOrderDetails, checklist = [], setChecklist, checklistLibrary = [], setChecklistLibrary, companyAssets = [], onChecklistSaved, launchChecklistBuilderDirect = false }) {
  const imageInputRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const checklistImportInputRef = React.useRef(null);
  const [showChecklistModal, setShowChecklistModal] = React.useState(false);
  const [showChecklistBuilder, setShowChecklistBuilder] = React.useState(false);
  const [templateName, setTemplateName] = React.useState('');
  const [showChecklistPicker, setShowChecklistPicker] = React.useState(false);
  const [checklistBuilderView, setChecklistBuilderView] = React.useState('chooser');
  const [checklistTemplateSearch, setChecklistTemplateSearch] = React.useState('');
  const [checklistImporting, setChecklistImporting] = React.useState(false);
  const [checklistImportResult, setChecklistImportResult] = React.useState(null);
  const [selectedChecklistAssetId, setSelectedChecklistAssetId] = React.useState('');
  const [checklistAiInstructions, setChecklistAiInstructions] = React.useState('');
  const [showChecklistAiInstructions, setShowChecklistAiInstructions] = React.useState(false);
  const [checklistAiFocus, setChecklistAiFocus] = React.useState('preventive');
  const [checklistGenerating, setChecklistGenerating] = React.useState(false);
  const [blankChecklistMeta, setBlankChecklistMeta] = React.useState({
    title: 'Untitled Checklist',
    description: '',
    allRequired: false,
  });

  const addTask = () => setTasks?.((t) => [...t, { id: Date.now(), title: '', status: 'Open' }]);
  const updateTask = (id, key, value) => setTasks?.((t) => t.map(task => (task.id === id ? { ...task, [key]: value } : task)));
  const removeTask = (id) => setTasks?.((t) => (t.length === 1 ? t : t.filter(task => task.id !== id)));
  const imageFiles = Array.isArray(workOrderDetails?.imageFiles) ? workOrderDetails.imageFiles : [];
  const attachmentFiles = Array.isArray(workOrderDetails?.attachmentFiles) ? workOrderDetails.attachmentFiles : [];
  const addImageFiles = (fileList) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length) return;
    setWorkOrderDetails?.((prev) => ({
      ...prev,
      imageFiles: [...(Array.isArray(prev?.imageFiles) ? prev.imageFiles : []), ...files],
    }));
  };
  const addAttachmentFiles = (fileList) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length) return;
    setWorkOrderDetails?.((prev) => ({
      ...prev,
      attachmentFiles: [...(Array.isArray(prev?.attachmentFiles) ? prev.attachmentFiles : []), ...files],
    }));
  };
  const removeImageFile = (index) => {
    setWorkOrderDetails?.((prev) => ({
      ...prev,
      imageFiles: (Array.isArray(prev?.imageFiles) ? prev.imageFiles : []).filter((_, idx) => idx !== index),
    }));
  };
  const removeAttachmentFile = (index) => {
    setWorkOrderDetails?.((prev) => ({
      ...prev,
      attachmentFiles: (Array.isArray(prev?.attachmentFiles) ? prev.attachmentFiles : []).filter((_, idx) => idx !== index),
    }));
  };

  const addChecklistItem = () => setChecklist?.((c) => [...c, { id: Date.now(), text: '', type: 'Status', meter: '' }]);
  const updateChecklistItem = (id, key, value) => setChecklist?.((c) => c.map(item => (item.id === id ? { ...item, [key]: value } : item)));
  const removeChecklistItem = (id) => setChecklist?.((c) => (c.length === 1 ? c : c.filter(item => item.id !== id)));
  const applyChecklistTemplate = (tpl) => {
    if (!tpl) return;
    const items = (tpl.items || []).map((item, idx) => ({
      id: item.id || `${Date.now()}-${idx}`,
      text: item.text || item.label || '',
      type: item.type || 'Status',
      meter: item.meter || '',
      required: !!item.required,
    }));
    setChecklist?.(items);
    setWorkOrderDetails?.((prev) => ({
      ...prev,
      checklistTemplateId: tpl.id || tpl._id || null,
      checklistTemplateName: tpl.name || tpl.title || 'Checklist',
      checklistTemplateDescription: tpl.description || '',
    }));
  };
  const openChecklistBuilder = () => {
    setChecklistBuilderView('chooser');
    setChecklistTemplateSearch('');
    setChecklistImportResult(null);
    setShowChecklistBuilder(true);
  };
  const openBlankChecklistEditor = () => {
    setChecklist?.((current) => (
      current?.length
        ? current
        : [{ id: Date.now(), text: 'Status', type: 'Status', meter: '', required: false }]
    ));
    setChecklistBuilderView('blank');
    setShowChecklistBuilder(true);
  };
  const openTemplateChecklistLibrary = () => {
    setChecklistTemplateSearch('');
    setChecklistImportResult(null);
    setChecklistBuilderView('template');
    setShowChecklistBuilder(true);
  };
  const openChecklistImportView = () => {
    setChecklistImportResult(null);
    setChecklistBuilderView('import');
    setShowChecklistBuilder(true);
  };
  const checklistTypeOptions = ['Status', 'Text', 'Number', 'Inspection', 'Multiple Choice', 'Meter', 'Signature', 'Checkbox', 'Warning', 'Multiselect'];
  const assetOptions = React.useMemo(() => (Array.isArray(companyAssets) ? companyAssets : []), [companyAssets]);
  const selectedChecklistAsset = React.useMemo(
    () => assetOptions.find((asset) => String(asset.id || asset._id) === String(selectedChecklistAssetId)),
    [assetOptions, selectedChecklistAssetId]
  );
  const getAssetLabel = React.useCallback((asset) => (
    asset?.name ||
    asset?.title ||
    asset?.assetName ||
    asset?.tag ||
    'Unnamed asset'
  ), []);
  const getAssetLocationLabel = React.useCallback((asset) => {
    const location = asset?.location;
    if (!location) return '';
    if (typeof location === 'string') return location;
    return [location.building, location.floor, location.room, location.block].filter(Boolean).join(' - ');
  }, []);
  const filteredChecklistTemplates = React.useMemo(() => {
    const query = String(checklistTemplateSearch || '').trim().toLowerCase();
    const templates = Array.isArray(checklistLibrary) ? checklistLibrary : [];
    if (!query) return templates;
    return templates.filter((tpl) => {
      const haystack = [
        tpl?.name,
        tpl?.title,
        tpl?.description,
        Array.isArray(tpl?.tags) ? tpl.tags.join(' ') : '',
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [checklistLibrary, checklistTemplateSearch]);
  const normalizeImportedChecklistRows = React.useCallback((rows = []) => (
    rows.map((row, idx) => {
      const text = row.text || row.task || row.name || row.label || row.title || '';
      const rawType = row.type || row.kind || row.fieldtype || row.itemtype || 'Status';
      const normalizedType = checklistTypeOptions.find((option) => option.toLowerCase() === String(rawType).trim().toLowerCase()) || 'Status';
      const requiredValue = String(row.required || row.mandatory || row.isrequired || '').trim().toLowerCase();
      return {
        id: `${Date.now()}-${idx}`,
        text: String(text || '').trim(),
        type: normalizedType,
        meter: row.meter || row.metername || row.reading || '',
        required: ['true', 'yes', '1', 'required'].includes(requiredValue),
      };
    }).filter((item) => item.text)
  ), [checklistTypeOptions]);
  const downloadChecklistImportTemplate = React.useCallback(() => {
    const headers = ['text', 'type', 'meter', 'required'];
    const rows = [
      ['Inspect belts and pulleys', 'Status', '', 'true'],
      ['Record operating pressure', 'Meter', 'Pressure Gauge', 'false'],
      ['Add technician notes', 'Text', '', 'false'],
    ];
    const csv = [headers.join(','), ...rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'checklist-import-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, []);
  const importChecklistFromFile = React.useCallback((file) => {
    if (!file) return;
    setChecklistImporting(true);
    setChecklistImportResult(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rawText = String(reader.result || '');
        const response = await api.post('/api/checklists/import', {
          csvText: rawText,
          fileName: file.name,
          saveToLibrary: false,
        });
        const payload = response?.data || {};
        const items = Array.isArray(payload.items)
          ? payload.items
          : normalizeImportedChecklistRows(parseCsvText(rawText));
        if (!items.length) {
          throw new Error('No valid checklist items found. Use columns like text, type, meter, required.');
        }
        setChecklist?.(items);
        setBlankChecklistMeta((prev) => ({
          ...prev,
          title: payload.name || String(file.name || 'Imported Checklist').replace(/\.[^/.]+$/, '') || prev.title,
          description: payload.description || prev.description,
        }));
        setTemplateName(payload.name || String(file.name || '').replace(/\.[^/.]+$/, ''));
        setChecklistImportResult({ count: payload.itemCount || items.length, fileName: file.name });
        setChecklistBuilderView('blank');
      } catch (err) {
        console.error('Failed to import checklist CSV', err);
        alert(err?.response?.data?.error || err?.message || 'Failed to import checklist CSV');
      } finally {
        setChecklistImporting(false);
        if (checklistImportInputRef.current) checklistImportInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setChecklistImporting(false);
      if (checklistImportInputRef.current) checklistImportInputRef.current.value = '';
      alert('Failed to read the selected file');
    };
    reader.readAsText(file);
  }, [normalizeImportedChecklistRows, setChecklist]);
  const generateChecklistFromAsset = React.useCallback(async () => {
    if (!selectedChecklistAssetId) {
      alert('Select an asset first');
      return;
    }

    setChecklistGenerating(true);
    try {
      const response = await api.post('/api/ai/generate-checklist', {
        assetId: selectedChecklistAssetId,
        focus: checklistAiFocus,
        extraInstructions: checklistAiInstructions,
      });
      const generated = response?.data || {};
      const items = (Array.isArray(generated.items) ? generated.items : []).map((item, idx) => ({
        id: item.id || `${Date.now()}-${idx}`,
        text: item.text || item.label || '',
        type: checklistTypeOptions.find((option) => option.toLowerCase() === String(item.type || '').toLowerCase()) || 'Status',
        meter: item.meter || '',
        required: !!item.required,
      })).filter((item) => item.text);

      if (!items.length) {
        throw new Error('No checklist items were generated');
      }

      setChecklist?.(items);
      setBlankChecklistMeta((prev) => ({
        ...prev,
        title: generated.title || generated.name || `${getAssetLabel(selectedChecklistAsset)} Checklist`,
        description: generated.description || `AI-generated checklist for ${getAssetLabel(selectedChecklistAsset)}.`,
      }));
      setTemplateName(generated.title || generated.name || `${getAssetLabel(selectedChecklistAsset)} Checklist`);
      setChecklistBuilderView('blank');
    } catch (err) {
      console.error('Failed to generate checklist from asset', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to generate checklist');
    } finally {
      setChecklistGenerating(false);
    }
  }, [selectedChecklistAsset, selectedChecklistAssetId, checklistAiFocus, checklistAiInstructions, checklistTypeOptions, getAssetLabel, setChecklist]);
  React.useEffect(() => {
    if (open && launchChecklistBuilderDirect) {
      setChecklistBuilderView('chooser');
      setShowChecklistModal(false);
      setShowChecklistPicker(false);
      setShowChecklistBuilder(true);
    }
  }, [open, launchChecklistBuilderDirect]);
  React.useEffect(() => {
    if (open && !selectedChecklistAssetId && workOrderDetails?.assetId) {
      setSelectedChecklistAssetId(String(workOrderDetails.assetId));
    }
  }, [open, selectedChecklistAssetId, workOrderDetails?.assetId]);
  const saveChecklistToBackend = async () => {
    const name = (blankChecklistMeta.title || templateName || 'Checklist Template').trim();
    if (!name) {
      throw new Error('Checklist name is required');
    }
    if (!Array.isArray(checklist) || checklist.length === 0) {
      throw new Error('Add at least one checklist item before saving');
    }

    let companyName = '';
    let token = '';
    try {
      const stored = localStorage.getItem('user');
      token = localStorage.getItem('token') || '';
      if (stored) {
        const user = JSON.parse(stored);
        companyName = user?.companyName || '';
      }
    } catch (err) {
      companyName = '';
      token = '';
    }

    if (!token) {
      throw new Error('You need to be logged in to save a checklist');
    }
    if (!companyName) {
      throw new Error('Your account has no company name yet. Please log out and log back in.');
    }
    const payload = {
      name,
      title: name,
      description: blankChecklistMeta.description || '',
      companyName,
      tags: [],
      items: (checklist || []).map((item, idx) => ({
        id: item.id || `${Date.now()}-${idx}`,
        text: item.text || '',
        type: item.type || 'Status',
        meter: item.meter || '',
        required: blankChecklistMeta.allRequired || !!item.required,
      })),
    };

    console.log('[Checklist Save] payload:', payload);
    const res = await api.post('/api/checklists', payload);
    console.log('[Checklist Save] response:', res?.status, res?.data);
    const saved = res?.data;
    if (saved && setChecklistLibrary) {
      setChecklistLibrary((lib) => {
        const current = Array.isArray(lib) ? lib : [];
        const nextItem = {
          ...saved,
          id: saved.id || saved._id || String(Date.now()),
          name: saved.name || saved.title || name,
          description: saved.description || payload.description,
          items: Array.isArray(saved.items) ? saved.items : payload.items,
          tags: Array.isArray(saved.tags) ? saved.tags : [],
        };
        return [nextItem, ...current.filter((entry) => String(entry.id || entry._id) !== String(nextItem.id || nextItem._id))];
      });
    }
    await onChecklistSaved?.();
    alert('Checklist saved successfully.');
    return saved;
  };
  const closeChecklistBuilder = () => {
    setShowChecklistBuilder(false);
    if (launchChecklistBuilderDirect) {
      onClose?.();
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 overflow-auto py-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="text-xl font-bold text-gray-900">Add Work Order Details</div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-800">Work Order Title <span className="text-rose-500">*</span></label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Work Order Title"
              value={workOrderDetails?.title || ''}
              onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, title: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-800">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[120px]"
              placeholder="Describe the work order"
              value={workOrderDetails?.description || ''}
              onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, description: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={!!workOrderDetails?.createNow}
              onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, createNow: e.target.checked }))}
            />
            Create first Work Order Now? <AlertCircle className="w-4 h-4 text-gray-400" />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-800">Priority</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={workOrderDetails?.priority || 'Medium'}
                onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, priority: e.target.value }))}
              >
                <option>Medium</option>
                <option>High</option>
                <option>Low</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-800">Category</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={workOrderDetails?.category || 'General'}
                onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, category: e.target.value }))}
              >
                <option>General</option>
                <option>HVAC</option>
                <option>Electrical</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-bold text-gray-800">Duration (as hours)</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., 2"
                value={workOrderDetails?.durationHours || ''}
                onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, durationHours: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={!!workOrderDetails?.requiresSignature}
                onChange={(e) => setWorkOrderDetails?.((w) => ({ ...w, requiresSignature: e.target.checked }))}
              />
              Requires Signature
            </label>
          </div>

          <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Attachments</h3>
          <div className="space-y-2">
            <div className="text-sm font-bold text-gray-700">Photos</div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addImageFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <div
              className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-600 bg-gray-50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addImageFiles(e.dataTransfer.files);
              }}
            >
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 font-semibold"
                >
                  Upload
                </button> or Drop Images
              </div>
              {imageFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {imageFiles.map((file, idx) => (
                    <div key={`${file.name}-${idx}`} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                      <span className="max-w-[180px] truncate">{file.name}</span>
                      <button type="button" className="text-rose-500 hover:text-rose-700" onClick={() => removeImageFile(idx)}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-bold text-gray-700">Files</div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  addAttachmentFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <div
                className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-600 bg-gray-50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  addAttachmentFiles(e.dataTransfer.files);
                }}
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 font-semibold"
                >
                  Upload
                </button> or Drop Files
              </div>
              {attachmentFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachmentFiles.map((file, idx) => (
                    <div key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                      <span className="truncate pr-3">{file.name}</span>
                      <button type="button" className="text-rose-500 hover:text-rose-700" onClick={() => removeAttachmentFile(idx)}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="text-sm font-semibold text-blue-700 hover:underline">Add from Saved Files</button>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Other Tasks</h3>
            <div className="border-t border-gray-100 pt-3">
              <div className="border border-gray-200 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-sm font-semibold text-gray-800 flex-1">Tasks</div>
                  <button className="text-sm font-semibold text-blue-600 hover:underline" type="button" onClick={addTask}>+ Add Task</button>
                </div>
                {tasks.map((task, idx) => (
                  <div key={task.id} className="flex items-center gap-2 border border-gray-200 rounded-xl p-2 bg-white mb-2">
                    <div className="text-gray-400 px-2">⋮⋮</div>
                    <input
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
                      placeholder={`Task ${idx + 1}`}
                      value={task.title}
                      onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                    />
                    <select
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
                      value={task.status}
                      onChange={(e) => updateTask(task.id, 'status', e.target.value)}
                    >
                      <option>Open</option>
                      <option>Done</option>
                      <option>Blocked</option>
                    </select>
                    <button
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      type="button"
                      onClick={() => removeTask(task.id)}
                      disabled={tasks.length === 1}
                      title={tasks.length === 1 ? 'Keep at least one task' : 'Remove task'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  className="w-full mt-1 border border-blue-500 text-blue-600 font-bold rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-blue-50"
                  type="button"
                  onClick={addTask}
                >
                  <Plus className="w-4 h-4" /> Add Tasks
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="border border-blue-500 text-blue-600 font-bold rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-blue-50"
              type="button"
              onClick={addTask}
            >
              <Plus className="w-4 h-4" /> Add Tasks
            </button>
            <button
              className="border border-blue-500 text-blue-600 font-bold rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-blue-50"
              onClick={() => {
                setShowChecklistPicker(true);
              }}
            >
              <Plus className="w-4 h-4" /> Add Checklist
            </button>
          </div>
        </div>

        {/* Saved checklist selector */}
        <div className="mt-4 border border-gray-200 rounded-xl p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-800">Saved Checklists</div>
            <button
              type="button"
              className="text-sm text-blue-600 font-semibold hover:underline"
              onClick={() => {
                if (!checklistLibrary?.length) return;
                const first = checklistLibrary[0];
                applyChecklistTemplate(first);
              }}
            >
              {checklistLibrary?.length ? 'Load first' : 'None saved'}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(checklistLibrary || []).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                onClick={() => applyChecklistTemplate(tpl)}
              >
                {tpl.name || 'Template'}
              </button>
            ))}
          </div>
        </div>

        {workOrderDetails?.checklistTemplateName && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-blue-900">Applied Checklist</div>
                <div className="mt-1 text-base font-semibold text-gray-900">
                  {workOrderDetails.checklistTemplateName}
                </div>
                {workOrderDetails?.checklistTemplateDescription && (
                  <div className="mt-1 text-sm text-gray-600">
                    {workOrderDetails.checklistTemplateDescription}
                  </div>
                )}
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                {(checklist || []).length} item(s)
              </div>
            </div>
            {(checklist || []).length > 0 && (
              <div className="mt-3 space-y-2">
                {(checklist || []).slice(0, 3).map((item, idx) => (
                  <div key={item.id || idx} className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700 border border-blue-100">
                    {idx + 1}. {item.text || 'Untitled item'}
                  </div>
                ))}
                {(checklist || []).length > 3 && (
                  <div className="text-xs font-medium text-blue-700">
                    +{checklist.length - 3} more items
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Smart Checklist Builder trigger */}
        <div className="mt-4">
          <button
            type="button"
            className="px-4 py-2 border border-indigo-200 rounded-lg text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            onClick={openChecklistBuilder}
          >
            Open Smart Checklist Builder
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700"
            type="button"
            onClick={() => onClose?.()}
          >
            Save Work Order Details
          </button>
        </div>
      </div>

      {showChecklistModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xl mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="text-lg font-bold text-gray-900">Add Checklist</div>
              <button onClick={() => setShowChecklistModal(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-800">Checklist Items</div>
                  <button
                    className="text-sm font-semibold text-blue-600 hover:underline"
                    type="button"
                    onClick={addChecklistItem}
                  >
                    + Add Item
                  </button>
                </div>
                {checklist.map((item, idx) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-3 space-y-2 bg-white">
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder={`Item ${idx + 1}`}
                        value={item.text}
                        onChange={(e) => updateChecklistItem(item.id, 'text', e.target.value)}
                      />
                      <select
                        className="w-32 border border-gray-300 rounded-lg px-2 py-2 text-sm"
                        value={item.type}
                        onChange={(e) => updateChecklistItem(item.id, 'type', e.target.value)}
                      >
                        <option>Status</option>
                        <option>Text</option>
                        <option>Number</option>
                        <option>Meter</option>
                      </select>
                      <button
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        type="button"
                        onClick={() => removeChecklistItem(item.id)}
                        disabled={checklist.length === 1}
                        title={checklist.length === 1 ? 'Keep at least one item' : 'Remove item'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.type === 'Meter' && (
                      <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder="Meter name or reading"
                        value={item.meter || ''}
                        onChange={(e) => updateChecklistItem(item.id, 'meter', e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setShowChecklistModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700" type="button" onClick={() => setShowChecklistModal(false)}>Save Checklist</button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist picker modal */}
      {showChecklistPicker && (
        <div className="fixed inset-0 z-[62] flex items-start justify-center bg-black/50 overflow-auto py-10 px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="text-lg font-bold text-gray-900">Select a Checklist</div>
              <button onClick={() => setShowChecklistPicker(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {(checklistLibrary || []).length === 0 && (
                <div className="text-sm text-gray-600">No saved checklists yet.</div>
              )}
              {(checklistLibrary || []).map((tpl) => (
                <button
                  key={tpl.id}
                  className="w-full text-left border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 flex justify-between items-center"
                  onClick={() => {
                    applyChecklistTemplate(tpl);
                    setShowChecklistPicker(false);
                  }}
                >
                  <div>
                    <div className="font-semibold text-gray-900">{tpl.name || 'Checklist'}</div>
                    <div className="text-xs text-gray-600">{(tpl.items || []).length} item(s)</div>
                  </div>
                  <span className="text-sm text-blue-600 font-semibold">Use</span>
                </button>
              ))}
              <div className="pt-2">
                <button
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowChecklistPicker(false);
                    openChecklistBuilder();
                  }}
                >
                  Create new checklist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Checklist Builder modal */}
      {showChecklistBuilder && (
        <div className="fixed inset-0 z-[65] flex items-start justify-center bg-black/50 overflow-auto py-8 px-4">
          {checklistBuilderView === 'chooser' ? (
            <div className="w-full max-w-5xl rounded-[28px] bg-white shadow-2xl">
              <div className="flex items-center justify-end px-6 py-4">
                <button onClick={closeChecklistBuilder} className="p-2 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="px-8 pb-8">
                <div className="text-center">
                  <h2 className="text-4xl font-semibold tracking-tight text-gray-900">Smart Checklist Builder</h2>
                  <p className="mt-3 text-xl text-slate-600">Create professional maintenance checklists in seconds.</p>
                </div>

                <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                  <div className="m-6 rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6">
                      <div className="text-[20px] text-slate-400">What kind of checklist would you like to build?</div>
                      <div className="mt-8 space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <select
                            className="h-11 min-w-[246px] rounded-lg border border-blue-300 bg-white px-4 text-base font-medium text-blue-700"
                            value={selectedChecklistAssetId}
                            onChange={(e) => setSelectedChecklistAssetId(e.target.value)}
                          >
                            <option value="">Select Asset</option>
                            {assetOptions.map((asset, index) => (
                              <option key={asset.id || asset._id || `asset-${index}`} value={asset.id || asset._id}>
                                {getAssetLabel(asset)}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center justify-end gap-4">
                            <button
                              type="button"
                              className={`transition ${checklistAiFocus === 'preventive' ? 'text-blue-600' : 'text-blue-400 hover:text-blue-600'}`}
                              title="Toggle preventive focus"
                              onClick={() => setChecklistAiFocus((current) => current === 'preventive' ? 'inspection' : 'preventive')}
                            >
                              <Bell className="h-6 w-6" />
                            </button>
                            <button
                              type="button"
                              className={`transition ${showChecklistAiInstructions ? 'text-blue-700' : 'text-blue-600 hover:text-blue-700'}`}
                              title="Add custom AI instructions"
                              onClick={() => setShowChecklistAiInstructions((current) => !current)}
                            >
                              <Edit className="h-6 w-6" />
                            </button>
                            <button
                              type="button"
                              className="h-10 rounded-lg bg-blue-600 px-6 text-base font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={!selectedChecklistAssetId || checklistGenerating}
                              onClick={generateChecklistFromAsset}
                            >
                              {checklistGenerating ? 'Generating...' : 'Generate'}
                            </button>
                          </div>
                        </div>

                        {selectedChecklistAsset && (
                          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-left">
                            <div className="text-sm font-semibold text-slate-800">{getAssetLabel(selectedChecklistAsset)}</div>
                            <div className="mt-1 text-sm text-slate-500">
                              {[selectedChecklistAsset.type || selectedChecklistAsset.category, getAssetLocationLabel(selectedChecklistAsset)].filter(Boolean).join(' | ') || 'Asset selected for checklist generation'}
                            </div>
                          </div>
                        )}

                        {showChecklistAiInstructions && (
                          <textarea
                            className="min-h-[96px] w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                            placeholder="Add custom instructions for AI, for example: focus on safety checks, include lubricant readings, or keep it short."
                            value={checklistAiInstructions}
                            onChange={(e) => setChecklistAiInstructions(e.target.value)}
                          />
                        )}

                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className={`rounded-full px-3 py-1 font-medium ${checklistAiFocus === 'preventive' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {checklistAiFocus === 'preventive' ? 'Preventive focus' : 'Inspection focus'}
                          </span>
                          {showChecklistAiInstructions && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                              Custom instructions enabled
                            </span>
                          )}
                          {!assetOptions.length && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
                              No assets loaded
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-indigo-50 px-6 py-3 text-center text-[18px] text-slate-700">
                    Powered by UpKeep Intelligence
                  </div>
                </div>

                <div className="mt-10 text-center text-[18px] text-slate-600">or create a checklist another way</div>

                <div className="mx-auto mt-6 grid max-w-4xl gap-5 md:grid-cols-3">
                  <button
                    type="button"
                    className="rounded-[24px] border border-slate-200 bg-white p-7 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                    onClick={openBlankChecklistEditor}
                  >
                    <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-gray-900">
                      <Plus className="h-7 w-7" />
                    </div>
                    <div className="text-[22px] font-semibold text-gray-900">Create from blank</div>
                    <div className="mt-4 text-[17px] leading-8 text-slate-600">Write your checklist from scratch</div>
                  </button>

                  <button
                    type="button"
                    className="rounded-[24px] border border-slate-200 bg-white p-7 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                    onClick={openTemplateChecklistLibrary}
                  >
                    <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-gray-900">
                      <Package className="h-7 w-7" />
                    </div>
                    <div className="text-[22px] font-semibold text-gray-900">Use a template</div>
                    <div className="mt-4 text-[17px] leading-8 text-slate-600">Search the checklist library</div>
                  </button>

                  <button
                    type="button"
                    className="rounded-[24px] border border-slate-200 bg-white p-7 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                    onClick={openChecklistImportView}
                  >
                    <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-gray-900">
                      <Download className="h-7 w-7" />
                    </div>
                    <div className="text-[22px] font-semibold text-gray-900">Bulk Data Import</div>
                    <div className="mt-4 text-[17px] leading-8 text-slate-600">Import checklists in bulk with our CSV templates</div>
                  </button>
                </div>
              </div>
            </div>
          ) : checklistBuilderView === 'template' ? (
            <div className="w-full max-w-4xl overflow-hidden rounded-[24px] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-8 py-5">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Checklist Library</h2>
                  <p className="mt-1 text-sm text-slate-500">Choose an existing checklist template and attach it to this work order.</p>
                </div>
                <button onClick={closeChecklistBuilder} className="rounded-full p-2 hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="px-8 py-6">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 text-sm text-slate-700 outline-none focus:border-blue-400"
                      placeholder="Search checklist library"
                      value={checklistTemplateSearch}
                      onChange={(e) => setChecklistTemplateSearch(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={openBlankChecklistEditor}
                  >
                    Create new instead
                  </button>
                </div>

                <div className="space-y-3">
                  {filteredChecklistTemplates.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                      <div className="text-lg font-semibold text-slate-700">No matching checklist templates</div>
                      <p className="mt-2 text-sm text-slate-500">Try a different search or create a checklist from scratch.</p>
                    </div>
                  )}

                  {filteredChecklistTemplates.map((tpl, index) => {
                    const itemCount = Array.isArray(tpl?.items) ? tpl.items.length : 0;
                    return (
                      <button
                        key={tpl.id || tpl._id || `template-${index}`}
                        type="button"
                        className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
                        onClick={() => {
                          applyChecklistTemplate(tpl);
                          closeChecklistBuilder();
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-lg font-semibold text-slate-900">{tpl.name || tpl.title || 'Checklist Template'}</div>
                            <p className="mt-1 text-sm text-slate-500">{tpl.description || 'No description provided.'}</p>
                            <div className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">{itemCount} item(s)</div>
                          </div>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Use template</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 px-8 py-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setChecklistBuilderView('chooser')}
                >
                  Back
                </button>
                <div className="text-sm text-slate-500">{filteredChecklistTemplates.length} template(s)</div>
              </div>
            </div>
          ) : checklistBuilderView === 'import' ? (
            <div className="w-full max-w-3xl overflow-hidden rounded-[24px] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-8 py-5">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Bulk Checklist Import</h2>
                  <p className="mt-1 text-sm text-slate-500">Upload a CSV file to create checklist items faster.</p>
                </div>
                <button onClick={closeChecklistBuilder} className="rounded-full p-2 hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6 px-8 py-8">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Expected columns</div>
                  <div className="mt-3 text-sm text-slate-700">Use `text`, `type`, `meter`, and `required`. Extra columns are ignored.</div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {['Status', 'Text', 'Number', 'Inspection', 'Multiple Choice', 'Meter', 'Signature', 'Checkbox', 'Warning', 'Multiselect'].map((type) => (
                      <span key={type} className="rounded-full bg-white px-3 py-1 font-medium text-slate-600 border border-slate-200">{type}</span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:shadow-md"
                    onClick={downloadChecklistImportTemplate}
                  >
                    <div className="text-lg font-semibold text-slate-900">Download CSV template</div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Start from a ready-made spreadsheet with sample checklist rows.</p>
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:shadow-md"
                    onClick={() => checklistImportInputRef.current?.click()}
                    disabled={checklistImporting}
                  >
                    <div className="text-lg font-semibold text-slate-900">{checklistImporting ? 'Importing...' : 'Upload CSV file'}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Choose your checklist CSV and we’ll load the items into the editor.</p>
                  </button>
                  <input
                    ref={checklistImportInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => importChecklistFromFile(e.target.files?.[0])}
                  />
                </div>

                {checklistImportResult && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                    <div className="text-sm font-semibold text-emerald-800">Imported {checklistImportResult.count} item(s)</div>
                    <p className="mt-1 text-sm text-emerald-700">{checklistImportResult.fileName} is ready in the checklist editor.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 px-8 py-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setChecklistBuilderView('chooser')}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  onClick={openBlankChecklistEditor}
                >
                  Open editor
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[1240px] overflow-hidden rounded-[24px] bg-white shadow-2xl">
              <div className="grid min-h-[760px] grid-cols-1 xl:grid-cols-[1fr_270px]">
                <div className="px-10 py-10">
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <div className="w-full max-w-3xl">
                      <input
                        className="w-full border-none p-0 text-[34px] font-medium text-slate-500 outline-none placeholder:text-slate-400"
                        value={blankChecklistMeta.title}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBlankChecklistMeta((prev) => ({ ...prev, title: value }));
                          setTemplateName(value);
                        }}
                        placeholder="Untitled Checklist *"
                      />
                      <textarea
                        className="mt-4 w-full resize-none border-none p-0 text-[17px] text-slate-500 outline-none placeholder:text-slate-400"
                        rows={2}
                        value={blankChecklistMeta.description}
                        onChange={(e) => setBlankChecklistMeta((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Write a description..."
                      />
                      <button type="button" className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-[17px] font-medium text-slate-600 hover:bg-slate-50">
                        <Plus className="h-4 w-4" />
                        Add tag
                      </button>
                    </div>
                    <button onClick={closeChecklistBuilder} className="rounded-full p-2 hover:bg-gray-100">
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="mb-6 flex items-center justify-end gap-4">
                    <span className="text-[16px] text-gray-900">Mark All Tasks as Required</span>
                    <button
                      type="button"
                      onClick={() => setBlankChecklistMeta((prev) => ({ ...prev, allRequired: !prev.allRequired }))}
                      className={`relative h-8 w-14 rounded-full border transition ${
                        blankChecklistMeta.allRequired ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-slate-200'
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                          blankChecklistMeta.allRequired ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-8">
                    {(checklist || []).map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-6">
                        <div className="text-3xl leading-none text-gray-500">⋮</div>
                        <div className="flex-1 rounded-[18px] border border-slate-300 bg-white p-6">
                          <input
                            className="w-full border-none bg-transparent p-0 text-[18px] italic text-slate-700 outline-none"
                            value={item.text}
                            onChange={(e) => updateChecklistItem(item.id, 'text', e.target.value)}
                            placeholder={`Task ${idx + 1}`}
                          />
                          <div className="mt-4">
                            <select
                              className="h-11 w-full rounded-xl border border-slate-300 px-4 text-[16px] text-slate-600"
                              value={item.type}
                              onChange={(e) => updateChecklistItem(item.id, 'type', e.target.value)}
                            >
                              {checklistTypeOptions.map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          {item.type === 'Meter' && (
                            <input
                              className="mt-4 h-11 w-full rounded-xl border border-slate-300 px-4 text-[16px] text-slate-600"
                              placeholder="Meter name"
                              value={item.meter || ''}
                              onChange={(e) => updateChecklistItem(item.id, 'meter', e.target.value)}
                            />
                          )}
                          <div className="mt-5 flex flex-wrap items-center gap-3 text-[15px] text-slate-500">
                            <button type="button" className="hover:text-slate-700">Photo</button>
                            <span>|</span>
                            <button type="button" className="hover:text-slate-700">Notes</button>
                            <span>|</span>
                            <button type="button" className="hover:text-slate-700">URL</button>
                            <button
                              type="button"
                              className="ml-auto rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                              onClick={() => removeChecklistItem(item.id)}
                              disabled={checklist.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="mt-8 flex h-10 w-full items-center justify-center gap-3 rounded-xl bg-indigo-50 text-[17px] font-medium text-blue-700 hover:bg-indigo-100"
                    onClick={addChecklistItem}
                  >
                    <Plus className="h-4 w-4" />
                    Add Task
                  </button>
                </div>

                <div className="border-l border-slate-200 bg-slate-50 px-8 py-8">
                  <div className="text-[15px] font-semibold uppercase tracking-wide text-slate-600">Add Items</div>
                  <div className="mt-5 space-y-5 text-[16px]">
                    <button type="button" className="flex items-center gap-3 text-blue-700 hover:text-blue-800" onClick={addChecklistItem}>
                      <Plus className="h-4 w-4" />
                      Add Task
                    </button>
                    <button type="button" className="flex items-center gap-3 text-blue-700 hover:text-blue-800" onClick={addChecklistItem}>
                      <Tag className="h-4 w-4" />
                      Add Section
                    </button>
                  </div>

                  <div className="mt-12 text-[15px] font-semibold uppercase tracking-wide text-slate-600">Task Types</div>
                  <div className="mt-5 space-y-4 text-[16px] text-blue-700">
                    {checklistTypeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className="block text-left hover:text-blue-800"
                        onClick={() => setChecklist?.((current) => [
                          ...(current || []),
                          { id: Date.now() + Math.random(), text: option, type: option, meter: '', required: blankChecklistMeta.allRequired },
                        ])}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 px-8 py-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setChecklistBuilderView('chooser')}
                >
                  Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={async () => {
                      try {
                        await saveChecklistToBackend();
                      } catch (err) {
                        alert(err?.response?.data?.error || err?.message || 'Failed to save checklist');
                      }
                    }}
                  >
                    Save to Library
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    onClick={closeChecklistBuilder}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Calendar Schedule Modal ---
function CalendarScheduleModal({ open, onClose, scheduleConfig, setScheduleConfig, resetKey }) {
  const [every, setEvery] = React.useState(scheduleConfig?.calendarRule?.every || 1);
  const [unit, setUnit] = React.useState(scheduleConfig?.calendarRule?.unit || 'day');
  const [time, setTime] = React.useState(scheduleConfig?.calendarRule?.time || '22:00');
  const [leadDays, setLeadDays] = React.useState(scheduleConfig?.calendarRule?.leadDays || 0);

  React.useEffect(() => {
    if (!open) return;
    setEvery(scheduleConfig?.calendarRule?.every || 1);
    setUnit(scheduleConfig?.calendarRule?.unit || 'day');
    setTime(scheduleConfig?.calendarRule?.time || '22:00');
    setLeadDays(scheduleConfig?.calendarRule?.leadDays || 0);
  }, [open, scheduleConfig, resetKey]);

  const saveAndClose = () => {
    setScheduleConfig?.({
      scheduleType: 'calendar',
      calendarRule: { every: Number(every) || 1, unit, time, leadDays: Number(leadDays) || 0 },
    });
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/50 overflow-auto py-10">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="text-xl font-bold text-gray-900">Add Calendar Schedule</div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-800">Schedule Type</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Regular Interval</option>
              <option>After Completion</option>
              <option>Custom</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800">WOs Due</label>
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Every</span>
                <input className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm" value={every} onChange={(e) => setEvery(e.target.value)} />
                <select className="w-32 border border-gray-300 rounded-lg px-2 py-2 text-sm" value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option value="day">Day(s)</option>
                  <option value="week">Week(s)</option>
                  <option value="month">Month(s)</option>
                </select>
              </div>
              <div>
                <input type="time" className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
              Create WOs
              <AlertCircle className="w-4 h-4 text-gray-400" />
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" name="createWO" defaultChecked className="h-4 w-4 text-blue-600 border-gray-300" />
                <div className="flex items-center gap-2">
                  <input className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm" value={leadDays} onChange={(e) => setLeadDays(e.target.value)} />
                  <select className="w-28 border border-gray-300 rounded-lg px-2 py-2 text-sm" value="day" disabled>
                    <option>Day(s)</option>
                    <option>Week(s)</option>
                    <option>Month(s)</option>
                  </select>
                  <span className="text-gray-700">before the due date</span>
                </div>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" name="createWO" className="h-4 w-4 text-blue-600 border-gray-300" />
                <div className="flex items-center gap-2">
                  <span>On the</span>
                  <select className="w-28 border border-gray-300 rounded-lg px-2 py-2 text-sm" disabled>
                    <option>Day(s)</option>
                  </select>
                  <span className="text-gray-700">before the due date</span>
                </div>
              </label>
              <div className="flex items-center gap-2 pl-6">
                <span className="text-sm text-gray-700">At</span>
                <input type="time" className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="22:00" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              Inactive Periods
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <button className="text-sm font-semibold text-blue-700 hover:underline">+ Add Period</button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700" onClick={saveAndClose} type="button">Done</button>
        </div>
      </div>
    </div>
  );
}

// --- Meter Schedule Modal ---
function MeterScheduleModal({ open, onClose }) {
  if (!open) return null;
  const triggerOptions = ['Reaches every', 'Is exactly', 'Is less than', 'Is greater than'];
  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/50 overflow-auto py-10">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="text-xl font-bold text-gray-900">Add Meter Schedule</div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-4">
            When editing the PM's records, you can set a specific meter and unit baseline for each record applied to this schedule.
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800">Create WOs</label>
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 text-sm text-gray-700">
              <span className="font-semibold text-gray-800">When a reading</span>
              <select className="border border-gray-300 rounded-lg px-2 py-2 text-sm">
                {triggerOptions.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <input className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm" defaultValue="1" />
              <span className="text-gray-700">units</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <label className="text-sm font-bold text-gray-800">WOs Due</label>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <input className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm" defaultValue="1" />
              <select className="border border-gray-300 rounded-lg px-2 py-2 text-sm">
                <option>Day(s)</option>
                <option>Week(s)</option>
                <option>Month(s)</option>
              </select>
              <span>after creation</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700">Done</button>
        </div>
      </div>
    </div>
  );
}

// --- Combined Calendar OR Meter Modal ---
function CombinedScheduleModal({ open, onClose }) {
  if (!open) return null;
  const triggerOptions = ['Reaches every', 'Is exactly', 'Is less than', 'Is greater than'];
  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/50 overflow-auto py-10">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="text-xl font-bold text-gray-900">Add Calendar OR Meter Schedule</div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Calendar Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Calendar Schedule</h3>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">Schedule Type</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Regular Interval</option>
                <option>After Completion</option>
                <option>Custom</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">WOs Due</label>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Every</span>
                  <input className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="1" />
                  <select className="w-32 border border-gray-300 rounded-lg px-2 py-2 text-sm">
                    <option>Day(s)</option>
                    <option>Week(s)</option>
                    <option>Month(s)</option>
                  </select>
                </div>
                <div>
                  <input type="time" className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="22:00" />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                Create WOs
                <AlertCircle className="w-4 h-4 text-gray-400" />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" name="createWOCombo" defaultChecked className="h-4 w-4 text-blue-600 border-gray-300" />
                <div className="flex items-center gap-2">
                  <input className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm" defaultValue="1" />
                  <select className="w-28 border border-gray-300 rounded-lg px-2 py-2 text-sm">
                    <option>Day(s)</option>
                    <option>Week(s)</option>
                    <option>Month(s)</option>
                  </select>
                  <span className="text-gray-700">before the due date</span>
                </div>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" name="createWOCombo" className="h-4 w-4 text-blue-600 border-gray-300" />
                <div className="flex items-center gap-2">
                  <span>On the</span>
                  <select className="w-28 border border-gray-300 rounded-lg px-2 py-2 text-sm" disabled>
                    <option>Day(s)</option>
                  </select>
                  <span className="text-gray-700">before the due date</span>
                </div>
              </label>
              <div className="flex items-center gap-2 pl-6">
                <span className="text-sm text-gray-700">At</span>
                <input type="time" className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="22:00" />
              </div>
            </div>
          </div>

          {/* Meter Section */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-bold text-gray-900">Meter Schedule</h3>
            <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-4">
              When editing the PM's records, you can set a specific meter and unit baseline for each record applied to this schedule.
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-800">Create WOs</label>
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 text-sm text-gray-700">
                <span className="font-semibold text-gray-800">When a reading</span>
                <select className="border border-gray-300 rounded-lg px-2 py-2 text-sm">
                  {triggerOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>
                <input className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm" defaultValue="1" />
                <span className="text-gray-700">units</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <label className="text-sm font-bold text-gray-800">WOs Due</label>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <input className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm" defaultValue="1" />
                <select className="border border-gray-300 rounded-lg px-2 py-2 text-sm">
                  <option>Day(s)</option>
                  <option>Week(s)</option>
                  <option>Month(s)</option>
                </select>
                <span>after creation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700">Done</button>
        </div>
      </div>
    </div>
  );
}
 
 

