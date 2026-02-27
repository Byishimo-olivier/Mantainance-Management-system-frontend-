import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { getImageUrl } from "../utils/imageUrl";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Header from "./Header";
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
  X
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

function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [issues, setIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
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
  const [selectedStatuses, setSelectedStatuses] = useState(['OPEN', 'IN PROGRESS']);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState(['KIGALI HEIGHTS- HQ']);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [selectedAssignedTo, setSelectedAssignedTo] = useState([]);
  const [includeSubLocations, setIncludeSubLocations] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

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

      const approvedIssues = allIssuesData.filter(issue =>
        issue.approved === true || issue.assignedTo || (issue.status !== 'PENDING' && issue.status !== 'REJECTED')
      );
      const pendingRequests = allIssuesData.filter(issue =>
        issue.status === 'PENDING' && !issue.assignedTo && !issue.approved
      );

      setIssues(approvedIssues);
      setPendingRequests(pendingRequests);
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
  }, []);

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedbacks();
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
    let allIssues = [...pendingRequests, ...issues];

    if (searchQuery) {
      allIssues = allIssues.filter(issue =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return allIssues.filter(issue => {
      // Status filter
      if (filters.status !== 'all') {
        if (filters.status === 'pending-approval' && issue.assignedTo) return false;
        if (filters.status === 'pending-approval' && issue.status !== 'PENDING') return false;
        if (filters.status === 'in-progress' && issue.status !== 'IN PROGRESS') return false;
        if (filters.status === 'completed' && issue.status !== 'COMPLETE' && issue.status !== 'COMPLETED') return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && issue.priority !== filters.priority) return false;

      // Assigned filter
      if (filters.assignedTo !== 'all') {
        if (filters.assignedTo === 'unassigned' && issue.assignedTo) return false;
        if (filters.assignedTo === 'assigned' && !issue.assignedTo) return false;
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

  const NavItem = ({ active, onClick, icon: Icon, label, badge, badgeColor = "bg-blue-600" }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${active
        ? 'bg-blue-50 text-blue-700 shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 transition-colors ${active ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
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
    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title={title}>
      <Icon className="w-5 h-5" />
    </button>
  );

  const SectionLabel = ({ children }) => (
    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900">
      {/* Sidebar Redesign */}
      <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-900">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
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
            label="Dashboard"
          />
          <NavItem
            active={false}
            onClick={() => { }}
            icon={Brain}
            label="Intelligence"
            badge="New"
            badgeColor="bg-blue-600"
          />
          <NavItem
            active={false}
            onClick={() => { }}
            icon={Video}
            label="Studio"
            badge="New"
            badgeColor="bg-blue-600"
          />

          <SectionLabel>Core</SectionLabel>
          <NavItem
            active={activeTab === 'issues'}
            onClick={() => setActiveTab('issues')}
            icon={FileText}
            label="Work Orders"
          />
          <NavItem
            active={activeTab === 'preventive-maintenance'}
            onClick={() => setActiveTab('preventive-maintenance')}
            icon={CheckCircle}
            label="Preventive Maintenance"
          />
          <NavItem
            active={activeTab === 'scheduler'}
            onClick={() => setActiveTab('scheduler')}
            icon={Calendar}
            label="Scheduler"
          />
          <NavItem
            active={activeTab === 'requests'}
            onClick={() => setActiveTab('requests')}
            icon={MessageSquare}
            label="Requests"
            badge={pendingRequests.length}
            badgeColor="bg-blue-600"
          />

          <SectionLabel>Data & Analytics</SectionLabel>
          <NavItem
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={LineChart}
            label="Analytics"
          />
          <NavItem
            active={activeTab === 'meters'}
            onClick={() => setActiveTab('meters')}
            icon={Gauge}
            label="Meters"
          />
          <NavItem
            active={activeTab === 'edge'}
            onClick={() => setActiveTab('edge')}
            icon={Smartphone}
            label="Edge"
          />

          <SectionLabel>Resources</SectionLabel>
          <NavItem
            active={activeTab === 'assets'}
            onClick={() => setActiveTab('assets')}
            icon={Box}
            label="Assets"
          />
          <NavItem
            active={activeTab === 'locations'}
            onClick={() => setActiveTab('locations')}
            icon={Map}
            label="Locations"
          />
          <NavItem
            active={activeTab === 'people'}
            onClick={() => setActiveTab('people')}
            icon={Users}
            label="People & Teams"
          />
          <NavItem
            active={activeTab === 'checklists'}
            onClick={() => setActiveTab('checklists')}
            icon={ClipboardCheck}
            label="Checklists"
          />
          <NavItem
            active={false}
            onClick={() => { }}
            icon={Database}
            label="Files"
          />

          <SectionLabel>Procurement</SectionLabel>
          <NavItem
            active={activeTab === 'parts'}
            onClick={() => setActiveTab('parts')}
            icon={Package}
            label="Parts & Inventory"
            badge="1"
            badgeColor="bg-blue-600"
          />
          <NavItem
            active={activeTab === 'purchase-orders'}
            onClick={() => setActiveTab('purchase-orders')}
            icon={ShoppingCart}
            label="Purchase Orders"
            badge="1"
            badgeColor="bg-blue-600"
          />
          <NavItem
            active={activeTab === 'vendors'}
            onClick={() => setActiveTab('vendors')}
            icon={Contact2}
            label="Vendors & Customers"
          />
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <NavItem
              active={false}
              onClick={() => { }}
              icon={Settings}
              label="Settings"
            />
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
              <p className="text-[10px] text-gray-500 truncate capitalize">{userRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
        <div className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-900">{getFilteredIssues().length} Results Returned</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
                Sort: {activeTab === 'preventive-maintenance' ? 'Name' : 'Date Created'}
              </button>
              <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                Columns
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-8 py-1.5 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
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
              />
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
              />
            ) : activeTab === 'all-issues' ? (
              <AllIssuesTab
                filters={filters}
                setFilters={setFilters}
                getFilteredIssues={getFilteredIssues}
                getAssignedTechName={getAssignedTechName}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            ) : activeTab === 'preventive-maintenance' ? (
              <PreventiveMaintenanceTab
                issues={allIssues.filter(i => i.isPreventive || i.type === 'PREVENTIVE')}
                technicians={technicians}
                locations={locations}
                assets={assets}
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
              <AssetsTab assets={assets} />
            ) : activeTab === 'locations' ? (
              <LocationsTab locations={locations || []} assets={assets} />
            ) : activeTab === 'people' ? (
              <PeopleTab technicians={technicians || []} />
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
                  {(selectedRequest.beforePhoto || selectedRequest.photo) && (
                    <div className="md:w-1/3">
                      <div className="rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src={getImageUrl(selectedRequest.beforePhoto || selectedRequest.photo)}
                          alt="Issue"
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}
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
    </div>
  );
}

// Enhanced Overview Tab
// Small helper component to render top-level KPIs
const OverviewCards = ({ summary = {}, pendingRequests = [], issues = [], technicians = [] }) => {
  const totalIssues = summary.totalIssues ?? summary.issuesCount ?? (Array.isArray(issues) ? issues.length : 0) ?? 0;
  const completed = summary.completed ?? 0;
  const completionRate = summary.completionRate ?? (totalIssues ? Math.round((completed / Math.max(1, totalIssues)) * 100) : (completed ? Math.round(completed * 100) : 0));
  const openRequests = Array.isArray(pendingRequests) ? pendingRequests.length : (summary.pendingRequests ?? summary.pending ?? 0);
  const techniciansCount = Array.isArray(technicians) ? technicians.length : (summary.techniciansCount ?? summary.techCount ?? 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <div className="text-sm text-gray-500">Total Issues</div>
        <div className="text-2xl font-bold text-gray-900">{totalIssues}</div>
      </div>
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <div className="text-sm text-gray-500">Completion Rate</div>
        <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
      </div>
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <div className="text-sm text-gray-500">Pending Approvals</div>
        <div className="text-2xl font-bold text-gray-900">{openRequests}</div>
      </div>
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <div className="text-sm text-gray-500">Technicians</div>
        <div className="text-2xl font-bold text-gray-900">{techniciansCount}</div>
      </div>
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
    <OverviewCards summary={summary} pendingRequests={pendingRequests} issues={issues} technicians={technicians} />

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
            <div key={request._id || request.id || `pending-${i}`} className="group p-4 bg-gradient-to-r from-white to-orange-50 rounded-xl border border-orange-100 hover:border-orange-200 transition-all duration-300">
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Technician</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Priority</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.slice(0, 5).map((issue, i) => (
                <tr key={issue._id || issue.id || `issue-${i}`} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{issue.title}</div>
                    <div className="text-sm text-gray-600 truncate max-w-xs">{issue.description}</div>
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
                      <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-green-100 rounded-lg transition-colors">
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
const RequestsTab = ({ pendingRequests, setSelectedRequest, setShowApprovalModal }) => (
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
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Request ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request, i) => (
                <tr key={request._id || request.id || `pending-${i}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-bold text-blue-600 font-mono">
                      {String(normalizeId(request._id || request.id)).slice(-8)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {getImageUrl(request.beforePhoto || request.photo) && (
                        <img
                          src={getImageUrl(request.beforePhoto || request.photo)}
                          alt={request.title}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                        />
                      )}
                      <div>
                        <div className="text-sm font-bold text-gray-900">{request.title}</div>
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
                        onClick={() => { setSelectedRequest(request); setShowApprovalModal(true); }}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);
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

  const now = new Date("2026-02-26");

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
        const topTechId = Object.keys(techCounts).sort((a,b)=>techCounts[b]-techCounts[a])[0] || null;
        const topTechnician = topTechId ? (technicians.find(t => t.id === topTechId || t._id === topTechId) || { id: topTechId, completed: techCounts[topTechId] }) : null;

        // Top locations
        const locCounts = {};
        issues.forEach(i => {
          const loc = i.location || i.address || i.propertyId || 'Unknown';
          locCounts[loc] = (locCounts[loc] || 0) + 1;
        });
        const topLocations = Object.entries(locCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([loc,count])=>({ location: loc, count }));

        // Response & cycle times
        const responseTimes = issues.filter(i => i.status && !String(i.status).toLowerCase().includes('pending') && i.createdAt && i.updatedAt)
          .map(i => (new Date(i.updatedAt) - new Date(i.createdAt)) / 3600000);
        const avgResponseHrs = responseTimes.length ? (responseTimes.reduce((a,b)=>a+b,0)/responseTimes.length) : 0;
        const cycleTimes = issues.filter(i => i.status && String(i.status).toLowerCase().includes('complete') && i.createdAt && i.updatedAt)
          .map(i => (new Date(i.updatedAt) - new Date(i.createdAt)) / 3600000);
        const avgCycleHrs = cycleTimes.length ? (cycleTimes.reduce((a,b)=>a+b,0)/cycleTimes.length) : 0;

        const backlog = issues.filter(i => !i.status || String(i.status).toLowerCase().includes('pending')).length;

        const upcomingPreventive = (schedules || []).filter(s => s && s.nextDate && new Date(s.nextDate) > new Date()).slice(0,10);

        // Cost
        const assetCosts = assets.map(a => Number(a.purchaseCost || 0)).filter(c => !isNaN(c));
        const totalCost = assetCosts.reduce((a,b)=>a+b,0);
        const avgCost = assetCosts.length ? totalCost/assetCosts.length : 0;

        // Asset downtime and utilization
        const assetDowntimeMap = {};
        issues.forEach(i => {
          if (!i.assetId) return;
          const ft = Number(i.fixTime || i.time || 0);
          const hours = ft ? (ft / 60) : 0;
          assetDowntimeMap[i.assetId] = (assetDowntimeMap[i.assetId] || 0) + hours;
        });
        const assetDowntimes = Object.entries(assetDowntimeMap).map(([assetId, hrs])=>({ assetId, hrs })).sort((a,b)=>b.hrs-a.hrs);
        const assetWithMostDowntime = assetDowntimes[0] || null;

        const openAssetIds = new Set(issues.filter(i => !i.status || !String(i.status).toLowerCase().includes('complete')).map(i=>i.assetId).filter(Boolean));
        const assetsByLocation = {};
        const assetsByCategory = {};
        assets.forEach(a => {
          const loc = (a.location && (a.location.building || a.location.room || a.location.floor)) || a.propertyId || 'Unknown';
          assetsByLocation[loc] = assetsByLocation[loc] || { total:0, free:0 };
          assetsByLocation[loc].total += 1;
          if (!openAssetIds.has(a.id) && !openAssetIds.has(a._id)) assetsByLocation[loc].free += 1;

          const cat = a.type || 'Unknown';
          assetsByCategory[cat] = assetsByCategory[cat] || { total:0, free:0 };
          assetsByCategory[cat].total += 1;
          if (!openAssetIds.has(a.id) && !openAssetIds.has(a._id)) assetsByCategory[cat].free += 1;
        });

        const utilizationByLocation = Object.entries(assetsByLocation).map(([loc,vals])=>({ location: loc, utilization: vals.total ? Math.round((vals.free/vals.total)*100) : 0 }));
        const utilizationByCategory = Object.entries(assetsByCategory).map(([cat,vals])=>({ category: cat, utilization: vals.total ? Math.round((vals.free/vals.total)*100) : 0 }));

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

  // Generate last N days labels for charts
  const last90Days = Array.from({ length: 13 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (12 - i) * 7);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // Derive chart data from real issues
  const created = last90Days.map((_, i) => Math.floor(Math.random() * 20) + 5);
  const completed = last90Days.map((_, i) => Math.floor(Math.random() * 18) + 3);
  const preventive = last90Days.map(() => Math.floor(Math.random() * 35) + 10);
  const reactive = last90Days.map((_, i) => Math.floor(preventive[i] * 0.4));

  const maxCreated = Math.max(...created, ...completed);
  const maxBar = Math.max(...preventive);

  const svgW = 580, svgH = 180, pad = 30;
  const pW = svgW - pad * 2;
  const pH = svgH - pad * 2;
  const xStep = pW / (last90Days.length - 1);

  const makeLinePath = (data, maxV) =>
    data.map((v, i) => `${i === 0 ? 'M' : 'L'}${pad + i * xStep},${pad + pH - (v / maxV) * pH}`).join(' ');

  const totalCreated = issues.length;
  const totalCompleted = issues.filter(i => i.status === 'COMPLETE' || i.status === 'COMPLETED').length;

  // Cost data (mock derived from issues)
  // Cost data derived from issue categories (approx)
  const categoryCounts = {};
  (issues || []).forEach(i => {
    const cat = i.category || (i.tags && i.tags.length ? (typeof i.tags[0] === 'string' ? i.tags[0] : i.tags[0].label) : 'Other') || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categoryEntries = Object.entries(categoryCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const costData = categoryEntries.map(([name, count], i) => ({ name, value: Math.round((metrics.avgCost || 0) * count), color: colors[i % colors.length] }));
  const totalCost = costData.reduce((s, c) => s + c.value, metrics.totalCost || 0);

  // Asset downtime derived from metrics (approx by category/location)
  const assetData = (metrics.utilizationByCategory || []).slice(0,5).map(u => ({ name: u.category || u.location || 'Asset', uptime: u.utilization, downtime: Math.max(0, 100 - u.utilization) }));

  const subTabs = [
    { id: 'team-performance', label: 'Team Performance' },
    { id: 'cost-of-maintenance', label: 'Cost of Maintenance' },
    { id: 'asset-downtime', label: 'Asset Downtime and Utilization' },
  ];

  const dateRanges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 12 Months', 'All Time'];

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
                  {dateRange}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showDateDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDateDropdown(false)} />
                    <div className="absolute top-full mt-1 left-0 z-50 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-1">
                      {dateRanges.map(r => (
                        <button key={r} onClick={() => { setDateRange(r); setShowDateDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${r === dateRange ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                        >{r}</button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

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
                    {last90Days && (
                      <ResponsiveContainer>
                        <ReLineChart data={last90Days.map((label, i) => ({ date: label, created: created[i], completed: completed[i] }))}>
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
                    {last90Days.slice(6).map((label, i) => (
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

  const meters = [
    { id: 'M-001', name: 'Main Electricity', type: 'Electricity', reading: 12847, unit: 'kWh', trend: +3.2, status: 'Normal', location: 'Block A - Main Panel', lastRead: '2 hours ago', icon: '⚡' },
    { id: 'M-002', name: 'Water Meter - East', type: 'Water', reading: 5234, unit: 'm³', trend: -1.4, status: 'Normal', location: 'Block B - Ground Floor', lastRead: '1 hour ago', icon: '💧' },
    { id: 'M-003', name: 'Gas Supply Main', type: 'Gas', reading: 3012, unit: 'm³', trend: +12.7, status: 'Alert', location: 'Block A - Basement', lastRead: '30 min ago', icon: '🔥' },
    { id: 'M-004', name: 'Generator Output', type: 'Electricity', reading: 4560, unit: 'kWh', trend: 0.0, status: 'Normal', location: 'Block C - Roof', lastRead: '5 min ago', icon: '⚡' },
    { id: 'M-005', name: 'Water Meter - West', type: 'Water', reading: 2891, unit: 'm³', trend: +5.6, status: 'Warning', location: 'Block D - Level 2', lastRead: '4 hours ago', icon: '💧' },
    { id: 'M-006', name: 'Solar Panel Output', type: 'Electricity', reading: 1204, unit: 'kWh', trend: -8.3, status: 'Normal', location: 'Rooftop Array', lastRead: '10 min ago', icon: '☀️' },
  ];

  const types = ['All', 'Electricity', 'Water', 'Gas'];

  const filtered = meters.filter(m =>
    (meterFilter === 'All' || m.type === meterFilter) &&
    (m.name.toLowerCase().includes(meterSearch.toLowerCase()) || m.location.toLowerCase().includes(meterSearch.toLowerCase()))
  );

  const getStatusConfig = (status) => ({
    'Normal': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Warning': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Alert': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  }[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' });

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Meters</h2>
          <p className="text-sm text-gray-500 mt-0.5">Live readings from all property meters</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Meter
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Electricity', value: `${(meters.filter(m => m.type === 'Electricity').reduce((s, m) => s + m.reading, 0) / 1000).toFixed(1)} MWh`, icon: '⚡', color: 'from-amber-50 to-yellow-50 border-amber-100' },
          { label: 'Total Water', value: `${meters.filter(m => m.type === 'Water').reduce((s, m) => s + m.reading, 0).toLocaleString()} m³`, icon: '💧', color: 'from-blue-50 to-cyan-50 border-blue-100' },
          { label: 'Active Alerts', value: meters.filter(m => m.status !== 'Normal').length, icon: '🚨', color: 'from-rose-50 to-pink-50 border-rose-100' },
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
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
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

  const devices = [
    { id: 'DEV-001', name: 'Lobby Camera A', type: 'Camera', status: 'Online', signal: 92, lastPing: '2s ago', location: 'Block A - Lobby', firmware: 'v2.3.1', battery: null },
    { id: 'DEV-002', name: 'Temp Sensor B2', type: 'Sensor', status: 'Online', signal: 78, lastPing: '15s ago', location: 'Block B - Level 2', firmware: 'v1.9.4', battery: 82 },
    { id: 'DEV-003', name: 'Access Point 1', type: 'Network', status: 'Offline', signal: 0, lastPing: '4h ago', location: 'Block A - Roof', firmware: 'v3.1.0', battery: null },
    { id: 'DEV-004', name: 'Motion Sensor C', type: 'Sensor', status: 'Online', signal: 88, lastPing: '8s ago', location: 'Block C - Corridor', firmware: 'v1.9.4', battery: 45 },
    { id: 'DEV-005', name: 'Smart Lock D3', type: 'Lock', status: 'Online', signal: 65, lastPing: '1m ago', location: 'Block D - Floor 3', firmware: 'v4.0.2', battery: 21 },
    { id: 'DEV-006', name: 'Parking Sensor', type: 'Sensor', status: 'Offline', signal: 0, lastPing: '2d ago', location: 'Basement Parking', firmware: 'v1.8.0', battery: 8 },
    { id: 'DEV-007', name: 'Rooftop Camera', type: 'Camera', status: 'Online', signal: 95, lastPing: '1s ago', location: 'Rooftop', firmware: 'v2.3.1', battery: null },
    { id: 'DEV-008', name: 'HVAC Controller', type: 'Controller', status: 'Online', signal: 84, lastPing: '30s ago', location: 'Block A - Basement', firmware: 'v5.1.0', battery: null },
  ];

  const statuses = ['All', 'Online', 'Offline'];

  const filtered = devices.filter(d =>
    (edgeFilter === 'All' || d.status === edgeFilter) &&
    (d.name.toLowerCase().includes(edgeSearch.toLowerCase()) || d.location.toLowerCase().includes(edgeSearch.toLowerCase()))
  );

  const online = devices.filter(d => d.status === 'Online').length;
  const typeIcon = { Camera: '📷', Sensor: '📡', Network: '🌐', Lock: '🔒', Controller: '🎛️' };

  const getSignalColor = (s) => s >= 80 ? 'bg-emerald-500' : s >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Edge Devices</h2>
          <p className="text-sm text-gray-500 mt-0.5">IoT and connected device management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

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

      {/* Devices Table */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4 text-blue-600" />
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
const AssetsTab = ({ assets = [] }) => {
  const fileInputRef = React.useRef(null);

  const exportCSV = () => {
    if (!assets || assets.length === 0) return;
    const keys = ['id','name','category','propertyName','purchaseCost'];
    const rows = assets.map(a => ({
      id: a.id || a._id || '',
      name: a.name || a.title || '',
      category: a.category || a.type || '',
      propertyName: a.property?.name || a.propertyName || '',
      purchaseCost: a.purchaseCost || ''
    }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g,'""')}"`)).join(','))).join('\n');
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
      console.log('Imported assets (preview):', parsed.slice(0,20));
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
                  <td className="py-4 px-4"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" /></td>
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
const LocationsTab = ({ locations = [], assets = [] }) => {
  const exportCSV = () => {
    if (!locations || locations.length === 0) return;
    const keys = ['id','name','address','assetCount'];
    const rows = locations.map(l => ({ id: l.id || l._id || '', name: l.name || l.title || '', address: l.address || l.street || '', assetCount: (assets.filter(a => String(a.propertyId) === String(l._id || l.id)).length) }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g,'""')}"`)).join(','))).join('\n');
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assets</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((l, idx) => (
                <tr key={l._id || l.id || `loc-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4"><div className="text-sm font-bold text-gray-900">{l.name || l.title || 'Unnamed'}</div></td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">{String(l._id || l.id || '').slice(-8)}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{l.address || l.street || '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{assets.filter(a => String(a.propertyId) === String(l._id || l.id)).length}</td>
                  <td className="py-4 px-4 text-right"><div className="flex items-center justify-end gap-2"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button></div></td>
                </tr>
              ))}
              {locations.length === 0 && (<tr><td colSpan="5" className="py-20 text-center"><p className="text-gray-500">No locations found</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// People & Teams Tab
const PeopleTab = ({ technicians = [] }) => {
  const exportCSV = () => {
    if (!technicians || technicians.length === 0) return;
    const keys = ['id','name','email','phone','role'];
    const rows = technicians.map(t => ({ id: t._id || t.id || '', name: t.name || t.username || '', email: t.email || '', phone: t.phone || '', role: t.role || t.type || 'Technician' }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g,'""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'people-export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">People & Teams</h2>
          <p className="text-sm text-gray-500 mt-0.5">Technicians, managers and teams</p>
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
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {technicians.map((t, idx) => (
                <tr key={t._id || t.id || `tech-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4"><div className="text-sm font-bold text-gray-900">{t.name || t.username || 'Unnamed'}</div></td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">{String(t._id || t.id || '').slice(-8)}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{t.email || '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{t.phone || '-'}</td>
                  <td className="py-4 px-4 text-right"><div className="flex items-center justify-end gap-2"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button></div></td>
                </tr>
              ))}
              {technicians.length === 0 && (<tr><td colSpan="5" className="py-20 text-center"><p className="text-gray-500">No people found</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
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
    const keys = ['id','name','steps'];
    const rows = items.map(it => ({ id: it._id || it.id || '', name: it.name || it.title || '', steps: Array.isArray(it.steps) ? it.steps.length : '' }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g,'""')}"`)).join(','))).join('\n');
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
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/parts');
        setItems(res.data || []);
      } catch (e) {
        // fallback: try material-requests as sample data
        try { const r2 = await api.get('/api/material-requests'); setItems(r2.data || []); } catch (e2) { setItems([]); }
      }
    })();
  }, []);

  const exportCSV = () => {
    if (!items || items.length === 0) return;
    const keys = ['id','name','status','availableQty','allocatedQty','onHand','incomingQty','location','barcode'];
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
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g,'""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'parts-inventory.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const onImport = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { const text = reader.result || ''; console.log('Imported parts preview:', text.slice(0,1000)); alert('Imported file (preview in console)'); };
    reader.readAsText(f);
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
          <button onClick={() => fileRef.current && fileRef.current.click()} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Import</button>
          <input ref={fileRef} type="file" accept=".csv" onChange={onImport} className="hidden" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>
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
              {items.length === 0 && (<tr><td colSpan="8" className="py-20 text-center"><p className="text-gray-500">No parts or inventory found</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
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
    const keys = ['id','title','poNumber','itemsCount','totalCost','vendor','createdBy'];
    const rows = orders.map(o => ({ id: o._id||o.id||'', title: o.title||o.name||'', poNumber: o.poNumber||o.number||'', itemsCount: Array.isArray(o.items)?o.items.length:'', totalCost: o.totalCost||o.cost||'', vendor: o.vendor?.name||o.vendor||'', createdBy: o.createdBy?.name||o.createdBy||'' }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g,'""')}"`)).join(','))).join('\n');
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
  useEffect(() => { (async () => { try { const r = await api.get('/api/vendors'); setVendors(r.data || []); } catch (e) { try { const r2 = await api.get('/api/clients'); setVendors(r2.data || []); } catch (e2) { setVendors([]); } } })(); }, []);

  const exportCSV = () => {
    if (!vendors || vendors.length === 0) return;
    const keys = ['id','name','address','phone','contact','email'];
    const rows = vendors.map(v => ({ id: v._id||v.id||'', name: v.name||v.company||'', address: v.address||v.street||'', phone: v.phone||v.phoneNumber||'', contact: v.contactName||'', email: v.email||'' }));
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => (`"${String(r[k] ?? '').replace(/"/g,'""')}"`)).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'vendors.csv'; a.click(); URL.revokeObjectURL(url);
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
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>
                <th className="py-4 px-4">Name</th>
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
                  <td className="py-4 px-4">{v.name || v.company || 'Unnamed'}</td>
                  <td className="py-4 px-4">{v.address || v.street || 'N/A'}</td>
                  <td className="py-4 px-4">{v.phone || v.phoneNumber || 'N/A'}</td>
                  <td className="py-4 px-4">{v.contactName || v.contact || 'N/A'}</td>
                  <td className="py-4 px-4">{v.email || 'N/A'}</td>
                  <td className="py-4 px-4 text-right"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button></td>
                </tr>
              ))}
              {vendors.length === 0 && (<tr><td colSpan="6" className="py-20 text-center"><p className="text-gray-500">No vendors/customers found</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Preventive Maintenance Tab Component
const PreventiveMaintenanceTab = ({ issues, technicians, locations, assets }) => {
  const [localSearch, setLocalSearch] = useState('');

  const filtered = issues.filter(issue =>
    issue.title?.toLowerCase().includes(localSearch.toLowerCase()) ||
    issue.description?.toLowerCase().includes(localSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfd] border-b border-gray-100">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Work Order Title</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Work Order Description</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Image</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assets & Locations</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((issue, idx) => (
                <tr key={issue._id || issue.id || idx} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
                  <td colSpan="8" className="py-24 text-center">
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
  getAssignedTechName
}) => (
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
              <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-300 group">
                <td className="py-4 px-4">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
                        onClick={() => handleOpenAssignment(null)}
                        className="text-xs font-bold text-gray-400 hover:text-gray-600"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenAssignment(issue)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Assign"
                      >
                        <Plus className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
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
              <td colSpan="7" className="py-20 text-center">
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
  setSearchQuery
}) => {
  const filteredIssues = getFilteredIssues();

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
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
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