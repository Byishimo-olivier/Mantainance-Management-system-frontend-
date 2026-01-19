import Header from "./Header";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EvidenceUploadForm from "./EvidenceUploadForm";

const statusCards = [
  {
    label: "Pending",
    count: 1,
    colorClass: "text-yellow-700",
    bgClass: "bg-yellow-50 border-yellow-200",
    icon: (
      <span className="bg-yellow-100 rounded-lg p-2"><svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="#fde68a" strokeWidth="2"/><path d="M12 8v4l2 2" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
    ),
  },
  {
    label: "In Progress",
    count: 2,
    colorClass: "text-blue-700",
    bgClass: "bg-blue-50 border-blue-200",
    icon: (
      <span className="bg-blue-100 rounded-lg p-2"><svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="#dbeafe" strokeWidth="2"/><path d="M12 8v4l2 2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
    ),
  },
  {
    label: "Completed",
    count: 2,
    colorClass: "text-green-700",
    bgClass: "bg-green-50 border-green-200",
    icon: (
      <span className="bg-green-100 rounded-lg p-2"><svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="#d1fae5" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
    ),
  },
  {
    label: "Overdue",
    count: 4,
    colorClass: "text-red-700",
    bgClass: "bg-red-50 border-red-200",
    icon: (
      <span className="bg-red-100 rounded-lg p-2"><svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="#fee2e2" strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
    ),
  },
];

const tagColors = {
  URGENT: "bg-red-100 text-red-600",
  "IN PROGRESS": "bg-blue-100 text-blue-600",
  COMPLETED: "bg-green-100 text-green-600",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "bg-gray-100 text-gray-600",
  LOW: "bg-gray-100 text-gray-600",
  PENDING: "bg-gray-100 text-gray-600",
  HIGH: "bg-yellow-100 text-yellow-700",
};

