import React, { useState, useEffect } from "react";
import ScheduleMaintenanceForm from './ScheduleMaintenanceForm';
import AssetDetail from './AssetDetail';
import AssetMovementForm from './AssetMovementForm';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AssetDetails from './AssetDetails';
import SparePartsList from './SparePartsList';
import AssetMapView from './AssetMapView';

const statusCards = [
  {
    label: "Preventive",
    colorClass: "text-indigo-300",
    bgClass: "bg-indigo-900 border-indigo-800",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="8" fill="#3730a3" />
        <path d="M8 12h8" stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Routine",
    colorClass: "text-teal-300",
    bgClass: "bg-teal-900 border-teal-800",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="8" fill="#0f766e" />
        <path d="M12 8v4l3 3" stroke="#99f6e4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Pending",
    colorClass: "text-yellow-300",
    bgClass: "bg-yellow-900 border-yellow-800",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="8" fill="#b45309" />
        <path d="M12 8v4l3 3" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="#fde68a" strokeWidth="2" />
      </svg>
    ),
  },
  {
    label: "In Progress",
    colorClass: "text-blue-300",
    bgClass: "bg-blue-900 border-blue-800",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="8" fill="#2563eb" />
        <path d="M12 8v4l3 3" stroke="#dbeafe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="#dbeafe" strokeWidth="2" />
      </svg>
    ),
  },
  {
    label: "Completed",
    colorClass: "text-green-300",
    bgClass: "bg-green-900 border-green-800",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="8" fill="#059669" />
        <path d="M9 12l2 2 4-4" stroke="#d1fae5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="#d1fae5" strokeWidth="2" />
      </svg>
    ),
  },
  {
    label: "Overdue",
    colorClass: "text-red-300",
    bgClass: "bg-red-900 border-red-800",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="8" fill="#dc2626" />
        <path d="M15 9l-6 6M9 9l6 6" stroke="#fee2e2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="#fee2e2" strokeWidth="2" />
      </svg>
    ),
  },
];

