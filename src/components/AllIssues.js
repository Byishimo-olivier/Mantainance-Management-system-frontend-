import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialIssues = [
  {
    title: "Water leak in bathroom",
    description: "The bathroom sink is leaking continuously",
    location: "Block A - Floor 3 - Unit 301",
    tags: [
      { label: "URGENT", color: "#dc2626", bg: "#fee2e2" },
      { label: "IN PROGRESS", color: "#2563eb", bg: "#dbeafe" },
    ],
    assignee: "",
    overdue: true,
    time: "4d 6h",
  },
  {
    title: "Broken door lock",
    description: "Main door lock is broken and needs urgent replacement",
    location: "Block B - Floor 2 - Unit 205",
    tags: [
      { label: "MEDIUM", color: "#f59e42", bg: "#fef9c3" },
      { label: "PENDING", color: "#6366f1", bg: "#e0e7ff" },
    ],
    assignee: "",
    overdue: false,
    time: "1d 2h",
  },
  {
    title: "Power outage in unit",
    description: "No power in the entire unit, possible circuit issue",
    location: "Block A - Floor 5 - Unit 502",
    tags: [
      { label: "URGENT", color: "#dc2626", bg: "#fee2e2" },
      { label: "ASSIGNED", color: "#6b7280", bg: "#f3f4f6" },
    ],
    assignee: "",
    overdue: true,
    time: "3d 23h",
  },
  {
    title: "Paint peeling in living room",
    description: "Paint is peeling off the living room wall",
    location: "Block C - Floor 1 - Unit 103",
    tags: [
      { label: "LOW", color: "#6b7280", bg: "#f3f4f6" },
      { label: "PENDING", color: "#6366f1", bg: "#e0e7ff" },
    ],
    assignee: "",
    overdue: true,
    time: "4h",
  },
  {
    title: "HVAC not cooling",
    description: "AC is running but not cooling the room",
    location: "Block B - Floor 4 - Unit 408",
    tags: [
      { label: "HIGH", color: "#f59e42", bg: "#fef9c3" },
      { label: "COMPLETED", color: "#22c55e", bg: "#bbf7d0" },
    ],
    assignee: "",
    overdue: false,
    time: "-",
  },
];

const technicians = [
  { name: "Patrick Niyonsenga", email: "patrick.n@propcare.rw" },
  { name: "Eric Habimana", email: "eric.h@propcare.rw" },
  { name: "Jean Baptiste", email: "jean.b@propcare.rw" },
];

function AllIssues() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState(initialIssues);
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
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                <span className="flex items-center gap-1 text-gray-800 text-xs md:text-base">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" fill="#222"/></svg>
                  {issue.location}
                </span>
                {issue.tags.map((tag, i) => {
                  let colorClass = '';
                  if (tag.label === 'URGENT') colorClass = 'bg-red-100 text-red-700';
                  else if (tag.label === 'IN PROGRESS') colorClass = 'bg-blue-100 text-blue-700';
                  else if (tag.label === 'COMPLETED') colorClass = 'bg-green-100 text-green-700';
                  else colorClass = 'bg-gray-100 text-gray-700';
                  return (
                    <span className={`rounded-xl px-2 md:px-4 py-1 text-xs md:text-sm font-semibold ${colorClass}`} key={i}>{tag.label}</span>
                  );
                })}
                {/* Assignment UI for manager */}
                {issue.assignee ? (
                  <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs md:text-sm font-semibold">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#22c55e"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4v1H4v-1z" fill="#bbf7d0"/></svg>
                    {issue.assignee}
                  </span>
                ) : assigning === idx ? (
                  <span className="flex items-center gap-2">
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      onChange={e => handleAssignTech(idx, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Select technician</option>
                      {technicians.map(t => (
                        <option key={t.email} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                    <button className="text-xs px-2 py-1 bg-gray-200 rounded" onClick={() => setAssigning(null)}>Cancel</button>
                  </span>
                ) : (
                  <button className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 font-medium" onClick={() => handleAssignClick(idx)}>Assign Technician</button>
                )}
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

