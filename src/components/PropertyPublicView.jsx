import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function PropertyPublicView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch(e) { setCurrentUser(null); }
    }
    fetch();
    // eslint-disable-next-line
  }, [id]);

  async function fetch() {
    setLoading(true);
    try {
      const p = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties/${id}`);
      setProperty(p.data || null);
      // fetch issues and filter by property name/address
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/issues');
      const all = res.data || [];
      const filtered = all.filter(i => {
        if (!i) return false;
        const loc = (i.location || i.address || '').toString().toLowerCase();
        return (p.data && ((p.data.name || '').toString().toLowerCase() && loc.includes((p.data.name || '').toString().toLowerCase()))) ||
               (p.data && ((p.data.address || '').toString().toLowerCase() && loc.includes((p.data.address || '').toString().toLowerCase())));
      });
      setIssues(filtered);
    } catch (err) {
      console.error('Failed to load property view', err);
      setProperty(null);
      setIssues([]);
    }
    setLoading(false);
  }

  async function approve(issueId) {
    try {
      await axios.post(`/api/issues/${issueId}/approve`);
      await fetch();
    } catch (e) { console.error(e); alert('Approve failed'); }
  }

  async function decline(issueId) {
    try {
      const reason = prompt('Reason for decline (optional)');
      await axios.post(`/api/issues/${issueId}/decline`, { reason });
      await fetch();
    } catch (e) { console.error(e); alert('Decline failed'); }
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
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => navigate('/')}>Back</button>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-3">Reported Issues</h2>
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

                {/* Approve/Decline available to admins/managers or owner accounts */}
                {(currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.id === it.userId || currentUser._id === it.userId)) && (
                  <div className="mt-3 flex gap-2">
                    {!it.approved && <button className="px-3 py-1 bg-green-100 text-green-700 rounded" onClick={() => approve(it.id||it._id)}>Approve</button>}
                    {!it.rejected && <button className="px-3 py-1 bg-red-100 text-red-700 rounded" onClick={() => decline(it.id||it._id)}>Decline</button>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
