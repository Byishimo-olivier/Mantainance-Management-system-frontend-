import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  Star
} from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';
import Header from "./Header";

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
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" />
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-gray-900 to-gray-700">
              {value}
            </p>
            {change && (
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {change}
                </span>
                <span className="text-xs text-gray-500">from last week</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${config.iconBg}`}>
            {icon}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
      </div>
    </div>
  );
};

// Enhanced Overview Cards
const OverviewCards = ({ summary, pendingRequests }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatCard
      title="Total Issues"
      value={summary.pending + summary.inProgress + summary.completed + summary.overdue}
      icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
      color="blue"
      trend="up"
      change="+12%"
    />
    <StatCard
      title="Pending Approval"
      value={pendingRequests.length}
      icon={<Clock className="w-6 h-6 text-orange-600" />}
      color="orange"
      trend={pendingRequests.length > 0 ? "up" : "down"}
      change={pendingRequests.length > 0 ? "+2" : "0"}
    />
    <StatCard
      title="In Progress"
      value={summary.inProgress}
      icon={<Wrench className="w-6 h-6 text-purple-600" />}
      color="purple"
      trend="up"
      change="+5"
    />
    <StatCard
      title="Completed"
      value={summary.completed}
      icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
      color="green"
      trend="up"
      change={`+${Math.round((summary.completed / (summary.pending + summary.inProgress + summary.completed + summary.overdue)) * 100)}%`}
    />
  </div>
);

// Gradient Button Component
const GradientButton = ({ children, onClick, color = "blue", className = "" }) => {
  const colorMap = {
    blue: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
    green: "from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600",
    orange: "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
    purple: "from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600",
    red: "from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600",
  };

  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r ${colorMap[color]} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
};

// Glass Card Component
const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
    {children}
  </div>
);

function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [issues, setIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
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

      const [issuesRes, techRes, summaryRes] = await Promise.all([
        api.get("/api/issues"),
        api.get("/api/technicians"),
        api.get("/api/managers/dashboard/summary")
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
  const handleAssignTech = async (idx, techName) => {
    const issue = issues[idx];
    const tech = technicians.find(t => t.name === techName);
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
      const token = localStorage.getItem('token');
      // const config = { headers: { Authorization: `Bearer ${token}` } };

      const issueId = issue?._id || issue?.id;
      if (!issueId) {
        alert('No issue ID found');
        return;
      }

      // Use the dedicated assign endpoint (consistent with ManagementIssues)
      const response = await api.post(`/api/issues/${issueId}/assign`, {
        techId: tech._id || tech.id,
        priority: assignmentData.priority,
        dueDate: assignmentData.dueDate,
        status: 'ASSIGNED'
      });

      // Update issues list with the response from backend
      const updatedIssues = issues.map((iss, i) => i === idx ? response.data : iss);
      setIssues(updatedIssues);

      setAssigning(null);
      setAssignmentData({ technicianId: "", priority: "MEDIUM", dueDate: "" });
      alert('Issue assigned successfully!');
    } catch (err) {
      console.error('Assignment error:', err);
      alert(`Failed to assign issue: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleOpenAssignment = (idx) => {
    const issue = issues[idx];
    setAssigning(idx);
    setAssignmentData({
      technicianId: issue.assignedTo || "",
      priority: issue.priority || "MEDIUM",
      dueDate: issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : ""
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
    const assignedId = issue.assignedTo || (issue.assignees?.[0]?.id || issue.assignees?.[0]?._id);
    if (!assignedId) return 'Unassigned';

    const tech = technicians.find(t => {
      const idsToCheck = [t._id, t.id, t.userId].filter(Boolean).map(String);
      return idsToCheck.includes(String(assignedId));
    });

    return tech?.name || tech?.username || 'Technician';
  };

  // Enhanced TabButton with animations
  const TabButton = ({ active, onClick, icon, label, badge, badgeColor }) => (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-medium transition-all duration-300 group ${active
        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200'
        : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
        }`}
    >
      <span className={`text-lg transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${active ? 'bg-white/20 text-white' : `${badgeColor} text-white`
          }`}>
          {badge}
        </span>
      )}
      {active && (
        <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Enhanced Sidebar with gradient */}
      <aside className="w-72 bg-gradient-to-b from-white to-gray-50 shadow-2xl flex flex-col justify-between border-r border-gray-200/50">
        <div>
          {/* User Info with gradient */}
          <div className="relative py-8 px-6 border-b border-gray-200/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-b-3xl" />
            <div className="relative flex flex-col items-center">
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                <span className="text-3xl font-bold text-white">{initials}</span>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900 text-xl">{userName}</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold">
                    {userRole}
                  </span>
                  <span className="text-xs text-gray-500">⭐ 4.8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 mt-8 px-4">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon="📊"
              label="Dashboard"
            />
            <TabButton
              active={activeTab === 'requests'}
              onClick={() => setActiveTab('requests')}
              icon="⏳"
              label="Pending Requests"
              badge={pendingRequests.length}
              badgeColor="bg-gradient-to-r from-orange-500 to-amber-500"
            />
            <TabButton
              active={activeTab === 'issues'}
              onClick={() => setActiveTab('issues')}
              icon="🔧"
              label="Issue Management"
            />
            <TabButton
              active={activeTab === 'all-issues'}
              onClick={() => setActiveTab('all-issues')}
              icon="📋"
              label="All Issues"
            />
            <TabButton
              active={activeTab === 'feedback'}
              onClick={() => setActiveTab('feedback')}
              icon="💬"
              label="Technician Feedback"
            />
          </nav>
        </div>

        {/* Enhanced Logout */}
        <div className="p-6 border-t border-gray-200/50">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-rose-50 hover:to-pink-50 text-gray-700 hover:text-rose-700 border border-gray-200 hover:border-rose-200"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Standardized Header */}
        <Header
          title="Manager Dashboard"
          subtitle={`Last updated: ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`}
          user={loggedUser || { name: userName, role: 'manager' }}
          right={
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm"
                />
              </div>

              {/* Quick Actions (Exports) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={exportToPDF}
                  className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
                  title="Export PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          }
        />

        <div className="mb-6">

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-full border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-emerald-700">
                {summary.completed} tasks completed this week
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full border border-blue-200">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Efficiency: {Math.round((summary.completed / (summary.pending + summary.inProgress + summary.completed)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div id="dashboard-content">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600 animate-pulse">Loading dashboard...</p>
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
              issues={issues}
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
          ) : (
            <FeedbackTab
              feedbacks={feedbacks}
              loadingFeedbacks={loadingFeedbacks}
            />
          )}

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
                      {getImageUrl(selectedRequest.beforePhoto || selectedRequest.photo) && (
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
                        <p className="font-semibold text-gray-900">Anonymous</p>
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
      </main>
    </div>
  );
}

// Enhanced Overview Tab
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
    <OverviewCards summary={summary} pendingRequests={pendingRequests} />

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
                    <div className={`text-sm font-medium ${issue.dueDate && new Date(issue.dueDate) < new Date() ? 'text-rose-600' : 'text-gray-900'}`}>
                      {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'Not set'}
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

// Enhanced Requests Tab
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingRequests.map((request, i) => (
          <div key={request._id || request.id || `pending-full-${i}`} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <GlassCard className="relative p-6 hover:scale-[1.02] transition-all duration-300">
              {/* Request Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{request.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-xs font-medium">
                      📍 {request.location}
                    </span>
                    <PriorityBadge priority={request.priority || 'MEDIUM'} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Submitted</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Request Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{request.description}</p>

              {/* Request Image */}
              {getImageUrl(request.beforePhoto || request.photo) && (
                <div className="mb-4">
                  <img
                    src={getImageUrl(request.beforePhoto || request.photo)}
                    alt="Issue"
                    className="w-full h-48 object-cover rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <GradientButton
                  onClick={() => { setSelectedRequest(request); setShowApprovalModal(true); }}
                  color="green"
                  className="flex-1 py-2.5 text-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Review
                  </span>
                </GradientButton>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Enhanced Issues Tab
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
  <div>
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Management</h2>
          <p className="text-gray-600">Assign and manage approved issues</p>
        </div>
        <GradientButton color="purple" className="px-6">
          <span className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Manage Issues
          </span>
        </GradientButton>
      </div>
    </div>

    {issues.length === 0 ? (
      <GlassCard className="p-12 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Issues Available</h3>
        <p className="text-gray-600 mb-6">Approve requests to see them here for assignment</p>
        <GradientButton color="blue" className="px-8">
          View Pending Requests
        </GradientButton>
      </GlassCard>
    ) : (
      <div className="space-y-6">
        {issues.map((issue, idx) => (
          <div key={issue._id || issue.id || `issue-full-${idx}`} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <GlassCard className="relative p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Issue Image */}
                {getImageUrl(issue.photo || issue.image) && (
                  <div className="lg:w-56 flex-shrink-0">
                    <div className="relative rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={getImageUrl(issue.photo || issue.image)}
                        alt="Issue"
                        className="w-full h-56 object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={issue.status} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Issue Details */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{issue.title}</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">{issue.description}</p>
                    </div>
                    <div className="flex flex-col items-start lg:items-end gap-3">
                      <PriorityBadge priority={issue.priority || 'MEDIUM'} />
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Assigned to</div>
                        <div className="font-semibold text-gray-900">{getAssignedTechName(issue)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Meta Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <div className="text-xs text-gray-600 mb-1">Location</div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        {issue.location}
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                      <div className="text-xs text-gray-600 mb-1">Created</div>
                      <div className="font-medium text-gray-900">{new Date(issue.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                      <div className="text-xs text-gray-600 mb-1">Due Date</div>
                      <div className={`font-medium ${issue.dueDate && new Date(issue.dueDate) < new Date() ? 'text-rose-600' : 'text-gray-900'}`}>
                        {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'Not set'}
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                      <div className="text-xs text-gray-600 mb-1">Progress</div>
                      <div className="font-medium text-gray-900">Pending Assignment</div>
                    </div>
                  </div>

                  {/* Assignment Form or Button */}
                  {assigning === idx ? (
                    <AssignmentForm
                      assignmentData={assignmentData}
                      setAssignmentData={setAssignmentData}
                      technicians={technicians}
                      onAssign={() => handleAssignTech(idx, technicians.find(t => t._id === assignmentData.technicianId)?.name)}
                      onCancel={() => {
                        setAssigning(null);
                        setAssignmentData({ technicianId: "", priority: "MEDIUM", dueDate: "" });
                      }}
                    />
                  ) : (
                    <div className="flex justify-end">
                      <GradientButton
                        onClick={() => handleOpenAssignment(idx)}
                        color="purple"
                        className="px-6"
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Assign Technician
                        </span>
                      </GradientButton>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    )}
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
            <option key={tech.id || tech._id || `tech-${i}`} value={tech.id || tech._id || ''}>
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

      {/* Enhanced Issues Table */}
      <GlassCard>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Issues ({filteredIssues.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Showing {filteredIssues.length} issues matching your filters
              </p>
            </div>
            <div className="text-sm">
              <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg font-medium">
                Updated just now
              </span>
            </div>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">No Issues Found</h4>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
              <GradientButton
                onClick={() => {
                  setFilters({ status: 'all', priority: 'all', assignedTo: 'all' });
                  setSearchQuery('');
                }}
                color="blue"
                className="px-8"
              >
                Clear All Filters
              </GradientButton>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Issue</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Priority</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Technician</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue, idx) => (
                    <tr
                      key={issue._id || issue.id || `filtered-${idx}`}
                      className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">{issue.title}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {issue.location}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={issue.status} />
                      </td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={issue.priority || 'MEDIUM'} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                            {getAssignedTechName(issue).charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{getAssignedTechName(issue)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`text-sm font-medium ${issue.dueDate && new Date(issue.dueDate) < new Date() ? 'text-rose-600' : 'text-gray-900'}`}>
                          {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'Not set'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors group">
                            <Eye className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                          </button>
                          <button className="p-2 hover:bg-green-100 rounded-lg transition-colors group">
                            <Edit className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                          </button>
                          <button className="p-2 hover:bg-rose-100 rounded-lg transition-colors group">
                            <Trash2 className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </GlassCard>
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