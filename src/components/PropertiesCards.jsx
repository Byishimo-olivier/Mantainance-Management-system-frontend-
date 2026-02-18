import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function PropertiesCards() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Auth header handled by interceptor
    fetchProperties();
  }, []);

  async function fetchProperties() {
    setLoading(true);
    try {
      const res = await api.get('/api/properties');
      const data = res.data;
      if (Array.isArray(data)) setProperties(data);
      else if (data && Array.isArray(data.data)) setProperties(data.data);
      else if (data && Array.isArray(data.properties)) setProperties(data.properties);
      else setProperties(data || []);
    } catch (e) {
      console.error('Failed to load properties', e);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Properties</h1>
          <div>
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => navigate('/')}>Home</button>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(properties) ? properties : []).map(p => {
              const pid = p.id || p._id;
              return (
                <div key={pid || Math.random()} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-semibold text-lg">{p.name}</h2>
                      <div className="text-sm text-gray-600 mt-1">{p.address}</div>
                      {p.owner && <div className="text-sm text-gray-700 mt-2">Owner: {p.owner}</div>}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => { if (pid) navigate(`/property-details/${pid}`); else alert('Property id missing'); }}>
                      View Details
                    </button>
                    <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => { if (pid) navigate(`/property/${pid}`); else alert('Property id missing'); }}>
                      Public View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
