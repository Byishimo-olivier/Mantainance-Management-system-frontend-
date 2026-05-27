import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertCircle,
  DownloadCloud,
  Edit,
  FileText,
  Gauge,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import api from '../api/axios';

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be123c'];
const EMPTY_METER = {
  name: '',
  type: 'Electricity',
  unit: 'kWh',
  location: '',
  threshold: '',
  status: 'active',
};

const unitByType = {
  Electricity: 'kWh',
  Water: 'm3',
  Gas: 'm3',
  Fuel: 'L',
  Solar: 'kWh',
};

const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getMeterId = (meter) => meter?.id || meter?._id;

const formatDateLabel = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const normalizeReadings = (meter) => {
  const history = Array.isArray(meter?.readings) ? meter.readings : [];
  const normalized = history
    .map((entry, index) => {
      const recordedAt = entry.recordedAt || entry.createdAt || entry.date || meter?.lastReadingAt || meter?.updatedAt || meter?.createdAt;
      const reading = safeNumber(entry.reading ?? entry.value ?? entry.currentReading, 0);
      return {
        id: entry.id || entry._id || `reading-${index}`,
        date: formatDateLabel(recordedAt),
        fullDate: recordedAt || new Date().toISOString(),
        reading,
        consumed: safeNumber(entry.consumed ?? entry.consumption, 0),
        efficiency: safeNumber(entry.efficiency, 0),
        note: entry.note || '',
      };
    })
    .sort((a, b) => new Date(a.fullDate || 0) - new Date(b.fullDate || 0));

  if (normalized.length === 0 && meter) {
    const reading = safeNumber(meter.currentReading ?? meter.reading, 0);
    return [{
      id: 'current-reading',
      date: formatDateLabel(meter.lastReadingAt || meter.updatedAt || meter.createdAt),
      fullDate: meter.lastReadingAt || meter.updatedAt || meter.createdAt || new Date().toISOString(),
      reading,
      consumed: 0,
      efficiency: 100,
      note: 'Current reading',
    }];
  }

  return normalized.map((entry, index, rows) => {
    const previous = rows[index - 1];
    const consumed = entry.consumed || (previous ? Math.max(0, entry.reading - previous.reading) : 0);
    const efficiency = entry.efficiency || Math.max(0, Math.min(100, Math.round(100 - consumed / Math.max(entry.reading, 1) * 100)));
    return { ...entry, consumed, efficiency };
  });
};

