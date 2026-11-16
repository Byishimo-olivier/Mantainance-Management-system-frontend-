// FixNest Studio: lets company admins shape forms, workflows and automations without a developer.
// Everything is a draft until published; every publish is a version that can be rolled back.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, FileText, GitBranch, History, LayoutTemplate, Plus, RotateCcw, Save, Send, SlidersHorizontal, Trash2, X, Zap } from 'lucide-react';
import { AutomationBuilder, FormBuilder, ReportBuilder, WorkflowBuilder } from './StudioBuilders';
import { FIELD_TARGETS, FIELD_TYPES, FORM_TARGETS, REPORT_TARGETS, TEMPLATES, TRIGGERS, WORKFLOW_TARGETS, errorText, studioApi } from './studioData';

const TABS = [
  { key: 'forms', label: 'Form Builder', icon: LayoutTemplate, hint: 'Create and customize forms for requests, work orders, assets, properties and inspections.' },
  { key: 'workflows', label: 'Workflow Builder', icon: GitBranch, hint: 'Define the stages work goes through, who moves it forward and where approval is needed.' },
  { key: 'automations', label: 'Automations', icon: Zap, hint: 'Send notifications automatically when something happens. Published automations run on their own.' },
  { key: 'fields', label: 'Custom Fields', icon: SlidersHorizontal, hint: 'Add your own fields (serial number, warranty expiry…) to work orders, requests, assets and properties. They appear on each record and in its PDF.' },
  { key: 'reports', label: 'Report Designer', icon: FileText, hint: 'Design the PDF for work orders, requests and assets. Once published, a download button appears on each record.' },
];

const STATE_BADGE = {
  draft: { text: 'Draft', cls: 'bg-slate-100 text-slate-600' },
  changed: { text: 'Unpublished changes', cls: 'bg-amber-100 text-amber-800' },
  published: { text: 'Published', cls: 'bg-emerald-100 text-emerald-700' },
};
const fmt = (d) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '');
const btn = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50';

