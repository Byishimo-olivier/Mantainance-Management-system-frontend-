import React from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const statusCards = [
  {
    label: "Pending",
    colorClass: "text-yellow-700",
    bgClass: "bg-yellow-100 border-yellow-100",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="8" fill="#fde68a"/><path d="M12 8v4l3 3" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#fde68a" strokeWidth="2"/></svg>
    ),
  },
  {
    label: "In Progress",
    colorClass: "text-blue-700",
    bgClass: "bg-blue-100 border-blue-100",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="8" fill="#dbeafe"/><path d="M12 8v4l3 3" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#dbeafe" strokeWidth="2"/></svg>
    ),
  },
  {
    label: "Completed",
    colorClass: "text-green-700",
    bgClass: "bg-green-100 border-green-100",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="8" fill="#d1fae5"/><path d="M9 12l2 2 4-4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#d1fae5" strokeWidth="2"/></svg>
    ),
  },
  {
    label: "Overdue",
    colorClass: "text-red-700",
    bgClass: "bg-red-100 border-red-100",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="8" fill="#fee2e2"/><path d="M15 9l-6 6M9 9l6 6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#fee2e2" strokeWidth="2"/></svg>
    ),
  },
];

// Removed duplicate ClientDashboard declaration and moved state hooks into the function below.

export default function ClientDashboard() {
  const [recentIssue, setRecentIssue] = useState(null);
  const [statusCounts, setStatusCounts] = useState({ Pending: 0, "In Progress": 0, Completed: 0, Overdue: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(storedUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    async function fetchIssues() {
      try {
        const res = await axios.get(`http://localhost:5000/api/issues/user/${userObj.id}`);
        const issues = res.data || [];
        if (issues.length > 0) {
          // Sort by createdAt descending to get the most recent
          issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentIssue(issues[0]);
          // Count status using the 'status' field
          let pending = 0, inProgress = 0, completed = 0, overdue = 0;
          issues.forEach(issue => {
            const status = (issue.status || '').toUpperCase();
            if (status === 'PENDING') pending++;
            else if (status === 'IN PROGRESS') inProgress++;
            else if (status === 'COMPLETE' || status === 'COMPLETED') completed++;
            else if (status === 'OVERDUE') overdue++;
          });
          setStatusCounts({ Pending: pending, "In Progress": inProgress, Completed: completed, Overdue: overdue });
        } else {
          setRecentIssue(null);
          setStatusCounts({ Pending: 0, "In Progress": 0, Completed: 0, Overdue: 0 });
        }
      } catch (err) {
        setRecentIssue(null);
        setStatusCounts({ Pending: 0, "In Progress": 0, Completed: 0, Overdue: 0 });
      }
    }
    fetchIssues();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white shadow px-4 md:px-8 h-16">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-600 rounded-xl p-1 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1"/><rect x="6" y="6" width="12" height="6" rx="2" fill="#a5b4fc"/></svg>
          </span>
          <div className="flex flex-col ml-1">
            <span className="text-lg font-bold text-gray-900">PropCare</span>
            <span className="text-sm text-gray-500">Jean Mukaba</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#ede9fe"/><rect x="7" y="7" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="13" y="7" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="7" y="13" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="13" y="13" width="4" height="4" rx="1" fill="#8b5cf6"/></svg> Dashboard
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/issues')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1"/></svg> All Issues
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/new-issue')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#fef9c3"/><path d="M12 8v4l3 3" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> New Issue
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
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8">
          Welcome back, Jean Mukaba!
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {statusCards.map(card => (
            <div
              className={`rounded-2xl border-2 shadow flex flex-col gap-2 md:gap-3 p-4 md:p-6 ${card.bgClass}`}
              key={card.label}
            >
              <div className={`text-base md:text-lg font-semibold mb-1 md:mb-2 ${card.colorClass}`}>{card.label}</div>
              <div className="flex items-center justify-between">
                <span className={`text-xl md:text-3xl font-bold ${card.colorClass}`}>{statusCounts[card.label] || 0}</span>
                <span>{card.icon}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow p-0 mb-6 md:mb-8 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 pt-4 md:pt-6 pb-2 gap-2">
            <span className="text-lg md:text-xl font-semibold">Recent Issues</span>
            <a href="#" className="text-indigo-600 font-medium hover:underline" onClick={e => { e.preventDefault(); navigate('/issues'); }}>View All Issues →</a>
          </div>
          <div className="px-4 md:px-6 pb-4">
            {recentIssue ? (
              <div className="flex flex-col md:flex-row items-start justify-between border-t border-gray-100 py-4 md:py-5 gap-4 md:gap-6">
                <div className="flex-1">
                  <div className="text-base md:text-lg font-semibold mb-1">{recentIssue.title}</div>
                  <div className="text-gray-500 mb-2">{recentIssue.location}</div>
                  {(recentIssue.photo || recentIssue.image) ? (
                    <img
                      src={(() => {
                        const img = recentIssue.photo || recentIssue.image;
                        if (!img) return '/default-issue.png';
                        return img.startsWith('http')
                          ? img
                          : `http://localhost:5000/uploads/${img.replace(/^\/uploads\//, '')}`;
                      })()}
                      alt="Issue"
                      className="h-32 w-auto rounded mb-2"
                      onError={e => { e.target.src = '/default-issue.png'; }}
                    />
                  ) : null}
                  <div className="flex gap-2 mb-1 flex-wrap">
                    {Array.isArray(recentIssue.tags) && recentIssue.tags.filter(tag => tag !== 'PENDING' && tag !== 'IN PROGRESS' && tag !== 'COMPLETE' && tag !== 'OVERDUE').map((tag, i) => {
                      let label = tag.label || tag;
                      let colorClass = '';
                      if (label === 'URGENT') colorClass = 'bg-red-100 text-red-700';
                      else colorClass = 'bg-gray-100 text-gray-700';
                      return (
                        <span className={`rounded-md px-2 md:px-3 py-1 text-xs md:text-sm font-medium ${colorClass}`} key={i}>{label}</span>
                      );
                    })}
                    {recentIssue.status && (
                      <span className={`rounded-md px-2 md:px-3 py-1 text-xs md:text-sm font-semibold ${
                        recentIssue.status === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        recentIssue.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        recentIssue.status === 'COMPLETE' ? 'bg-green-100 text-green-700' :
                        recentIssue.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {recentIssue.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end min-w-[70px] md:min-w-[90px] gap-1">
                  <span className="flex items-center gap-1 text-yellow-700 text-xs md:text-base font-medium"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#fbbf24" strokeWidth="2"/></svg> {recentIssue.time}</span>
                  {recentIssue.overdue && <span className="text-red-600 text-xs md:text-sm font-semibold">overdue</span>}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 py-6 text-center">No recent issues found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


