import React, { useState, useEffect } from 'react';
import { Clock, Bell, Zap, AlertCircle, CheckCircle, X, Loader } from 'lucide-react';
import api from '../api/axios';

/**
 * Daily Report Settings Component
 * Allows users to configure daily report delivery time and recipients
 */
const DailyReportSettings = ({ companyName, onSave }) => {
  const [settings, setSettings] = useState({
    sendTime: '07:00',
    timeZone: 'Africa/Kigali',
    recipients: {
      admins: true,
      technicians: true,
      clients: true,
    },
    reportContent: {
      openIssues: true,
      completedIssues: true,
      maintenanceSchedule: true,
      workOrders: true,
      assets: true,
      techniciansStatus: true,
    },
    enabled: true,
    includeWeekendReports: false,
    emailFormat: 'html',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [sendingTest, setSendingTest] = useState(false);

  // Fetch current settings
  useEffect(() => {
    fetchSettings();
  }, [companyName]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/daily-reports/settings/${companyName}`);
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use defaults if not found
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await api.put(`/api/daily-reports/settings/${companyName}`, settings);
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Daily report settings saved successfully!',
        });
        onSave && onSave(settings);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error saving settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    setMessage(null);
    try {
      const response = await api.post(`/api/daily-reports/test/${companyName}`);
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `Test report sent to ${response.data.data.sent} recipient(s)`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error sending test report',
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleToggle = async (field) => {
    const newValue = !settings[field];
    const newSettings = { ...settings, [field]: newValue };
    setSettings(newSettings);

    try {
      await api.put(`/api/daily-reports/settings/${companyName}`, newSettings);
      setMessage({
        type: 'success',
        text: `Daily reports ${newValue ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error updating setting',
      });
      // Revert on error
      setSettings(settings);
    }
  };

  const handleTimeChange = (e) => {
    setSettings({ ...settings, sendTime: e.target.value });
  };

  const handleRecipientChange = (role) => {
    setSettings({
      ...settings,
      recipients: {
        ...settings.recipients,
        [role]: !settings.recipients[role],
      },
    });
  };

  const handleContentChange = (section) => {
    setSettings({
      ...settings,
      reportContent: {
        ...settings.reportContent,
        [section]: !settings.reportContent[section],
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Daily Reports Configuration</h2>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Enable/Disable Toggle */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Daily Reports</h3>
          <p className="text-sm text-gray-600">Enable automated daily reports</p>
        </div>
        <button
          onClick={() => handleToggle('enabled')}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            settings.enabled ? 'bg-green-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              settings.enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Send Time Configuration */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          <Clock className="w-4 h-4 inline mr-2" />
          Report Send Time
        </label>
        <div className="flex items-center gap-4">
          <input
            type="time"
            value={settings.sendTime}
            onChange={handleTimeChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={!settings.enabled}
          />
          <p className="text-sm text-gray-600">
            Reports will be sent daily at <strong>{settings.sendTime}</strong> in your configured timezone
          </p>
        </div>
      </div>

      {/* Recipients Configuration */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          <Users className="w-4 h-4 inline mr-2" />
          Report Recipients
        </h3>
        <div className="space-y-2">
          {[
            { key: 'admins', label: 'Administrators', icon: '👨‍💼' },
            { key: 'technicians', label: 'Technicians', icon: '🔧' },
            { key: 'clients', label: 'Clients', icon: '👤' },
          ].map(({ key, label, icon }) => (
            <label key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={settings.recipients[key]}
                onChange={() => handleRecipientChange(key)}
                disabled={!settings.enabled}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-900">
                {icon} {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Report Content Configuration */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          <Zap className="w-4 h-4 inline mr-2" />
          Report Content
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { key: 'openIssues', label: 'Open Issues' },
            { key: 'completedIssues', label: 'Completed Issues' },
            { key: 'maintenanceSchedule', label: 'Maintenance Schedule' },
            { key: 'workOrders', label: 'Work Orders' },
            { key: 'assets', label: 'Assets Status' },
            { key: 'techniciansStatus', label: 'Technicians Status' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
              <input
                type="checkbox"
                checked={settings.reportContent[key]}
                onChange={() => handleContentChange(key)}
                disabled={!settings.enabled}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Weekend Reports */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.includeWeekendReports}
            onChange={() =>
              setSettings({
                ...settings,
                includeWeekendReports: !settings.includeWeekendReports,
              })
            }
            disabled={!settings.enabled}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700">Include weekend reports</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={handleSendTest}
          disabled={!settings.enabled || sendingTest || saving}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {sendingTest && <Loader className="w-4 h-4 animate-spin" />}
          Send Test Report
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <Loader className="w-4 h-4 animate-spin" />}
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default DailyReportSettings;
