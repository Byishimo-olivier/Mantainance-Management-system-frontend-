import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Plus, 
  Edit, 
  MoreHorizontal, 
  Search, 
  Filter, 
  Database, 
  FileText, 
  Box, 
  Clock, 
  X,
  PlusCircle
} from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

const PreventiveMaintenanceDetail = ({ 
  schedule, 
  onBack, 
  onEdit, 
  onAddAsset,
  technicians = [],
  locations = [],
  assets = []
}) => {
  const [activeTab, setActiveTab] = useState('assets');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data for demonstration - in production, this would come from props or API
  const scheduleAssets = schedule?.assets || [
    {
      id: '6835d32b09...',
      schedule: 'Every 1 day',
      asset: '-',
      location: '-',
      meter: '-',
      lastWorkOrder: '03/18/26',
      nextDueDate: '03/19/26'
    },
    {
      id: '6835d32b0a...',
      schedule: 'Every 1 day',
      asset: '-',
      location: '-',
      meter: '-',
      lastWorkOrder: '03/18/26',
      nextDueDate: '03/19/26'
    }
  ];

  const filteredAssets = scheduleAssets.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.asset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'assets', label: 'Assets & Locations' },
    { id: 'details', label: 'Details' },
    { id: 'workOrders', label: 'Work Orders' }
  ];

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{schedule?.name || schedule?.title || 'Preventive Maintenance'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onEdit && onEdit(schedule)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 bg-white shadow-sm transition-all"
          >
            Edit Details
          </button>
          <button 
            onClick={() => onAddAsset && onAddAsset(schedule)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add Asset
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 border-b border-gray-100 bg-white shadow-sm">
        <div className="flex gap-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id 
                ? 'text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
        {activeTab === 'assets' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
            {/* Filters Bar */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  <Filter className="w-3.5 h-3.5" />
                  Filters
                </button>
                <div className="relative">
                  <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors group">
                    Location
                    <ChevronLeft className="w-3 h-3 rotate-270 group-hover:text-blue-600" />
                  </button>
                </div>
                <div className="relative">
                  <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors group">
                    <Filter className="w-3.5 h-3.5" />
                    Assigned To
                    <ChevronLeft className="w-3 h-3 rotate-270 group-hover:text-blue-600" />
                  </button>
                </div>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors ml-2"
                >
                  Reset Filters
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors">
                  <Database className="w-3.5 h-3.5" />
                  Columns
                </button>
                <button className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
                  Save View
                </button>
              </div>
            </div>

            {/* Assets Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="py-3 px-4 w-10">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </th>
                    <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Schedule</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Asset</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Meter</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Last Work Order</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Next Due Date</th>
                    <th className="py-3 px-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAssets.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-3 px-4">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-gray-700">{item.schedule}</td>
                      <td className="py-3 px-4 text-xs font-medium text-gray-400">{item.asset}</td>
                      <td className="py-3 px-4 text-xs font-medium text-gray-400">{item.location}</td>
                      <td className="py-3 px-4 text-xs font-mono text-gray-500">{item.id}</td>
                      <td className="py-3 px-4 text-xs font-medium text-gray-400">{item.meter}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer transition-colors">
                          <FileText className="w-3.5 h-3.5" />
                          {item.lastWorkOrder}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-gray-700">{item.nextDueDate}</td>
                      <td className="py-3 px-4">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-50 bg-gray-50/30">
              <p className="text-[11px] text-gray-400 font-medium italic">Showing {filteredAssets.length} assets assigned to this schedule</p>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-3xl space-y-8">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Core Information</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Schedule Name</label>
                    <p className="text-sm font-semibold text-gray-900">{schedule?.name || 'WWTP Daily Preventive Maintenance'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Category</label>
                    <p className="text-sm font-semibold text-gray-900">{schedule?.category || 'Preventive Maintenance'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Frequency & Scheduling</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Frequency</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-bold text-gray-900">Every 1 day</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Next Occurrence</label>
                    <p className="text-sm font-semibold text-gray-900">March 19, 2026</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Work Order Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Default Title</label>
                    <p className="text-sm font-semibold text-gray-900">{schedule?.title || 'Daily Maintenance Inspection'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Default Description</label>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Periodic inspection of WWTP assets to ensure operational efficiency and safety compliance. Check for leaks, vibration, and abnormal noise.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workOrders' && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col items-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">History & Work Orders</h3>
              <p className="text-gray-500 text-sm mb-6">Track all work orders generated from this preventive maintenance schedule.</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
                View Generated Work Orders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreventiveMaintenanceDetail;
