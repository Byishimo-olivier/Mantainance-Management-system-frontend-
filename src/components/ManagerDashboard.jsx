import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { getImageUrl } from "../utils/imageUrl";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Header from "./Header";
import SubscriptionManagement from './SubscriptionManagement';
import TeamDetailsModal from './TeamDetailsModal';
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
  X,
  CreditCard
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

// Enhanced Status badge with icons and gradients
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const statusMap = {
      'PENDING': {
        bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: '⏳',
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
        icon: '⏰',
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
const StatCard = ({ title, value, change, icon, color, trend = "up" }) => {
  const colorMap = {
    blue: { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-100', iconBg: 'bg-blue-500/20' },
    orange: { bg: 'from-orange-500 to-amber-500', text: 'text-orange-100', iconBg: 'bg-orange-500/20' },
    green: { bg: 'from-emerald-500 to-green-500', text: 'text-emerald-100', iconBg: 'bg-emerald-500/20' },
    purple: { bg: 'from-purple-500 to-violet-500', text: 'text-purple-100', iconBg: 'bg-purple-500/20' },
    red: { bg: 'from-rose-500 to-pink-500', text: 'text-rose-100', iconBg: 'bg-rose-500/20' },
  };

  const config = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-gradient-to-br ${config.bg} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`${config.iconBg} p-3 rounded-lg`}>
          {icon && <icon className="w-6 h-6" />}
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-2 text-sm">
          {trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
          <span>{change}</span>
        </div>
      )}
      {/* View Team Modal */}
      <TeamDetailsModal show={showViewTeam} team={viewTeam} people={people} users={users} onClose={() => setShowViewTeam(false)} />
    </div>
  );
};


