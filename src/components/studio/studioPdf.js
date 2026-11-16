// Builds a PDF from a Studio report layout (Report Designer) and a record.
import { jsPDF } from 'jspdf';

const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex || ''));
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [27, 37, 89];
};
const text = (v) => {
  if (v === undefined || v === null || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.length ? v.map(text).join(', ') : '—';
  if (typeof v === 'object') return v.name || v.title || v.url || '—';
  return String(v);
};
const date = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};
const money = (n) => (Number(n) ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—');
const ref = (r) => `#${String(r?.id || r?._id || '').slice(-6).toUpperCase()}`;
const titleCase = (s) => String(s || '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// What each section shows, per record type. Returns { rows } / { paragraph } / { list } / { table }.
function sectionContent(key, target, record, ctx) {
  const r = record || {};
  if (key === 'summary') {
    if (target === 'asset') {
      return { rows: [['Name', r.name], ['Serial number', r.serialNumber], ['Type', r.type], ['Model', r.identifiers?.model || r.model],
        ['Manufacturer', r.identifiers?.manufacturer || r.manufacturer], ['Category', r.identifiers?.category || r.category], ['Status', r.status]] };
    }
    return { rows: [['Reference', ref(r)], ['Title', r.title], ['Status', titleCase(r.status || 'Open')], ['Priority', titleCase(r.priority || 'Medium')],
      ['Created', date(r.createdAt)], ['Due', date(r.fixDeadline || r.dueDate)]] };
  }
  if (key === 'location') {
    if (target === 'asset') return { rows: [['Location', ctx.locationLabel || r.location?.name || r.location], ['Building', r.location?.building || r.building], ['Room', r.location?.room || r.room]] };
    return { rows: [['Location', r.property?.name || r.location], ['Asset', r.asset?.name || r.assetName], ['Category', r.category]] };
  }
  if (key === 'people') return { rows: [['Requested by', r.requestorName || r.name || r.email], ['Assigned to', ctx.assigneeName]] };
  if (key === 'description') return { paragraph: r.description || 'No description provided.' };
  if (key === 'checklist') {
    const items = [...(Array.isArray(r.checklist) ? r.checklist : []), ...(Array.isArray(r.tasks) ? r.tasks : [])]
      .map((c) => ({ done: Boolean(c?.completed || c?.done || String(c?.status || '').toLowerCase() === 'done'), label: c?.text || c?.title || c?.name || '' }))
      .filter((c) => c.label);
    return { list: items.length ? items : [{ done: false, label: 'No checklist items.' }] };
  }
  if (key === 'costs') return { rows: [['Labor', money(r.laborCost)], ['Parts', money(r.partsCost)], ['Other', money(r.otherCost)], ['Total', money(r.totalCost)]] };
  if (key === 'custom_fields') {
    const rows = (ctx.fields || []).map((f) => [f.label, f.type === 'date' ? date(ctx.values?.[f.key]) : text(ctx.values?.[f.key])]);
    return rows.length ? { rows } : { paragraph: 'No additional details.' };
  }
  if (key === 'work_history') {
    const rows = (ctx.workOrders || []).slice(0, 25).map((w) => [ref(w), w.title || '—', titleCase(w.status || 'Open'), date(w.createdAt)]);
    return rows.length ? { table: { head: ['Ref', 'Title', 'Status', 'Created'], rows } } : { paragraph: 'No maintenance history yet.' };
  }
  if (key === 'signatures') return { signatures: ctx.signatures?.length ? ctx.signatures : ['Signature'] };
  return null;
}

const SECTION_TITLES = {
  summary: 'Summary', location: 'Location', people: 'People', description: 'Description', checklist: 'Checklist',
  costs: 'Costs', custom_fields: 'Additional details', work_history: 'Maintenance history', signatures: 'Sign-off',
};

export function buildReportPdf({ definition, target, record, values = {}, fields = [], companyName = '', assigneeName = '', workOrders = [], locationLabel = '' }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 15;
  const accent = hexToRgb(definition?.accent);
  let y = 0;

  // Header band
  doc.setFillColor(...accent);
  doc.rect(0, 0, W, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(String(definition?.title || 'Report'), M, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const subtitle = target === 'asset' ? String(record?.name || '') : `${ref(record)}  ${record?.title || ''}`;
  doc.text(doc.splitTextToSize(subtitle, W - 2 * M - 50)[0] || '', M, 22);
  if (definition?.showCompany !== false && companyName) doc.text(String(companyName), W - M, 14, { align: 'right' });
  doc.text(`Generated ${date(new Date())}`, W - M, 22, { align: 'right' });
  y = 40;

  const ensure = (h) => {
    if (y + h > H - 18) { doc.addPage(); y = 18; }
  };
  const ctx = { values, fields, assigneeName, workOrders, locationLabel, signatures: definition?.signatures };

  (definition?.sections || []).filter((s) => s.enabled).forEach((s) => {
    const content = sectionContent(s.key, target, record, ctx);
    if (!content) return;
    ensure(14);
    doc.setTextColor(...accent);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(SECTION_TITLES[s.key] || s.key, M, y);
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.4);
    doc.line(M, y + 1.5, W - M, y + 1.5);
    y += 8;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);

    if (content.rows) {
      content.rows.forEach(([label, value]) => {
        const lines = doc.splitTextToSize(text(value), W - 2 * M - 55);
        ensure(lines.length * 5 + 2);
        doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 100, 100);
        doc.text(String(label), M, y);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
        doc.text(lines, M + 55, y);
        y += lines.length * 5 + 1.5;
      });
    }
    if (content.paragraph) {
      doc.setFont('helvetica', 'normal');
      doc.splitTextToSize(String(content.paragraph), W - 2 * M).forEach((line) => { ensure(5); doc.text(line, M, y); y += 5; });
    }
    if (content.list) {
      content.list.forEach((item) => {
        const lines = doc.splitTextToSize(item.label, W - 2 * M - 8);
        ensure(lines.length * 5 + 1);
        doc.rect(M, y - 3.2, 3.5, 3.5);
        if (item.done) { doc.setFont('helvetica', 'bold'); doc.text('x', M + 0.8, y - 0.2); }
        doc.setFont('helvetica', 'normal');
        doc.text(lines, M + 7, y);
        y += lines.length * 5 + 1;
      });
    }
    if (content.table) {
      const cols = [22, 88, 35, 35];
      ensure(8);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 100, 100);
      let x = M;
      content.table.head.forEach((h, i) => { doc.text(h, x, y); x += cols[i]; });
      y += 5;
      doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
      content.table.rows.forEach((row) => {
        ensure(6);
        x = M;
        row.forEach((cell, i) => { doc.text(doc.splitTextToSize(String(cell), cols[i] - 2)[0] || '', x, y); x += cols[i]; });
        y += 5.5;
      });
    }
    if (content.signatures) {
      ensure(22);
      const width = (W - 2 * M - (content.signatures.length - 1) * 10) / content.signatures.length;
      content.signatures.forEach((label, i) => {
        const x = M + i * (width + 10);
        doc.setDrawColor(120, 120, 120);
        doc.line(x, y + 12, x + width, y + 12);
        doc.setTextColor(100, 100, 100);
        doc.text(`${label} — name, signature & date`, x, y + 17);
      });
      y += 24;
    }
    y += 5;
  });

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    if (definition?.footer) doc.text(doc.splitTextToSize(String(definition.footer), W - 2 * M - 30)[0], M, H - 8);
    doc.text(`Page ${p} of ${pages}`, W - M, H - 8, { align: 'right' });
  }
  return doc;
}

