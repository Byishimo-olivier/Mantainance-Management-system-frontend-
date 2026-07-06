import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { getImageUrl } from '../utils/imageUrl';
import { useNavigate } from "react-router-dom";

function RequestsPage() {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  const isPmLinkedIssue = (issue) => {
    if (!issue) return false;
    const normalizedReference = String(issue?.referenceType || issue?.recordType || '').toLowerCase();
    const tags = Array.isArray(issue.tags) ? issue.tags.map(tag => String(tag || '').toLowerCase()) : [];
    return Boolean(
      issue.createdBySchedule
      || issue.isPreventive
      || issue.pmTrigger
      || normalizedReference.includes('workorder')
      || normalizedReference.includes('work order')
      || normalizedReference.includes('work_order')
      || tags.some(tag => tag.includes('prevent') || tag.includes('recurring-pm') || tag.includes('auto-generated'))
    );
  };

  const fetchPendingRequests = async () => {
    try {
      // Auth header handled by interceptor

      console.log('Fetching all issues for Requests page...');
      const response = await api.get("/api/issues");
      console.log('All issues response:', response.data);

      // More flexible filtering - show issues that need approval
      const pendingRequests = response.data.filter(issue => {
        if (isPmLinkedIssue(issue)) {
          console.log('Skipping PM linked issue from Requests page:', issue.title, issue);
          return false;
        }

        // Show if status is PENDING and not assigned
        if (issue.status === 'PENDING' && !issue.assignedTo) {
          console.log('Found pending request:', issue.title, issue);
          return true;
        }

        // Show if explicitly marked as not approved
        if (issue.approved === false && !issue.assignedTo) {
          console.log('Found unapproved request:', issue.title, issue);
          return true;
        }

        // Show if created by client and not assigned
        if (issue.createdBy && issue.createdBy.role === 'client' && !issue.assignedTo) {
          console.log('Found client request:', issue.title, issue);
          return true;
        }

        return false;
      });

      console.log('Final filtered pending requests:', pendingRequests);
      setPendingRequests(pendingRequests);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
      setPendingRequests([]);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      // Try to update with approval fields first
      try {
        await api.put(`/api/issues/${requestId}`, {
          status: 'PENDING',
          approved: true,
          approvedBy: JSON.parse(localStorage.getItem('user')).id,
          approvedAt: new Date().toISOString()
        });
      } catch (approvalError) {
        console.log('Approval fields not supported, trying basic update...');
        // Fallback: just update status to indicate it's ready for assignment
        await api.put(`/api/issues/${requestId}`, {
          status: 'PENDING'
        });
      }

      fetchPendingRequests();
      setShowApprovalModal(false);
      setSelectedRequest(null);
      alert('Request approved! Ready for assignment.');
    } catch (error) {
      console.error('Approval error:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to approve request: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeclineRequest = async () => {
    try {
      // Try to update with rejection fields first
      try {
        await api.put(`/api/issues/${selectedRequest._id}`, {
          status: 'REJECTED',
          rejected: true,
          rejectedBy: JSON.parse(localStorage.getItem('user')).id,
          rejectedAt: new Date().toISOString(),
          rejectionReason: declineReason
        });
      } catch (rejectionError) {
        console.log('Rejection fields not supported, trying basic update...');
        // Fallback: just update status and store reason in description
        await api.put(`/api/issues/${selectedRequest._id}`, {
          status: 'REJECTED',
          description: `${selectedRequest.description}\n\nREJECTED: ${declineReason}`
        });
      }

      fetchPendingRequests();
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setDeclineReason('');
      alert('Request declined successfully!');
    } catch (error) {
      console.error('Decline error:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to decline request: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white shadow px-4 md:px-8 h-16">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-600 rounded-xl p-1 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1" /><rect x="6" y="6" width="12" height="6" rx="2" fill="#a5b4fc" /></svg>
          </span>
          <div className="flex flex-col ml-1">
            <span className="text-lg font-bold text-gray-900">PropCare</span>
            <span className="text-sm text-gray-500">Alice Kayitesi</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold" onClick={() => navigate('/dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#ede9fe" /><rect x="7" y="7" width="4" height="4" rx="1" fill="#8b5cf6" /><rect x="13" y="7" width="4" height="4" rx="1" fill="#8b5cf6" /><rect x="7" y="13" width="4" height="4" rx="1" fill="#8b5cf6" /><rect x="13" y="13" width="4" height="4" rx="1" fill="#8b5cf6" /></svg> Dashboard
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-100 text-orange-700 font-semibold" onClick={() => navigate('/requests')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="9" stroke="#ea580c" strokeWidth="2" /></svg> Requests
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/issues')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6" /><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1" /></svg> All Issues
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-gray-100 rounded-lg px-2 py-1 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#f3f4f6" /><path d="M8 12h8" stroke="#222" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gray-100 font-semibold" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-2 md:px-4 pt-6 md:pt-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pending Client Requests</h1>
          <p className="text-gray-600 mt-1">Review and approve or decline client maintenance requests</p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#9ca3af" strokeWidth="2" /><path d="M12 8v4l3 3" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
              <p className="text-gray-600">All client requests have been reviewed</p>
            </div>
          ) : (
            <div className="divide-y">
              {pendingRequests.map(request => (
                <div key={request._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {getImageUrl(request.beforePhoto || request.photo) && (
                          <img
                            src={getImageUrl(request.beforePhoto || request.photo)}
                            alt="Issue"
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                            onClick={() => window.open(getImageUrl(request.beforePhoto || request.photo), '_blank')}
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.title}</h3>
                          <p className="text-gray-600 mb-3">{request.description}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              📍 {request.location}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                              request.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                              {request.priority || 'MEDIUM'} Priority
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              📅 {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                            {request.createdBy && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                👤 {request.createdBy.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowApprovalModal(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setDeclineReason('');
                          setShowApprovalModal(true);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      >
                        ❌ Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${selectedRequest.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
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

                {/* BEFORE Photo */}
                {getImageUrl(selectedRequest.beforePhoto || selectedRequest.photo) && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Client Photo</h3>
                    <img
                      src={getImageUrl(selectedRequest.beforePhoto || selectedRequest.photo)}
                      alt="Issue"
                      className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(getImageUrl(selectedRequest.beforePhoto || selectedRequest.photo), '_blank')}
                    />
                  </div>
                )}

                {/* Decline Reason */}
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
                    onClick={() => handleApproveRequest(selectedRequest._id)}
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
    </div>
  );
}

export default RequestsPage;
