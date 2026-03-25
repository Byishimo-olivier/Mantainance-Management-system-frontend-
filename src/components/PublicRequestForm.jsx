import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { WorkOrderForm } from './WorkOrder';

export default function PublicRequestForm() {
  const { companySlug } = useParams();
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchContext = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/api/users/public-request-link/${companySlug}`);
        if (!active) return;
        setContext(response.data || null);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.error || 'Failed to load public request form.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchContext();
    return () => {
      active = false;
    };
  }, [companySlug]);

  const cardClass = useMemo(
    () => 'mx-auto w-full max-w-6xl rounded-[28px] border border-white/70 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur',
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_35%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_48%,#eef2ff_100%)] px-4 py-10">
        <div className={cardClass}>
          <div className="px-8 py-12 text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">Public Request Portal</div>
            <div className="mt-4 text-2xl font-bold text-slate-900">Loading company request form...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !context) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_35%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_48%,#eef2ff_100%)] px-4 py-10">
        <div className={cardClass}>
          <div className="px-8 py-12 text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-700">Public Request Portal</div>
            <div className="mt-4 text-2xl font-bold text-slate-900">This request link is unavailable.</div>
            <p className="mt-3 text-sm text-slate-600">{error || 'The company request link could not be found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.15),_transparent_26%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_48%,#eef2ff_100%)] px-4 py-8">
      <div className={cardClass}>
        <div className="border-b border-slate-200/80 px-8 py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">Public Request Portal</div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">{context.companyName}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Submit a maintenance request directly to this company without creating an account.
                The company information is already attached to this form.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-5 py-4 text-sm text-blue-900">
              <div className="font-bold">No login required</div>
              <div className="mt-1 text-blue-800">
                Requests from this page notify the company administrators and managers automatically.
              </div>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="px-8 py-12">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-8 py-10 text-center">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Request Sent</div>
              <div className="mt-3 text-3xl font-black text-slate-900">Your request was submitted successfully.</div>
              <p className="mt-3 text-sm text-slate-600">
                The {context.companyName} team has been notified and will review it from their dashboard.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <div className="px-8 py-8">
            <WorkOrderForm
              submitLabel="Submit Public Request"
              onSubmitted={() => setSubmitted(true)}
              onCancel={null}
              showSidebar={false}
              disableAutoLoad
              publicCompanySlug={context.companySlug}
              checklistTemplates={context.checklistTemplates || []}
              companyProperties={context.properties || []}
              companyAssets={context.assets || []}
              companyTechnicians={context.internalTechnicians || []}
            />
          </div>
        )}

        <div className="border-t border-slate-200/80 px-8 py-5 text-xs text-slate-500">
          Managed by {context.companyName}. If you received this link in error, contact the company directly.
          <span className="ml-2">
            <Link to="/" className="font-semibold text-blue-700 hover:text-blue-800">Back to homepage</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
