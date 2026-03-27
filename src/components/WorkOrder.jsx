import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export function WorkOrderForm({
  onSubmitted,
  onCancel,
  submitLabel = 'Submit Request',
  fieldSettings = {},
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    title: '',
    description: '',
    priority: 'None',
  });
  const [imageFile, setImageFile] = useState(null);
  const [attachFile, setAttachFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fieldMode = (key) => fieldSettings?.[key]?.create || 'Optional';
  const isVisible = (key) => fieldMode(key) !== 'Hidden';
  const isRequired = (key) => fieldMode(key) === 'Required';

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return;
      const user = JSON.parse(stored);
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    } catch (err) {
      console.warn('Failed to preload requester info', err);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      if (name === 'photo') setImageFile(files[0] || null);
      if (name === 'file') setAttachFile(files[0] || null);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name || '');
      fd.append('phone', form.phone || '');
      fd.append('email', form.email || '');
      fd.append('title', form.title || '');
      fd.append('description', form.description || '');
      if (isVisible('priority') && form.priority && form.priority !== 'None') {
        fd.append('priority', String(form.priority).toUpperCase());
      }
      if (isVisible('images') && imageFile) fd.append('photo', imageFile);
      if (isVisible('files') && attachFile) fd.append('file', attachFile);

      await api.post('/api/issues', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setForm((prev) => ({
        ...prev,
        title: '',
        description: '',
        priority: 'None',
      }));
      setImageFile(null);
      setAttachFile(null);
      onSubmitted?.();
    } catch (err) {
      console.error(err);
      alert('Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 py-6">
      {isVisible('title') && (
      <div>
        <label className="mb-2 block text-[15px] text-gray-900">
          Title {isRequired('title') && <span className="text-rose-500">*</span>}
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required={isRequired('title')}
          className="h-12 w-full rounded-md border border-rose-300 px-4 text-[15px] text-gray-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <p className="mt-2 text-[15px] text-gray-500">Summarize the problem or issue</p>
      </div>
      )}

      {isVisible('description') && (
      <div>
        <label className="mb-2 block text-[15px] text-gray-900">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required={isRequired('description')}
          className="min-h-[100px] w-full rounded-md border border-gray-300 px-4 py-3 text-[15px] text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      )}

      {isVisible('priority') && (
      <div>
        <label className="mb-2 block text-[15px] text-gray-900">Priority</label>
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          required={isRequired('priority')}
          className="h-12 w-full rounded-md border border-gray-300 px-4 text-[15px] text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="None">None</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>
      )}

      {isVisible('images') && (
      <div className="border-b border-gray-200 pb-6">
        <label className="mb-2 block text-[15px] text-gray-900">Image</label>
        <label className="flex min-h-[64px] cursor-pointer items-center justify-center gap-4 rounded-md border border-dashed border-gray-300 bg-white px-6 text-[15px] text-gray-500 hover:border-blue-300">
          <span className="rounded-md border border-gray-300 px-5 py-2 text-gray-800">Upload</span>
          <span>or Drop Images</span>
          <input name="photo" type="file" accept="image/*" onChange={handleChange} required={isRequired('images') && !imageFile} className="hidden" />
        </label>
        {imageFile && <div className="mt-2 text-sm text-gray-500">{imageFile.name}</div>}
      </div>
      )}

      {isVisible('files') && (
      <div className="pb-2">
        <label className="mb-2 block text-[15px] text-gray-900">Files</label>
        <label className="flex min-h-[64px] cursor-pointer items-center justify-center gap-4 rounded-md border border-dashed border-gray-300 bg-white px-6 text-[15px] text-gray-500 hover:border-blue-300">
          <span className="rounded-md border border-gray-300 px-5 py-2 text-gray-800">Upload</span>
          <span>or Drop Files</span>
          <input name="file" type="file" onChange={handleChange} required={isRequired('files') && !attachFile} className="hidden" />
        </label>
        {attachFile && <div className="mt-2 text-sm text-gray-500">{attachFile.name}</div>}
        <button type="button" className="mt-5 text-[15px] font-medium text-blue-600 hover:text-blue-700">
          Add from Saved Files
        </button>
      </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-200 pt-7">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-[15px] font-medium text-gray-800 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || (isVisible('title') && isRequired('title') && !form.title.trim())}
          className="rounded-md bg-gray-100 px-7 py-3 text-[15px] font-semibold text-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function WorkOrder() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-2xl font-bold text-gray-900">Create Request</div>
        <WorkOrderForm />
      </div>
    </div>
  );
}
