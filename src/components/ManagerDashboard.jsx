// ...existing code...

import Header from "./Header";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Populate feedbacks when switching to feedback tab or issues change
// (This must be inside the component, not at the top level)

const statusCards = [
  {
    label: "ASSIGNED",
    count: 1,
  },
  // Add other status cards as needed
];

function ManagerDashboard() {
  // Debug: confirm component mount
  console.log('[ManagerDashboard] Component mounted');
  const [activeTab, setActiveTab] = useState('overview');
  const [issues, setIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]); // Store all issues for feedbacks
  const [pendingRequests, setPendingRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [assigning, setAssigning] = useState(null);
  const [assignmentData, setAssignmentData] = useState({ technicianId: "", priority: "MEDIUM", dueDate: "" });
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', assignedTo: 'all' });
  const [feedbacks, setFeedbacks] = useState([]);

  // Debug: log feedbacks whenever they change
  useEffect(() => {
    console.log('[ManagerDashboard] feedbacks state changed:', feedbacks);
  }, [feedbacks]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Fetch all data
    Promise.all([
      axios.get("http://localhost:5000/api/issues", config),
      axios.get("http://localhost:5000/api/technicians", config),
      axios.get("http://localhost:5000/api/managers/dashboard/summary", config)
    ]).then(([issuesRes, techRes, summaryRes]) => {
      console.log('Data loaded successfully');
      // Filter issues using consistent logic
      const allIssuesData = issuesRes.data;
      setAllIssues(allIssuesData); // Store all issues for feedbacks
      const approvedIssues = allIssuesData.filter(issue => 
        issue.approved === true || issue.assignedTo || (issue.status !== 'PENDING' && issue.status !== 'REJECTED')
      );
      const pendingRequests = allIssuesData.filter(issue => 
        issue.status === 'PENDING' && !issue.assignedTo && !issue.approved
      );
      console.log('Initial load - Approved issues:', approvedIssues.length);
      console.log('Initial load - Pending requests:', pendingRequests.length);
      setIssues(approvedIssues);
      setPendingRequests(pendingRequests);
      setTechnicians(techRes.data);
      setSummary(summaryRes.data);
    }).catch(err => {
      console.error('Failed to load data:', err);
      setIssues([]);
      setAllIssues([]);
      setPendingRequests([]);
      setTechnicians([]);
      setSummary({ pending: 0, inProgress: 0, completed: 0, overdue: 0 });
    });
  }, []);

  // Approval functions
  const handleApproveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      console.log('=== APPROVAL DEBUG ===');
      console.log('Raw requestId:', requestId);
      console.log('requestId type:', typeof requestId);
      console.log('requestId keys:', requestId ? Object.keys(requestId) : 'undefined/null');
      console.log('requestId._id:', requestId?._id);
      console.log('requestId.id:', requestId?.id);
      
      // Ensure we're using the correct ID format with proper null checks
      let issueId;
      if (typeof requestId === 'string') {
        issueId = requestId;
        console.log('Using string ID:', issueId);
      } else if (requestId && typeof requestId === 'object') {
        issueId = requestId._id || requestId.id;
        console.log('Using object ID:', issueId);
      } else {
        console.error('Invalid requestId format:', requestId);
        throw new Error(`Invalid request ID format. Received: ${JSON.stringify(requestId)}`);
      }
      
      if (!issueId) {
        console.error('No issueId found in:', requestId);
        throw new Error(`No valid issue ID found. Object: ${JSON.stringify(requestId)}`);
      }
      
      console.log('Final issue ID:', issueId, 'type:', typeof issueId, 'length:', issueId?.length);
      
      // Try different endpoint structures
      let response;
      try {
        // First try: PUT with approval fields
        response = await axios.put(`http://localhost:5000/api/issues/${issueId}`, {
          status: 'APPROVED',
          approved: true,
          approvedBy: JSON.parse(localStorage.getItem('user')).id,
          approvedAt: new Date().toISOString()
        }, config);
        console.log('Approval successful (method 1):', response.data);
      } catch (err1) {
        console.log('Method 1 failed, trying method 2:', err1.response?.data);
        try {
          // Second try: POST to approve endpoint
          response = await axios.post(`http://localhost:5000/api/issues/${issueId}/approve`, {
            approved: true,
            approvedBy: JSON.parse(localStorage.getItem('user')).id
          }, config);
          console.log('Approval successful (method 2):', response.data);
        } catch (err2) {
          console.log('Method 2 failed, trying method 3:', err2.response?.data);
          try {
            // Third try: Just update status to something other than PENDING
            response = await axios.put(`http://localhost:5000/api/issues/${issueId}`, {
              status: 'APPROVED'
            }, config);
            console.log('Approval successful (method 3):', response.data);
          } catch (err3) {
            console.log('Method 3 failed, trying method 4:', err3.response?.data);
            try {
              // Fourth try: Update with a different field that might trigger approval
              response = await axios.put(`http://localhost:5000/api/issues/${issueId}`, {
                status: 'ASSIGNED',
                assignedTo: null // Keep unassigned but change status
              }, config);
              console.log('Approval successful (method 4):', response.data);
            } catch (err4) {
              console.error('All approval methods failed:', err4.response?.data);
              throw err4;
            }
          }
        }
      }
      
      // Check if the response actually contains updated data
      if (response.data) {
        console.log('Updated issue from backend:', response.data);
        console.log('Updated status:', response.data.status);
        console.log('Updated approved:', response.data.approved);
      } else {
        console.log('No data returned from backend');
      }
      
      // Refresh data after approval
      const issuesResponse = await axios.get("http://localhost:5000/api/issues", config);
      
      // Re-filter issues after approval
      const allIssues = issuesResponse.data;
      console.log('All issues from backend after approval:', allIssues.length);
      console.log('Sample issue:', allIssues[0]);
      
      // More flexible filtering for approved issues
      const approvedIssues = allIssues.filter(issue => {
        // Check various ways an issue might be considered "approved"
        const isApproved = issue.approved === true || 
                           issue.approved === 'true' ||
                           issue.status === 'APPROVED' ||
                           issue.status === 'ASSIGNED' ||
                           (issue.assignedTo && issue.assignedTo !== null) ||
                           (issue.status !== 'PENDING' && issue.status !== 'REJECTED');
        
        if (isApproved) {
          console.log('Issue approved:', issue.title, 'status:', issue.status, 'approved:', issue.approved);
        }
        
        return isApproved;
      });
      
      // More flexible filtering for pending requests
      const pendingRequests = allIssues.filter(issue => {
        // Check various ways an issue might be considered "pending approval"
        const isPending = (issue.status === 'PENDING' || issue.status === 'pending') &&
                          !issue.assignedTo && 
                          issue.approved !== true && 
                          issue.approved !== 'true';
        
        if (isPending) {
          console.log('Issue pending:', issue.title, 'status:', issue.status, 'approved:', issue.approved);
        }
        
        return isPending;
      });
      
      console.log('After approval - Approved issues:', approvedIssues.length);
      console.log('After approval - Pending requests:', pendingRequests.length);
      
      setIssues(approvedIssues);
      setPendingRequests(pendingRequests);
      setShowApprovalModal(false);
      setSelectedRequest(null);
      alert('Request approved! It has been moved to Issue Management for assignment.');
    } catch (error) {
      console.error('Approval error:', error.response?.data || error.message);
      alert(`Failed to approve request: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeclineRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Ensure we're using the correct ID format with proper null checks
      let issueId;
      if (selectedRequest && typeof selectedRequest._id === 'string') {
        issueId = selectedRequest._id;
      } else if (selectedRequest && typeof selectedRequest.id === 'string') {
        issueId = selectedRequest.id;
      } else if (selectedRequest && typeof selectedRequest === 'object') {
        issueId = selectedRequest._id || selectedRequest.id;
      } else {
        throw new Error('Invalid selected request ID format');
      }
      
      if (!issueId) {
        throw new Error('No valid issue ID found in selected request');
      }
      
      console.log('Declining request:', issueId);
      console.log('Request ID type:', typeof issueId, 'length:', issueId?.length);
      
      // Try different endpoint structures
      let response;
      try {
        // First try: PUT with rejection fields
        response = await axios.put(`http://localhost:5000/api/issues/${issueId}`, {
          status: 'DECLINED',
          rejected: true,
          rejectedBy: JSON.parse(localStorage.getItem('user')).id,
          rejectedAt: new Date().toISOString(),
          rejectionReason: declineReason
        }, config);
        console.log('Rejection successful (method 1):', response.data);
      } catch (err1) {
        console.log('Method 1 failed, trying method 2:', err1.response?.data);
        try {
          // Second try: POST to reject endpoint
          response = await axios.post(`http://localhost:5000/api/issues/${issueId}/reject`, {
            rejected: true,
            rejectedBy: JSON.parse(localStorage.getItem('user')).id,
            rejectionReason: declineReason
          }, config);
          console.log('Rejection successful (method 2):', response.data);
        } catch (err2) {
          console.log('Method 2 failed, trying method 3:', err2.response?.data);
          try {
            // Third try: Just update status and add reason to description
            response = await axios.put(`http://localhost:5000/api/issues/${issueId}`, {
              status: 'DECLINED',
              description: `${selectedRequest.description}\n\nREJECTED: ${declineReason}`
            }, config);
            console.log('Rejection successful (method 3):', response.data);
          } catch (err3) {
            console.error('All rejection methods failed:', err3.response?.data);
            throw err3;
          }
        }
      }
      
      // Refresh data after decline
      const issuesResponse = await axios.get("http://localhost:5000/api/issues", config);
      
      // Re-filter issues after decline
      const allIssues = issuesResponse.data;
      const approvedIssues = allIssues.filter(issue => 
        issue.approved === true || issue.assignedTo || (issue.status !== 'PENDING' && issue.status !== 'REJECTED')
      );
      const pendingRequests = allIssues.filter(issue => 
        issue.status === 'PENDING' && !issue.assignedTo && !issue.approved
      );
      
      console.log('After decline - Approved issues:', approvedIssues.length);
      console.log('After decline - Pending requests:', pendingRequests.length);
      
      setIssues(approvedIssues);
      setPendingRequests(pendingRequests);
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setDeclineReason('');
      alert('Request declined! It has been removed from the pending list.');
    } catch (error) {
      console.error('Decline error:', error.response?.data || error.message);
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
    
    // Validate assignment data
    if (!assignmentData.dueDate) {
      alert('Please select a due date for this assignment');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Ensure we're using the correct ID format with proper null checks
      let issueId;
      if (issue && typeof issue.id === 'string') {
        issueId = issue.id;
      } else if (issue && typeof issue._id === 'string') {
        issueId = issue._id;
      } else if (issue && typeof issue === 'object') {
        issueId = issue._id || issue.id;
      } else {
        throw new Error('Invalid issue ID format');
      }
      
      if (!issueId) {
        throw new Error('No valid issue ID found');
      }
      
      console.log('Assigning issue:', issueId);
      console.log('Issue ID type:', typeof issueId, 'length:', issueId?.length);
      console.log('Assignment data:', assignmentData);
      
      let response;
      try {
        // First try: POST to assign endpoint
        response = await axios.post(`http://localhost:5000/api/issues/${issueId}/assign`, { 
          techId: tech._id || tech.id,
          priority: assignmentData.priority,
          dueDate: assignmentData.dueDate,
          status: 'ASSIGNED'
        }, config);
        console.log('Assignment successful (method 1):', response.data);
      } catch (err1) {
        console.log('Assignment method 1 failed, trying method 2:', err1.response?.data);
        try {
          // Second try: PUT with assignment fields
          response = await axios.put(`http://localhost:5000/api/issues/${issueId}`, {
            assignedTo: tech._id || tech.id,
            priority: assignmentData.priority,
            dueDate: assignmentData.dueDate,
            status: 'ASSIGNED'
          }, config);
          console.log('Assignment successful (method 2):', response.data);
        } catch (err2) {
          console.log('Assignment method 2 failed, trying method 3:', err2.response?.data);
          try {
            // Third try: Different assign endpoint
            response = await axios.put(`http://localhost:5000/api/issues/${issueId}/assign`, { 
              technicianId: tech._id || tech.id,
              priority: assignmentData.priority,
              dueDate: assignmentData.dueDate,
              status: 'ASSIGNED'
            }, config);
            console.log('Assignment successful (method 3):', response.data);
          } catch (err3) {
            console.error('All assignment methods failed:', err3.response?.data);
            throw err3;
          }
        }
      }
      
      setIssues(prev => prev.map((iss, i) => i === idx ? response.data : iss));
      setAssigning(null);
      setAssignmentData({ technicianId: "", priority: "MEDIUM", dueDate: "" });
      alert('Issue assigned successfully!');
    } catch (err) {
      console.error('Assignment error:', err.response?.data || err.message);
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

  // Filter function for All Issues tab
  const getFilteredIssues = () => {
    const allIssues = [...pendingRequests, ...issues];
    
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



  const totalIssues = summary.pending + summary.inProgress + summary.completed + summary.overdue;
  const completed = summary.completed;
  const overdue = summary.overdue;
  const inProgress = summary.inProgress;
  const completionRate = totalIssues ? Math.round((completed / totalIssues) * 100) : 0;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg flex flex-col justify-between">
        <div>
          {/* User Info */}
          <div className="flex flex-col items-center py-8 border-b border-gray-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl text-indigo-600 font-bold">AK</span>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg">Alice Kayitesi</div>
              <div className="text-sm text-blue-600 font-medium">Manager</div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex flex-col gap-1 mt-8 px-4">
            <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition ${activeTab === 'overview' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              Overview
            </button>
            <button onClick={() => setActiveTab('requests')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition ${activeTab === 'requests' ? 'bg-orange-100 text-orange-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              Pending Requests
              {pendingRequests.length > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('issues')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition ${activeTab === 'issues' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              Issue Management
            </button>
            <button onClick={() => setActiveTab('all-issues')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition ${activeTab === 'all-issues' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              All Issues
            </button>
            <button onClick={() => setActiveTab('feedback')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition ${activeTab === 'feedback' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              Technician Feedback
            </button>
          </nav>
        </div>
        {/* Logout */}
        <div className="p-6 border-t">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition text-red-600 hover:bg-red-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5M21 12l-5 5M21 12h-9" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto bg-gray-50">

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            {pendingRequests.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#9ca3af" strokeWidth="2"/></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">All client requests have been reviewed</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingRequests.map(request => (
                  <div key={request._id || request.id || request.title || request.createdAt} className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.title}</h3>
                      <p className="text-gray-600 mb-3">{request.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">📍 {request.location}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{request.priority || 'MEDIUM'}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                      {(request.beforePhoto || request.photo) && (
                        <img src={`http://localhost:5000${request.beforePhoto || request.photo}`} alt="Issue" className="w-24 h-24 object-cover rounded-lg mb-2" />
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => { setSelectedRequest(request); setShowApprovalModal(true); }} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">✅ Approve</button>
                      <button onClick={() => { setSelectedRequest(request); setDeclineReason(''); setShowApprovalModal(true); }} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">❌ Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div>
            {issues.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="#9ca3af" strokeWidth="2"/></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Approved Issues</h3>
                <p className="text-gray-600">No issues have been approved for assignment yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {issues.map((issue, idx) => (
                  <div key={issue._id || issue.id || issue.title || idx} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block w-3 h-3 rounded-full" style={{ background: issue.status === 'COMPLETE' || issue.status === 'COMPLETED' ? '#22c55e' : issue.status === 'IN PROGRESS' ? '#2563eb' : '#6366f1' }}></span>
                        <span className="text-lg font-semibold text-gray-900 flex-1">{issue.title}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{issue.status || 'PENDING'}</span>
                      </div>
                      <div className="text-gray-500 text-sm mb-2">{issue.location}</div>
                      {(issue.photo || issue.image) && (
                        <img src={`http://localhost:5000${issue.photo || issue.image}`} alt="Issue" className="w-full h-32 object-cover rounded mb-3" />
                      )}
                      <div className="text-gray-700 text-sm mb-3">{issue.description}</div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">Assigned to: {issue.assignedTo ? (() => { const tech = technicians.find(t => (t._id || t.id) === issue.assignedTo); return tech ? tech.name : 'Unknown'; })() : 'Unassigned'}</span>
                      <button onClick={() => handleOpenAssignment(idx)} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">Assign</button>
                    </div>
                    {assigning === idx && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 mb-3">Assign Issue to Technician</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={assignmentData.technicianId} onChange={(e) => setAssignmentData({...assignmentData, technicianId: e.target.value})}>
                              <option value="">Select technician...</option>
                              {technicians.map(tech => (<option key={tech._id || tech.id} value={tech._id || tech.id}>{tech.name}</option>))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={assignmentData.priority} onChange={(e) => setAssignmentData({...assignmentData, priority: e.target.value})}>
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                              <option value="URGENT">Urgent</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={assignmentData.dueDate} onChange={(e) => setAssignmentData({...assignmentData, dueDate: e.target.value})} min={new Date().toISOString().split('T')[0]} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { const tech = technicians.find(t => (t._id || t.id) === assignmentData.technicianId); if (tech && assignmentData.dueDate) { handleAssignTech(idx, tech.name); } else { alert('Please select a technician and due date'); } }} disabled={!assignmentData.technicianId || !assignmentData.dueDate} className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Assign Issue</button>
                          <button className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200" onClick={() => { setAssigning(null); setAssignmentData({ technicianId: '', priority: 'MEDIUM', dueDate: '' }); }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Issues Tab */}
        {activeTab === 'all-issues' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                    <option value="all">All Status</option>
                    <option value="pending-approval">Pending Approval</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={filters.priority} onChange={(e) => setFilters({...filters, priority: e.target.value})}>
                    <option value="all">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={filters.assignedTo} onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}>
                    <option value="all">All Issues</option>
                    <option value="unassigned">Unassigned</option>
                    <option value="assigned">Assigned</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Issues List */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  All Issues ({getFilteredIssues().length})
                </h3>
                <div className="space-y-4">
                  {getFilteredIssues().length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#9ca3af" strokeWidth="2"/></svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Issues Found</h4>
                      <p className="text-gray-600">Try adjusting your filters</p>
                    </div>
                  ) : (
                    getFilteredIssues().map((issue, idx) => (
                      <div key={issue._id || issue.id || issue.title || idx} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                issue.status === 'COMPLETE' || issue.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                issue.status === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                issue.status === 'PENDING' && !issue.assignedTo ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {issue.status === 'COMPLETE' || issue.status === 'COMPLETED' ? 'Complete' :
                                 issue.status === 'IN PROGRESS' ? 'In Progress' :
                                 issue.status === 'PENDING' && !issue.assignedTo ? 'Pending Approval' :
                                 issue.status || 'PENDING'}
                              </span>
                              {issue.priority && (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  issue.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                  issue.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                  issue.priority === 'LOW' ? 'bg-gray-100 text-gray-700' :
                                  'bg-purple-100 text-purple-700'
                                }`}>
                                  {issue.priority}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>📍 {issue.location}</span>
                              <span>📅 {new Date(issue.createdAt).toLocaleDateString()}</span>
                              {issue.dueDate && (
                                <span className={new Date(issue.dueDate) < new Date() ? 'text-red-600 font-semibold' : ''}>
                                  ⏰ Due: {new Date(issue.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              {issue.assignedTo && (
                                <span>👤 Assigned to: {
                                  (() => {
                                    const tech = technicians.find(t => (t._id || t.id) === issue.assignedTo);
                                    return tech ? tech.name : 'Unknown';
                                  })()
                                }</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            {(issue.photo || issue.image) && (
                              <img
                                src={`http://localhost:5000${issue.photo || issue.image}`}
                                alt="Issue"
                                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 mb-2"
                                onClick={() => window.open(`http://localhost:5000${issue.photo || issue.image}`, '_blank')}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div>
            {console.log('[ManagerDashboard] Feedback tab render. feedbacks:', feedbacks, 'loadingFeedbacks:', loadingFeedbacks)}
            {loadingFeedbacks ? (
              <div className="text-gray-400 text-center py-8">Loading feedback...</div>
            ) : feedbacks.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No feedback from technicians yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks.map((fb, idx) => (
                  <div key={fb._id || fb.id || fb.title || idx} className="bg-gradient-to-r from-green-50 via-white to-gray-50 rounded-2xl p-6 shadow border border-green-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-green-700">{fb.assignees && fb.assignees.length > 0 ? (fb.assignees[0].name || 'Technician') : 'Technician'}</span>
                      <span className="text-xs bg-green-100 text-green-700 rounded px-2 py-1 font-medium">{fb.updatedAt ? new Date(fb.updatedAt).toLocaleDateString() : ''}</span>
                    </div>
                    {fb.afterImage && (
                      <img
                        src={fb.afterImage.startsWith('/uploads/') ? `http://localhost:5000${fb.afterImage}` : fb.afterImage}
                        alt="After evidence"
                        className="w-32 h-32 object-cover rounded mb-2 border"
                      />
                    )}
                    <div className="text-gray-700 text-base">
                      {fb.address ? fb.address : <span className="italic text-gray-400">No completion details provided.</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Related Issue: {fb.title || fb._id || fb.id}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">Review Client Request</h2>
                  <button
                    onClick={() => {
                      setShowApprovalModal(false);
                      setSelectedRequest(null);
                      setDeclineReason('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Title</h3>
                    <p className="text-gray-900">{selectedRequest.title}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Description</h3>
                    <p className="text-gray-900">{selectedRequest.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Location</h3>
                    <p className="text-gray-900">{selectedRequest.location}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-700">Priority</h3>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        selectedRequest.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                        selectedRequest.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedRequest.priority || 'MEDIUM'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Submitted</h3>
                      <p className="text-gray-900">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {(selectedRequest.beforePhoto || selectedRequest.photo) && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Client Photo</h3>
                      <img 
                        src={`http://localhost:5000${selectedRequest.beforePhoto || selectedRequest.photo}`}
                        alt="Issue"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Decline Reason (if declining)</h3>
                    <textarea
                      className="w-full border rounded px-3 py-2"
                      rows="3"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Please provide a reason for declining this request..."
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => handleApproveRequest(selectedRequest)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve Request
                    </button>
                    <button
                      onClick={handleDeclineRequest}
                      disabled={!declineReason.trim()}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Decline Request
                    </button>
                    <button
                      onClick={() => {
                        setShowApprovalModal(false);
                        setSelectedRequest(null);
                        setDeclineReason('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManagerDashboard;
