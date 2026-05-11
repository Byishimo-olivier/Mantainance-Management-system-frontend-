import React, { useEffect, useMemo, useRef, useState } from "react";
import backgroundVideo from "../assets/136906-765457769_small.mp4";
import api from "../api/axios";
import { getImageUrl } from '../utils/imageUrl';
import { useNavigate } from 'react-router-dom';
import Header from "./Header";
import { useTranslation } from "../i18n/LanguageContext";
import { MessageSquare, Search, ArrowUpDown, LayoutDashboard, SlidersHorizontal, MapPin, Flag, ChevronDown, MoreHorizontal, Image as ImageIcon } from "lucide-react";

const isCompletedStatus = (status) => {
  const normalized = String(status || '').toUpperCase();
  return normalized.includes('COMPLETE') || normalized === 'RESOLVED';
};

const buildMentionHandle = (person) => {
  const emailLocal = String(person?.email || '').split('@')[0].trim().toLowerCase();
  const compactName = String(person?.name || '').replace(/\s+/g, '').toLowerCase();
  return emailLocal || compactName || '';
};

const getMentionContext = (value, cursorPosition = value.length) => {
  const text = String(value || '');
  const safeCursor = typeof cursorPosition === 'number' ? cursorPosition : text.length;
  const beforeCursor = text.slice(0, safeCursor);
  const match = beforeCursor.match(/(^|\\s)@([a-zA-Z0-9._-]*)$/);
  if (!match) return null;
  const rawQuery = match[2] || '';
  const atIndex = beforeCursor.lastIndexOf(`@${rawQuery}`);
  if (atIndex < 0) return null;
  return { query: rawQuery.toLowerCase(), start: atIndex, end: safeCursor };
};

const applyMentionToText = (value, context, person) => {
  if (!context) return String(value || '');
  const handle = buildMentionHandle(person);
  if (!handle) return String(value || '');
  const text = String(value || '');
  return `${text.slice(0, context.start)}@${handle} ${text.slice(context.end)}`;
};

const extractDirectMessageContacts = (job, currentUserId = '') => {
  if (!job) return [];
  const seen = new Set();
  const contacts = [];
  const currentId = String(currentUserId || '');

  const addContact = (raw, sourceLabel = '') => {
    const id = String(
      raw?.recipientUserId ||
      raw?.userId ||
      raw?.requestorId ||
      raw?.id ||
      raw?._id ||
      ''
    ).trim();
    if (!id || id === currentId || seen.has(id)) return;
    seen.add(id);
    contacts.push({
      id,
      name: String(
        raw?.recipientName ||
        raw?.requestorName ||
        raw?.name ||
        raw?.fullName ||
        raw?.userName ||
        raw?.email ||
        'Team member'
      ).trim(),
      email: String(raw?.email || raw?.requestorEmail || '').trim(),
      role: String(raw?.role || raw?.recipientRole || '').trim(),
      sourceLabel
    });
  };

  addContact({
    requestorId: job.requestorId || job.userId,
    requestorName: job.requestorName || job.name || job.createdByName,
    requestorEmail: job.requestorEmail || job.email
  }, 'Requestor');

  addContact(job.requestor, 'Requestor');
  addContact(job.createdBy, 'Created By');
  addContact(job.manager, 'Manager');
  addContact(job.propertyManager, 'Property Manager');

  addContact({
    id: job.createdById,
    name: job.createdByName,
    email: job.createdByEmail,
    role: job.createdByRole
  }, 'Created By');

  addContact({
    id: job.managerId,
    name: job.managerName,
    email: job.managerEmail,
    role: job.managerRole
  }, 'Manager');

  addContact({
    id: job.propertyManagerId,
    name: job.propertyManagerName,
    email: job.propertyManagerEmail,
    role: job.propertyManagerRole
  }, 'Property Manager');

  (Array.isArray(job.assignees) ? job.assignees : []).forEach((entry) => addContact(entry, 'Assignee'));
  (Array.isArray(job.additionalResponsibleWorkers) ? job.additionalResponsibleWorkers : []).forEach((entry) => addContact(entry, 'Team'));

  return contacts;
};

const parseDirectMessageSenderName = (notification) => {
  const title = String(notification?.title || '').trim();
  const match = title.match(/^Private message from\s+(.+)$/i);
  return match?.[1]?.trim() || '';
};

const parseDirectMessageRecipientName = (notification) => {
  const title = String(notification?.title || '').trim();
  const match = title.match(/^Private message to\s+(.+)$/i);
  return match?.[1]?.trim() || '';
};

const getDirectMessageTargetId = (notification) => {
  const rawLink = String(notification?.link || '').trim();
  if (!rawLink) return '';
  try {
    const queryString = rawLink.includes('?') ? rawLink.slice(rawLink.indexOf('?')) : '';
    const params = new URLSearchParams(queryString);
    return String(params.get('dm') || '').trim();
  } catch {
    return '';
  }
};

