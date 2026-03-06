import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { getImageUrl } from '../utils/imageUrl';
import { useNavigate } from 'react-router-dom';
import Header from "./Header";

// BEFORE EVIDENCE FORM WITH START DETAILS
function BeforeEvidenceForm({ issueId, onSuccess, hasExistingImage }) {
  const [beforeImage, setBeforeImage] = React.useState(null);
  const [address, setAddress] = React.useState("");
  const [fixTime, setFixTime] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBeforeImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    if (beforeImage) formData.append("beforeImage", beforeImage);
    formData.append("address", address);
    formData.append("fixTime", fixTime);
    try {
      const response = await api.post(
        `/api/issues/${issueId}/evidence/before`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setBeforeImage(null);
      setAddress("");
      setFixTime("");
      if (onSuccess) onSuccess();
      alert("Work started! Status set to In Progress.");
      console.log("BEFORE evidence response:", response.data);
    } catch (err) {
      console.error("BEFORE evidence error:", err.response?.data || err.message);
      alert(`Failed to start work: ${err.response?.data?.error || err.message}`);
    }
    setLoading(false);
  };
  return (
    <form className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 max-w-lg mx-auto" onSubmit={handleSubmit}>
      <h2 className="font-bold text-xl mb-4 text-orange-600 flex items-center gap-2">
        <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm">1</span>
        Start Working
      </h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-semibold text-sm">
          {hasExistingImage ? "Upload new BEFORE photo (optional)" : "Upload BEFORE photo *"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required={!hasExistingImage}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-colors"
        />
        {hasExistingImage && <p className="text-[10px] text-gray-400 mt-1 italic">An image already exists, so this is optional.</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">Starting Location/Notes *</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Confirm current location or starting notes..."
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">Estimated Time (minutes) *</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
          value={fixTime}
          onChange={(e) => setFixTime(e.target.value)}
          placeholder="How many minutes will this take?"
          required
          min="1"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition shadow-lg"
        disabled={loading}
      >
        {loading ? "Starting..." : "Start Working Now"}
      </button>
    </form>
  );
}

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
  const [showBeforeForm, setShowBeforeForm] = useState({});
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

  const handleBeforeSuccess = (jobId) => {
    setShowBeforeForm((prev) => ({ ...prev, [jobId]: false }));
    fetchAssignedIssues();
  };

  const handleStartWork = (jobId) => {
    setShowBeforeForm((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
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
    const status = (job.status || 'PENDING').toUpperCase();
    if (status.includes('COMPLETE')) {
      return status;
    }
    if (status === 'IN PROGRESS' || status === 'IN_PROGRESS') {
      return 'IN PROGRESS';
    }
    if (isOverdue(job.dueDate)) {
      return 'OVERDUE';
    }
    return status;
  };

  /* Helper for imageSrc using base URL if needed, but here we just open in new tab.
     Since we are refactoring, we need to know the base URL. 
     We can access it from api.defaults.baseURL or import.meta.env.VITE_API_URL 
  */
  const handleImageClick = (imageSrc, title) => {
    const url = getImageUrl(imageSrc);
    if (url) window.open(url, '_blank');
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

  const [alerts, setAlerts] = useState([]);
  const [reminders, setReminders] = useState([]); // Keep for backward compatibility or refactor to use alerts

  const getTimeRemaining = (targetDate) => {
    if (!targetDate) return null;
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;

    const isOverdue = diff < 0;
    const absDiff = Math.abs(diff);

    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return { text: `${Math.floor(hours / 24)}d ${hours % 24}h`, isOverdue };
    return { text: `${hours}h ${minutes}m`, isOverdue };
  };

  const fetchReminders = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    try {
      const u = JSON.parse(userStr);
      const res = await api.get(`/api/maintenance-schedules/technician/${u._id || u.id}`);
      const schedules = res.data || [];

      const now = new Date();
      const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      // Process Maintenance Reminders
      const upcomingSchedules = schedules.filter(s =>
        s && s.routine && s.nextDate &&
        new Date(s.nextDate) <= cutoff &&
        (!s.lastReminder || new Date(s.lastReminder) < new Date(s.nextDate)) &&
        (!s.snoozedUntil || new Date(s.snoozedUntil) < now) &&
        (!s.dismissedBy || !s.dismissedBy[u._id || u.id])
      ).map(s => ({
        ...s,
        type: 'MAINTENANCE',
        priority: 'MEDIUM',
        deadline: s.nextDate
      }));

      // Process Issue Deadlines
      const issueAlerts = jobs.filter(j => {
        const deadline = j.fixDeadline || j.dueDate;
        if (!deadline) return false;
        const dDate = new Date(deadline);
        const isComplete = (j.status || '').toLowerCase().includes('complete');
        // Show if due within 24h or already overdue, and NOT complete
        return !isComplete && (dDate <= cutoff);
      }).map(j => ({
        ...j,
        type: 'ISSUE',
        priority: j.priority || 'HIGH',
        deadline: j.fixDeadline || j.dueDate,
        name: j.title
      }));

      const unifiedAlerts = [...upcomingSchedules, ...issueAlerts].sort((a, b) =>
        new Date(a.deadline) - new Date(b.deadline)
      );

      setAlerts(unifiedAlerts);
      setReminders(upcomingSchedules); // Maintain for any components still using it
    } catch (err) {
      console.warn('Failed to fetch alerts:', err);
    }
  };

  const dismissOne = async (id, type) => {
    try {
      if (type === 'MAINTENANCE') {
        await api.post(`/api/maintenance-schedules/${id}/dismiss`, { userId: user._id || user.id });
      }
      // For issues, we just hide them locally for now or if we implement an ignore flag
      setAlerts(prev => prev.filter(a => (a._id || a.id) !== id));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const snoozeOne = async (id, type, minutes = 60) => {
    try {
      if (type === 'MAINTENANCE') {
        await api.post(`/api/maintenance-schedules/${id}/snooze`, { minutes, userId: user._id || user.id });
      }
      setAlerts(prev => prev.filter(a => (a._id || a.id) !== id));
    } catch (err) {
      console.error('Failed to snooze alert:', err);
    }
  };

  const dismissAll = async () => {
    try {
      for (const a of alerts) {
        if (a.type === 'MAINTENANCE') {
          await api.post(`/api/maintenance-schedules/${a._id || a.id}/dismiss`, { userId: user._id || user.id });
        }
      }
      setAlerts([]);
    } catch (err) {
      console.error('Failed to dismiss all alerts:', err);
    }
  };

  const snoozeAll = async (minutes = 60) => {
    try {
      for (const a of alerts) {
        if (a.type === 'MAINTENANCE') {
          await api.post(`/api/maintenance-schedules/${a._id || a.id}/snooze`, { minutes, userId: user._id || user.id });
        }
      }
      setAlerts([]);
    } catch (err) {
      console.error('Failed to snooze all alerts:', err);
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

  // Sync reminders/alerts when jobs are loaded or periodically
  useEffect(() => {
    if (user.id || user._id) {
      fetchReminders();
    }
  }, [jobs, user]);

  // Real-time timer update
  useEffect(() => {
    const timer = setInterval(() => {
      // Force re-render to update countdown strings
      setAlerts(prev => [...prev]);
    }, 60000); // Every minute
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Reminders Panel */}
      {alerts.length > 0 && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full">
          <div className="bg-slate-900 border-l-4 border-purple-500 text-white p-4 shadow-2xl rounded-r-xl animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏰</span>
                <p className="font-bold text-lg text-purple-200">Task Alerts</p>
              </div>
              <button
                onClick={() => setAlerts([])}
                className="text-gray-400 hover:text-white transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm mb-4 text-gray-300">You have {alerts.length} {alerts.length === 1 ? 'task' : 'tasks'} requiring attention.</p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 select-none custom-scrollbar">
              {alerts.map((a) => {
                const id = a._id || a.id;
                const remaining = getTimeRemaining(a.deadline);
                const isOverdue = remaining?.isOverdue;

                return (
                  <div key={`${a.type}-${id}`} className={`p-3 rounded-lg border shadow-sm transition-all ${isOverdue ? 'bg-red-900/40 border-red-500/50' : 'bg-slate-800 border-slate-700'
                    }`}>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${a.type === 'MAINTENANCE' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                            {a.type}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded font-bold uppercase animate-pulse">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-white leading-tight text-sm">{a.name}</p>
                      </div>
                      <div className={`text-right ${isOverdue ? 'text-red-400' : 'text-purple-300'}`}>
                        <p className="text-xs font-bold whitespace-nowrap">
                          {isOverdue ? 'LATE BY' : 'REMAINING'}
                        </p>
                        <p className="text-sm font-mono font-black tabular-nums">
                          {remaining?.text || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {a.type === 'MAINTENANCE' ? (
                        <>
                          <button
                            className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-md hover:bg-purple-500 transition-colors shadow-sm"
                            onClick={() => dismissOne(id, a.type)}
                          >
                            Dismiss
                          </button>
                          <button
                            className="flex-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-md hover:bg-amber-500 transition-colors shadow-sm"
                            onClick={() => snoozeOne(id, a.type, 60)}
                          >
                            Snooze 1h
                          </button>
                        </>
                      ) : (
                        <button
                          className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-500 transition-colors shadow-sm"
                          onClick={() => {
                            setSelectedJob(a);
                            // Scroll to the job or highlight it?
                          }}
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700 flex gap-2">
              <button
                className="flex-1 px-3 py-2 bg-slate-800 text-gray-300 text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                onClick={dismissAll}
              >
                Dismiss All Maint.
              </button>
              <button
                className="flex-1 px-3 py-2 bg-amber-700/50 text-amber-200 text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors border border-amber-600/50"
                onClick={() => snoozeAll(60)}
              >
                Snooze All Maint.
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        title="Technician Dashboard"
        subtitle={`Welcome back, ${user.name}`}
        user={user}
        right={
          <div className="flex gap-4">
            <button
              onClick={toggleMaterialRequestForm}
              className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition border border-purple-200"
            >
              Ask for Material
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition border border-red-200"
            >
              Logout
            </button>
          </div>
        }
      />

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-gray-400">
          <h2 className="font-semibold text-lg mb-2">Assigned Issues</h2>
          <div className="text-3xl font-bold">{jobs.filter(job => getJobStatus(job) !== 'COMPLETE' && getJobStatus(job) !== 'COMPLETED').length}</div>
          <p className="text-sm text-gray-500 mt-2">Total jobs assigned to you</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <h2 className="font-semibold text-lg mb-2">In Progress</h2>
          <div className="text-3xl font-bold text-blue-600">
            {jobs.filter(job => getJobStatus(job) === 'IN PROGRESS').length}
          </div>
          <p className="text-sm text-gray-500 mt-2">Currently working on</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <h2 className="font-semibold text-lg mb-2">Completed</h2>
          <div className="text-3xl font-bold text-green-600">
            {jobs.filter(job => getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED').length}
          </div>
          <p className="text-sm text-gray-500 mt-2">Finished jobs</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <h2 className="font-semibold text-lg mb-2">Material Requests</h2>
          <div className="text-3xl font-bold text-purple-600">{materialRequests.length}</div>
          <p className="text-sm text-gray-500 mt-2">Requests submitted</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Work Columns */}
        <div className="space-y-8">
          {/* Active Work Section (If any) */}
          {jobs.filter(j => getJobStatus(j) === 'IN PROGRESS').length > 0 && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-2xl font-black text-blue-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                Active Work
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full animate-pulse">LIVE</span>
              </h2>
              <div className="space-y-4">
                {jobs.filter(j => getJobStatus(j) === 'IN PROGRESS').map(job => (
                  <div key={`active-${job.id || job._id}`} className="bg-white border-l-4 border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => handleViewJob(job)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{job.location}</span>
                      {job.fixDeadline && (
                        <span className="text-[10px] font-medium text-gray-400">Due: {new Date(job.fixDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{job.title}</h3>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewJob(job); }}
                        className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow hover:bg-blue-700 transition"
                      >
                        View Actions
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                          setShowAfterForm(prev => ({ ...prev, [job.id || job._id]: true }));
                        }}
                        className="w-full py-2 bg-green-600 text-white text-sm font-bold rounded-xl shadow hover:bg-green-700 transition flex justify-center items-center gap-2"
                      >
                        <span>✓</span> Complete Task & Notify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Queue (Assigned Issues) */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
                My Queue
              </h2>
              <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                {jobs.filter(j => getJobStatus(j) !== 'IN PROGRESS' && getJobStatus(j) !== 'COMPLETE' && getJobStatus(j) !== 'COMPLETED').length} TASKS
              </span>
            </div>

            {jobs.filter(j => getJobStatus(j) !== 'IN PROGRESS' && getJobStatus(j) !== 'COMPLETE' && getJobStatus(j) !== 'COMPLETED').length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No pending tasks in your queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.filter(j => getJobStatus(j) !== 'IN PROGRESS' && getJobStatus(j) !== 'COMPLETE' && getJobStatus(j) !== 'COMPLETED').map(job => (
                  <div key={job.id || job._id} className="group bg-white border border-gray-100 rounded-2xl p-4 hover:border-purple-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => handleViewJob(job)}>
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${job.priority === 'HIGH' ? 'bg-red-500' : 'bg-amber-400'}`}></span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{job.location}</span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{job.title}</h3>
                      </div>
                      <div className="shrink-0">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${getJobStatus(job) === 'OVERDUE' ? 'bg-rose-100 text-rose-700' :
                          getJobStatus(job) === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {getJobStatus(job)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                    {getImageUrl(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600">Before (Client Photo)</h4>
                        <img
                          src={getImageUrl(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image)}
                          alt="Before"
                          className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                          onClick={() => handleImageClick(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image, selectedJob.title)}
                          title="Click to view larger image"
                        />
                      </div>
                    )}
                    {getImageUrl(selectedJob.evidence?.afterImage) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600">After</h4>
                        <img
                          src={getImageUrl(selectedJob.evidence.afterImage)}
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

                <div className="flex flex-col gap-4 pt-6 border-t mt-6">
                  {/* CONTEXTUAL ACTION BUTTONS INSIDE MODAL */}
                  {['PENDING', 'ASSIGNED', 'OVERDUE'].includes(getJobStatus(selectedJob).toUpperCase()) && !showBeforeForm[selectedJob.id || selectedJob._id] && (
                    <button
                      onClick={() => handleStartWork(selectedJob.id || selectedJob._id)}
                      className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-md flex items-center justify-center gap-2"
                    >
                      Notify Start Work
                    </button>
                  )}

                  {['IN_PROGRESS', 'IN PROGRESS'].includes(getJobStatus(selectedJob).toUpperCase()) && !showAfterForm[selectedJob.id || selectedJob._id] && (
                    <button
                      onClick={() => toggleAfterForm(selectedJob.id || selectedJob._id)}
                      className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-md flex items-center justify-center gap-2"
                    >
                      Complete Task & Submit After evidence
                    </button>
                  )}

                  {/* FORM RENDERING INSIDE MODAL */}
                  {showBeforeForm[selectedJob.id || selectedJob._id] && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <BeforeEvidenceForm
                        issueId={selectedJob.id || selectedJob._id}
                        onSuccess={() => {
                          handleBeforeSuccess(selectedJob.id || selectedJob._id);
                          setSelectedJob(null);
                        }}
                        hasExistingImage={!!(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image)}
                      />
                      <button onClick={() => handleStartWork(selectedJob.id || selectedJob._id)} className="w-full mt-2 text-sm text-gray-500 hover:underline">Cancel</button>
                    </div>
                  )}

                  {showAfterForm[selectedJob.id || selectedJob._id] && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <AfterEvidenceForm
                        issueId={selectedJob.id || selectedJob._id}
                        onSuccess={() => {
                          handleAfterSuccess(selectedJob.id || selectedJob._id);
                          setSelectedJob(null);
                        }}
                      />
                      <button onClick={() => toggleAfterForm(selectedJob.id || selectedJob._id)} className="w-full mt-2 text-sm text-gray-500 hover:underline">Cancel</button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedJob(null)}
                    className="w-full py-2 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition"
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