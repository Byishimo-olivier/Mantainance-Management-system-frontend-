// API helpers, labels and starter templates for FixNest Studio.
import api from '../../api/axios';

export const studioApi = {
  list: (kind) => api.get(`/api/studio/${kind}`).then((r) => r.data),
  create: (kind, body) => api.post(`/api/studio/${kind}`, body).then((r) => r.data),
  save: (kind, id, body) => api.put(`/api/studio/${kind}/${id}`, body).then((r) => r.data),
  publish: (kind, id) => api.post(`/api/studio/${kind}/${id}/publish`).then((r) => r.data),
  rollback: (kind, id, version) => api.post(`/api/studio/${kind}/${id}/rollback`, { version }).then((r) => r.data),
  unpublish: (kind, id) => api.post(`/api/studio/${kind}/${id}/unpublish`).then((r) => r.data),
  remove: (kind, id) => api.delete(`/api/studio/${kind}/${id}`).then((r) => r.data),
  activity: () => api.get('/api/studio/automations/activity').then((r) => r.data),
};

export const errorText = (err) => err?.response?.data?.error || err?.message || 'Something went wrong.';

export const FORM_TARGETS = [
  { value: 'request', label: 'Maintenance request' },
  { value: 'work_order', label: 'Work order' },
  { value: 'asset', label: 'Asset registration' },
  { value: 'property', label: 'Property registration' },
  { value: 'inspection', label: 'Inspection report' },
];
export const FIELD_TYPES = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'photo', label: 'Photo' },
];
export const WORKFLOW_TARGETS = [
  { value: 'work_order', label: 'Work orders' },
  { value: 'request', label: 'Maintenance requests' },
];
export const STATUSES = ['PENDING', 'APPROVED', 'OPEN', 'IN PROGRESS', 'ON HOLD', 'COMPLETED', 'CLOSED'];
export const ROLES = [
  { value: 'requestor', label: 'Requester' },
  { value: 'client', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'technician', label: 'Technician' },
];
export const TRIGGERS = [
  { value: 'issue.created', label: 'A request or work order is created' },
  { value: 'issue.assigned', label: 'A work order is assigned to someone' },
  { value: 'issue.status_changed', label: 'A work order changes status' },
  { value: 'issue.overdue', label: 'A work order becomes overdue' },
  { value: 'request.pending', label: 'A request waits too long for approval' },
];
export const RECIPIENTS = [
  { value: 'assignee', label: 'the assigned technician' },
  { value: 'admins', label: 'company admins & managers' },
  { value: 'requester', label: 'the person who reported it' },
];
export const CHANNELS = [
  { value: 'in_app', label: 'In-app notification' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'In-app + email' },
];
export const PLACEHOLDERS = ['{ref}', '{title}', '{status}', '{priority}', '{location}', '{category}'];
export const SAMPLE_ISSUE = { ref: '#3F9A2C', title: 'Pump leaking – Block A', status: 'In Progress', priority: 'High', location: 'Block A', category: 'Plumbing' };
export const fillSample = (text) => String(text || '').replace(/\{(\w+)\}/g, (m, k) => SAMPLE_ISSUE[k] ?? m);

const field = (label, type = 'text', extra = {}) => ({ label, type, required: false, placeholder: '', help: '', options: [], ...extra });

export const TEMPLATES = {
  forms: [
    { name: 'Maintenance request form', target: 'request', description: 'What people fill in when they report a problem.', draft: { fields: [
      field('Title', 'text', { required: true, placeholder: 'e.g. Pump leaking in Block A' }),
      field('Location', 'text', { required: true }),
      field('Category', 'select', { options: ['Electrical', 'Plumbing', 'HVAC', 'General'] }),
      field('Describe the problem', 'textarea', { required: true }),
      field('Photo', 'photo'),
      field('Contact phone', 'phone'),
    ] } },
    { name: 'Asset registration', target: 'asset', description: 'Details captured when a new asset is added.', draft: { fields: [
      field('Asset name', 'text', { required: true }),
      field('Serial number', 'text'),
      field('Model', 'text'),
      field('Manufacturer', 'text'),
      field('Purchase date', 'date'),
      field('Warranty expiry', 'date', { help: 'You will be reminded before it expires.' }),
      field('Location', 'text'),
    ] } },
    { name: 'Inspection report', target: 'inspection', description: 'Checklist a technician completes during an inspection.', draft: { fields: [
      field('Inspection date', 'date', { required: true }),
      field('Overall condition', 'select', { required: true, options: ['Good', 'Fair', 'Poor'] }),
      field('Issues found', 'textarea'),
      field('Photo', 'photo'),
      field('Follow-up work needed', 'checkbox'),
    ] } },
    { name: 'Blank form', target: 'work_order', description: '', draft: { fields: [field('New field')] } },
  ],
  workflows: [
    { name: 'Standard maintenance', target: 'work_order', description: 'Request → approval → assignment → repair → inspection → completion.', draft: { stages: [
      { name: 'Maintenance request', status: 'PENDING', roles: ['requestor', 'client'], requiresApproval: false, notifyRoles: ['manager'] },
      { name: 'Manager approval', status: 'APPROVED', roles: ['manager', 'admin'], requiresApproval: true, notifyRoles: [] },
      { name: 'Technician assignment', status: 'OPEN', roles: ['manager', 'admin'], requiresApproval: false, notifyRoles: ['technician'] },
      { name: 'Repair', status: 'IN PROGRESS', roles: ['technician'], requiresApproval: false, notifyRoles: [] },
      { name: 'Inspection', status: 'COMPLETED', roles: ['manager'], requiresApproval: true, notifyRoles: ['manager'] },
      { name: 'Completion', status: 'CLOSED', roles: ['manager', 'admin'], requiresApproval: false, notifyRoles: ['requestor'] },
    ] } },
    { name: 'Simple repair', target: 'work_order', description: 'Open → in progress → completed.', draft: { stages: [
      { name: 'Open', status: 'OPEN', roles: ['manager', 'admin'], requiresApproval: false, notifyRoles: ['technician'] },
      { name: 'In progress', status: 'IN PROGRESS', roles: ['technician'], requiresApproval: false, notifyRoles: [] },
      { name: 'Completed', status: 'COMPLETED', roles: ['technician', 'manager'], requiresApproval: false, notifyRoles: ['requestor'] },
    ] } },
  ],
  automations: [
    { name: 'Notify technician when assigned', description: '', draft: { trigger: 'issue.assigned', conditions: {}, actions: [
      { to: 'assignee', channel: 'both', message: 'You have been assigned {ref} "{title}" at {location} (priority {priority}).' },
    ] } },
    { name: 'Remind managers about pending approvals', description: '', draft: { trigger: 'request.pending', conditions: { pendingHours: 24 }, actions: [
      { to: 'admins', channel: 'in_app', message: 'Request {ref} "{title}" has been waiting for approval for over a day.' },
    ] } },
    { name: 'Overdue work order alert', description: '', draft: { trigger: 'issue.overdue', conditions: {}, actions: [
      { to: 'assignee', channel: 'in_app', message: '{ref} "{title}" is overdue. Please update its status.' },
      { to: 'admins', channel: 'in_app', message: '{ref} "{title}" at {location} is overdue.' },
    ] } },
    { name: 'Tell the requester when work is completed', description: '', draft: { trigger: 'issue.status_changed', conditions: { status: 'COMPLETED' }, actions: [
      { to: 'requester', channel: 'both', message: 'Good news: {ref} "{title}" has been completed.' },
    ] } },
    { name: 'High-priority alert', description: '', draft: { trigger: 'issue.created', conditions: { priority: 'High' }, actions: [
      { to: 'admins', channel: 'both', message: 'New high-priority {ref} "{title}" reported at {location}.' },
    ] } },
  ],
};

