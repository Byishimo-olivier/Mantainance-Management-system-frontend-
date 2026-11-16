// How Studio configurations show up in the rest of the app:
//  - <StudioFormSection> adds the published form / custom fields to a "create" screen
//  - <StudioRecordPanel> shows and edits a record's extra details and offers the published PDF report
import React, { useCallback, useEffect, useState } from 'react';
import { Download, Pencil, Save, SlidersHorizontal, X } from 'lucide-react';
import api from '../../api/axios';
import { downloadReportPdf } from './studioPdf';

// ---------- runtime config (cached briefly) ----------
const cache = new Map();
export function loadStudioRuntime(target) {
  const hit = cache.get(target);
  if (hit && Date.now() - hit.at < 60000) return hit.promise;
  const promise = api.get(`/api/studio/runtime/${target}`).then((r) => r.data).catch(() => ({ fields: [], report: null, workflow: null }));
  cache.set(target, { at: Date.now(), promise });
  return promise;
}
export function useStudioRuntime(target) {
  const [runtime, setRuntime] = useState(null);
  useEffect(() => {
    let alive = true;
    if (target) loadStudioRuntime(target).then((r) => alive && setRuntime(r));
    return () => { alive = false; };
  }, [target]);
  return runtime;
}

const ISSUE_TARGETS = new Set(['request', 'work_order']);
const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const isEmpty = (v) => v === undefined || v === null || v === '' || v === false;

