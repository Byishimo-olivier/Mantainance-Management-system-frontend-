import React, { useEffect, useState } from "react";
import backgroundVideo from "../assets/136906-765457769_small.mp4";
import api from "../api/axios";
import { getImageUrl } from '../utils/imageUrl';
import { useNavigate } from 'react-router-dom';
import Header from "./Header";
import { useTranslation } from "../i18n/LanguageContext";

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
    <form className="glass-surface-strong rounded-2xl p-6 max-w-lg mx-auto" onSubmit={handleSubmit}>
      <h2 className="font-bold text-xl mb-4 text-blue-700 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-100/70 text-blue-700 rounded-full flex items-center justify-center text-sm">1</span>
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
          className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100/70 file:text-blue-700 hover:file:bg-blue-200/80 transition-colors"
        />
        {hasExistingImage && <p className="text-[10px] text-gray-400 mt-1 italic">An image already exists, so this is optional.</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">Starting Location/Notes *</label>
        <input
          type="text"
          className="w-full rounded-xl glass-input px-3 py-2 focus:ring-2 focus:ring-blue-300/60 focus:border-blue-400 outline-none"
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
          className="w-full rounded-xl glass-input px-3 py-2 focus:ring-2 focus:ring-blue-300/60 focus:border-blue-400 outline-none"
          value={fixTime}
          onChange={(e) => setFixTime(e.target.value)}
          placeholder="How many minutes will this take?"
          required
          min="1"
        />
      </div>
      <button
        type="submit"
        className="w-full glass-surface bg-blue-500/30 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500/50 transition-all shadow-xl border border-blue-400/30"
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
    <form className="glass-surface-strong rounded-2xl p-6 max-w-lg mx-auto" onSubmit={handleSubmit}>
      <h2 className="font-semibold text-lg mb-4 text-blue-800">Upload AFTER Evidence</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Upload AFTER image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
          className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100/70 file:text-blue-700 hover:file:bg-blue-200/80 transition-colors"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Completion Details</label>
        <textarea
          className="w-full rounded-xl glass-input px-3 py-2 focus:ring-2 focus:ring-blue-300/60 focus:border-blue-400 outline-none"
          rows="3"
          value={completionDetails}
          onChange={(e) => setCompletionDetails(e.target.value)}
          placeholder="Describe how you completed this work..."
          required
        />
      </div>
      <button
        type="submit"
        className="w-full glass-surface bg-emerald-500/30 text-white px-6 py-2 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-500/50 transition-all border border-emerald-400/30"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Submit AFTER Evidence"}
      </button>
    </form>
  );
}

