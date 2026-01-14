import React from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  // Dummy technician info
  const technician = {
    name: "Eric Habimana",
    email: "eric.h@propcare.rw",
    completed: 62,
    rating: 4.8,
    assignedIssues: [
      {
        title: "Water leak in bathroom",
        location: "Block A - 301",
        status: "In Progress",
        due: "2d 4h",
      },
      {
        title: "Broken door lock",
        location: "Block B - 205",
        status: "Completed",
        due: "-",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <nav className="flex items-center justify-between bg-white shadow px-4 md:px-8 h-16 mb-8">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-600 rounded-xl p-1 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1"/><rect x="6" y="6" width="12" height="6" rx="2" fill="#a5b4fc"/></svg>
          </span>
          <div className="flex flex-col ml-1">
            <span className="text-lg font-bold text-gray-900">PropCare</span>
            <span className="text-sm text-gray-500">{technician.name}</span>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold" disabled>
            Dashboard
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/issues')}>
            All Issues
          </button>
        </div>
      </nav>
      <Header
        title="Technician Dashboard"
        subtitle={<span className="bg-blue-100 text-blue-700 text-xs md:text-base rounded-full px-2 md:px-4 py-1 font-medium">{technician.name}</span>}
        right={<span className="text-gray-500">Your assigned issues and performance</span>}
        className="mb-6"
      />
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <div className="text-lg font-semibold">{technician.name}</div>
            <div className="text-gray-500 text-sm">{technician.email}</div>
          </div>
          <div className="flex gap-4 items-center">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Completed: {technician.completed}</span>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">Rating: {technician.rating}</span>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Assigned Issues</div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm">
                <th className="pb-2">Title</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Due</th>
              </tr>
            </thead>
            <tbody>
              {technician.assignedIssues.map((issue, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="py-2 font-medium">{issue.title}</td>
                  <td className="py-2">{issue.location}</td>
                  <td className="py-2">{issue.status}</td>
                  <td className="py-2">{issue.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