function ClientDashboard() {
  const backendBase = 'http://localhost:5000';
  const imageSrc = (path) => {
    if (!path) return null;
    try {
      if (String(path).startsWith('http') || String(path).startsWith('//')) return path;
      if (String(path).startsWith('/')) return `${backendBase}${path}`;
      return path;
    } catch (e) {
      return path;
    }
  };
  // State declarations
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [assets, setAssets] = useState([]);
  const [internalTechnicians, setInternalTechnicians] = useState([]);
  const [maintenanceTemplates, setMaintenanceTemplates] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyForm, setPropertyForm] = useState({ name: '', type: '', address: '', beds: '', baths: '', levels: '', area: '', floors: '', blocks: '', rooms: '' });
  const [propertyFiles, setPropertyFiles] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [assetForm, setAssetForm] = useState({ name: '', type: '', description: '', propertyId: '', quantity: 1, building: '', blocks: [] });
  const [originalAssetBlocks, setOriginalAssetBlocks] = useState([]);
  const [editingTech, setEditingTech] = useState(null);
  const [techForm, setTechForm] = useState({ name: '', email: '', phone: '', specialty: [], rating: 0, completed: 0, propertyId: '' });
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ name: '', type: '', frequency: '' });
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ name: '', status: '', nextDate: '', technicianId: '' });
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSchedulesInTemplates, setShowSchedulesInTemplates] = useState(false);
  const [issues, setIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    "In Progress": 0,
    Completed: 0,
    Overdue: 0,
  });
  const [maintenanceCounts, setMaintenanceCounts] = useState({
    Preventive: 0,
    Routine: 0,
    Pending: 0,
    "In Progress": 0,
    Completed: 0,
    Overdue: 0,
  });
  const [combinedCounts, setCombinedCounts] = useState({
    Pending: 0,
    "In Progress": 0,
    Completed: 0,
    Overdue: 0,
  });
  const [preventiveMatches, setPreventiveMatches] = useState([]);
  const [showPreventiveDetails, setShowPreventiveDetails] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [userName, setUserName] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showApprovedOnly, setShowApprovedOnly] = useState(false);
  const [loading, setLoading] = useState({
    properties: false,
    assets: false,
    internalTechnicians: false,
    maintenanceTemplates: false,
  });
  const [errors, setErrors] = useState({
    properties: '',
    assets: '',
    internalTechnicians: '',
    maintenanceTemplates: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }
    const userObj = JSON.parse(storedUser);
    setUserName(userObj.name || "");
    setCurrentUser(userObj);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    async function fetchIssues() {
      try {
        const res = await axios.get('http://localhost:5000/api/issues');
        setIssues(res.data || []);
        setAllIssues(res.data || []);
        const counts = { Pending: 0, "In Progress": 0, Completed: 0, Overdue: 0 };
        (res.data || []).forEach(issue => {
          const status = issue.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()).replace('Complete', 'Completed');
          if (counts[status] !== undefined) counts[status]++;
        });
        setStatusCounts(counts);
      } catch (err) {
        setIssues([]);
        setStatusCounts({
          Pending: 0,
          "In Progress": 0,
          Completed: 0,
          Overdue: 0,
        });
      }
    }

    async function fetchEntities() {
      setLoading(l => ({ ...l, properties: true, assets: true, internalTechnicians: true, maintenanceTemplates: true }));
      setErrors(e => ({ ...e, properties: '', assets: '', internalTechnicians: '', maintenanceTemplates: '' }));
      
      try {
        const propRes = await axios.get('http://localhost:5000/api/properties');
        setProperties(propRes.data || []);
      } catch (err) {
        setProperties([]);
        setErrors(e => ({ ...e, properties: err?.response?.data?.message || err.message || 'Failed to fetch properties' }));
      } finally {
        setLoading(l => ({ ...l, properties: false }));
      }
      
      try {
        const assetRes = await axios.get('http://localhost:5000/api/assets');
        setAssets(assetRes.data || []);
      } catch (err) {
        setAssets([]);
        setErrors(e => ({ ...e, assets: err?.response?.data?.message || err.message || 'Failed to fetch assets' }));
      } finally {
        setLoading(l => ({ ...l, assets: false }));
      }
      
      try {
        const techRes = await axios.get('http://localhost:5000/api/internal-technicians');
        setInternalTechnicians(techRes.data || []);
      } catch (err) {
        setInternalTechnicians([]);
        setErrors(e => ({ ...e, internalTechnicians: err?.response?.data?.message || err.message || 'Failed to fetch internal technicians' }));
      } finally {
        setLoading(l => ({ ...l, internalTechnicians: false }));
      }
      
      try {
        const tmplRes = await axios.get('http://localhost:5000/api/maintenance-templates');
        setMaintenanceTemplates(tmplRes.data || []);
      } catch (err) {
        setMaintenanceTemplates([]);
        setErrors(e => ({ ...e, maintenanceTemplates: err?.response?.data?.message || err.message || 'Failed to fetch maintenance templates' }));
      } finally {
        setLoading(l => ({ ...l, maintenanceTemplates: false }));
      }
      
      try {
        const schedRes = await axios.get('http://localhost:5000/api/maintenance-schedules');
        setMaintenanceSchedules(schedRes.data || []);
        
        // Compute upcoming reminders within next 24 hours
        const now = new Date();
        const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const upcoming = (schedRes.data || []).filter(s => 
          s && s.routine && s.nextDate && 
          new Date(s.nextDate) <= cutoff && 
          (!s.lastReminder || new Date(s.lastReminder) < new Date(s.nextDate))
        );
        setReminders(upcoming);
        
        // Compute maintenance counts for dashboard
        const counts = { Preventive: 0, Routine: 0, Pending: 0, 'In Progress': 0, Completed: 0, Overdue: 0 };
        const nowC = new Date();
        
        // Routine counts come from schedules
        (schedRes.data || []).forEach(s => {
          if (!s) return;
          if (s.routine) counts.Routine++;
          const next = s.nextDate ? new Date(s.nextDate) : null;
          
          if (next && next < nowC && !(s.status && s.status.toLowerCase().includes('complete'))) {
            counts.Overdue++;
            return;
          }
          
          const st = (s.status || '').toLowerCase();
          if (st.includes('complete')) counts.Completed++;
          else if (st.includes('in progress') || st.includes('in_progress')) counts['In Progress']++;
          else counts.Pending++;
        });

        // Preventive counts come from issues
        const matches = (schedRes.data || []).filter(issue => {
          if (!issue) return false;
          const title = (issue.title || '').toLowerCase();
          const rawTags = Array.isArray(issue.tags) ? issue.tags : [];
          const tags = rawTags.map(t => {
            if (!t) return '';
            if (typeof t === 'string') return String(t).toLowerCase();
            if (typeof t === 'object' && t.label) return String(t.label).toLowerCase();
            return String(t).toLowerCase();
          });
          const issueType = String(issue.issueType || issue.type || issue.category || '').toLowerCase();
          
          if (tags.includes('preventive')) return true;
          if (issueType === 'preventive') return true;
          if (title.includes('preventive')) return true;
          return false;
        });
        
        counts.Preventive = matches.length;
        setPreventiveMatches(matches.slice(0, 20));
        setMaintenanceCounts(counts);
        
        // Send email reminders for upcoming items
        (async function sendEmails() {
          for (const s of upcoming) {
            const id = s._id || s.id;
            if (!id) continue;
            try {
              await axios.post(`http://localhost:5000/api/maintenance-schedules/${id}/emailReminder`);
            } catch (e) {
              console.error('Failed to send email for schedule', id, e?.message || e);
            }
          }
          
          // Refresh schedules after emails
          try {
            const refreshed = await axios.get('http://localhost:5000/api/maintenance-schedules');
            setMaintenanceSchedules(refreshed.data || []);
            const now2 = new Date();
            const cutoff2 = new Date(now2.getTime() + 24 * 60 * 60 * 1000);
            const upcoming2 = (refreshed.data || []).filter(s => 
              s && s.routine && s.nextDate && 
              new Date(s.nextDate) <= cutoff2 && 
              (!s.lastReminder || new Date(s.lastReminder) < new Date(s.nextDate))
            );
            setReminders(upcoming2);
          } catch (e) {
            // ignore
          }
        })();
      } catch (err) {
        setMaintenanceSchedules([]);
      }
    }
    
    fetchIssues();
    fetchEntities();
  }, [navigate]);

  async function approveIssue(issueId) {
    try {
      await axios.put(`http://localhost:5000/api/issues/${issueId}`, {
        status: 'APPROVED'
      });
      // refresh issues
      const res = await axios.get('http://localhost:5000/api/issues');
      setIssues(res.data || []);
      setAllIssues(res.data || []);
    } catch (e) {
      console.error('Approve failed', e);
      alert('Failed to approve issue');
    }
  }

  async function declineIssue(issueId) {
    try {
      await axios.put(`http://localhost:5000/api/issues/${issueId}`, {
        status: 'REJECTED'
      });
      // refresh issues
      const res = await axios.get('http://localhost:5000/api/issues');
      setIssues(res.data || []);
      setAllIssues(res.data || []);
    } catch (e) {
      console.error('Decline failed', e);
      alert('Failed to decline issue');
    }
  }

  useEffect(() => {
    // Combine issue counts and maintenance counts for shared status cards
    setCombinedCounts({
      Pending: (statusCounts.Pending || 0) + (maintenanceCounts.Pending || 0),
      "In Progress": (statusCounts['In Progress'] || 0) + (maintenanceCounts['In Progress'] || 0),
      Completed: (statusCounts.Completed || 0) + (maintenanceCounts.Completed || 0),
      Overdue: (statusCounts.Overdue || 0) + (maintenanceCounts.Overdue || 0),
    });
  }, [statusCounts, maintenanceCounts]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  async function dismissAll() {
    try {
      const stored = localStorage.getItem('user');
      let userId = null;
      try { userId = stored ? JSON.parse(stored).id || JSON.parse(stored)._id : null; } catch (e) { userId = null; }
      
      for (const s of reminders) {
        const id = s._id || s.id;
        if (!id) continue;
        await axios.post(`http://localhost:5000/api/maintenance-schedules/${id}/dismiss`, { userId });
      }
      
      const schedRes = await axios.get('http://localhost:5000/api/maintenance-schedules');
      setMaintenanceSchedules(schedRes.data || []);
      setReminders([]);
    } catch (e) {
      console.error('Failed to dismiss reminders', e);
    }
  }

  async function snoozeAll(minutes = 60) {
    try {
      const stored = localStorage.getItem('user');
      let userId = null;
      try { userId = stored ? JSON.parse(stored).id || JSON.parse(stored)._id : null; } catch (e) { userId = null; }
      
      for (const s of reminders) {
        const id = s._id || s.id;
        if (!id) continue;
        await axios.post(`http://localhost:5000/api/maintenance-schedules/${id}/snooze`, { minutes, userId });
      }
      
      const schedRes = await axios.get('http://localhost:5000/api/maintenance-schedules');
      setMaintenanceSchedules(schedRes.data || []);
      setReminders([]);
    } catch (e) {
      console.error('Failed to snooze reminders', e);
    }
  }

  async function dismissOne(id) {
    try {
      const stored = localStorage.getItem('user');
      let userId = null;
      try { userId = stored ? JSON.parse(stored).id || JSON.parse(stored)._id : null; } catch (e) { userId = null; }
      
      await axios.post(`http://localhost:5000/api/maintenance-schedules/${id}/dismiss`, { userId });
      setReminders(r => r.filter(x => (x._id || x.id) !== id));
      axios.get('http://localhost:5000/api/maintenance-schedules').then(res => setMaintenanceSchedules(res.data || [])).catch(() => {});
    } catch (e) {
      console.error('Failed to dismiss reminder', e);
    }
  }

  async function snoozeOne(id, minutes = 60) {
    try {
      const stored = localStorage.getItem('user');
      let userId = null;
      try { userId = stored ? JSON.parse(stored).id || JSON.parse(stored)._id : null; } catch (e) { userId = null; }
      
      await axios.post(`http://localhost:5000/api/maintenance-schedules/${id}/snooze`, { minutes, userId });
      setReminders(r => r.filter(x => (x._id || x.id) !== id));
      axios.get('http://localhost:5000/api/maintenance-schedules').then(res => setMaintenanceSchedules(res.data || [])).catch(() => {});
    } catch (e) {
      console.error('Failed to snooze reminder', e);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Dark Blue Theme */}
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
            onClick={() => setActiveTab('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="#60a5fa" />
              <rect x="7" y="7" width="4" height="4" rx="1" fill="#ffffff" />
              <rect x="13" y="7" width="4" height="4" rx="1" fill="#ffffff" />
              <rect x="7" y="13" width="4" height="4" rx="1" fill="#ffffff" />
              <rect x="13" y="13" width="4" height="4" rx="1" fill="#ffffff" />
            </svg>
            Dashboard
          </button>
          
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-800 text-white font-semibold transition"
            onClick={() => navigate("/issues")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="#93c5fd" />
              <rect x="7" y="7" width="10" height="10" rx="2" fill="#ffffff" />
            </svg>
            All Issues
          </button>
          
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-800 text-white font-semibold transition"
            onClick={() => navigate("/new-issue")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" fill="#fbbf24" />
              <path d="M12 8v4l3 3" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            New Issue
          </button>
          
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-700 text-white font-semibold border border-green-500 transition"
            onClick={() => navigate("/feedback")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M2 12a10 10 0 1 0 20 0A10 10 0 0 0 2 12Zm6-1 2 2 4-4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Feedback
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Reminders Panel */}
      {reminders.length > 0 && (
        <div className="fixed top-20 right-4 z-50 max-w-md">
          <div className="bg-blue-800 border-l-4 border-blue-500 text-white p-4 shadow-lg rounded-r-lg">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold text-lg">⏰ Upcoming Maintenance</p>
              <button
                onClick={() => setReminders([])}
                className="text-blue-200 hover:text-white"
              >
                ×
              </button>
            </div>
            <p className="text-sm mb-3 text-blue-100">You have {reminders.length} routine maintenance items due within 24 hours.</p>
            
            <div className="space-y-2 max-h-56 overflow-auto">
              {reminders.map((r) => {
                const id = r._id || r.id;
                return (
                  <div key={id} className="bg-blue-900 p-3 rounded shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-medium">{r.name || r.title || 'Maintenance'}</p>
                      <p className="text-xs text-blue-300">
                        Due: {r.nextDate ? new Date(r.nextDate).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-blue-700 text-sm rounded hover:bg-blue-600 transition text-white"
                        onClick={() => dismissOne(id)}
                      >
                        Dismiss
                      </button>
                      <button
                        className="px-3 py-1 bg-yellow-600 text-sm rounded hover:bg-yellow-500 transition text-white"
                        onClick={() => snoozeOne(id, 60)}
                      >
                        Snooze 1h
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-3 flex gap-2 items-center">
              <button
                className="px-3 py-1 bg-blue-700 text-white text-sm rounded hover:bg-blue-600 transition"
                onClick={dismissAll}
              >
                Dismiss All
              </button>
              <button
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-500 transition"
                onClick={() => snoozeAll(60)}
              >
                Snooze All 1h
              </button>
              <button
                className="px-3 py-1 bg-white text-blue-800 text-sm rounded hover:bg-gray-100 transition ml-auto"
                onClick={() => setShowAdminPanel(!showAdminPanel)}
              >
                {showAdminPanel ? 'Close Alerts' : 'Alerts View'}
              </button>
            </div>
            
            {showAdminPanel && (
              <div className="mt-3 bg-blue-900 p-3 rounded max-h-64 overflow-auto">
                <p className="font-semibold mb-2 text-white">Alerts: Snoozed / Dismissed Schedules</p>
                {maintenanceSchedules.filter(s => s && (s.snoozedUntil || (s.dismissedBy && Object.keys(s.dismissedBy || {}).length > 0))).length === 0 ? (
                  <p className="text-sm text-blue-300">No snoozed or dismissed schedules</p>
                ) : (
                  maintenanceSchedules.filter(s => s && (s.snoozedUntil || (s.dismissedBy && Object.keys(s.dismissedBy || {}).length > 0))).map(s => {
                    const id = s._id || s.id;
                    return (
                      <div key={id} className="mb-2 p-2 bg-blue-800 rounded shadow-sm flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white">{s.name || s.title || 'Maintenance'}</p>
                          {s.snoozedUntil && (
                            <p className="text-xs text-blue-300">
                              Snoozed Until: {new Date(s.snoozedUntil).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            className="px-2 py-1 bg-blue-700 rounded text-sm hover:bg-blue-600 transition text-white"
                            onClick={() => {/* Add clear snooze function */}}
                          >
                            Clear Snooze
                          </button>
                          <button
                            className="px-2 py-1 bg-blue-700 rounded text-sm hover:bg-blue-600 transition text-white"
                            onClick={() => {/* Add clear dismissals function */}}
                          >
                            Clear Dismissals
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Banner - Dark Blue Gradient */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {userName}!
              </h1>
              <p className="text-lg opacity-90">
                Here's a quick overview of your recent activity.
              </p>
            </div>
            <div>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
                <circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.15" />
                <path d="M12 8v4l3 3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status Cards - Dark Blue Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statusCards.map((card) => (
            <div
              className={`rounded-xl border shadow-sm flex flex-col p-5 ${card.bgClass} transition hover:shadow-md hover:scale-105 transform duration-200`}
              key={card.label}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-lg font-semibold ${card.colorClass}`}>
                  {card.label}
                </span>
                {card.icon}
              </div>
              <span className={`text-3xl font-bold ${card.colorClass}`}>
                {combinedCounts[card.label] !== undefined
                  ? combinedCounts[card.label]
                  : maintenanceCounts[card.label] !== undefined
                  ? maintenanceCounts[card.label]
                  : statusCounts[card.label] || 0}
              </span>
              
              {card.label === 'Preventive' && (
                <div className="mt-3">
                  <button
                    className="text-sm underline hover:no-underline text-blue-300"
                    onClick={() => setShowPreventiveDetails(!showPreventiveDetails)}
                  >
                    {showPreventiveDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                  {showPreventiveDetails && (
                    <div className="mt-2 bg-blue-800 text-white p-2 rounded max-h-40 overflow-auto text-xs">
                      {preventiveMatches.length === 0 ? (
                        <div>No preventive issues found.</div>
                      ) : (
                        <ul className="space-y-1">
                          {preventiveMatches.map(it => (
                            <li key={it.id || it._id} className="truncate">
                              {it.title || 'Untitled'}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tabs Navigation - Dark Blue Theme */}
        <div className="bg-white rounded-xl shadow mb-6 border border-blue-100">
          <div className="flex overflow-x-auto border-b border-blue-100">
            {['dashboard', 'properties', 'assets', 'internalTechnicians', 'maintenanceTemplates'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow p-6 border border-blue-50">
          {activeTab === 'dashboard' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Recent Issues</h2>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={showApprovedOnly} 
                      onChange={e => setShowApprovedOnly(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Show approved only</span>
                  </label>
                  <button
                    onClick={() => navigate("/issues")}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    View All Issues
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {issues.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg">No recent issues found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {( (showApprovedOnly ? issues.filter(i => i && (i.approved || (i.status && String(i.status).toUpperCase() === 'APPROVED'))) : issues) ).slice(0, 5).map((issue) => (
                    <div
                      key={issue.id || issue._id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow border-blue-100"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{issue.location}</p>
                          
                          {issue.photo || issue.image ? (
                            <img
                              src={imageSrc(issue.photo || issue.image)}
                              alt="Issue"
                              className="h-40 w-auto rounded-lg mb-3 border"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-issue.png';
                              }}
                            />
                          ) : null}
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            {Array.isArray(issue.tags) &&
                              issue.tags
                                .filter(tag => !["PENDING", "IN PROGRESS", "COMPLETE", "OVERDUE"].includes(tag))
                                .map((tag, i) => {
                                  const label = tag.label || tag;
                                  const colorClass = label === "URGENT" 
                                    ? "bg-red-100 text-red-700 border border-red-200" 
                                    : "bg-blue-50 text-blue-700 border border-blue-100";
                                  return (
                                    <span
                                      className={`px-2 py-1 text-xs rounded ${colorClass}`}
                                      key={i}
                                    >
                                      {label}
                                    </span>
                                  );
                                })}
                            
                            {issue.status && (
                              <span
                                className={`px-2 py-1 text-xs rounded font-medium border ${
                                  issue.status === "IN PROGRESS"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : issue.status === "PENDING"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : issue.status === "COMPLETE"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : issue.status === "OVERDUE"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-gray-50 text-gray-700 border-gray-200"
                                }`}
                              >
                                {issue.status.replace("_", " ")}
                              </span>
                            )}
                          </div>

                          {/* Accept and Decline buttons for clients on PENDING issues */}
                          {issue.status === 'PENDING' && currentUser?.role === 'client' && (
                            <div className="mt-3 flex gap-2">
                              <button
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-600"
                                onClick={() => approveIssue(issue.id || issue._id)}
                              >
                                Accept
                              </button>
                              <button
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600"
                                onClick={() => declineIssue(issue.id || issue._id)}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <span className="flex items-center gap-1 text-yellow-600 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} />
                            </svg>
                            {issue.time}
                          </span>
                          {issue.overdue && (
                            <span className="text-red-600 text-sm font-medium mt-1">Overdue</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'properties' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Properties</h2>
              
              {loading.properties && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading properties...</p>
                </div>
              )}
              
              {errors.properties && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
                  Error: {errors.properties}
                </div>
              )}
              
              <form
                className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const payload = {
                      name: propertyForm.name,
                      type: propertyForm.type,
                      address: propertyForm.address,
                      beds: propertyForm.beds ? parseInt(propertyForm.beds) : undefined,
                      baths: propertyForm.baths ? parseInt(propertyForm.baths) : undefined,
                      levels: propertyForm.levels ? parseInt(propertyForm.levels) : undefined,
                      area: propertyForm.area ? parseInt(propertyForm.area) : undefined,
                      floors: propertyForm.floors ? parseInt(propertyForm.floors) : undefined,
                      blocks: propertyForm.blocks ? parseInt(propertyForm.blocks) : undefined,
                      rooms: propertyForm.rooms ? parseInt(propertyForm.rooms) : undefined,
                    };

                    if (editingProperty) {
                      await axios.put(
                        `http://localhost:5000/api/properties/${editingProperty._id || editingProperty.id}`,
                        payload
                      );

                      // upload files if any
                      if (propertyFiles && propertyFiles.length > 0) {
                        try {
                          const form = new FormData();
                          Array.from(propertyFiles).forEach(f => form.append('photos', f));
                          await axios.post(
                            `http://localhost:5000/api/properties/${editingProperty._id || editingProperty.id}/photos`,
                            form,
                            { headers: { 'Content-Type': 'multipart/form-data' } }
                          );
                        } catch (e) {
                          console.error('Failed to upload photos:', e);
                        }
                      }

                      setEditingProperty(null);
                    } else {
                      const createRes = await axios.post('http://localhost:5000/api/properties', payload);
                      const created = createRes.data;

                      // upload files if any
                      if (propertyFiles && propertyFiles.length > 0) {
                        try {
                          const form = new FormData();
                          Array.from(propertyFiles).forEach(f => form.append('photos', f));
                          await axios.post(
                            `http://localhost:5000/api/properties/${created.id || created._id}/photos`,
                            form,
                            { headers: { 'Content-Type': 'multipart/form-data' } }
                          );
                        } catch (e) {
                          console.error('Failed to upload photos:', e);
                        }
                      }
                    }

                    setPropertyForm({ name: '', type: '', address: '', beds: '', baths: '', levels: '', area: '', floors: '', blocks: '', rooms: '' });
                    setPropertyFiles(null);
                    const res = await axios.get('http://localhost:5000/api/properties');
                    setProperties(res.data || []);
                  } catch (err) {
                    console.error('Error saving property:', err);
                    alert('Failed to save property. Please try again.');
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Property Name"
                    value={propertyForm.name}
                    onChange={(e) => setPropertyForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type"
                    value={propertyForm.type}
                    onChange={(e) => setPropertyForm(f => ({ ...f, type: e.target.value }))}
                    required
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Address"
                    value={propertyForm.address}
                    onChange={(e) => setPropertyForm(f => ({ ...f, address: e.target.value }))}
                    required
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="number"
                    placeholder="Beds"
                    value={propertyForm.beds}
                    onChange={(e) => setPropertyForm(f => ({ ...f, beds: e.target.value }))}
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="number"
                    placeholder="Baths"
                    value={propertyForm.baths}
                    onChange={(e) => setPropertyForm(f => ({ ...f, baths: e.target.value }))}
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="number"
                    placeholder="Levels"
                    value={propertyForm.levels}
                    onChange={(e) => setPropertyForm(f => ({ ...f, levels: e.target.value }))}
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="number"
                    placeholder="Area"
                    value={propertyForm.area}
                    onChange={(e) => setPropertyForm(f => ({ ...f, area: e.target.value }))}
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="number"
                    placeholder="Floors"
                    value={propertyForm.floors}
                    onChange={(e) => setPropertyForm(f => ({ ...f, floors: e.target.value }))}
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="number"
                    placeholder="Blocks"
                    value={propertyForm.blocks}
                    onChange={(e) => setPropertyForm(f => ({ ...f, blocks: e.target.value }))}
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="number"
                    placeholder="Rooms"
                    value={propertyForm.rooms}
                    onChange={(e) => setPropertyForm(f => ({ ...f, rooms: e.target.value }))}
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-1 border-dashed border-2 border-blue-200 rounded p-3 text-center cursor-pointer"
                        onClick={() => document.getElementById('property-photos-input')?.click()}
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => { e.preventDefault(); const files = e.dataTransfer.files; setPropertyFiles(files); }}
                      >
                        {propertyFiles && propertyFiles.length > 0 ? (
                          <div className="flex gap-2 overflow-x-auto p-1">
                            {Array.from(propertyFiles).slice(0, 6).map((f, idx) => (
                              <img key={idx} src={URL.createObjectURL(f)} alt={f.name} className="h-20 w-28 object-cover rounded border" />
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Click or drag images here to upload (multiple)</div>
                        )}
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <input id="property-photos-input" type="file" multiple accept="image/*" className="hidden" onChange={(e) => setPropertyFiles(e.target.files)} />
                        {propertyFiles && propertyFiles.length > 0 ? (
                          <button type="button" className="text-sm text-red-600" onClick={() => setPropertyFiles(null)}>Clear</button>
                        ) : (
                          <button type="button" className="text-sm text-blue-600" onClick={() => document.getElementById('property-photos-input')?.click()}>Choose files</button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex-1 font-medium"
                      type="submit"
                    >
                      {editingProperty ? 'Update' : 'Add'}
                    </button>
                    {editingProperty && (
                      <button
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-medium"
                        type="button"
                          onClick={() => {
                          setEditingProperty(null);
                          setPropertyForm({ name: '', type: '', address: '', beds: '', baths: '', levels: '', area: '', floors: '', blocks: '', rooms: '' });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
              
              <div className="space-y-3">
                {properties.length === 0 && !loading.properties && !errors.properties && (
                  <div className="text-center py-8 text-gray-500">
                    No properties found. Add your first property above.
                  </div>
                )}
                
                {properties.map((property) => (
                  <div
                    key={property.id || property._id}
                    className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{property.name}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded mr-2 border border-blue-100">{property.type}</span>
                          <span className="text-gray-700">{property.address}</span>
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-3 text-center text-gray-600 text-sm">
                          <div>
                            <div className="text-gray-400 text-xs">Beds</div>
                            <div className="font-medium">{property.beds ?? '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Baths</div>
                            <div className="font-medium">{property.baths ?? '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Levels</div>
                            <div className="font-medium">{property.levels ?? property.floors ?? '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Area</div>
                            <div className="font-medium">{property.area ?? property.sqft ?? '-'}</div>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-3 text-center text-gray-600 text-sm">
                          <div>
                            <div className="text-gray-400 text-xs">Floors</div>
                            <div className="font-medium">{property.floors ?? '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Blocks</div>
                            <div className="font-medium">{property.blocks ?? '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Rooms</div>
                            <div className="font-medium">{property.rooms ?? '-'}</div>
                          </div>
                          <div className="flex items-center justify-center">
                            {/* <button
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                              onClick={() => navigate('/properties')}
                            >
                              View Details
                            </button> */}
                          </div>
                        </div>
                        {property.photos && property.photos.length > 0 && (
                          <div className="mt-3 flex gap-2 overflow-x-auto">
                            {property.photos.slice(0,4).map((p, idx) => (
                              <img key={idx} src={imageSrc(p)} alt={`${property.name}-photo-${idx}`} className="h-14 w-24 object-cover rounded border" onError={(e)=>{e.target.onerror=null;e.target.src='/default-property.png'}} />
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50 transition border border-blue-200"
                          onClick={() => {
                              setEditingProperty(property);
                              setPropertyForm({
                                name: property.name,
                                type: property.type,
                                address: property.address,
                                beds: property.beds ?? '',
                                baths: property.baths ?? '',
                                levels: property.levels ?? property.floors ?? '',
                                area: property.area ?? property.sqft ?? '',
                                floors: property.floors ?? '',
                                blocks: property.blocks ?? '',
                                rooms: property.rooms ?? '',
                              });
                              setPropertyFiles(null);
                            }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 transition border border-red-200"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this property?')) {
                              try {
                                await axios.delete(
                                  `http://localhost:5000/api/properties/${property._id || property.id}`
                                );
                                setProperties(properties.filter(p => (p._id || p.id) !== (property._id || property.id)));
                              } catch (err) {
                                console.error('Error deleting property:', err);
                                alert('Failed to delete property. Please try again.');
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Assets <span className="text-gray-500 text-lg">({assets.length})</span>
              </h2>
              
              {loading.assets && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading assets...</p>
                </div>
              )}
              
              {errors.assets && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
                  Error: {errors.assets}
                </div>
              )}
              
              <form
                className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const payload = { ...assetForm };
                    if (editingAsset) {
                      // compute removed blocks
                      const prev = Array.isArray(originalAssetBlocks) ? originalAssetBlocks.map(String) : [];
                      const now = Array.isArray(assetForm.blocks) ? assetForm.blocks.map(String) : [];
                      const remove = prev.filter(p => !now.includes(p));
                      if (remove.length > 0) payload.removeBlocks = remove;
                      await axios.put(`http://localhost:5000/api/assets/${editingAsset._id || editingAsset.id}`, payload);
                      setEditingAsset(null);
                      setOriginalAssetBlocks([]);
                    } else {
                      await axios.post('http://localhost:5000/api/assets', payload);
                    }
                    
                    setAssetForm({ name: '', type: '', description: '', propertyId: '', quantity: 1, building: '', blocks: [] });
                    const res = await axios.get('http://localhost:5000/api/assets');
                    setAssets(res.data || []);
                  } catch (err) {
                    console.error('Error saving asset:', err);
                    alert('Failed to save asset. Please try again.');
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Asset Name"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type"
                    value={assetForm.type}
                    onChange={(e) => setAssetForm(f => ({ ...f, type: e.target.value }))}
                    required
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description"
                    value={assetForm.description}
                    onChange={(e) => setAssetForm(f => ({ ...f, description: e.target.value }))}
                  />
                  <div className="flex items-center gap-2 border border-blue-200 rounded px-3 py-2">
                    <button type="button" className="px-2 py-1 bg-gray-100 rounded" onClick={() => setAssetForm(f => ({ ...f, quantity: Math.max(1, (f.quantity || 1) - 1) }))}>-</button>
                    <input
                      className="w-16 text-center outline-none"
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={assetForm.quantity}
                      onChange={(e) => setAssetForm(f => ({ ...f, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                      required
                    />
                    <button type="button" className="px-2 py-1 bg-gray-100 rounded" onClick={() => setAssetForm(f => ({ ...f, quantity: (f.quantity || 1) + 1 }))}>+</button>
                  </div>
                  
                  <select
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={assetForm.propertyId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      const prop = properties.find(p => (p.id || p._id) === pid);
                      setAssetForm(f => ({ ...f, propertyId: pid, building: prop?.name || '', blocks: [] }));
                    }}
                    required
                  >
                    <option value="">Select Property</option>
                    {properties.map(p => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                    {(() => {
                      const prop = properties.find(p => (p.id || p._id) === assetForm.propertyId);
                      const blocksCount = parseInt(prop?.blocks) || 0;
                      if (blocksCount > 0) {
                        // render checkboxes to select multiple blocks
                        return (
                          <div className="col-span-6">
                            <div className="text-sm text-gray-600 mb-1">Select Blocks (optional)</div>
                            <div className="grid grid-cols-6 gap-2">
                              {Array.from({ length: blocksCount }).map((_, idx) => {
                                const val = String(idx + 1);
                                const checked = (assetForm.blocks || []).includes(val);
                                return (
                                  <label key={val} className={`px-2 py-1 border rounded text-center ${checked ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
                                    <input type="checkbox" className="mr-1" checked={checked} onChange={() => {
                                      setAssetForm(f => {
                                        const cur = f.blocks || [];
                                        if (cur.includes(val)) return { ...f, blocks: cur.filter(x => x !== val) };
                                        return { ...f, blocks: [...cur, val] };
                                      });
                                    }} />
                                    {`Block ${val}`}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <input
                          className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Block (optional)"
                          value={(assetForm.blocks || []).join(', ')}
                          onChange={(e) => setAssetForm(f => ({ ...f, blocks: e.target.value.split(/[;,|]/).map(s => s.trim()).filter(Boolean) }))}
                        />
                      );
                    })()}
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex-1 font-medium"
                      type="submit"
                    >
                      {editingAsset ? 'Update' : 'Add'}
                    </button>
                    {editingAsset && (
                      <button
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-medium"
                        type="button"
                        onClick={() => {
                          setEditingAsset(null);
                          setAssetForm({ name: '', type: '', description: '', propertyId: '', quantity: 1, building: '', blocks: [] });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
              
              <div className="space-y-3">
                {assets.length === 0 && !loading.assets && !errors.assets && (
                  <div className="text-center py-8 text-gray-500">
                    No assets found. Add your first asset above.
                  </div>
                )}
                
                {assets.map((asset) => (
                  <div
                    key={asset.id || asset._id}
                    className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                          <div className="text-sm text-gray-600 mt-1 space-y-1">
                          <div>
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded mr-2 border border-blue-100">{asset.type}</span>
                            <span className="text-blue-600 font-medium">Qty: {asset.quantity || 1}</span>
                          </div>
                          {asset.description && (
                            <p className="mt-1 text-gray-700">{asset.description}</p>
                          )}
                          <p className="text-gray-600">
                            Property: {asset.property ? asset.property.name : 'N/A'}
                          </p>
                          {asset.building && (
                            <p className="text-gray-600">Building: {asset.building}</p>
                          )}
                          {asset.block && (
                            <p className="text-gray-600">Block: {asset.block}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50 transition border border-blue-200"
                          onClick={() => {
                            // normalize blocks for editing
                            let blocksArr = [];
                            if (asset.blocks && Array.isArray(asset.blocks)) blocksArr = asset.blocks.map(String);
                            else if (asset.block) {
                              if (Array.isArray(asset.block)) blocksArr = asset.block.map(String);
                              else blocksArr = String(asset.block).split(/[;,|]/).map(s => s.trim()).filter(Boolean);
                            } else if (asset.location) {
                              const loc = asset.location;
                              if (typeof loc === 'string') {
                                try { const parsed = JSON.parse(loc); if (parsed && parsed.block) blocksArr = Array.isArray(parsed.block) ? parsed.block.map(String) : String(parsed.block).split(/[;,|]/).map(s=>s.trim()).filter(Boolean); } catch(e) {}
                              } else if (typeof loc === 'object' && loc.block) {
                                blocksArr = Array.isArray(loc.block) ? loc.block.map(String) : String(loc.block).split(/[;,|]/).map(s=>s.trim()).filter(Boolean);
                              }
                            }
                            setEditingAsset(asset);
                            setOriginalAssetBlocks(blocksArr || []);
                            setAssetForm({
                              name: asset.name,
                              type: asset.type,
                              description: asset.description || '',
                              propertyId: asset.propertyId,
                              quantity: asset.quantity || 1,
                              building: asset.building || asset.property?.name || '',
                              blocks: blocksArr || [],
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 transition border border-red-200"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this asset?')) {
                              try {
                                await axios.delete(
                                  `http://localhost:5000/api/assets/${asset._id || asset.id}`
                                );
                                setAssets(assets.filter(a => (a._id || a.id) !== (asset._id || asset.id)));
                              } catch (err) {
                                console.error('Error deleting asset:', err);
                                alert('Failed to delete asset. Please try again.');
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'internalTechnicians' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Internal Technicians</h2>
              
              {loading.internalTechnicians && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading technicians...</p>
                </div>
              )}
              
              {errors.internalTechnicians && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
                  Error: {errors.internalTechnicians}
                </div>
              )}
              
              <form
                className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const data = {
                      ...techForm,
                      specialty: techForm.specialty.filter(s => s.trim()),
                    };
                    
                    if (editingTech) {
                      await axios.put(
                        `http://localhost:5000/api/internal-technicians/${editingTech._id || editingTech.id}`,
                        data
                      );
                      setEditingTech(null);
                    } else {
                      await axios.post('http://localhost:5000/api/internal-technicians', data);
                    }
                    
                    setTechForm({
                      name: '',
                      email: '',
                      phone: '',
                      specialty: [],
                      rating: 0,
                      completed: 0,
                      propertyId: '',
                    });
                    
                    const res = await axios.get('http://localhost:5000/api/internal-technicians');
                    setInternalTechnicians(res.data || []);
                  } catch (err) {
                    console.error('Error saving technician:', err);
                    alert('Failed to save technician. Please try again.');
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Name"
                    value={techForm.name}
                    onChange={(e) => setTechForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="email"
                    placeholder="Email"
                    value={techForm.email}
                    onChange={(e) => setTechForm(f => ({ ...f, email: e.target.value }))}
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Phone"
                    value={techForm.phone}
                    onChange={(e) => setTechForm(f => ({ ...f, phone: e.target.value }))}
                    required
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Specialty (comma separated)"
                    value={techForm.specialty.join(', ')}
                    onChange={(e) =>
                      setTechForm(f => ({
                        ...f,
                        specialty: e.target.value.split(',').map(s => s.trim()),
                      }))
                    }
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="Rating"
                    value={techForm.rating}
                    onChange={(e) =>
                      setTechForm(f => ({ ...f, rating: parseFloat(e.target.value) || 0 }))
                    }
                  />
                  <input
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="number"
                    min="0"
                    placeholder="Completed Jobs"
                    value={techForm.completed}
                    onChange={(e) =>
                      setTechForm(f => ({ ...f, completed: parseInt(e.target.value) || 0 }))
                    }
                  />
                  <select
                    className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2"
                    value={techForm.propertyId}
                    onChange={(e) => setTechForm(f => ({ ...f, propertyId: e.target.value }))}
                    required
                  >
                    <option value="">Select Property</option>
                    {properties.map(p => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-medium"
                    type="submit"
                  >
                    {editingTech ? 'Update' : 'Add Technician'}
                  </button>
                  {editingTech && (
                    <button
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition font-medium"
                      type="button"
                      onClick={() => {
                        setEditingTech(null);
                        setTechForm({
                          name: '',
                          email: '',
                          phone: '',
                          specialty: [],
                          rating: 0,
                          completed: 0,
                          propertyId: '',
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              
              <div className="space-y-3">
                {internalTechnicians.length === 0 &&
                  !loading.internalTechnicians &&
                  !errors.internalTechnicians && (
                    <div className="text-center py-8 text-gray-500">
                      No technicians found. Add your first technician above.
                    </div>
                  )}
                
                {internalTechnicians.map((tech) => (
                  <div
                    key={tech.id || tech._id}
                    className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                          <div className="flex items-center gap-4">
                            <span>📧 {tech.email || 'N/A'}</span>
                            <span>📞 {tech.phone}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>
                              <span className="text-yellow-600">⭐ {tech.rating || 0}</span> Rating
                            </span>
                            <span>✅ {tech.completed || 0} Jobs</span>
                          </div>
                          <div>
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded mr-2 border border-blue-100">
                              {Array.isArray(tech.specialty)
                                ? tech.specialty.join(', ')
                                : tech.specialty || 'N/A'}
                            </span>
                          </div>
                          <p className="text-gray-600">
                            Property: {tech.property ? tech.property.name : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50 transition border border-blue-200"
                          onClick={() => {
                            setEditingTech(tech);
                            setTechForm({
                              name: tech.name,
                              email: tech.email || '',
                              phone: tech.phone,
                              specialty: Array.isArray(tech.specialty) ? tech.specialty : [],
                              rating: tech.rating || 0,
                              completed: tech.completed || 0,
                              propertyId: tech.propertyId,
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 transition border border-red-200"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this technician?')) {
                              try {
                                await axios.delete(
                                  `http://localhost:5000/api/internal-technicians/${tech._id || tech.id}`
                                );
                                setInternalTechnicians(
                                  internalTechnicians.filter(t => (t._id || t.id) !== (tech._id || tech.id))
                                );
                              } catch (err) {
                                console.error('Error deleting technician:', err);
                                alert('Failed to delete technician. Please try again.');
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'maintenanceTemplates' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Maintenance</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div
                  className="bg-gradient-to-r from-blue-900 to-blue-800 border border-blue-700 rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow hover:scale-105 transform duration-200"
                  onClick={() => navigate('/new-issue')}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-700 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Preventive Maintenance</h3>
                  </div>
                  <p className="text-blue-200">
                    Report issues for preventive maintenance. We'll assign professional technicians, notify you when assigned, and provide feedback with evidence upon completion.
                  </p>
                </div>
                
                <div
                  className="bg-gradient-to-r from-teal-700 to-teal-600 border border-teal-600 rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow hover:scale-105 transform duration-200"
                  onClick={() => setShowScheduleForm(true)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-teal-600 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Routine Maintenance</h3>
                  </div>
                  <p className="text-teal-200">
                    Schedule routine maintenance tasks like cleaning or inspection on daily, weekly, or monthly intervals. Set recurring tasks to maintain your assets proactively.
                  </p>
                </div>
              </div>
              
              {showScheduleForm && (
                <div className="mb-8">
                  <ScheduleMaintenanceForm
                    technicians={internalTechnicians}
                    assets={assets}
                    initialData={editingSchedule}
                    onSuccess={async () => {
                      const res = await axios.get('http://localhost:5000/api/maintenance-schedules');
                      setMaintenanceSchedules(res.data || []);
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
              
              <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Scheduled Maintenance</h3>
                  <span className="text-gray-500">{maintenanceSchedules.length} schedules</span>
                </div>
                
                {loading.maintenanceTemplates && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading schedules...</p>
                  </div>
                )}
                
                {errors.maintenanceTemplates && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
                    Error: {errors.maintenanceTemplates}
                  </div>
                )}
                
                {maintenanceSchedules.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg">No maintenance schedules found.</p>
                    <p className="mt-2">Click "Routine Maintenance" above to create your first schedule.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {maintenanceSchedules.map((schedule) => (
                      <div
                        key={schedule.id || schedule._id}
                        className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{schedule.name || 'Unnamed Schedule'}</h4>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  schedule.routine
                                    ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {schedule.routine ? 'Routine' : 'Preventive'}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  schedule.status && schedule.status.toLowerCase().includes('complete')
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : schedule.nextDate && new Date(schedule.nextDate) < new Date()
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                }`}
                              >
                                {schedule.status || (schedule.routine ? 'Routine' : 'Preventive')}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                <span className="font-medium">Next:</span>{' '}
                                {schedule.nextDate
                                  ? new Date(schedule.nextDate).toLocaleString()
                                  : 'TBD'}
                              </div>
                              
                              {schedule.routine && (
                                <div>
                                  <span className="font-medium">Frequency:</span>{' '}
                                  {schedule.frequency || 'daily'}
                                  {schedule.interval && ` (every ${schedule.interval})`}
                                </div>
                              )}
                              
                              {schedule.description && (
                                <p className="mt-1 text-gray-700">{schedule.description}</p>
                              )}
                              
                              <div>
                                <span className="font-medium">Assigned Assets:</span>{' '}
                                {(() => {
                                  const assetIds = Array.isArray(schedule.assets)
                                    ? schedule.assets
                                    : typeof schedule.assets === 'string' && schedule.assets.length > 0
                                    ? schedule.assets.split(',')
                                    : [];
                                  
                                  if (assetIds.length === 0) return 'Unassigned';
                                  
                                  return assetIds
                                    .map(id => {
                                      const asset = assets.find(a => (a.id || a._id) === id);
                                      return asset ? asset.name : id;
                                    })
                                    .join(', ');
                                })()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50 transition border border-blue-200"
                              onClick={() => {
                                setEditingSchedule(schedule);
                                setShowScheduleForm(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 transition border border-red-200"
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this schedule?')) {
                                  try {
                                    await axios.delete(
                                      `http://localhost:5000/api/maintenance-schedules/${schedule._id || schedule.id}`
                                    );
                                    setMaintenanceSchedules(
                                      maintenanceSchedules.filter(s => (s._id || s.id) !== (schedule._id || schedule.id))
                                    );
                                  } catch (err) {
                                    console.error('Error deleting schedule:', err);
                                    alert('Failed to delete schedule. Please try again.');
                                  }
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;