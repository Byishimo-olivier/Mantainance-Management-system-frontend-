import React from "react";
import { useNavigate } from "react-router-dom";


// Dummy data for analytics
const analytics = {
  avgFixTime: 30.0,
  totalIssues: 6,
  completed: 2,
  overdue: 4,
  categories: [
    { label: "broken_door", percent: 17, color: "#8b5cf6" },
    { label: "water_leak", percent: 17, color: "#6366f1" },
    { label: "Plumbing", percent: 17, color: "#3b82f6" },
    { label: "HVAC", percent: 17, color: "#10b981" },
    { label: "paint_issue", percent: 17, color: "#f59e42" },
    { label: "power_outage", percent: 17, color: "#ec4899" },
  ],
  status: [
    { label: "in_progress", count: 1 },
    { label: "Completed", count: 2 },
    { label: "Assigned", count: 1 },
    { label: "Pending", count: 1 },
    { label: "Reopened", count: 1 },
  ],
  technician: {
    name: "Eric Habimana",
    completed: 2,
    rating: 4.5,
  },
};


export default function Analytics() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };

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
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold" onClick={() => navigate('/manager-dashboard')}>
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
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Maintenance Analytics</h1>
      <div className="text-gray-500 mb-6">Performance metrics and insights</div>
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-gray-500 mb-1">Average Fix Time</span>
          <span className="text-3xl font-bold">{analytics.avgFixTime}</span>
          <span className="text-gray-400 text-sm">hours</span>
          <span className="ml-auto mt-2 bg-blue-100 text-blue-600 rounded-full p-2">
            <svg width="24" height="24" fill="none"><circle cx="12" cy="12" r="10" fill="#dbeafe"/><path d="M12 6v6l4 2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-gray-500 mb-1">Total Issues</span>
          <span className="text-3xl font-bold">{analytics.totalIssues}</span>
          <span className="text-gray-400 text-sm">issues</span>
          <span className="ml-auto mt-2 bg-purple-100 text-purple-600 rounded-full p-2">
            <svg width="24" height="24" fill="none"><path d="M4 17V7a2 2 0 012-2h12a2 2 0 012 2v10" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/><path d="M8 13l4 4 4-4" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-gray-500 mb-1">Completion Rate</span>
          <span className="text-3xl font-bold">{Math.round((analytics.completed/analytics.totalIssues)*100)}%</span>
          <span className="text-gray-400 text-sm">{analytics.completed} / {analytics.totalIssues}</span>
          <span className="ml-auto mt-2 bg-green-100 text-green-600 rounded-full p-2">
            <svg width="24" height="24" fill="none"><circle cx="12" cy="12" r="10" fill="#bbf7d0"/><path d="M8 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-gray-500 mb-1">Overdue Issues</span>
          <span className="text-3xl font-bold text-red-600">{analytics.overdue}</span>
          <span className="text-gray-400 text-sm">issues</span>
          <span className="ml-auto mt-2 bg-red-100 text-red-600 rounded-full p-2">
            <svg width="24" height="24" fill="none"><circle cx="12" cy="12" r="10" fill="#fee2e2"/><path d="M12 8v4" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#ef4444"/></svg>
          </span>
        </div>
      </div>
      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold mb-4">Issues by Category</div>
          <div className="flex flex-col items-center">
            <svg width="220" height="220" viewBox="0 0 220 220">
              {(() => {
                let startAngle = 0;
                return analytics.categories.map((cat, i) => {
                  const angle = (cat.percent / 100) * 360;
                  const x1 = 110 + 100 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 110 + 100 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 110 + 100 * Math.cos((Math.PI * (startAngle + angle)) / 180);
                  const y2 = 110 + 100 * Math.sin((Math.PI * (startAngle + angle)) / 180);
                  const largeArc = angle > 180 ? 1 : 0;
                  const path = `M110,110 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`;
                  const el = (
                    <path key={cat.label} d={path} fill={cat.color} stroke="#fff" strokeWidth="2" />
                  );
                  startAngle += angle;
                  return el;
                });
              })()}
            </svg>
            <div className="flex flex-wrap justify-center mt-4 gap-2">
              {analytics.categories.map(cat => (
                <span key={cat.label} className="text-sm font-medium" style={{ color: cat.color }}>
                  {cat.label} {cat.percent}%
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold mb-4">Issues by Status</div>
          <div className="flex flex-col items-center">
            <svg width="220" height="140">
              {analytics.status.map((s, i) => (
                <rect
                  key={s.label}
                  x={20 + i * 36}
                  y={120 - s.count * 50}
                  width={28}
                  height={s.count * 50}
                  fill="#6366f1"
                  rx={6}
                />
              ))}
              {/* Axis */}
              <line x1="20" y1="120" x2="200" y2="120" stroke="#d1d5db" strokeWidth="2" />
              {/* Labels */}
              {analytics.status.map((s, i) => (
                <text
                  key={s.label}
                  x={34 + i * 36}
                  y={135}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#555"
                >
                  {s.label}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>
      {/* Technician Performance */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="font-semibold mb-4">Technician Performance</div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-sm">
              <th className="pb-2">Technician</th>
              <th className="pb-2">Completed</th>
              <th className="pb-2">Avg Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-100">
              <td className="py-2 font-medium">{analytics.technician.name}</td>
              <td className="py-2">{analytics.technician.completed}</td>
              <td className="py-2">
                <span className="font-semibold text-yellow-600">{analytics.technician.rating}</span>
                <span className="ml-1 text-yellow-400">{'★'.repeat(Math.floor(analytics.technician.rating))}</span>
                <span className="ml-1 text-gray-300">{'★'.repeat(5 - Math.floor(analytics.technician.rating))}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