export default function MeterDashboard({ companyName, currentUser }) {
  const [meters, setMeters] = useState([]);
  const [selectedMeterId, setSelectedMeterId] = useState('');
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [meterReadings, setMeterReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showMeterModal, setShowMeterModal] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [editingMeter, setEditingMeter] = useState(null);
  const [meterForm, setMeterForm] = useState(EMPTY_METER);
  const [readingForm, setReadingForm] = useState({
    reading: '',
    recordedAt: new Date().toISOString().slice(0, 10),
    note: '',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [chartType, setChartType] = useState('area');
  const [meterDetailTab, setMeterDetailTab] = useState('details');
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadMeter = useCallback(async (meterId) => {
    if (!meterId) return;
    const response = await api.get(`/api/meters/${meterId}`);
    const meter = response.data || null;
    setSelectedMeter(meter);
    setMeterReadings(normalizeReadings(meter));
    setLastUpdated(new Date());
  }, []);

  const fetchMeters = useCallback(async ({ preserveSelection = true } = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/meters');
      const metersData = Array.isArray(response.data) ? response.data : [];
      setMeters(metersData);

      const existingId = preserveSelection ? selectedMeterId : '';
      const nextSelection = existingId && metersData.some((meter) => String(getMeterId(meter)) === String(existingId))
        ? existingId
        : getMeterId(metersData[0]) || '';
      setSelectedMeterId(nextSelection);
      if (nextSelection) {
        await loadMeter(nextSelection);
      } else {
        setSelectedMeter(null);
        setMeterReadings([]);
      }
    } catch (err) {
      console.error('Failed to fetch meters:', err);
      setError('Could not load meters. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [loadMeter, selectedMeterId]);

  useEffect(() => {
    fetchMeters({ preserveSelection: false });
  }, []);

  useEffect(() => {
    if (!selectedMeterId) return;
    loadMeter(selectedMeterId).catch((err) => {
      console.error('Failed to load selected meter:', err);
      setError('Could not load the selected meter.');
    });
  }, [loadMeter, selectedMeterId]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const interval = window.setInterval(() => {
      fetchMeters({ preserveSelection: true });
    }, refreshInterval);
    return () => window.clearInterval(interval);
  }, [autoRefresh, fetchMeters, refreshInterval]);

  const meterTypes = useMemo(() => {
    const dynamicTypes = meters.map((meter) => meter.type || meter.category).filter(Boolean);
    return ['All', ...Array.from(new Set(dynamicTypes))];
  }, [meters]);

  const filteredMeters = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return meters.filter((meter) => {
      const matchesSearch = !query || `${meter.name || ''} ${meter.type || ''} ${meter.category || ''} ${meter.location || ''}`.toLowerCase().includes(query);
      const matchesType = typeFilter === 'All' || String(meter.type || meter.category || '') === String(typeFilter);
      return matchesSearch && matchesType;
    });
  }, [meters, searchTerm, typeFilter]);

  const totalConsumption = useMemo(() => meterReadings.reduce((total, row) => total + safeNumber(row.consumed, 0), 0), [meterReadings]);
  const averageDaily = useMemo(() => meterReadings.length ? totalConsumption / meterReadings.length : 0, [meterReadings.length, totalConsumption]);
  const currentReading = meterReadings.length ? meterReadings[meterReadings.length - 1].reading : safeNumber(selectedMeter?.reading ?? selectedMeter?.currentReading, 0);
  const threshold = safeNumber(selectedMeter?.threshold ?? selectedMeter?.monthlyTarget, 0);
  const isOverThreshold = threshold > 0 && currentReading >= threshold;

  const monthlyData = useMemo(() => {
    const buckets = new Map();
    meterReadings.forEach((row) => {
      const date = new Date(row.fullDate || 0);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      buckets.set(key, safeNumber(buckets.get(key), 0) + safeNumber(row.consumed, 0));
    });
    return Array.from(buckets.entries()).map(([month, total]) => ({ month, total }));
  }, [meterReadings]);

  const comparisonData = useMemo(() => {
    return filteredMeters.map((meter) => {
      const readings = normalizeReadings(meter);
      const usage = readings.reduce((total, row) => total + safeNumber(row.consumed, 0), 0);
      return { name: meter.name || 'Meter', usage, unit: meter.unit || '' };
    });
  }, [filteredMeters]);

  const openCreateMeter = () => {
    setEditingMeter(null);
    setMeterForm(EMPTY_METER);
    setShowMeterModal(true);
  };

  const openEditMeter = () => {
    if (!selectedMeter) return;
    setEditingMeter(selectedMeter);
    setMeterForm({
      name: selectedMeter.name || '',
      type: selectedMeter.type || selectedMeter.category || 'Electricity',
      unit: selectedMeter.unit || 'kWh',
      location: selectedMeter.location || '',
      threshold: selectedMeter.threshold ?? selectedMeter.monthlyTarget ?? '',
      status: selectedMeter.status || 'active',
    });
    setShowMeterModal(true);
  };

  const saveMeter = async () => {
    if (!meterForm.name.trim()) {
      alert('Meter name is required');
      return;
    }

    const payload = {
      ...(editingMeter || {}),
      ...meterForm,
      companyName: companyName || editingMeter?.companyName || currentUser?.companyName || '',
      threshold: meterForm.threshold === '' ? '' : safeNumber(meterForm.threshold, 0),
      currentReading: safeNumber(editingMeter?.currentReading ?? editingMeter?.reading, 0),
      reading: safeNumber(editingMeter?.reading ?? editingMeter?.currentReading, 0),
    };

    try {
      setSaving(true);
      const response = editingMeter
        ? await api.put(`/api/meters/${getMeterId(editingMeter)}`, payload)
        : await api.post('/api/meters', payload);
      const saved = response.data || payload;
      setShowMeterModal(false);
      setMeters((prev) => {
        if (!editingMeter) return [saved, ...prev];
        return prev.map((meter) => String(getMeterId(meter)) === String(getMeterId(saved)) ? saved : meter);
      });
      setSelectedMeterId(getMeterId(saved));
      setSelectedMeter(saved);
      setMeterReadings(normalizeReadings(saved));
    } catch (err) {
      console.error('Failed to save meter:', err);
      alert('Failed to save meter');
    } finally {
      setSaving(false);
    }
  };

  const deleteMeter = async () => {
    if (!selectedMeter) return;
    if (!window.confirm(`Delete ${selectedMeter.name || 'this meter'}?`)) return;
    try {
      await api.delete(`/api/meters/${getMeterId(selectedMeter)}`);
      const remaining = meters.filter((meter) => String(getMeterId(meter)) !== String(getMeterId(selectedMeter)));
      setMeters(remaining);
      const nextMeter = remaining[0] || null;
      setSelectedMeterId(getMeterId(nextMeter) || '');
      setSelectedMeter(nextMeter);
      setMeterReadings(normalizeReadings(nextMeter));
    } catch (err) {
      console.error('Failed to delete meter:', err);
      alert('Failed to delete meter');
    }
  };

  const saveReading = async () => {
    if (!selectedMeter) return;
    const readingValue = safeNumber(readingForm.reading, NaN);
    if (!Number.isFinite(readingValue)) {
      alert('Enter a valid reading value');
      return;
    }

    try {
      setSaving(true);
      const response = await api.post(`/api/meters/${getMeterId(selectedMeter)}/readings`, {
        reading: readingValue,
        recordedAt: readingForm.recordedAt ? new Date(`${readingForm.recordedAt}T12:00:00`).toISOString() : new Date().toISOString(),
        note: readingForm.note,
      });
      const updated = response.data || null;
      setSelectedMeter(updated);
      setMeters((prev) => prev.map((meter) => String(getMeterId(meter)) === String(getMeterId(updated)) ? updated : meter));
      setMeterReadings(normalizeReadings(updated));
      setReadingForm({ reading: '', recordedAt: new Date().toISOString().slice(0, 10), note: '' });
      setShowReadingModal(false);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to add reading:', err);
      alert('Failed to add meter reading');
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    if (!selectedMeter || meterReadings.length === 0) {
      alert('No data to export');
      return;
    }
    const rows = [
      ['Date', 'Reading', 'Consumed', 'Efficiency', 'Note'],
      ...meterReadings.map((row) => [
        row.fullDate,
        row.reading,
        row.consumed,
        `${row.efficiency}%`,
        `"${String(row.note || '').replace(/"/g, '""')}"`,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${String(selectedMeter.name || 'meter').replace(/\s+/g, '-').toLowerCase()}-readings.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const exportToPDF = () => {
    if (!selectedMeter || meterReadings.length === 0) {
      alert('No data to export');
      return;
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 48;

    doc.setFontSize(20);
    doc.text('Meter Report', 40, y);
    doc.setFontSize(10);
    doc.text(`Generated ${new Date().toLocaleString()}`, pageWidth - 40, y, { align: 'right' });

    y += 34;
    doc.setFontSize(12);
    [
      `Meter: ${selectedMeter.name || 'Untitled meter'}`,
      `Type: ${selectedMeter.type || selectedMeter.category || 'Meter'} (${selectedMeter.unit || 'units'})`,
      `Location: ${selectedMeter.location || 'Unassigned'}`,
      `Current Reading: ${currentReading.toLocaleString()} ${selectedMeter.unit || ''}`,
      `Total Consumption: ${totalConsumption.toLocaleString()} ${selectedMeter.unit || ''}`,
      `Average Daily: ${averageDaily.toFixed(2)} ${selectedMeter.unit || ''}`,
    ].forEach((line) => {
      doc.text(line, 40, y);
      y += 18;
    });

    y += 16;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Recent Readings', 40, y);
    doc.setFont(undefined, 'normal');
    y += 18;

    const columns = [40, 180, 290, 400];
    doc.setFontSize(9);
    doc.setFillColor(37, 99, 235);
    doc.setTextColor(255, 255, 255);
    doc.rect(40, y - 12, pageWidth - 80, 22, 'F');
    ['Date', 'Reading', 'Consumed', 'Efficiency'].forEach((heading, index) => doc.text(heading, columns[index], y));
    doc.setTextColor(31, 41, 55);
    y += 24;

    meterReadings.slice(-24).reverse().forEach((row) => {
      if (y > 760) {
        doc.addPage();
        y = 48;
      }
      doc.text(formatDateLabel(row.fullDate), columns[0], y);
      doc.text(String(row.reading), columns[1], y);
      doc.text(String(row.consumed), columns[2], y);
      doc.text(`${row.efficiency}%`, columns[3], y);
      y += 18;
    });

    doc.save(`${String(selectedMeter.name || 'meter').replace(/\s+/g, '-').toLowerCase()}-report.pdf`);
  };

  return (
    <div className="-m-6 min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <Gauge className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meter Management</h1>
              <p className="text-sm text-gray-600">Live readings, reports, and consumption trends</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fetchMeters({ preserveSelection: true })}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreateMeter}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Meter
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(event) => setAutoRefresh(event.target.checked)}
                className="h-4 w-4 rounded"
              />
              Auto-refresh
            </label>
            <select
              value={refreshInterval}
              onChange={(event) => setRefreshInterval(Number(event.target.value))}
              disabled={!autoRefresh}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value={10000}>Every 10s</option>
              <option value={30000}>Every 30s</option>
              <option value={60000}>Every 1m</option>
              <option value={300000}>Every 5m</option>
            </select>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <span className={`h-2.5 w-2.5 rounded-full ${autoRefresh ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            {autoRefresh ? 'Live polling enabled' : 'Manual refresh'}
            {lastUpdated && <span className="text-gray-400">Updated {lastUpdated.toLocaleTimeString()}</span>}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Meters ({filteredMeters.length})</h2>
                {loading && <Activity className="h-4 w-4 animate-pulse text-blue-600" />}
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meters"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              >
                {meterTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="max-h-[620px] overflow-y-auto">
              {filteredMeters.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">No meters found</div>
              ) : (
                filteredMeters.map((meter) => {
                  const meterId = getMeterId(meter);
                  const isSelected = String(selectedMeterId) === String(meterId);
                  const latest = normalizeReadings(meter).slice(-1)[0];
                  return (
                    <button
                      key={meterId}
                      type="button"
                      onClick={() => setSelectedMeterId(meterId)}
                      className={`block w-full border-b border-gray-100 p-4 text-left transition ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{meter.name || 'Untitled meter'}</div>
                          <div className="mt-1 text-xs text-gray-500">{meter.type || meter.category || 'Meter'} · {meter.location || 'No location'}</div>
                        </div>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">{meter.unit || 'unit'}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                        <span>{latest ? `${latest.reading.toLocaleString()} ${meter.unit || ''}` : 'No readings'}</span>
                        <span className={meter.status === 'inactive' ? 'text-red-600' : 'text-emerald-600'}>{meter.status || 'active'}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <main className="space-y-6">
            {selectedMeter ? (
              <>
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedMeter.name || 'Meter Details'}</h2>
                      <p className="mt-1 text-sm text-gray-600">
                        {selectedMeter.location || 'No location'} · {selectedMeter.type || selectedMeter.category || 'Meter'} · {selectedMeter.unit || 'units'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setShowReadingModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        Add Reading
                      </button>
                      <button type="button" onClick={exportToCSV} className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-200">
                        <FileText className="h-4 w-4" />
                        CSV
                      </button>
                      <button type="button" onClick={exportToPDF} className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200">
                        <DownloadCloud className="h-4 w-4" />
                        PDF
                      </button>
                      <button type="button" onClick={openEditMeter} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100" aria-label="Edit meter">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button type="button" onClick={deleteMeter} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete meter">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <div className="text-xs font-semibold uppercase text-blue-700">Current Reading</div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">{currentReading.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">{selectedMeter.unit || 'units'}</div>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                      <div className="text-xs font-semibold uppercase text-emerald-700">Total Consumption</div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">{totalConsumption.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">selected period</div>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                      <div className="text-xs font-semibold uppercase text-amber-700">Average Daily</div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">{averageDaily.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">{selectedMeter.unit || 'units'}</div>
                    </div>
                  </div>

                  {threshold > 0 && (
                    <div className={`mt-4 flex items-center gap-3 rounded-lg border p-3 ${isOverThreshold ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                      <AlertCircle className={`h-5 w-5 ${isOverThreshold ? 'text-red-600' : 'text-yellow-600'}`} />
                      <div className="text-sm text-gray-800">
                        <span className="font-semibold">Threshold:</span> {threshold.toLocaleString()} {selectedMeter.unit || ''}
                        {isOverThreshold && <span className="ml-2 font-semibold text-red-700">Current reading is over the threshold.</span>}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex w-fit rounded-lg border border-gray-200 bg-gray-50 p-1">
                    {[
                      ['details', 'Details'],
                      ['history', 'History'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMeterDetailTab(value)}
                        className={`rounded-md px-4 py-2 text-sm font-semibold transition ${meterDetailTab === value ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </section>

                {meterDetailTab === 'history' && (
                  <>
                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-bold text-gray-900">Charts</h3>
                        <div className="flex flex-wrap gap-2">
                          {[
                            ['area', 'Area'],
                            ['line', 'Line'],
                            ['bar', 'Daily'],
                            ['pie', 'Breakdown'],
                            ['compare', 'Compare'],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setChartType(value)}
                              className={`rounded-lg px-3 py-2 text-sm font-semibold ${chartType === value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <ResponsiveContainer width="100%" height={360}>
                        {chartType === 'area' ? (
                          <AreaChart data={meterReadings}>
                            <defs>
                              <linearGradient id="readingGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="reading" stroke="#2563eb" fill="url(#readingGradient)" />
                          </AreaChart>
                        ) : chartType === 'line' ? (
                          <LineChart data={meterReadings}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="reading" stroke="#2563eb" dot={false} />
                            <Line type="monotone" dataKey="consumed" stroke="#059669" dot={false} />
                          </LineChart>
                        ) : chartType === 'bar' ? (
                          <BarChart data={meterReadings}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="consumed" fill="#059669" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        ) : chartType === 'pie' ? (
                          <PieChart>
                            <Pie
                              data={meterReadings.slice(-7).map((row) => ({ name: row.date, value: row.consumed }))}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              label
                            >
                              {meterReadings.slice(-7).map((row, index) => <Cell key={row.id || index} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        ) : (
                          <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="usage" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </section>

                    <div className="grid gap-6 xl:grid-cols-2">
                      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-gray-900">Monthly Consumption</h3>
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="total" fill="#0891b2" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </section>

                      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-gray-900">Recent Readings</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Reading</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Consumed</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Efficiency</th>
                              </tr>
                            </thead>
                            <tbody>
                              {meterReadings.slice(-10).reverse().map((reading) => (
                                <tr key={reading.id} className="border-b border-gray-100 last:border-b-0">
                                  <td className="px-4 py-3 text-gray-900">{reading.date}</td>
                                  <td className="px-4 py-3 font-semibold text-gray-900">{reading.reading.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-gray-600">{reading.consumed.toLocaleString()} {selectedMeter.unit || ''}</td>
                                  <td className="px-4 py-3">
                                    <span className={`rounded px-2 py-1 text-xs font-semibold ${reading.efficiency >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {reading.efficiency}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <Gauge className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="font-semibold text-gray-700">No meter selected</p>
                <p className="mt-1 text-sm text-gray-500">Create or select a meter to view live readings and reports.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {showMeterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingMeter ? 'Edit Meter' : 'Add Meter'}</h3>
              <button type="button" onClick={() => setShowMeterModal(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Meter Name</span>
                <input value={meterForm.name} onChange={(event) => setMeterForm((prev) => ({ ...prev, name: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Type</span>
                  <select
                    value={meterForm.type}
                    onChange={(event) => {
                      const type = event.target.value;
                      setMeterForm((prev) => ({ ...prev, type, unit: unitByType[type] || prev.unit }));
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    {['Electricity', 'Water', 'Gas', 'Fuel', 'Solar', 'Utility', 'Submeter'].map((type) => <option key={type}>{type}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Unit</span>
                  <input value={meterForm.unit} onChange={(event) => setMeterForm((prev) => ({ ...prev, unit: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Location</span>
                <input value={meterForm.location} onChange={(event) => setMeterForm((prev) => ({ ...prev, location: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Threshold</span>
                  <input type="number" value={meterForm.threshold} onChange={(event) => setMeterForm((prev) => ({ ...prev, threshold: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Status</span>
                  <select value={meterForm.status} onChange={(event) => setMeterForm((prev) => ({ ...prev, status: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowMeterModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={saveMeter} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Meter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add Reading</h3>
              <button type="button" onClick={() => setShowReadingModal(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Reading ({selectedMeter?.unit || 'units'})</span>
                <input type="number" value={readingForm.reading} onChange={(event) => setReadingForm((prev) => ({ ...prev, reading: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Recorded At</span>
                <input type="date" value={readingForm.recordedAt} onChange={(event) => setReadingForm((prev) => ({ ...prev, recordedAt: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Note</span>
                <textarea rows={3} value={readingForm.note} onChange={(event) => setReadingForm((prev) => ({ ...prev, note: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowReadingModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={saveReading} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Add Reading'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
