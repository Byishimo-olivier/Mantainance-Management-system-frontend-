// Shared pieces for the assistant chats (floating chatbot + dashboard Intelligence tab).
import React, { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import api from '../../api/axios';

// The assistant's name as users see it. Change it here to rename it everywhere in the app.
export const ASSISTANT_NAME = 'Over';

// Messages that the server-side assistant should answer (data questions and commands), so the
// local "how do I create…" shortcuts must not intercept them.
const SERVER_MESSAGE = /\b(show|list|which|how many|how much|assign|reassign|mark|change|set|update|close|complete|start|pause|put|spend|spent|costs?|report|overdue|pending|fail\w*|broke\w*|breakdowns?|status|create|raise|log|submit|leak\w*|pms?|preventi?ve|routine|schedule|every|#[0-9a-f]{6,})\b/i;
const HOW_TO = /^(how\s+(do|can|to|should)|where\s+(do|can)|can\s+i|could\s+i)\b/i;
export const isAssistantCommand = (text) => !HOW_TO.test(String(text || '').trim()) && SERVER_MESSAGE.test(String(text || ''));

// The only calls a confirmation card may make. Anything else the server sends is ignored.
const RECORD_FIELDS = new Set(['title', 'location', 'priority', 'description', 'category', 'assetId', 'assetName']);
const PM_FIELDS = new Set(['name', 'workOrderTitle', 'workOrderDescription', 'description', 'priority', 'category', 'scheduleType',
  'calendarRule', 'date', 'time', 'routine', 'status', 'assignedTo', 'assignedToName', 'technicianUserId', 'assignees',
  'woAssignees', 'employees', 'assetsRows', 'block']);
const ALLOWED = [
  { method: 'PUT', url: /^\/api\/issues\/[a-f0-9]{24}$/i },                       // change status
  { method: 'POST', url: /^\/api\/issues\/[a-f0-9]{24}\/assign$/i },              // assign
  { method: 'POST', url: /^\/api\/issues$/i, upload: 'photos', optionalUpload: true, fields: RECORD_FIELDS }, // create
  { method: 'PUT', url: /^\/api\/issues\/\{created\}$/, exactBody: { approved: true, status: 'APPROVED' } }, // make it a work order
  { method: 'POST', url: /^\/api\/issues\/[a-f0-9]{24}\/files$/i, upload: 'files' }, // attach a photo
  { method: 'POST', url: /^\/api\/maintenance-schedules$/i, fields: PM_FIELDS },     // create a preventive maintenance
];
const FORM_FIELDS = new Set(['title', 'location', 'priority', 'description', 'category']);
const MAX_REQUESTS = 50;
const isAllowedRequest = (req) => Boolean(req) && ALLOWED.some((rule) => {
  if (rule.method !== String(req.method || '').toUpperCase() || !rule.url.test(String(req.url || ''))) return false;
  if (req.upload ? req.upload.field !== rule.upload : rule.upload && !rule.optionalUpload) return false;
  if (rule.fields && req.body && !Object.keys(req.body).every((k) => rule.fields.has(k))) return false;
  if (rule.exactBody && JSON.stringify(req.body || {}) !== JSON.stringify(rule.exactBody)) return false;
  if (req.form && !(Array.isArray(req.form) && req.form.every((f) => FORM_FIELDS.has(f?.name)))) return false;
  return true;
});
// A card holds one call (method/url/body) or several (requests: [...]) done one after another.
const requestsOf = (confirm) => (Array.isArray(confirm?.requests) ? confirm.requests : confirm ? [confirm] : []);
const isAllowedConfirm = (confirm) => {
  const reqs = requestsOf(confirm);
  // "{created}" may only follow a create in the same card
  const createdOk = reqs.every((r, i) => !String(r.url).includes('{created}') || reqs.slice(0, i).some((p) => /^\/api\/issues$/.test(p.url)));
  return reqs.length > 0 && reqs.length <= MAX_REQUESTS && createdOk && reqs.every(isAllowedRequest);
};

// Normalise the /api/ai/chat "response" field into a chat message. `file` is the photo the user
// sent with the message, kept in the browser until they confirm.
export const toAssistantMessage = (response, { file = null } = {}) => {
  if (typeof response === 'string') return { role: 'model', content: response };
  if (response?.kind === 'confirm' && isAllowedConfirm(response.confirm)) {
    const usesPhoto = requestsOf(response.confirm).some((r) => r.upload);
    return { role: 'model', kind: 'confirm', content: response.content, confirm: response.confirm, file: usesPhoto ? file : null };
  }
  if (response?.kind === 'need_details') {
    // The assistant asked what's wrong; the chat keeps the photo for the user's answer.
    return { role: 'model', content: response.content, keepPhoto: true };
  }
  if (response?.kind === 'action' && response.action) {
    return { role: 'model', kind: 'action', content: response.content, action: response.action };
  }
  return { role: 'model', content: response?.content || 'No response received.' };
};

// Split "intro\n\n| a | b |\n| --- | --- |\n| 1 | 2 |" into text and table parts.
const splitTable = (content) => {
  const lines = String(content || '').split(/\r?\n/);
  const start = lines.findIndex((line, i) => line.trim().startsWith('|') && /^\|\s*---/.test((lines[i + 1] || '').trim()));
  if (start < 0) return null;
  let end = start + 2;
  while (end < lines.length && lines[end].trim().startsWith('|')) end += 1;
  const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  return {
    before: lines.slice(0, start).join('\n').trim(),
    headers: cells(lines[start]),
    rows: lines.slice(start + 2, end).map(cells),
    after: lines.slice(end).join('\n').trim(),
  };
};

export function AssistantText({ content }) {
  const parsed = splitTable(content);
  if (!parsed) return <div className="whitespace-pre-wrap">{content}</div>;
  return (
    <div className="space-y-3">
      {parsed.before && <div className="whitespace-pre-wrap">{parsed.before}</div>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full border-collapse text-xs">
          <thead className="bg-slate-100">
            <tr>{parsed.headers.map((h) => <th key={h} className="px-3 py-2 text-left font-semibold text-slate-700">{h}</th>)}</tr>
          </thead>
          <tbody>
            {parsed.rows.map((row, r) => (
              <tr key={r} className="border-t border-slate-100 even:bg-slate-50">
                {parsed.headers.map((_, c) => <td key={c} className="whitespace-nowrap px-3 py-2 text-slate-600">{row[c] || '-'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {parsed.after && <div className="whitespace-pre-wrap">{parsed.after}</div>}
    </div>
  );
}

// "Assign #A1B2C5 to John?" with Confirm / Cancel. Nothing changes until the user confirms, and the
// change goes through the normal protected issue routes (company ownership and role checks).
export function AssistantConfirmCard({ message, onDone }) {
  const [state, setState] = useState('pending'); // pending | running | done | cancelled | failed
  const [error, setError] = useState('');
  const { confirm } = message;
  const [progress, setProgress] = useState('');
  const [values, setValues] = useState(() => Object.fromEntries((confirm.form || []).map((f) => [f.name, f.value || ''])));
  const photoUrl = useMemo(() => (message.file ? URL.createObjectURL(message.file) : null), [message.file]);
  const needsPhoto = requestsOf(confirm).some((r) => r.upload && r.upload.field !== 'photos') && !message.file;
  const missing = (confirm.form || []).filter((f) => f.required && !String(values[f.name] || '').trim()).map((f) => f.label);

  const buildData = (req) => {
    if (!req.upload || !message.file) return req.form ? { ...(req.body || {}), ...values } : req.body;
    const data = new FormData();
    Object.entries({ ...(req.body || {}), ...values }).forEach(([key, value]) => data.append(key, String(value)));
    data.append(req.upload.field, message.file, message.file.name || 'photo.jpg');
    return data;
  };

  const run = async () => {
    if (!isAllowedConfirm(confirm) || state !== 'pending' || needsPhoto || missing.length) return;
    const reqs = requestsOf(confirm);
    setState('running');
    let ok = 0;
    const failures = [];
    // One at a time, so every record goes through the normal checks and the server isn't flooded.
    let createdId = null;
    for (const req of reqs) {
      try {
        if (req.url.includes('{created}') && !createdId) throw new Error('the new record id was not returned');
        const url = req.url.replace('{created}', createdId || '');
        const res = await api.request({ method: req.method, url, data: buildData(req) });
        if (/^\/api\/issues$/.test(req.url)) createdId = res?.data?.id || res?.data?._id || res?.data?.issue?.id || null;
        ok += 1;
      } catch (err) {
        failures.push(err?.response?.data?.error || err?.response?.data?.message || err?.message || 'failed');
      }
      if (reqs.length > 1) setProgress(`${ok + failures.length} of ${reqs.length}`);
    }
    if (!failures.length) {
      setState('done');
    } else {
      setError(reqs.length > 1
        ? `${ok} of ${reqs.length} changed, ${failures.length} failed (${failures[0]}).`
        : failures[0]);
      setState('failed');
    }
    if (ok) onDone?.();
  };

  return (
    <div className="space-y-3">
      <div className="font-medium text-slate-800"><AssistantText content={message.content} /></div>
      {photoUrl && <img src={photoUrl} alt="Your photo" className="max-h-40 rounded-xl border border-slate-200 object-contain" />}
      {needsPhoto && <div className="text-xs font-medium text-rose-600">The photo is no longer available. Please send it again.</div>}
      {Array.isArray(confirm.form) && confirm.form.length > 0 && (
        <div className="grid gap-2">
          {confirm.form.map((f) => {
            const common = {
              id: `mia-${f.name}`,
              value: values[f.name] || '',
              disabled: state !== 'pending',
              onChange: (e) => setValues((prev) => ({ ...prev, [f.name]: e.target.value })),
              className: 'w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none',
            };
            return (
              <label key={f.name} htmlFor={common.id} className="grid gap-1 text-[11px] font-semibold text-slate-600">
                {f.label}{f.required ? ' *' : ''}
                {f.options ? (
                  <select {...common}>{f.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>
                ) : f.multiline ? (
                  <textarea rows={3} {...common} placeholder="What's wrong? e.g. Water leaking under the pump" />
                ) : (
                  <input type="text" {...common} placeholder={f.name === 'location' ? 'e.g. Block A, ground floor' : ''} />
                )}
              </label>
            );
          })}
        </div>
      )}
      {state === 'pending' && missing.length > 0 && (
        <div className="text-[11px] text-slate-500">Please fill in: {missing.join(', ')}</div>
      )}
      {state === 'pending' || state === 'running' ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={run}
            disabled={state === 'running' || needsPhoto || missing.length > 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" />
            {state === 'running' ? `Saving…${progress ? ` ${progress}` : ''}` : confirm.label || 'Confirm'}
          </button>
          <button
            type="button"
            onClick={() => setState('cancelled')}
            disabled={state === 'running'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      ) : (
        <div className={`text-xs font-semibold ${state === 'done' ? 'text-emerald-700' : state === 'failed' ? 'text-rose-700' : 'text-slate-500'}`}>
          {state === 'done' && (confirm.successMessage || 'Done.')}
          {state === 'cancelled' && 'Cancelled. Nothing was changed.'}
          {state === 'failed' && (requestsOf(confirm).length > 1 ? error : `Not changed: ${error}`)}
        </div>
      )}
    </div>
  );
}