export function StudioFieldInputs({ fields, values, onChange, target, disabled = false }) {
  const set = (key, value) => onChange({ ...values, [key]: value });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
          {f.type !== 'checkbox' && (
            <label htmlFor={`studio-${f.key}`} className="mb-1 block text-sm font-medium text-gray-800">
              {f.label}{f.required && <span className="text-rose-500"> *</span>}
            </label>
          )}
          {f.type === 'textarea' && <textarea id={`studio-${f.key}`} rows={3} className={inputCls} disabled={disabled} value={values[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} />}
          {f.type === 'select' && (
            <select id={`studio-${f.key}`} className={inputCls} disabled={disabled} value={values[f.key] || ''} onChange={(e) => set(f.key, e.target.value)}>
              <option value="">Choose…</option>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {f.type === 'checkbox' && (
            <label className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gray-800">
              <input type="checkbox" disabled={disabled} checked={Boolean(values[f.key])} onChange={(e) => set(f.key, e.target.checked)} />
              {f.label}{f.required && <span className="text-rose-500"> *</span>}
            </label>
          )}
          {f.type === 'photo' && (ISSUE_TARGETS.has(target) ? (
            <input id={`studio-${f.key}`} type="file" accept="image/*" disabled={disabled} className="block w-full text-sm text-gray-600"
              onChange={(e) => set(f.key, e.target.files?.[0] || null)} />
          ) : <div className="text-xs text-gray-500">Photos can be added from the record's Files once it is saved.</div>)}
          {['text', 'number', 'date', 'email', 'phone'].includes(f.type) && (
            <input id={`studio-${f.key}`} className={inputCls} disabled={disabled} type={f.type === 'phone' ? 'tel' : f.type}
              value={values[f.key] ?? ''} onChange={(e) => set(f.key, f.type === 'number' && e.target.value !== '' ? Number(e.target.value) : e.target.value)} placeholder={f.placeholder} />
          )}
          {f.help && <div className="mt-1 text-xs text-gray-500">{f.help}</div>}
        </div>
      ))}
    </div>
  );
}

// ---------- create screens ----------
// Each create screen registers its pending answers under a key; its save handler commits them
// once the new record has an id.
const pending = {};

export function StudioFormSection({ target, storeKey, recordId = null, title = 'Additional information' }) {
  const runtime = useStudioRuntime(target);
  const [values, setValues] = useState({});
  const fields = runtime?.fields || [];

  useEffect(() => {
    if (!recordId) return undefined;
    let alive = true;
    api.get(`/api/studio/values/${target}/${recordId}`).then((r) => alive && setValues(r.data?.values || {})).catch(() => {});
    return () => { alive = false; };
  }, [target, recordId]);
  useEffect(() => { pending[storeKey] = { target, fields, values }; }, [storeKey, target, fields, values]);
  useEffect(() => () => { delete pending[storeKey]; }, [storeKey]);

  if (!fields.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
        <SlidersHorizontal className="h-4 w-4 text-indigo-600" /> {title}
        {runtime?.form && <span className="text-xs font-normal text-gray-500">({runtime.form.name})</span>}
      </div>
      <StudioFieldInputs fields={fields} values={values} onChange={setValues} target={target} />
    </div>
  );
}

export function missingStudioFields(storeKey) {
  const p = pending[storeKey];
  if (!p) return [];
  return p.fields.filter((f) => f.required && f.type !== 'photo' && isEmpty(p.values[f.key])).map((f) => f.label);
}

const findUploadedUrl = (data, name) => {
  const list = Array.isArray(data) ? data : Array.isArray(data?.files) ? data.files : [];
  const hit = [...list].reverse().find((x) => x?.name === name && x?.url) || [...list].reverse().find((x) => x?.url);
  return hit ? { url: hit.url, name: hit.name || name } : null;
};

// Save the pending answers for a newly created (or edited) record. Never throws.
export async function commitStudioValues(storeKey, recordId) {
  const p = pending[storeKey];
  if (!p || !recordId || !p.fields.length) return { ok: true };
  try {
    const values = { ...p.values };
    for (const f of p.fields.filter((x) => x.type === 'photo')) {
      const file = values[f.key];
      delete values[f.key];
      if (file instanceof File && ISSUE_TARGETS.has(p.target)) {
        const fd = new FormData();
        fd.append('files', file, file.name);
        const res = await api.post(`/api/issues/${recordId}/files`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        const uploaded = findUploadedUrl(res.data, file.name);
        if (uploaded) values[f.key] = uploaded;
      }
    }
    await api.put(`/api/studio/values/${p.target}/${recordId}`, { values });
    return { ok: true };
  } catch (err) {
    console.warn('Studio values were not saved', err);
    return { ok: false, error: err?.response?.data?.error || err.message };
  }
}

// ---------- record screens ----------
const display = (f, v) => {
  if (isEmpty(v)) return f.type === 'checkbox' ? 'No' : '—';
  if (f.type === 'checkbox') return 'Yes';
  if (f.type === 'photo') return v?.url ? <a href={v.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{v.name || 'View photo'}</a> : '—';
  if (f.type === 'date') { const d = new Date(v); return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(); }
  return String(v);
};

export function StudioRecordPanel({ target, recordId, record, companyName = '', assigneeName = '', workOrders = [], locationLabel = '' }) {
  const runtime = useStudioRuntime(target);
  const [values, setValues] = useState({});
  const [draft, setDraft] = useState({});
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(() => {
    if (!recordId) return;
    api.get(`/api/studio/values/${target}/${recordId}`).then((r) => setValues(r.data?.values || {})).catch(() => setValues({}));
  }, [target, recordId]);
  useEffect(() => { load(); setEditing(false); setMessage(null); }, [load]);

  const fields = (runtime?.fields || []).filter((f) => f.type !== 'photo' || values[f.key]);
  const report = runtime?.report;
  if (!runtime || (!fields.length && !report)) return null;

  const save = async () => {
    setBusy(true); setMessage(null);
    try {
      const res = await api.put(`/api/studio/values/${target}/${recordId}`, { values: draft });
      setValues(res.data?.values || draft);
      setEditing(false);
      setMessage({ ok: true, text: 'Saved.' });
    } catch (err) {
      setMessage({ ok: false, text: err?.response?.data?.error || err.message });
    } finally {
      setBusy(false);
    }
  };
  const download = () => downloadReportPdf({
    definition: report.definition, target, record, values, fields: runtime.fields.filter((f) => f.type !== 'photo'),
    companyName, assigneeName, workOrders, locationLabel,
  }, `${report.name.replace(/[^\w-]+/g, '-')}-${String(recordId).slice(-6)}.pdf`);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-base font-bold text-gray-900"><SlidersHorizontal className="h-4 w-4 text-indigo-600" /> Additional details</div>
        <div className="flex flex-wrap gap-2">
          {report && (
            <button type="button" onClick={download} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" /> {report.name} (PDF)
            </button>
          )}
          {fields.length > 0 && !editing && (
            <button type="button" onClick={() => { setDraft(values); setEditing(true); setMessage(null); }} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>
      </div>
      {message && <div className={`mb-3 rounded-lg px-3 py-2 text-xs ${message.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{message.text}</div>}
      {!fields.length ? (
        <div className="text-sm text-gray-500">No custom fields for this record type yet.</div>
      ) : editing ? (
        <>
          <StudioFieldInputs fields={fields.filter((f) => f.type !== 'photo')} values={draft} onChange={setDraft} target={target} disabled={busy} />
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Save className="h-3.5 w-3.5" /> {busy ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setEditing(false)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"><X className="h-3.5 w-3.5" /> Cancel</button>
          </div>
        </>
      ) : (
        <div className="grid gap-x-6 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5">
              <span className="text-sm font-semibold text-gray-500">{f.label}</span>
              <span className="max-w-[60%] text-right text-sm text-gray-900">{display(f, values[f.key])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