export function downloadReportPdf(args, fileName) {
  const doc = buildReportPdf(args);
  doc.save(fileName || `${String(args?.definition?.title || 'report').replace(/[^\w-]+/g, '-')}.pdf`);
}

export const SAMPLE_RECORDS = {
  work_order: { id: '64aa00000000000003f9a2c', title: 'Pump leaking – Block A', status: 'IN PROGRESS', priority: 'HIGH', createdAt: new Date(), fixDeadline: new Date(Date.now() + 2 * 86400000),
    location: 'Block A', assetName: 'Water Pump 2', category: 'Plumbing', name: 'Olivier', description: 'Water is leaking from the pump seal. Replace the seal and test the pressure.',
    checklist: [{ text: 'Isolate the pump', completed: true }, { text: 'Replace mechanical seal', completed: false }, { text: 'Test pressure', completed: false }],
    laborCost: 120, partsCost: 45, totalCost: 165 },
  request: { id: '64aa0000000000000b71c0e', title: 'Broken window – Reception', status: 'PENDING', priority: 'MEDIUM', createdAt: new Date(), location: 'Reception', name: 'Grace', description: 'The window next to the front desk is cracked.' },
  asset: { id: '64aa00000000000000a55e7', name: 'Generator A', serialNumber: 'GEN-2041', type: 'Generator', model: 'P110', manufacturer: 'Perkins', category: 'Electrical', status: 'Active', location: 'Plant room', description: '110 kVA standby generator.' },
};
export const SAMPLE_WORK_ORDERS = [
  { id: '64aa0000000000000000a001', title: 'Monthly service', status: 'COMPLETED', createdAt: new Date(Date.now() - 30 * 86400000) },
  { id: '64aa0000000000000000a002', title: 'Battery replacement', status: 'COMPLETED', createdAt: new Date(Date.now() - 70 * 86400000) },
];
