import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewIssue() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    building: "",
    floor: "",
    unit: "",
    photo: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigate("/issues");
    }, 1200);
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
            <span className="text-sm text-gray-500">Jean Mukaba</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#ede9fe"/><rect x="7" y="7" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="13" y="7" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="7" y="13" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="13" y="13" width="4" height="4" rx="1" fill="#8b5cf6"/></svg> Dashboard
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/issues')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1"/></svg> All Issues
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-semibold" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#eef2ff"/><path d="M12 8v4l3 3" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> New Issue
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-gray-100 rounded-lg px-2 py-1 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#f3f4f6"/><path d="M8 12h8" stroke="#222" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gray-100 font-semibold" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      {/* Form Card */}
      <div className="max-w-3xl mx-auto mt-6 md:mt-10 bg-white rounded-2xl shadow p-0 w-full">
        <form onSubmit={handleSubmit} className="flex flex-col divide-y divide-gray-200 w-full">
          <div className="px-4 md:px-10 pt-6 md:pt-10 pb-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Report New Issue</h2>
          </div>
          <div className="flex flex-col gap-6 px-4 md:px-10 py-6 md:py-8">
            <div>
              <label className="block font-semibold mb-1" htmlFor="title">Issue Title <span className="text-red-500">*</span></label>
              <input
                id="title"
                name="title"
                type="text"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base md:text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Brief description of the issue"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1" htmlFor="description">Detailed Description <span className="text-red-500">*</span></label>
              <textarea
                id="description"
                name="description"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base md:text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[100px]"
                placeholder="Please provide details about the issue..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1" htmlFor="category">Category <span className="text-red-500">*</span></label>
              <select
                id="category"
                name="category"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="text-yellow-700 flex items-center gap-2 text-base font-medium">
              <span role="img" aria-label="bulb">💡</span> Priority will be automatically assigned based on category
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 mt-2">Property Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1" htmlFor="building">Building <span className="text-red-500">*</span></label>
                  <input
                    id="building"
                    name="building"
                    type="text"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base md:text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="e.g., Block A"
                    value={form.building}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1" htmlFor="floor">Floor <span className="text-red-500">*</span></label>
                  <input
                    id="floor"
                    name="floor"
                    type="text"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base md:text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="e.g., 3"
                    value={form.floor}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1" htmlFor="unit">Unit Number <span className="text-red-500">*</span></label>
                  <input
                    id="unit"
                    name="unit"
                    type="text"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base md:text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="e.g., 301"
                    value={form.unit}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Upload Photo (Optional)</label>
              <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl h-32 md:h-40 cursor-pointer hover:border-indigo-300 transition">
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400 mb-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10V7a5 5 0 0110 0v3m-6 4v4m0 0h2m-2 0h-2" /></svg>
                <span className="text-gray-400">Click to upload or drag and drop</span>
                <span className="text-gray-300 text-xs">PNG, JPG up to 10MB</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 px-4 md:px-10 py-4 md:py-6 bg-gray-50 rounded-b-2xl">
            <button
              type="submit"
              className="w-full md:w-auto py-3 rounded-xl bg-indigo-300 text-white text-base md:text-lg font-semibold shadow hover:bg-indigo-400 transition disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Issue"}
            </button>
            <button
              type="button"
              className="w-full md:w-auto py-3 rounded-xl bg-gray-100 text-gray-700 text-base md:text-lg font-semibold shadow hover:bg-gray-200 transition"
              onClick={() => navigate('/dashboard')}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