// ---------- Custom fields & reports ----------
export const FIELD_TARGETS = [
  { value: 'work_order', label: 'Work orders' },
  { value: 'request', label: 'Requests' },
  { value: 'asset', label: 'Assets' },
  { value: 'property', label: 'Properties' },
];
export const REPORT_TARGETS = [
  { value: 'work_order', label: 'Work order PDF' },
  { value: 'request', label: 'Request PDF' },
  { value: 'asset', label: 'Asset report PDF' },
];
export const REPORT_SECTION_LABELS = {
  summary: 'Summary (reference, status, priority, dates)',
  location: 'Location & asset',
  people: 'Requested by & assigned to',
  description: 'Description',
  checklist: 'Checklist / tasks',
  costs: 'Costs (labor, parts, total)',
  custom_fields: 'Custom fields & form answers',
  work_history: 'Maintenance history',
  signatures: 'Signature lines',
};
export const REPORT_SECTIONS = {
  work_order: ['summary', 'location', 'people', 'description', 'checklist', 'costs', 'custom_fields', 'signatures'],
  request: ['summary', 'location', 'people', 'description', 'custom_fields', 'signatures'],
  asset: ['summary', 'location', 'description', 'custom_fields', 'work_history', 'signatures'],
};
const sections = (target, on) => REPORT_SECTIONS[target].map((key) => ({ key, enabled: on.includes(key) }));

TEMPLATES.fields = [
  { name: 'Asset details', target: 'asset', description: 'Extra information kept on every asset.', draft: { fields: [
    { label: 'Serial number', type: 'text', required: false, help: '', options: [] },
    { label: 'Warranty expiry', type: 'date', required: false, help: '', options: [] },
    { label: 'Supplier', type: 'text', required: false, help: '', options: [] },
    { label: 'Criticality', type: 'select', required: false, help: '', options: ['Low', 'Medium', 'High'] },
  ] } },
  { name: 'Work order details', target: 'work_order', description: 'Extra information on every work order.', draft: { fields: [
    { label: 'Maintenance category', type: 'select', required: false, help: '', options: ['Corrective', 'Preventive', 'Emergency', 'Inspection'] },
    { label: 'Inspection date', type: 'date', required: false, help: '', options: [] },
    { label: 'Downtime (hours)', type: 'number', required: false, help: '', options: [] },
  ] } },
  { name: 'Blank field set', target: 'request', description: '', draft: { fields: [{ label: 'New field', type: 'text', required: false, help: '', options: [] }] } },
];
TEMPLATES.reports = [
  { name: 'Work order sheet', target: 'work_order', description: 'A one-page work order for technicians and sign-off.', draft: {
    title: 'Work Order', accent: '#1b2559', showCompany: true, footer: 'Thank you for keeping our facilities running.',
    signatures: ['Technician', 'Supervisor'], sections: sections('work_order', ['summary', 'location', 'people', 'description', 'checklist', 'costs', 'custom_fields', 'signatures']),
  } },
  { name: 'Asset report', target: 'asset', description: 'Asset details with its maintenance history.', draft: {
    title: 'Asset Report', accent: '#0e9aa7', showCompany: true, footer: '', signatures: [],
    sections: sections('asset', ['summary', 'location', 'description', 'custom_fields', 'work_history']),
  } },
  { name: 'Request summary', target: 'request', description: 'A printable copy of a maintenance request.', draft: {
    title: 'Maintenance Request', accent: '#e8760c', showCompany: true, footer: '', signatures: ['Requested by'],
    sections: sections('request', ['summary', 'location', 'people', 'description', 'custom_fields', 'signatures']),
  } },
];
