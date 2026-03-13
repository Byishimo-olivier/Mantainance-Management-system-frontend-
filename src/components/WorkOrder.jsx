import React, { useState } from 'react';
import api from '../api/axios';

export function WorkOrderForm({
  onSubmitted,
  onCancel,
  submitLabel = 'Submit Work Order Request',
  showSidebar = true
}) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', title: '', description: '', location: '' });
  const [imageFile, setImageFile] = useState(null);
  const [attachFile, setAttachFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      if (name === 'photo') setImageFile(files[0]);
      if (name === 'file') setAttachFile(files[0]);
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('location', form.location);
      if (imageFile) fd.append('photo', imageFile);
      if (attachFile) fd.append('file', attachFile);
      await api.post('/api/issues', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Request submitted');
      setForm({ name: '', phone: '', email: '', title: '', description: '', location: '' });
      setImageFile(null); setAttachFile(null);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error(err);
      alert('Submit failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className={`grid grid-cols-1 ${showSidebar ? 'lg:grid-cols-3' : ''} gap-6`}>
      <form onSubmit={handleSubmit} className={`${showSidebar ? 'lg:col-span-2' : ''} space-y-6`}>
            <div className="glass-surface rounded-3xl p-6 border border-white/50 shadow-lg">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Requester Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl glass-input px-3 py-2"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone Number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl glass-input px-3 py-2"
                    placeholder="Your phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl glass-input px-3 py-2"
                    placeholder="you@email.com"
                    required
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-700">
                You can track your requests by logging in with the same email address.
              </div>
            </div>

            <div className="glass-surface rounded-3xl p-6 border border-white/50 shadow-lg">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Request Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Title *</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl glass-input px-3 py-2"
                    placeholder="Short summary of the issue"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl glass-input px-3 py-2 min-h-[140px]"
                    placeholder="Provide detailed information about the issue"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Location *</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl glass-input px-3 py-2"
                    placeholder="Building, floor, unit, or area"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="glass-surface rounded-3xl p-6 border border-white/50 shadow-lg">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Attachments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="border-dashed border-2 border-white/60 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-200 transition">
                  <div className="text-sm font-semibold text-slate-600">Upload Image</div>
                  <div className="text-xs text-slate-500 mt-1">JPG, PNG, HEIC</div>
                  <input name="photo" type="file" accept="image/*" onChange={handleChange} className="hidden" />
                  {imageFile && <div className="mt-3 text-xs text-slate-700">{imageFile.name}</div>}
                </label>
                <label className="border-dashed border-2 border-white/60 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-200 transition">
                  <div className="text-sm font-semibold text-slate-600">Upload File</div>
                  <div className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT</div>
                  <input name="file" type="file" onChange={handleChange} className="hidden" />
                  {attachFile && <div className="mt-3 text-xs text-slate-700">{attachFile.name}</div>}
                </label>
              </div>
            </div>

            <div className="glass-surface-strong rounded-3xl p-6 border border-white/60 shadow-xl">
              <div className={`flex flex-col ${onCancel ? 'md:flex-row md:items-center' : ''} gap-3`}>
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-full md:flex-1 border border-slate-200 text-slate-700 text-base font-semibold py-3 rounded-2xl hover:bg-white/60 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full md:flex-1 bg-blue-600 text-white text-lg font-bold py-3 rounded-2xl hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : submitLabel}
                </button>
              </div>
              <p className="text-center text-xs text-slate-500 mt-3">
                All requests are sent directly to the property management team.
              </p>
            </div>
      </form>

      {showSidebar && (
        <aside className="space-y-6">
          <div className="glass-surface rounded-3xl p-6 border border-white/50 shadow-lg">
            <h4 className="font-bold text-slate-900 mb-4">Request Summary</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Title</p>
                <p className="font-semibold text-slate-800">{form.title || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Requester</p>
                <p className="font-semibold text-slate-800">{form.name || '—'}</p>
                <p className="text-xs text-slate-500">{form.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Location</p>
                <p className="font-semibold text-slate-800">{form.location || '—'}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Image</span>
                <span>{imageFile ? 'Attached' : 'None'}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>File</span>
                <span>{attachFile ? 'Attached' : 'None'}</span>
              </div>
            </div>
          </div>

          <div className="glass-surface rounded-3xl p-6 border border-white/50 shadow-lg">
            <h4 className="font-bold text-slate-900 mb-3">What happens next</h4>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>We review and approve your request.</li>
              <li>A work order is created and assigned.</li>
              <li>You receive updates via chat and email.</li>
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}

export default function WorkOrder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-emerald-100 px-4 py-10 text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-blue-600 font-semibold">Maintenance Portal</p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">Submit a Work Order Request</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Share the details of the issue and your team will receive it instantly.
            </p>
          </div>
          <a
            href="/login"
            className="glass-ghost px-4 py-2 rounded-full text-sm font-semibold text-slate-700 border border-white/60 hover:border-blue-200 hover:text-blue-700 transition"
          >
            Go To App
          </a>
        </header>

        <WorkOrderForm />
      </div>
    </div>
  );
}
