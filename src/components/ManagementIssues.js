import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

// Dummy issues and technicians (can be replaced with backend data)
export const initialIssues = [
  {
    title: "Leaking roof in penthouse",
    description: "Water is dripping from the ceiling during rain.",
    location: "Block D - Floor 6 - Unit 601",
    tags: ["URGENT", "PENDING"],
    assignees: ["Patrick Niyonsenga"],
    overdue: true,
    time: "2d 4h",
  },
  {
    title: "Elevator malfunction",
    description: "Elevator stops between floors intermittently.",
    location: "Block B - Lobby",
    tags: ["HIGH", "IN PROGRESS"],
    assignees: ["Eric Habimana", "Jean Baptiste"],
    overdue: false,
    time: "1d 7h",
  },
  {
    title: "Broken window latch",
    description: "Window latch in bedroom is broken, can't close properly.",
    location: "Block C - Floor 2 - Unit 210",
    tags: ["MEDIUM", "ASSIGNED"],
    assignees: ["Jean Baptiste"],
    overdue: false,
    time: "3h",
  },
  {
    title: "Internet outage",
    description: "No internet connectivity in the entire block.",
    location: "Block A - Floor 1 - Unit 101",
    tags: ["URGENT", "IN PROGRESS"],
    assignees: ["Patrick Niyonsenga"],
    overdue: true,
    time: "5d 2h",
  },
  {
    title: "Water leak in bathroom",
    description: "The bathroom sink is leaking continuously",
    location: "Block A - Floor 3 - Unit 301",
    tags: ["URGENT", "IN PROGRESS"],
    assignees: [],
    overdue: true,
    time: "4d 6h",
  },
  {
    title: "Broken door lock",
    description: "Main door lock is broken and needs urgent replacement",
    location: "Block B - Floor 2 - Unit 205",
    tags: ["MEDIUM", "PENDING"],
    assignees: [],
    overdue: false,
    time: "1d 2h",
  },
  {
    title: "Power outage in unit",
    description: "No power in the entire unit, possible circuit issue",
    location: "Block A - Floor 5 - Unit 502",
    tags: ["URGENT", "ASSIGNED"],
    assignees: [],
    overdue: true,
    time: "3d 23h",
  },
  {
    title: "Paint peeling in living room",
    description: "Paint is peeling off the living room wall",
    location: "Block C - Floor 1 - Unit 103",
    tags: ["LOW", "PENDING"],
    assignees: [],
    overdue: true,
    time: "4h",
  },
  {
    title: "HVAC not cooling",
    description: "AC is running but not cooling the room",
    location: "Block B - Floor 4 - Unit 408",
    tags: ["HIGH", "COMPLETED"],
    assignees: [],
    overdue: false,
    time: "-",
  },
];

const technicians = [
  { name: "Patrick Niyonsenga", email: "patrick.n@propcare.rw" },
  { name: "Eric Habimana", email: "eric.h@propcare.rw" },
  { name: "Jean Baptiste", email: "jean.b@propcare.rw" },
  { name: "Alice Kayitesi", email: "alice.k@propcare.rw" },
  { name: "Samuel Mugisha", email: "samuel.m@propcare.rw" },
  { name: "Grace Uwase", email: "grace.u@propcare.rw" },
];

const tagColors = {
  URGENT: "bg-red-100 text-red-700",
  "IN PROGRESS": "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "bg-gray-100 text-gray-600",
  LOW: "bg-gray-100 text-gray-600",
};

function ManagementIssues() {
  const [issues, setIssues] = React.useState(initialIssues);
  const [assigning, setAssigning] = React.useState(null); // index of issue being assigned

  const handleAssignClick = idx => {
    setAssigning(idx);
  };

  const handleAssignTech = (idx, techName) => {
    setIssues(prev => prev.map((issue, i) => {
      if (i !== idx) return issue;
      if (issue.assignees.includes(techName)) return issue;
      return { ...issue, assignees: [...issue.assignees, techName] };
    }));
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
