import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import api from "../api/axios";

const CHART_COLORS = ['#2563eb', '#0f766e', '#f59e0b', '#7c3aed', '#ef4444', '#14b8a6'];

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} RWF`;

export default function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('90days');
  const [costTypeFilter, setCostTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rawIssues, setRawIssues] = useState([]);
  const [metrics, setMetrics] = useState({
    totalIssues: 0,
    completedIssues: 0,
    completionRate: 0,
    avgResponseHrs: 0,
    avgCycleHrs: 0,
    backlog: 0,
    topTechnician: null,
    topLocations: [],
    upcomingPreventive: [],
    totalAssetCost: 0,
    avgAssetCost: 0,
    materialReqCount: 0,
    assetWithMostDowntime: null,
    utilizationByLocation: [],
    laborCost: 0,
    partsCost: 0,
    otherCost: 0,
    totalCost: 0,
    reactiveCost: 0,
    preventiveCost: 0,
    costByAsset: [],
    costByCategory: [],
    costByLocation: [],
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      try {
        setLoading(true);
        const [issuesRes, assetsRes, techRes, schedulesRes, materialReqRes] = await Promise.all([
          api.get('/api/issues'),
          api.get('/api/assets'),
          api.get('/api/technicians'),
          api.get('/api/maintenance-schedules'),
          api.get('/api/material-requests'),
        ]);

        const issues = Array.isArray(issuesRes?.data) ? issuesRes.data : [];
        const assets = Array.isArray(assetsRes?.data) ? assetsRes.data : [];
        const techs = Array.isArray(techRes?.data) ? techRes.data : [];
        const schedules = Array.isArray(schedulesRes?.data) ? schedulesRes.data : [];
        const materialReqs = Array.isArray(materialReqRes?.data) ? materialReqRes.data : [];

        const totalIssues = issues.length;
        const completedIssues = issues.filter((i) => String(i?.status || '').toLowerCase().includes('complete')).length;
        const completionRate = totalIssues ? (completedIssues / totalIssues) * 100 : 0;

        const techCounts = {};
        issues
          .filter((i) => String(i?.status || '').toLowerCase().includes('complete'))
          .forEach((issue) => {
            const techId = issue.assignedTo || (Array.isArray(issue.assignees) && issue.assignees.length ? issue.assignees[0].id : null);
            if (!techId) return;
            techCounts[techId] = (techCounts[techId] || 0) + 1;
          });

        const topTechId = Object.keys(techCounts).sort((a, b) => techCounts[b] - techCounts[a])[0] || null;
        const topTechnician = topTechId
          ? techs.find((tech) => tech.id === topTechId || tech._id === topTechId) || { id: topTechId, completed: techCounts[topTechId] }
          : null;

        const locationCounts = {};
        issues.forEach((issue) => {
          const location = issue.location || issue.address || issue.propertyId || 'Unknown';
          locationCounts[location] = (locationCounts[location] || 0) + 1;
        });
        const topLocations = Object.entries(locationCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([location, count]) => ({ location, count }));

        const responseTimes = issues
          .filter((issue) => issue.createdAt && issue.updatedAt && !String(issue.status || '').toLowerCase().includes('pending'))
          .map((issue) => (new Date(issue.updatedAt) - new Date(issue.createdAt)) / 3600000);
        const avgResponseHrs = responseTimes.length ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length : 0;

        const cycleTimes = issues
          .filter((issue) => issue.createdAt && issue.updatedAt && String(issue.status || '').toLowerCase().includes('complete'))
          .map((issue) => (new Date(issue.updatedAt) - new Date(issue.createdAt)) / 3600000);
        const avgCycleHrs = cycleTimes.length ? cycleTimes.reduce((sum, value) => sum + value, 0) / cycleTimes.length : 0;

        const backlog = issues.filter((issue) => !issue.status || String(issue.status).toLowerCase().includes('pending')).length;
        const upcomingPreventive = schedules.filter((schedule) => schedule?.nextDate && new Date(schedule.nextDate) > new Date()).slice(0, 10);

        const assetCosts = assets.map((asset) => Number(asset.purchaseCost || 0)).filter((value) => !Number.isNaN(value));
        const totalAssetCost = assetCosts.reduce((sum, value) => sum + value, 0);
        const avgAssetCost = assetCosts.length ? totalAssetCost / assetCosts.length : 0;

        const assetDowntimeMap = {};
        issues.forEach((issue) => {
          if (!issue.assetId) return;
          const fixMinutes = Number(issue.fixTime || issue.time || 0);
          assetDowntimeMap[issue.assetId] = (assetDowntimeMap[issue.assetId] || 0) + (fixMinutes ? fixMinutes / 60 : 0);
        });
        const assetWithMostDowntime = Object.entries(assetDowntimeMap)
          .map(([assetId, hrs]) => ({ assetId, hrs }))
          .sort((a, b) => b.hrs - a.hrs)[0] || null;

        const openAssetIds = new Set(
          issues
            .filter((issue) => !String(issue.status || '').toLowerCase().includes('complete'))
            .map((issue) => issue.assetId)
            .filter(Boolean)
        );

        const assetsByLocation = {};
        assets.forEach((asset) => {
          const location = (asset.location && (asset.location.building || asset.location.room || asset.location.floor)) || asset.propertyId || 'Unknown';
          assetsByLocation[location] = assetsByLocation[location] || { total: 0, free: 0 };
          assetsByLocation[location].total += 1;
          if (!openAssetIds.has(asset.id) && !openAssetIds.has(asset._id)) assetsByLocation[location].free += 1;
        });
        const utilizationByLocation = Object.entries(assetsByLocation).map(([location, value]) => ({
          location,
          utilization: value.total ? Math.round((value.free / value.total) * 100) : 0,
        }));

        const laborCost = assets.reduce((sum, asset) => sum + Number(asset.laborCost || 0), 0);
        const partsCost = assets.reduce((sum, asset) => sum + Number(asset.partsCost || asset.purchaseCost || 0), 0);
        const otherCost = assets.reduce((sum, asset) => sum + Number(asset.otherCost || 0), 0);
        const totalCost = laborCost + partsCost + otherCost;

        const reactiveCost = issues
          .filter((issue) => String(issue.category || '').toLowerCase().includes('reactive'))
          .reduce((sum, issue) => sum + Number(issue.cost || 0), 0);
        const preventiveCost = issues
          .filter((issue) => String(issue.category || '').toLowerCase().includes('preventive'))
          .reduce((sum, issue) => sum + Number(issue.cost || 0), 0);

        const costByAsset = assets
          .map((asset) => ({
            asset: asset.name || asset.id || asset._id || 'Unknown',
            cost: Number(asset.purchaseCost || 0) + Number(asset.laborCost || 0) + Number(asset.partsCost || 0),
          }))
          .sort((a, b) => b.cost - a.cost)
          .slice(0, 5);

        const costByCategory = issues
          .reduce((acc, issue) => {
            const category = issue.category || 'Other';
            const itemCost = Number(issue.cost || 0);
            const existing = acc.find((entry) => entry.category === category);
            if (existing) existing.cost += itemCost;
            else acc.push({ category, cost: itemCost });
            return acc;
          }, [])
          .sort((a, b) => b.cost - a.cost)
          .slice(0, 5);

        const costByLocation = assets
          .reduce((acc, asset) => {
            const location = (asset.location && (asset.location.building || asset.location.room || asset.location.floor)) || asset.propertyId || 'Unknown';
            const itemCost = Number(asset.purchaseCost || 0);
            const existing = acc.find((entry) => entry.location === location);
            if (existing) existing.cost += itemCost;
            else acc.push({ location, cost: itemCost });
            return acc;
          }, [])
          .sort((a, b) => b.cost - a.cost)
          .slice(0, 5);

        if (!mounted) return;

        setRawIssues(issues);
        setMetrics({
          totalIssues,
          completedIssues,
          completionRate: Math.round(completionRate),
          avgResponseHrs: Number(avgResponseHrs.toFixed(2)),
          avgCycleHrs: Number(avgCycleHrs.toFixed(2)),
          backlog,
          topTechnician,
          topLocations,
          upcomingPreventive,
          totalAssetCost,
          avgAssetCost: Number(avgAssetCost.toFixed(2)),
          materialReqCount: materialReqs.length,
          assetWithMostDowntime,
          utilizationByLocation,
          laborCost,
          partsCost,
          otherCost,
          totalCost,
          reactiveCost,
          preventiveCost,
          costByAsset,
          costByCategory,
          costByLocation,
        });
      } catch (error) {
        console.error('[Analytics] failed to fetch metrics', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  const spendTrendData = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    if (dateRange === '7days') startDate.setDate(now.getDate() - 7);
    if (dateRange === '30days') startDate.setDate(now.getDate() - 30);
    if (dateRange === '90days') startDate.setDate(now.getDate() - 90);

    const filtered = rawIssues.filter((issue) => {
      if (!issue?.createdAt || !issue?.cost) return false;
      const issueDate = new Date(issue.createdAt);
      if (dateRange !== 'all' && issueDate < startDate) return false;
      if (costTypeFilter === 'reactive') return String(issue.category || '').toLowerCase().includes('reactive');
      if (costTypeFilter === 'preventive') return String(issue.category || '').toLowerCase().includes('preventive');
      return true;
    });

    const grouped = filtered.reduce((acc, issue) => {
      const issueDate = new Date(issue.createdAt);
      const weekStart = new Date(issueDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const sortKey = weekStart.toISOString().slice(0, 10);
      const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc[sortKey] || { date: label, sortKey, cost: 0 };
      existing.cost += Number(issue.cost || 0);
      acc[sortKey] = existing;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => new Date(a.sortKey) - new Date(b.sortKey));
  }, [rawIssues, dateRange, costTypeFilter]);

  const costCompositionData = useMemo(() => {
    const items = [
      { name: 'Labor', value: metrics.laborCost, color: '#16a34a' },
      { name: 'Parts', value: metrics.partsCost, color: '#2563eb' },
      { name: 'Other', value: metrics.otherCost, color: '#f59e0b' },
    ];
    return categoryFilter === 'all'
      ? items.filter((item) => item.value > 0)
      : items.filter((item) => item.name.toLowerCase() === categoryFilter && item.value > 0);
  }, [categoryFilter, metrics.laborCost, metrics.otherCost, metrics.partsCost]);

  const maintenanceTypeData = useMemo(() => {
    const items = [
      { name: 'Reactive', value: metrics.reactiveCost, color: '#0f766e' },
      { name: 'Preventive', value: metrics.preventiveCost, color: '#7c3aed' },
    ];
    return costTypeFilter === 'all'
      ? items.filter((item) => item.value > 0)
      : items.filter((item) => item.name.toLowerCase() === costTypeFilter && item.value > 0);
  }, [costTypeFilter, metrics.preventiveCost, metrics.reactiveCost]);

  const summaryCards = useMemo(() => {
    const selectedSpend = categoryFilter === 'all'
      ? metrics.totalCost
      : costCompositionData.reduce((sum, item) => sum + item.value, 0);
    const selectedMaintenanceType = costTypeFilter === 'all'
      ? metrics.reactiveCost + metrics.preventiveCost
      : maintenanceTypeData.reduce((sum, item) => sum + item.value, 0);

    return [
      { label: 'Selected Spend', value: selectedSpend, className: 'text-gray-900' },
      { label: 'Maintenance Type Spend', value: selectedMaintenanceType, className: 'text-blue-700' },
      { label: 'Tracked Asset Purchase Cost', value: metrics.totalAssetCost, className: 'text-emerald-700' },
    ];
  }, [categoryFilter, costCompositionData, costTypeFilter, maintenanceTypeData, metrics.preventiveCost, metrics.reactiveCost, metrics.totalAssetCost, metrics.totalCost]);

  const costByAssetChartData = useMemo(
    () => metrics.costByAsset.map((item) => ({ name: item.asset, cost: item.cost })),
    [metrics.costByAsset]
  );
  const costByCategoryChartData = useMemo(
    () => metrics.costByCategory.map((item) => ({ name: item.category, cost: item.cost })),
    [metrics.costByCategory]
  );
  const costByLocationChartData = useMemo(
    () => metrics.costByLocation.map((item) => ({ name: item.location, cost: item.cost })),
    [metrics.costByLocation]
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <nav className="flex items-center justify-between bg-white shadow px-4 md:px-8 h-16">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-600 rounded-xl p-1 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1"/><rect x="6" y="6" width="12" height="6" rx="2" fill="#a5b4fc"/></svg>
          </span>
          <div className="flex flex-col ml-1">
            <span className="text-lg font-bold text-gray-900">PropCare</span>
            <span className="text-sm text-gray-500">Alice Kayitesi</span>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold" onClick={() => navigate('/manager-dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#ede9fe"/><rect x="7" y="7" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="13" y="7" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="7" y="13" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="13" y="13" width="4" height="4" rx="1" fill="#8b5cf6"/></svg> Dashboard
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/manager-issues')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1"/></svg> All Issues
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/analytics')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1"/></svg> Analytics
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/technicians')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1"/></svg> Technicians
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-gray-100 rounded-lg px-2 py-1 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#f3f4f6"/><path d="M8 12h8" stroke="#222" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gray-100 font-semibold" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="px-4 md:px-8 py-6">
        <div className="flex justify-between items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Cost of Maintenance</h1>
            <p className="text-gray-500 mt-1">Company-scoped analytics for your maintenance operations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 mb-8">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
                <span className="text-gray-500 mb-1">Avg Response Time</span>
                <span className="text-3xl font-bold">{loading ? '—' : metrics.avgResponseHrs}</span>
                <span className="text-gray-400 text-sm">hrs (approx)</span>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
                <span className="text-gray-500 mb-1">Total Issues</span>
                <span className="text-3xl font-bold">{loading ? '—' : metrics.totalIssues}</span>
                <span className="text-gray-400 text-sm">issues</span>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
                <span className="text-gray-500 mb-1">Completion Rate</span>
                <span className="text-3xl font-bold">{loading ? '—' : `${metrics.completionRate}%`}</span>
                <span className="text-gray-400 text-sm">{loading ? '' : `${metrics.completedIssues} / ${metrics.totalIssues}`}</span>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
                <span className="text-gray-500 mb-1">Backlog</span>
                <span className="text-3xl font-bold text-red-600">{loading ? '—' : metrics.backlog}</span>
                <span className="text-gray-400 text-sm">pending</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="font-semibold mb-4">Top Locations (by requests)</div>
                <ul className="space-y-2">
                  {(metrics.topLocations || []).length === 0 && <li className="text-sm text-gray-500">No location data</li>}
                  {(metrics.topLocations || []).map((location, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{location.location}</span>
                      <span className="font-semibold">{location.count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="font-semibold mb-4">Top Technician (completed)</div>
                {metrics.topTechnician ? (
                  <div>
                    <div className="text-lg font-bold">{metrics.topTechnician.name || metrics.topTechnician.id}</div>
                    <div className="text-sm text-gray-500">Completed: {metrics.topTechnician.completed || 0}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No technician data</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-fit">
            <div className="py-2">
              <div className="px-4 py-3 text-sm font-medium text-gray-700">Date Range</div>
              {['7days', '30days', '90days', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                    dateRange === range ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : range === '90days' ? 'Last 90 Days' : 'All Time'}
                </button>
              ))}

              <div className="border-t border-gray-200" />
              <div className="px-4 py-3 text-sm font-medium text-gray-700">Cost Type</div>
              {['all', 'reactive', 'preventive'].map((type) => (
                <button
                  key={type}
                  onClick={() => setCostTypeFilter(type)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                    costTypeFilter === type ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type === 'all' ? 'All Cost Types' : type === 'reactive' ? 'Reactive Only' : 'Preventive Only'}
                </button>
              ))}

              <div className="border-t border-gray-200" />
              <div className="px-4 py-3 text-sm font-medium text-gray-700">Category</div>
              {['all', 'labor', 'parts', 'other'].map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                    categoryFilter === category ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold mb-4">Maintenance Cost Overview</div>
            <div className="text-sm text-gray-700">Total asset purchase cost: <span className="font-semibold">{loading ? '—' : formatCurrency(metrics.totalAssetCost)}</span></div>
            <div className="text-sm text-gray-700">Average asset cost: <span className="font-semibold">{loading ? '—' : formatCurrency(metrics.avgAssetCost.toFixed(0))}</span></div>
            <div className="text-sm text-gray-700">Material requests: <span className="font-semibold">{loading ? '—' : metrics.materialReqCount}</span></div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold mb-4">Asset Downtime & Utilization</div>
            <div className="text-sm text-gray-700">Most downtime asset: <span className="font-semibold">{metrics.assetWithMostDowntime ? `${metrics.assetWithMostDowntime.assetId} (${metrics.assetWithMostDowntime.hrs.toFixed(1)} hrs)` : '—'}</span></div>
            <div className="mt-3">
              <div className="text-sm font-semibold mb-2">Utilization by Location</div>
              {(metrics.utilizationByLocation || []).slice(0, 6).map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-1">
                  <span className="truncate">{item.location}</span>
                  <span className="font-semibold">{item.utilization}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="font-semibold mb-4">Upcoming Preventive Work Orders</div>
          {(metrics.upcomingPreventive || []).length === 0 ? (
            <div className="text-sm text-gray-500">No upcoming preventive schedules</div>
          ) : (
            <ul className="space-y-2">
              {metrics.upcomingPreventive.map((schedule, index) => (
                <li key={index} className="flex justify-between">
                  <span className="truncate">{schedule.name || schedule.title || `Schedule ${schedule.id || index}`}</span>
                  <span className="text-sm text-gray-500">{schedule.nextDate ? new Date(schedule.nextDate).toLocaleString() : '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="font-semibold text-lg mb-4">Cost Breakdown Analysis</div>
          <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 mb-6">
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-slate-50 to-white p-5">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-[0.18em]">Chart Summary</div>
              <div className="mt-4 space-y-4">
                {summaryCards.map((item) => (
                  <div key={item.label} className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">{item.label}</div>
                    <div className={`mt-2 text-2xl font-bold ${item.className}`}>{loading ? '—' : formatCurrency(item.value)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="mb-3">
                  <div className="font-semibold text-gray-900">Spend Composition</div>
                  <div className="text-sm text-gray-500">Labor, parts, and other maintenance costs</div>
                </div>
                <div className="h-72">
                  {loading || costCompositionData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">No composition data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={costCompositionData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={4}>
                          {costCompositionData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="mb-3">
                  <div className="font-semibold text-gray-900">Reactive vs Preventive</div>
                  <div className="text-sm text-gray-500">How maintenance cost is split by work type</div>
                </div>
                <div className="h-72">
                  {loading || maintenanceTypeData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">No maintenance type data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={maintenanceTypeData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                          {maintenanceTypeData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="mb-3">
              <div className="font-semibold text-gray-900">Maintenance Spend Trend</div>
              <div className="text-sm text-gray-500">Weekly maintenance costs for the selected date range</div>
            </div>
            <div className="h-80">
              {loading || spendTrendData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">No trend data for this filter</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendTrendData} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                    <defs>
                      <linearGradient id="spendArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="cost" stroke="#2563eb" strokeWidth={3} fill="url(#spendArea)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold mb-4">Cost by Asset (Top 5)</div>
            <div className="h-72">
              {loading || costByAssetChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">No asset cost data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costByAssetChartData} layout="vertical" margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(value) => `${Number(value) / 1000}k`} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" width={88} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="cost" fill={CHART_COLORS[0]} radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold mb-4">Cost by Category (Top 5)</div>
            <div className="h-72">
              {loading || costByCategoryChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">No category cost data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costByCategoryChartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="cost" radius={[10, 10, 0, 0]}>
                      {costByCategoryChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold mb-4">Cost by Location (Top 5)</div>
            <div className="h-72">
              {loading || costByLocationChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">No location cost data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costByLocationChartData} layout="vertical" margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(value) => `${Number(value) / 1000}k`} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" width={88} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="cost" fill={CHART_COLORS[1]} radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
