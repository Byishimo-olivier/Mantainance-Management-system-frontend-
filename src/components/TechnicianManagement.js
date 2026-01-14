import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const initialTechnicians = [
  {
    name: "Patrick Niyonsenga",
    email: "patrick.n@propcare.rw",
    phone: "+250 788 123 456",
    specialization: ["Plumbing", "Water Systems", "HVAC"],
    rating: 4.5,
    completed: 48,
    status: "Active",
  },
  {
    name: "Eric Habimana",
    email: "eric.h@propcare.rw",
    phone: "+250 788 234 567",
    specialization: ["Electrical", "HVAC", "Power Systems"],
    rating: 4.8,
    completed: 62,
    status: "Active",
  },
  {
    name: "Jean Baptiste",
    email: "jean.b@propcare.rw",
    phone: "+250 788 345 678",
    specialization: ["Carpentry", "Door Repair", "Painting"],
    rating: 4.2,
    completed: 35,
    status: "Active",
  },
];

function TechnicianManagement() {
const navigate = useNavigate();
  const [technicians, setTechnicians] = useState(initialTechnicians);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: [],
  });
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  const allSpecs = [
    'Plumbing', 'Electrical', 'HVAC', 'Carpentry',
    'Painting', 'Water Systems', 'Power Systems', 'Door Repair'
  ];

  const handleFormChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({
        ...f,
        specialization: checked
          ? [...f.specialization, value]
          : f.specialization.filter(s => s !== value)
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSave = e => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setTechnicians(ts => [
        ...ts,
        {
          ...form,
          rating: 4.0,
          completed: 0,
          status: 'Active',
        },
      ]);
      setForm({ name: '', email: '', phone: '', specialization: [] });
      setShowForm(false);
      setSaving(false);
    }, 600);
  };

  const handleCancel = () => {
    setForm({ name: '', email: '', phone: '', specialization: [] });
    setShowForm(false);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Technician Management</h1>
          <div className="text-gray-500">Manage your maintenance team</div>
        </div>
        <button
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-xl shadow transition"
          onClick={() => setShowForm(true)}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#a5b4fc"/><path d="M12 8v8M8 12h8" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/></svg>
          Add New Technician
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow mb-8 p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold mb-2">Add New Technician</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input name="name" value={form.name} onChange={handleFormChange} required className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none" placeholder="Enter technician name" />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input name="email" value={form.email} onChange={handleFormChange} required className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none" placeholder="Enter email address" type="email" />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleFormChange} required className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none" placeholder="Enter phone number" />
          </div>
          <div>
            <label className="block font-medium mb-2">Select specializations (multiple)</label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {allSpecs.map(spec => (
                <label key={spec} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="specialization"
                    value={spec}
                    checked={form.specialization.includes(spec)}
                    onChange={handleFormChange}
                  />
                  <span>{spec}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-2xl shadow p-0 divide-y divide-gray-100">
        {technicians.map((tech, idx) => (
          <div key={tech.email} className="flex flex-col md:flex-row items-start md:items-center px-6 py-6 gap-4 md:gap-0">
            <div className="flex items-center gap-3 min-w-[220px]">
              <span className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xl">
                {tech.name.split(' ').map(n => n[0]).join('')}
              </span>
              <span className="font-semibold text-gray-900 text-lg leading-tight">
                {tech.name}
              </span>
            </div>
            <div className="flex flex-col flex-1 gap-2 md:gap-0 md:flex-row md:items-center md:justify-between w-full">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4z" fill="#f3f4f6"/><path d="M4 4l8 8 8-8" stroke="#6366f1" strokeWidth="2"/></svg>
                  <span className="break-all">{tech.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f3f4f6"/><path d="M6 8l6 8 6-8" stroke="#6366f1" strokeWidth="2"/></svg>
                  <span>{tech.phone}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tech.specialization.map(spec => (
                    <span key={spec} className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-row items-center gap-6 mt-2 md:mt-0">
                <div className="font-semibold text-yellow-600 text-lg flex items-center gap-1">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#facc15"/></svg>
                  {tech.rating}
                </div>
                <div className="font-semibold text-green-700 flex items-center gap-1">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#bbf7d0"/><path d="M8 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/></svg>
                  {tech.completed}
                </div>
                <span className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1 rounded-full font-medium text-sm">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#bbf7d0"/><path d="M8 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/></svg>
                  {tech.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  
)}

export default TechnicianManagement;
