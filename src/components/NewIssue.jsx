import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function NewIssue({ model: propModel = null, onClose = null, asModal = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = propModel || (location && location.state && location.state.model) ? (propModel || location.state.model) : {};
  const [prefilledAsset] = useState(prefill.asset || null);
  const [selectedItems] = useState(prefill.selectedItems || []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };
  // Build a selected-items description fragment and set unit count
  const selectedItemsDescription = (selectedItems && selectedItems.length > 0)
    ? '\n\nSelected items:\n' + selectedItems.map(it => `${it.assetName || (it.asset && (it.asset.name || it.assetId)) || it.assetId}${it.index != null ? ' #' + ((it.index || 0) + 1) : ''} — ${it.building || it.blockId || ''}`).join('\n')
    : '';

  const buildingFromAsset = (() => { try { const loc = prefill.asset && prefill.asset.location; if (!loc) return ''; if (typeof loc === 'object') return loc.building || loc.buildingName || ''; return ''; } catch (e) { return ''; } })();

  const [form, setForm] = useState({
    title: prefill.title || "",
    description: (prefill.description || "") + selectedItemsDescription,
    category: prefill.category || "",
    building: prefill.building || prefill.block || buildingFromAsset || "",
    floor: prefill.floor || (prefill.asset && prefill.asset.location && prefill.asset.location.floor) || "",
    unit: prefill.unit || (selectedItems && selectedItems.length ? String(selectedItems.length) : ""),
    beforePhoto: null, // Changed from photo to beforePhoto
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setForm(prev => ({
        ...prev,
        name: userObj.name || "",
        email: userObj.email || "",
        phone: userObj.phone || "",
      }));
    }
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const location = `Block ${form.building} - Floor ${form.floor} - Unit ${form.unit}`;
      const tags = [form.category.toUpperCase(), "PENDING"];
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("location", location);
      formData.append("tags", JSON.stringify(tags));
      formData.append("assignees", JSON.stringify([]));
      formData.append("overdue", false);
      formData.append("time", "-");
      formData.append("photo", form.beforePhoto);
        // contact info
        formData.append("name", form.name);
        formData.append("email", form.email);
        formData.append("phone", form.phone);
        // include assetId(s) if available from prefill
        if (prefill && prefill.assetId) formData.append('assetId', prefill.assetId);
        else if (prefilledAsset && (prefilledAsset.id || prefilledAsset._id)) formData.append('assetId', prefilledAsset.id || prefilledAsset._id);
        if (prefill && prefill.selectedItems && Array.isArray(prefill.selectedItems) && prefill.selectedItems.length > 0) {
          const ids = prefill.selectedItems.map(si => si.assetId).filter(Boolean);
          if (ids.length === 1) formData.append('assetId', ids[0]);
          formData.append('assetIds', JSON.stringify(ids));
        }
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      formData.append("userId", user?.id || "");
      await axios.post("http://localhost:5000/api/issues", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });
      setSubmitting(false);
      // If used as a modal/component, call onClose(true) to signal success; otherwise navigate
      if (onClose && typeof onClose === 'function') {
        try { onClose(true); } catch (e) { /* ignore */ }
      } else {
        navigate("/issues");
      }
    } catch (err) {
      setSubmitting(false);
      alert("Failed to submit issue");
    }
  };

  return (
    <div className={asModal ? 'bg-transparent' : 'min-h-screen bg-gray-50 pb-8'}>
      {/* Navbar or modal header */}
      {!asModal ? (
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
      ) : (
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">New Issue</h3>
          <div>
            <button className="px-3 py-1 rounded bg-gray-100" onClick={() => { if (onClose && typeof onClose === 'function') return onClose(false); navigate('/dashboard'); }}>
              Close
            </button>
          </div>
        </div>
      )}
      {/* Main Form */}
      <form className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-6 md:p-10" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
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
            {/* <div>
              <label className="block font-semibold mb-1" htmlFor="beforePhoto">Attach BEFORE Photo</label>
              <input
                id="beforePhoto"
                name="beforePhoto"
                type="file"
                accept="image/*"
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                onChange={handleChange}
              />
            </div> */}
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
            <h3 className="text-xl font-bold mb-2 mt-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1" htmlFor="name">Name <span className="text-red-500">*</span></label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base md:text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1" htmlFor="email">Email <span className="text-red-500">*</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base md:text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="your.email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1" htmlFor="phone">Phone Number <span className="text-red-500">*</span></label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base md:text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="+1234567890"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
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
              <label className="block font-semibold mb-1">Upload BEFORE Photo (Optional)</label>
              <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl h-32 md:h-40 cursor-pointer hover:border-indigo-300 transition">
                <input
                  type="file"
                  name="beforePhoto"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
                {preview ? (
                  <img src={preview} alt="Preview" className="h-24 md:h-32 object-contain mb-2" />
                ) : (
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400 mb-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10V7a5 5 0 0110 0v3m-6 4v4m0 0h2m-2 0h-2" /></svg>
                )}
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
            onClick={() => {
              if (onClose && typeof onClose === 'function') return onClose(false);
              return navigate('/dashboard');
            }}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
