import React, { useState, useEffect, useRef, useCallback } from "react";
import ScheduleMaintenanceForm from './ScheduleMaintenanceForm';
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import NewIssue from './NewIssue';

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Requests: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
    </svg>
  ),
  Properties: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Assets: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    </svg>
  ),
  Staff: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Templates: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Alert: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Export: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
    </svg>
  ),
};

// ── Helper Functions ──────────────────────────────────────────────────────────
const extractId = (obj) => {
  if (!obj) return null;
  if (typeof obj === 'string') return obj;
  return obj._id || obj.id || null;
};

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = (status || '').toUpperCase().replace(/_/g, ' ');
  const map = {
    'PENDING':     { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
    'IN PROGRESS': { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
    'COMPLETE':    { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
    'COMPLETED':   { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
    'APPROVED':    { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
    'OVERDUE':     { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
    'REJECTED':    { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  };
  const { bg, text, dot } = map[s] || { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' };
  return (
    <span style={{ background: bg, color: text, display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      {s}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, icon }) {
  const accents = {
    blue:   { bg: '#EFF6FF', border: '#BFDBFE', val: '#1D4ED8', icon: '#3B82F6' },
    green:  { bg: '#ECFDF5', border: '#A7F3D0', val: '#065F46', icon: '#10B981' },
    red:    { bg: '#FEF2F2', border: '#FECACA', val: '#991B1B', icon: '#EF4444' },
    indigo: { bg: '#EEF2FF', border: '#C7D2FE', val: '#3730A3', icon: '#6366F1' },
    amber:  { bg: '#FFFBEB', border: '#FDE68A', val: '#92400E', icon: '#F59E0B' },
  };
  const c = accents[accent] || accents.blue;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', color: c.icon, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: c.val, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
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

// ── Table ─────────────────────────────────────────────────────────────────────
function Table({ heads, rows, empty = 'No data found.' }) {
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9CA3AF', fontSize: 14 }}>{empty}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {heads.map((h, i) => (
                <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {row}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const Td = ({ children, mono }) => (
  <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151', fontFamily: mono ? 'monospace' : 'inherit' }}>{children ?? '—'}</td>
);

// ── Input / Select ────────────────────────────────────────────────────────────
const inputStyle = { border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#111827', background: 'white', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' };
const Input = ({ style, ...props }) => <input style={{ ...inputStyle, ...style }} {...props} />;
const Select = ({ style, children, ...props }) => <select style={{ ...inputStyle, ...style }} {...props}>{children}</select>;

// ── Button ────────────────────────────────────────────────────────────────────
function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', style }) {
  const base = { border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.15s', opacity: disabled ? 0.5 : 1, borderRadius: 8 };
  const sizes = { sm: { padding: '5px 12px', fontSize: 12 }, md: { padding: '8px 16px', fontSize: 13 }, lg: { padding: '10px 20px', fontSize: 14 } };
  const variants = {
    primary: { background: '#1D4ED8', color: 'white' },
    danger: { background: '#EF4444', color: 'white' },
    ghost: { background: '#F3F4F6', color: '#374151' },
    outline: { background: 'white', color: '#374151', border: '1px solid #D1D5DB' },
    success: { background: '#10B981', color: 'white' },
    teal: { background: '#0F766E', color: 'white' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ── Sidebar nav item ──────────────────────────────────────────────────────────
function NavItem({ label, icon, active, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      fontSize: 13, fontWeight: active ? 700 : 500, transition: 'all 0.15s',
      background: active ? '#EFF6FF' : 'transparent',
      color: danger ? '#EF4444' : active ? '#1D4ED8' : '#4B5563',
    }}>
      <span style={{ color: active ? '#1D4ED8' : danger ? '#EF4444' : '#9CA3AF' }}>{icon}</span>
      {label}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function ClientDashboard() {
  const navigate = useNavigate();
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

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [propertyUseNamedBlocks, setPropertyUseNamedBlocks] = useState(false);
  const [assets, setAssets] = useState([]);
  const [internalTechnicians, setInternalTechnicians] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyForm, setPropertyForm] = useState({ name: '', type: '', address: '', beds: '', baths: '', area: '', floors: '', blocks: '', rooms: '', namedBlocks: [], roomNames: [] });
  const [propertyFiles, setPropertyFiles] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetForm, setAssetForm] = useState({ name: '', type: '', description: '', propertyId: '', quantity: 1, building: '', blocks: [], room: '' });
  const [originalAssetBlocks, setOriginalAssetBlocks] = useState([]);
  const [editingTech, setEditingTech] = useState(null);
  const [techForm, setTechForm] = useState({ name: '', email: '', phone: '', password: '', specialty: [], rating: 0, completed: 0, propertyId: '' });
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
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
  const [assignableIssues, setAssignableIssues] = useState([]);
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [newIssueModel, setNewIssueModel] = useState(null);
  const [loading, setLoading] = useState({ properties: false, assets: false, internalTechnicians: false });
  const [errors, setErrors] = useState({ properties: null, assets: null, internalTechnicians: null });
  const [showReminderPanel, setShowReminderPanel] = useState(true);
  const importFileRef = useRef(null);
  const importAssetsRef = useRef(null);
  const inviteEmailRef = useRef(null);
  const inviteRoleRef = useRef(null);
  const inviteLocationRef = useRef(null);

  // ── Helper Functions ───────────────────────────────────────────────────────
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

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchIssues = useCallback(async () => {
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

      setIssues(fetched);
      setAllIssues(fetched);
      const counts = { Pending: 0, 'In Progress': 0, Completed: 0, Overdue: 0 };
      fetched.forEach(issue => {
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
  }, []);

  const refreshSchedules = useCallback(async () => {
    try {
      const r = await api.get('/api/maintenance-schedules');
      setMaintenanceSchedules(r.data || []);
    } catch {
      // Handle error silently
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      let userObj = null;
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

      // Properties
      setLoading(l => ({ ...l, properties: true }));
      try {
        const res = await api.get('/api/properties');
        const propertiesData = res.data || [];
        setProperties(propertiesData);

        if (userObj?.role === 'client') {
          const pids = propertiesData.map(p => p._id || p.id).filter(Boolean);
          const [techResults, assetResults] = await Promise.all([
            Promise.allSettled(pids.map(pid => api.get(`/api/internal-technicians?propertyId=${pid}`))),
            Promise.allSettled(pids.map(pid => api.get(`/api/assets?propertyId=${pid}`))),
          ]);
          const techData = techResults.flatMap(r => r.status === 'fulfilled' && Array.isArray(r.value.data) ? r.value.data : []);
          const assetData = assetResults.flatMap(r => r.status === 'fulfilled' && Array.isArray(r.value.data) ? r.value.data : []);
          if (techData.length) setInternalTechnicians(techData);
          if (assetData.length) setAssets(assetData);
        }
      } catch (err) {
        setErrors(e => ({ ...e, properties: err?.response?.data?.message || err.message }));
      } finally {
        setLoading(l => ({ ...l, properties: false }));
      }

      // Assets + Techs (non-client)
      if (!(userObj?.role === 'client')) {
        setLoading(l => ({ ...l, assets: true }));
        try {
          const r = await api.get('/api/assets');
          setAssets(r.data || []);
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

      // External technicians
      try {
        const ep = (userObj?.role === 'manager' || userObj?.role === 'admin') ? '/api/technicians/for-assignment' : '/api/technicians';
        const r = await api.get(ep);
        setTechnicians(r.data || []);
      } catch {
        // Handle error silently
      }

      // Schedules
      try {
        const r = await api.get('/api/maintenance-schedules');
        setMaintenanceSchedules(r.data || []);
        const now = new Date();
        const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        setReminders((r.data || []).filter(s => s?.routine && s.nextDate && new Date(s.nextDate) <= cutoff && (!s.lastReminder || new Date(s.lastReminder) < new Date(s.nextDate))));
        const counts = { Preventive: 0, Routine: 0, Pending: 0, 'In Progress': 0, Completed: 0, Overdue: 0 };
        (r.data || []).forEach(s => {
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
      await fetchIssues();
    };

    fetchData();
  }, [fetchIssues]);

  // Issue actions
  const approveIssue = useCallback(async (id) => {
    try {
      await api.put(`/api/issues/${id}`, { status: 'APPROVED' });
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
      await dismissOne(s._id || s.id).catch(() => {});
    }
  }, [reminders, dismissOne]);

  const snoozeAll = useCallback(async () => {
    for (const s of reminders) {
      await snoozeOne(s._id || s.id).catch(() => {});
    }
  }, [reminders, snoozeOne]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }, [navigate]);

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
    if (!issue) return '—';
    if (issue.property && (issue.property.name || issue.property.title)) return issue.property.name || issue.property.title;
    const pid = extractId(issue.propertyId) || (issue.property && (issue.property.id || issue.property._id));
    if (!pid) return '—';
    const p = properties.find(pp => {
      const ids = [pp._id, pp.id].filter(Boolean).map(String);
      return ids.includes(String(pid));
    });
    return p ? (p.name || p.title || String(pid)) : String(pid);
  }, [properties]);

  // Resolve assigned technician name from issue (check assignedTo, technician, internal/ external lists)
  const getAssignedName = useCallback((issue) => {
    if (!issue) return '—';
    if (issue.assignedTo && typeof issue.assignedTo === 'object' && (issue.assignedTo.name || issue.assignedTo.fullName)) return issue.assignedTo.name || issue.assignedTo.fullName;
    const aid = extractId(issue.assignedTo) || extractId(issue.technician) || (issue.assignedTo && String(issue.assignedTo));
    if (!aid) return '—';
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

  // ── Last 7 days chart ─────────────────────────────────────────────────────
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
    return d.toLocaleDateString('en', { weekday: 'short' });
  });

  const combinedPending = (statusCounts.Pending || 0) + (maintenanceCounts.Pending || 0);
  const combinedInProgress = (statusCounts['In Progress'] || 0) + (maintenanceCounts['In Progress'] || 0);
  const combinedCompleted = (statusCounts.Completed || 0) + (maintenanceCounts.Completed || 0);
  const combinedOverdue = (statusCounts.Overdue || 0) + (maintenanceCounts.Overdue || 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  const navItems = [
    { key: 'dashboard', label: 'Overview', icon: <Icon.Dashboard /> },
    { key: 'requests', label: 'Requests', icon: <Icon.Requests /> },
    { key: 'properties', label: 'Locations', icon: <Icon.Properties /> },
    { key: 'assets', label: 'Assets', icon: <Icon.Assets /> },
    { key: 'internalTechnicians', label: 'Staff', icon: <Icon.Staff /> },
    { key: 'organization', label: 'Organization', icon: <Icon.Templates /> },
    { key: 'maintenanceTemplates', label: 'Maintenance', icon: <Icon.Templates /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 220, background: 'white', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '24px 16px 20px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Client Portal</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>Property Management</div>
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

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          <div style={{ marginBottom: 4, padding: '0 6px', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Menu</div>
          {navItems.map(({ key, label, icon }) => (
            <NavItem key={key} label={label} icon={icon} active={activeTab === key} onClick={() => setActiveTab(key)} />
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '10px', borderTop: '1px solid #F3F4F6' }}>
          <NavItem label="Export PDF" icon={<Icon.Export />} onClick={exportIssuesPDF} />
          <NavItem label="Import CSV" icon={<Icon.Download />} onClick={() => importFileRef.current?.click()} />
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
          <NavItem label="Logout" icon={<Icon.Logout />} onClick={handleLogout} danger />
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>
              {navItems.find(n => n.key === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {reminders.length > 0 && (
              <button onClick={() => setShowReminderPanel(v => !v)} style={{ position: 'relative', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#92400E' }}>
                <Icon.Bell />
                <span>{reminders.length} Reminder{reminders.length > 1 ? 's' : ''}</span>
              </button>
            )}
            <Btn onClick={() => {
              setNewIssueModel({ category: '', requestedType: currentUser ? 'inspection' : 'request' });
              setShowNewIssueModal(true);
            }} variant="primary">
              <Icon.Plus /> New Request
            </Btn>
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

          {/* ── Dashboard ── */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Welcome */}
              <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #2563EB 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 24, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' }}>
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
                <StatCard label="Pending" value={combinedPending} sub="Awaiting action" accent="amber"
                  icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
                <StatCard label="In Progress" value={combinedInProgress} sub="Currently active" accent="blue"
                  icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>} />
                <StatCard label="Completed" value={combinedCompleted} sub="Successfully resolved" accent="green"
                  icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>} />
                <StatCard label="Overdue" value={combinedOverdue} sub="Requires attention" accent="red"
                  icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} />
              </div>

              {/* Charts + Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16, marginBottom: 28 }}>
                {/* Issues chart */}
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Issues — Last 7 Days</div>
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
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: '20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Quick Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Btn onClick={() => {
                      setNewIssueModel({ category: '', requestedType: currentUser ? 'inspection' : 'request' });
                      setShowNewIssueModal(true);
                    }} variant="primary" style={{ justifyContent: 'center', width: '100%' }}><Icon.Plus /> New Request</Btn>
                    <Btn onClick={() => setActiveTab('requests')} variant="outline" style={{ justifyContent: 'center', width: '100%' }}>All Requests</Btn>
                    <Btn onClick={exportIssuesPDF} variant="ghost" style={{ justifyContent: 'center', width: '100%' }}><Icon.Export /> Export PDF</Btn>
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
              <SectionHeader title="Recent Issues" count={issues.length}
                action={<button onClick={() => setActiveTab('requests')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1D4ED8', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>View all <Icon.ChevronRight /></button>} />

              {issues.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, color: '#9CA3AF' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No issues found</div>
                  <div style={{ fontSize: 13 }}>Submit a new request to get started</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {issues.slice(0, 5).map(issue => {
                    const id = issue.id || issue._id;
                    return (
                      <div key={id} style={{ background: 'white', border: issue.overdue ? '1px solid #FECACA' : '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 14 }}>
                        {/* Left accent */}
                        <div style={{ width: 3, borderRadius: 4, background: issue.overdue ? '#EF4444' : issue.status?.includes('PROGRESS') ? '#3B82F6' : issue.status?.includes('COMPLETE') || issue.status === 'APPROVED' ? '#10B981' : '#F59E0B', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              <StatusBadge status={issue.status} />
                              {issue.overdue && <span style={{ fontSize: 11, fontWeight: 600, color: '#EF4444', background: '#FEF2F2', padding: '2px 7px', borderRadius: 20, border: '1px solid #FECACA' }}>Overdue</span>}
                            </div>
                          </div>
                          {issue.location && <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>{issue.location}</div>}

                          {(issue.photo || issue.image) && (
                            <img src={imageSrc(issue.photo || issue.image)} alt="Issue" style={{ height: 100, width: 'auto', borderRadius: 8, marginBottom: 10, border: '1px solid #E5E7EB', objectFit: 'cover' }} onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                          )}

                          {/* Tags */}
                          {Array.isArray(issue.tags) && issue.tags.filter(t => !['PENDING','IN PROGRESS','COMPLETE','OVERDUE'].includes(t?.label || t)).length > 0 && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                              {issue.tags.filter(t => !['PENDING','IN PROGRESS','COMPLETE','OVERDUE'].includes(t?.label || t)).map((tag, i) => {
                                const label = tag.label || tag;
                                return <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: label === 'URGENT' ? '#FEE2E2' : '#EFF6FF', color: label === 'URGENT' ? '#991B1B' : '#1D4ED8', border: `1px solid ${label === 'URGENT' ? '#FECACA' : '#BFDBFE'}` }}>{label}</span>;
                              })}
                            </div>
                          )}

                          {/* Assignees */}
                          {Array.isArray(issue.assignees) && issue.assignees.length > 0 && (
                            <div style={{ fontSize: 12, color: '#059669', fontWeight: 500, marginBottom: 8 }}>
                              👤 {issue.assignees.map(a => a.name || 'Unknown').join(', ')}
                            </div>
                          )}

                          {/* Client actions */}
                          {issue.status === 'PENDING' && currentUser?.role === 'client' && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              <Btn size="sm" variant="success" onClick={() => approveIssue(id)}><Icon.Check /> Accept</Btn>
                              <Btn size="sm" variant="danger" onClick={() => declineIssue(id)}><Icon.X /> Decline</Btn>
                              <Btn size="sm" variant="ghost" onClick={() => resubmitIssue(id)}>Resubmit</Btn>
                            </div>
                          )}

                          {/* Manager internal assign */}
                          {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && internalTechnicians.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                              <Select style={{ flex: 1, fontSize: 12, padding: '5px 8px' }} value={(selectedTechs[id]?.internal) || ''} onChange={e => setSelectedTechs(s => ({ ...s, [id]: { ...s[id], internal: e.target.value } }))}>
                                <option value="">Assign internal technician…</option>
                                {internalTechnicians.map((t, i) => <option key={t.id || t._id || i} value={t.id || t._id}>{t.name}{t.email ? ` (${t.email})` : ''}</option>)}
                              </Select>
                              <Btn size="sm" variant="primary" disabled={!selectedTechs[id]?.internal || assignLoading[id]} onClick={() => assignInternal(id, selectedTechs[id]?.internal)}>
                                {assignLoading[id] ? '…' : 'Assign'}
                              </Btn>
                            </div>
                          )}

                          {/* Manager external assign */}
                          {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && technicians.length > 0 && issue.status === 'APPROVED' && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                              <Select style={{ flex: 1, fontSize: 12, padding: '5px 8px' }} value={(selectedTechs[id]?.external) || ''} onChange={e => setSelectedTechs(s => ({ ...s, [id]: { ...s[id], external: e.target.value } }))}>
                                <option value="">Assign technician…</option>
                                {technicians.map((t, i) => <option key={t.id || t._id || i} value={t.id || t._id}>{t.name}{t.email ? ` (${t.email})` : ''}</option>)}
                              </Select>
                              <Btn size="sm" variant="primary" disabled={!selectedTechs[id]?.external || assignLoading[id]} onClick={() => assignToTech(id, selectedTechs[id]?.external)}>
                                {assignLoading[id] ? '…' : 'Assign'}
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

          {/* ── Requests ── */}
          {activeTab === 'requests' && (
            <div>
              <SectionHeader title="All Requests" count={allIssues.length}
                action={<Btn onClick={exportIssuesPDF} variant="outline" size="sm"><Icon.Export /> Export PDF</Btn>} />
              <Table
                heads={['#', 'Title', 'Status', 'Location', 'Assigned To', 'Created', 'Actions']}
                empty="No requests found."
                rows={allIssues.map((issue, idx) => [
                  <Td key="n">{idx + 1}</Td>,
                  <Td key="t"><span style={{ fontWeight: 600, color: '#111827' }}>{issue.title || issue.summary || '—'}</span></Td>,
                  <Td key="s"><StatusBadge status={issue.status} /></Td>,
                  <Td key="p">{getPropertyName(issue)}</Td>,
                  <Td key="a">{getAssignedName(issue)}</Td>,
                  <Td key="c">{issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : '—'}</Td>,
                  <Td key="x">
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" variant="outline" onClick={() => navigate(`/issues/${issue.id || issue._id}`)}>View</Btn>
                      <Btn size="sm" variant="danger" onClick={async () => {
                        if (window.confirm('Delete issue?')) {
                          try {
                            await api.delete(`/api/issues/${issue._id || issue.id}`);
                            await fetchIssues();
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

          {/* ── Properties ── */}
          {activeTab === 'properties' && (
            <div>
              <SectionHeader title="Locations" count={properties.length}
                action={!editingProperty && <Btn onClick={() => setEditingProperty({})} variant="primary" size="sm"><Icon.Plus /> Add Locations</Btn>} />

              {loading.properties && <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading…</div>}
              {errors.properties && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 14, marginBottom: 16, color: '#991B1B', fontSize: 13 }}>Error: {errors.properties}</div>}

              {/* Form */}
              {editingProperty !== null && (
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24, marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 16 }}>{editingProperty._id || editingProperty.id ? 'Edit Location' : 'New Location'}</div>
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
                          await api.post(`/api/properties/${r.data.id || r.data._id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => {});
                        }
                      }
                      if (eid && propertyFiles?.length) {
                        const fd = new FormData();
                        Array.from(propertyFiles).forEach(f => fd.append('photos', f));
                        await api.post(`/api/properties/${eid}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => {});
                      }
                      setEditingProperty(null);
                      setPropertyFiles(null);
                      setPropertyForm({ name: '', type: '', address: '', beds: '', baths: '', area: '', floors: '', blocks: '', rooms: '', namedBlocks: [], roomNames: [] });
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
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      <Btn type="submit" variant="primary">Save Property</Btn>
                      <Btn onClick={() => {
                        setEditingProperty(null);
                        setPropertyFiles(null);
                        setPropertyForm({ name: '', type: '', address: '', beds: '', baths: '', area: '', floors: '', blocks: '', rooms: '', namedBlocks: [], roomNames: [] });
                      }} variant="ghost">Cancel</Btn>
                    </div>
                  </form>
                </div>
              )}

              <Table heads={['Name', 'Type', 'Address', 'Beds', 'Baths', 'Area', 'Actions']} empty="No properties yet. Add your first one."
                rows={properties.map(p => [
                  <Td key="n"><span style={{ fontWeight: 600 }}>{p.name}</span></Td>,
                  <Td key="t"><span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{p.type}</span></Td>,
                  <Td key="a">{p.address}</Td>, <Td key="b">{p.beds ?? '—'}</Td>, <Td key="ba">{p.baths ?? '—'}</Td>, <Td key="ar">{p.area ?? p.sqft ?? '—'}</Td>,
                  <Td key="x">
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" variant="outline" onClick={() => {
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
                      <Btn size="sm" variant="danger" onClick={async () => {
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
                ])}
              />
            </div>
          )}

          {/* ── Assets ── */}
          {activeTab === 'assets' && (
            <div>
              <SectionHeader title="Assets" count={assets.length}
                action={!editingAsset && <div style={{ display: 'flex', gap: 8 }}><Btn onClick={() => setEditingAsset({})} variant="primary" size="sm"><Icon.Plus /> Add Asset</Btn><Btn onClick={() => importAssetsRef.current?.click()} variant="outline" size="sm">Import Excel</Btn></div>} />

              {loading.assets && <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading…</div>}
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
                          <button type="button" onClick={() => setAssetForm(f => ({ ...f, quantity: Math.max(1, (f.quantity || 1) - 1) }))} style={{ padding: '9px 14px', background: '#F9FAFB', border: 'none', cursor: 'pointer', fontSize: 16, color: '#374151' }}>−</button>
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
                          <option value="">Select location…</option>
                          {properties.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>)}
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
                  <Td key="p">{asset.property?.name || '—'}</Td>,
                  <Td key="bu">{asset.building || '—'}</Td>,
                  <Td key="ro">{asset.room || '—'}</Td>,
                  <Td key="bl">{asset.block || '—'}</Td>,
                  <Td key="d"><span style={{ color: '#9CA3AF' }}>{asset.description || '—'}</span></Td>,
                  <Td key="x">
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" variant="outline" onClick={() => {
                        let blocksArr = [];
                        if (Array.isArray(asset.blocks)) blocksArr = asset.blocks.map(String);
                        else if (asset.block) blocksArr = Array.isArray(asset.block) ? asset.block.map(String) : String(asset.block).split(/[;,|]/).map(s => s.trim()).filter(Boolean);
                        setEditingAsset(asset);
                        setOriginalAssetBlocks(blocksArr);
                        setAssetForm({
                          name: asset.name,
                          type: asset.type,
                          description: asset.description || '',
                          propertyId: asset.propertyId,
                          quantity: asset.quantity || 1,
                          building: asset.building || '',
                          blocks: blocksArr,
                          room: asset.room || ''
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

          {/* ── Staff ── */}
          {activeTab === 'internalTechnicians' && (
            <div>
              <SectionHeader title="Internal Technicians" count={internalTechnicians.length}
                action={!editingTech && <Btn onClick={() => setEditingTech({})} variant="primary" size="sm"><Icon.Plus /> Add Technician</Btn>} />

              {loading.internalTechnicians && <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading…</div>}
              {errors.internalTechnicians && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 14, marginBottom: 16, color: '#991B1B', fontSize: 13 }}>Error: {errors.internalTechnicians}</div>}

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
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating (0–5)</label>
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
                            <option value="">Select location…</option>
                            {properties.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>)}
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
                  <Td key="c"><div style={{ fontSize: 12 }}><div>{tech.email || '—'}</div><div style={{ color: '#9CA3AF' }}>{tech.phone || ''}</div></div></Td>,
                  <Td key="s">{Array.isArray(tech.specialty) ? tech.specialty.filter(Boolean).join(', ') : tech.specialty || '—'}</Td>,
                  <Td key="r"><span style={{ color: '#F59E0B', fontWeight: 700 }}>★ {tech.rating || 0}</span></Td>,
                  <Td key="j"><span style={{ fontWeight: 600 }}>{tech.completed || 0}</span></Td>,
                  <Td key="p">{tech.property?.name || '—'}</Td>,
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
                        setNewIssueModel({ category: '', propertyId: tech.propertyId, technicianId: tech.id || tech._id });
                        setShowNewIssueModal(true);
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

          {/* ── Organization / Team ── */}
          {activeTab === 'organization' && (
            <div>
              <SectionHeader title="Organization" />
              <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Organization Name</label>
                    <Input value={(localStorage.getItem('organization') && JSON.parse(localStorage.getItem('organization') || '{}').name) || ''} onChange={(e) => {
                      const cur = localStorage.getItem('organization') ? JSON.parse(localStorage.getItem('organization') || '{}') : {};
                      cur.name = e.target.value;
                      localStorage.setItem('organization', JSON.stringify(cur));
                    }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Admin Email</label>
                    <Input value={(localStorage.getItem('organization') && JSON.parse(localStorage.getItem('organization') || '{}').email) || ''} onChange={(e) => {
                      const cur = localStorage.getItem('organization') ? JSON.parse(localStorage.getItem('organization') || '{}') : {};
                      cur.email = e.target.value;
                      localStorage.setItem('organization', JSON.stringify(cur));
                    }} />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 160px 160px', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Invite technician (email)</label>
                    <input ref={inviteEmailRef} placeholder="email@domain.com" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #D1D5DB' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Role</label>
                    <select ref={inviteRoleRef} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #D1D5DB' }}>
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Location</label>
                    <select ref={inviteLocationRef} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #D1D5DB' }}>
                      <option value="">(optional)</option>
                      {properties.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <Btn onClick={handleInvite}>Invite</Btn>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>Invited technicians receive an email and can set up their account without manual signup steps.</div>
              </div>
            </div>
          )}

          {/* ── Maintenance Templates ── */}
          {activeTab === 'maintenanceTemplates' && (
            <div>
              <SectionHeader title="Maintenance" count={maintenanceSchedules.length} />

              {/* Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[{
                  title: 'Preventive Maintenance',
                  desc: 'Report issues for preventive maintenance. Technicians will be assigned, and you\'ll be notified upon completion.',
                  bg: 'linear-gradient(135deg,#1E3A8A,#1D4ED8)',
                  border: '#1D4ED8',
                  iconBg: 'rgba(255,255,255,0.15)',
                  icon: <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
                  onClick: () => {
                    setNewIssueModel({ category: '', requestedType: currentUser ? 'inspection' : 'request' });
                    setShowNewIssueModal(true);
                  },
                }, {
                  title: 'Routine Maintenance',
                  desc: 'Schedule recurring tasks like cleaning or inspection on daily, weekly, or monthly intervals.',
                  bg: 'linear-gradient(135deg,#0F766E,#0D9488)',
                  border: '#0F766E',
                  iconBg: 'rgba(255,255,255,0.15)',
                  icon: <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
                  onClick: () => setShowScheduleForm(true),
                }].map(({ title, desc, bg, icon, onClick }) => (
                  <button key={title} onClick={onClick} style={{ background: bg, border: 'none', borderRadius: 14, padding: '24px', textAlign: 'left', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', color: 'white' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</div>
                    <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>{desc}</div>
                  </button>
                ))}
              </div>

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

              <SectionHeader title="Scheduled Maintenance" count={maintenanceSchedules.length}
                action={<Btn onClick={() => setShowScheduleForm(true)} variant="outline" size="sm"><Icon.Plus /> New Schedule</Btn>} />

              <Table heads={['Name', 'Type', 'Status', 'Next Date', 'Frequency', 'Assets', 'Actions']} empty="No maintenance schedules. Create one above."
                rows={maintenanceSchedules.map(schedule => {
                  const sid = schedule.id || schedule._id;
                  const assetIds = Array.isArray(schedule.assets) ? schedule.assets : typeof schedule.assets === 'string' && schedule.assets.length ? schedule.assets.split(',') : [];
                  const assetNames = assetIds.map(id => assets.find(a => (a.id || a._id) === id)?.name || id).join(', ');
                  const isOverdue = schedule.nextDate && new Date(schedule.nextDate) < new Date() && !(schedule.status || '').toLowerCase().includes('complete');
                  return [
                    <Td key="n"><span style={{ fontWeight: 600 }}>{schedule.name || 'Unnamed'}</span></Td>,
                    <Td key="t"><span style={{ background: schedule.routine ? '#ECFDF5' : '#EFF6FF', color: schedule.routine ? '#065F46' : '#1D4ED8', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{schedule.routine ? 'Routine' : 'Preventive'}</span></Td>,
                    <Td key="s"><StatusBadge status={isOverdue ? 'OVERDUE' : schedule.status || 'Scheduled'} /></Td>,
                    <Td key="nd">{schedule.nextDate ? new Date(schedule.nextDate).toLocaleDateString() : 'TBD'}</Td>,
                    <Td key="f">{schedule.routine ? (schedule.frequency || 'daily') : '—'}</Td>,
                    <Td key="a"><span style={{ color: assetNames ? '#374151' : '#9CA3AF' }}>{assetNames || 'Unassigned'}</span></Td>,
                    <Td key="x">
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" variant="outline" onClick={() => {
                          setEditingSchedule(schedule);
                          setShowScheduleForm(true);
                        }}>Edit</Btn>
                        <Btn size="sm" variant="danger" onClick={async () => {
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
                  ];
                })}
              />
            </div>
          )}
        </div>
      </main>

      {/* ── New Issue Modal ── */}
      {showNewIssueModal && (
        <NewIssue model={newIssueModel} asModal={true} onClose={(submitted) => {
          setShowNewIssueModal(false);
          setNewIssueModel(null);
          if (submitted) {
            fetchIssues().catch(() => {});
            setActiveTab('requests');
          }
        }} />
      )}

      {/* ── Assign Modal ── */}
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
                <div style={{ fontSize: 36, marginBottom: 8 }}>🤷</div>
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
    </div>
  );
}

export default ClientDashboard;