import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle, Clock, FileText, RefreshCw, Search, Send, ShieldCheck, TrendingUp } from 'lucide-react';
import api from '../api/axios';

const statusColors = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  quoted: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  trial: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  lost: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-50 text-slate-700 border-slate-200',
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || 'pending').toLowerCase();
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${statusColors[normalized] || statusColors.pending}`}>
      {normalized.replace(/_/g, ' ')}
    </span>
  );
};

const SummaryCard = ({ title, value, helper, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: { gradient: 'from-blue-50 to-cyan-50', text: 'text-blue-700', iconBg: 'bg-blue-100' },
    amber: { gradient: 'from-amber-50 to-orange-50', text: 'text-amber-700', iconBg: 'bg-amber-100' },
    emerald: { gradient: 'from-emerald-50 to-teal-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
    purple: { gradient: 'from-purple-50 to-violet-50', text: 'text-purple-700', iconBg: 'bg-purple-100' },
  };
  const selected = colors[color] || colors.blue;

  return (
    <div className={`rounded-xl border border-white/70 bg-gradient-to-br ${selected.gradient} p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
          <p className={`mt-2 text-3xl font-black ${selected.text}`}>{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{helper}</p>
        </div>
        <div className={`rounded-lg ${selected.iconBg} p-3 ${selected.text}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const SelectStatus = ({ value, options, onChange }) => (
  <select
    value={value || 'pending'}
    onChange={(event) => onChange(event.target.value)}
    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
  >
    {options.map((option) => (
      <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
    ))}
  </select>
);

export default function AdminGrowthPanel() {
  const [demoRequests, setDemoRequests] = useState([]);
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [trialCompanies, setTrialCompanies] = useState([]);
  const [activeView, setActiveView] = useState('demo');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [extensionForms, setExtensionForms] = useState({});
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [demoRes, quoteRes, trialRes] = await Promise.all([
        api.get('/demo-requests'),
        api.get('/quote-requests'),
        api.get('/subscriptions/trial/companies'),
      ]);

      setDemoRequests(demoRes.data?.data || []);
      setQuoteRequests(quoteRes.data?.data || []);
      setTrialCompanies(trialRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load sales requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDemoRequests = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return demoRequests;
    return demoRequests.filter((item) => `${item.firstName} ${item.lastName} ${item.email} ${item.companyName} ${item.phone}`.toLowerCase().includes(term));
  }, [demoRequests, search]);

  const filteredQuoteRequests = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return quoteRequests;
    return quoteRequests.filter((item) => `${item.requesterName} ${item.requesterEmail} ${item.companyName} ${item.plan}`.toLowerCase().includes(term));
  }, [quoteRequests, search]);

  const filteredTrialCompanies = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return trialCompanies;
    return trialCompanies.filter((item) => `${item.name} ${item.email} ${item.subscriptionStatus} ${item.subscriptionPlan}`.toLowerCase().includes(term));
  }, [trialCompanies, search]);

  const pendingDemoCount = demoRequests.filter((item) => item.status === 'pending').length;
  const pendingQuoteCount = quoteRequests.filter((item) => item.status === 'pending').length;
  const expiringTrialCount = trialCompanies.filter((item) => Number(item.trialDaysRemaining || 0) <= 7 && item.onFreeTrial).length;

  const updateDemoStatus = async (id, status) => {
    setSavingId(id);
    try {
      const response = await api.patch(`/demo-requests/${id}/status`, { status });
      const updated = response.data?.data;
      setDemoRequests((current) => current.map((item) => String(item._id) === String(id) ? { ...item, ...updated } : item));
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to update demo request');
    } finally {
      setSavingId('');
    }
  };

  const updateQuoteStatus = async (id, status) => {
    setSavingId(id);
    try {
      const response = await api.patch(`/quote-requests/${id}/status`, { status });
      const updated = response.data?.data;
      setQuoteRequests((current) => current.map((item) => String(item._id) === String(id) ? { ...item, ...updated } : item));
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to update quote request');
    } finally {
      setSavingId('');
    }
  };

  const setExtensionValue = (companyId, key, value) => {
    setExtensionForms((current) => ({
      ...current,
      [companyId]: {
        ...(current[companyId] || { extensionDays: '30', reason: '' }),
        [key]: value,
      },
    }));
  };

  const extendTrial = async (companyId) => {
    const form = extensionForms[companyId] || { extensionDays: '30', reason: '' };
    const extensionDays = Number(form.extensionDays || 0);
    if (!extensionDays || extensionDays < 1) {
      alert('Enter extension days first.');
      return;
    }

    setSavingId(companyId);
    try {
      await api.post(`/subscriptions/trial/companies/${companyId}/extend`, {
        extensionDays,
        reason: form.reason,
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to extend trial');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/50 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Sales operations</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Demo Requests, Quotes, and Trial Extensions</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Track incoming demo requests, subscription quote interest, and extend free trials for companies that need more evaluation time.
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard title="Demo requests" value={demoRequests.length} helper={`${pendingDemoCount} pending`} icon={Send} color="blue" />
          <SummaryCard title="Quote requests" value={quoteRequests.length} helper={`${pendingQuoteCount} pending`} icon={FileText} color="purple" />
          <SummaryCard title="Trial companies" value={trialCompanies.length} helper={`${expiringTrialCount} expiring soon`} icon={CalendarClock} color="amber" />
          <SummaryCard title="Active trials" value={trialCompanies.filter((item) => item.onFreeTrial).length} helper="Currently evaluating" icon={ShieldCheck} color="emerald" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/50 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'demo', label: 'Demo Requests', count: demoRequests.length },
              { id: 'quotes', label: 'Quote Requests', count: quoteRequests.length },
              { id: 'trials', label: 'Trial Extensions', count: trialCompanies.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${activeView === tab.id ? 'border-blue-200 bg-blue-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {tab.label} <span className="ml-1 opacity-75">{tab.count}</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search company, email, person..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 lg:w-80"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>
      ) : null}

      {activeView === 'demo' && (
        <div className="grid grid-cols-1 gap-4">
          {filteredDemoRequests.map((request) => (
            <div key={request._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-slate-950">{request.firstName} {request.lastName}</h3>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{request.companyName}</p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <span>Email: <strong className="text-slate-900">{request.email}</strong></span>
                    <span>Phone: <strong className="text-slate-900">{request.phone}</strong></span>
                    <span>Industry: <strong className="text-slate-900">{request.industry || 'Not provided'}</strong></span>
                    <span>Size: <strong className="text-slate-900">{request.companySize || 'Not provided'}</strong></span>
                  </div>
                  {request.maintenanceChallenge ? <p className="mt-3 text-sm leading-6 text-slate-600">{request.maintenanceChallenge}</p> : null}
                  <p className="mt-3 text-xs font-semibold text-slate-400">Submitted {formatDateTime(request.createdAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SelectStatus
                    value={request.status}
                    options={['pending', 'scheduled', 'completed', 'cancelled']}
                    onChange={(status) => updateDemoStatus(request._id, status)}
                  />
                  {savingId === request._id ? <Clock className="h-4 w-4 animate-spin text-blue-600" /> : <CheckCircle className="h-4 w-4 text-slate-300" />}
                </div>
              </div>
            </div>
          ))}
          {!filteredDemoRequests.length ? <EmptyState label="No demo requests found." /> : null}
        </div>
      )}

      {activeView === 'quotes' && (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuoteRequests.map((request) => (
            <div key={request._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-slate-950">{request.companyName}</h3>
                    <StatusBadge status={request.status} />
                    <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-bold capitalize text-purple-700">{request.plan}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    {request.requesterName || 'Unknown requester'} - {request.requesterEmail}
                  </p>
                  {request.message ? <p className="mt-3 text-sm leading-6 text-slate-600">{request.message}</p> : null}
                  <p className="mt-3 text-xs font-semibold text-slate-400">Submitted {formatDateTime(request.createdAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SelectStatus
                    value={request.status}
                    options={['pending', 'contacted', 'quoted', 'won', 'lost', 'cancelled']}
                    onChange={(status) => updateQuoteStatus(request._id, status)}
                  />
                  {savingId === request._id ? <Clock className="h-4 w-4 animate-spin text-blue-600" /> : <TrendingUp className="h-4 w-4 text-slate-300" />}
                </div>
              </div>
            </div>
          ))}
          {!filteredQuoteRequests.length ? <EmptyState label="No quote requests found." /> : null}
        </div>
      )}

      {activeView === 'trials' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Trial Status</th>
                  <th className="px-4 py-3">Trial Ends</th>
                  <th className="px-4 py-3">Remaining</th>
                  <th className="px-4 py-3">Extend</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrialCompanies.map((company) => {
                  const form = extensionForms[company.id] || { extensionDays: '30', reason: '' };
                  return (
                    <tr key={company.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-950">{company.name}</div>
                        <div className="text-xs text-slate-500">{company.email || 'No email'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={company.onFreeTrial ? 'trial' : company.subscriptionStatus || 'inactive'} />
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">{formatDate(company.trialEndDate)}</td>
                      <td className="px-4 py-4 text-sm font-black text-slate-900">{company.trialDaysRemaining || 0} days</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <select
                            value={form.extensionDays}
                            onChange={(event) => setExtensionValue(company.id, 'extensionDays', event.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="7">7 days</option>
                            <option value="14">14 days</option>
                            <option value="30">1 month</option>
                            <option value="60">2 months</option>
                            <option value="90">3 months</option>
                            <option value="180">6 months</option>
                          </select>
                          <input
                            value={form.reason}
                            onChange={(event) => setExtensionValue(company.id, 'reason', event.target.value)}
                            placeholder="Reason, optional"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </td>
                      {/* Free Staff Invite Privilege Toggle */}
                      <td className="px-4 py-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!company.allowFreeStaffInvites}
                            onChange={async (e) => {
                              setSavingId(company.id);
                              try {
                                await api.patch(`/subscriptions/company/${company.id}/free-staff-invites`, {
                                  allowFreeStaffInvites: e.target.checked
                                });
                                await loadData();
                              } catch (err) {
                                alert(err.response?.data?.error || err.message || 'Failed to update privilege');
                              } finally {
                                setSavingId('');
                              }
                            }}
                            disabled={savingId === company.id}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-semibold text-slate-700">Free Staff Invite</span>
                          {savingId === company.id && <span className="ml-2 text-blue-500 animate-pulse">Saving...</span>}
                        </label>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => extendTrial(company.id)}
                          disabled={savingId === company.id}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          <CalendarClock className="h-4 w-4" />
                          {savingId === company.id ? 'Extending...' : 'Extend trial'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!filteredTrialCompanies.length ? <EmptyState label="No trial companies found." /> : null}
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm font-semibold text-slate-500">
      {label}
    </div>
  );
}
