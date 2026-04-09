import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const formatMoney = (amount) => new Intl.NumberFormat('en-RW', {
  style: 'currency',
  currency: 'RWF',
  maximumFractionDigits: 0,
}).format(Number(amount || 0));

export default function PublicPurchaseOrder() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [responseNote, setResponseNote] = useState('');
  const [responding, setResponding] = useState(false);
  const [editableItems, setEditableItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/purchase-orders/public/${token}`);
        if (!mounted) return;
        setPurchaseOrder(res.data || null);
        setEditableItems(Array.isArray(res.data?.items) ? res.data.items.map((item) => ({
          ...item,
          unitCost: Number(item?.unitCost || 0),
        })) : []);
        setError('');
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.error || 'Failed to load purchase order.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 px-6 py-20 text-center text-gray-500">Loading purchase order...</div>;
  }

  if (error || !purchaseOrder) {
    return <div className="min-h-screen bg-slate-50 px-6 py-20 text-center text-rose-600">{error || 'Purchase order not found.'}</div>;
  }

  const items = Array.isArray(purchaseOrder.items) ? purchaseOrder.items : [];
  const vendorAlreadyResponded = ['APPROVED', 'DECLINED'].includes(String(purchaseOrder.vendorResponse || purchaseOrder.status || '').toUpperCase());
  const totalCost = (vendorAlreadyResponded ? items : editableItems).reduce(
    (sum, item) => sum + ((Number(item?.quantity || 0) || 0) * (Number(item?.unitCost || 0) || 0)),
    0
  );

  const updateItemCost = (index, value) => {
    setEditableItems((current) => current.map((item, itemIndex) => (
      itemIndex === index
        ? { ...item, unitCost: Math.max(0, Number(value || 0)) }
        : item
    )));
  };

  const handleVendorResponse = async (response) => {
    try {
      setResponding(true);
      const res = await api.post(`/api/purchase-orders/public/${token}/respond`, {
        response,
        note: responseNote,
        items: editableItems.map((item) => ({
          name: item?.name || 'Item',
          quantity: Number(item?.quantity || 0) || 0,
          unitCost: Number(item?.unitCost || 0) || 0,
          partId: item?.partId || undefined,
          notes: item?.notes || '',
        })),
      });
      setPurchaseOrder(res.data || null);
      setEditableItems(Array.isArray(res.data?.items) ? res.data.items.map((item) => ({
        ...item,
        unitCost: Number(item?.unitCost || 0),
      })) : []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit purchase order response.');
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-8 py-8">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Public Purchase Order</div>
          <h1 className="mt-3 text-4xl font-black text-gray-900">{purchaseOrder.title || 'Purchase Order'}</h1>
          <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-500">
            <div><span className="font-semibold text-gray-700">PO Number:</span> {purchaseOrder.poNumber || '—'}</div>
            <div><span className="font-semibold text-gray-700">Status:</span> {purchaseOrder.status || 'Draft'}</div>
            <div><span className="font-semibold text-gray-700">Vendor:</span> {purchaseOrder.vendorDetails?.name || purchaseOrder.vendor || '—'}</div>
            <div><span className="font-semibold text-gray-700">Company:</span> {purchaseOrder.companyName || '—'}</div>
          </div>
        </div>

        <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Items</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Unit Cost</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(vendorAlreadyResponded ? items : editableItems).map((item, index) => (
                    <tr key={`${item.name}-${index}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{item.name || 'Item'}</div>
                        {item.notes && <div className="mt-1 text-xs text-gray-500">{item.notes}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{Number(item.quantity || 0)}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {vendorAlreadyResponded ? (
                          formatMoney(item.unitCost)
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">RWF</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={Number(item.unitCost || 0)}
                              onChange={(e) => updateItemCost(index, e.target.value)}
                              className="w-28 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatMoney((Number(item.quantity || 0) * Number(item.unitCost || 0)))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-sm font-semibold text-gray-500">Expected Date</div>
              <div className="mt-2 text-base font-bold text-gray-900">
                {purchaseOrder.expectedDate ? new Date(purchaseOrder.expectedDate).toLocaleDateString() : 'Not set'}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-sm font-semibold text-gray-500">Notes</div>
              <div className="mt-2 text-sm text-gray-700">{purchaseOrder.notes || 'No additional notes.'}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="text-sm font-semibold text-gray-500">Vendor Response</div>
              {vendorAlreadyResponded ? (
                <div className="mt-3 space-y-2">
                  <div className="text-base font-bold text-gray-900">{purchaseOrder.vendorResponse || purchaseOrder.status}</div>
                  {purchaseOrder.vendorResponseAt ? (
                    <div className="text-sm text-gray-500">Responded on {new Date(purchaseOrder.vendorResponseAt).toLocaleString()}</div>
                  ) : null}
                  {purchaseOrder.vendorResponseNote ? (
                    <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{purchaseOrder.vendorResponseNote}</div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <textarea
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    placeholder="Add a note for the requester"
                    className="min-h-[96px] w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={responding}
                      onClick={() => handleVendorResponse('APPROVED')}
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {responding ? 'Saving...' : 'Approve Purchase Order'}
                    </button>
                    <button
                      type="button"
                      disabled={responding}
                      onClick={() => handleVendorResponse('DECLINED')}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="text-sm font-semibold text-emerald-700">Total Cost</div>
              <div className="mt-2 text-3xl font-black text-emerald-900">{formatMoney(totalCost)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