function Badge({ item }) {
  const b = item.enabled === false && item.kind === 'automation' ? { text: 'Paused', cls: 'bg-slate-200 text-slate-600' } : STATE_BADGE[item.state];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.cls}`}>{b.text}{item.state !== 'draft' && item.enabled !== false ? ` v${item.publishedVersion}` : ''}</span>;
}

function TemplatePicker({ tab, onPick, onClose }) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800">Start from a template</div>
        <button type="button" onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-white" aria-label="Close"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid gap-2">
        {TEMPLATES[tab].map((t) => (
          <button key={t.name} type="button" onClick={() => onPick(t)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:border-indigo-400">
            <div className="text-sm font-semibold text-slate-800">{t.name}</div>
            <div className="text-xs text-slate-500">{t.description || (tab === 'automations' ? TRIGGERS.find((x) => x.value === t.draft.trigger)?.label : '')}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Editor({ tab, item, onSaved, onDeleted, companyName }) {
  const [name, setName] = useState(item.name);
  const [target, setTarget] = useState(item.target);
  const [draft, setDraft] = useState(item.draft || {});
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState(null); // { ok, text }
  const [version, setVersion] = useState('');

  useEffect(() => {
    setName(item.name); setTarget(item.target); setDraft(item.draft || {}); setMessage(null); setVersion('');
  }, [item.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = name !== item.name || target !== item.target || JSON.stringify(draft) !== JSON.stringify(item.draft || {});
  const run = async (label, fn, okText) => {
    setBusy(label); setMessage(null);
    try {
      const saved = await fn();
      if (saved?.id) {
        onSaved(saved);
        if (label !== 'pause') { // adopt the server's cleaned-up copy so "unsaved changes" clears
          setName(saved.name); setTarget(saved.target); setDraft(saved.draft || {});
        }
      }
      if (okText) setMessage({ ok: true, text: okText });
      return saved;
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) });
      return null;
    } finally {
      setBusy('');
    }
  };
  const save = () => run('save', () => studioApi.save(tab, item.id, { name, target, draft }), 'Draft saved. Nothing changes for your team until you publish.');
  const publish = () => run('publish', async () => {
    if (dirty) await studioApi.save(tab, item.id, { name, target, draft });
    return studioApi.publish(tab, item.id);
  }, tab === 'automations' ? 'Published. This automation is now live.' : 'Published. This is now the live version.');
  const rollback = () => {
    if (!version || !window.confirm(`Make version ${version} the live version again? Your current draft will be replaced.`)) return;
    run('rollback', () => studioApi.rollback(tab, item.id, Number(version)), `Rolled back to version ${version}.`);
  };
  const unpublish = () => {
    if (!window.confirm(tab === 'automations' ? 'Stop this automation? It will keep its settings as a draft.' : 'Take this offline? It will keep its settings as a draft.')) return;
    run('unpublish', () => studioApi.unpublish(tab, item.id), 'Taken offline. It is a draft again.');
  };
  const remove = async () => {
    if (!window.confirm(`Delete "${item.name}" and all its versions? This can't be undone.`)) return;
    setBusy('delete');
    try { await studioApi.remove(tab, item.id); onDeleted(item.id); } catch (err) { setMessage({ ok: false, text: errorText(err) }); setBusy(''); }
  };
  const togglePause = () => run('pause', () => studioApi.save(tab, item.id, { enabled: !item.enabled }), item.enabled ? 'Paused. It will not run until you resume it.' : 'Resumed.');

  const targets = { forms: FORM_TARGETS, workflows: WORKFLOW_TARGETS, fields: FIELD_TARGETS, reports: REPORT_TARGETS }[tab] || null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Name"
            className="min-w-0 flex-1 rounded-lg border border-transparent px-2 py-1 text-lg font-bold text-slate-900 hover:border-slate-200 focus:border-indigo-500 focus:outline-none" />
          {targets && (
            <select value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Used for" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-700">
              {targets.map((t) => <option key={t.value} value={t.value}>For: {t.label}</option>)}
            </select>
          )}
          <Badge item={item} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={save} disabled={!dirty || Boolean(busy)} className={`${btn} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}>
            <Save className="h-4 w-4" />{busy === 'save' ? 'Saving…' : 'Save draft'}
          </button>
          <button type="button" onClick={publish} disabled={Boolean(busy) || (!dirty && item.state === 'published')} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
            <Send className="h-4 w-4" />{busy === 'publish' ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mx-4 mt-4 rounded-lg px-3 py-2 text-sm ${message.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'}`}>{message.text}</div>
      )}

      <div className="p-4">
        {tab === 'forms' && <FormBuilder draft={draft} onChange={setDraft} />}
        {tab === 'workflows' && <WorkflowBuilder draft={draft} onChange={setDraft} />}
        {tab === 'automations' && <AutomationBuilder draft={draft} onChange={setDraft} />}
        {tab === 'fields' && <FormBuilder draft={draft} onChange={setDraft} types={FIELD_TYPES.filter((t) => t.value !== 'photo')} />}
        {tab === 'reports' && <ReportBuilder draft={draft} onChange={setDraft} target={target} companyName={companyName} />}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-slate-600">
          <History className="h-4 w-4" />
          {item.versions.length ? (
            <>
              <select value={version} onChange={(e) => setVersion(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1 text-sm" aria-label="Published versions">
                <option value="">Versions ({item.versions.length})</option>
                {[...item.versions].reverse().map((v) => (
                  <option key={v.version} value={v.version}>v{v.version}{v.version === item.publishedVersion ? ' (live)' : ''} · {fmt(v.publishedAt)}{v.publishedBy ? ` · ${v.publishedBy}` : ''}</option>
                ))}
              </select>
              <button type="button" onClick={rollback} disabled={!version || Number(version) === item.publishedVersion || Boolean(busy)} className={`${btn} border border-slate-300 py-1 text-slate-700 hover:bg-slate-50`}>
                <RotateCcw className="h-4 w-4" /> Roll back
              </button>
            </>
          ) : <span>Not published yet</span>}
          {item.updatedAt && <span className="text-xs text-slate-400">Last saved {fmt(item.updatedAt)}{item.updatedBy ? ` by ${item.updatedBy}` : ''}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {tab === 'automations' && item.published && (
            <button type="button" onClick={togglePause} disabled={Boolean(busy)} className={`${btn} border border-slate-300 py-1 text-slate-700 hover:bg-slate-50`}>{item.enabled ? 'Pause' : 'Resume'}</button>
          )}
          {item.published && (
            <button type="button" onClick={unpublish} disabled={Boolean(busy)} className={`${btn} border border-slate-300 py-1 text-slate-700 hover:bg-slate-50`}>Unpublish</button>
          )}
          <button type="button" onClick={remove} disabled={Boolean(busy)} className={`${btn} py-1 text-rose-600 hover:bg-rose-50`}><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </div>
    </div>
  );
}

function ActivityPanel({ refreshKey }) {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    studioApi.activity().then(setRows).catch(() => setRows([]));
  }, [refreshKey]);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><Bell className="h-4 w-4 text-indigo-600" /> Recent automation activity</div>
      {rows === null ? <div className="text-sm text-slate-500">Loading…</div> : !rows.length ? (
        <div className="text-sm text-slate-500">Nothing has run yet. Published automations will show here when they send something.</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.slice(0, 12).map((r) => (
            <li key={r.id} className="flex items-start gap-2 py-2 text-sm">
              <CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 ${r.ok ? 'text-emerald-600' : 'text-rose-600'}`} />
              <div className="min-w-0">
                <div className="font-semibold text-slate-800">{r.automationName}</div>
                <div className="text-xs text-slate-500">{r.summary || 'Ran'} · {fmt(r.at)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function FixNestStudio({ companyName }) {
  const [tab, setTab] = useState('forms');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [picking, setPicking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activityKey, setActivityKey] = useState(0);
  const current = TABS.find((t) => t.key === tab);

  const load = useCallback(async (kind) => {
    setLoading(true); setError('');
    try {
      const list = await studioApi.list(kind);
      setItems(list);
      setSelectedId((prev) => (list.some((i) => i.id === prev) ? prev : list[0]?.id || null));
    } catch (err) {
      setItems([]); setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPicking(false);
    if (!current.soon) load(tab);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = useMemo(() => items.find((i) => i.id === selectedId) || null, [items, selectedId]);
  const create = async (template) => {
    setCreating(true); setError('');
    try {
      const made = await studioApi.create(tab, { name: template.name, description: template.description, target: template.target, draft: template.draft });
      setItems((prev) => [made, ...prev]);
      setSelectedId(made.id);
      setPicking(false);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setCreating(false);
    }
  };
  const onSaved = (saved) => {
    setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
    if (tab === 'automations') setActivityKey((k) => k + 1);
  };
  const onDeleted = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedId(null);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-2xl font-bold text-slate-900">Studio</h2>
        <p className="mt-1 text-sm text-slate-500">
          Customize how FixNest works{companyName ? ` for ${companyName}` : ''}, with no developer needed. Changes stay in draft until you publish, and every published version can be rolled back.
        </p>
        <div className="mt-4 flex flex-wrap gap-2" role="tablist">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold ${tab === t.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                <Icon className="h-4 w-4" /> {t.label}
                {t.soon && <span className={`rounded-full px-1.5 text-[10px] ${tab === t.key ? 'bg-white/20' : 'bg-white text-slate-500'}`}>Soon</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">{current.hint}</p>
      </div>

      {current.soon ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <current.icon className="mx-auto h-8 w-8 text-slate-400" />
          <div className="mt-2 text-lg font-bold text-slate-800">{current.label} is coming next</div>
          <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">{current.hint} It will use the same draft, publish and rollback steps as the other Studio modules.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="space-y-3">
            <button type="button" onClick={() => setPicking((v) => !v)} disabled={creating}
              className={`${btn} w-full justify-center bg-indigo-600 text-white hover:bg-indigo-700`}>
              <Plus className="h-4 w-4" /> {creating ? 'Creating…' : `New ${{ forms: 'form', workflows: 'workflow', automations: 'automation', fields: 'field set', reports: 'report' }[tab]}`}
            </button>
            {picking && <TemplatePicker tab={tab} onPick={create} onClose={() => setPicking(false)} />}
            {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
            <div className="rounded-2xl border border-slate-200 bg-white">
              {loading ? <div className="p-4 text-sm text-slate-500">Loading…</div> : !items.length ? (
                <div className="p-4 text-sm text-slate-500">Nothing here yet. Click "New" and pick a template to start.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {items.map((i) => (
                    <li key={i.id}>
                      <button type="button" onClick={() => setSelectedId(i.id)}
                        className={`w-full px-4 py-3 text-left ${i.id === selectedId ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                        <div className="truncate text-sm font-semibold text-slate-800">{i.name}</div>
                        <div className="mt-1 flex items-center gap-2"><Badge item={i} /></div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="min-w-0 space-y-5">
            {selected ? <Editor tab={tab} item={selected} onSaved={onSaved} onDeleted={onDeleted} companyName={companyName} /> : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Select an item on the left, or create a new one.</div>
            )}
            {tab === 'automations' && <ActivityPanel refreshKey={activityKey} />}
          </div>
        </div>
      )}
    </div>
  );
}
