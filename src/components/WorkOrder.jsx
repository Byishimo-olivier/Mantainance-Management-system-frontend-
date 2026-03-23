import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

export function WorkOrderForm({
  onSubmitted,
  onCancel,
  submitLabel = 'Submit Work Order Request',
  showSidebar = true,
  checklistTemplates = [],
  companyProperties = [],
  companyAssets = [],
  companyTechnicians = []
}) {
  const [activeTab, setActiveTab] = useState('create');
  const [templateSearch, setTemplateSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    title: '',
    description: '',
    location: '',
    propertyId: '',
    assetId: '',
    assignedTo: '',
    checklistTemplateId: '',
    checklist: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [attachFile, setAttachFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState(Array.isArray(checklistTemplates) ? checklistTemplates : []);
  const [properties, setProperties] = useState(Array.isArray(companyProperties) ? companyProperties : []);
  const [assets, setAssets] = useState(Array.isArray(companyAssets) ? companyAssets : []);
  const [technicians, setTechnicians] = useState(Array.isArray(companyTechnicians) ? companyTechnicians : []);

  const getPropertyLabel = (property) => (
    property?.name ||
    property?.title ||
    property?.locationName ||
    property?.address ||
    'Unnamed property'
  );

  const getAssetLabel = (asset) => (
    asset?.name ||
    asset?.title ||
    asset?.assetName ||
    asset?.serialNumber ||
    asset?.tag ||
    'Unnamed asset'
  );

  const getPropertyLocation = (property) => (
    property?.address ||
    property?.location ||
    property?.fullAddress ||
    ''
  );

  const getAssetLocationLabel = (asset) => {
    if (!asset) return '';
    if (typeof asset.location === 'string') return asset.location;
    if (asset.location?.branchName) return `${asset.location.branchName} (Branch)`;
    return [
      asset.property?.name,
      asset.location?.building,
      asset.location?.floor,
      asset.location?.room,
      asset.location?.block
    ].filter(Boolean).join(' - ');
  };

  useEffect(() => {
    let active = true;

    const loadCompanyData = async () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored && active) {
          const user = JSON.parse(stored);
          setForm((prev) => ({
            ...prev,
            name: prev.name || user.name || '',
            phone: prev.phone || user.phone || '',
            email: prev.email || user.email || ''
          }));
        }
      } catch (err) {
        console.warn('Failed to preload requester info', err);
      }

      const hasProvidedData =
        (Array.isArray(checklistTemplates) && checklistTemplates.length > 0) ||
        (Array.isArray(companyProperties) && companyProperties.length > 0) ||
        (Array.isArray(companyAssets) && companyAssets.length > 0) ||
        (Array.isArray(companyTechnicians) && companyTechnicians.length > 0);

      if (hasProvidedData) {
        if (active) {
          setTemplates(Array.isArray(checklistTemplates) ? checklistTemplates : []);
          setProperties(Array.isArray(companyProperties) ? companyProperties : []);
          setAssets(Array.isArray(companyAssets) ? companyAssets : []);
          setTechnicians(Array.isArray(companyTechnicians) ? companyTechnicians : []);
        }
        return;
      }

      try {
        const [checklistsRes, propertiesRes, assetsRes, techniciansRes] = await Promise.all([
          api.get('/api/checklists'),
          api.get('/api/properties'),
          api.get('/api/assets'),
          api.get('/api/internal-technicians')
        ]);
        if (!active) return;

        const checklistTemplates = (Array.isArray(checklistsRes?.data) ? checklistsRes.data : []).map((tpl, index) => ({
          ...tpl,
          id: tpl.id || tpl._id || `checklist-${index}`,
          name: tpl.name || tpl.title || 'Checklist',
          description: tpl.description || '',
          category: tpl.category || 'Checklist',
          lastUpdated: tpl.updatedAt || tpl.createdAt || '',
          defaults: {
            title: tpl.workOrderTitle || tpl.name || tpl.title || '',
            description: tpl.workOrderDescription || tpl.description || '',
            location: ''
          },
          items: Array.isArray(tpl.items) ? tpl.items : (Array.isArray(tpl.checklist) ? tpl.checklist : [])
        }));

        setTemplates(checklistTemplates);
        setProperties(Array.isArray(propertiesRes?.data) ? propertiesRes.data : []);
        setAssets(Array.isArray(assetsRes?.data) ? assetsRes.data : []);
        setTechnicians(Array.isArray(techniciansRes?.data) ? techniciansRes.data : []);
      } catch (err) {
        console.error('Failed to load company request form data', err);
      }
    };

    loadCompanyData();
    return () => {
      active = false;
    };
  }, [checklistTemplates, companyProperties, companyAssets, companyTechnicians]);

  const filteredTemplates = templates.filter((tpl) =>
    tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    tpl.description.toLowerCase().includes(templateSearch.toLowerCase()) ||
    tpl.category.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const filteredAssets = useMemo(() => {
    if (!form.propertyId) return assets;
    const selectedProperty = properties.find((property) => String(property.id || property._id) === String(form.propertyId));
    const selectedPropertyName = String(getPropertyLabel(selectedProperty) || '').trim().toLowerCase();
    return assets.filter((asset) => {
      const assetPropertyId = String(asset.propertyId || asset.property?.id || asset.property?._id || '').trim();
      if (assetPropertyId && assetPropertyId === String(form.propertyId)) return true;
      const assetPropertyName = String(asset.property?.name || asset.propertyName || '').trim().toLowerCase();
      if (selectedPropertyName && assetPropertyName && assetPropertyName === selectedPropertyName) return true;
      const assetLocationName = String(asset.location?.branchName || asset.location?.building || asset.location || '').trim().toLowerCase();
      return Boolean(selectedPropertyName && assetLocationName && assetLocationName.includes(selectedPropertyName));
    });
  }, [assets, form.propertyId]);

  const filteredTechnicians = useMemo(() => {
    if (!form.propertyId) return technicians;
    return technicians.filter((tech) => String(tech.propertyId || tech.property?.id || tech.property?._id || '') === String(form.propertyId));
  }, [technicians, form.propertyId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      if (name === 'photo') setImageFile(files[0]);
      if (name === 'file') setAttachFile(files[0]);
      return;
    }

    setForm((prev) => {
      if (name === 'propertyId') {
        const selectedProperty = properties.find((property) => String(property.id || property._id) === String(value));
        return {
          ...prev,
          propertyId: value,
          assetId: '',
          assignedTo: '',
          location: getPropertyLocation(selectedProperty) || prev.location || ''
        };
      }

      if (name === 'assetId') {
        const selectedAsset = assets.find((asset) => String(asset.id || asset._id) === String(value));
        const assetLocation = getAssetLocationLabel(selectedAsset);
        return {
          ...prev,
          assetId: value,
          location: assetLocation || prev.location
        };
      }

      if (name === 'checklistTemplateId') {
        const selectedTemplate = templates.find((tpl) => String(tpl.id || tpl._id) === String(value));
        return {
          ...prev,
          checklistTemplateId: value,
          checklist: selectedTemplate?.items || [],
          title: prev.title || selectedTemplate?.defaults?.title || '',
          description: prev.description || selectedTemplate?.defaults?.description || ''
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const applyTemplate = (tpl) => {
    setForm((prev) => ({
      ...prev,
      checklistTemplateId: tpl.id || tpl._id || '',
      checklist: tpl.items || [],
      title: tpl.defaults?.title || '',
      description: tpl.defaults?.description || '',
      location: tpl.defaults?.location || prev.location
    }));
    setActiveTab('create');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedAsset = filteredAssets.find((asset) => String(asset.id || asset._id) === String(form.assetId));
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('location', form.location);
      if (form.propertyId) fd.append('propertyId', form.propertyId);
      if (form.assetId) fd.append('assetId', form.assetId);
      if (getAssetLabel(selectedAsset)) fd.append('assetName', getAssetLabel(selectedAsset));
      if (form.assignedTo) fd.append('assignedTo', form.assignedTo);
      if (Array.isArray(form.checklist) && form.checklist.length > 0) {
        fd.append('checklist', JSON.stringify(form.checklist));
      }
      if (imageFile) fd.append('photo', imageFile);
      if (attachFile) fd.append('file', attachFile);

      await api.post('/api/issues', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      alert('Request submitted');
      setForm((prev) => ({
        ...prev,
        title: '',
        description: '',
        location: '',
        propertyId: '',
        assetId: '',
        assignedTo: '',
        checklistTemplateId: '',
        checklist: []
      }));
      setImageFile(null);
      setAttachFile(null);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error(err);
      alert('Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProperty = properties.find((property) => String(property.id || property._id) === String(form.propertyId));
  const selectedAsset = assets.find((asset) => String(asset.id || asset._id) === String(form.assetId));
  const selectedTechnician = technicians.find((tech) => String(tech.id || tech._id) === String(form.assignedTo));
  const selectedTemplate = templates.find((tpl) => String(tpl.id || tpl._id) === String(form.checklistTemplateId));

  return (
    <div>
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`pb-3 text-sm font-bold ${activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Create
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-sm font-bold ${activeTab === 'templates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Templates
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600">Live</span>
        </button>
      </div>

      {activeTab === 'templates' && (
        <div className="glass-surface rounded-3xl p-6 border border-white/50 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search company checklists"
                className="w-full rounded-xl glass-input px-3 py-2 pl-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">Search</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
            >
              Back To Form
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Checklist Name</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Last Updated</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((tpl) => (
                  <tr key={tpl.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                    <td className="py-3 px-3 font-semibold text-slate-800">{tpl.name}</td>
                    <td className="py-3 px-3 text-sm text-slate-600 line-clamp-1">{tpl.description || 'No description'}</td>
                    <td className="py-3 px-3 text-sm text-slate-600">{tpl.category || 'Checklist'}</td>
                    <td className="py-3 px-3 text-sm text-slate-600">{tpl.lastUpdated ? new Date(tpl.lastUpdated).toLocaleDateString() : '—'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="px-3 py-1.5 text-xs font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                      >
                        Use Checklist
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTemplates.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-sm text-slate-400">
                      No company checklists found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
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
            </div>

            <div className="glass-surface rounded-3xl p-6 border border-white/50 shadow-lg">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Request Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Property</label>
                    <select
                      name="propertyId"
                      value={form.propertyId}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl glass-input px-3 py-2"
                    >
                      <option value="">Select company property</option>
                      {properties.map((property) => (
                        <option key={property.id || property._id} value={property.id || property._id}>
                          {getPropertyLabel(property)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Asset</label>
                    <select
                      name="assetId"
                      value={form.assetId}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl glass-input px-3 py-2"
                    >
                      <option value="">
                        {filteredAssets.length ? `Select company asset (${filteredAssets.length})` : 'No company assets found'}
                      </option>
                      {filteredAssets.map((asset) => (
                        <option key={asset.id || asset._id} value={asset.id || asset._id}>
                          {[getAssetLabel(asset), getAssetLocationLabel(asset)].filter(Boolean).join(' - ')}
                        </option>
                      ))}
                    </select>
                    {filteredAssets.length === 0 && (
                      <div className="mt-2 text-xs text-slate-500">
                        {form.propertyId
                          ? 'No assets are linked to this location yet. You can still submit the request without an asset.'
                          : 'All company assets will appear here once they are available.'}
                      </div>
                    )}
                  </div>
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Checklist</label>
                    <select
                      name="checklistTemplateId"
                      value={form.checklistTemplateId}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl glass-input px-3 py-2"
                    >
                      <option value="">Select company checklist</option>
                      {templates.map((tpl) => (
                        <option key={tpl.id || tpl._id} value={tpl.id || tpl._id}>
                          {tpl.name}
                        </option>
                      ))}
                    </select>
                    {form.checklist.length > 0 && (
                      <div className="mt-2 text-xs text-slate-500">{form.checklist.length} checklist item(s) attached.</div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Technician</label>
                    <select
                      name="assignedTo"
                      value={form.assignedTo}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl glass-input px-3 py-2"
                    >
                      <option value="">Select company technician</option>
                      {filteredTechnicians.map((tech) => (
                        <option key={tech.id || tech._id} value={tech.id || tech._id}>
                          {tech.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
                This request will use your company’s checklist, asset, and technician data.
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
                    <p className="text-xs uppercase tracking-wider text-slate-500">Property</p>
                    <p className="font-semibold text-slate-800">{selectedProperty?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Asset</p>
                    <p className="font-semibold text-slate-800">{selectedAsset?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Location</p>
                    <p className="font-semibold text-slate-800">{form.location || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Checklist</p>
                    <p className="font-semibold text-slate-800">{selectedTemplate?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Technician</p>
                    <p className="font-semibold text-slate-800">{selectedTechnician?.name || '—'}</p>
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
                  <li>Your request is logged against the selected company property or asset.</li>
                  <li>The selected checklist travels with the request.</li>
                  <li>The team sees updates in Requests and Work Orders.</li>
                </ul>
              </div>
            </aside>
          )}
        </div>
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
