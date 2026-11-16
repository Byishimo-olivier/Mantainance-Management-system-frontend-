// The three Studio editors. Each edits a plain "draft" object and shows a live preview.
import React from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Download, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import {
  CHANNELS, FIELD_TYPES, PLACEHOLDERS, RECIPIENTS, REPORT_SECTION_LABELS, ROLES, STATUSES, TRIGGERS, fillSample,
} from './studioData';
import { SAMPLE_RECORDS, SAMPLE_WORK_ORDERS, downloadReportPdf } from './studioPdf';

const input = 'w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none';
const small = 'rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30';
const label = 'mb-1 block text-xs font-semibold text-slate-600';

const move = (list, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function RowTools({ index, count, onMove, onRemove }) {
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" className={small} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
      <button type="button" className={small} disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
      <button type="button" className={`${small} hover:text-rose-600`} onClick={onRemove} aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

// ---------------- Form builder ----------------
export function FormBuilder({ draft, onChange, types = FIELD_TYPES }) {
  const fields = draft.fields || [];
  const set = (next) => onChange({ ...draft, fields: next });
  const update = (i, patch) => set(fields.map((f, k) => (k === i ? { ...f, ...patch } : f)));
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <div className="space-y-3">
        {fields.map((f, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <input className={input} value={f.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Field label" aria-label="Field label" />
                <select className={input} value={f.type} onChange={(e) => update(i, { type: e.target.value })} aria-label="Field type">
                  {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <RowTools index={i} count={fields.length} onMove={(d) => set(move(fields, i, d))} onRemove={() => set(fields.filter((_, k) => k !== i))} />
            </div>
            {f.type === 'select' && (
              <input className={`${input} mt-2`} value={(f.options || []).join(', ')} onChange={(e) => update(i, { options: e.target.value.split(',').map((o) => o.trimStart()) })}
                placeholder="Options, separated by commas (e.g. Good, Fair, Poor)" aria-label="Dropdown options" />
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input className={`${input} min-w-0 flex-1`} value={f.help || ''} onChange={(e) => update(i, { help: e.target.value })} placeholder="Help text (optional)" aria-label="Help text" />
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <input type="checkbox" checked={Boolean(f.required)} onChange={(e) => update(i, { required: e.target.checked })} /> Required
              </label>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => set([...fields, { label: '', type: 'text', required: false, help: '', options: [] }])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-400 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <Plus className="h-4 w-4" /> Add field
        </button>
      </div>
      <FormPreview fields={fields} />
    </div>
  );
}

export function FormPreview({ fields }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Preview</div>
      {!fields.length && <div className="text-sm text-slate-500">Add a field to see the form.</div>}
      <div className="space-y-3">
        {fields.map((f, i) => (
          <div key={i}>
            {f.type !== 'checkbox' && <span className={label}>{f.label || 'Untitled field'}{f.required ? ' *' : ''}</span>}
            {f.type === 'textarea' && <textarea rows={3} className={input} placeholder={f.placeholder} />}
            {f.type === 'select' && (
              <select className={input} defaultValue="">
                <option value="" disabled>Choose…</option>
                {(f.options || []).filter(Boolean).map((o) => <option key={o}>{o}</option>)}
              </select>
            )}
            {f.type === 'checkbox' && <label className="inline-flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" /> {f.label || 'Untitled field'}{f.required ? ' *' : ''}</label>}
            {f.type === 'photo' && <div className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-500">📷 Take or upload a photo</div>}
            {['text', 'number', 'date', 'email', 'phone'].includes(f.type) && (
              <input className={input} type={f.type === 'phone' ? 'tel' : f.type} placeholder={f.placeholder} />
            )}
            {f.help && <div className="mt-1 text-[11px] text-slate-500">{f.help}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Workflow builder ----------------
function RoleChips({ value = [], onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {ROLES.map((r) => {
        const on = value.includes(r.value);
        return (
          <button key={r.value} type="button" onClick={() => onChange(on ? value.filter((v) => v !== r.value) : [...value, r.value])}
            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${on ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

export function WorkflowBuilder({ draft, onChange }) {
  const stages = draft.stages || [];
  const set = (next) => onChange({ ...draft, stages: next });
  const update = (i, patch) => set(stages.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-4">
      <WorkflowPreview stages={stages} />
      <div className="space-y-3">
        {stages.map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{i + 1}</span>
              <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <input className={input} value={s.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Stage name" aria-label="Stage name" />
                <select className={input} value={s.status} onChange={(e) => update(i, { status: e.target.value })} aria-label="Status at this stage">
                  {STATUSES.map((st) => <option key={st} value={st}>Status: {st.charAt(0) + st.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <RowTools index={i} count={stages.length} onMove={(d) => set(move(stages, i, d))} onRemove={() => set(stages.filter((_, k) => k !== i))} />
            </div>
            <div className="mt-2 grid gap-2 pl-8 sm:grid-cols-2">
              <div><span className={label}>Who can complete this stage</span><RoleChips value={s.roles} onChange={(roles) => update(i, { roles })} /></div>
              <div><span className={label}>Notify when it starts</span><RoleChips value={s.notifyRoles} onChange={(notifyRoles) => update(i, { notifyRoles })} /></div>
            </div>
            <label className="mt-2 inline-flex items-center gap-1.5 pl-8 text-xs font-semibold text-slate-600">
              <input type="checkbox" checked={Boolean(s.requiresApproval)} onChange={(e) => update(i, { requiresApproval: e.target.checked })} /> Needs approval before moving on
            </label>
          </div>
        ))}
        <button type="button" onClick={() => set([...stages, { name: '', status: 'OPEN', roles: [], requiresApproval: false, notifyRoles: [] }])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-400 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <Plus className="h-4 w-4" /> Add stage
        </button>
      </div>
    </div>
  );
}

export function WorkflowPreview({ stages }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Preview</div>
      {!stages.length ? <div className="text-sm text-slate-500">Add stages to see the flow.</div> : (
        <div className="flex flex-wrap items-center gap-2">
          {stages.map((s, i) => (
            <React.Fragment key={i}>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
                  {s.name || `Stage ${i + 1}`}
                  {s.requiresApproval && <ShieldCheck className="h-4 w-4 text-amber-600" aria-label="Needs approval" />}
                </div>
                <div className="text-[11px] text-slate-500">{s.status.charAt(0) + s.status.slice(1).toLowerCase()}{s.roles?.length ? ` · ${s.roles.map((r) => ROLES.find((x) => x.value === r)?.label).join(', ')}` : ''}</div>
              </div>
              {i < stages.length - 1 && <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Automation builder ----------------
export function AutomationBuilder({ draft, onChange }) {
  const conditions = draft.conditions || {};
  const actions = draft.actions || [];
  const setCond = (patch) => onChange({ ...draft, conditions: { ...conditions, ...patch } });
  const setActions = (next) => onChange({ ...draft, actions: next });
  const updateAction = (i, patch) => setActions(actions.map((a, k) => (k === i ? { ...a, ...patch } : a)));
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-600">When</div>
        <select className={input} value={draft.trigger || 'issue.created'} onChange={(e) => onChange({ ...draft, trigger: e.target.value })} aria-label="Trigger">
          {TRIGGERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div>
            <span className={label}>Only if priority is</span>
            <select className={input} value={conditions.priority || ''} onChange={(e) => setCond({ priority: e.target.value })}>
              <option value="">Any priority</option>
              {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <span className={label}>Only if category is</span>
            <input className={input} value={conditions.category || ''} onChange={(e) => setCond({ category: e.target.value })} placeholder="Any category" />
          </div>
          {draft.trigger === 'issue.status_changed' && (
            <div>
              <span className={label}>New status</span>
              <select className={input} value={conditions.status || ''} onChange={(e) => setCond({ status: e.target.value })}>
                <option value="">Any status</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
          )}
          {draft.trigger === 'request.pending' && (
            <div>
              <span className={label}>Waiting for at least (hours)</span>
              <input className={input} type="number" min="1" max="720" value={conditions.pendingHours || 24} onChange={(e) => setCond({ pendingHours: Number(e.target.value) })} />
            </div>
          )}
        </div>
        {(draft.trigger === 'issue.overdue' || draft.trigger === 'request.pending') && (
          <div className="mt-2 text-[11px] text-slate-500">Checked every 15 minutes. Each work order gets this reminder once.</div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-600">Then</div>
        <div className="space-y-3">
          {actions.map((a, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-start gap-2">
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <div><span className={label}>Notify</span>
                    <select className={input} value={a.to} onChange={(e) => updateAction(i, { to: e.target.value })}>
                      {RECIPIENTS.map((r) => <option key={r.value} value={r.value}>{r.label.charAt(0).toUpperCase() + r.label.slice(1)}</option>)}
                    </select>
                  </div>
                  <div><span className={label}>By</span>
                    <select className={input} value={a.channel} onChange={(e) => updateAction(i, { channel: e.target.value })}>
                      {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <RowTools index={i} count={actions.length} onMove={(d) => setActions(move(actions, i, d))} onRemove={() => setActions(actions.filter((_, k) => k !== i))} />
              </div>
              <span className={`${label} mt-2`}>Message</span>
              <textarea rows={2} className={input} value={a.message} onChange={(e) => updateAction(i, { message: e.target.value })} />
              <div className="mt-1 flex flex-wrap gap-1">
                {PLACEHOLDERS.map((p) => (
                  <button key={p} type="button" onClick={() => updateAction(i, { message: `${a.message || ''}${a.message?.endsWith(' ') || !a.message ? '' : ' '}${p}` })}
                    className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 hover:bg-slate-200">{p}</button>
                ))}
              </div>
              {a.message && <div className="mt-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-900"><span className="font-semibold">Example: </span>{fillSample(a.message)}</div>}
            </div>
          ))}
          <button type="button" onClick={() => setActions([...actions, { to: 'admins', channel: 'in_app', message: '' }])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-400 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white">
            <Plus className="h-4 w-4" /> Add notification
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Report designer ----------------
const SAMPLE_FIELDS = [
  { key: 'serial_number', label: 'Serial number', type: 'text' },
  { key: 'warranty_expiry', label: 'Warranty expiry', type: 'date' },
];
const SAMPLE_VALUES = { serial_number: 'SN-55120', warranty_expiry: '2027-03-31' };

export function ReportBuilder({ draft, onChange, target, companyName }) {
  const sections = draft.sections || [];
  const set = (patch) => onChange({ ...draft, ...patch });
  const signatures = draft.signatures || [];
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div><span className={label}>Document title</span><input className={input} value={draft.title || ''} onChange={(e) => set({ title: e.target.value })} /></div>
          <div><span className={label}>Colour</span><input type="color" className="h-[34px] w-16 cursor-pointer rounded-lg border border-slate-300" value={draft.accent || '#1b2559'} onChange={(e) => set({ accent: e.target.value })} aria-label="Report colour" /></div>
        </div>
        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <input type="checkbox" checked={draft.showCompany !== false} onChange={(e) => set({ showCompany: e.target.checked })} /> Show company name in the header
        </label>
        <div>
          <span className={label}>Sections (turn on, and order them)</span>
          <div className="space-y-2">
            {sections.map((sec, i) => (
              <div key={sec.key} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${sec.enabled ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-200 bg-slate-50'}`}>
                <input type="checkbox" checked={sec.enabled} onChange={(e) => set({ sections: sections.map((x, k) => (k === i ? { ...x, enabled: e.target.checked } : x)) })} aria-label={`Show ${sec.key}`} />
                <span className={`flex-1 text-sm ${sec.enabled ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{REPORT_SECTION_LABELS[sec.key] || sec.key}</span>
                <button type="button" className={small} disabled={i === 0} onClick={() => set({ sections: move(sections, i, -1) })} aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" className={small} disabled={i === sections.length - 1} onClick={() => set({ sections: move(sections, i, 1) })} aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className={label}>Signature lines (comma separated)</span>
          <input className={input} value={signatures.join(', ')} onChange={(e) => set({ signatures: e.target.value.split(',').map((x) => x.trimStart()) })} placeholder="e.g. Technician, Supervisor" />
        </div>
        <div><span className={label}>Footer text</span><input className={input} value={draft.footer || ''} onChange={(e) => set({ footer: e.target.value })} placeholder="Optional" /></div>
      </div>
      <ReportPreview draft={draft} target={target} companyName={companyName} />
    </div>
  );
}

function ReportPreview({ draft, target, companyName }) {
  const record = SAMPLE_RECORDS[target] || SAMPLE_RECORDS.work_order;
  const on = (draft.sections || []).filter((x) => x.enabled);
  const accent = draft.accent || '#1b2559';
  const download = () => downloadReportPdf({
    definition: { ...draft, signatures: (draft.signatures || []).map((x) => x.trim()).filter(Boolean) }, target, record,
    values: SAMPLE_VALUES, fields: SAMPLE_FIELDS, companyName, assigneeName: 'Brian Kato', workOrders: SAMPLE_WORK_ORDERS, locationLabel: 'Plant room',
  }, 'sample-report.pdf');
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Preview (sample data)</div>
        <button type="button" onClick={download} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <Download className="h-3.5 w-3.5" /> Sample PDF
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between px-4 py-3 text-white" style={{ background: accent }}>
          <div>
            <div className="text-base font-bold">{draft.title || 'Report'}</div>
            <div className="text-[11px] opacity-90">{target === 'asset' ? record.name : `#3F9A2C ${record.title}`}</div>
          </div>
          {draft.showCompany !== false && <div className="text-[11px] opacity-90">{companyName || 'Your company'}</div>}
        </div>
        <div className="space-y-3 px-4 py-3">
          {!on.length && <div className="text-xs text-slate-500">Turn on a section to see it here.</div>}
          {on.map((x) => (
            <div key={x.key}>
              <div className="border-b pb-0.5 text-xs font-bold" style={{ color: accent, borderColor: accent }}>{(REPORT_SECTION_LABELS[x.key] || x.key).split(' (')[0]}</div>
              <div className="mt-1 space-y-1">
                <div className="h-1.5 w-3/4 rounded bg-slate-200" />
                <div className="h-1.5 w-1/2 rounded bg-slate-200" />
              </div>
            </div>
          ))}
          {draft.footer && <div className="border-t pt-2 text-[10px] text-slate-400">{draft.footer}</div>}
        </div>
      </div>
    </div>
  );
}
