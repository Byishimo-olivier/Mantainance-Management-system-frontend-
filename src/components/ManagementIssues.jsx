import React, { useEffect, useState } from "react";
import Select from 'react-select';
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
    // Find the selected technician object
    const tech = technicians.find(t => t.name === techName);
    if (!tech) {
      alert('Technician not found');
      setAssigning(null);
      return;
    }
    try {
      // Use the dedicated assign endpoint
      const res = await axios.post(`http://localhost:5000/api/issues/${issue.id}/assign`, { techId: tech._id || tech.id });
      // Update UI with the new issue data from backend
      setIssues(prev => prev.map((iss, i) => i === idx ? res.data : iss));
    } catch (err) {
      alert('Failed to assign technician');
    }
    setAssigning(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {issues.map((issue, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-6 flex flex-col gap-3 border border-gray-100 relative"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ background: issue.overdue ? '#ef4444' : issue.status === 'COMPLETE' ? '#22c55e' : issue.status === 'IN PROGRESS' ? '#2563eb' : '#6366f1' }}
                title={issue.overdue ? 'Overdue' : issue.status === 'COMPLETE' ? 'Completed' : issue.status === 'IN PROGRESS' ? 'In Progress' : 'Active'}
              ></span>
              <span className="text-lg font-semibold text-gray-900 flex-1">{issue.title}</span>
              {issue.status && (
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                  issue.status === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  issue.status === 'PENDING' ? 'bg-gray-100 text-gray-600' :
                  (issue.status === 'COMPLETE' || issue.status === 'COMPLETED') ? 'bg-green-100 text-green-700' :
                  issue.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {(issue.status === 'COMPLETE' || issue.status === 'COMPLETED') ? 'Complete' : issue.status.replace('_', ' ')}
                </span>
              )}
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
              {issue.tags.filter(tag => tag !== 'PENDING' && tag !== 'IN PROGRESS' && tag !== 'COMPLETE' && tag !== 'OVERDUE').map((tag, i) => (
                <span key={i} className={`px-2 py-0.5 rounded text-xs font-medium ${tagColors[tag] || 'bg-gray-100 text-gray-600'}`}>{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-400">Reported:</span>
              <span className="text-xs text-gray-600 font-semibold">
                {issue.clientName || issue.userName || (issue.client && issue.client.name) || 'Unknown'}
              </span>
              <span className="text-xs text-gray-400">at</span>
              <span className="text-xs text-gray-600">{issue.time}</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-400">Assigned to:</span>
              {issue.assignedTo ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-medium mr-1">
                  {/* Find the technician's name from the technicians list */}
                  {(() => {
                    const tech = technicians.find(t => (t._id || t.id) === issue.assignedTo);
                    return tech ? tech.name : 'Unknown';
                  })()}
                </span>
              ) : (
                <span className="text-xs text-gray-400 italic">Unassigned</span>
              )}
              <button
                className="ml-auto px-3 py-1 rounded bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                onClick={() => handleAssignClick(idx)}
              >
                Assign
              </button>
            </div>
            {assigning === idx && (
              <div className="mt-3 flex flex-col gap-2 max-w-xs">
                <Select
                  options={technicians.map(tech => ({ value: tech._id || tech.id, label: tech.name }))}
                  onChange={option => option && handleAssignTech(idx, option.label)}
                  placeholder="Select technician..."
                  isSearchable
                  autoFocus
                />
                <button className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-medium mt-2" onClick={() => setAssigning(null)}>Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
  );
}
export default ManagementIssues;
