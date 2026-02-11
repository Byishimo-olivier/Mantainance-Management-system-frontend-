import React, { useState } from 'react';
import Select from 'react-select';
import api from '../api/axios';

export default function ScheduleMaintenanceForm({ onSuccess, technicians = [], assets = [], onClose, initialData = null }) {
  const [form, setForm] = useState({
    email: '',
    name: '',
    employees: [], // array of technician IDs
    company: '',
    phone: '',
    date: '',
    time: '',
    routine: false,
    frequency: 'daily',
    interval: 1,
    assets: [],
    status: 'Pending',
    block: '',
    rooms: '',
    floors: '',
    description: '',
  });

  React.useEffect(() => {
    if (!initialData) return;
    // normalize employees to array
    const employeesArr = Array.isArray(initialData.employees)
      ? initialData.employees
      : typeof initialData.employees === 'string' && initialData.employees.length > 0
        ? initialData.employees.split(',')
        : [];
    setForm(f => ({
      ...f,
      email: initialData.email || '',
      name: initialData.name || '',
      employees: employeesArr,
      company: initialData.company || '',
      phone: initialData.phone || '',
      date: initialData.date ? (initialData.date.split ? initialData.date.split('T')[0] : initialData.date) : '',
      time: initialData.time || '',
      routine: !!initialData.routine,
      frequency: initialData.frequency || 'daily',
      interval: initialData.interval || 1,
      assets: Array.isArray(initialData.assets) ? initialData.assets : (typeof initialData.assets === 'string' && initialData.assets.length > 0 ? initialData.assets.split(',') : []),
      status: initialData.status || 'Pending',
      block: initialData.block || '',
      rooms: initialData.rooms || '',
      floors: initialData.floors || '',
      description: initialData.description || '',
    }));
  }, [initialData]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleEmployeesChange = selected => {
    setForm(f => ({ ...f, employees: selected ? selected.map(opt => opt.value) : [] }));
  };

  const handleAssetsChange = selected => {
    setForm(f => ({ ...f, assets: selected ? selected.map(opt => opt.value) : [] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (initialData && (initialData._id || initialData.id)) {
        await api.put(`/api/maintenance-schedules/${initialData._id || initialData.id}`, {
          ...form,
          employees: form.employees.join(','),
          assets: form.assets.join(','),
        });
      } else {
        await api.post('/api/maintenance-schedules', {
          ...form,
          employees: form.employees.join(','), // send as comma-separated string
          assets: form.assets.join(','),
        });
      }
      setLoading(false);
      setForm({ email: '', name: '', employees: [], company: '', phone: '', date: '', time: '', routine: false, frequency: 'daily', interval: 1, assets: [], status: 'Pending', block: '', rooms: '', floors: '', description: '' });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || err.message || 'Failed to schedule maintenance');
    }
  };

  const technicianOptions = technicians.map(t => ({ value: t.id || t._id, label: t.name }));
  const assetOptions = assets.map(a => ({ value: a.id || a._id, label: a.name }));

  return (
    <form onSubmit={handleSubmit} className="relative shadow p-4 max-w-3xl w-full mx-auto bg-white rounded-lg">
      {onClose && (
        <button type="button" onClick={() => onClose()} aria-label="Close" className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">✕</button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input name="email" type="email" required className="border rounded px-2 py-2 w-full" placeholder="Business email" value={form.email} onChange={handleChange} />
        <input name="name" required className="border rounded px-2 py-2 w-full" placeholder="Name" value={form.name} onChange={handleChange} />

        <Select
          isMulti
          name="employees"
          options={technicianOptions}
          className="w-full md:col-span-2"
          classNamePrefix="select"
          placeholder="Select technicians..."
          onChange={handleEmployeesChange}
          value={technicianOptions.filter(opt => form.employees.includes(opt.value))}
        />

        <Select
          isMulti
          name="assets"
          options={assetOptions}
          className="w-full md:col-span-2"
          classNamePrefix="select"
          placeholder="Select assets (optional)..."
          onChange={handleAssetsChange}
          value={assetOptions.filter(opt => form.assets.includes(opt.value))}
        />

        <input name="company" className="border rounded px-2 py-2 w-full" placeholder="Company (Optional)" value={form.company} onChange={handleChange} />
        <input name="phone" className="border rounded px-2 py-2 w-full" placeholder="Phone (Optional)" value={form.phone} onChange={handleChange} />

        <input name="date" type="date" required className="border rounded px-2 py-2 w-full" value={form.date} onChange={handleChange} />
        <input name="time" type="time" required className="border rounded px-2 py-2 w-full" value={form.time} onChange={handleChange} />

        <div className="flex items-center gap-2">
          <input id="routine" name="routine" type="checkbox" checked={form.routine} onChange={e => setForm(f => ({ ...f, routine: e.target.checked }))} />
          <label htmlFor="routine" className="text-sm">Routine (repeat)</label>
        </div>

        {form.routine && (
          <>
            <select name="frequency" value={form.frequency} onChange={handleChange} className="border rounded px-2 py-2 w-full">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <input name="interval" type="number" min="1" className="border rounded px-2 py-2 w-full" value={form.interval} onChange={e => setForm(f => ({ ...f, interval: parseInt(e.target.value) || 1 }))} />
          </>
        )}

        <input name="block" className="border rounded px-2 py-2 w-full" placeholder="Block (Optional)" value={form.block} onChange={handleChange} />
        <input name="rooms" className="border rounded px-2 py-2 w-full" placeholder="Rooms (Optional)" value={form.rooms} onChange={handleChange} />

        <input name="floors" className="border rounded px-2 py-2 w-full" placeholder="Floors (Optional)" value={form.floors} onChange={handleChange} />

        <textarea name="description" required className="border rounded px-2 py-2 mb-2 w-full md:col-span-2" placeholder="Description of work to be done" value={form.description} onChange={handleChange} />
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}
      <div className="mt-3">
        <button className="bg-blue-900 text-white px-4 py-2 rounded w-full md:w-1/3" type="submit" disabled={loading}>{loading ? (initialData ? 'Updating...' : 'Scheduling...') : (initialData ? 'Update' : 'Continue')}</button>
      </div>
    </form>
  );
}