function ManagerDashboard() {
  const navigate = useNavigate();
  const [showRecent, setShowRecent] = useState(true);
  const [issues, setIssues] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [showEvidenceForm, setShowEvidenceForm] = useState(null);

  const fetchIssues = () => {
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    axios.get("http://localhost:5000/api/issues", config)
      .then(res => setIssues(res.data))
      .catch(() => setIssues([]));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    fetchIssues();
    axios.get("http://localhost:5000/api/managers/dashboard/summary", config)
      .then(res => setSummary(res.data))
      .catch(() => setSummary({ pending: 0, inProgress: 0, completed: 0, overdue: 0 }));
  }, []);
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
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white shadow px-4 md:px-8 h-16">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-600 rounded-xl p-1 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1"/><rect x="6" y="6" width="12" height="6" rx="2" fill="#a5b4fc"/></svg>
          </span>
          <div className="flex flex-col ml-1">
            <span className="text-lg font-bold text-gray-900">PropCare</span>
            <span className="text-sm text-gray-500">Alice Kayitesi</span>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#ede9fe"/><rect x="7" y="7" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="13" y="7" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="7" y="13" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="13" y="13" width="4" height="4" rx="1" fill="#8b5cf6"/></svg> Dashboard
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/manager-issues')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1"/></svg> All Issues
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/analytics')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1"/></svg> Analytics
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/technicians')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1"/></svg> Technicians
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-gray-100 rounded-lg px-2 py-1 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#f3f4f6"/><path d="M8 12h8" stroke="#222" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gray-100 font-semibold" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      {/* Content */}
      <div className="max-w-6xl mx-auto px-2 md:px-4 pt-6 md:pt-8 w-full">
        <div
          title={"Welcome back, Alice Kayitesi!"}
          subtitle={<span className="bg-green-100 text-green-700 text-xs md:text-base rounded-full px-2 md:px-4 py-1 font-medium">Manager Overview</span>}
          right={<span className="text-gray-500 text-base md:text-lg">Performance summary and insights</span>}
          className="mb-4 md:mb-6"
        />
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start hover:shadow-lg transition-shadow">
            <span className="text-gray-500 mb-1">Total Issues</span>
            <span className="text-3xl font-bold">{totalIssues}</span>
            <span className="text-gray-400 text-sm">issues</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start hover:shadow-lg transition-shadow">
            <span className="text-gray-500 mb-1">Pending</span>
            <span className="text-3xl font-bold text-yellow-600">{summary.pending}</span>
            <span className="text-gray-400 text-sm">issues</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start hover:shadow-lg transition-shadow">
            <span className="text-gray-500 mb-1">In Progress</span>
            <span className="text-3xl font-bold text-blue-600">{inProgress}</span>
            <span className="text-gray-400 text-sm">issues</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start hover:shadow-lg transition-shadow">
            <span className="text-gray-500 mb-1">Completed</span>
            <span className="text-3xl font-bold text-green-600">{completed}</span>
            <span className="text-gray-400 text-sm">issues</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start hover:shadow-lg transition-shadow">
            <span className="text-gray-500 mb-1">Overdue</span>
            <span className="text-3xl font-bold text-red-600">{overdue}</span>
            <span className="text-gray-400 text-sm">issues</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start hover:shadow-lg transition-shadow">
            <span className="text-gray-500 mb-1">Completion Rate</span>
            <span className="text-3xl font-bold">{completionRate}%</span>
            <span className="text-gray-400 text-sm">{completed} / {totalIssues}</span>
          </div>
        </div>

    

        {/* Collapsible Recent Issues */}
        <div className="bg-white rounded-2xl shadow p-0 mb-6 md:mb-8 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 pt-4 md:pt-6 pb-2 gap-2">
            <span className="text-lg md:text-xl font-semibold flex items-center gap-2">
              Recent Issues
              <button
                className="ml-2 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs font-medium transition"
                onClick={() => setShowRecent(v => !v)}
              >
                {showRecent ? 'Hide' : 'Show'}
              </button>
            </span>
            <a href="#" className="text-indigo-600 font-medium hover:underline" onClick={e => { e.preventDefault(); navigate('/issues'); }}>View All Issues →</a>
          </div>
          {showRecent && (
            <div className="px-4 md:px-6 pb-4">
              {issues.map((issue, idx) => (
                <div className="flex flex-col md:flex-row items-start justify-between border-t border-gray-100 py-4 md:py-5 gap-4 md:gap-6 transition hover:bg-gray-50" key={idx}>
                  {/* Image section */}
                  {(issue.photo || issue.image) ? (
                    <div className="flex-shrink-0 w-full md:w-32 flex items-center justify-center">
                      <img
                        src={(() => {
                          const img = issue.photo || issue.image;
                          if (!img) return '/default-issue.png';
                          return img.startsWith('http')
                            ? img
                            : `http://localhost:5000/uploads/${img.replace(/^\/uploads\//, '')}`;
                        })()}
                        alt="Issue"
                        className="w-24 h-24 object-cover rounded-lg shadow border mx-auto mb-2"
                        style={{ aspectRatio: '1/1', maxWidth: '100px', maxHeight: '100px' }}
                        onError={e => { e.target.src = '/default-issue.png'; }}
                      />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <div className="text-base md:text-lg font-semibold mb-1">{issue.title}</div>
                    <div className="text-gray-500 mb-2">{issue.location}</div>
                    <div className="flex gap-2 mb-1 flex-wrap">
                      {issue.tags.map((tag, i) => (
                        <span className={`rounded-md px-2 md:px-3 py-1 text-xs md:text-sm font-medium ${tagColors[tag] || 'bg-gray-100 text-gray-700'}`} key={i}>{tag}</span>
                      ))}
                    </div>
                    {issue.status && (
                      <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${
                        issue.status === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        issue.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        (issue.status === 'COMPLETE' || issue.status === 'COMPLETED') ? 'bg-green-100 text-green-700' :
                        issue.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {(issue.status === 'COMPLETE' || issue.status === 'COMPLETED') ? 'Complete' : issue.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end min-w-[70px] md:min-w-[90px] gap-1">
                    {issue.time && (
                      <span className="flex items-center gap-1 text-yellow-700 text-xs md:text-base font-medium"><span role="img" aria-label="warning">⚠️</span> {issue.time}</span>
                    )}
                    {issue.overdue && <span className="text-red-600 text-xs md:text-sm font-semibold">overdue</span>}
                    
                    {/* Evidence Upload Button for Admins */}
                    {(issue.status === 'IN PROGRESS' || issue.status === 'COMPLETE' || issue.status === 'COMPLETED') && (
                      <button
                        onClick={() => setShowEvidenceForm(showEvidenceForm === issue._id ? null : issue._id)}
                        className="mt-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition"
                      >
                        {showEvidenceForm === issue._id ? 'Cancel' : 'Upload Evidence'}
                      </button>
                    )}
                  </div>
                  
                  {/* Evidence Upload Form - Show when button is clicked */}
                  {showEvidenceForm === issue._id && (
                    <div className="col-span-full mt-4">
                      <EvidenceUploadForm 
                        issueId={issue._id} 
                        onSuccess={() => {
                          setShowEvidenceForm(null);
                          // Refresh issues data
                          fetchIssues();
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
