import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

// Updated IssueCard to handle missing properties
const IssueCard = ({ issue, userRole, actions }) => {
  // Handle missing or undefined properties
  const title = issue?.title || 'No Title';
  const description = issue?.description || 'No description';
  const time = issue?.createdAt ? new Date(issue.createdAt).toLocaleDateString() : issue?.time || 'No date';
  const overdue = issue?.overdue || false;
  const status = issue?.status || 'UNKNOWN';

  return (
    <div className="flex flex-col md:flex-row items-start justify-between border-2 border-red-200 bg-white rounded-2xl shadow p-4 md:p-8 mb-4">
      <div className="flex-1">
        <div className="text-base md:text-xl font-bold mb-1">{title}</div>
        <div className="text-gray-600 mb-2">{description}</div>
        <div className="text-sm text-gray-500 mb-2">
          Status: <span className={`font-semibold ${getStatusColor(status)}`}>{status}</span>
        </div>

        {/* Show assigned technicians */}
        {issue.assignees && Array.isArray(issue.assignees) && issue.assignees.length > 0 && (
          <div className="mt-2 mb-2 p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-xs font-semibold text-green-800 mb-1">Assigned to:</p>
            {issue.assignees.map((assignee, idx) => (
              <div key={idx} className="text-xs text-green-700">
                <span className="font-medium">{assignee.name || 'Unknown'}</span>
                {assignee.email && <span className="text-green-600"> ({assignee.email})</span>}
                {assignee.role && <span className="ml-1 px-1 py-0.5 bg-green-100 rounded text-green-800">({assignee.role})</span>}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">{actions}</div>
      </div>
      <div className="flex flex-col items-end min-w-[70px] md:min-w-[110px] gap-1 md:gap-2 mt-2 md:mt-0">
        <span className="flex items-center gap-1 text-yellow-700 text-xs md:text-lg font-medium">{time}</span>
        {overdue && <span className="text-red-600 text-xs md:text-base font-semibold">overdue</span>}
      </div>
    </div>
  );
};

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING': return 'text-yellow-600';
    case 'APPROVED': return 'text-green-600';
    case 'IN PROGRESS': return 'text-blue-600';
    case 'COMPLETED': return 'text-green-700';
    case 'REJECTED': return 'text-red-600';
    case 'OVERDUE': return 'text-red-700';
    default: return 'text-gray-600';
  }
};

const StatusFilter = ({ value, onChange, includeAll }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-base font-medium text-gray-700 outline-none"
  >
    {includeAll && <option value="ALL">All</option>}
    <option value="PENDING">Pending</option>
    <option value="APPROVED">Approved</option>
    <option value="IN PROGRESS">In Progress</option>
    <option value="COMPLETED">Completed</option>
    <option value="REJECTED">Rejected</option>
    <option value="OVERDUE">Overdue</option>
  </select>
);

const LoadingSpinner = ({ size = 'md', text }) => (
  <div className="flex flex-col items-center">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    {text && <p className="mt-2 text-gray-600">{text}</p>}
  </div>
);

const ErrorMessage = ({ message, onDismiss, className }) => (
  <div className={`bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200 ${className || ''}`}>
    <div className="flex justify-between items-start">
      <div>{message}</div>
      {onDismiss && <button onClick={onDismiss} className="text-red-600">×</button>}
    </div>
  </div>
);

const API_BASE_URL = ''; // using api instance baseURL

// Minimal auth hook fallback (reads localStorage)
const useAuth = () => {
  const stored = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const user = stored ? JSON.parse(stored) : null;
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
  return { user, logout, token };
};

// Simple issue service
const issueService = {
  fetchIssuesByRole: async (user) => {
    // Auth handled by interceptor

    if (!user) return [];

    try {
      if (user.role === 'technician') {
        const res = await api.get(`/api/issues/assigned/${user._id || user.id}`);
        return res.data || [];
      }

      if (user.role === 'client') {
        // For clients, fetch all issues from /api/issues endpoint
        // The backend will filter by the user's role
        const res = await api.get('/api/issues');
        console.log('CLIENT: Fetched issues from /api/issues:', res.data?.length || 0);
        const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return sorted;
      }

      // admin/manager: fetch all
      const res = await api.get('/api/issues');
      const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return sorted;
    } catch (error) {
      console.error('Error fetching issues:', error);
      return [];
    }
  },

  updateIssueStatus: async (issueId, status, token) => {
    return api.put(
      `/api/issues/${issueId}`,
      { status }
    );
  }
};

function AllIssues() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || user?.username || '';

  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [internalTechnicians, setInternalTechnicians] = useState([]);
  const [selectedTechs, setSelectedTechs] = useState({});
  const [assignLoading, setAssignLoading] = useState({});

  // Check authentication on mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Only fetch data once
    if (!dataFetched) {
      fetchData();
      fetchInternalTechnicians();
    }
  }, [user, navigate, dataFetched]);

  // Filter issues when statusFilter or issues change
  useEffect(() => {
    console.log('Filtering issues with filter:', statusFilter, 'total issues:', issues.length);

    if (statusFilter === "ALL") {
      setFilteredIssues(issues);
    } else {
      const filtered = issues.filter(issue => {
        const issueStatus = issue?.status || 'UNKNOWN';
        return issueStatus === statusFilter;
      });
      console.log(`Filtered to ${filtered.length} issues with status ${statusFilter}`);
      setFilteredIssues(filtered);
    }
  }, [issues, statusFilter]);

  const fetchData = async () => {
    console.log('FETCHDATA CALLED - user:', user, 'dataFetched:', dataFetched);
    if (!user || dataFetched) {
      console.log('FETCHDATA SKIPPED - no user or already fetched');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('FETCHDATA: Calling issueService.fetchIssuesByRole for client role');
      const issuesData = await issueService.fetchIssuesByRole(user);
      console.log('FETCHDATA: Fetched issues:', issuesData?.length || 0, issuesData);

      // Transform data to ensure it has expected properties
      const transformedIssues = issuesData.map(issue => ({
        ...issue,
        time: issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'No date',
        overdue: issue.status === 'OVERDUE' || (issue.dueDate && new Date(issue.dueDate) < new Date())
      }));

      console.log('FETCHDATA: Transformed issues:', transformedIssues?.length || 0);
      setIssues(transformedIssues);
      setDataFetched(true);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setDataFetched(false);
    await fetchData();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await issueService.updateIssueStatus(issueId, newStatus, token);
      await handleRefresh(); // Refresh the data
    } catch (err) {
      console.error(`Error updating status to ${newStatus}:`, err);
      setError(`Failed to update issue status: ${err.message}`);
    }
  };

  const handleResubmit = async (issueId) => {
    try {
      await api.post(`/api/issues/${issueId}/resubmit`, {});
      console.log('Issue resubmitted successfully');
      await handleRefresh(); // Refresh the data
    } catch (err) {
      console.error('Error resubmitting issue:', err);
      setError(`Failed to resubmit issue: ${err.message}`);
    }
  };

  const fetchInternalTechnicians = async () => {
    try {
      const res = await api.get('/api/internal-technicians');
      setInternalTechnicians(res.data || []);
    } catch (err) {
      console.error('Error fetching internal technicians:', err);
      // Don't show error to user, just log it
    }
  };

  const assignInternal = async (issueId, internalTechId) => {
    try {
      if (!internalTechId) return;
      setAssignLoading(s => ({ ...s, [issueId]: true }));
      await api.post(`/api/issues/${issueId}/assign-internal`, { internalTechId });
      await handleRefresh(); // Refresh the data
      setAssignLoading(s => ({ ...s, [issueId]: false }));
      // Clear selection after successful assignment
      setSelectedTechs(s => ({ ...s, [issueId]: '' }));
    } catch (err) {
      setAssignLoading(s => ({ ...s, [issueId]: false }));
      console.error('Assign internal failed', err);
      setError(`Failed to assign internal technician: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Render navigation (moved to a separate function for clarity)
  const renderNavigation = () => (
    <nav className="flex items-center justify-between bg-blue-900 shadow-lg px-4 md:px-8 h-16">
      <div className="flex items-center gap-3">
        <span className="bg-white rounded-xl p-2 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="6" fill="#1e40af" />
            <rect x="6" y="6" width="12" height="6" rx="2" fill="#60a5fa" />
          </svg>
        </span>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white">Fixnest</span>
          <span className="text-sm text-blue-200">Welcome, {userName}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-800 text-white font-semibold transition"
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-800 text-white font-semibold transition bg-blue-800"
          onClick={() => navigate("/issues")}
        >
          All Issues
        </button>

        <button
          onClick={() => navigate("/new-issue")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-800 text-white font-semibold transition"
        >
          New Issue
        </button>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  );

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderNavigation()}
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Loading issues..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {renderNavigation()}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Issues</h1>
            <p className="mt-2 text-gray-600">
              {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} found
              {statusFilter !== "ALL" && ` (filtered by ${statusFilter})`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 lg:mt-0">
            <StatusFilter
              value={statusFilter}
              onChange={setStatusFilter}
              includeAll={true}
            />

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No issues found</h3>
            <p className="mt-2 text-gray-500">
              {statusFilter === "ALL"
                ? "There are no issues to display."
                : `No issues with status "${statusFilter}" found.`
              }
            </p>
            {statusFilter !== "ALL" && (
              <button
                onClick={() => setStatusFilter("ALL")}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                View all issues
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id || issue._id || Math.random()}
                issue={issue}
                userRole={user?.role}
                actions={
                  <div className="flex flex-wrap gap-2 mt-3">
                    {/* Basic actions for all users */}
                    <button
                      onClick={() => console.log('View details:', issue)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>

                    {/* Client actions for PENDING issues */}
                    {user?.role === 'client' && issue.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(issue._id || issue.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(issue._id || issue.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleResubmit(issue._id || issue.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Resubmit
                        </button>
                      </>
                    )}

                    {/* Manager/Admin actions */}
                    {(user?.role === 'manager' || user?.role === 'admin') && issue.status === 'APPROVED' && (
                      <button
                        onClick={() => handleStatusUpdate(issue._id || issue.id, 'IN PROGRESS')}
                        className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                      >
                        Start Work
                      </button>
                    )}

                    {/* Manager/Admin: assign internal technician */}
                    {(user?.role === 'manager' || user?.role === 'admin') && internalTechnicians && internalTechnicians.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 w-full">
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1"
                          value={selectedTechs[issue.id || issue._id] || ''}
                          onChange={(e) => setSelectedTechs(s => ({ ...s, [issue.id || issue._id]: e.target.value }))}
                        >
                          <option value="">Assign internal technician...</option>
                          {internalTechnicians.map((t) => (
                            <option key={t.id || t._id} value={t.id || t._id}>
                              {t.name}{t.email ? ` (${t.email})` : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!selectedTechs[issue.id || issue._id] || assignLoading[issue.id || issue._id]}
                          onClick={() => assignInternal(issue.id || issue._id, selectedTechs[issue.id || issue._id])}
                        >
                          {assignLoading[issue.id || issue._id] ? 'Assigning...' : 'Assign'}
                        </button>
                      </div>
                    )}

                    {/* Technician actions */}
                    {user?.role === 'technician' && issue.status === 'IN PROGRESS' && (
                      <button
                        onClick={() => handleStatusUpdate(issue._id || issue.id, 'COMPLETED')}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AllIssues;