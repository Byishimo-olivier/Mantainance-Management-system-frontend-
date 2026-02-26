import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function NewIssue({ model: propModel = null, onClose = null, asModal = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);

  // Simplified gradient background
  const backgroundGradient = "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)";

  const prefill = propModel || (location && location.state && location.state.model) ? (propModel || location.state.model) : {};
  const [prefilledAsset] = useState(prefill.asset || null);
  const [selectedItems] = useState(prefill.selectedItems || []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  const selectedItemsDescription = (selectedItems && selectedItems.length > 0)
    ? '\n\nSelected items:\n' + selectedItems.map(it => `${it.assetName || (it.asset && (it.asset.name || it.assetId)) || it.assetId}${it.index != null ? ' #' + ((it.index || 0) + 1) : ''} — ${it.building || it.blockId || ''}`).join('\n')
    : '';

  const buildingFromAsset = (() => {
    try {
      const loc = prefill.asset && prefill.asset.location;
      if (!loc) return '';
      if (typeof loc === 'object') return loc.building || loc.buildingName || '';
      return '';
    } catch (e) {
      return '';
    }
  })();

  const [form, setForm] = useState({
    title: prefill.title || "",
    description: (prefill.description || "") + selectedItemsDescription,
    category: prefill.category || "",
    building: prefill.building || prefill.block || buildingFromAsset || "",
    floor: prefill.floor || (prefill.asset && prefill.asset.location && prefill.asset.location.floor) || "",
    unit: prefill.unit || (selectedItems && selectedItems.length ? String(selectedItems.length) : ""),
    beforePhoto: null,
    name: "",
    email: "",
    phone: "",
  });

  // backendBase removed, using api instance
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [properties, setProperties] = useState([]);
  const [assetsOptions, setAssetsOptions] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(prefill.propertyId || (prefill.property && (prefill.property.id || prefill.property._id)) || '');
  const [selectedAssetId, setSelectedAssetId] = useState(prefill.assetId || (prefilledAsset && (prefilledAsset.id || prefilledAsset._id)) || '');
  const [formStep, setFormStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [anonId, setAnonId] = useState(null);
  const [internalTechnicians, setInternalTechnicians] = useState([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");

  // Floating particles animation
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Load user data and check authentication
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      const userObj = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setUserId(userObj.id || userObj._id);
      setForm(prev => ({
        ...prev,
        name: userObj.name || "",
        email: userObj.email || "",
        phone: userObj.phone || "",
      }));
    } else {
      // Generate anonymous ID for guest submissions
      setIsAuthenticated(false);
      const generatedAnonId = `ANON-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setAnonId(generatedAnonId);
    }

    // Fetch properties
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      // Auth handled by interceptor
      const res = await api.get('/api/properties');
      const list = Array.isArray(res.data) ? res.data : [];
      setProperties(list);

      if (selectedPropertyId) {
        await loadAssetsForProperty(selectedPropertyId);
        await loadInternalTechnicians(selectedPropertyId);
      } else if (prefilledAsset) {
        const pid = prefilledAsset.propertyId || (prefilledAsset.property && (prefilledAsset.property.id || prefilledAsset.property._id));
        if (pid) {
          setSelectedPropertyId(pid);
          await loadAssetsForProperty(pid);
          await loadInternalTechnicians(pid);
        }
      }
    } catch (e) {
      console.error("Failed to load properties:", e);
    } finally {
      setIsLoading(false);
    }
  };

  async function loadAssetsForProperty(propertyId) {
    try {
      // Auth handled by interceptor
      const res = await api.get(`/api/assets?propertyId=${propertyId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setAssetsOptions(list);
    } catch (e) {
      setAssetsOptions([]);
    }
  }

  async function loadInternalTechnicians(propertyId) {
    if (!localStorage.getItem('token')) {
      setInternalTechnicians([]);
      return;
    }
    try {
      // Auth handled by interceptor
      const res = await api.get(`/api/internal-technicians/by-property/${propertyId}`);
      setInternalTechnicians(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Failed to load internal technicians:", e);
      setInternalTechnicians([]);
    }
  }

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
    setUploadProgress(0);

    // For authenticated users, property is required
    if (isAuthenticated && !selectedPropertyId) {
      alert("Please select a property for your issue");
      setSubmitting(false);
      return;
    }

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

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
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);

      if (prefill && prefill.assetId) formData.append('assetId', prefill.assetId);
      else if (prefilledAsset && (prefilledAsset.id || prefilledAsset._id)) formData.append('assetId', prefilledAsset.id || prefilledAsset._id);
      else if (selectedAssetId) formData.append('assetId', selectedAssetId);

      if (prefill && prefill.selectedItems && Array.isArray(prefill.selectedItems) && prefill.selectedItems.length > 0) {
        const ids = prefill.selectedItems.map(si => si.assetId).filter(Boolean);
        if (ids.length > 0) formData.append('assetIds', JSON.stringify(ids));
      }

      if (selectedPropertyId) formData.append('propertyId', selectedPropertyId);
      if (selectedTechnicianId) formData.append('internalTechnicianId', selectedTechnicianId);

      const token = localStorage.getItem('token');

      // Submit with either authenticated userId or anonymous ID
      if (isAuthenticated && userId) {
        formData.append("userId", userId);
        formData.append("submissionType", "authenticated");
      } else {
        formData.append("anonId", anonId);
        formData.append("submissionType", "anonymous");
      }

      const headers = { "Content-Type": "multipart/form-data" };
      // Auth handled by interceptor if token exists in localStorage

      await api.post("/api/issues", formData, { headers });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Show success animation
      setShowSuccess(true);

      setTimeout(() => {
        setSubmitting(false);
        setShowSuccess(false);

        if (onClose && typeof onClose === 'function') {
          onClose(true);
        } else {
          navigate("/issues");
        }
      }, 1500);

    } catch (err) {
      clearInterval(progressInterval);
      setSubmitting(false);
      alert("Failed to submit issue");
    }
  };

  const nextStep = () => setFormStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setFormStep(prev => Math.max(prev - 1, 1));



  // Form steps with animations
  const formSteps = {
    1: (
      <motion.div
        key="step1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <motion.h2
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-indigo-600"
          >
            Issue Details
          </motion.h2>
          <p className="text-gray-600 mt-2">Let's start with the basic information</p>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <label className="block font-semibold mb-2 text-gray-700" htmlFor="title">
            Issue Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
            placeholder="Brief description of the issue"
            value={form.title}
            onChange={handleChange}
            required
          />
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="relative">
          <label className="block font-semibold mb-2 text-gray-700" htmlFor="description">
            Detailed Description <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              id="description"
              name="description"
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 pr-16 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 min-h-[150px] bg-white/80 backdrop-blur-sm"
              placeholder="Please provide details about the issue..."
              value={form.description}
              onChange={handleChange}
              required
            />
            {form.description.length > 20 && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    const res = await api.post('/api/ai/triage-issue', { description: form.description });
                    const { category, priority, suggestedTechnicianId } = res.data;

                    if (category) setForm(prev => ({ ...prev, category }));
                    if (suggestedTechnicianId) setSelectedTechnicianId(suggestedTechnicianId);

                    alert(`AI Suggestions:\nCategory: ${category}\nPriority: ${priority}`);
                  } catch (e) {
                    console.error("AI Triage failed:", e);
                    alert("AI suggestion currently unavailable.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="absolute right-4 bottom-4 p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-indigo-200 transition-all"
                title="AI Auto-Categorize"
              >
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <span className="text-sm font-bold">Magic</span>
                </div>
              </motion.button>
            )}
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <label className="block font-semibold mb-2 text-gray-700" htmlFor="category">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
        </motion.div>
      </motion.div>
    ),
    2: (
      <motion.div
        key="step2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <motion.h2
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-indigo-600"
          >
            Contact Information
          </motion.h2>
          <p className="text-gray-600 mt-2">
            {isAuthenticated ? "You're submitting as an authenticated user" : "You're submitting anonymously - optional contact info"}
          </p>
        </div>

        {/* Submission Type Badge */}
        <div className="flex justify-center mb-6">
          <div className={`px-6 py-3 rounded-full font-semibold text-white ${isAuthenticated ? 'bg-indigo-600' : 'bg-gray-600'}`}>
            {isAuthenticated ? '✓ Authenticated Submission' : '◎ Anonymous Submission'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'name', label: 'Name', type: 'text', placeholder: 'Your full name' },
            { id: 'email', label: 'Email', type: 'email', placeholder: 'your.email@example.com' },
            { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+1234567890' }
          ].map((field, index) => (
            <motion.div
              key={field.id}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <label className="block font-semibold mb-2 text-gray-700" htmlFor={field.id}>
                {field.label} {isAuthenticated && <span className="text-red-500">*</span>}
              </label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                placeholder={field.placeholder}
                value={form[field.id]}
                onChange={handleChange}
                required={isAuthenticated}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    ),
    3: (
      <motion.div
        key="step3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <motion.h2
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-indigo-600"
          >
            Location Details
          </motion.h2>
          <p className="text-gray-600 mt-2">Where is the issue located?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'building', label: 'Building', placeholder: 'e.g., Block A' },
            { id: 'floor', label: 'Floor', placeholder: 'e.g., 3' },
            { id: 'unit', label: 'Unit Number', placeholder: 'e.g., 301' }
          ].map((field, index) => (
            <motion.div
              key={field.id}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <label className="block font-semibold mb-2 text-gray-700" htmlFor={field.id}>
                {field.label} <span className="text-red-500">*</span>
              </label>
              <input
                id={field.id}
                name={field.id}
                type="text"
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                placeholder={field.placeholder}
                value={form[field.id]}
                onChange={handleChange}
                required
              />
            </motion.div>
          ))}
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="space-y-4">
          <h3 className="text-xl font-bold text-gray-700">Property / Asset {isAuthenticated ? "(required)" : "(optional)"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2 text-gray-700" htmlFor="property">
                Property {isAuthenticated && <span className="text-red-500">*</span>}
              </label>
              <select
                id="property"
                name="property"
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                value={selectedPropertyId}
                onChange={async (e) => {
                  const pid = e.target.value;
                  setSelectedPropertyId(pid);
                  const prop = properties.find(p => (p.id || p._id) === pid);
                  if (prop) setForm(f => ({ ...f, building: prop.name || f.building }));
                  if (prop) setForm(f => ({ ...f, building: prop.name || f.building }));
                  await loadAssetsForProperty(pid);
                  await loadInternalTechnicians(pid);
                }}
              >
                <option value="">-- Select property {isAuthenticated ? "(required)" : "(optional)"} --</option>
                {properties.map(p => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name || p.address || (p.id || p._id)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700" htmlFor="asset">
                Asset (optional)
              </label>
              <select
                id="asset"
                name="asset"
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                value={selectedAssetId}
                onChange={(e) => { setSelectedAssetId(e.target.value); }}
              >
                <option value="">-- Select asset (optional) --</option>
                {assetsOptions.map(a => (
                  <option key={a.id || a._id} value={a.id || a._id}>
                    {a.name || a.serialNumber || (a.id || a._id)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {isAuthenticated && (
            <div className="mt-4">
              <label className="block font-semibold mb-2 text-gray-700" htmlFor="technician">
                Assigned Technician (optional)
              </label>
              <select
                id="technician"
                name="technician"
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                value={selectedTechnicianId}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
              >
                <option value="">-- Select internal technician (optional) --</option>
                {internalTechnicians.map(t => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.name} ({Array.isArray(t.specialty) ? t.specialty.join(', ') : (t.specialty || 'General')})
                  </option>
                ))}
              </select>
            </div>
          )}
        </motion.div>
      </motion.div>
    ),
    4: (
      <motion.div
        key="step4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <motion.h2
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-indigo-600"
          >
            Upload & Review
          </motion.h2>
          <p className="text-gray-600 mt-2">Add photos and review your submission</p>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <label className="block font-semibold mb-4 text-gray-700">
            Upload BEFORE Photo (Optional)
          </label>
          <motion.label
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex flex-col items-center justify-center border-4 border-dashed border-gray-300 rounded-3xl h-64 cursor-pointer hover:border-purple-400 transition-all duration-300 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm"
          >
            <input
              type="file"
              name="beforePhoto"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
            {preview ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="h-48 object-contain rounded-xl shadow-lg"
                />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-2"
                >
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-center p-8"
              >
                <svg className="w-20 h-20 text-gray-400 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 text-lg font-medium">Drag & drop or click to upload</p>
                <p className="text-gray-400 text-sm mt-2">PNG, JPG, GIF up to 10MB</p>
              </motion.div>
            )}
          </motion.label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Issue Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Title:</span>
              <span className="font-semibold">{form.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-semibold">{form.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-semibold">Block {form.building} - Floor {form.floor} - Unit {form.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contact:</span>
              <span className="font-semibold">{form.name}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  };

  return (
    <div
      className={`min-h-screen ${asModal ? 'bg-transparent' : ''}`}
      style={asModal ? {} : { background: backgroundGradient }}
    >


      {/* Navbar */}
      {!asModal && (
        <nav
          className="flex items-center justify-between bg-indigo-900 shadow-lg px-4 md:px-8 h-16"
        >
          <div className="flex items-center gap-3">
            <span className="bg-white rounded-2xl p-2 flex items-center justify-center shadow-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="6" fill="#8b5cf6" />
                <rect x="6" y="6" width="12" height="6" rx="2" fill="#c4b5fd" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">Fixnest</span>
              <motion.span
                className="text-sm text-purple-200"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Welcome, {JSON.parse(localStorage.getItem('user') || '{}').name || ''}
              </motion.span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {[
              { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', color: 'from-blue-500 to-cyan-500' },
              { path: '/issues', label: 'All Issues', icon: 'issues', color: 'from-green-500 to-emerald-500' },
              { path: '#', label: 'New Issue', icon: 'new', color: 'from-yellow-500 to-orange-500', active: true },
              { path: '/feedback', label: 'Feedback', icon: 'feedback', color: 'from-teal-500 to-green-500' }
            ].map((item) => (
              <button
                key={item.path}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold transition-all ${item.active
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg'
                  : `bg-gradient-to-r ${item.color} hover:shadow-lg`
                  }`}
                onClick={() => !item.active && navigate(item.path)}
              >
                {item.label}
              </button>
            ))}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              Logout
            </motion.button>
          </div>
        </nav>
      )}

      {/* Main Form Container */}
      <div className="max-w-5xl mx-auto mt-10 p-4">
        <form
          ref={formRef}
          className="bg-white rounded-3xl shadow-lg p-8"
          onSubmit={handleSubmit}
        >
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex flex-col items-center cursor-pointer ${formStep >= step ? 'text-indigo-600' : 'text-gray-400'}`}
                    onClick={() => setFormStep(step)}
                  >
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                      ${formStep >= step
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-200'
                      }
                    `}>
                      {formStep > step ? '✓' : step}
                    </div>
                    <span className="mt-2 text-sm font-medium">
                      {['Details', 'Contact', 'Location', 'Upload'][step - 1]}
                    </span>
                  </div>
                  {step < 4 && (
                    <div className="flex-1 h-1 mx-4 relative">
                      <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                      <div
                        className="absolute inset-0 bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ transform: `scaleX(${formStep > step ? 1 : 0})`, transformOrigin: 'left' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {formSteps[formStep]}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              className={`px-8 py-4 rounded-2xl text-lg font-semibold transition-all ${formStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              disabled={formStep === 1}
            >
              ← Previous
            </button>

            {formStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-lg font-semibold hover:bg-indigo-700 transition-all"
              >
                Next →
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => onClose ? onClose(false) : navigate('/dashboard')}
                  className="px-8 py-4 rounded-2xl bg-gray-500 text-white text-lg font-semibold hover:bg-gray-600 transition-all"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span>⏳</span>
                      Submitting...
                    </span>
                  ) : showSuccess ? (
                    <span className="flex items-center gap-2">
                      <span>✅</span>
                      Success!
                    </span>
                  ) : (
                    'Submit Issue'
                  )}

                  {/* Progress Bar */}
                  {submitting && (
                    <div
                      className="absolute bottom-0 left-0 h-1 bg-indigo-400 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Success Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-white rounded-3xl p-12 text-center shadow-2xl">
                  <div className="text-6xl mb-6">🎉</div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">Issue Submitted!</h3>
                  <p className="text-gray-600 text-lg">Your issue has been successfully submitted.</p>
                  <div className="mt-8 text-sm text-gray-500">Redirecting...</div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}