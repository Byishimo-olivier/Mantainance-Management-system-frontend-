import React, { useState } from 'react';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageUrl';

export default function WorkOrder() {
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
    } catch (err) {
      console.error(err);
      alert('Submit failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Work Order Requests</h1>
          <a href="/login" className="text-sm font-semibold text-gray-600">Go To App</a>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-4">Requester Info</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} className="mt-2 w-full border rounded px-3 py-2" placeholder="Your Full Name" required />
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="mt-2 w-full border rounded px-3 py-2" placeholder="Your Phone Number" />
              </div>
              <div>
                <label className="text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="mt-2 w-full border rounded px-3 py-2" placeholder="Your Email Address" required />
              </div>
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-700 rounded">You can keep track of your requests by logging in to the Portal with the same email address.</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-4">Request Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                <input name="title" value={form.title} onChange={handleChange} className="mt-2 w-full border rounded px-3 py-2" placeholder="Title to describe the issue" required />
              </div>
              <div>
                <label className="text-sm font-medium">Description <span className="text-red-500">*</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} className="mt-2 w-full border rounded px-3 py-2 min-h-[140px]" placeholder="Provide some details for this maintenance request" required />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-4">Request Details</h3>
            <div className="space-y-4">
              <div className="border-dashed border-2 border-gray-200 rounded p-6 text-center">
                <label className="cursor-pointer">
                  <div className="mb-2 text-gray-500">Click to upload an Image</div>
                  <input name="photo" type="file" accept="image/*" onChange={handleChange} className="hidden" />
                  {imageFile && <div className="mt-2 text-sm text-gray-700">{imageFile.name}</div>}
                </label>
              </div>
              <div className="border-dashed border-2 border-gray-200 rounded p-6 text-center">
                <label className="cursor-pointer">
                  <div className="mb-2 text-gray-500">Click to upload a File</div>
                  <input name="file" type="file" onChange={handleChange} className="hidden" />
                  {attachFile && <div className="mt-2 text-sm text-gray-700">{attachFile.name}</div>}
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-4">Additional Info</h3>
            <div>
              <label className="text-sm font-medium">Provide Location <span className="text-red-500">*</span></label>
              <input name="location" value={form.location} onChange={handleChange} className="mt-2 w-full border rounded px-3 py-2" placeholder="Enter value" required />
            </div>
          </div>

          <div className="col-span-1 lg:col-span-4">
            <div className="mt-6 p-6 bg-blue-600 rounded text-white text-center shadow-lg">
              <button type="submit" disabled={submitting} className="w-full text-lg font-bold py-4">
                {submitting ? 'Submitting…' : 'Submit Work Order Request'}
              </button>
            </div>
            <p className="text-center text-gray-500 mt-4">All requests are sent directly to the company admin.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
