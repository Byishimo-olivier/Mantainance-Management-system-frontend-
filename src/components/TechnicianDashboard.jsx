import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from 'react-router-dom';

// AFTER EVIDENCE FORM WITH COMPLETION DETAILS
function AfterEvidenceForm({ issueId, onSuccess }) {
  const [afterImage, setAfterImage] = React.useState(null);
  const [completionDetails, setCompletionDetails] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAfterImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    if (afterImage) formData.append("afterImage", afterImage);
    formData.append("address", completionDetails);
    try {
      // Authorization handled by interceptor. 
      // Important: Allow axios/browser to set Content-Type for FormData to include boundary
      const response = await api.post(
        `/api/issues/${issueId}/evidence/after`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setAfterImage(null);
      setCompletionDetails("");
      if (onSuccess) onSuccess();
      alert("AFTER evidence submitted. Status set to Complete.");
      console.log("AFTER evidence response:", response.data);
    } catch (err) {
      console.error("AFTER evidence error:", err.response?.data || err.message);
      alert(`Failed to upload AFTER evidence: ${err.response?.data?.error || err.message}`);
    }
    setLoading(false);
  };

  return (
    <form className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto" onSubmit={handleSubmit}>
      <h2 className="font-semibold text-lg mb-4">Upload AFTER Evidence</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Upload AFTER image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} required />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Completion Details</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows="3"
          value={completionDetails}
          onChange={(e) => setCompletionDetails(e.target.value)}
          placeholder="Describe how you completed this work..."
          required
        />
      </div>
      <button
        type="submit"
        className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Submit AFTER Evidence"}
      </button>
    </form>
  );
}

const TechnicianDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [user, setUser] = useState({ name: "", id: "" });
  const [showAfterForm, setShowAfterForm] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [showMaterialRequestForm, setShowMaterialRequestForm] = useState(false);
  const [materialRequestData, setMaterialRequestData] = useState({
    title: "",
    description: "",
    quantity: 1,
    urgency: "MEDIUM"
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAfterSuccess = (jobId) => {
    setShowAfterForm((prev) => ({ ...prev, [jobId]: false }));
    fetchAssignedIssues();
  };

  const handleStartWork = async (jobId) => {
    try {
      // Authorization handled by interceptor

      await api.put(`/api/issues/${jobId}`, {
        status: 'IN PROGRESS'
      });

      fetchAssignedIssues();
      alert('Work started! Status set to In Progress.');
    } catch (error) {
      console.error("Start work error:", error);
      alert('Failed to start work');
    }
  };

  const toggleAfterForm = (jobId) => {
    setShowAfterForm((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const toggleMaterialRequestForm = () => {
    setShowMaterialRequestForm(!showMaterialRequestForm);
  };

  const handleMaterialRequestChange = (e) => {
    const { name, value } = e.target;
    setMaterialRequestData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }));
  };

  const handleMaterialRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      // Authorization handled by interceptor

      const requestData = {
        ...materialRequestData,
        technicianId: user._id || user.id,
        technicianName: user.name
      };

      await api.post('/api/material-requests', requestData);

      alert('Material request submitted successfully!');
      setMaterialRequestData({
        title: "",
        description: "",
        quantity: 1,
        urgency: "MEDIUM"
      });
      setShowMaterialRequestForm(false);

      // Refresh material requests
      fetchMaterialRequests();
    } catch (error) {
      console.error("Material request error:", error);
      alert('Failed to submit material request');
    }
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
  };

  const getJobStatus = (job) => {
    if (isOverdue(job.dueDate)) {
      return 'OVERDUE';
    }
    return job.status || 'PENDING';
  };

  /* Helper for imageSrc using base URL if needed, but here we just open in new tab.
     Since we are refactoring, we need to know the base URL. 
     We can access it from api.defaults.baseURL or import.meta.env.VITE_API_URL 
  */
  const handleImageClick = (imageSrc, title) => {
    const baseUrl = api.defaults.baseURL || import.meta.env.VITE_API_URL || '';
    window.open(`${baseUrl}${imageSrc}`, '_blank');
  };

  const fetchAssignedIssues = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      // Authorization handled by interceptor
      api.get(`/api/issues/assigned/${u._id || u.id}`)
        .then(res => setJobs(res.data))
        .catch(err => {
          console.warn('Failed to fetch assigned issues:', err?.response?.data || err.message);
          setJobs([]);
        });
    }
  };

  const fetchMaterialRequests = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      // Authorization handled by interceptor
      api.get(`/api/material-requests/tech/${u._id || u.id}`)
        .then(res => setMaterialRequests(res.data))
        .catch(err => {
          console.warn('Material requests endpoint failed:', err?.response?.status || err.message);
          setMaterialRequests([]);
        });
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      fetchAssignedIssues();
      fetchMaterialRequests();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Technician Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <button
            onClick={toggleMaterialRequestForm}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Ask for Material
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Material Request Form Modal */}
      {showMaterialRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Request Materials</h2>
                <button
                  onClick={toggleMaterialRequestForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleMaterialRequestSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Material Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={materialRequestData.title}
                      onChange={handleMaterialRequestChange}
                      className="w-full border rounded px-3 py-2"
                      placeholder="e.g., Paint, Nails, Wood Panels"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Description *</label>
                    <textarea
                      name="description"
                      value={materialRequestData.description}
                      onChange={handleMaterialRequestChange}
                      className="w-full border rounded px-3 py-2"
                      rows="3"
                      placeholder="Describe what you need and why..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        name="quantity"
                        value={materialRequestData.quantity}
                        onChange={handleMaterialRequestChange}
                        className="w-full border rounded px-3 py-2"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Urgency *</label>
                      <select
                        name="urgency"
                        value={materialRequestData.urgency}
                        onChange={handleMaterialRequestChange}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-2 rounded font-semibold hover:bg-purple-700"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={toggleMaterialRequestForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">Assigned Issues</h2>
          <div className="text-3xl font-bold">{jobs.length}</div>
          <p className="text-sm text-gray-500 mt-2">Total jobs assigned to you</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">In Progress</h2>
          <div className="text-3xl font-bold">
            {jobs.filter(job => getJobStatus(job) === 'IN PROGRESS').length}
          </div>
          <p className="text-sm text-gray-500 mt-2">Currently working on</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">Material Requests</h2>
          <div className="text-3xl font-bold">{materialRequests.length}</div>
          <p className="text-sm text-gray-500 mt-2">Requests submitted</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assigned Issues Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-xl">Assigned Issues</h2>
            <span className="text-sm text-gray-500">{jobs.length} total</span>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No assigned issues found
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.id || job._id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* BEFORE Photo */}
                    {(job.beforePhoto || job.photo || job.image) && (
                      <div className="flex-shrink-0">
                        <img
                          src={`${api.defaults.baseURL || import.meta.env.VITE_API_URL || ''}${job.beforePhoto || job.photo || job.image}`}
                          alt="Issue"
                          className="w-20 h-20 object-cover rounded-lg shadow border cursor-pointer hover:opacity-80 transition"
                          onClick={() => handleImageClick(job.beforePhoto || job.photo || job.image, job.title)}
                          title="Click to view larger image"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">{job.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getJobStatus(job) === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' :
                              getJobStatus(job) === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                (getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED') ? 'bg-green-100 text-green-700' :
                                  getJobStatus(job) === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                              }`}>
                              {(getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED') ? 'Complete' : getJobStatus(job)}
                            </span>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${job.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                              job.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                job.priority === 'LOW' ? 'bg-gray-100 text-gray-700' :
                                  'bg-purple-100 text-purple-700'
                              }`}>
                              {job.priority || 'MEDIUM'} Priority
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          {job.dueDate && (
                            <span className={`text-xs ${isOverdue(job.dueDate) ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                              Due: {new Date(job.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleViewJob(job)}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                              View
                            </button>

                            {getJobStatus(job) === 'PENDING' && (
                              <button
                                className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                                onClick={() => handleStartWork(job.id || job._id)}
                              >
                                Start Work
                              </button>
                            )}

                            {getJobStatus(job) === 'IN PROGRESS' && (
                              <button
                                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                onClick={() => toggleAfterForm(job.id || job._id)}
                              >
                                {showAfterForm[job.id || job._id] ? 'Cancel' : 'Complete'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* AFTER FORM */}
                      {showAfterForm[job.id || job._id] && (
                        <div className="mt-4 pt-4 border-t">
                          <AfterEvidenceForm
                            issueId={job.id || job._id}
                            onSuccess={() => handleAfterSuccess(job.id || job._id)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Material Requests & Work History */}
        <div className="space-y-8">
          {/* Material Requests */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-xl">Material Requests</h2>
              <button
                onClick={toggleMaterialRequestForm}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              >
                + New Request
              </button>
            </div>

            {materialRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No material requests yet
              </div>
            ) : (
              <div className="space-y-3">
                {materialRequests.slice(0, 5).map(req => (
                  <div key={req.id || req._id} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{req.title || req.items?.[0]?.title || ''}</h4>
                        <p className="text-sm text-gray-600 mt-1">{req.description || ''}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            Qty: {req.quantity || req.items?.[0]?.quantity || ''}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${req.urgency === 'URGENT' ? 'bg-red-100 text-red-700' :
                            req.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                              req.urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                            {req.urgency}
                          </span>
                        </div>

                        {/* If there are item records, show them explicitly */}
                        {req.items && req.items.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {req.items.map(it => (
                              <span key={it.id || it._id || `${it.materialId}-${it.quantity}`} className="text-xs bg-gray-50 border text-gray-700 px-2 py-1 rounded">
                                {it.title || it.materialId || 'Item'} x {it.quantity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            req.status === 'FULFILLED' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                        }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
                {materialRequests.length > 5 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => {/* Implement view all */ }}
                      className="text-sm text-purple-600 hover:text-purple-800"
                    >
                      View all {materialRequests.length} requests
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Work History */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-xl mb-4">Recent Work History</h2>
            <div className="space-y-3">
              {jobs
                .filter(job => getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED')
                .slice(0, 5)
                .map(job => (
                  <div key={job.id || job._id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <h4 className="font-medium text-gray-800">{job.title}</h4>
                      <p className="text-sm text-gray-500">{job.location}</p>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Completed</span>
                  </div>
                ))}
              {jobs.filter(job => getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No completed jobs yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Issue Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Issue Details</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Title</h3>
                  <p className="text-gray-900">{selectedJob.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Description</h3>
                  <p className="text-gray-900">{selectedJob.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Location</h3>
                  <p className="text-gray-900">{selectedJob.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Status</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getJobStatus(selectedJob) === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      getJobStatus(selectedJob) === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        (getJobStatus(selectedJob) === 'COMPLETE' || getJobStatus(selectedJob) === 'COMPLETED') ? 'bg-green-100 text-green-700' :
                          getJobStatus(selectedJob) === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                      }`}>
                      {(getJobStatus(selectedJob) === 'COMPLETE' || getJobStatus(selectedJob) === 'COMPLETED') ? 'Complete' : getJobStatus(selectedJob)?.replace('_', ' ') || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Priority</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${selectedJob.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      selectedJob.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        selectedJob.priority === 'LOW' ? 'bg-gray-100 text-gray-700' :
                          'bg-purple-100 text-purple-700'
                      }`}>
                      {selectedJob.priority || 'MEDIUM'}
                    </span>
                  </div>
                </div>

                {/* Evidence Display */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Evidence</h3>
                  <div className="space-y-3">
                    {(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600">Before (Client Photo)</h4>
                        <img
                          src={`${api.defaults.baseURL || import.meta.env.VITE_API_URL || ''}${selectedJob.beforePhoto || selectedJob.photo || selectedJob.image}`}
                          alt="Before"
                          className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                          onClick={() => handleImageClick(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image, selectedJob.title)}
                          title="Click to view larger image"
                        />
                      </div>
                    )}
                    {selectedJob.evidence?.afterImage && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600">After</h4>
                        <img
                          src={`${api.defaults.baseURL || import.meta.env.VITE_API_URL || ''}${selectedJob.evidence.afterImage}`}
                          alt="After"
                          className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                          onClick={() => handleImageClick(selectedJob.evidence.afterImage, `${selectedJob.title} - After`)}
                          title="Click to view larger image"
                        />
                      </div>
                    )}
                    {selectedJob.evidence?.address && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600">Completion Details</h4>
                        <p className="text-sm text-gray-900">{selectedJob.evidence.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;