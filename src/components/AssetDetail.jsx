import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import AssetMapView from './AssetMapView';

export default function AssetDetail({ assetId, onClose, onUpdated }) {
  const [asset, setAsset] = useState(null);
  const [movements, setMovements] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

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
            <button
              className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded shadow-sm hover:shadow-indigo-200 transition-all flex items-center gap-1"
              onClick={async () => {
                try {
                  setPredicting(true);
                  const res = await api.post(`/api/ai/predict-maintenance/${assetId}`);
                  setPrediction(res.data);
                } catch (e) {
                  console.error('AI Prediction failed', e);
                  alert('AI Prediction failed: ' + (e.response?.data?.message || e.message));
                } finally {
                  setPredicting(false);
                }
              }}
              disabled={predicting}
            >
              {predicting ? '✨ Predicting...' : '✨ AI Forecast'}
            </button>
            <button className="px-3 py-1 bg-gray-100 rounded" onClick={onClose}>Close</button>
            <button className="px-3 py-1 bg-blue-900 text-white rounded" onClick={onUpdated}>Refresh</button>
          </div>
        </div>
        {prediction && (
          <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl animate-fadeIn">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold">
              <span>✨ AI Maintenance Forecast</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${prediction.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                  prediction.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}>
                {prediction.riskLevel} Risk
              </span>
            </div>
            <div className="text-sm text-gray-800">
              <p><strong>Predicted Next Maintenance:</strong> {prediction.predictedDate}</p>
              <p className="mt-1 italic">"{prediction.reasoning}"</p>
            </div>
          </div>
        )}
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
