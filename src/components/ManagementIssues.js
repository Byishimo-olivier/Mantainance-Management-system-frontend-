import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import axios from "axios";

const ManagementIssues = () => {

const tagColors = {
  URGENT: "bg-red-100 text-red-700",
  "IN PROGRESS": "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "bg-gray-100 text-gray-600",
  LOW: "bg-gray-100 text-gray-600",
};


  const [issues, setIssues] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [assigning, setAssigning] = useState(null); // index of issue being assigned

  // Fetch issues and technicians from backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIssues([]);
      setTechnicians([]);
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.get("http://localhost:5000/api/issues")
      .then(res => setIssues(res.data))
      .catch(() => setIssues([]));
    axios.get("http://localhost:5000/api/technicians")
      .then(res => setTechnicians(res.data))
      .catch(() => setTechnicians([]));
  }, []);

  const handleAssignClick = idx => {
    setAssigning(idx);
  };

  const handleAssignTech = async (idx, techName) => {
    const issue = issues[idx];
    if (issue.assignees.includes(techName)) {
      setAssigning(null);
      return;
    }
    try {
      const updated = { ...issue, assignees: [...issue.assignees, techName] };
      await axios.put(`http://localhost:5000/api/issues/${issue.id}`, updated);
      setIssues(prev => prev.map((iss, i) => i === idx ? updated : iss));
    } catch (err) {
      alert("Failed to assign technician");
    }
    setAssigning(null);
  };

  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  return (
    <section className="min-h-screen bg-gray-50 pb-8">

<nav className="flex items-center justify-between bg-white shadow px-4 md:px-8 h-16 mb-8">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-600 rounded-xl p-1 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1"/><rect x="6" y="6" width="12" height="6" rx="2" fill="#a5b4fc"/></svg>
          </span>
          <div className="flex flex-col ml-1">
            <span className="text-lg font-bold text-gray-900">PropCare</span>
            <span className="text-sm text-gray-500">Manager Issue Management</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/manager-dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#ede9fe"/><rect x="7" y="7" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="13" y="7" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="7" y="13" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="13" y="13" width="4" height="4" rx="1" fill="#8b5cf6"/></svg> Dashboard
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold" onClick={() => navigate('/manager-issues')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1"/></svg> All Issues
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/analytics')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#fef3c7"/><path d="M7 16L10 12L13 15L17 10L21 14" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Analytics
          </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={handleLogout}>
              Logout
            </button>
        </div>
      </nav>    


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {issues.map((issue, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-6 flex flex-col gap-3 border border-gray-100 relative"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ background: issue.overdue ? '#ef4444' : issue.tags.includes('COMPLETED') ? '#22c55e' : '#6366f1' }}
                title={issue.overdue ? 'Overdue' : issue.tags.includes('COMPLETED') ? 'Completed' : 'Active'}
              ></span>
              <span className="text-lg font-semibold text-gray-900 flex-1">{issue.title}</span>
              {issue.overdue && <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-medium">Overdue</span>}
              {issue.tags.includes('COMPLETED') && <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">Completed</span>}
            </div>
            <div className="text-gray-500 text-sm mb-1">{issue.location}</div>
            {(issue.photo || issue.image) && (
              <img
                src={`http://localhost:5000${issue.photo || issue.image}`}
                alt="Issue"
                className="w-full h-32 max-w-xs object-cover rounded mb-2 mx-auto"
                style={{ aspectRatio: '4/3' }}
              />
            )}
            <div className="text-gray-700 text-sm mb-2">{issue.description}</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {issue.tags.map((tag, i) => (
                <span key={i} className={`px-2 py-0.5 rounded text-xs font-medium ${tagColors[tag] || 'bg-gray-100 text-gray-600'}`}>{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-400">Reported:</span>
              <span className="text-xs text-gray-600">{issue.time}</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-400">Assignees:</span>
              {issue.assignees.length === 0 ? (
                <span className="text-xs text-gray-400 italic">Unassigned</span>
              ) : (
                issue.assignees.map((a, i) => (
                  <span key={i} className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-medium">{a}</span>
                ))
              )}
              <button
                className="ml-auto px-3 py-1 rounded bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                onClick={() => handleAssignClick(idx)}
              >
                Assign
              </button>
            </div>
            {assigning === idx && (
              <div className="mt-3 flex flex-wrap gap-2">
                {technicians.map((tech, i) => (
                  <button
                    key={i}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium hover:bg-indigo-100 hover:text-indigo-700 transition"
                    onClick={() => handleAssignTech(idx, tech.name)}
                  >
                    {tech.name}
                  </button>
                ))}
                <button className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-medium" onClick={() => setAssigning(null)}>Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
export default ManagementIssues;