function TechnicianMessageCenter({
  id,
  textareaId,
  contacts,
  recipientId,
  onRecipientChange,
  onQuickSelect,
  selectedRecipient,
  thread,
  draft,
  onDraftChange,
  onSend,
  sending
}) {
  return (
    <div id={id} className="glass-surface rounded-3xl shadow-lg border border-white/50 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Private Messages</h2>
          <p className="text-sm text-slate-500 mt-1">See the messages you sent and send a new one to people linked to your work orders.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black uppercase">
          {contacts.length} Contacts
        </span>
      </div>
      {contacts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-white/70 bg-white/30 px-4 py-8 text-center text-slate-500">
          No available contacts yet. Open a work order that has a requestor or manager linked to it.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Send To</label>
              <select
                value={recipientId}
                onChange={(e) => onRecipientChange(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/60"
              >
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}{contact.sourceLabel ? ` - ${contact.sourceLabel}` : ''}{contact.role ? ` (${contact.role})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              {contacts.slice(0, 3).map((contact) => (
                <button
                  key={`quick-contact-${contact.id}`}
                  type="button"
                  onClick={() => onQuickSelect(contact)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                    String(recipientId) === String(contact.id)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/80 text-slate-700 hover:bg-white'
                  }`}
                >
                  {contact.name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conversation</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {selectedRecipient?.name || 'Select a contact'}
              </div>
              {selectedRecipient?.sourceLabel && (
                <div className="text-xs text-slate-500">{selectedRecipient.sourceLabel}</div>
              )}
            </div>
            <div className="max-h-[280px] space-y-3 overflow-y-auto px-4 py-4">
              {thread.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
                  <div className="text-sm font-semibold text-slate-700">No sent messages yet</div>
                  <div className="mt-1 text-xs text-slate-500">Send your first private message to start this thread.</div>
                </div>
              ) : (
                thread.map((entry, index) => (
                  <div key={entry.id || index} className={`flex ${entry.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      entry.direction === 'outgoing'
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-900'
                    }`}>
                      <div className={`text-[11px] font-semibold ${entry.direction === 'outgoing' ? 'text-emerald-50' : 'text-slate-500'}`}>
                        {entry.sender || (entry.direction === 'outgoing' ? 'You' : selectedRecipient?.name || 'Contact')}
                      </div>
                      <div className="mt-1 whitespace-pre-wrap text-sm">{entry.text || entry.message}</div>
                      <div className={`mt-2 text-[10px] ${entry.direction === 'outgoing' ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Message</label>
            <textarea
              id={textareaId}
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              rows={5}
              placeholder="Write a private message about the work order, follow-up, or anything only that person should see..."
              className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/60"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              These messages are private. Shared work updates should stay in the work-order comments.
            </div>
            <button
              type="button"
              onClick={onSend}
              disabled={sending || !String(draft || '').trim() || !recipientId}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TechnicianJobMessageActions({ contacts, activeRecipientId, onSelectRecipient }) {
  return (
    <div className="border-t pt-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-700">Private Message</h3>
          <p className="text-xs text-slate-500">Send a direct message to someone linked to this work order.</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
          {contacts.length} people
        </span>
      </div>
      {contacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
          No direct-message contact is linked to this work order yet.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {contacts.map((contact) => (
            <button
              key={`selected-job-contact-${contact.id}`}
              type="button"
              onClick={() => onSelectRecipient(contact)}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                String(activeRecipientId) === String(contact.id)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Message {contact.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// BEFORE EVIDENCE FORM WITH START DETAILS
function BeforeEvidenceForm({ issueId, onSuccess, hasExistingImage }) {
  const [beforeImage, setBeforeImage] = React.useState(null);
  const [address, setAddress] = React.useState("");
  const [fixTime, setFixTime] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBeforeImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    if (beforeImage) formData.append("beforeImage", beforeImage);
    formData.append("address", address);
    formData.append("fixTime", fixTime);
    try {
      const response = await api.post(
        `/api/issues/${issueId}/evidence/before`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setBeforeImage(null);
      setAddress("");
      setFixTime("");
      if (onSuccess) onSuccess();
      alert("Work started! Status set to In Progress.");
      console.log("BEFORE evidence response:", response.data);
    } catch (err) {
      console.error("BEFORE evidence error:", err.response?.data || err.message);
      alert(`Failed to start work: ${err.response?.data?.error || err.message}`);
    }
    setLoading(false);
  };
  return (
    <form className="glass-surface-strong rounded-2xl p-6 max-w-lg mx-auto" onSubmit={handleSubmit}>
      <h2 className="font-bold text-xl mb-4 text-blue-700 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-100/70 text-blue-700 rounded-full flex items-center justify-center text-sm">1</span>
        Start Working
      </h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-semibold text-sm">
          {hasExistingImage ? "Upload new BEFORE photo (optional)" : "Upload BEFORE photo *"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required={!hasExistingImage}
          className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100/70 file:text-blue-700 hover:file:bg-blue-200/80 transition-colors"
        />
        {hasExistingImage && <p className="text-[10px] text-gray-400 mt-1 italic">An image already exists, so this is optional.</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">Starting Location/Notes *</label>
        <input
          type="text"
          className="w-full rounded-xl glass-input px-3 py-2 focus:ring-2 focus:ring-blue-300/60 focus:border-blue-400 outline-none"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Confirm current location or starting notes..."
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">Estimated Time (minutes) *</label>
        <input
          type="number"
          className="w-full rounded-xl glass-input px-3 py-2 focus:ring-2 focus:ring-blue-300/60 focus:border-blue-400 outline-none"
          value={fixTime}
          onChange={(e) => setFixTime(e.target.value)}
          placeholder="How many minutes will this take?"
          required
          min="1"
        />
      </div>
      <button
        type="submit"
        className="w-full glass-surface bg-blue-500/30 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500/50 transition-all shadow-xl border border-blue-400/30"
        disabled={loading}
      >
        {loading ? "Starting..." : "Start Working Now"}
      </button>
    </form>
  );
}

// AFTER EVIDENCE FORM WITH COMPLETION DETAILS
function AfterEvidenceForm({ issueId, onSuccess }) {
  const [afterImage, setAfterImage] = React.useState(null);
  const [completionDetails, setCompletionDetails] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAfterImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    if (afterImage) formData.append("afterImage", afterImage);
    formData.append("address", completionDetails);
    formData.append("feedback", feedback);
    try {
      // Authorization handled by interceptor. 
      // Important: Allow axios/browser to set Content-Type for FormData to include boundary
      const response = await api.post(
        `/api/issues/${issueId}/evidence/after`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setAfterImage(null);
      setCompletionDetails("");
      setFeedback("");
      if (onSuccess) onSuccess();
      alert("AFTER evidence submitted. Status set to Complete.");
      console.log("AFTER evidence response:", response.data);
    } catch (err) {
      console.error("AFTER evidence error:", err.response?.data || err.message);
      alert(`Failed to upload AFTER evidence: ${err.response?.data?.error || err.message}`);
    }
    setLoading(false);
  };

  return (
    <form className="glass-surface-strong rounded-2xl p-6 max-w-lg mx-auto" onSubmit={handleSubmit}>
      <h2 className="font-semibold text-lg mb-4 text-blue-800">Complete Work Order</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Upload AFTER image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100/70 file:text-blue-700 hover:file:bg-blue-200/80 transition-colors"
        />
        <p className="text-[10px] text-gray-400 mt-1 italic">Optional. Add a completion photo if you have one.</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Completion Details</label>
        <textarea
          className="w-full rounded-xl glass-input px-3 py-2 focus:ring-2 focus:ring-blue-300/60 focus:border-blue-400 outline-none"
          rows="3"
          value={completionDetails}
          onChange={(e) => setCompletionDetails(e.target.value)}
          placeholder="Describe how you completed this work..."
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Requester Feedback</label>
        <textarea
          className="w-full rounded-xl glass-input px-3 py-2 focus:ring-2 focus:ring-blue-300/60 focus:border-blue-400 outline-none"
          rows="3"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write the feedback or completion summary that should be emailed to the requester..."
          required
        />
      </div>
      <button
        type="submit"
        className="w-full glass-surface bg-emerald-500/30 text-white px-6 py-2 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-500/50 transition-all border border-emerald-400/30"
        disabled={loading}
      >
        {loading ? "Completing..." : "Complete Work Order"}
      </button>
    </form>
  );
}

const TechnicianDashboard = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [techSchedules, setTechSchedules] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [companyAssets, setCompanyAssets] = useState([]);
  const [companyLocations, setCompanyLocations] = useState([]);
  const [inventoryParts, setInventoryParts] = useState([]);
  const [user, setUser] = useState({ name: "", id: "" });
  const [showAfterForm, setShowAfterForm] = useState({});
  const [showBeforeForm, setShowBeforeForm] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [showMaterialRequestForm, setShowMaterialRequestForm] = useState(false);
  const [materialRequestData, setMaterialRequestData] = useState({
    title: "",
    description: "",
    quantity: 1,
    urgency: "MEDIUM",
    linkedIssueId: "",
    assetName: "",
    partId: ""
  });
  const [showPmForm, setShowPmForm] = useState(false);
  const [selectedPmSchedule, setSelectedPmSchedule] = useState(null);
  const [creatingPm, setCreatingPm] = useState(false);
  const [pmFormData, setPmFormData] = useState({
    name: "",
    description: "",
    category: "Preventive",
    priority: "MEDIUM",
    durationHours: "",
    date: "",
    time: "09:00",
    location: "",
    assetId: "",
    assetName: "",
    linkedIssueId: ""
  });
  const [pmSearchQuery, setPmSearchQuery] = useState('');
  const [pmSortDirection, setPmSortDirection] = useState('desc');
  const [schedulerSearchQuery, setSchedulerSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [privateNote, setPrivateNote] = useState('');
  const [mentionNotifications, setMentionNotifications] = useState([]);
  const [noteReady, setNoteReady] = useState(false);
  const [companyPeople, setCompanyPeople] = useState([]);
  const [mentionCandidates, setMentionCandidates] = useState([]);
  const [mentionContext, setMentionContext] = useState(null);
  const [startingTimer, setStartingTimer] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completionForm, setCompletionForm] = useState({ details: '', feedback: '' });
  const [directMessageThreads, setDirectMessageThreads] = useState({});
  const [directMessageNotifications, setDirectMessageNotifications] = useState([]);
  const [directMessageRecipientId, setDirectMessageRecipientId] = useState('');
  const [directMessageDraft, setDirectMessageDraft] = useState('');
  const [directMessageSending, setDirectMessageSending] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();
  const userName = user?.name || user?.username || 'Technician';
  const currentUserId = String(user?._id || user?.id || '');
  const messageSectionRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAfterSuccess = (jobId) => {
    setShowAfterForm((prev) => ({ ...prev, [jobId]: false }));
    fetchAssignedIssues();
    window.dispatchEvent(new CustomEvent('issueStatusUpdated', { detail: { id: jobId, status: 'COMPLETE' } }));
  };

  const handleBeforeSuccess = (jobId) => {
    setShowBeforeForm((prev) => ({ ...prev, [jobId]: false }));
    fetchAssignedIssues();
    window.dispatchEvent(new CustomEvent('issueStatusUpdated', { detail: { id: jobId, status: 'IN_PROGRESS' } }));
  };

  const handleStartWork = (jobId) => {
    setShowBeforeForm((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const toggleAfterForm = (jobId) => {
    setShowAfterForm((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const toggleMaterialRequestForm = () => {
    setShowMaterialRequestForm(!showMaterialRequestForm);
  };

  const openMaterialRequestForJob = async (job) => {
    if (!job) {
      setShowMaterialRequestForm(true);
      return;
    }
    const maybeAssigned = String(job?.assignedTo || '').trim();
    const currentId = String(user?._id || user?.id || '').trim();
    if (!maybeAssigned && currentId) {
      const assignResult = await handleAssignIssueToSelf(job, { silent: true });
      if (assignResult === false) return;
    }
    setMaterialRequestData({
      title: job.assetName || job.asset?.name || job.title || "",
      description: `Parts requested for work order: ${job.title || 'Work Order'}`,
      quantity: 1,
      urgency: String(job.priority || 'MEDIUM').toUpperCase(),
      linkedIssueId: job._id || job.id || "",
      assetName: job.assetName || job.asset?.name || ""
    });
    setSelectedJob(job);
    setActiveSection('materials');
    setShowMaterialRequestForm(true);
  };

  const openPmForJob = async (job) => {
    if (!job) {
      setShowPmForm(true);
      return;
    }
    const maybeAssigned = String(job?.assignedTo || '').trim();
    const currentId = String(user?._id || user?.id || '').trim();
    if (!maybeAssigned && currentId) {
      const assignResult = await handleAssignIssueToSelf(job, { silent: true });
      if (assignResult === false) return;
    }
    const baseDate = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    setPmFormData({
      name: job.title || "",
      description: job.description || "",
      category: String(job.category || 'Preventive'),
      priority: String(job.priority || 'MEDIUM').toUpperCase(),
      date: `${baseDate.getFullYear()}-${pad(baseDate.getMonth() + 1)}-${pad(baseDate.getDate())}`,
      time: "09:00",
      location: job.location || "",
      assetId: job.assetId || job.asset?._id || job.asset?.id || "",
      assetName: job.assetName || job.asset?.name || "",
      linkedIssueId: job._id || job.id || ""
    });
    setSelectedJob(job);
    setActiveSection('pm');
    setShowPmForm(true);
  };

  const handleMaterialRequestChange = (e) => {
    const { name, value } = e.target;
    setMaterialRequestData(prev => {
      const next = {
        ...prev,
        [name]: name === 'quantity' ? parseInt(value) || 1 : value
      };
      if (name === 'partId' && value) {
        const selected = inventoryParts.find(p => String(p._id || p.id) === String(value));
        if (selected) {
          next.title = selected.name;
          if (selected.assetName && !next.assetName) {
            next.assetName = selected.assetName;
          }
        }
      }
      return next;
    });
  };

  const handleMaterialRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentUserId = user._id || user.id;
      const currentUserName = user.name || user.username || 'Technician';

      // 1. Link to Parts & Inventory (Consolidated System)
      if (materialRequestData.partId) {
        try {
          const partId = materialRequestData.partId;
          const partRes = await api.get(`/api/parts/${partId}`);
          const freshPart = partRes.data;
          
          const allocationRecord = {
            id: Math.random().toString(36).substr(2, 9),
            partId: partId,
            partName: freshPart.name || materialRequestData.title,
            quantity: materialRequestData.quantity,
            requestedBy: currentUserId,
            date: new Date().toISOString(),
            status: 'PENDING',
            notes: `Request from Technician for Work Order: ${selectedJob?.title || 'N/A'}. Details: ${materialRequestData.description}`,
          };

          await api.put(`/api/parts/${partId}`, {
            allocationHistory: [allocationRecord, ...(freshPart.allocationHistory || [])],
            allocated: (Number(freshPart.allocated) || 0) + materialRequestData.quantity
          });
          console.log('Allocation record created for inventory part');
        } catch (allocErr) {
          console.error('Failed to create allocation record in inventory', allocErr);
        }
      }

      // 2. Submit Material Request (Legacy/Mirror)
      const requestData = {
        ...materialRequestData,
        technicianId: currentUserId,
        technicianName: currentUserName,
        clientId: currentUserId,
        issueId: materialRequestData.linkedIssueId || undefined,
        workOrderId: materialRequestData.linkedIssueId || undefined,
        assetName: materialRequestData.assetName || undefined
      };

      await api.post('/api/material-requests', requestData);

      alert('Request submitted! It is now visible in the Parts & Inventory pending requests for approval.');
      setMaterialRequestData({
        title: "",
        description: "",
        quantity: 1,
        urgency: "MEDIUM",
        linkedIssueId: "",
        assetName: "",
        partId: ""
      });
      setShowMaterialRequestForm(false);

      fetchMaterialRequests();
      fetchInventoryParts();
    } catch (error) {
      console.error("Material request error:", error);
      alert('Failed to submit material request');
    }
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
  };

  const getJobStatus = (job) => {
    const status = (job.status || 'PENDING').toUpperCase();
    if (isCompletedStatus(status)) {
      return status;
    }
    if (status === 'IN PROGRESS' || status === 'IN_PROGRESS') {
      return 'IN PROGRESS';
    }
    if (status !== 'OVERDUE' && isOverdue(job.fixDeadline || job.dueDate)) {
      return 'OVERDUE';
    }
    return status;
  };

  /* Helper for imageSrc using base URL if needed, but here we just open in new tab.
     Since we are refactoring, we need to know the base URL. 
     We can access it from api.defaults.baseURL or import.meta.env.VITE_API_URL 
  */
  const handleImageClick = (imageSrc, title) => {
    const url = getImageUrl(imageSrc);
    if (url) window.open(url, '_blank');
  };

  const fetchAssignedIssues = () => {
    api.get('/api/issues')
      .then(res => setJobs(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.warn('Failed to fetch technician issues:', err?.response?.data || err.message);
        setJobs([]);
      });
  };

  const fetchInventoryParts = () => {
    api.get('/api/parts')
      .then(res => setInventoryParts(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.warn('Failed to fetch inventory parts:', err));
  };

  const [alerts, setAlerts] = useState([]);
  const [reminders, setReminders] = useState([]); // Keep for backward compatibility or refactor to use alerts

  const canAssignIssueToSelf = (job) => {
    if (!job) return false;
    const currentId = String(user?._id || user?.id || '').trim();
    if (!currentId) return false;
    const directAssignee = String(job?.assignedTo || '').trim();
    if (directAssignee && directAssignee === currentId) return false;
    if (Array.isArray(job?.assignees) && job.assignees.some((entry) => {
      const entryId = String(entry?.id || entry?._id || entry?.userId || entry || '').trim();
      return entryId && entryId === currentId;
    })) return false;
    const status = getJobStatus(job);
    return !isCompletedStatus(status);
  };

  const handleAssignIssueToSelf = async (job, options = {}) => {
    if (!job) return false;
    const currentId = String(user?._id || user?.id || '').trim();
    if (!currentId) {
      if (!options.silent) alert('Unable to find your technician account.');
      return false;
    }
    try {
      const id = job._id || job.id;
      const res = await api.post(`/api/issues/${id}/assign`, { techId: currentId });
      const updatedJob = res?.data || { ...job, assignedTo: currentId };
      setJobs((prev) => prev.map((entry) => String(entry._id || entry.id) === String(id) ? updatedJob : entry));
      setSelectedJob((prev) => prev && String(prev._id || prev.id) === String(id) ? updatedJob : prev);
      if (!options.silent) {
        alert('Issue assigned to you.');
      }
      return updatedJob;
    } catch (err) {
      console.error('Failed to assign issue to self', err);
      if (!options.silent) {
        alert(err?.response?.data?.error || err?.message || 'Failed to assign issue to yourself.');
      }
      return false;
    }
  };

  const getTimeRemaining = (targetDate) => {
    if (!targetDate) return null;
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;

    const isOverdue = diff < 0;
    const absDiff = Math.abs(diff);

    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return { text: `${Math.floor(hours / 24)}d ${hours % 24}h`, isOverdue };
    return { text: `${hours}h ${minutes}m`, isOverdue };
  };

  const fetchReminders = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    try {
      const u = JSON.parse(userStr);
      const techId = u?._id || u?.id || u?.userId || '';
      const res = await api.get(`/api/maintenance-schedules/technician/${techId || 'me'}`);
      const schedules = res.data || [];
      setTechSchedules(Array.isArray(schedules) ? schedules : []);

      const now = new Date();
      const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      // Process Maintenance Reminders
      const upcomingSchedules = schedules.filter(s =>
        s && s.routine && s.nextDate &&
        new Date(s.nextDate) <= cutoff &&
        (!s.lastReminder || new Date(s.lastReminder) < new Date(s.nextDate)) &&
        (!s.snoozedUntil || new Date(s.snoozedUntil) < now) &&
        (!s.dismissedBy || !s.dismissedBy[u._id || u.id])
      ).map(s => ({
        ...s,
        type: 'MAINTENANCE',
        priority: 'MEDIUM',
        deadline: s.nextDate
      }));

      // Process Issue Deadlines
      const issueAlerts = jobs.filter(j => {
        const deadline = j.fixDeadline || j.dueDate;
        if (!deadline) return false;
        const dDate = new Date(deadline);
        const isComplete = (j.status || '').toLowerCase().includes('complete');
        // Show if due within 24h or already overdue, and NOT complete
        return !isComplete && (dDate <= cutoff);
      }).map(j => ({
        ...j,
        type: 'ISSUE',
        priority: j.priority || 'HIGH',
        deadline: j.fixDeadline || j.dueDate,
        name: j.title
      }));

      const unifiedAlerts = [...upcomingSchedules, ...issueAlerts].sort((a, b) =>
        new Date(a.deadline) - new Date(b.deadline)
      );

      setAlerts(unifiedAlerts);
      setReminders(upcomingSchedules); // Maintain for any components still using it
    } catch (err) {
      console.warn('Failed to fetch alerts:', err);
      setTechSchedules([]);
    }
  };

  const updateJobStatus = async (job, status) => {
    if (!job) return;
    const id = job._id || job.id;
    try {
      const baseChat = Array.isArray(job.chat) ? job.chat : [];
      const statusMsg = `Status changed to ${status.replace('_', ' ')}`;
      const message = { text: statusMsg, sender: user.name || 'Technician', role: user.role || 'technician', timestamp: new Date().toISOString() };
      const chat = [...baseChat, message];
      setJobs(prev => prev.map(j => (String(j._id || j.id) === String(id) ? { ...j, status, chat } : j)));
      if (selectedJob && String(selectedJob._id || selectedJob.id) === String(id)) {
        setSelectedJob({ ...selectedJob, status, chat });
      }
      await api.put(`/api/issues/${id}`, { status, chat });
      window.dispatchEvent(new CustomEvent('issueStatusUpdated', { detail: { id, status, chat } }));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Could not update status');
    }
  };

  const sendChatMessage = async () => {
    if (!selectedJob || !chatInput.trim()) return;
    const id = selectedJob._id || selectedJob.id;
    const newMessage = {
      text: chatInput.trim(),
      sender: user.name || 'Technician',
      role: user.role || 'technician',
      timestamp: new Date().toISOString()
    };
    const updatedChat = [...(selectedJob.chat || []), newMessage];
    setChatSending(true);
    setChatInput('');
    setMentionCandidates([]);
    setMentionContext(null);
    setSelectedJob({ ...selectedJob, chat: updatedChat });
    setJobs(prev => prev.map(j => (String(j._id || j.id) === String(id) ? { ...j, chat: updatedChat } : j)));
    try {
      await api.put(`/api/issues/${id}`, { chat: updatedChat });
      window.dispatchEvent(new CustomEvent('issueStatusUpdated', { detail: { id, chat: updatedChat } }));
    } catch (err) {
      console.error('Failed to send chat', err);
      alert('Could not send chat message');
    } finally {
      setChatSending(false);
    }
  };

  const handleStartTimer = async (job) => {
    if (!job) return;
    const id = job._id || job.id;
    const startedAt = new Date().toISOString();
    const baseChat = Array.isArray(job.chat) ? job.chat : [];
    const startMessage = {
      text: 'Work started.',
      sender: user.name || 'Technician',
      role: user.role || 'technician',
      timestamp: startedAt
    };
    const chat = [...baseChat, startMessage];        
    try {
      setStartingTimer(true);
      await api.put(`/api/issues/${id}`, {
        status: 'IN PROGRESS',
        fixTime: startedAt,
        chat
      });
      const nextJob = { ...job, status: 'IN PROGRESS', fixTime: startedAt, chat };
      setSelectedJob(nextJob);
      setJobs((prev) => prev.map((entry) => (
        String(entry._id || entry.id) === String(id)
          ? { ...entry, status: 'IN PROGRESS', fixTime: startedAt, chat }
          : entry
      )));
      window.dispatchEvent(new CustomEvent('issueStatusUpdated', { detail: { id, status: 'IN PROGRESS', chat } }));
      await Promise.allSettled([fetchAssignedIssues(), fetchReminders()]);
    } catch (err) {
      console.error('Failed to start timer', err);
      alert('Failed to start timer.');
    } finally {
      setStartingTimer(false);
    }
  };

  const handleStopTimer = async (job, payload = {}) => {
    if (!job) return;
    const id = job._id || job.id;
    const completedAt = new Date().toISOString();
    const completionDetails = String(payload.details || '').trim();
    const feedback = String(payload.feedback || '').trim();
    const formData = new FormData();
    formData.append('address', completionDetails);
    formData.append('feedback', feedback);
    try {
      setStartingTimer(true);
      await api.post(`/api/issues/${id}/evidence/after`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const completeMessage = {
        text: 'Work completed.',
        sender: user.name || 'Technician',
        role: user.role || 'technician',
        timestamp: completedAt
      };
      const chat = [...(Array.isArray(job.chat) ? job.chat : []), completeMessage];
      const nextJob = { ...job, status: 'COMPLETED', completedAt, chat };
      setSelectedJob(nextJob);
      setShowCompletionForm(false);
      setCompletionForm({ details: '', feedback: '' });
      setJobs((prev) => prev.map((entry) => (
        String(entry._id || entry.id) === String(id)
          ? { ...entry, status: 'COMPLETED', completedAt, chat }
          : entry
      )));
      window.dispatchEvent(new CustomEvent('issueStatusUpdated', { detail: { id, status: 'COMPLETED', chat } }));
      await Promise.allSettled([fetchAssignedIssues(), fetchReminders()]);
    } catch (err) {
      console.error('Failed to stop timer', err);
      alert('Failed to stop timer.');
    } finally {
      setStartingTimer(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedJob || !scheduleAt) return;
    const id = selectedJob._id || selectedJob.id;
    try {
      setSavingSchedule(true);
      await api.put(`/api/issues/${id}`, { fixDeadline: scheduleAt });
      const nextJob = { ...selectedJob, fixDeadline: scheduleAt };
      setSelectedJob(nextJob);
      setJobs((prev) => prev.map((entry) => (
        String(entry._id || entry.id) === String(id)
          ? { ...entry, fixDeadline: scheduleAt }
          : entry
      )));
      window.dispatchEvent(new CustomEvent('issueStatusUpdated', { detail: { id, fixDeadline: scheduleAt } }));
      await Promise.allSettled([fetchAssignedIssues(), fetchReminders()]);
      alert('Schedule saved.');
    } catch (err) {
      console.error('Failed to save schedule', err);
      alert('Failed to save schedule.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handlePmFieldChange = (e) => {
    const { name, value } = e.target;
    setPmFormData((prev) => {
      if (name === 'assetId') {
        const selectedAsset = companyAssetOptions.find((asset) => String(asset.id) === String(value));
        return {
          ...prev,
          assetId: value,
          assetName: selectedAsset?.name || '',
          location: prev.location || selectedAsset?.location || '',
        };
      }
      if (name === 'location') {
        const selectedLocation = companyLocationOptions.find((location) => String(location.name) === String(value) || String(location.id) === String(value));
        return {
          ...prev,
          location: selectedLocation?.name || value,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleCreatePm = async (e) => {
    e.preventDefault();
    if (!pmFormData.name || !pmFormData.date || !pmFormData.time) {
      alert('PM title, date, and time are required.');
      return;
    }
    try {
      setCreatingPm(true);
      const currentId = String(user?._id || user?.id || '').trim();
      const currentName = user?.name || user?.username || user?.email || 'Technician';
      const payload = {
        name: pmFormData.name,
        description: pmFormData.description || pmFormData.name,
        workOrderTitle: pmFormData.name,
        workOrderDescription: pmFormData.description || pmFormData.name,
        category: pmFormData.category || 'Preventive',
        priority: pmFormData.priority || 'MEDIUM',
        durationHours: pmFormData.durationHours ? Number(pmFormData.durationHours) : undefined,
        status: 'Pending',
        date: pmFormData.date,
        time: pmFormData.time,
        location: pmFormData.location || '',
        assetId: pmFormData.assetId || '',
        assetName: pmFormData.assetName || '',
        assignedTo: currentId,
        technicianUserId: currentId,
        assignees: currentId ? [{ id: currentId, name: currentName, role: user?.role || 'technician' }] : [],
        sourceIssueId: pmFormData.linkedIssueId || undefined,
        workOrderId: pmFormData.linkedIssueId || undefined,
        assetsRows: [{
          id: `tech-pm-${Date.now()}`,
          assetId: pmFormData.assetId || '',
          asset: pmFormData.assetName || '',
          location: pmFormData.location || '',
          startDate: pmFormData.date,
          timezone: '(UTC+02:00) Africa/Kigali',
          assignee: currentId,
          assignedTo: currentId,
        }],
      };
      await api.post('/api/maintenance-schedules', payload);
      setShowPmForm(false);
      setPmFormData({
        name: "",
        description: "",
        category: "Preventive",
        priority: "MEDIUM",
        durationHours: "",
        date: "",
        time: "09:00",
        location: "",
        assetId: "",
        assetName: "",
        linkedIssueId: ""
      });
      await fetchReminders();
      setActiveSection('pm');
      alert('PM created and assigned to you.');
    } catch (err) {
      console.error('Failed to create technician PM', err);
      alert(err?.response?.data?.error || err?.message || 'Failed to create PM.');
    } finally {
      setCreatingPm(false);
    }
  };

  const updateMentionSuggestions = (value, cursorPosition) => {
    const context = getMentionContext(value, cursorPosition);
    setMentionContext(context);
    if (!context) {
      setMentionCandidates([]);
      return;
    }
    const currentUserId = String(user?._id || user?.id || '');
    const filtered = (companyPeople || [])
      .filter((person) => {
        const id = String(person?._id || person?.id || '');
        if (!id || id === currentUserId) return false;
        const haystack = `${person?.name || ''} ${person?.email || ''} ${buildMentionHandle(person)}`.toLowerCase();
        return !context.query || haystack.includes(context.query);
      })
      .slice(0, 6);
    setMentionCandidates(filtered);
  };

  const handleChatInputChange = (e) => {
    const value = e.target.value;
    setChatInput(value);
    updateMentionSuggestions(value, e.target.selectionStart);
  };

  const insertMention = (person) => {
    const nextValue = applyMentionToText(chatInput, mentionContext, person);
    setChatInput(nextValue);
    setMentionCandidates([]);
    setMentionContext(null);
  };

  const dismissOne = async (id, type) => {
    try {
      if (type === 'MAINTENANCE') {
        await api.post(`/api/maintenance-schedules/${id}/dismiss`, { userId: user._id || user.id });
      }
      // For issues, we just hide them locally for now or if we implement an ignore flag
      setAlerts(prev => prev.filter(a => (a._id || a.id) !== id));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const snoozeOne = async (id, type, minutes = 60) => {
    try {
      if (type === 'MAINTENANCE') {
        await api.post(`/api/maintenance-schedules/${id}/snooze`, { minutes, userId: user._id || user.id });
      }
      setAlerts(prev => prev.filter(a => (a._id || a.id) !== id));
    } catch (err) {
      console.error('Failed to snooze alert:', err);
    }
  };

  const dismissAll = async () => {
    try {
      for (const a of alerts) {
        if (a.type === 'MAINTENANCE') {
          await api.post(`/api/maintenance-schedules/${a._id || a.id}/dismiss`, { userId: user._id || user.id });
        }
      }
      setAlerts([]);
    } catch (err) {
      console.error('Failed to dismiss all alerts:', err);
    }
  };

  const snoozeAll = async (minutes = 60) => {
    try {
      for (const a of alerts) {
        if (a.type === 'MAINTENANCE') {
          await api.post(`/api/maintenance-schedules/${a._id || a.id}/snooze`, { minutes, userId: user._id || user.id });
        }
      }
      setAlerts([]);
    } catch (err) {
      console.error('Failed to snooze all alerts:', err);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      fetchAssignedIssues();
      fetchMaterialRequests();
      fetchInventoryParts();
    }
  }, []);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    let cancelled = false;

    const fetchDashboardSideData = async () => {
      try {
        const [noteRes, allNotificationsRes] = await Promise.all([
          api.get('/api/private-notes/me', { params: { scope: 'technician-dashboard' } }),
          api.get('/api/notifications', { params: { limit: 100 } })
        ]);
        if (cancelled) return;
        const allNotifications = Array.isArray(allNotificationsRes?.data) ? allNotificationsRes.data : [];
        setPrivateNote(noteRes?.data?.content || '');
        setMentionNotifications(allNotifications.filter((entry) => String(entry?.type || '').toLowerCase() === 'mention').slice(0, 6));
        setDirectMessageNotifications(
          allNotifications.filter((entry) => String(entry?.type || '').toLowerCase().startsWith('direct_message'))
        );
      } catch (err) {
        console.error('Failed to load technician dashboard side data', err);
      } finally {
        if (!cancelled) setNoteReady(true);
      }
    };

    fetchDashboardSideData();
    const interval = setInterval(fetchDashboardSideData, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    let cancelled = false;

    const fetchCompanyPmOptions = async () => {
      try {
        const [assetsRes, propertiesRes] = await Promise.allSettled([
          api.get('/api/assets'),
          api.get('/api/properties'),
        ]);
        if (cancelled) return;
        const assets = assetsRes.status === 'fulfilled' && Array.isArray(assetsRes.value?.data) ? assetsRes.value.data : [];
        const properties = propertiesRes.status === 'fulfilled' && Array.isArray(propertiesRes.value?.data) ? propertiesRes.value.data : [];
        setCompanyAssets(assets);
        setCompanyLocations(properties);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load technician company PM options', err);
          setCompanyAssets([]);
          setCompanyLocations([]);
        }
      }
    };

    fetchCompanyPmOptions();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    setCompanyPeople([]);
  }, [user]);

  useEffect(() => {
    if (!noteReady) return;
    const timer = setTimeout(async () => {
      try {
        await api.put('/api/private-notes/me', {
          scope: 'technician-dashboard',
          content: privateNote
        });
      } catch (err) {
        console.error('Failed to save technician private note', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [privateNote, noteReady]);

  // Sync reminders/alerts when jobs are loaded or periodically
  useEffect(() => {
    if (user.id || user._id) {
      fetchReminders();
    }
  }, [jobs, user]);

  // Real-time timer update
  useEffect(() => {
    const timer = setInterval(() => {
      // Force re-render to update countdown strings
      setAlerts(prev => [...prev]);
    }, 60000); // Every minute
    return () => clearInterval(timer);
  }, []);

  const openJobs = useMemo(
    () => jobs.filter(job => !['COMPLETE', 'COMPLETED'].includes(getJobStatus(job))),
    [jobs]
  );

  const myTasks = useMemo(() => {
    return jobs.flatMap((job) => {
      const rawTasks = Array.isArray(job?.tasks) && job.tasks.length
        ? job.tasks
        : Array.isArray(job?.taskList) && job.taskList.length
          ? job.taskList
          : Array.isArray(job?.checklist)
            ? job.checklist
            : [];

      return rawTasks.map((task, idx) => {
        const normalized = typeof task === 'string' ? { title: task } : (task || {});
        const status = String(
          normalized.status ||
          (normalized.completed ? 'COMPLETED' : normalized.done ? 'COMPLETED' : 'OPEN')
        ).toUpperCase();
        const dueDate = normalized.dueDate || normalized.deadline || normalized.due || job.fixDeadline || job.dueDate || null;
        return {
          id: normalized.id || normalized._id || `${job._id || job.id}-task-${idx}`,
          jobId: job._id || job.id,
          job,
          jobTitle: job.title || 'Work order',
          title: normalized.title || normalized.text || normalized.name || `Task ${idx + 1}`,
          status,
          dueDate,
          location: job.location || '',
          completed: status.includes('COMPLETE'),
          overdue: dueDate ? new Date(dueDate) < new Date() && !status.includes('COMPLETE') : false
        };
      });
    });
  }, [jobs]);

  const recentOverviewItems = useMemo(() => {
    const recentJobs = jobs
      .map((job) => {
        const timestamp = job.updatedAt || job.createdAt || job.completedAt || job.fixDeadline || null;
        return {
          id: `job-${job._id || job.id}`,
          type: 'work-order',
          title: job.title || 'Untitled work order',
          subtitle: job.location || 'No location yet',
          status: getJobStatus(job),
          timestamp,
          action: () => handleViewJob(job)
        };
      })
      .filter((item) => item.timestamp);

    const recentMaterials = materialRequests
      .map((request) => ({
        id: `material-${request._id || request.id}`,
        type: 'material',
        title: request.title || request.items?.[0]?.title || 'Material request',
        subtitle: request.category || request.type || request.assetName || 'Inventory request',
        status: request.status || (request.approved ? 'APPROVED' : 'PENDING'),
        timestamp: request.createdAt || request.submittedAt || request.date || null,
        action: () => {
          setActiveSection('materials');
        }
      }))
      .filter((item) => item.timestamp);

    return [...recentJobs, ...recentMaterials]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  }, [jobs, materialRequests]);

  const overviewJobCounts = useMemo(() => {
    return jobs.reduce((acc, job) => {
      const status = String(getJobStatus(job) || '').toUpperCase();
      if (status === 'IN PROGRESS') acc.inProgress += 1;
      else if (status === 'OVERDUE') acc.overdue += 1;
      else if (status === 'COMPLETE' || status === 'COMPLETED') acc.completed += 1;
      else acc.assigned += 1;
      return acc;
    }, { assigned: 0, inProgress: 0, overdue: 0, completed: 0 });
  }, [jobs]);

  const materialOverviewSummary = useMemo(() => {
    const summary = {
      total: materialRequests.length,
      pending: 0,
      forwarded: 0,
      approved: 0,
      declined: 0,
      recent: []
    };

    const recent = [...materialRequests]
      .sort((a, b) => new Date(b.createdAt || b.submittedAt || b.date || 0).getTime() - new Date(a.createdAt || a.submittedAt || a.date || 0).getTime())
      .slice(0, 4);

    materialRequests.forEach((request) => {
      const status = String(request?.status || request?.clientResponse || '').toUpperCase();
      if (status.includes('APPROVED')) summary.approved += 1;
      else if (status.includes('DECLINED') || status.includes('REJECTED')) summary.declined += 1;
      else if (status.includes('FORWARDED')) summary.forwarded += 1;
      else summary.pending += 1;
    });

    summary.recent = recent;
    return summary;
  }, [materialRequests]);

  const canStartTimerForJob = (job) => {
    const status = String(getJobStatus(job) || '').toUpperCase();
    return ['PENDING', 'ASSIGNED', 'OVERDUE', 'APPROVED', 'OPEN'].includes(status);
  };

  const canStopTimerForJob = (job) => {
    const status = String(getJobStatus(job) || '').toUpperCase();
    return ['IN PROGRESS', 'IN_PROGRESS'].includes(status);
  };

  useEffect(() => {
    if (!selectedJob) {
      setScheduleAt('');
      setShowCompletionForm(false);
      setCompletionForm({ details: '', feedback: '' });
      return;
    }
    const rawValue = selectedJob.fixDeadline || selectedJob.dueDate || selectedJob.scheduledFor || '';
    if (!rawValue) {
      setScheduleAt('');
      return;
    }
    const parsed = new Date(rawValue);
    if (Number.isNaN(parsed.getTime())) {
      setScheduleAt('');
      return;
    }
    const pad = (value) => String(value).padStart(2, '0');
    setScheduleAt(`${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`);
  }, [selectedJob]);

  const selectedJobTasks = useMemo(() => {
    if (!selectedJob) return [];
    const rawTasks = Array.isArray(selectedJob?.tasks) && selectedJob.tasks.length
      ? selectedJob.tasks
      : Array.isArray(selectedJob?.taskList) && selectedJob.taskList.length
        ? selectedJob.taskList
        : Array.isArray(selectedJob?.checklist)
          ? selectedJob.checklist
          : [];
    return rawTasks.map((task, idx) => {
      const normalized = typeof task === 'string' ? { title: task } : (task || {});
      const status = String(
        normalized.status ||
        (normalized.completed ? 'COMPLETED' : normalized.done ? 'COMPLETED' : 'OPEN')
      ).toUpperCase();
      return {
        id: normalized.id || normalized._id || `${selectedJob._id || selectedJob.id}-selected-task-${idx}`,
        title: normalized.title || normalized.text || normalized.name || `Task ${idx + 1}`,
        status,
        assignee: normalized.assignedTo || normalized.assignee || normalized.owner || '',
        dueDate: normalized.dueDate || normalized.deadline || normalized.due || selectedJob.fixDeadline || selectedJob.dueDate || null,
        completed: status.includes('COMPLETE')
      };
    });
  }, [selectedJob]);

  const selectedJobSchedules = useMemo(() => {
    if (!selectedJob) return [];
    const selectedJobId = String(selectedJob._id || selectedJob.id || '');
    const selectedAssetId = String(selectedJob.assetId || selectedJob.asset?._id || selectedJob.asset?.id || '');
    const selectedPropertyId = String(selectedJob.propertyId || selectedJob.property?._id || selectedJob.property?.id || '');
    const selectedTitle = String(selectedJob.title || '').trim().toLowerCase();
    return (Array.isArray(techSchedules) ? techSchedules : []).filter((schedule) => {
      const scheduleAssetIds = Array.isArray(schedule.assets)
        ? schedule.assets.map((asset) => String(asset?._id || asset?.id || asset))
        : String(schedule.assets || '').split(',').map((value) => value.trim()).filter(Boolean);
      const scheduleAssetId = String(schedule.assetId || schedule.asset?._id || schedule.asset?.id || '');
      const schedulePropertyId = String(schedule.propertyId || schedule.property?._id || schedule.property?.id || '');
      const scheduleName = String(schedule.name || schedule.title || '').trim().toLowerCase();
      const linkedWorkOrderId = String(schedule.workOrderId || schedule.issueId || '').trim();
      return (
        (selectedJobId && linkedWorkOrderId && linkedWorkOrderId === selectedJobId) ||
        (selectedAssetId && (scheduleAssetId === selectedAssetId || scheduleAssetIds.includes(selectedAssetId))) ||
        (selectedPropertyId && schedulePropertyId === selectedPropertyId) ||
        (selectedTitle && scheduleName && (selectedTitle.includes(scheduleName) || scheduleName.includes(selectedTitle)))
      );
    });
  }, [selectedJob, techSchedules]);

  const mentionItems = useMemo(() => (
    Array.isArray(mentionNotifications) ? mentionNotifications : []
  ), [mentionNotifications]);

  const companyAssetOptions = useMemo(
    () => (Array.isArray(companyAssets) ? companyAssets : []).map((asset) => ({
      id: String(asset?._id || asset?.id || ''),
      name: asset?.name || asset?.title || asset?.assetName || 'Asset',
      location: asset?.location || asset?.property?.name || asset?.propertyName || '',
      propertyId: String(asset?.propertyId || asset?.property?._id || asset?.property?.id || ''),
    })).filter((asset) => asset.id || asset.name),
    [companyAssets]
  );

  const companyLocationOptions = useMemo(
    () => Array.from(new Map((Array.isArray(companyLocations) ? companyLocations : []).map((property) => {
      const id = String(property?._id || property?.id || property?.propertyId || '');
      const name = property?.name || property?.title || property?.location || 'Location';
      return [id || name, { id, name }];
    })).values()),
    [companyLocations]
  );

  const getPmPrimaryAssetLabel = (schedule) => (
    schedule?.assetName
    || schedule?.asset?.name
    || schedule?.assetsRows?.[0]?.asset
    || 'Not set'
  );

  const getPmPrimaryLocationLabel = (schedule) => (
    schedule?.location
    || schedule?.assetsRows?.[0]?.location
    || 'Not set'
  );

  const formatPmDateTime = (value) => {
    if (!value) return 'Not set';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return `${parsed.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })} - ${parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getPmAssignedLabel = (schedule) => {
    if (schedule?.assignedToName) return schedule.assignedToName;
    if (schedule?.technicianName) return schedule.technicianName;
    if (Array.isArray(schedule?.assignees) && schedule.assignees.length > 0) {
      return schedule.assignees.map((entry) => entry?.name || entry?.email || entry?.id).filter(Boolean).join(', ');
    }
    const rowAssignee = schedule?.assetsRows?.[0]?.assigneeName || schedule?.assetsRows?.[0]?.assignedToName || '';
    return rowAssignee || 'Assigned to you';
  };

  const getPmStatusClass = (status) => {
    const normalized = String(status || 'Pending').toUpperCase();
    if (normalized.includes('COMPLETE')) return 'bg-emerald-50 text-emerald-700';
    if (normalized.includes('PROGRESS')) return 'bg-amber-50 text-amber-700';
    if (normalized.includes('OVERDUE')) return 'bg-rose-50 text-rose-700';
    if (normalized.includes('PAUSE')) return 'bg-slate-100 text-slate-700';
    return 'bg-blue-50 text-blue-700';
  };

  const filteredPmSchedules = useMemo(() => {
    const query = String(pmSearchQuery || '').trim().toLowerCase();
    const sorted = (Array.isArray(techSchedules) ? techSchedules : []).slice().sort((a, b) => {
      const aDate = new Date(a?.createdAt || a?.date || a?.nextDate || 0).getTime();
      const bDate = new Date(b?.createdAt || b?.date || b?.nextDate || 0).getTime();
      return pmSortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    });
    if (!query) return sorted;
    return sorted.filter((schedule) => {
      const haystack = [
        schedule?.name,
        schedule?.title,
        schedule?.description,
        schedule?.category,
        schedule?.priority,
        schedule?.status,
        schedule?.assetName,
        schedule?.asset?.name,
        schedule?.location,
        schedule?.assetsRows?.[0]?.asset,
        schedule?.assetsRows?.[0]?.location,
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [pmSearchQuery, pmSortDirection, techSchedules]);

  const filteredSchedulerSchedules = useMemo(() => {
    const query = String(schedulerSearchQuery || '').trim().toLowerCase();
    if (!query) return Array.isArray(techSchedules) ? techSchedules : [];
    return (Array.isArray(techSchedules) ? techSchedules : []).filter((schedule) => {
      const haystack = [
        schedule?.name,
        schedule?.title,
        schedule?.category,
        schedule?.status,
        schedule?.assetName,
        schedule?.asset?.name,
        schedule?.location,
        schedule?.assetsRows?.[0]?.asset,
        schedule?.assetsRows?.[0]?.location,
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [schedulerSearchQuery, techSchedules]);

  const messageContacts = useMemo(() => {
    const byId = new Map();
    jobs.forEach((job) => {
      extractDirectMessageContacts(job, currentUserId).forEach((contact) => {
        if (!contact?.id || byId.has(contact.id)) return;
        byId.set(contact.id, contact);
      });
    });
    (Array.isArray(directMessageNotifications) ? directMessageNotifications : []).forEach((notification) => {
      const targetId = getDirectMessageTargetId(notification);
      if (!targetId || byId.has(targetId) || targetId === currentUserId) return;
      const incomingName = parseDirectMessageSenderName(notification);
      const outgoingName = parseDirectMessageRecipientName(notification);
      const fallbackName = incomingName || outgoingName || 'Message Contact';
      byId.set(targetId, {
        id: targetId,
        name: fallbackName,
        email: '',
        role: '',
        sourceLabel: 'Messages'
      });
    });
    return Array.from(byId.values());
  }, [jobs, currentUserId, directMessageNotifications]);

  const selectedJobContacts = useMemo(
    () => extractDirectMessageContacts(selectedJob, currentUserId),
    [selectedJob, currentUserId]
  );

  const selectedDirectRecipient = useMemo(
    () => messageContacts.find((contact) => String(contact.id) === String(directMessageRecipientId)) || null,
    [messageContacts, directMessageRecipientId]
  );

  const incomingDirectMessageThreads = useMemo(() => {
    const threadMap = {};
    const contactsById = new Map(messageContacts.map((contact) => [String(contact.id), contact]));

    (Array.isArray(directMessageNotifications) ? directMessageNotifications : []).forEach((notification) => {
      const type = String(notification?.type || '').toLowerCase();
      const contactId = getDirectMessageTargetId(notification);
      if (!contactId || !contactsById.has(contactId)) return;
      const senderName = type === 'direct_message_sent'
        ? userName
        : (parseDirectMessageSenderName(notification) || contactsById.get(contactId)?.name || 'Contact');
      const nextEntry = {
        id: `${type}-${notification.id}`,
        sender: senderName,
        text: notification.message || '',
        timestamp: notification.createdAt || notification.timestamp || new Date().toISOString(),
        direction: type === 'direct_message_sent' ? 'outgoing' : 'incoming',
        read: notification.read
      };
      threadMap[contactId] = [...(threadMap[contactId] || []), nextEntry];
    });

    return threadMap;
  }, [directMessageNotifications, messageContacts, userName]);

  const selectedDirectThread = useMemo(() => {
    const key = String(directMessageRecipientId);
    const liveEntries = directMessageThreads[key] || [];
    const persistedEntries = incomingDirectMessageThreads[key] || [];
    const merged = persistedEntries.length > 0 ? persistedEntries : liveEntries;
    const deduped = merged.filter((entry, index, list) => {
      const signature = `${entry.direction}|${entry.sender}|${entry.text}|${entry.timestamp}`;
      return list.findIndex((candidate) => `${candidate.direction}|${candidate.sender}|${candidate.text}|${candidate.timestamp}` === signature) === index;
    });
    return deduped.sort((a, b) => {
      const aTime = new Date(a.timestamp || 0).getTime();
      const bTime = new Date(b.timestamp || 0).getTime();
      return aTime - bTime;
    });
  }, [directMessageThreads, incomingDirectMessageThreads, directMessageRecipientId]);

  useEffect(() => {
    if (!messageContacts.length) {
      setDirectMessageRecipientId('');
      return;
    }
    const stillExists = messageContacts.some((contact) => String(contact.id) === String(directMessageRecipientId));
    if (!stillExists) {
      setDirectMessageRecipientId(String(messageContacts[0].id));
    }
  }, [messageContacts, directMessageRecipientId]);

  const openDirectMessageComposer = (contact) => {
    if (!contact?.id) {
      alert('No recipient is available for private message.');
      return;
    }
    setDirectMessageRecipientId(String(contact.id));
    setDirectMessageDraft('');
  };

  const handleSendDirectMessage = async () => {
    const recipientId = String(directMessageRecipientId || '').trim();
    const text = String(directMessageDraft || '').trim();
    if (!recipientId) {
      alert('Choose who you want to message first.');
      return;
    }
    if (!text) return;
    try {
      setDirectMessageSending(true);
      const outgoingMessage = {
        id: `tech-dm-${Date.now()}`,
        sender: userName,
        text,
        timestamp: new Date().toISOString(),
        direction: 'outgoing'
      };
      await api.post('/api/notifications/direct-message', {
        recipientUserId: recipientId,
        recipientName: selectedDirectRecipient?.name || '',
        message: text,
        title: `Private message from ${userName}`,
        link: '/technician-dashboard'
      });
      setDirectMessageThreads((prev) => {
        const key = String(recipientId);
        return { ...prev, [key]: [...(prev[key] || []), outgoingMessage] };
      });
      try {
        const notificationsRes = await api.get('/api/notifications', { params: { limit: 100 } });
        const allNotifications = Array.isArray(notificationsRes?.data) ? notificationsRes.data : [];
        setMentionNotifications(allNotifications.filter((entry) => String(entry?.type || '').toLowerCase() === 'mention').slice(0, 6));
        setDirectMessageNotifications(
          allNotifications.filter((entry) => String(entry?.type || '').toLowerCase().startsWith('direct_message'))
        );
        setDirectMessageThreads((prev) => ({ ...prev, [key]: [] }));
      } catch (refreshErr) {
        console.error('Failed to refresh direct messages after send', refreshErr);
      }
      setDirectMessageDraft('');
    } catch (err) {
      console.error('Failed to send direct message', err);
      alert('Failed to send private message: ' + (err?.response?.data?.message || err.message));
    } finally {
      setDirectMessageSending(false);
    }
  };

  const focusMessageCenter = (recipientId = '') => {
    setActiveSection('messages');
    if (recipientId) {
      setDirectMessageRecipientId(String(recipientId));
    }
    setTimeout(() => {
      const section = messageSectionRef.current || document.getElementById('technician-message-center');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const composer = document.getElementById('technician-message-draft');
      if (composer) {
        composer.focus();
      }
    }, 0);
  };

  const handleNotificationNavigate = (notification) => {
    const type = String(notification?.type || '').toLowerCase();
    if (!type.startsWith('direct_message')) return false;
    focusMessageCenter(getDirectMessageTargetId(notification) || '');
    return true;
  };

  const technicianNavItems = [
    { key: 'overview', label: 'Overview', description: 'Summary and activity' },
    { key: 'workOrders', label: 'Work Orders', description: 'Assigned and active work' },
    { key: 'pm', label: 'Preventive Maintenance', description: 'My assigned PM records' },
    { key: 'scheduler', label: 'Schedule', description: 'Upcoming PM schedule times' },
    { key: 'tasks', label: 'Tasks', description: 'Checklists and notes' },
    { key: 'messages', label: 'Messages', description: 'Private messages and mentions' },
    { key: 'materials', label: 'Materials', description: 'Requests and inventory needs' },
    { key: 'history', label: 'History', description: 'Completed work' }
  ];

  const openTechnicianSection = (key) => {
    setActiveSection(key);
  };

  return (
    <div className="glass-theme-blue min-h-screen text-slate-900 overflow-hidden relative" style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="video-background-container">
        <video autoPlay loop muted playsInline className="video-background text-transparent">
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      </div>
      <div className="relative z-10 min-h-screen px-4 pb-16 pt-6 md:px-8 overflow-y-auto">
      {/* Reminders Panel */}
      {alerts.length > 0 && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full">
          <div className="glass-surface-strong text-white p-6 shadow-2xl rounded-2xl animate-in slide-in-from-right duration-300 border border-white/20">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏰</span>
                <p className="font-black text-xl text-white tracking-tight">Task Alerts</p>
              </div>
              <button
                onClick={() => setAlerts([])}
                className="text-slate-500 hover:text-slate-800 transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm mb-4 text-slate-600">You have {alerts.length} {alerts.length === 1 ? 'task' : 'tasks'} requiring attention.</p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 select-none custom-scrollbar">
              {alerts.map((a) => {
                const id = a._id || a.id;
                const remaining = getTimeRemaining(a.deadline);
                const isOverdue = remaining?.isOverdue;

                return (
                  <div key={`${a.type}-${id}`} className={`p-3 rounded-lg border shadow-sm transition-all ${isOverdue ? 'bg-red-50/70 border-red-200/70' : 'glass-ghost'
                    }`}>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${a.type === 'MAINTENANCE' ? 'bg-blue-100/70 text-blue-700' : 'bg-sky-100/70 text-sky-700'
                            }`}>
                            {a.type}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded font-bold uppercase animate-pulse">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-slate-900 leading-tight text-sm">{a.name}</p>
                      </div>
                      <div className={`text-right ${isOverdue ? 'text-red-600' : 'text-blue-700'}`}>
                        <p className="text-xs font-bold whitespace-nowrap">
                          {isOverdue ? 'LATE BY' : 'REMAINING'}
                        </p>
                        <p className="text-sm font-mono font-black tabular-nums">
                          {remaining?.text || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {a.type === 'MAINTENANCE' ? (
                        <>
                          <button
                            className="flex-1 px-3 py-1.5 glass-surface bg-blue-500/30 text-white text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-blue-500/50 transition-all border border-blue-400/20"
                            onClick={() => dismissOne(id, a.type)}
                          >
                            Dismiss
                          </button>
                          <button
                            className="flex-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-md hover:bg-amber-500 transition-colors shadow-sm"
                            onClick={() => snoozeOne(id, a.type, 60)}
                          >
                            Snooze 1h
                          </button>
                        </>
                      ) : (
                        <button
                          className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-500 transition-colors shadow-sm"
                          onClick={() => {
                            setSelectedJob(a);
                            // Scroll to the job or highlight it?
                          }}
                        >
                          {t("technician.viewDetails")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/40 flex gap-2">
              <button
                className="flex-1 px-3 py-2 glass-ghost text-slate-700 text-xs font-bold rounded-lg hover:bg-white/80 transition-colors"
                onClick={dismissAll}
              >
                {t("technician.alerts.dismissAll")}
              </button>
              <button
                className="flex-1 px-3 py-2 bg-amber-200/40 text-amber-800 text-xs font-bold rounded-lg hover:bg-amber-200/60 transition-colors border border-amber-200/60"
                onClick={() => snoozeAll(60)}
              >
                {t("technician.alerts.snoozeAll")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        title={t("technician.title")}
        subtitle={t("technician.subtitle", { name: user.name || "" })}
        user={user}
        onNotificationNavigate={handleNotificationNavigate}
        right={
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => focusMessageCenter()}
              className="px-4 py-2 glass-ghost text-slate-700 rounded-full font-semibold hover:bg-white/80 transition inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </button>
            <button
              onClick={() => {
                setActiveSection('materials');
                toggleMaterialRequestForm();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-5 py-2.5 text-sm font-bold text-blue-700 shadow-[0_10px_30px_rgba(37,99,235,0.14)] transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-base leading-none text-white">+</span>
              <span>New Material Request</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('pm');
                setShowPmForm(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-[0_10px_30px_rgba(16,185,129,0.14)] transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-base leading-none text-white">+</span>
              <span>Create PM</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2 glass-ghost text-slate-700 rounded-full font-semibold hover:bg-white/80 transition"
            >
              {t("technician.logout")}
            </button>
          </div>
        }
      />

      {/* Material Request Form Modal */}
      {showMaterialRequestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-surface-strong shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/40 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t("technician.modal.title")}</h2>
                <p className="text-sm text-slate-500">{t("technician.modal.subtitle")}</p>
              </div>
              <button
                  onClick={toggleMaterialRequestForm}
                  className="rounded-full p-2 text-slate-500 hover:bg-white/70 hover:text-slate-700"
                >
                  ✕
              </button>
            </div>
            <form onSubmit={handleMaterialRequestSubmit} className="px-6 py-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Link to Inventory Part (Optional)</label>
                    <select
                      name="partId"
                      value={materialRequestData.partId}
                      onChange={handleMaterialRequestChange}
                      className="w-full rounded-xl glass-input px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300/60 outline-none"
                    >
                      <option value="">-- Select from Inventory --</option>
                      {inventoryParts.map(part => (
                        <option key={part._id || part.id} value={part._id || part.id}>
                          {part.name} ({part.partNumber || 'No PN'}) - Stock: {part.quantity}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1 italic">Selecting a part ensures it appears in the "Parts & Inventory" pending requests.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("technician.modal.materialTitle")} *</label>
                    <input
                      type="text"
                      name="title"
                      value={materialRequestData.title}
                      onChange={handleMaterialRequestChange}
                      className="w-full rounded-xl glass-input px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300/60 outline-none"
                      placeholder="e.g., Paint, Nails, Wood Panels"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("technician.modal.description")} *</label>
                    <textarea
                      name="description"
                      value={materialRequestData.description}
                      onChange={handleMaterialRequestChange}
                      className="w-full rounded-xl glass-input px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300/60 outline-none"
                      rows="3"
                      placeholder="Describe what you need and why..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">{t("technician.modal.quantity")} *</label>
                      <input
                        type="number"
                        name="quantity"
                        value={materialRequestData.quantity}
                        onChange={handleMaterialRequestChange}
                        className="w-full rounded-xl glass-input px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300/60 outline-none"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">{t("technician.modal.urgency")} *</label>
                      <select
                        name="urgency"
                        value={materialRequestData.urgency}
                        onChange={handleMaterialRequestChange}
                        className="w-full rounded-xl glass-input px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300/60 outline-none"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {t("technician.modal.submit")}
                  </button>
                  <button
                    type="button"
                    onClick={toggleMaterialRequestForm}
                    className="flex-1 rounded-full glass-ghost py-2 text-sm font-semibold text-slate-700 hover:bg-white/80"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
      )}

      {showPmForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="w-full max-w-5xl rounded-3xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Preventive Maintenance</h2>
                <p className="text-sm text-gray-500">Use the same PM-first structure as the client dashboard. This PM will be assigned to you automatically.</p>
              </div>
              <button
                onClick={() => setShowPmForm(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreatePm} className="px-6 py-6">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <section>
                  <h3 className="text-lg font-bold text-gray-900">Work Order details</h3>
                  <p className="mb-4 text-sm text-gray-600">Set the PM title and the work order information for this preventive maintenance item.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">PM Title *</label>
                      <input name="name" value={pmFormData.name} onChange={handlePmFieldChange} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500" required />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Description</label>
                      <textarea name="description" value={pmFormData.description} onChange={handlePmFieldChange} rows="4" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">Category</label>
                        <input name="category" value={pmFormData.category} onChange={handlePmFieldChange} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">Priority</label>
                        <select name="priority" value={pmFormData.priority} onChange={handlePmFieldChange} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500">
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Duration (hours)</label>
                      <input name="durationHours" value={pmFormData.durationHours} onChange={handlePmFieldChange} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500" placeholder="1" />
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-lg font-bold text-gray-900">Schedule</h3>
                  <p className="mb-4 text-sm text-gray-600">Define when the PM is due and which asset/location it belongs to.</p>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">Date *</label>
                        <input type="date" name="date" value={pmFormData.date} onChange={handlePmFieldChange} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500" required />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">Time *</label>
                        <input type="time" name="time" value={pmFormData.time} onChange={handlePmFieldChange} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500" required />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Location</label>
                      <select name="location" value={pmFormData.location} onChange={handlePmFieldChange} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500">
                        <option value="">Select company location</option>
                        {companyLocationOptions.map((location) => (
                          <option key={location.id || location.name} value={location.name}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Asset</label>
                      <select name="assetId" value={pmFormData.assetId} onChange={handlePmFieldChange} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500">
                        <option value="">Select company asset</option>
                        {companyAssetOptions.map((asset) => (
                          <option key={asset.id || asset.name} value={asset.id}>
                            {asset.name}{asset.location ? ` - ${asset.location}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-800">
                      This PM will show in both the Preventive Maintenance and Schedule sections using the same PM record.
                    </div>
                  </div>
                </section>
              </div>
              <div className="mt-8 flex gap-3">
                <button type="submit" disabled={creatingPm} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">
                  {creatingPm ? 'Creating...' : 'Create PM'}
                </button>
                <button type="button" onClick={() => setShowPmForm(false)} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPmSchedule && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 py-10">
          <div className="w-full max-w-5xl rounded-3xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedPmSchedule.name || selectedPmSchedule.title || 'Preventive Maintenance'}</h2>
                <p className="text-sm text-gray-500">{selectedPmSchedule.category || 'Preventive'} • {String(selectedPmSchedule.status || 'Pending').replace(/_/g, ' ')}</p>
              </div>
              <button type="button" onClick={() => setSelectedPmSchedule(null)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">x</button>
            </div>
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Assigned To</p>
                  <p className="mt-3 text-sm font-semibold text-gray-900">{getPmAssignedLabel(selectedPmSchedule)}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Next Date</p>
                  <p className="mt-3 text-sm font-semibold text-gray-900">{formatPmDateTime(selectedPmSchedule.nextDate || selectedPmSchedule.date)}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Status</p>
                  <div className="mt-3">
                    <span className={`inline-flex rounded-lg px-3 py-1 text-sm font-semibold ${getPmStatusClass(selectedPmSchedule.status)}`}>
                      {String(selectedPmSchedule.status || 'Pending').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Checklist Items</p>
                  <p className="mt-3 text-sm font-semibold text-gray-900">{Array.isArray(selectedPmSchedule.checklist) ? selectedPmSchedule.checklist.length : 0}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <section className="rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-lg font-bold text-gray-900">Work Order details</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Work Order Title</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{selectedPmSchedule.workOrderTitle || selectedPmSchedule.name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Priority</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{selectedPmSchedule.priority || 'Medium'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Description</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedPmSchedule.workOrderDescription || selectedPmSchedule.description || 'No description provided.'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Duration</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{selectedPmSchedule.durationHours ? `${selectedPmSchedule.durationHours} hour(s)` : 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Created</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{formatPmDateTime(selectedPmSchedule.createdAt)}</p>
                    </div>
                  </div>
                </section>
                <section className="rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-lg font-bold text-gray-900">Assets & Location</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Asset</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{getPmPrimaryAssetLabel(selectedPmSchedule)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Location</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{getPmPrimaryLocationLabel(selectedPmSchedule)}</p>
                    </div>
                  </div>
                  {Array.isArray(selectedPmSchedule.assetsRows) && selectedPmSchedule.assetsRows.length > 0 ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Asset</th>
                            <th className="px-4 py-3 text-left font-semibold">Location</th>
                            <th className="px-4 py-3 text-left font-semibold">Assigned</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedPmSchedule.assetsRows.slice(0, 4).map((row, index) => (
                            <tr key={row?.id || index}>
                              <td className="px-4 py-3 text-gray-800">{row?.asset || row?.assetName || row?.assetId || 'Not set'}</td>
                              <td className="px-4 py-3 text-gray-700">{row?.location || row?.locationName || row?.locationId || 'Not set'}</td>
                              <td className="px-4 py-3 text-gray-700">{row?.assigneeName || row?.assignedToName || getPmAssignedLabel(selectedPmSchedule)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </section>
              </div>
              <div className="space-y-6">
                <section className="rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-lg font-bold text-gray-900">Schedule</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Next Date</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{formatPmDateTime(selectedPmSchedule.nextDate || selectedPmSchedule.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Created</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{formatPmDateTime(selectedPmSchedule.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Checklist Items</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{Array.isArray(selectedPmSchedule.checklist) ? selectedPmSchedule.checklist.length : 0}</p>
                    </div>
                  </div>
                </section>
                <section className="rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-lg font-bold text-gray-900">Checklist Preview</h3>
                  {Array.isArray(selectedPmSchedule.checklist) && selectedPmSchedule.checklist.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {selectedPmSchedule.checklist.slice(0, 5).map((item, index) => (
                        <div key={item?.id || index} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">{item?.text || item?.title || `Checklist item ${index + 1}`}</p>
                          <p className="mt-1 text-xs text-gray-500">{item?.type || 'Status'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500">No checklist items attached to this PM.</p>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto mt-6 grid max-w-[1600px] grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[32px] border border-white/60 bg-white/70 p-5 shadow-[0_20px_60px_rgba(37,99,235,0.12)] backdrop-blur-xl">
            <div className="border-b border-slate-200/70 px-2 pb-5">
              <div className="text-[11px] font-black uppercase tracking-[0.38em] text-blue-600">Technician</div>
              <h2 className="mt-3 text-[2.15rem] font-black leading-none text-slate-900">Workspace</h2>
              <p className="mt-3 max-w-[22ch] text-sm leading-6 text-slate-500">Navigate your technician workflow with focused tabs, just like the client dashboard.</p>
            </div>
            <div className="mt-5 space-y-3">
              {technicianNavItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => openTechnicianSection(item.key)}
                  className={`group w-full rounded-[24px] border px-5 py-4 text-left transition-all duration-200 ${
                    activeSection === item.key
                      ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-white text-blue-700 shadow-[0_12px_30px_rgba(37,99,235,0.12)]'
                      : 'border-slate-200/70 bg-white/65 text-slate-700 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-bold">{item.label}</div>
                    <span className={`h-2.5 w-2.5 rounded-full transition ${
                      activeSection === item.key ? 'bg-blue-500 shadow-[0_0_0_6px_rgba(59,130,246,0.12)]' : 'bg-slate-200 group-hover:bg-blue-200'
                    }`} />
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-500">{item.description}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-8">
      {/* Stats Cards */}
      <div id="tech-section-overview" className={`${activeSection === 'overview' ? 'grid' : 'hidden'} grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8 scroll-mt-24`}>
        <div className="glass-surface rounded-2xl shadow-lg p-6 border border-blue-100/60">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("technician.stats.assigned")}</div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {overviewJobCounts.assigned}
          </div>
          <p className="text-sm text-slate-500 mt-2">Open work waiting in your queue</p>
        </div>

        <div className="glass-surface rounded-2xl shadow-lg p-6 border border-blue-200/60">
          <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">{t("technician.stats.inProgress")}</div>
          <div className="text-3xl font-black text-blue-600 mt-2">
            {overviewJobCounts.inProgress}
          </div>
          <p className="text-sm text-slate-500 mt-2">Currently working on</p>
        </div>

        <div className="rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50 to-white p-6 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-widest text-rose-600">Overdue</div>
          <div className="mt-2 text-3xl font-black text-rose-700">
            {overviewJobCounts.overdue}
          </div>
          <p className="mt-2 text-sm text-rose-700/80">
            {overviewJobCounts.overdue > 0 ? 'Needs attention now' : 'No overdue work right now'}
          </p>
        </div>

        <div className="glass-surface rounded-2xl shadow-lg p-6 border border-emerald-200/60">
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{t("technician.stats.completed")}</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {overviewJobCounts.completed}
          </div>
          <p className="text-sm text-slate-500 mt-2">{t("technician.stats.finishedJobs")}</p>
        </div>

        <div className="glass-surface rounded-2xl shadow-lg p-6 border border-blue-200/60">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">{t("technician.stats.materials")}</div>
          <div className="text-3xl font-black text-blue-700 mt-2">{materialRequests.length}</div>
          <p className="text-sm text-slate-500 mt-2">
            {user?.companyName ? `Shared across ${user.companyName}` : t("technician.stats.requestsSubmitted")}
          </p>
        </div>

        <div className="md:col-span-2 xl:col-span-5 rounded-[32px] border border-white/60 bg-white/72 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
          {overviewJobCounts.overdue > 0 && (
            <div className="mb-6 flex items-center justify-between gap-4 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-rose-600">Attention Needed</div>
                <div className="mt-1 text-base font-bold text-rose-900">
                  {overviewJobCounts.overdue} overdue {overviewJobCounts.overdue === 1 ? 'work order needs' : 'work orders need'} follow-up.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('workOrders')}
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-rose-700"
              >
                Open Work Orders
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.32em] text-blue-600">Recent Activity</div>
              <h3 className="mt-2 text-3xl font-black text-slate-900">What changed most recently</h3>
              <p className="mt-2 text-sm text-slate-500">
                {user?.companyName
                  ? `A quick snapshot of assigned work and material requests shared inside ${user.companyName}.`
                  : 'A quick snapshot of your latest work orders and material requests.'}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700">
              {recentOverviewItems.length} recent items
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {recentOverviewItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="rounded-[26px] border border-slate-100 bg-white/90 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-[0_16px_30px_rgba(37,99,235,0.10)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                      {item.type === 'material' ? 'Material Request' : 'Work Order'}
                    </div>
                    <div className="mt-2 text-lg font-bold text-slate-900">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.subtitle}</div>
                  </div>
                  <span className={`inline-flex shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${
                    item.status === 'IN PROGRESS'
                      ? 'bg-blue-100 text-blue-700'
                      : item.status === 'APPROVED' || String(item.status).includes('COMPLETE')
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.status === 'OVERDUE' || item.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                  }`}>
                    {String(item.status || 'Open').replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="text-xs font-medium text-slate-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                    Open
                  </div>
                </div>
              </button>
            ))}

            {recentOverviewItems.length === 0 && (
              <div className="lg:col-span-2 rounded-[26px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
                <div className="text-lg font-bold text-slate-700">No recent activity yet</div>
                <div className="mt-2 text-sm text-slate-500">As soon as work orders or material requests update, they’ll show here.</div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 xl:col-span-5 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/60 bg-white/72 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.32em] text-blue-600">Material Snapshot</div>
                <h3 className="mt-2 text-2xl font-black text-slate-900">Request pipeline at a glance</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {user?.companyName
                    ? `These totals are based on material requests visible to your company workspace.`
                    : 'These totals are based on the material requests visible to you.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('materials')}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-blue-700"
              >
                Open Materials
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[24px] border border-amber-100 bg-amber-50/90 p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700">Pending</div>
                <div className="mt-3 text-3xl font-black text-amber-900">{materialOverviewSummary.pending}</div>
                <div className="mt-2 text-sm text-amber-800/80">Waiting for action</div>
              </div>
              <div className="rounded-[24px] border border-sky-100 bg-sky-50/90 p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-700">Forwarded</div>
                <div className="mt-3 text-3xl font-black text-sky-900">{materialOverviewSummary.forwarded}</div>
                <div className="mt-2 text-sm text-sky-800/80">Sent for review</div>
              </div>
              <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/90 p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Approved</div>
                <div className="mt-3 text-3xl font-black text-emerald-900">{materialOverviewSummary.approved}</div>
                <div className="mt-2 text-sm text-emerald-800/80">Ready to move forward</div>
              </div>
              <div className="rounded-[24px] border border-rose-100 bg-rose-50/90 p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-700">Declined</div>
                <div className="mt-3 text-3xl font-black text-rose-900">{materialOverviewSummary.declined}</div>
                <div className="mt-2 text-sm text-rose-800/80">Needs a follow-up</div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/72 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.32em] text-blue-600">Recent Materials</div>
                <h3 className="mt-2 text-2xl font-black text-slate-900">Latest requests</h3>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
                {materialOverviewSummary.total} total
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {materialOverviewSummary.recent.map((request) => {
                const status = String(request?.status || request?.clientResponse || 'PENDING').toUpperCase();
                const badgeClass =
                  status.includes('APPROVED')
                    ? 'bg-emerald-100 text-emerald-700'
                    : status.includes('DECLINED') || status.includes('REJECTED')
                      ? 'bg-rose-100 text-rose-700'
                      : status.includes('FORWARDED')
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-amber-100 text-amber-700';

                return (
                  <button
                    key={request._id || request.id}
                    type="button"
                    onClick={() => setActiveSection('materials')}
                    className="flex w-full items-start justify-between gap-4 rounded-[22px] border border-slate-100 bg-white/90 px-5 py-4 text-left transition hover:border-blue-100 hover:bg-white"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900">
                        {request.title || request.items?.[0]?.title || 'Material request'}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {request.technicianName || 'Technician'} • {request.description || 'Inventory request'}
                      </div>
                      <div className="mt-2 text-xs font-medium text-slate-400">
                        {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'No timestamp'}
                      </div>
                    </div>
                    <span className={`inline-flex shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${badgeClass}`}>
                      {status.replace(/_/g, ' ')}
                    </span>
                  </button>
                );
              })}

              {materialOverviewSummary.recent.length === 0 && (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 px-5 py-10 text-center text-sm text-slate-500">
                  No material requests yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`${['workOrders', 'tasks', 'messages'].includes(activeSection) ? 'grid' : 'hidden'} grid-cols-1 gap-8 mb-8`}>
        <div id="tech-section-workOrders" className={`${activeSection === 'workOrders' ? 'block' : 'hidden'} rounded-[32px] border border-white/60 bg-white/72 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl scroll-mt-24`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900">My Work Orders</h2>
              <p className="text-sm text-slate-500 mt-1">Open, active, and recently completed jobs assigned to you.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-100/70 text-blue-700 text-xs font-black uppercase">
              {openJobs.length} Open
            </span>
          </div>
          <div className="overflow-x-auto rounded-[28px] border border-slate-100 bg-white/88 shadow-inner">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-slate-50/90 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Work Order</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {jobs.slice(0, 5).map((job) => {
                  const status = getJobStatus(job);
                  const statusClass =
                    status === 'IN PROGRESS'
                      ? 'bg-blue-100 text-blue-700'
                      : status === 'OVERDUE'
                        ? 'bg-rose-100 text-rose-700'
                        : status.includes('COMPLETE')
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700';

                  return (
                    <tr
                      key={`summary-${job._id || job.id}`}
                      className="cursor-pointer hover:bg-blue-50/45 transition"
                      onClick={() => handleViewJob(job)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{job.title || 'Untitled job'}</div>
                        <div className="mt-1 text-xs text-slate-500">{job.category || job.type || 'General work order'}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{job.location || 'No location yet'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${statusClass}`}>
                          {status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {job.fixDeadline ? new Date(job.fixDeadline).toLocaleString() : 'No due date'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {canStartTimerForJob(job) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartTimer(job);
                              }}
                              disabled={startingTimer}
                              className="rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                              {startingTimer ? 'Starting...' : 'Start Timer'}
                            </button>
                          )}
                          {canStopTimerForJob(job) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStopTimer(job);
                              }}
                              disabled={startingTimer}
                              className="rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {startingTimer ? 'Stopping...' : 'Stop Timer'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewJob(job);
                            }}
                            className="rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-white"
                          >
                            Open Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {jobs.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-500">
                No assigned work orders yet.
              </div>
            )}
          </div>
        </div>

        <div id="tech-section-tasks" className={`${activeSection === 'tasks' ? 'block' : 'hidden'} glass-surface rounded-3xl shadow-lg border border-white/50 p-6 scroll-mt-24`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900">My Tasks</h2>
              <p className="text-sm text-slate-500 mt-1">Checklist items and tasks from your assigned work orders.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black uppercase">
              {myTasks.filter((task) => !task.completed).length} Active
            </span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/40 mb-4">
            <table className="min-w-[700px] w-full text-left text-sm">
              <thead className="bg-white/70 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Work Order</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {myTasks.slice(0, 6).map((task) => (
                  <tr key={`table-task-${task.id}`} className="cursor-pointer hover:bg-white/50 transition" onClick={() => handleViewJob(task.job)}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{task.title}</td>
                    <td className="px-4 py-3 text-slate-700">{task.jobTitle}</td>
                    <td className="px-4 py-3 text-slate-600">{task.location || 'No location yet'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                        task.completed
                          ? 'bg-emerald-100 text-emerald-700'
                          : task.overdue
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {task.completed ? 'Completed' : task.overdue ? 'Overdue' : 'Open'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewJob(task.job);
                        }}
                        className="rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-white"
                      >
                        Open Work Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {myTasks.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-500">
                No checklist tasks yet.
              </div>
            )}
          </div>
          <div className="hidden space-y-3">
            {myTasks.slice(0, 6).map((task) => (
              <button key={task.id} type="button" onClick={() => handleViewJob(task.job)} className="w-full text-left rounded-2xl border border-white/60 bg-white/50 px-4 py-3 hover:border-blue-200 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-1 truncate">{task.jobTitle}{task.location ? ` • ${task.location}` : ''}</p>
                    <p className="text-[11px] text-blue-600 mt-2 font-semibold">Open work order details</p>
                  </div>
                  <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                    task.completed
                      ? 'bg-emerald-100 text-emerald-700'
                      : task.overdue
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}>
                    {task.completed ? 'Completed' : task.overdue ? 'Overdue' : 'Open'}
                  </span>
                </div>
              </button>
            ))}
            {myTasks.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-white/70 bg-white/30 px-4 py-8 text-center text-slate-500">
                No checklist tasks yet.
              </div>
            )}
          </div>
        </div>

        <div className={`${activeSection === 'tasks' ? 'block' : 'hidden'} glass-surface rounded-3xl shadow-lg border border-white/50 p-6`}>
          <div className="mb-5">
            <h2 className="text-2xl font-black text-slate-900">Private Notepad</h2>
            <p className="text-sm text-slate-500 mt-1">Personal reminders visible only on this technician account in this browser.</p>
          </div>
          <textarea
            value={privateNote}
            onChange={(e) => setPrivateNote(e.target.value)}
            placeholder="Write your to-do list, follow-ups, or personal reminders here..."
            className="w-full min-h-[220px] rounded-2xl border border-white/60 bg-white/55 px-4 py-4 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60"
          />
        </div>

        <div id="tech-section-messages" ref={messageSectionRef} className={`${activeSection === 'messages' ? 'block' : 'hidden'} scroll-mt-24`}>
          <TechnicianMessageCenter
            id="technician-message-center"
            textareaId="technician-message-draft"
            contacts={messageContacts}
            recipientId={directMessageRecipientId}
            onRecipientChange={setDirectMessageRecipientId}
            onQuickSelect={openDirectMessageComposer}
            selectedRecipient={selectedDirectRecipient}
            thread={selectedDirectThread}
            draft={directMessageDraft}
            onDraftChange={setDirectMessageDraft}
            onSend={handleSendDirectMessage}
            sending={directMessageSending}
          />
        </div>

        <div className={`${activeSection === 'messages' ? 'block' : 'hidden'} glass-surface rounded-3xl shadow-lg border border-white/50 p-6`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Comments Mentioning Me</h2>
              <p className="text-sm text-slate-500 mt-1">First pass using existing chat messages that include your name or email.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase">
              {mentionItems.length} Recent
            </span>
          </div>
          <div className="space-y-3">
            {mentionItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.link) {
                    window.location.href = item.link;
                  }
                }}
                className="w-full text-left rounded-2xl border border-white/60 bg-white/50 px-4 py-3 hover:border-blue-200 hover:shadow-md transition"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.title}</p>
                <p className="text-sm text-slate-800 mt-1 line-clamp-2">{item.message}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {item.type || 'mention'}
                  {item.createdAt ? ` • ${new Date(item.createdAt).toLocaleString()}` : ''}
                </p>
              </button>
            ))}
            {mentionItems.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-white/70 bg-white/30 px-4 py-8 text-center text-slate-500">
                No mentions found yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`${activeSection === 'pm' ? 'block' : 'hidden'} overflow-visible rounded-[24px] border border-gray-200 bg-white shadow-sm`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Preventive Maintenance</h2>
          <div className="flex items-center gap-3">
            <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700" onClick={() => setShowPmForm(true)}>Create PM</button>
            <button type="button" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
          <div className="text-sm font-semibold text-gray-900">{filteredPmSchedules.length} Results Returned</div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setPmSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))} className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ArrowUpDown className="h-4 w-4" />
              Sort: Date Created {pmSortDirection === 'desc' ? '(Newest)' : '(Oldest)'}
            </button>
            <button type="button" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LayoutDashboard className="h-4 w-4" />
              Columns
            </button>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={pmSearchQuery}
                onChange={(e) => setPmSearchQuery(e.target.value)}
                placeholder="Search"
                className="h-10 w-72 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex flex-wrap items-center gap-3 overflow-visible px-6 py-4">
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 text-[15px] font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 text-[15px] font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <MapPin className="h-4 w-4" />
            Location
            <ChevronDown className="h-4 w-4" />
          </button>
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 text-[15px] font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <Flag className="h-4 w-4" />
            Priority
            <ChevronDown className="h-4 w-4" />
          </button>
          <button type="button" className="text-[15px] font-medium text-blue-600 hover:text-blue-700" onClick={() => setPmSearchQuery('')}>Reset Filters</button>
          <button type="button" className="ml-auto text-[15px] font-medium text-gray-700 hover:text-gray-900">Save View</button>
        </div>

        {filteredPmSchedules.length === 0 ? (
          <div className="glass-surface rounded-xl p-12 text-center">
            <div className="text-xl font-bold text-gray-900 mb-2">No Preventive Maintenance</div>
            <p className="text-gray-600">No preventive maintenance items match the current filters.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mx-6 mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-[1280px] w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                  <tr>
                    <th className="px-4 py-4 text-left w-10">
                      <input type="checkbox" className="rounded border-gray-300" disabled />
                    </th>
                    <th className="px-4 py-4 text-left font-bold">Name</th>
                    <th className="px-4 py-4 text-left font-bold">Image</th>
                    <th className="px-4 py-4 text-left font-bold">Assets & Locations</th>
                    <th className="px-4 py-4 text-left font-bold">Assigned To</th>
                    <th className="px-4 py-4 text-left font-bold">Category</th>
                    <th className="px-4 py-4 text-left font-bold">Priority</th>
                    <th className="px-4 py-4 text-left font-bold">Status</th>
                    <th className="px-4 py-4 text-left font-bold">Next Date</th>
                    <th className="px-4 py-4 text-left font-bold">Paused</th>
                    <th className="px-4 py-4 text-left font-bold">Checklist</th>
                    <th className="px-4 py-4 text-left font-bold">Checklist ID</th>
                    <th className="px-4 py-4 text-left font-bold">Action</th>
                    <th className="px-4 py-4 text-left font-bold">Date Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPmSchedules.map((schedule) => {
                    const priority = String(schedule.priority || 'MEDIUM').toUpperCase();
                    const priorityClass = priority === 'HIGH'
                      ? 'bg-rose-50 text-rose-700'
                      : priority === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700'
                        : priority === 'LOW'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-600';
                    const imagePath =
                      schedule.photo ||
                      schedule.image ||
                      (Array.isArray(schedule.attachments?.photos) ? schedule.attachments.photos[0]?.url : '');
                    const imageUrl = imagePath ? getImageUrl(imagePath) : '';
                    const createdAt = schedule.createdAt ? new Date(schedule.createdAt) : null;
                    const locationLabel = getPmPrimaryLocationLabel(schedule);
                    const assetsLabel = getPmPrimaryAssetLabel(schedule);
                    const statusLabel = String(schedule.status || 'Scheduled');
                    const assignedLabel = getPmAssignedLabel(schedule);
                    const pausedLabel = schedule.paused ? 'Yes' : 'No';
                    const checklistLabel = schedule.checklistName || schedule.checklist?.name || '-';
                    const checklistId = schedule.checklistId || schedule.checklist?.id || schedule.checklist?.checklistId || '-';
                    return (
                      <tr key={schedule._id || schedule.id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded border-gray-300" disabled />
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{schedule.name || schedule.title || 'Preventive Item'}</td>
                        <td className="px-4 py-3">
                          {imageUrl ? (
                            <img src={imageUrl} alt={schedule.name || schedule.title || 'PM'} className="w-14 h-12 rounded object-cover border border-gray-200" />
                          ) : (
                            <div className="w-14 h-12 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-gray-300">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="flex items-center justify-between gap-3">
                            <span>{assetsLabel}</span>
                            <ChevronDown className="w-5 h-5 text-gray-700" />
                          </div>
                          <div className="text-xs text-gray-400">{locationLabel}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{assignedLabel}</td>
                        <td className="px-4 py-3 text-gray-700">{schedule.category || schedule.type || 'Preventive'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-lg px-3 py-1 text-sm font-medium ${priorityClass}`}>
                            {priority.charAt(0)}{priority.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <span className={`inline-flex w-fit rounded-lg px-3 py-1 text-sm font-medium ${getPmStatusClass(statusLabel)}`}>
                            {statusLabel.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{formatPmDateTime(schedule.nextDate || schedule.date)}</td>
                        <td className="px-4 py-3 text-gray-700">{pausedLabel}</td>
                        <td className="px-4 py-3 text-blue-600">{checklistLabel}</td>
                        <td className="px-4 py-3 text-gray-700">{checklistId}</td>
                        <td className="px-4 py-3 text-gray-700">
                          <button
                            type="button"
                            onClick={() => setSelectedPmSchedule(schedule)}
                            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Open PM
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {createdAt && !Number.isNaN(createdAt.getTime())
                            ? `${createdAt.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })} - ${createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className={`${activeSection === 'scheduler' ? 'block' : 'hidden'} overflow-visible rounded-[24px] border border-gray-200 bg-white shadow-sm`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
          <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
            PM Schedule View
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
          <div className="text-sm font-semibold text-gray-900">{filteredSchedulerSchedules.length} Results Returned</div>
          <div className="flex items-center gap-4">
            <button type="button" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ArrowUpDown className="h-4 w-4" />
              Sort: Next Date
            </button>
            <button type="button" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LayoutDashboard className="h-4 w-4" />
              Columns
            </button>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={schedulerSearchQuery}
                onChange={(e) => setSchedulerSearchQuery(e.target.value)}
                placeholder="Search"
                className="h-10 w-72 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex flex-wrap items-center gap-3 overflow-visible px-6 py-4">
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 text-[15px] font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 text-[15px] font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <MapPin className="h-4 w-4" />
            Location
            <ChevronDown className="h-4 w-4" />
          </button>
          <button type="button" className="text-[15px] font-medium text-blue-600 hover:text-blue-700" onClick={() => setSchedulerSearchQuery('')}>Reset Filters</button>
          <button type="button" className="ml-auto text-[15px] font-medium text-gray-700 hover:text-gray-900">Save View</button>
        </div>

        {filteredSchedulerSchedules.length === 0 ? (
          <div className="glass-surface rounded-xl p-12 text-center">
            <div className="text-xl font-bold text-gray-900 mb-2">No PM schedules</div>
            <p className="text-gray-600">Upcoming preventive maintenance dates will appear here.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mx-6 mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-[1280px] w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                  <tr>
                    <th className="px-4 py-4 text-left w-10">
                      <input type="checkbox" className="rounded border-gray-300" disabled />
                    </th>
                    <th className="px-4 py-4 text-left font-bold">PM</th>
                    <th className="px-4 py-4 text-left font-bold">Image</th>
                    <th className="px-4 py-4 text-left font-bold">Assets & Locations</th>
                    <th className="px-4 py-4 text-left font-bold">Assigned To</th>
                    <th className="px-4 py-4 text-left font-bold">Next Date</th>
                    <th className="px-4 py-4 text-left font-bold">Status</th>
                    <th className="px-4 py-4 text-left font-bold">Created</th>
                    <th className="px-4 py-4 text-left font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSchedulerSchedules.map((schedule) => {
                    const imagePath =
                      schedule.photo ||
                      schedule.image ||
                      (Array.isArray(schedule.attachments?.photos) ? schedule.attachments.photos[0]?.url : '');
                    const imageUrl = imagePath ? getImageUrl(imagePath) : '';
                    const locationLabel = getPmPrimaryLocationLabel(schedule);
                    const assetsLabel = getPmPrimaryAssetLabel(schedule);
                    const nextDate = schedule.nextDate ? new Date(schedule.nextDate) : null;
                    const createdAt = schedule.createdAt ? new Date(schedule.createdAt) : null;
                    const assignedLabel = getPmAssignedLabel(schedule);
                    return (
                      <tr key={`scheduler-${schedule._id || schedule.id}`} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded border-gray-300" disabled />
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{schedule.name || schedule.title || 'Maintenance schedule'}</td>
                        <td className="px-4 py-3">
                          {imageUrl ? (
                            <img src={imageUrl} alt={schedule.name || schedule.title || 'PM'} className="w-14 h-12 rounded object-cover border border-gray-200" />
                          ) : (
                            <div className="w-14 h-12 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-gray-300">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="flex items-center justify-between gap-3">
                            <span>{assetsLabel}</span>
                            <ChevronDown className="w-5 h-5 text-gray-700" />
                          </div>
                          <div className="text-xs text-gray-400">{locationLabel}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{assignedLabel}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {nextDate && !Number.isNaN(nextDate.getTime())
                            ? `${nextDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })} - ${nextDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Not set'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${getPmStatusClass(schedule.status)}`}>
                            {String(schedule.status || 'Scheduled').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{createdAt && !Number.isNaN(createdAt.getTime()) ? formatPmDateTime(createdAt) : '-'}</td>
                        <td className="px-4 py-3 text-gray-700">
                          <button
                            type="button"
                            onClick={() => setSelectedPmSchedule(schedule)}
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            Open Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className={`${['workOrders', 'materials', 'history'].includes(activeSection) ? 'grid' : 'hidden'} grid-cols-1 gap-8`}>
        {/* Left Side: Work Columns */}
        <div className={`${activeSection === 'workOrders' ? 'block' : 'hidden'} space-y-8`}>
          {/* Active Work Section (If any) */}
          {jobs.filter(j => getJobStatus(j) === 'IN PROGRESS').length > 0 && (
            <div className="rounded-[32px] border border-white/60 bg-white/72 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                {t("technician.activeWork")}
                <span className="px-2 py-0.5 bg-blue-100/70 text-blue-700 text-[10px] font-bold rounded-full">LIVE</span>
              </h2>
              <div className="overflow-x-auto rounded-[28px] border border-slate-100 bg-white/88 shadow-inner mb-4">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <thead className="bg-slate-50/90 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Work Order</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Due</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/60">
                    {jobs.filter(j => getJobStatus(j) === 'IN PROGRESS').map(job => (
                      <tr key={`active-table-${job.id || job._id}`} className="cursor-pointer hover:bg-blue-50/45 transition" onClick={() => handleViewJob(job)}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{job.title}</div>
                          <div className="mt-1 text-xs text-slate-500">{job.priority || 'Normal'} priority</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{job.location || 'No location yet'}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {job.fixDeadline ? new Date(job.fixDeadline).toLocaleString() : 'No due date'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase text-blue-700">
                            In Progress
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleViewJob(job); }}
                              className="rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white hover:bg-blue-700"
                            >
                              {t("technician.viewActions")}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJob(job);
                                setShowAfterForm(prev => ({ ...prev, [job.id || job._id]: true }));
                              }}
                              className="rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white hover:bg-emerald-700"
                            >
                              {t("technician.completeTask")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="hidden space-y-4">
                {jobs.filter(j => getJobStatus(j) === 'IN PROGRESS').map(job => (
                  <div key={`active-${job.id || job._id}`} className="glass-surface border border-white/50 rounded-2xl p-5 hover:shadow-md transition cursor-pointer" onClick={() => handleViewJob(job)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{job.location}</span>
                      {job.fixDeadline && (
                        <span className="text-[10px] font-medium text-slate-400">Due: {new Date(job.fixDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">{job.title}</h3>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewJob(job); }}
                        className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow hover:bg-blue-700 transition"
                      >
                        {t("technician.viewActions")}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                          setShowAfterForm(prev => ({ ...prev, [job.id || job._id]: true }));
                        }}
                        className="w-full py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow hover:bg-emerald-700 transition flex justify-center items-center gap-2"
                      >
                        <span>✓</span> {t("technician.completeTask")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Queue (Assigned Issues) */}
          <div className="rounded-[32px] border border-white/60 bg-white/72 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                {t("technician.myQueue")}
              </h2>
              <span className="text-xs font-bold bg-blue-100/70 text-blue-700 px-3 py-1 rounded-full">
                {jobs.filter(j => getJobStatus(j) !== 'IN PROGRESS' && getJobStatus(j) !== 'COMPLETE' && getJobStatus(j) !== 'COMPLETED').length} TASKS
              </span>
            </div>

            {jobs.filter(j => getJobStatus(j) !== 'IN PROGRESS' && getJobStatus(j) !== 'COMPLETE' && getJobStatus(j) !== 'COMPLETED').length === 0 ? (
              <div className="text-center py-12 bg-white/40 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/60">
                <p className="text-slate-400 font-medium">{t("technician.noPending")}</p>
              </div>
            ) : (
              <><div className="overflow-x-auto rounded-[28px] border border-slate-100 bg-white/88 shadow-inner">
                    <table className="min-w-[760px] w-full text-left text-sm">
                      <thead className="bg-slate-50/90 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Issue</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Priority</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/60">
                        {jobs.filter(j => getJobStatus(j) !== 'IN PROGRESS' && getJobStatus(j) !== 'COMPLETE' && getJobStatus(j) !== 'COMPLETED').map(job => (
                          <tr key={`queue-table-${job.id || job._id}`} className="cursor-pointer hover:bg-blue-50/45 transition" onClick={() => handleViewJob(job)}>
                            <td className="px-4 py-3 font-semibold text-slate-900">{job.title}</td>
                            <td className="px-4 py-3 text-slate-700">{job.location || 'No location yet'}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${job.priority === 'HIGH'
                                  ? 'bg-rose-100 text-rose-700'
                                  : job.priority === 'MEDIUM'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'}`}>
                                {job.priority || 'Normal'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter ${getJobStatus(job) === 'OVERDUE'
                                  ? 'bg-rose-100 text-rose-700'
                                  : getJobStatus(job) === 'PENDING'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-100/70 text-blue-700'}`}>
                                {getJobStatus(job)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                {canAssignIssueToSelf(job) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssignIssueToSelf(job);
                                    }}
                                    className="rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white hover:bg-blue-700"
                                  >
                                    Assign to Me
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openMaterialRequestForJob(job);
                                  }}
                                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
                                >
                                  Request Part
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPmForJob(job);
                                  }}
                                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                                >
                                  Create PM
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewJob(job);
                                  } }
                                  className="rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-white"
                                >
                                  Open Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div><div className="hidden space-y-3">
                      {jobs.filter(j => getJobStatus(j) !== 'IN PROGRESS' && getJobStatus(j) !== 'COMPLETE' && getJobStatus(j) !== 'COMPLETED').map(job => (
                        <div key={job.id || job._id} className="group glass-surface border border-white/50 rounded-2xl p-4 hover:border-blue-200/70 hover:shadow-lg transition-all cursor-pointer" onClick={() => handleViewJob(job)}>
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${job.priority === 'HIGH' ? 'bg-red-500' : 'bg-amber-400'}`}></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.location}</span>
                              </div>
                              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{job.title}</h3>
                            </div>
                            <div className="shrink-0">
                              <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${getJobStatus(job) === 'OVERDUE' ? 'bg-rose-100 text-rose-700' :
                                getJobStatus(job) === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                  'bg-blue-100/70 text-blue-700'}`}>
                                {getJobStatus(job)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div></>
            )}
          </div>
        </div>

        {/* Material Requests & Work History */}
        <div className={`${activeSection === 'materials' || activeSection === 'history' ? 'space-y-8' : 'hidden'}`}>
          {/* Material Requests */}
          <div id="tech-section-materials" className={`${activeSection === 'materials' ? 'block' : 'hidden'} rounded-[32px] border border-white/60 bg-white/72 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl scroll-mt-24`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">{t("technician.materialRequests")}</h2>
              <button
                onClick={() => {
                  setActiveSection('materials');
                  toggleMaterialRequestForm();
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700"
              >
                + {t("technician.newRequest")}
              </button>
            </div>

            {materialRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {t("technician.noMaterials")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-wide text-slate-500">
                    <tr className="border-b border-white/50">
                      <th className="px-3 py-3 w-10">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300" disabled />
                      </th>
                      <th className="px-3 py-3">Title</th>
                      <th className="px-3 py-3">Image</th>
                      <th className="px-3 py-3">Asset</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Work Order</th>
                      <th className="px-3 py-3">Submitted</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Submitted By</th>
                      <th className="px-3 py-3 text-right">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/50">
                    {materialRequests.slice(0, 5).map(req => {
                      const id = req.id || req._id;
                      const status = req.status || (req.approved ? 'APPROVED' : 'PENDING');
                      const priority = req.urgency || req.priority || 'NORMAL';
                      const imagePath = req.photo || req.image || req.beforePhoto || req.afterPhoto || req.file || req.files?.[0];
                      const imageUrl = imagePath ? getImageUrl(imagePath) : '';
                      const asset = req.assetName || req.asset?.name || req.asset || req.items?.[0]?.title || req.items?.[0]?.materialId || '—';
                      const workOrder = req.workOrderId || req.workOrder || req.issueId || req.workOrderNumber || '—';
                      const submittedAt = req.createdAt || req.submittedAt || req.date;
                      const submittedBy = req.submittedBy || req.requestorName || req.userName || req.name || req.email || '—';
                      const category = req.category || req.type || req.submissionType || '—';
                      const statusClass =
                        status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          status === 'REJECTED' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                            status === 'FULFILLED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              'bg-amber-100 text-amber-700 border-amber-200';
                      const priorityClass =
                        priority === 'URGENT' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                          priority === 'HIGH' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                              'bg-blue-100 text-blue-700 border-blue-200';

                      return (
                        <tr key={id} className="hover:bg-white/40 transition-colors align-middle">
                          <td className="px-3 py-3">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300" disabled />
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-slate-800 line-clamp-1" title={req.title || req.items?.[0]?.title || ''}>
                              {req.title || req.items?.[0]?.title || 'Untitled'}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt="Request"
                                className="h-9 w-12 rounded-lg object-cover border border-white/60"
                                onError={e => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="h-9 w-12 rounded-lg border border-white/60 bg-white/60 flex items-center justify-center text-xs text-slate-400">
                                —
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-slate-700">{asset}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-700">{workOrder}</td>
                          <td className="px-3 py-3 text-slate-600">
                            {submittedAt ? (
                              <div>
                                <div className="text-xs font-semibold text-slate-700">
                                  {new Date(submittedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            ) : '—'}
                          </td>
                          <td className="px-3 py-3 text-slate-700">{category}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-white/70 border border-white/60 text-[10px] font-bold text-slate-600 flex items-center justify-center">
                                {String(submittedBy || '—').trim().charAt(0).toUpperCase()}
                              </span>
                              <span className="text-slate-700 text-xs line-clamp-1" title={submittedBy}>{submittedBy}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${priorityClass}`}>
                              {priority}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {materialRequests.length > 5 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => {/* Implement view all */ }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all {materialRequests.length} requests
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Work History */}
          <div id="tech-section-history" className={`${activeSection === 'history' ? 'block' : 'hidden'} rounded-[32px] border border-white/60 bg-white/72 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl scroll-mt-24`}>
            <h2 className="text-2xl font-black text-slate-900 mb-4">{t("technician.recentWorkHistory")}</h2>
            <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/40 mb-4">
              <table className="min-w-[680px] w-full text-left text-sm">
                <thead className="bg-white/70 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Work Order</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Completed</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/60">
                  {jobs
                    .filter(job => getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED')
                    .slice(0, 5)
                    .map(job => (
                      <tr key={`history-table-${job.id || job._id}`} className="cursor-pointer hover:bg-white/50 transition" onClick={() => handleViewJob(job)}>
                        <td className="px-4 py-3 font-semibold text-slate-800">{job.title}</td>
                        <td className="px-4 py-3 text-slate-600">{job.location || 'No location yet'}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {job.completedAt || job.updatedAt ? new Date(job.completedAt || job.updatedAt).toLocaleString() : 'Recently completed'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {jobs.filter(job => getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED').length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No completed jobs yet
                </div>
              )}
            </div>
            <div className="hidden space-y-3">
              {jobs
                .filter(job => getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED')
                .slice(0, 5)
                .map(job => (
                  <div key={job.id || job._id} className="flex items-center justify-between border-b border-white/50 pb-3 last:border-0">
                    <div>
                      <h4 className="font-semibold text-slate-800">{job.title}</h4>
                      <p className="text-sm text-slate-500">{job.location}</p>
                    </div>
                    <span className="text-sm text-emerald-600 font-semibold">Completed</span>
                  </div>
                ))}
              {jobs.filter(job => getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED').length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No completed jobs yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        </main>
      </div>

      {/* Issue Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="glass-surface-strong rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{t("technician.issue.title")}</h2>
                  <p className="text-sm text-slate-500">{t("technician.issue.subtitle")}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-full p-2 text-slate-500 hover:bg-white/70 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-5 flex flex-wrap gap-3 rounded-2xl border border-white/60 bg-white/55 p-4">
                {canAssignIssueToSelf(selectedJob) && (
                  <button
                    onClick={() => handleAssignIssueToSelf(selectedJob)}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-white hover:bg-blue-700"
                  >
                    Assign to Me
                  </button>
                )}
                <button
                  onClick={() => openMaterialRequestForJob(selectedJob)}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-amber-700 hover:bg-amber-100"
                >
                  Request Part
                </button>
                <button
                  onClick={() => openPmForJob(selectedJob)}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-emerald-700 hover:bg-emerald-100"
                >
                  Create PM
                </button>
                {canStartTimerForJob(selectedJob) && (
                  <button
                    onClick={() => handleStartTimer(selectedJob)}
                    disabled={startingTimer}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {startingTimer ? 'Starting...' : 'Start Timer'}
                  </button>
                )}
                {canStopTimerForJob(selectedJob) && (
                  <button
                    onClick={() => setShowCompletionForm((current) => !current)}
                    disabled={startingTimer}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {showCompletionForm ? 'Hide Completion Form' : 'Stop Timer'}
                  </button>
                )}
                {/* <div className="flex items-center text-xs font-semibold text-slate-500">
                  Start makes the work order IN PROGRESS. Stop makes it COMPLETED.
                </div> */}
              </div>

              {showCompletionForm && canStopTimerForJob(selectedJob) && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Complete Work Order</h3>
                    <p className="mt-1 text-sm text-slate-600">Write the completion details and the feedback that should be sent to the requester.</p>
                  </div>
                  <div className="space-y-4">                           
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Completion Details</label>
                      <textarea
                        value={completionForm.details}
                        onChange={(e) => setCompletionForm((prev) => ({ ...prev, details: e.target.value }))}
                        placeholder="Explain what was done to finish this work order..."
                        className="w-full min-h-[110px] rounded-xl border border-emerald-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Requester Feedback</label>
                      <textarea
                        value={completionForm.feedback}
                        onChange={(e) => setCompletionForm((prev) => ({ ...prev, feedback: e.target.value }))}
                        placeholder="Write the feedback message that should be emailed to the requester..."
                        className="w-full min-h-[110px] rounded-xl border border-emerald-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/60"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleStopTimer(selectedJob, completionForm)}
                        disabled={startingTimer}
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {startingTimer ? 'Completing...' : 'Confirm Completion'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCompletionForm(false);
                          setCompletionForm({ details: '', feedback: '' });
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-700">{t("technician.issue.fieldTitle")}</h3>
                  <p className="text-slate-900">{selectedJob.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">{t("technician.issue.fieldDescription")}</h3>
                  <p className="text-slate-900">{selectedJob.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">{t("technician.issue.fieldLocation")}</h3>
                  <p className="text-slate-900">{selectedJob.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-700">Due Date</h3>
                    <p className="text-slate-900">
                      {selectedJob.fixDeadline || selectedJob.dueDate
                        ? new Date(selectedJob.fixDeadline || selectedJob.dueDate).toLocaleString()
                        : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700">Asset</h3>
                    <p className="text-slate-900">{selectedJob.assetName || selectedJob.asset?.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-700">{t("technician.issue.fieldStatus")}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getJobStatus(selectedJob) === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      getJobStatus(selectedJob) === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        (getJobStatus(selectedJob) === 'COMPLETE' || getJobStatus(selectedJob) === 'COMPLETED') ? 'bg-green-100 text-green-700' :
                          getJobStatus(selectedJob) === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100/70 text-blue-700'
                      }`}>
                      {(getJobStatus(selectedJob) === 'COMPLETE' || getJobStatus(selectedJob) === 'COMPLETED') ? 'Complete' : getJobStatus(selectedJob)?.replace('_', ' ') || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700">{t("technician.issue.fieldPriority")}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${selectedJob.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      selectedJob.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      selectedJob.priority === 'LOW' ? 'bg-blue-100/70 text-blue-700' :
                          'bg-blue-100 text-blue-700'
                      }`}>
                      {selectedJob.priority || 'MEDIUM'}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">Frequency</h3>
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100/70 text-blue-700">
                    {selectedJob.frequency || selectedJob.interval || selectedJob?.checklist?.frequency || 'Not set'}
                  </span>
                </div>

                <TechnicianJobMessageActions
                  contacts={selectedJobContacts}
                  activeRecipientId={directMessageRecipientId}
                  onSelectRecipient={openDirectMessageComposer}
                />

                <div className="border-t pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-700">Tasks</h3>
                      <p className="text-xs text-slate-500">Checklist and work order tasks for this job.</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
                      {selectedJobTasks.length} tasks
                    </span>
                  </div>
                  {selectedJobTasks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                      No tasks linked to this work order yet.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Task</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Assignee</th>
                            <th className="px-4 py-3">Due</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedJobTasks.map((task) => (
                            <tr key={task.id}>
                              <td className="px-4 py-3 font-medium text-slate-800">{task.title}</td>
                              <td className="px-4 py-3">{task.status.replace(/_/g, ' ')}</td>
                              <td className="px-4 py-3">{task.assignee || '—'}</td>
                              <td className="px-4 py-3">{task.dueDate ? new Date(task.dueDate).toLocaleString() : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-700">Schedules</h3>
                      <p className="text-xs text-slate-500">Maintenance schedules related to this work order.</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
                      {selectedJobSchedules.length} linked
                    </span>
                  </div>
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Schedule Work Order</label>
                        <input
                          type="datetime-local"
                          value={scheduleAt}
                          onChange={(e) => setScheduleAt(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200/60"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveSchedule}
                        disabled={!scheduleAt || savingSchedule}
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        {savingSchedule ? 'Saving...' : 'Save Schedule'}
                      </button>
                    </div>
                  </div>
                  {selectedJobSchedules.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                      No related schedules found for this work order.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedJobSchedules.map((schedule) => (
                        <div key={schedule._id || schedule.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-900">{schedule.name || schedule.title || 'Maintenance schedule'}</div>
                              <div className="mt-1 text-xs text-slate-500">
                                {(schedule.category || schedule.type || 'Schedule')}
                                {(schedule.frequency || schedule.interval) ? ` • ${schedule.frequency || schedule.interval}` : ''}
                              </div>
                            </div>
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-700">
                              {String(schedule.status || 'Scheduled').replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Next date</div>
                              <div className="text-slate-800">{schedule.nextDate ? new Date(schedule.nextDate).toLocaleString() : 'Not set'}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Asset / Location</div>
                              <div className="text-slate-800">{schedule.asset?.name || schedule.location || selectedJob.location || 'Not set'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Evidence Display */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-slate-700 mb-2">{t("technician.issue.evidence")}</h3>
                  <div className="space-y-3">
                    {getImageUrl(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image) && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-600">{t("technician.issue.beforePhoto")}</h4>
                        <img
                          src={getImageUrl(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image)}
                          alt="Before"
                          className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                          onClick={() => handleImageClick(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image, selectedJob.title)}
                          title="Click to view larger image"
                        />
                      </div>
                    )}
                    {getImageUrl(selectedJob.evidence?.afterImage) && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-600">{t("technician.issue.afterPhoto")}</h4>
                        <img
                          src={getImageUrl(selectedJob.evidence.afterImage)}
                          alt="After"
                          className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                          onClick={() => handleImageClick(selectedJob.evidence.afterImage, `${selectedJob.title} - After`)}
                          title="Click to view larger image"
                        />
                      </div>
                    )}
                    {selectedJob.evidence?.address && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-600">{t("technician.issue.completionDetails")}</h4>
                        <p className="text-sm text-slate-900">{selectedJob.evidence.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Side chat with client/requestor */}
                <div className="border-t pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-700">Comments</h3>
                      <p className="mt-1 text-xs text-slate-500">Shared work-order discussion visible to the people involved.</p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
                      {(selectedJob.chat || []).length} comments
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-1 custom-scrollbar rounded-2xl bg-slate-50/80 p-3">
                    {(selectedJob.chat || []).length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
                        <div className="text-sm font-semibold text-slate-700">No comments yet</div>
                        <div className="mt-1 text-xs text-slate-500">Share progress, ask questions, or tag someone with @.</div>
                      </div>
                    )}
                    {(selectedJob.chat || []).map((m, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <span className="font-semibold text-slate-700">{m.sender || 'User'}{m.role ? ` · ${m.role}` : ''}</span>
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${String(m.sender || m.user || '').trim() === userName ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            {String(m.sender || m.user || 'U').trim().split(' ').map(part => part?.[0] || '').join('').slice(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-semibold text-sm text-slate-800">{m.sender || m.user || 'User'}</span>
                              {m.role && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                  {String(m.role).replace(/_/g, ' ')}
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400">
                                {m.timestamp ? new Date(m.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{m.text}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
                    <div className="mb-3">
                      <div className="text-sm font-bold text-slate-900">Add a public comment</div>
                      <div className="text-xs text-slate-500">This update is shared on the work order thread.</div>
                    </div>
                  <div className="relative">
                    {mentionCandidates.length > 0 && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-20">
                        {mentionCandidates.map((person) => (
                          <button
                            key={person._id || person.id}
                            type="button"
                            onClick={() => insertMention(person)}
                            className="w-full border-b border-slate-100 px-3 py-2 text-left hover:bg-slate-50 last:border-b-0"
                          >
                            <div className="text-sm font-semibold text-slate-900">{person.name}</div>
                            <div className="text-xs text-slate-500">@{buildMentionHandle(person)}{person.email ? ` • ${person.email}` : ''}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-end gap-2 rounded-2xl border border-white bg-white px-3 py-3 ring-1 ring-slate-100">
                    <textarea
                      value={chatInput}
                      onChange={handleChatInputChange}
                      placeholder="Type a message for the client…"
                      className="min-h-[88px] flex-1 resize-none bg-transparent text-sm text-slate-800 focus:outline-none"
                    ></textarea>
                    <button
                      onClick={sendChatMessage}
                      disabled={chatSending || !chatInput.trim()}
                      className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                    >
                      {chatSending ? 'Sending…' : 'Send'}
                    </button>
                    </div>
                  </div>
                </div>
                </div>

                <div className="flex flex-col gap-4 pt-6 border-t mt-6">
                  {/* CONTEXTUAL ACTION BUTTONS INSIDE MODAL */}
                  {canStartTimerForJob(selectedJob) && !showBeforeForm[selectedJob.id || selectedJob._id] && (
                    <button
                      onClick={() => handleStartTimer(selectedJob)}
                      disabled={startingTimer}
                      className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {startingTimer ? 'Starting...' : 'Start Timer'}
                    </button>
                  )}

                  {canStopTimerForJob(selectedJob) && !showAfterForm[selectedJob.id || selectedJob._id] && (
                    <button
                      onClick={() => handleStopTimer(selectedJob)}
                      disabled={startingTimer}
                      className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-md flex items-center justify-center gap-2"
                    >
                      {startingTimer ? 'Stopping...' : 'Stop Timer'}
                    </button>
                  )}

                  {/* FORM RENDERING INSIDE MODAL */}
                  {showBeforeForm[selectedJob.id || selectedJob._id] && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <BeforeEvidenceForm
                        issueId={selectedJob.id || selectedJob._id}
                        onSuccess={() => {
                          handleBeforeSuccess(selectedJob.id || selectedJob._id);
                          setSelectedJob(null);
                        }}
                        hasExistingImage={!!(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image)}
                      />
                      <button onClick={() => handleStartWork(selectedJob.id || selectedJob._id)} className="w-full mt-2 text-sm text-gray-500 hover:underline">{t("common.cancel")}</button>
                    </div>
                  )}

                  {showAfterForm[selectedJob.id || selectedJob._id] && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <AfterEvidenceForm
                        issueId={selectedJob.id || selectedJob._id}
                        onSuccess={() => {
                          handleAfterSuccess(selectedJob.id || selectedJob._id);
                          setSelectedJob(null);
                        }}
                      />
                      <button onClick={() => toggleAfterForm(selectedJob.id || selectedJob._id)} className="w-full mt-2 text-sm text-gray-500 hover:underline">{t("common.cancel")}</button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedJob(null)}
                    className="w-full py-2 bg-white/60 text-slate-700 font-semibold rounded-xl hover:bg-white/80 transition border border-white/50"
                  >
                    {t("common.close")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;


















