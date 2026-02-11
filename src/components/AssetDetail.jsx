import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import AssetMapView from './AssetMapView';

export default function AssetDetail({ assetId, onClose, onUpdated }) {
  const [asset, setAsset] = useState(null);
  const [movements, setMovements] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assetId) return;
    setLoading(true);
    (async () => {
      try {
        const res = await api.get(`/api/assets/${assetId}`);
        setAsset(res.data || null);
        const m = await api.get(`/api/assets/${assetId}/movements`);
        setMovements(m.data || []);
        const p = await api.get(`/api/assets/${assetId}/spare-parts`);
        setParts(p.data || []);
      } catch (e) {
        console.error('Failed loading asset detail', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [assetId]);

  if (!assetId) return null;
  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-start justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Asset Detail</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-100 rounded" onClick={onClose}>Close</button>
            <button className="px-3 py-1 bg-blue-900 text-white rounded" onClick={onUpdated}>Refresh</button>
          </div>
        </div>
        {loading ? <div>Loading...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="mb-2"><strong>{asset.name}</strong> <span className="text-sm text-gray-500">({asset.type})</span></div>
              <div className="text-sm text-gray-700 mb-2">Serial: {asset.serialNumber || 'N/A'}</div>
              <div className="text-sm text-gray-700 mb-2">Status: {asset.status || 'N/A'}</div>
              <div className="text-sm text-gray-700 mb-2">Purchase: {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'} Cost: {asset.purchaseCost || 'N/A'}</div>
              <div className="text-sm text-gray-700 mb-2">Current Value: {asset.currentValue || 'N/A'}</div>
              <div className="text-sm text-gray-700 mb-2">Location: {asset.location ? JSON.stringify(asset.location) : 'N/A'}</div>
              <div className="text-sm text-gray-700 mb-2">Identifiers: {asset.identifiers ? JSON.stringify(asset.identifiers) : 'N/A'}</div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Movements</h4>
                {movements.length === 0 ? <div className="text-sm text-gray-500">No movements recorded.</div> : (
                  <ul className="text-sm text-gray-700 list-disc ml-4">
                    {movements.map(m => (
                      <li key={m.id}>{new Date(m.timestamp).toLocaleString()} — {m.notes || 'moved'} by {m.movedBy || 'system'}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <AssetMapView gps={asset.gps} />
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Spare Parts</h4>
                {parts.length === 0 ? <div className="text-sm text-gray-500">No spare parts.</div> : (
                  <ul className="text-sm text-gray-700 list-disc ml-4">
                    {parts.map(p => (
                      <li key={p.id}>{p.name} — {p.quantity} pcs</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