// Glass Card Component
const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
    {children}
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
      <div className={`absolute top-full mt-2 left-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 min-w-[240px] animate-in fade-in zoom-in duration-200 ${className}`}>
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

  const totalActiveFilters = selectedStatuses.length + selectedPriorities.length + selectedLocations.length + selectedAssets.length + selectedAssignedTo.length;
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSentiment, setAiSentiment] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [recsError, setRecsError] = useState(null);
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

      const [issuesRes, techRes, summaryRes, locationsRes, assetsRes] = await Promise.all([
        api.get("/api/issues"),
        api.get("/api/technicians"),
        api.get("/api/managers/dashboard/summary"),
        api.get("/api/properties"),
        api.get("/api/assets")
      ]);

      const allIssuesData = issuesRes.data;
      setAllIssues(allIssuesData);

      const approvedWorkOrders = allIssuesData.filter(issue => issue.approved);
      const pendingRequestsData = allIssuesData.filter(issue => !issue.approved && issue.status !== 'REJECTED');

      setIssues(approvedWorkOrders);
      setPendingRequests(pendingRequestsData);
      setTechnicians(techRes.data || []);
      setLocations(locationsRes.data || []);
      setAssets(assetsRes.data || []);
      setSummary(summaryRes.data);
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
      setTechnicians([]);
      setSummary({ pending: 0, inProgress: 0, completed: 0, overdue: 0 });
    } finally {
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

  const NavItem = ({ active, onClick, icon: Icon, label, badge, badgeColor = "bg-blue-600" }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 group ${active
        ? 'bg-white/15 text-white shadow-sm'
        : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 transition-colors ${active ? 'text-white' : 'text-blue-200 group-hover:text-white'}`} />
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white min-w-[18px] text-center ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );

  const TooltipButton = ({ icon: Icon, title }) => (
    <button className="p-2 text-blue-100/80 hover:text-white hover:bg-white/10 rounded-lg transition-all" title={title}>
      <Icon className="w-5 h-5" />
    </button>
  );

  const SectionLabel = ({ children }) => (
    <div className="px-3 py-2 text-[10px] font-bold text-blue-200/80 uppercase tracking-widest mt-4">
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-white text-gray-900" style={{ fontFamily: "'Space Grotesk', 'Manrope', 'Segoe UI', sans-serif" }}>
      {/* Sidebar Redesign */}
      <aside className="w-[260px] bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 text-blue-50 flex flex-col h-screen sticky top-0 shadow-xl">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-blue-700/40 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white border border-white/20">
              <Shield className="w-5 h-5 font-bold" />
            </div>
            <span className="font-bold text-lg tracking-tight">MMS Core</span>
          </div>
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
            label={t("manager.sidebar.vendorsCustomers")}
          />
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-700/40">
          <div className="flex items-center justify-between mb-4">
            <NavItem
              active={false}
              onClick={() => { }}
              icon={Settings}
              label={t("manager.sidebar.settings")}
            />
          </div>
          <div className="px-3 pb-3">
            <label className="text-[10px] font-bold text-blue-100/80 uppercase tracking-widest">
              {t("language.label")}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-2 w-full bg-white/10 border border-white/20 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="en">{t("language.english")}</option>
              <option value="fr">{t("language.french")}</option>
              <option value="rw">{t("language.kinyarwanda")}</option>
            </select>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white font-bold text-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <p className="text-[10px] text-blue-100/80 truncate capitalize">{userRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
        <div className="h-14 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-blue-50 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-900">{getFilteredIssues().length} {t("common.resultsReturned")}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-xs font-bold text-blue-700/70 hover:text-blue-900 hover:bg-blue-100/60 px-2 py-1 rounded-md transition-colors">
                <ArrowUpRight className="w-4 h-4" />
                {t("common.sort")}: {activeTab === 'preventive-maintenance' ? 'Name' : 'Date Created'}
              </button>
              <button className="flex items-center gap-2 text-xs font-bold text-blue-700/70 hover:text-blue-900 hover:bg-blue-100/60 px-2 py-1 rounded-md transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                {t("common.columns")}
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-8 py-1.5 bg-blue-50/60 border border-blue-100 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-blue-300 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-500/70 hover:text-blue-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white flex items-center justify-between flex-shrink-0">
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
                          {status.id === 'IN PROGRESS' && <div className="absolute inset-0 flex items-center justify-center"><Play className="w-1.5 h-1.5 text-white fill-white" /></div>}
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
        <div className="flex-1 overflow-y-auto p-6 bg-white relative">
          <div id="dashboard-content">
            {loading ? (
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
                onOpenDetails={openDetailModal}
              />
            ) : activeTab === 'scheduler' ? (
              <SchedulerTab
                issues={allIssues.filter(i => !i.assignedTo && (i.status === 'OPEN' || (i.approved && i.status === 'PENDING')))}
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
              <PeopleTab technicians={technicians || []} allIssues={allIssues || []} onRefresh={fetchDashboardData} />
            ) : activeTab === 'checklists' ? (
              <ChecklistsTab />
            ) : activeTab === 'parts' ? (
              <PartsInventoryTab />
            ) : activeTab === 'purchase-orders' ? (
              <PurchaseOrdersTab />
            ) : activeTab === 'vendors' ? (
              <VendorsTab />
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
      <DetailsModal
        open={detailModal.open}
        type={detailModal.type}
        item={detailModal.item}
        onClose={closeDetailModal}
        getAssignedTechName={getAssignedTechName}
      />
    </div>
  );
}

// Enhanced Overview Tab
// Small helper component to render top-level KPIs
const OverviewCards = ({ summary = {}, pendingRequests = [], issues = [], technicians = [], onOpenTab }) => {
  const totalIssues = summary.totalIssues ?? summary.issuesCount ?? (Array.isArray(issues) ? issues.length : 0) ?? 0;
  const completed = summary.completed ?? 0;
  const completionRate = summary.completionRate ?? (totalIssues ? Math.round((completed / Math.max(1, totalIssues)) * 100) : (completed ? Math.round(completed * 100) : 0));
  const openRequests = Array.isArray(pendingRequests) ? pendingRequests.length : (summary.pendingRequests ?? summary.pending ?? 0);
  const techniciansCount = Array.isArray(technicians) ? technicians.length : (summary.techniciansCount ?? summary.techCount ?? 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Issues', value: totalIssues, tab: 'issues', tone: 'from-blue-600 to-cyan-600', border: 'border-blue-100' },
        { label: 'Completion Rate', value: `${completionRate}%`, tab: 'issues', tone: 'from-emerald-600 to-teal-600', border: 'border-emerald-100' },
        { label: 'Pending Approvals', value: openRequests, tab: 'requests', tone: 'from-amber-600 to-orange-600', border: 'border-amber-100' },
        { label: 'Users', value: techniciansCount, tab: 'people', tone: 'from-slate-700 to-slate-900', border: 'border-slate-200' }
      ].map((card) => (
        <button
          key={card.label}
          onClick={() => onOpenTab && onOpenTab(card.tab)}
          className={`group p-4 rounded-xl border ${card.border} bg-white shadow-sm hover:shadow-md transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</div>
              <div className="text-2xl font-black text-gray-900 mt-1">{card.value}</div>
            </div>
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.tone} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
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
  loadingRecs,
  recsError,
  exportToPDF,
  exportToExcel
}) => (
  <div className="space-y-8">
    {/* Overview Cards */}
    <OverviewCards
      summary={summary}
      pendingRequests={pendingRequests}
      issues={issues}
      technicians={technicians}
      onOpenTab={setActiveTab}
    />

    {/* AI Insights Section */}
    <AIInsights
      aiSentiment={aiSentiment}
      loadingAI={loadingAI}
      aiError={aiError}
      aiRecommendations={aiRecommendations}
      loadingRecs={loadingRecs}
      recsError={recsError}
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
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
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
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold">
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
                      <button onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-green-100 rounded-lg transition-colors">
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

// Enhanced Requests Tab with Table
const RequestsTab = ({
  pendingRequests,
  setSelectedRequest,
  setShowApprovalModal,
  onOpenDetails,
  technicians,
  assigning,
  assignmentData,
  setAssignmentData,
  handleOpenAssignment,
  handleAssignTech,
  onRefresh
}) => {
  const selection = useBulkSelection(pendingRequests, (request) => request._id || request.id);

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
          <div className="px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
            <span className="text-orange-700 font-semibold">{pendingRequests.length} pending</span>
          </div>
        </div>
      </div>
    </div>

    <BulkActionBar count={selection.selectedIds.length} label="requests" onDelete={handleDeleteSelected} />

    {pendingRequests.length === 0 ? (
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
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selection.allSelected}
                    onChange={(e) => selection.toggleAll(e.target.checked)}
                  />
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Request ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request, i) => {
                const reqId = request._id || request.id;
                return (
                  <React.Fragment key={reqId || `pending-${i}`}>
                    <tr
                      onClick={() => onOpenDetails && onOpenDetails('request', request)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selection.selectedIds.includes(String(reqId))}
                          onChange={() => selection.toggleOne(reqId)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        {/* Show whether this pending request is an authenticated inspection or anonymous request */}
                        <div className="inline-flex items-center gap-2">
                          {request.submissionType === 'inspection' ? (
                            <span className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">Inspection</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">Request</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-bold text-blue-600 font-mono">
                          {String(normalizeId(request._id || request.id)).slice(-8)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {/* Photo attachment */}
                          {(request.beforePhoto || request.photo) && (() => {
                            const photoPath = request.beforePhoto || request.photo;
                            const photoUrl = getImageUrl(photoPath);
                            const ext = photoPath.split('.').pop().toLowerCase();
                            const browserUnsupported = ['heic', 'heif', 'tiff', 'tif', 'bmp'].includes(ext);
                            if (browserUnsupported) {
                              return (
                                <a
                                  href={photoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                                  title={`Download photo (.${ext})`}
                                >
                                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                                  Photo (.{ext})
                                </a>
                              );
                            }
                            return (
                              <img
                                src={photoUrl}
                                alt={request.title}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                                onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                              />
                            );
                          })()}
                          <div>
                            <div className="text-sm font-bold text-gray-900">{request.title}</div>
                            {/* File attachments (PDFs etc.) */}
                            {Array.isArray(request.files) && request.files.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {request.files.map((filePath, fi) => {
                                  const fileUrl = getImageUrl(filePath);
                                  const fileName = filePath.split('/').pop();
                                  const fileExt = fileName.split('.').pop().toLowerCase();
                                  return (
                                    <a
                                      key={fi}
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                      title={fileName}
                                    >
                                      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                      .{fileExt}
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{request.description}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{request.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <PriorityBadge priority={request.priority || 'MEDIUM'} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-700">
                          {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          {new Date(request.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <GradientButton
                            onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); setShowApprovalModal(true); }}
                            color="green"
                            className="px-3 py-1.5 text-xs"
                          >
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              Review
                            </span>
                          </GradientButton>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {assigning === normalizeId(reqId) && (
                      <tr>
                        <td colSpan="9" className="p-0 border-b border-gray-50">
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

// ─── Material Requests Tab ────────────────────────────────────────────────────
const MaterialRequestsTab = ({ materialRequests = [], onRefresh, onOpenDetails }) => {
  const [forwardModal, setForwardModal] = useState(null); // holds the request being forwarded
  const [clientEmail, setClientEmail] = useState('');
  const [forwarding, setForwarding] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
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
    if (s === 'PENDING') return '⏳';
    if (s === 'FORWARDED') return '📤';
    if (s === 'APPROVED') return '✅';
    if (s === 'DECLINED') return '❌';
    return '📦';
  };

  const filtered = filterStatus === 'ALL'
    ? materialRequests
    : materialRequests.filter(r => r.status === filterStatus);
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
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
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
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <span className="text-base">↻</span> Refresh
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {['ALL', 'PENDING', 'FORWARDED', 'APPROVED', 'DECLINED'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterStatus === s ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {statusIcon(s)} {s} {counts[s] > 0 && <span className="ml-1 opacity-70">({counts[s]})</span>}
          </button>
        ))}
      </div>

      <BulkActionBar count={selection.selectedIds.length} label="material requests" onDelete={handleDeleteSelected} />

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Requests Found</h3>
          <p className="text-gray-500 text-sm">
            {filterStatus === 'ALL' ? 'Technicians haven\'t submitted any material requests yet.' : `No ${filterStatus.toLowerCase()} requests at this time.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
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
                  const materialTitle = req.items?.[0]?.title || req.items?.[0]?.materialId || '—';
                  const qty = req.items?.[0]?.quantity ?? '—';
                  return (
                    <tr
                      key={reqId || idx}
                      onClick={() => onOpenDetails && onOpenDetails('material', req)}
                      className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
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
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
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
                        <p className="text-sm text-gray-600 line-clamp-2">{req.description || '—'}</p>
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
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
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
                  <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
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
                  {forwarding ? '⏳ Sending…' : '📤 Forward Request'}
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

  const [currentDate, setCurrentDate] = useState(new Date("2026-02-24"));
  const [viewType, setViewType] = useState('Day');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUnscheduled, setShowUnscheduled] = useState(true);
  const [schedulerPopover, setSchedulerPopover] = useState(null); // 'unscheduled-status', 'unscheduled-priority', 'team-view', etc.

  // Local filters for unscheduled work orders
  const [unscheduledFilters, setUnscheduledFilters] = useState({
    status: [],
    priority: []
  });

  const cardsPerPage = 5;
  const filteredUnscheduled = issues.filter(issue => {
    if (unscheduledFilters.status.length > 0 && !unscheduledFilters.status.includes(issue.status)) return false;
    if (unscheduledFilters.priority.length > 0 && !unscheduledFilters.priority.includes(issue.priority)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredUnscheduled.length / cardsPerPage) || 1;
  const currentIssues = filteredUnscheduled.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);

  // Hardcoded time slots for the day view
  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-amber-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-400';
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
    <div className="flex flex-col gap-8 bg-white min-h-screen">
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
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">109</span>
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
              {technicians.length > 0 ? technicians.map((tech, idx) => (
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
                      <span className="text-[10px] font-bold text-orange-500">0%</span>
                      <div className="w-3 h-3 rounded-full border border-gray-200" />
                    </div>
                  </div>
                  {timeSlots.map(slot => (
                    <div key={slot} className="flex-1 border-l border-gray-50 p-2 group-hover:bg-gray-50/30 transition-colors" />
                  ))}
                </div>
              )) : (
                <div className="p-8 text-center text-gray-400 text-sm italic">No technicians found</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
// ── Analytics Tab ────────────────────────────────────────────────────────────
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
    <div className="flex flex-col gap-0 bg-white min-h-screen -m-6">
      {/* Sub-Tab Navigation */}
      <div className="flex items-center justify-between px-6 pt-4 border-b border-gray-100 bg-white sticky top-0 z-10">
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
        <div className="flex items-center gap-3 pb-3">
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

      <div className="p-6 flex gap-6">
        {/* Main Chart Area */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
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
                            <div className="text-lg font-bold text-gray-900">{loadingMetrics ? '—' : `${metrics.completionRate}%`}</div>
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
                    <div className="mt-2 text-sm font-bold text-gray-800">{loadingMetrics ? '—' : `${metrics.avgResponseHrs} hrs`}</div>
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
                    <div className="mt-2 text-sm font-bold text-gray-800">{loadingMetrics ? '—' : `${metrics.avgCycleHrs} hrs`}</div>
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
                    <div className="mt-2 text-sm font-bold text-rose-600">{loadingMetrics ? '—' : metrics.backlog}</div>
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
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-black text-gray-900">AI Insights</span>
              <span className="ml-auto px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full">LIVE</span>
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
    </div>
  );
};

// ── Meters Tab ────────────────────────────────────────────────────────────────
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

  const filtered = (meters || []).filter(m =>
    (meterFilter === 'All' || m.type === meterFilter) &&
    ((m.name || '').toLowerCase().includes(meterSearch.toLowerCase()) || (m.location || '').toLowerCase().includes(meterSearch.toLowerCase()))
  );
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
              <select value={newMeter.type} onChange={e => setNewMeter({ ...newMeter, type: e.target.value, unit: e.target.value === 'Water' ? 'm³' : 'kWh' })} className="p-2 border rounded">
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
          { label: 'Total Water', value: `${((meters || []).filter(m => m.type === 'Water').reduce((s, m) => s + (Number(m.reading) || 0), 0)).toLocaleString()} m³`, icon: '💧', color: 'from-blue-50 to-cyan-50 border-blue-100' },
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
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
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

// ── Edge Tab ──────────────────────────────────────────────────────────────────
const EdgeTab = () => {
  const [edgeFilter, setEdgeFilter] = useState('All');
  const [edgeSearch, setEdgeSearch] = useState('');
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const statuses = ['All', 'Online', 'Offline'];

  const typeIcon = { Camera: '📷', Sensor: '📡', Network: '🌐', Lock: '🔒', Controller: '🎛️' };

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

  const filtered = (devices || []).filter(d =>
    (edgeFilter === 'All' || d.status === edgeFilter) &&
    ((d.name || '').toLowerCase().includes(edgeSearch.toLowerCase()) || (d.location || '').toLowerCase().includes(edgeSearch.toLowerCase()))
  );
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
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
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
                  <td className="py-4 px-4 text-sm">{d.battery != null ? `${d.battery}%` : '—'}</td>
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
  const selection = useBulkSelection(assets, (asset) => asset._id || asset.id);

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
    if (!assets || assets.length === 0) return;
    const keys = ['id', 'name', 'category', 'propertyName', 'purchaseCost'];
    const rows = assets.map(a => ({
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
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
          <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Import</button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={onImport} className="hidden" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <BulkActionBar count={selection.selectedIds.length} label="assets" onDelete={handleDeleteSelected} />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
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
              {assets.map((a, idx) => (
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
                  <td className="py-4 px-4 text-sm font-black text-gray-900">{a.purchaseCost ? `$${Number(a.purchaseCost).toFixed(2)}` : '—'}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><MoreHorizontal className="w-4 h-4 text-gray-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
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
  const [assetNameQuery, setAssetNameQuery] = useState('');
  const selection = useBulkSelection(locations, (loc) => loc._id || loc.id);
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
    if (!locations || locations.length === 0) return;
    const keys = ['id', 'name', 'address', 'assetCount'];
    const rows = locations.map(l => ({ id: l.id || l._id || '', name: l.name || l.title || '', address: l.address || l.street || '', assetCount: (assets.filter(a => String(a.propertyId) === String(l._id || l.id)).length) }));
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
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <BulkActionBar count={selection.selectedIds.length} label="locations" onDelete={handleDeleteSelected} />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
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
              {locations.map((l, idx) => (
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
              {locations.length === 0 && (<tr><td colSpan="8" className="py-20 text-center"><p className="text-gray-500">No locations found</p></td></tr>)}
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
                <button onClick={() => openEdit(selectedLocation)} className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700">
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
                        <div className="text-emerald-700">Purchase Cost: {found.purchaseCost ? `$${Number(found.purchaseCost).toLocaleString()}` : '—'}</div>
                        <div className="text-emerald-700">Category: {found.category || found.type || '—'}</div>
                      </div>
                    );
                  })()}
                </div>
              )}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
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
const PeopleTab = ({ technicians = [], allIssues = [], onRefresh }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: '', email: '', phone: '', role: 'Technician', password: '', specialization: '' });
  const [newTeam, setNewTeam] = useState({ name: '', members: [] });
  const [teamImageFile, setTeamImageFile] = useState(null);
  const [teamImagePreview, setTeamImagePreview] = useState(null);
  const [teamExtractFromFiles, setTeamExtractFromFiles] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [editTeamImageFile, setEditTeamImageFile] = useState(null);
  const [editTeamImagePreview, setEditTeamImagePreview] = useState(null);
  const [showViewTeam, setShowViewTeam] = useState(false);
  const [viewTeam, setViewTeam] = useState(null);
  const [showMapExtracted, setShowMapExtracted] = useState(false);
  const [mappingState, setMappingState] = useState([]); // { idx, existingId, newName, newEmail }
  const [teamFiles, setTeamFiles] = useState([]);
  const [teamFilesPreview, setTeamFilesPreview] = useState([]);
  const [editTeamFiles, setEditTeamFiles] = useState([]);
  const [editTeamFilesPreview, setEditTeamFilesPreview] = useState([]);
  const [editTeamExtractFromFiles, setEditTeamExtractFromFiles] = useState(false);


  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // Only fetch teams; technicians are passed via props
    api.get('/api/teams')
      .then((res) => {
        if (!mounted) return;
        setTeams(res.data || []);
      })
      .catch(err => {
        console.warn('[Teams] fetch failed:', err.message);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const exportCSV = () => {
    if (!technicians || technicians.length === 0) return;
    const keys = ['id', 'name', 'email', 'phone', 'role'];
    const rows = technicians.map(t => ({
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
      const isUserRole = ['Admin', 'Client', 'Requestor'].includes(role);

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
        alert('External Technician created successfully');
      }

      setShowAddPerson(false);
      // Since technicians is a prop, we call onRefresh to tell parent to refetch
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to create person', err);
      alert('Failed to create person: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('name', newTeam.name || '');
      // append members as JSON string (if user chose extraction we still send members array but set flag)
      form.append('members', JSON.stringify(newTeam.members || []));
      if (teamExtractFromFiles) form.append('extractMembers', 'true');
      if (teamImageFile) form.append('image', teamImageFile);
      if (teamFiles && teamFiles.length) for (const f of teamFiles) form.append('files', f);

      const res = await api.post('/api/teams', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTeams(prev => [res.data, ...(prev || [])]);
      setShowAddTeam(false);
      setNewTeam({ name: '', members: [] });
      setTeamImageFile(null);
      setTeamImagePreview(null);
      setTeamFiles([]);
      setTeamFilesPreview([]);
    } catch (err) {
      console.error('Failed to create team', err);
      alert('Failed to create team');
    }
  };

  const openEditTeam = (team) => {
    setEditTeam(team);
    setEditTeamImagePreview(team.image ? getImageUrl(team.image) : null);
    setEditTeamImageFile(null);
    setEditTeamFiles([]);
    setEditTeamFilesPreview([]);
    setShowEditTeam(true);
  };

  const openViewTeam = (team) => {
    (async () => {
      try {
        const id = team.id || team._id;
        if (id) {
          const res = await api.get(`/api/teams/${id}`);
          if (res && res.data) {
            setViewTeam(res.data);
          } else {
            setViewTeam(team);
          }
        } else {
          setViewTeam(team);
        }
      } catch (e) {
        console.warn('Failed to fetch team details, using provided object', e);
        setViewTeam(team);
      } finally {
        setShowViewTeam(true);
        setShowMapExtracted(false);
        setMappingState([]);
      }
    })();
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!editTeam) return;
    try {
      const form = new FormData();
      form.append('name', editTeam.name || '');
      form.append('members', JSON.stringify(editTeam.members || []));
      if (editTeamExtractFromFiles) form.append('extractMembers', 'true');
      if (editTeamImageFile) form.append('image', editTeamImageFile);
      if (editTeamFiles && editTeamFiles.length) for (const f of editTeamFiles) form.append('files', f);

      const id = editTeam.id || editTeam._id;
      const res = await api.put(`/api/teams/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTeams(prev => prev.map(t => (String(t._id || t.id) === String(id) ? res.data : t)));
      setShowEditTeam(false);
      setEditTeam(null);
      setEditTeamImageFile(null);
      setEditTeamFiles([]);
      setEditTeamImagePreview(null);
      setEditTeamFilesPreview([]);
    } catch (err) {
      console.error('Failed to update team', err);
      alert('Failed to update team');
    }
  };

  const handleDeletePerson = async (id) => {
    if (!confirm('Delete this technician?')) return;
    try {
      await api.delete(`/api/technicians/${id}`);
      if (onRefresh) onRefresh();
      alert('Technician deleted successfully');
    } catch (err) {
      console.error('Failed to delete technician', err);
      alert('Failed to delete technician: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!confirm('Delete this team?')) return;
    try {
      await api.delete(`/api/teams/${id}`);
      setTeams(prev => (prev || []).filter(t => String(t._id || t.id) !== String(id)));
    } catch (err) {
      console.error('Failed to delete team', err);
      alert('Failed to delete team');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">People & Teams</h2>
          <p className="text-sm text-gray-500 mt-0.5">External Technicians and Vendor Teams</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
          <button onClick={() => setShowAddPerson(true)} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Add Person</button>
          <button onClick={() => setShowAddTeam(true)} className="px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">Add Team</button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
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
                const externalOnly = (technicians || []).filter(t => t.type === 'EXTERNAL');
                if (externalOnly.length === 0) {
                  return <tr><td colSpan="7" className="py-20 text-center"><p className="text-gray-500">No external technicians found</p></td></tr>;
                }
                return externalOnly.map((t, idx) => (
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

      {/* Teams List */}
      <div className="mt-6 bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-md font-bold">Teams</h3>
            <p className="text-xs text-gray-500">Teams and members</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Members</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(teams || []).map((tm, i) => (
                <tr key={tm._id || tm.id || `team-${i}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4"><div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {tm.image ? <img src={getImageUrl(tm.image)} alt={tm.name} className="w-full h-full object-cover" /> : <div className="text-sm text-gray-600">{(tm.name || 'T').slice(0, 1)}</div>}
                  </div></td>
                  <td className="py-3 px-4"><div className="text-sm font-bold text-gray-900">{tm.name || 'Unnamed'}</div></td>
                  <td className="py-3 px-4 text-sm text-gray-600">{
                    (() => {
                      if (!tm.members || tm.members.length === 0) return '-';
                      const membersArray = Array.isArray(tm.members) ? tm.members : (tm.members ? String(tm.members).split(',') : []);
                      const names = membersArray.map(entry => {
                        if (!entry && entry !== 0) return null;
                        if (typeof entry === 'object') return entry.name || entry.email || null;
                        const raw = String(entry).trim();
                        // Match against external technicians
                        const found = technicians.find(p => String(p.id || p._id) === raw || String(p._id) === raw);
                        if (found) return found.name || found.email;
                        if (raw.startsWith('{') || raw.startsWith('[')) {
                          try {
                            const parsed = JSON.parse(raw);
                            if (parsed && typeof parsed === 'object') return parsed.name || parsed.email || null;
                          } catch (e) { }
                        }
                        if (raw.includes(',') || raw.includes(';')) {
                          const first = raw.split(/[,;]+/)[0].replace(/^["']|["']$/g, '').trim();
                          if (first && first.length < 120) return first;
                        }
                        const emailMatch = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
                        if (emailMatch) return emailMatch[0];
                        return raw.length > 12 ? raw.slice(0, 12) + '...' : raw;
                      }).filter(Boolean);
                      return names.slice(0, 3).join(', ') + (names.length > 3 ? ` (+${names.length - 3})` : '');
                    })()
                  }</td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-mono">{String(tm._id || tm.id || '').slice(-8)}</td>
                  <td className="py-3 px-4 text-right"><div className="flex items-center justify-end gap-2">
                    <button onClick={() => openViewTeam(tm)} title="View team" className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button>
                    <button onClick={() => openEditTeam(tm)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-green-600" /></button>
                    <button onClick={() => handleDeleteTeam(tm._id || tm.id)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Trash2 className="w-4 h-4 text-red-600" /></button>
                  </div></td>
                </tr>
              ))}
              {(teams || []).length === 0 && (<tr><td colSpan="5" className="py-16 text-center"><p className="text-gray-500">No teams found</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Person Modal */}
      {showAddPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddPerson(false)} />
          <form onSubmit={handleCreatePerson} className="bg-white rounded-xl p-6 z-50 w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Add Person</h3>
            <div className="flex flex-col gap-2">
              <input className="border p-2 rounded" placeholder="Name" value={newPerson.name} onChange={e => setNewPerson({ ...newPerson, name: e.target.value })} />
              <input className="border p-2 rounded" placeholder="Email" value={newPerson.email} onChange={e => setNewPerson({ ...newPerson, email: e.target.value })} />
              <input className="border p-2 rounded" placeholder="Phone" value={newPerson.phone} onChange={e => setNewPerson({ ...newPerson, phone: e.target.value })} />
              <input className="border p-2 rounded" type="password" placeholder="Password" value={newPerson.password} onChange={e => setNewPerson({ ...newPerson, password: e.target.value })} />
              <input className="border p-2 rounded" placeholder="Specialization (e.g. Plumbing, HVAC)" value={newPerson.specialization} onChange={e => setNewPerson({ ...newPerson, specialization: e.target.value })} />
              <select className="border p-2 rounded" value={newPerson.role} onChange={e => setNewPerson({ ...newPerson, role: e.target.value })}>
                <option>Technician</option>
                <option>Manager</option>
                <option>Staff</option>
                <option>Admin</option>
                <option>Client</option>
                <option>Requestor</option>
              </select>
              <div className="flex items-center justify-end gap-2 mt-3">
                <button type="button" onClick={() => setShowAddPerson(false)} className="px-3 py-2 rounded border">Cancel</button>
                <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Create</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Add Team Modal */}
      {showAddTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddTeam(false)} />
          <form onSubmit={handleCreateTeam} className="bg-white rounded-xl p-6 z-50 w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Add Team</h3>
            <div className="flex flex-col gap-2">
              <input className="border p-2 rounded" placeholder="Team Name" value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} />
              <label className="text-sm text-gray-600">Members</label>
              <select multiple className="border p-2 rounded h-32" value={newTeam.members} onChange={e => setNewTeam({ ...newTeam, members: Array.from(e.target.selectedOptions).map(o => o.value) })}>
                {(technicians || []).map(p => (<option key={(p.id || p._id)} value={p.id || p._id}>{p.name || p.email}</option>))}
              </select>
              <label className="text-sm text-gray-600 mt-2">Team Image (optional)</label>
              <input type="file" accept="image/*" onChange={e => {
                const f = e.target.files && e.target.files[0];
                setTeamImageFile(f || null);
                setTeamImagePreview(f ? URL.createObjectURL(f) : null);
              }} />
              {teamImagePreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <img src={teamImagePreview} alt="preview" className="w-24 h-24 object-cover rounded-md border" />
                </div>
              )}
              <label className="text-sm text-gray-600 mt-2">Attachments (optional)</label>
              <input type="file" multiple onChange={e => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                setTeamFiles(files);
                setTeamFilesPreview(files.map(f => f.name));
              }} />
              <div className="flex items-center gap-2 mt-2">
                <input id="extractMembers" type="checkbox" checked={teamExtractFromFiles} onChange={e => setTeamExtractFromFiles(e.target.checked)} />
                <label htmlFor="extractMembers" className="text-sm text-gray-600">Populate members from uploaded files (CSV, XLSX, PDF, DOCX, images)</label>
              </div>
              {teamFilesPreview && teamFilesPreview.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  <p className="mb-1">Files:</p>
                  <ul className="list-disc ml-5">
                    {teamFilesPreview.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex items-center justify-end gap-2 mt-3">
                <button type="button" onClick={() => setShowAddTeam(false)} className="px-3 py-2 rounded border">Cancel</button>
                <button type="submit" className="px-3 py-2 rounded bg-green-600 text-white">Create Team</button>
              </div>
            </div>
          </form>
        </div>
      )}
      {/* Edit Team Modal */}
      {showEditTeam && editTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEditTeam(false)} />
          <form onSubmit={handleUpdateTeam} className="bg-white rounded-xl p-6 z-50 w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Edit Team</h3>
            <div className="flex flex-col gap-2">
              <input className="border p-2 rounded" placeholder="Team Name" value={editTeam.name || ''} onChange={e => setEditTeam({ ...editTeam, name: e.target.value })} />
              <label className="text-sm text-gray-600">Members</label>
              <select multiple className="border p-2 rounded h-32" value={editTeam.members || []} onChange={e => setEditTeam({ ...editTeam, members: Array.from(e.target.selectedOptions).map(o => o.value) })}>
                {(technicians || []).map(p => (<option key={(p.id || p._id)} value={p.id || p._id}>{p.name || p.email}</option>))}
              </select>
              <label className="text-sm text-gray-600 mt-2">Team Image (optional)</label>
              <input type="file" accept="image/*" onChange={e => {
                const f = e.target.files && e.target.files[0];
                setEditTeamImageFile(f || null);
                setEditTeamImagePreview(f ? URL.createObjectURL(f) : (editTeam.image ? getImageUrl(editTeam.image) : null));
              }} />
              {editTeamImagePreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <img src={editTeamImagePreview} alt="preview" className="w-24 h-24 object-cover rounded-md border" />
                </div>
              )}
              <label className="text-sm text-gray-600 mt-2">Attachments (optional)</label>
              <input type="file" multiple onChange={e => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                setEditTeamFiles(files);
                setEditTeamFilesPreview(files.map(f => f.name));
              }} />
              <div className="flex items-center gap-2 mt-2">
                <input id="editExtractMembers" type="checkbox" checked={editTeamExtractFromFiles} onChange={e => setEditTeamExtractFromFiles(e.target.checked)} />
                <label htmlFor="editExtractMembers" className="text-sm text-gray-600">Populate members from uploaded files (CSV, XLSX, PDF, DOCX, images)</label>
              </div>
              {editTeamFilesPreview && editTeamFilesPreview.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  <p className="mb-1">Files:</p>
                  <ul className="list-disc ml-5">
                    {editTeamFilesPreview.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex items-center justify-end gap-2 mt-3">
                <button type="button" onClick={() => setShowEditTeam(false)} className="px-3 py-2 rounded border">Cancel</button>
                <button type="submit" className="px-3 py-2 rounded bg-green-600 text-white">Save</button>
              </div>
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
  React.useEffect(() => {
    // try to fetch maintenance templates if API exists
    (async () => {
      try {
        const res = await api.get('/api/maintenance-templates');
        setItems(res.data || []);
      } catch (e) {
        setItems([]);
      }
    })();
  }, []);

  const exportCSV = () => {
    if (!items || items.length === 0) return;
    const keys = ['id', 'name', 'steps'];
    const rows = items.map(it => ({ id: it._id || it.id || '', name: it.name || it.title || '', steps: Array.isArray(it.steps) ? it.steps.length : '' }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g, '""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'checklists-export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Checklists</h2>
          <p className="text-sm text-gray-500 mt-0.5">Maintenance checklists and templates</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Steps</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it._id || it.id || `chk-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4"><div className="text-sm font-bold text-gray-900">{it.name || it.title || 'Unnamed'}</div></td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">{String(it._id || it.id || '').slice(-8)}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{Array.isArray(it.steps) ? it.steps.length : '-'}</td>
                  <td className="py-4 px-4 text-right"><div className="flex items-center justify-end gap-2"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button></div></td>
                </tr>
              ))}
              {items.length === 0 && (<tr><td colSpan="4" className="py-20 text-center"><p className="text-gray-500">No checklists/templates found</p></td></tr>)}
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
  const selection = useBulkSelection(items, (item) => item._id || item.id);
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
    if (!items || items.length === 0) return;
    const keys = ['id', 'name', 'status', 'availableQty', 'allocatedQty', 'onHand', 'incomingQty', 'location', 'barcode'];
    const rows = items.map(it => ({
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
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
          <button onClick={downloadTemplate} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Download Template</button>
          <button onClick={() => setShowAddItem(true)} className="px-3 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold">Add Person</button>
          <button onClick={() => fileRef.current && fileRef.current.click()} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Add From File</button>
          <input ref={fileRef} type="file" accept=".csv" onChange={onImport} className="hidden" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <BulkActionBar count={selection.selectedIds.length} label="parts" onDelete={handleDeleteSelected} />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
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
              {items.map((it, idx) => (
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
              {items.length === 0 && (<tr><td colSpan="9" className="py-20 text-center"><p className="text-gray-500">No parts or inventory found</p></td></tr>)}
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
  useEffect(() => {
    (async () => {
      try { const res = await api.get('/api/purchase-orders'); setOrders(res.data || []); } catch (e) { setOrders([]); }
    })();
  }, []);

  const exportCSV = () => {
    if (!orders || orders.length === 0) return;
    const keys = ['id', 'title', 'poNumber', 'itemsCount', 'totalCost', 'vendor', 'createdBy'];
    const rows = orders.map(o => ({ id: o._id || o.id || '', title: o.title || o.name || '', poNumber: o.poNumber || o.number || '', itemsCount: Array.isArray(o.items) ? o.items.length : '', totalCost: o.totalCost || o.cost || '', vendor: o.vendor?.name || o.vendor || '', createdBy: o.createdBy?.name || o.createdBy || '' }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g, '""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'purchase-orders.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Purchase Orders</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create, view and export purchase orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
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
              {orders.map((o, idx) => (
                <tr key={o._id || o.id || `po-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">{o.title || o.name || 'PO'}</td>
                  <td className="py-4 px-4">{o.poNumber || o.number || '-'}</td>
                  <td className="py-4 px-4">{Array.isArray(o.items) ? o.items.length : (o.itemsCount || '-')}</td>
                  <td className="py-4 px-4">{o.totalCost ? `$${Number(o.totalCost).toFixed(2)}` : '-'}</td>
                  <td className="py-4 px-4">{o.vendor?.name || o.vendor || '-'}</td>
                  <td className="py-4 px-4 text-right"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button></td>
                </tr>
              ))}
              {orders.length === 0 && (<tr><td colSpan="6" className="py-20 text-center"><p className="text-gray-500">No purchase orders found</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Vendors & Customers Tab
const VendorsTab = () => {
  const [vendors, setVendors] = useState([]);
  const fileRef = React.useRef(null);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [creatingVendor, setCreatingVendor] = useState(false);
  const selection = useBulkSelection(vendors, (vendor) => vendor._id || vendor.id);
  const [newVendor, setNewVendor] = useState({ name: '', address: '', phone: '', contact: '', email: '' });
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

  const exportCSV = () => {
    if (!vendors || vendors.length === 0) return;
    const keys = ['id', 'name', 'type', 'address', 'phone', 'contact', 'email'];
    const rows = vendors.map(v => ({
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
        const res = await api.post('/api/vendors/bulk', { items: itemsPayload });
        setVendors(prev => [...(res.data || []), ...(prev || [])]);
        alert(`Imported ${itemsPayload.length} vendors/customers`);
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
        const res = await api.post('/api/vendors', {
          name: newVendor.name,
          address: newVendor.address,
          phone: newVendor.phone,
          contactName: newVendor.contact,
          email: newVendor.email
        });
        created = res.data;
      } catch (err) {
        const res = await api.post('/api/clients', {
          name: newVendor.name,
          address: newVendor.address,
          phone: newVendor.phone,
          contactName: newVendor.contact,
          email: newVendor.email
        });
        created = res.data;
      }
      setVendors(prev => [created, ...(prev || [])]);
      setShowAddVendor(false);
      setNewVendor({ name: '', address: '', phone: '', contact: '', email: '' });
      alert('Vendor/Customer added successfully');
    } catch (err) {
      console.error('Failed to add vendor/customer', err);
      alert('Failed to add vendor/customer: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreatingVendor(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selection.selectedIds.length === 0) return;
    const selectedItems = (vendors || []).filter((v) => selection.selectedIds.includes(String(v._id || v.id)));
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
      alert('Failed to delete selected vendors: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vendors & Customers</h2>
          <p className="text-sm text-gray-500 mt-0.5">Suppliers and customer contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Export CSV</button>
          <button onClick={downloadTemplate} className="px-3 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">Download Template</button>
          <button onClick={() => setShowAddVendor(true)} className="px-3 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold">Add Person</button>
          <button onClick={() => fileRef.current && fileRef.current.click()} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Import CSV</button>
          <input ref={fileRef} type="file" accept=".csv" onChange={onImport} className="hidden" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <BulkActionBar count={selection.selectedIds.length} label="vendors" onDelete={handleDeleteSelected} />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
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
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Address</th>
                <th className="py-4 px-4">Phone Number</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v, idx) => (
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
                  <td className="py-4 px-4">{v.__typeLabel || v.type || v.role || 'Customer'}</td>
                  <td className="py-4 px-4">{v.address || v.street || 'N/A'}</td>
                  <td className="py-4 px-4">{v.phone || v.phoneNumber || 'N/A'}</td>
                  <td className="py-4 px-4">{v.contactName || v.contact || 'N/A'}</td>
                  <td className="py-4 px-4">{v.email || 'N/A'}</td>
                  <td className="py-4 px-4 text-right"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button></td>
                </tr>
              ))}
              {vendors.length === 0 && (<tr><td colSpan="8" className="py-20 text-center"><p className="text-gray-500">No vendors/customers found</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {showAddVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form onSubmit={handleCreateVendor} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Vendor/Customer</h3>
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
    dueDate: '',
    technicianId: ''
  });

  const filtered = issues.filter(issue =>
    issue.title?.toLowerCase().includes(localSearch.toLowerCase()) ||
    issue.description?.toLowerCase().includes(localSearch.toLowerCase())
  );
  const selection = useBulkSelection(filtered, (issue) => issue._id || issue.id);

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
        dueDate: newTask.dueDate || undefined,
        tags: ['preventive'],
        issueType: 'preventive',
        category: 'preventive',
        internalTechnicianId: newTask.technicianId || undefined
      };
      await api.post('/api/issues', payload);
      setShowCreate(false);
      setNewTask({ title: '', description: '', location: '', assetId: '', priority: 'MEDIUM', dueDate: '', technicianId: '' });
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
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
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
                  <td colSpan="9" className="py-24 text-center">
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
  onRefresh
}) => {
  const selection = useBulkSelection(issues, (issue) => issue._id || issue.id);

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
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
      <BulkActionBar count={selection.selectedIds.length} label="work orders" onDelete={handleDeleteSelected} />
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#fcfcfd] border-b border-gray-100">
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
            {issues.map((issue, idx) => (
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
                              <Play className="w-1.5 h-1.5 text-white fill-white" />
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
            {issues.length === 0 && (
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
              {`🧑‍🔧 ${tech.name || tech.username || 'Unnamed'}`}
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

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
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
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-300 group"
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
                              <Play className="w-1.5 h-1.5 text-white fill-white" />
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
const FeedbackTab = ({ feedbacks, loadingFeedbacks }) => (
  <div>
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Technician Feedback</h2>
          <p className="text-gray-600">Review completion reports and feedback from technicians</p>
        </div>
        <GradientButton color="green" className="px-6">
          <span className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Feedback Overview
          </span>
        </GradientButton>
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
    ) : feedbacks.length === 0 ? (
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
        {feedbacks.map((fb, idx) => (
          <div key={fb._id || idx} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <GlassCard className="relative p-6 hover:scale-[1.02] transition-all duration-300">
              {/* Technician Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {(fb.technicianName || 'T').charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Award className="w-3 h-3 text-white" />
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
                    <div className="absolute bottom-3 left-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

const DetailsModal = ({ open, type, item, onClose, getAssignedTechName }) => {
  if (!open || !item) return null;

  const isMaterial = type === 'material';
  const isRequest = type === 'request';
  const isIssue = type === 'issue';

  const title = isMaterial ? 'Material Request Details' : isRequest ? 'Request Details' : 'Work Order Details';
  const location = item.location || item.address || item.locationName || item.propertyName || item.assetLocation || 'Not specified';
  const dueDate = item.fixDeadline || item.dueDate || item.nextDate || item.scheduledFor || null;
  const createdAt = item.createdAt || item.date || item.nextDate || null;
  const priority = item.priority || item.urgency || '—';
  const status = item.status || (item.approved ? 'APPROVED' : 'PENDING') || '—';
  const description = item.description || item.details || 'No description provided.';
  const assignee = isIssue ? (getAssignedTechName ? getAssignedTechName(item) : item.assignedTo) : (item.technicianName || item.assignedTo || 'Unassigned');

  const formatDateTime = (val) => {
    if (!val) return 'Not set';
    try { return normalizeDate(val).toLocaleString(); } catch (e) { return 'Not set'; }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-3xl w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">Details and key metadata</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900">{item.title || item.name || 'Untitled'}</h4>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200">
                  <MapPin className="w-3.5 h-3.5" /> {location}
                </span>
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200">
                  <Calendar className="w-3.5 h-3.5" /> Due: {formatDateTime(dueDate)}
                </span>
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200">
                  <Clock className="w-3.5 h-3.5" /> Created: {formatDateTime(createdAt)}
                </span>
              </div>
            </div>
            {(item.beforePhoto || item.photo || item.image || item.beforeImage || item.afterImage || item.afterPhoto) && (
              <div className="w-full md:w-56">
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={getImageUrl(item.afterImage || item.afterPhoto || item.beforeImage || item.beforePhoto || item.photo || item.image)}
                    alt="Attachment"
                    className="w-full h-40 object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white">
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <div className="text-sm font-bold text-gray-900">{String(status)}</div>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white">
              <div className="text-xs text-gray-500 mb-1">Priority</div>
              <div className="text-sm font-bold text-gray-900">{String(priority)}</div>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white">
              <div className="text-xs text-gray-500 mb-1">Assigned To</div>
              <div className="text-sm font-bold text-gray-900">{assignee || 'Unassigned'}</div>
            </div>
          </div>

          {isMaterial && (
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-800">Requested Items</div>
              <div className="p-4 space-y-2">
                {(item.items || []).length > 0 ? (
                  item.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="font-medium text-gray-900">{it.title || it.materialId || 'Item'}</div>
                      <div className="text-gray-500">Qty: {it.quantity ?? it.qty ?? '—'}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No items attached.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AIInsights = ({ aiSentiment, loadingAI, aiError, aiRecommendations, loadingRecs, recsError, exportToPDF, exportToExcel }) => {
  if (loadingAI || loadingRecs) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="p-8 bg-white/50 rounded-2xl animate-pulse text-center border border-gray-100">Analysing sentiment trends...</div>
      <div className="p-8 bg-white/50 rounded-2xl animate-pulse text-center border border-gray-100">Generating proactive recommendations...</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
  );
};

export default ManagerDashboard;
