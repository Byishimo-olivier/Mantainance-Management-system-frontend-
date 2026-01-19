import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Issues will be fetched from backend

const technicians = [
  { name: "Patrick Niyonsenga", email: "patrick.n@propcare.rw" },
  { name: "Eric Habimana", email: "eric.h@propcare.rw" },
  { name: "Jean Baptiste", email: "jean.b@propcare.rw" },
];

function AllIssues() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Get user and token from localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }
    // Set axios default Authorization header for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const userObj = JSON.parse(storedUser);
    setUser(userObj);
    async function fetchIssues() {
      try {
        let url = 'http://localhost:5000/api/issues';
        // For tech: assigned, for user: own, for admin: all
        if (userObj.role === 'TECH') {
          url = `http://localhost:5000/api/issues/assigned/${userObj.id}`;
        } else if (userObj.role === 'CLIENT') {
          url = `http://localhost:5000/api/issues/user/${userObj.id}`;
        }
        const res = await axios.get(url);
        setIssues(res.data);
      } catch (err) {
        setIssues([]);
      }
    }
    fetchIssues();
  }, [navigate]);
  const [assigning, setAssigning] = useState(null); // index of issue being assigned
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  const handleAssignClick = idx => {
    setAssigning(idx);
  };

  const handleAssignTech = (idx, techName) => {
    setIssues(prev => prev.map((issue, i) => i === idx ? { ...issue, assignee: techName } : issue));
    setAssigning(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
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
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold" onClick={() => navigate('/dashboard')}>
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
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-2 md:px-4 pt-6 md:pt-8 w-full">
        <h1 className="text-2xl md:text-4xl font-extrabold mb-2 md:mb-0">All Issues</h1>
        <div className="flex items-center gap-2 md:gap-3">
          <button className="bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-center hover:bg-gray-100">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M6 12h12M9 18h6" stroke="#222" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-base font-medium text-gray-700 outline-none">
            <option>All</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Overdue</option>
          </select>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-2 md:px-4 pt-4 md:pt-6 w-full">
        {issues.map((issue, idx) => (
          <div className="flex flex-col md:flex-row items-start justify-between border-2 border-red-200 bg-white rounded-2xl shadow p-4 md:p-8 mb-6 md:mb-8 transition hover:shadow-lg hover:border-red-400" key={idx}>
            <div className="flex-1">
              <div className="text-base md:text-xl font-bold mb-1">{issue.title}</div>
              <div className="text-gray-600 mb-2">{issue.description}</div>
              {(issue.photo || issue.image) && (
                <img src={`http://localhost:5000${issue.photo || issue.image}`} alt="Issue" className="h-32 w-auto rounded mb-2" />
              )}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                <span className="flex items-center gap-1 text-gray-800 text-xs md:text-base">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" fill="#222"/></svg>
                  {issue.location}
                </span>
                {Array.isArray(issue.tags) ? issue.tags.filter(tag => tag !== 'PENDING' && tag !== 'IN PROGRESS' && tag !== 'COMPLETE' && tag !== 'OVERDUE').map((tag, i) => {
                  let label = tag.label || tag;
                  let colorClass = '';
                  if (label === 'URGENT') colorClass = 'bg-red-100 text-red-700';
                  else colorClass = 'bg-gray-100 text-gray-700';
                  return (
                    <span className={`rounded-xl px-2 md:px-4 py-1 text-xs md:text-sm font-semibold ${colorClass}`} key={i}>{label}</span>
                  );
                }) : null}
                {issue.status && (
                  <span className={`rounded-xl px-2 md:px-4 py-1 text-xs md:text-sm font-semibold mt-1 ${
                    issue.status === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    issue.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    (issue.status === 'COMPLETE' || issue.status === 'COMPLETED') ? 'bg-green-100 text-green-700' :
                    issue.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {(issue.status === 'COMPLETE' || issue.status === 'COMPLETED') ? 'Complete' : issue.status.replace('_', ' ')}
                  </span>
                )}
                {/* Assignment UI for manager */}
                {/* ...existing code for assignment... */}
              </div>
            </div>
            <div className="flex flex-col items-end min-w-[70px] md:min-w-[110px] gap-1 md:gap-2 mt-2 md:mt-0">
              <span className="flex items-center gap-1 text-yellow-700 text-xs md:text-lg font-medium"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#fbbf24" strokeWidth="2"/></svg> {issue.time}</span>
              {issue.overdue && <span className="text-red-600 text-xs md:text-base font-semibold">overdue</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllIssues;