const TechnicianDashboard = () => {
  const { t } = useTranslation();
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
    <div className="glass-theme-blue min-h-screen text-slate-900 overflow-hidden relative" style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="video-background-container">
        <video autoPlay loop muted playsInline className="video-background text-transparent">
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      </div>
      <div className="relative z-10 min-h-screen px-4 pb-16 pt-6 md:px-8 overflow-y-auto">
      {/* Reminders Panel */}
      {alerts.length > 0 && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full">
          <div className="glass-surface-strong text-white p-6 shadow-2xl rounded-2xl animate-in slide-in-from-right duration-300 border border-white/20">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏰</span>
                <p className="font-black text-xl text-white tracking-tight">Task Alerts</p>
              </div>
              <button
                onClick={() => setAlerts([])}
                className="text-slate-500 hover:text-slate-800 transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm mb-4 text-slate-600">You have {alerts.length} {alerts.length === 1 ? 'task' : 'tasks'} requiring attention.</p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 select-none custom-scrollbar">
              {alerts.map((a) => {
                const id = a._id || a.id;
                const remaining = getTimeRemaining(a.deadline);
                const isOverdue = remaining?.isOverdue;

                return (
                  <div key={`${a.type}-${id}`} className={`p-3 rounded-lg border shadow-sm transition-all ${isOverdue ? 'bg-red-50/70 border-red-200/70' : 'glass-ghost'
                    }`}>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${a.type === 'MAINTENANCE' ? 'bg-blue-100/70 text-blue-700' : 'bg-sky-100/70 text-sky-700'
                            }`}>
                            {a.type}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded font-bold uppercase animate-pulse">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-slate-900 leading-tight text-sm">{a.name}</p>
                      </div>
                      <div className={`text-right ${isOverdue ? 'text-red-600' : 'text-blue-700'}`}>
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
                            className="flex-1 px-3 py-1.5 glass-surface bg-blue-500/30 text-white text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-blue-500/50 transition-all border border-blue-400/20"
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
                          {t("technician.viewDetails")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/40 flex gap-2">
              <button
                className="flex-1 px-3 py-2 glass-ghost text-slate-700 text-xs font-bold rounded-lg hover:bg-white/80 transition-colors"
                onClick={dismissAll}
              >
                {t("technician.alerts.dismissAll")}
              </button>
              <button
                className="flex-1 px-3 py-2 bg-amber-200/40 text-amber-800 text-xs font-bold rounded-lg hover:bg-amber-200/60 transition-colors border border-amber-200/60"
                onClick={() => snoozeAll(60)}
              >
                {t("technician.alerts.snoozeAll")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        title={t("technician.title")}
        subtitle={t("technician.subtitle", { name: user.name || "" })}
        user={user}
        right={
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleMaterialRequestForm}
              className="px-6 py-2 glass-surface bg-blue-500/30 text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-500/50 transition-all border border-blue-400/20 shadow-lg"
            >
              {t("technician.requestMaterials")}
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2 glass-ghost text-slate-700 rounded-full font-semibold hover:bg-white/80 transition"
            >
              {t("technician.logout")}
            </button>
          </div>
        }
      />

      {/* Material Request Form Modal */}
      {showMaterialRequestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-surface-strong shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/40 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t("technician.modal.title")}</h2>
                <p className="text-sm text-slate-500">{t("technician.modal.subtitle")}</p>
              </div>
              <button
                  onClick={toggleMaterialRequestForm}
                  className="rounded-full p-2 text-slate-500 hover:bg-white/70 hover:text-slate-700"
                >
                  ✕
              </button>
            </div>
            <form onSubmit={handleMaterialRequestSubmit} className="px-6 py-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("technician.modal.materialTitle")} *</label>
                    <input
                      type="text"
                      name="title"
                      value={materialRequestData.title}
                      onChange={handleMaterialRequestChange}
                      className="w-full rounded-xl glass-input px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300/60 outline-none"
                      placeholder="e.g., Paint, Nails, Wood Panels"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("technician.modal.description")} *</label>
                    <textarea
                      name="description"
                      value={materialRequestData.description}
                      onChange={handleMaterialRequestChange}
                      className="w-full rounded-xl glass-input px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300/60 outline-none"
                      rows="3"
                      placeholder="Describe what you need and why..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">{t("technician.modal.quantity")} *</label>
                      <input
                        type="number"
                        name="quantity"
                        value={materialRequestData.quantity}
                        onChange={handleMaterialRequestChange}
                        className="w-full rounded-xl glass-input px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300/60 outline-none"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">{t("technician.modal.urgency")} *</label>
                      <select
                        name="urgency"
                        value={materialRequestData.urgency}
                        onChange={handleMaterialRequestChange}
                        className="w-full rounded-xl glass-input px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300/60 outline-none"
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
                    className="flex-1 rounded-full bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {t("technician.modal.submit")}
                  </button>
                  <button
                    type="button"
                    onClick={toggleMaterialRequestForm}
                    className="flex-1 rounded-full glass-ghost py-2 text-sm font-semibold text-slate-700 hover:bg-white/80"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-surface rounded-2xl shadow-lg p-6 border border-blue-100/60">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("technician.stats.assigned")}</div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {jobs.filter(job => getJobStatus(job) !== 'COMPLETE' && getJobStatus(job) !== 'COMPLETED').length}
          </div>
          <p className="text-sm text-slate-500 mt-2">Total jobs assigned to you</p>
        </div>

        <div className="glass-surface rounded-2xl shadow-lg p-6 border border-blue-200/60">
          <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">{t("technician.stats.inProgress")}</div>
          <div className="text-3xl font-black text-blue-600 mt-2">
            {jobs.filter(job => getJobStatus(job) === 'IN PROGRESS').length}
          </div>
          <p className="text-sm text-slate-500 mt-2">Currently working on</p>
        </div>

        <div className="glass-surface rounded-2xl shadow-lg p-6 border border-emerald-200/60">
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{t("technician.stats.completed")}</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {jobs.filter(job => getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED').length}
          </div>
          <p className="text-sm text-slate-500 mt-2">{t("technician.stats.finishedJobs")}</p>
        </div>

        <div className="glass-surface rounded-2xl shadow-lg p-6 border border-blue-200/60">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">{t("technician.stats.materials")}</div>
          <div className="text-3xl font-black text-blue-700 mt-2">{materialRequests.length}</div>
          <p className="text-sm text-slate-500 mt-2">{t("technician.stats.requestsSubmitted")}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Work Columns */}
        <div className="space-y-8">
          {/* Active Work Section (If any) */}
          {jobs.filter(j => getJobStatus(j) === 'IN PROGRESS').length > 0 && (
            <div className="glass-surface border border-blue-200/60 rounded-3xl p-6 shadow-lg">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                {t("technician.activeWork")}
                <span className="px-2 py-0.5 bg-blue-100/70 text-blue-700 text-[10px] font-bold rounded-full">LIVE</span>
              </h2>
              <div className="space-y-4">
                {jobs.filter(j => getJobStatus(j) === 'IN PROGRESS').map(job => (
                  <div key={`active-${job.id || job._id}`} className="glass-surface border border-white/50 rounded-2xl p-5 hover:shadow-md transition cursor-pointer" onClick={() => handleViewJob(job)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{job.location}</span>
                      {job.fixDeadline && (
                        <span className="text-[10px] font-medium text-slate-400">Due: {new Date(job.fixDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">{job.title}</h3>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewJob(job); }}
                        className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow hover:bg-blue-700 transition"
                      >
                        {t("technician.viewActions")}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                          setShowAfterForm(prev => ({ ...prev, [job.id || job._id]: true }));
                        }}
                        className="w-full py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow hover:bg-emerald-700 transition flex justify-center items-center gap-2"
                      >
                        <span>✓</span> {t("technician.completeTask")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Queue (Assigned Issues) */}
          <div className="glass-surface rounded-3xl shadow-lg border border-white/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                {t("technician.myQueue")}
              </h2>
              <span className="text-xs font-bold bg-blue-100/70 text-blue-700 px-3 py-1 rounded-full">
                {jobs.filter(j => getJobStatus(j) !== 'IN PROGRESS' && getJobStatus(j) !== 'COMPLETE' && getJobStatus(j) !== 'COMPLETED').length} TASKS
              </span>
            </div>

            {jobs.filter(j => getJobStatus(j) !== 'IN PROGRESS' && getJobStatus(j) !== 'COMPLETE' && getJobStatus(j) !== 'COMPLETED').length === 0 ? (
              <div className="text-center py-12 bg-white/40 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/60">
                <p className="text-slate-400 font-medium">{t("technician.noPending")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.filter(j => getJobStatus(j) !== 'IN PROGRESS' && getJobStatus(j) !== 'COMPLETE' && getJobStatus(j) !== 'COMPLETED').map(job => (
                  <div key={job.id || job._id} className="group glass-surface border border-white/50 rounded-2xl p-4 hover:border-blue-200/70 hover:shadow-lg transition-all cursor-pointer" onClick={() => handleViewJob(job)}>
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${job.priority === 'HIGH' ? 'bg-red-500' : 'bg-amber-400'}`}></span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.location}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{job.title}</h3>
                      </div>
                      <div className="shrink-0">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${getJobStatus(job) === 'OVERDUE' ? 'bg-rose-100 text-rose-700' :
                          getJobStatus(job) === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100/70 text-blue-700'
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
          <div className="glass-surface rounded-3xl shadow-lg border border-white/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">{t("technician.materialRequests")}</h2>
              <button
                onClick={toggleMaterialRequestForm}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700"
              >
                + {t("technician.newRequest")}
              </button>
            </div>

            {materialRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {t("technician.noMaterials")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-wide text-slate-500">
                    <tr className="border-b border-white/50">
                      <th className="px-3 py-3 w-10">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300" disabled />
                      </th>
                      <th className="px-3 py-3">Title</th>
                      <th className="px-3 py-3">Image</th>
                      <th className="px-3 py-3">Asset</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Work Order</th>
                      <th className="px-3 py-3">Submitted</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Submitted By</th>
                      <th className="px-3 py-3 text-right">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/50">
                    {materialRequests.slice(0, 5).map(req => {
                      const id = req.id || req._id;
                      const status = req.status || (req.approved ? 'APPROVED' : 'PENDING');
                      const priority = req.urgency || req.priority || 'NORMAL';
                      const imagePath = req.photo || req.image || req.beforePhoto || req.afterPhoto || req.file || req.files?.[0];
                      const imageUrl = imagePath ? getImageUrl(imagePath) : '';
                      const asset = req.assetName || req.asset?.name || req.asset || req.items?.[0]?.title || req.items?.[0]?.materialId || '—';
                      const workOrder = req.workOrderId || req.workOrder || req.issueId || req.workOrderNumber || '—';
                      const submittedAt = req.createdAt || req.submittedAt || req.date;
                      const submittedBy = req.submittedBy || req.requestorName || req.userName || req.name || req.email || '—';
                      const category = req.category || req.type || req.submissionType || '—';
                      const statusClass =
                        status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          status === 'REJECTED' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                            status === 'FULFILLED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              'bg-amber-100 text-amber-700 border-amber-200';
                      const priorityClass =
                        priority === 'URGENT' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                          priority === 'HIGH' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                              'bg-blue-100 text-blue-700 border-blue-200';

                      return (
                        <tr key={id} className="hover:bg-white/40 transition-colors align-middle">
                          <td className="px-3 py-3">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300" disabled />
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-slate-800 line-clamp-1" title={req.title || req.items?.[0]?.title || ''}>
                              {req.title || req.items?.[0]?.title || 'Untitled'}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt="Request"
                                className="h-9 w-12 rounded-lg object-cover border border-white/60"
                                onError={e => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="h-9 w-12 rounded-lg border border-white/60 bg-white/60 flex items-center justify-center text-xs text-slate-400">
                                —
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-slate-700">{asset}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-700">{workOrder}</td>
                          <td className="px-3 py-3 text-slate-600">
                            {submittedAt ? (
                              <div>
                                <div className="text-xs font-semibold text-slate-700">
                                  {new Date(submittedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            ) : '—'}
                          </td>
                          <td className="px-3 py-3 text-slate-700">{category}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-white/70 border border-white/60 text-[10px] font-bold text-slate-600 flex items-center justify-center">
                                {String(submittedBy || '—').trim().charAt(0).toUpperCase()}
                              </span>
                              <span className="text-slate-700 text-xs line-clamp-1" title={submittedBy}>{submittedBy}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${priorityClass}`}>
                              {priority}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {materialRequests.length > 5 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => {/* Implement view all */ }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all {materialRequests.length} requests
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Work History */}
          <div className="glass-surface rounded-3xl shadow-lg border border-white/50 p-6">
            <h2 className="text-2xl font-black text-slate-900 mb-4">{t("technician.recentWorkHistory")}</h2>
            <div className="space-y-3">
              {jobs
                .filter(job => getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED')
                .slice(0, 5)
                .map(job => (
                  <div key={job.id || job._id} className="flex items-center justify-between border-b border-white/50 pb-3 last:border-0">
                    <div>
                      <h4 className="font-semibold text-slate-800">{job.title}</h4>
                      <p className="text-sm text-slate-500">{job.location}</p>
                    </div>
                    <span className="text-sm text-emerald-600 font-semibold">Completed</span>
                  </div>
                ))}
              {jobs.filter(job => getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED').length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No completed jobs yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Issue Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="glass-surface-strong rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{t("technician.issue.title")}</h2>
                  <p className="text-sm text-slate-500">{t("technician.issue.subtitle")}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-full p-2 text-slate-500 hover:bg-white/70 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-700">{t("technician.issue.fieldTitle")}</h3>
                  <p className="text-slate-900">{selectedJob.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">{t("technician.issue.fieldDescription")}</h3>
                  <p className="text-slate-900">{selectedJob.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">{t("technician.issue.fieldLocation")}</h3>
                  <p className="text-slate-900">{selectedJob.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-700">{t("technician.issue.fieldStatus")}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getJobStatus(selectedJob) === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      getJobStatus(selectedJob) === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        (getJobStatus(selectedJob) === 'COMPLETE' || getJobStatus(selectedJob) === 'COMPLETED') ? 'bg-green-100 text-green-700' :
                          getJobStatus(selectedJob) === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100/70 text-blue-700'
                      }`}>
                      {(getJobStatus(selectedJob) === 'COMPLETE' || getJobStatus(selectedJob) === 'COMPLETED') ? 'Complete' : getJobStatus(selectedJob)?.replace('_', ' ') || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700">{t("technician.issue.fieldPriority")}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${selectedJob.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      selectedJob.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      selectedJob.priority === 'LOW' ? 'bg-blue-100/70 text-blue-700' :
                          'bg-blue-100 text-blue-700'
                      }`}>
                      {selectedJob.priority || 'MEDIUM'}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">Frequency</h3>
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100/70 text-blue-700">
                    {selectedJob.frequency || selectedJob.interval || selectedJob?.checklist?.frequency || 'Not set'}
                  </span>
                </div>

                {/* Evidence Display */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-slate-700 mb-2">{t("technician.issue.evidence")}</h3>
                  <div className="space-y-3">
                    {getImageUrl(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image) && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-600">{t("technician.issue.beforePhoto")}</h4>
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
                        <h4 className="text-sm font-medium text-slate-600">{t("technician.issue.afterPhoto")}</h4>
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
                        <h4 className="text-sm font-medium text-slate-600">{t("technician.issue.completionDetails")}</h4>
                        <p className="text-sm text-slate-900">{selectedJob.evidence.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-6 border-t mt-6">
                  {/* CONTEXTUAL ACTION BUTTONS INSIDE MODAL */}
                  {['PENDING', 'ASSIGNED', 'OVERDUE'].includes(getJobStatus(selectedJob).toUpperCase()) && !showBeforeForm[selectedJob.id || selectedJob._id] && (
                    <button
                      onClick={() => handleStartWork(selectedJob.id || selectedJob._id)}
                      className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2"
                    >
                      {t("technician.issue.notifyStart")}
                    </button>
                  )}

                  {['IN_PROGRESS', 'IN PROGRESS'].includes(getJobStatus(selectedJob).toUpperCase()) && !showAfterForm[selectedJob.id || selectedJob._id] && (
                    <button
                      onClick={() => toggleAfterForm(selectedJob.id || selectedJob._id)}
                      className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-md flex items-center justify-center gap-2"
                    >
                      {t("technician.issue.completeAfter")}
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
                      <button onClick={() => handleStartWork(selectedJob.id || selectedJob._id)} className="w-full mt-2 text-sm text-gray-500 hover:underline">{t("common.cancel")}</button>
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
                      <button onClick={() => toggleAfterForm(selectedJob.id || selectedJob._id)} className="w-full mt-2 text-sm text-gray-500 hover:underline">{t("common.cancel")}</button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedJob(null)}
                    className="w-full py-2 bg-white/60 text-slate-700 font-semibold rounded-xl hover:bg-white/80 transition border border-white/50"
                  >
                    {t("common.close")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;


















