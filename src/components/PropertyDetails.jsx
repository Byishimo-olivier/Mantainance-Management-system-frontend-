import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [issues, setIssues] = useState([]);
  const [assets, setAssets] = useState([]);
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIssue, setNewIssue] = useState({ title: '', description: '', tags: '', assetId: '' });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch(e) { setCurrentUser(null); }
    }
    fetchAll();
    // eslint-disable-next-line
  }, [id]);

  async function fetchAll() {
    setLoading(true);
    try {
      const p = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties/${id}`);
      setProperty(p.data || null);

      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/issues');
      const all = res.data || [];
      const filtered = all.filter(i => {
        if (!i) return false;
        const loc = (i.location || i.address || '').toString().toLowerCase();
        return (p.data && (p.data.name || '').toString().toLowerCase() && loc.includes((p.data.name || '').toString().toLowerCase())) ||
               (p.data && (p.data.address || '').toString().toLowerCase() && loc.includes((p.data.address || '').toString().toLowerCase()));
      });
      setIssues(filtered);

      // assets
      try {
        const ares = await axios.get(`${import.meta.env.VITE_API_URL}/api/assets?propertyId=${id}`);
        setAssets(ares.data || []);
      } catch (e) {
        const allA = await axios.get(import.meta.env.VITE_API_URL + '/api/assets');
        setAssets((allA.data || []).filter(a => String(a.propertyId) === String(id) || String(a.property?._id) === String(id)));
      }

      // for assignment
      try {
        const tr = await axios.get(import.meta.env.VITE_API_URL + '/api/technicians/for-assignment');
        setTechs(tr.data || []);
      } catch (e) {
        setTechs([]);
      }

    } catch (err) {
      console.error('Failed to load property details', err);
      setProperty(null);
      setIssues([]);
      setAssets([]);
      setTechs([]);
    }
    setLoading(false);
  }

  async function submitIssue(e) {
    e.preventDefault();
    if (!property) return;
    // Try to get the property owner's userId (clientId or userId)
    let userId = property.clientId || property.userId || (property.user && (property.user.id || property.user._id));
    if (!userId && property.owner) {
      userId = property.owner.id || property.owner._id;
    }
    const payload = {
      title: newIssue.title,
      description: newIssue.description,
      tags: newIssue.tags ? newIssue.tags.split(',').map(t => t.trim()) : [],
      location: property.name,
      address: property.address,
      assetId: newIssue.assetId || undefined,
      propertyId: property.id || property._id,
      userId: userId || undefined,
    };
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/issues', payload);
      setNewIssue({ title: '', description: '', tags: '', assetId: '' });
      await fetchAll();
    } catch (e) {
      console.error('Failed to create issue', e);
      alert('Failed to create issue');
    }
  }

  async function approve(issueId) {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/issues/${issueId}/approve`);
      await fetchAll();
    } catch (e) { console.error(e); alert('Approve failed'); }
  }

  async function decline(issueId) {
    try {
      const reason = prompt('Decline reason (optional)');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/issues/${issueId}/decline`, { reason });
      await fetchAll();
    } catch (e) { console.error(e); alert('Decline failed'); }
  }

  async function assignInternal(issueId, techId) {
    try {
      if (!techId) return;
      await axios.post(`${import.meta.env.VITE_API_URL}/api/issues/${issueId}/assign`, { techId });
      await fetchAll();
    } catch (e) { console.error(e); alert('Assign failed'); }
  }

  async function assignExternal(issueId) {
    const name = prompt('External technician name or contact:');
    if (!name) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/issues/${issueId}`, { assignedTo: name, status: 'ASSIGNED' });
      await fetchAll();
    } catch (e) { console.error(e); alert('Assign failed'); }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!property) return <div className="p-6">Property not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{property.name}</h1>
            <div className="text-sm text-gray-600">{property.address}</div>
          </div>
          <div>
            <button className="px-3 py-1 bg-gray-100 rounded mr-2" onClick={() => navigate('/properties')}>Back</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => navigate('/')}>Home</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-2">Reported Issues</h2>
            {issues.length === 0 ? (
              <div className="text-gray-600">No issues reported for this property.</div>
            ) : (
              <div className="space-y-3">
                {issues.map(it => (
                  <div key={it.id || it._id} className="border p-3 rounded">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{it.title}</div>
                        <div className="text-sm text-gray-600">{it.description}</div>
                        <div className="text-xs text-gray-500 mt-1">Tags: {(it.tags||[]).join(', ')}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">Status: {it.status || 'PENDING'}</div>
                        <div className="text-sm mt-2">{it.approved ? 'Approved' : it.rejected ? 'Declined' : 'Awaiting'}</div>
                      </div>
                    </div>

                    {(currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.id === it.userId || currentUser._id === it.userId)) && (
                      <div className="mt-3 flex gap-2">
                        {!it.approved && <button className="px-3 py-1 bg-green-100 text-green-700 rounded" onClick={() => approve(it.id||it._id)}>Approve</button>}
                        {!it.rejected && <button className="px-3 py-1 bg-red-100 text-red-700 rounded" onClick={() => decline(it.id||it._id)}>Decline</button>}

                        <select className="border rounded px-2 py-1" onChange={e => assignInternal(it.id||it._id, e.target.value)}>
                          <option value="">Assign internal...</option>
                          {techs.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>)}
                        </select>
                        <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => assignExternal(it.id||it._id)}>Assign External</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Create New Issue</h3>
              <form onSubmit={submitIssue} className="space-y-2">
                <input className="w-full border px-3 py-2 rounded" placeholder="Title" value={newIssue.title} onChange={e => setNewIssue({...newIssue, title: e.target.value})} required />
                <textarea className="w-full border px-3 py-2 rounded" placeholder="Description" value={newIssue.description} onChange={e => setNewIssue({...newIssue, description: e.target.value})} />
                <input className="w-full border px-3 py-2 rounded" placeholder="Tags (comma separated)" value={newIssue.tags} onChange={e => setNewIssue({...newIssue, tags: e.target.value})} />
                <select className="w-full border px-3 py-2 rounded" value={newIssue.assetId} onChange={e => setNewIssue({...newIssue, assetId: e.target.value})}>
                  <option value="">(Optional) Link to asset</option>
                  {assets.map(a => <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>)}
                </select>
                <div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded">Create Issue</button>
                </div>
              </form>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Assets</h3>
              {assets.length === 0 ? <div className="text-gray-600">No assets</div> : (
                <ul className="space-y-2">
                  {assets.map(a => (
                    <li key={a.id || a._id} className="border rounded p-2">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-sm text-gray-600">{a.type}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
